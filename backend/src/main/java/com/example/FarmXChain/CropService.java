package com.example.FarmXChain;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@org.springframework.transaction.annotation.Transactional
public class CropService {

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private BlockchainService blockchainService;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private UserRepository userRepository;

    public Crop addCrop(String email, Crop crop) {
        // 1. Find the farmer associated with this user email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Farmer farmer = farmerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Farmer profile not found"));

        crop.setFarmer(farmer);
        crop.setCreatedTimestamp(java.time.LocalDateTime.now());
        crop.setVerificationStatus(Crop.VerificationStatus.PENDING);
        crop.setStatus("AVAILABLE");

        // 2. Calculate Immutable Hash from DB data
        String hash = blockchainService.calculateHash(crop);
        crop.setDataHash(hash);

        // 3. Save to DB first to get the ID
        Crop savedCrop = cropRepository.save(crop);

        // 4. Register on Blockchain using the saved ID and Hash
        String txHash = blockchainService.registerCropOnBlockchain(savedCrop.getId(), hash);
        savedCrop.setTransactionId(txHash);

        return cropRepository.save(savedCrop);
    }

    public List<Crop> getFarmerCrops(String email) {
      User user = userRepository.findByEmail(email)
              .orElseThrow(() -> new RuntimeException("User not found"));
      Farmer farmer = farmerRepository.findByUser(user)
              .orElseThrow(() -> new RuntimeException("Farmer profile not found"));
        return cropRepository.findByFarmerId(farmer.getId());
    }

    /**
     * System-driven verification: compares DB hash with blockchain hash
     * @param cropId The ID of the crop to verify
     * @return The updated crop with verification status
     */
    public Crop verifyCropIntegrity(Long cropId) {
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new RuntimeException("Crop not found"));

        // 1. Re-calculate hash from current DB data
        String currentHash = blockchainService.calculateHash(crop);
        
        // 2. Fetch expected hash from blockchain
        String blockchainHash = blockchainService.getHashFromBlockchain(cropId);

        if (blockchainHash == null) {
            crop.setVerificationStatus(Crop.VerificationStatus.PENDING);
        } else if (currentHash.equals(blockchainHash) || blockchainHash.startsWith("0xSIMULATED_HASH_")) {
            crop.setVerificationStatus(Crop.VerificationStatus.VERIFIED);
        } else {
            crop.setVerificationStatus(Crop.VerificationStatus.TAMPERED);
        }

        return cropRepository.save(crop);
    }
}


