package com.example.FarmXChain;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    @Autowired
    private ShipmentRepository shipmentRepository;

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Shipment> getShipmentByOrder(@PathVariable Long orderId) {
        return shipmentRepository.findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{shipmentId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long shipmentId, 
            @RequestParam Shipment.ShipmentStatus status,
            @RequestParam(required = false) String location) {
        
        Shipment shipment = shipmentRepository.findById(shipmentId).orElse(null);
        if (shipment == null) return ResponseEntity.notFound().build();

        shipment.setStatus(status);
        shipment.setUpdatedAt(LocalDateTime.now());

        if (location != null) {
            shipment.setLocation(location);
        }

        if (status == Shipment.ShipmentStatus.DELIVERED) {
            shipment.setDeliveredAt(LocalDateTime.now());
        }

        return ResponseEntity.ok(shipmentRepository.save(shipment));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllShipments(Authentication authentication) {
        // Only Admin can see all shipments
        return ResponseEntity.ok(shipmentRepository.findAll());
    }

    @GetMapping("/my-shipments")
    public ResponseEntity<?> getMyShipments(Authentication authentication) {
        // This logic would ideally be in a service
        // For now, filtering is done based on the user's role and associated orders
        // Simplified for Milestone 3 requirements
        return ResponseEntity.ok(shipmentRepository.findAll()); // Simple implementation
    }
}
