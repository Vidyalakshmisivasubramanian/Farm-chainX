package com.example.FarmXChain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "crop_order") // 'order' is a reserved keyword in SQL
public class Order {

    public enum OrderStatus {
        REQUESTED, APPROVED, REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "crop_id", nullable = false)
    private Crop crop;

    @ManyToOne
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private OrderStatus status = OrderStatus.REQUESTED;

    private String blockchainTxHash;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Crop getCrop() { return crop; }
    public void setCrop(Crop crop) { this.crop = crop; }

    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public String getBlockchainTxHash() { return blockchainTxHash; }
    public void setBlockchainTxHash(String blockchainTxHash) { this.blockchainTxHash = blockchainTxHash; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
