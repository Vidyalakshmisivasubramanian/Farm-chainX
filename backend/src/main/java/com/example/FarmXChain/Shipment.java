package com.example.FarmXChain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Shipment {

    public enum ShipmentStatus {
        PENDING, PICKED_UP, IN_TRANSIT, DELIVERED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ShipmentStatus status = ShipmentStatus.PENDING;

    private Role fromRole;
    private Role toRole;
    private String location; // Text location as per requirement

    private Double currentLatitude;
    private Double currentLongitude;
    
    private LocalDateTime dispatchedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { this.status = status; }

    public Double getCurrentLatitude() { return currentLatitude; }
    public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }

    public Double getCurrentLongitude() { return currentLongitude; }
    public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }

    public LocalDateTime getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Role getFromRole() { return fromRole; }
    public void setFromRole(Role fromRole) { this.fromRole = fromRole; }

    public Role getToRole() { return toRole; }
    public void setToRole(Role toRole) { this.toRole = toRole; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
