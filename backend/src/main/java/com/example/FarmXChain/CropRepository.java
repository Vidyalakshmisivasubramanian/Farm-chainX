package com.example.FarmXChain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CropRepository extends JpaRepository<Crop, Long> {
    List<Crop> findByFarmerId(Long farmerId);
    java.util.Optional<Crop> findByDataHash(String dataHash);
}

