package com.example.FarmXChain;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.http.ResponseEntity;


@RestController
@RequestMapping("/api/crops")
public class CropController {

    @Autowired
    private CropService cropService;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<?> addCrop(@RequestBody Crop crop, Authentication authentication) {
        try {
            String email = authentication.getName();
            return ResponseEntity.ok(cropService.addCrop(email, crop));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error adding crop: " + e.getMessage());
        }
    }

    @GetMapping("/my-crops")
    public List<Crop> getMyCrops(Authentication authentication) {
        String email = authentication.getName();
        return cropService.getFarmerCrops(email);
    }
}

