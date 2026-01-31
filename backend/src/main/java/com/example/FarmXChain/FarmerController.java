package com.example.FarmXChain;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/farmer")
public class FarmerController {

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/onboard")
    public ResponseEntity<?> createProfile(@RequestBody Map<String, String> request, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (farmerRepository.findByUser(user).isPresent()) {
            return ResponseEntity.badRequest().body("Profile already exists");
        }

        Farmer farmer = new Farmer();
        farmer.setUser(user);
        farmer.setFarmLocation(request.get("farmLocation"));
        farmer.setCropType(request.get("cropType"));
        // Save Bank Details
        farmer.setBankName(request.get("bankName"));
        farmer.setAccountNumber(request.get("accountNumber"));
        farmerRepository.save(farmer);

        return ResponseEntity.ok(farmer);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(farmerRepository.findByUser(user).orElse(null));
    }
}
