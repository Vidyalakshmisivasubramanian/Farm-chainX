package com.example.FarmXChain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Crop {

    public enum VerificationStatus {
        PENDING, VERIFIED, TAMPERED
    }


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    private String cropName;
    private Double quantity; // in kg or tons
    private String qualityGrade; // e.g., "A", "B", "Premium"
    private LocalDate harvestDate;

    // Blockchain Traceability Fields
    private String transactionId; // Simulated or real tx ID
    private java.time.LocalDateTime createdTimestamp;
    
    // Certificate Upload
    private String certificatePath;

    // Location Tracking (Milestone 2)
    private Double latitude;
    private Double longitude;
    private String origin; // City / Map Location

    // Blockchain Verification Status (Milestone 2)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;
    private String dataHash; // SHA-256 hash of all crop details


    // Ownership & Status (Milestone 3)
    private String status = "AVAILABLE"; // AVAILABLE, SOLD
    private Role ownerRole = Role.FARMER;
    private Long ownerId; // References User ID of current owner


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Role getOwnerRole() { return ownerRole; }
    public void setOwnerRole(Role ownerRole) { this.ownerRole = ownerRole; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public Farmer getFarmer() { return farmer; }
    public void setFarmer(Farmer farmer) { this.farmer = farmer; }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public String getQualityGrade() { return qualityGrade; }
    public void setQualityGrade(String qualityGrade) { this.qualityGrade = qualityGrade; }

    public LocalDate getHarvestDate() { return harvestDate; }
    public void setHarvestDate(LocalDate harvestDate) { this.harvestDate = harvestDate; }


    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public java.time.LocalDateTime getCreatedTimestamp() { return createdTimestamp; }
    public void setCreatedTimestamp(java.time.LocalDateTime createdTimestamp) { this.createdTimestamp = createdTimestamp; }

    public String getCertificatePath() { return certificatePath; }
    public void setCertificatePath(String certificatePath) { this.certificatePath = certificatePath; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getDataHash() { return dataHash; }
    public void setDataHash(String dataHash) { this.dataHash = dataHash; }

    // Deprecated fields from previous Milestone - keeping getters for compatibility if needed
    @Deprecated
    public String getBlockchainHash() { return dataHash; }
    @Deprecated
    public Boolean getIsVerified() { return verificationStatus == VerificationStatus.VERIFIED; }
}


