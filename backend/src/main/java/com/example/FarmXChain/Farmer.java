package com.example.FarmXChain;

import jakarta.persistence.*;

@Entity
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    private String farmLocation;
    private String cropType;
    
    // Bank Details (Milestone 1 Update)
    private String bankName;
    private String accountNumber;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFarmLocation() { return farmLocation; }
    public void setFarmLocation(String farmLocation) { this.farmLocation = farmLocation; }

    public String getCropType() { return cropType; }
    public void setCropType(String cropType) { this.cropType = cropType; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
}
