package com.example.FarmXChain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    Optional<Farmer> findByUser(User user);
    List<Farmer> findByUserStatus(UserStatus status);
}
