package com.example.FarmXChain;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private BlockchainService blockchainService;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @PostMapping("/buy/{cropId}")
    public ResponseEntity<?> placeOrder(@PathVariable Long cropId, Authentication authentication) {
        String email = authentication.getName();
        User buyer = userRepository.findByEmail(email).orElse(null);
        Crop crop = cropRepository.findById(cropId).orElse(null);

        if (buyer == null || crop == null) {
            return ResponseEntity.badRequest().body("Buyer or Crop not found");
        }

        // Only Distributor and Retailer can place orders
        if (buyer.getRole() != Role.DISTRIBUTOR && buyer.getRole() != Role.RETAILER) {
            return ResponseEntity.status(403).body("Only Distributors and Retailers can place orders");
        }

        // Orders can be placed only for crops with status = AVAILABLE
        if (crop.getStatus() != null && !"AVAILABLE".equalsIgnoreCase(crop.getStatus())) {
            return ResponseEntity.badRequest().body("Crop is not available for purchase (Current Status: " + crop.getStatus() + ")");
        }

        // Must be a harvested crop
        if (crop.getHarvestDate() != null && crop.getHarvestDate().isAfter(java.time.LocalDate.now())) {
            return ResponseEntity.badRequest().body("Crop is not yet harvested. Harvest date: " + crop.getHarvestDate());
        }

        Order order = new Order();
        order.setCrop(crop);
        order.setBuyer(buyer);
        order.setStatus(Order.OrderStatus.REQUESTED);

        return ResponseEntity.ok(orderRepository.save(order));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.badRequest().build();

        if (user.getRole() == Role.FARMER) {
            Farmer farmer = farmerRepository.findByUser(user).orElse(null);
            return ResponseEntity.ok(orderRepository.findByCropFarmer(farmer));
        } else {
            return ResponseEntity.ok(orderRepository.findByBuyer(user));
        }
    }

    @PostMapping("/{orderId}/approve")
    public ResponseEntity<?> approveOrder(@PathVariable Long orderId, Authentication authentication) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();

        String farmerEmail = authentication.getName();
        User user = userRepository.findByEmail(farmerEmail).orElse(null);
        if (user == null || user.getRole() != Role.FARMER) {
            return ResponseEntity.status(403).body("Only Farmers can approve orders");
        }

        // Only the crop-owning Farmer can view order requests (and approve)
        if (!order.getCrop().getFarmer().getUser().getId().equals(user.getId())) {
             return ResponseEntity.status(403).body("You do not own this crop");
        }

        order.setStatus(Order.OrderStatus.APPROVED);
        
        // Update Crop Status and Ownership in DB
        Crop crop = order.getCrop();
        crop.setOwnerId(order.getBuyer().getId());
        crop.setOwnerRole(order.getBuyer().getRole());
        crop.setStatus("SOLD");
        cropRepository.save(crop);

        // Trigger Blockchain Ownership Transfer
        String txHash = blockchainService.transferOwnershipOnBlockchain(
            crop.getId(), 
            order.getBuyer().getName()
        );
        order.setBlockchainTxHash(txHash);
        
        orderRepository.save(order);

        // Automatically create a pending shipment
        Shipment shipment = new Shipment();
        shipment.setOrder(order);
        shipment.setStatus(Shipment.ShipmentStatus.PENDING);
        shipment.setFromRole(order.getCrop().getFarmer().getUser().getRole());
        shipment.setToRole(order.getBuyer().getRole());
        shipment.setLocation(order.getCrop().getOrigin());
        shipmentRepository.save(shipment);

        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}/reject")
    public ResponseEntity<?> rejectOrder(@PathVariable Long orderId, Authentication authentication) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();

        String farmerEmail = authentication.getName();
        User user = userRepository.findByEmail(farmerEmail).orElse(null);
        if (user == null || user.getRole() != Role.FARMER) {
            return ResponseEntity.status(403).body("Only Farmers can reject orders");
        }

        if (!order.getCrop().getFarmer().getUser().getId().equals(user.getId())) {
             return ResponseEntity.status(403).body("You do not own this crop");
        }

        order.setStatus(Order.OrderStatus.REJECTED);
        return ResponseEntity.ok(orderRepository.save(order));
    }
}
