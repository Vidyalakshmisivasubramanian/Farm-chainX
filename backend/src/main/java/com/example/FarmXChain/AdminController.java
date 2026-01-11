package com.example.FarmXChain;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private FarmerRepository farmerRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/farmers/pending")
    public ResponseEntity<List<Farmer>> getPendingFarmers() {
        return ResponseEntity.ok(farmerRepository.findByUserStatus(UserStatus.PENDING));
    }

    @PostMapping("/farmers/{id}/verify")
    public ResponseEntity<?> verifyFarmer(@PathVariable Long id, @RequestParam boolean approved) {
        Farmer farmer = farmerRepository.findById(id).orElseThrow();
        User user = farmer.getUser();

        if (approved) {
            user.setStatus(UserStatus.ACTIVE);
        } else {
            user.setStatus(UserStatus.REJECTED);
        }
        userRepository.save(user);
        
        return ResponseEntity.ok("Farmer status updated");
    }
}
