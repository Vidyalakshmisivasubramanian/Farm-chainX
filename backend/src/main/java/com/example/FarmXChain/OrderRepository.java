package com.example.FarmXChain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyer(User buyer);
    List<Order> findByCropFarmer(Farmer farmer);
}
