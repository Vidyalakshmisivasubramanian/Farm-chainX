package com.example.FarmXChain;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/blockchain")
public class TraceabilityController {

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private CropService cropService;

    // Public API to list all crops with their blockchain hash - The "Ledger" view
    @org.springframework.transaction.annotation.Transactional
    @GetMapping("/explore")
    public ResponseEntity<List<Map<String, Object>>> getAllCrops() {
        System.out.println("DEBUG: Fetching all crops for explorer...");
        List<Crop> crops = cropRepository.findAll();
        
        List<Map<String, Object>> response = crops.stream().map(crop -> {
            // Auto-verify if status is PENDING to show 'Valid' immediately in simulation mode
            if (crop.getVerificationStatus() == Crop.VerificationStatus.PENDING) {
                try {
                    crop = cropService.verifyCropIntegrity(crop.getId());
                } catch (Exception e) {
                    System.err.println("Auto-verify failed for crop " + crop.getId());
                }
            }

            try {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", crop.getId());
                map.put("cropName", crop.getCropName());
                map.put("farmerName", (crop.getFarmer() != null && crop.getFarmer().getUser() != null) 
                                      ? crop.getFarmer().getUser().getName() : "Unknown");
                map.put("quantity", crop.getQuantity());
                map.put("origin", crop.getOrigin() != null ? crop.getOrigin() : "N/A");
                map.put("harvestDate", crop.getHarvestDate() != null ? crop.getHarvestDate().toString() : "N/A");
                map.put("hash", crop.getDataHash() != null ? crop.getDataHash() : "PENDING");
                map.put("status", crop.getVerificationStatus() != null ? crop.getVerificationStatus().toString() : "PENDING");
                map.put("timestamp", crop.getCreatedTimestamp() != null ? crop.getCreatedTimestamp().toString() : "N/A");
                return map;
            } catch (Exception e) {
                System.err.println("DEBUG: Error mapping crop " + crop.getId() + ": " + e.getMessage());
                return null;
            }
        })
        .filter(java.util.Objects::nonNull)
        .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }


    // Verify a specific crop by ID - Triggers System-Driven Integrity Check
    @GetMapping("/verify/{cropId}")
    public ResponseEntity<?> verifyCrop(@PathVariable Long cropId) {
        try {
            Crop crop = cropService.verifyCropIntegrity(cropId);
            
            boolean isValid = crop.getVerificationStatus() == Crop.VerificationStatus.VERIFIED;
            boolean isTampered = crop.getVerificationStatus() == Crop.VerificationStatus.TAMPERED;

            Map<String, Object> result = new java.util.HashMap<>();
            result.put("valid", isValid);
            result.put("status", crop.getVerificationStatus());
            result.put("cropData", crop);
            result.put("message", isTampered ? "WARNING: Data Integrity Check Failed! Hashes do not match." : 
                                 isValid ? "Verified: Data matches the immutable blockchain record." :
                                           "Verification Pending: Transaction might still be mining.");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Error during verification: " + e.getMessage());
        }
    }
}

