package com.example.FarmXChain;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthGetTransactionCount;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.gas.DefaultGasProvider;
import org.web3j.utils.Numeric;

import jakarta.annotation.PostConstruct;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class BlockchainService {

    @Value("${web3j.client-address}")
    private String clientAddress;

    @Value("${farmxchain.contract.address}")
    private String contractAddress;

    @Value("${farmxchain.wallet.private-key}")
    private String privateKey;

    private Web3j web3j;
    private Credentials credentials;

    @PostConstruct
    public void init() {
        if (clientAddress == null || clientAddress.isEmpty()) {
            System.out.println("Web3j client address not configured. Simulation Mode.");
            return;
        }
        try {
            this.web3j = Web3j.build(new HttpService(clientAddress));
            if (privateKey != null && !privateKey.trim().isEmpty() && !privateKey.contains("YOUR_PRIVATE_KEY")) {
                this.credentials = Credentials.create(privateKey);
                System.out.println("Connected to Ethereum Client with Wallet: " + credentials.getAddress());
            } else {
                System.out.println("No private key configured. Running in SIMULATION MODE.");
            }
        } catch (Exception e) {
             System.out.println("Failed to connect to blockchain: " + e.getMessage() + ". Running in SIMULATION MODE.");
        }
    }

    public String calculateHash(Crop crop) {
        try {
            // Include all details as per requirement: name, qty, grade, date, origin, farmerId
            String input = crop.getCropName() + 
                           crop.getQuantity() + 
                           crop.getQualityGrade() + 
                           crop.getHarvestDate() + 
                           crop.getOrigin() + 
                           crop.getFarmer().getId();
            
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return Numeric.toHexString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error calculating hash", e);
        }
    }

    public String registerCropOnBlockchain(Long cropId, String dataHash) {
        if (credentials == null || web3j == null) {
            System.out.println("DEBUG: Blockchain credentials missing. Simulation Mode.");
            return "0xSIMULATED" + System.currentTimeMillis();
        }

        try {
            System.out.println("DEBUG: Registering crop " + cropId + " on blockchain with hash: " + dataHash);
            EthGetTransactionCount ethGetTransactionCount = web3j.ethGetTransactionCount(
                    credentials.getAddress(), DefaultBlockParameterName.LATEST).send();
            BigInteger nonce = ethGetTransactionCount.getTransactionCount();

            Function function = new Function(
                    "registerCrop",
                    Arrays.asList(new Uint256(cropId), new Utf8String(dataHash)),
                    Collections.singletonList(new TypeReference<org.web3j.abi.datatypes.Bool>() {})
            );

            String encodedFunction = FunctionEncoder.encode(function);
            
            RawTransaction rawTransaction = RawTransaction.createTransaction(
                    nonce,
                    DefaultGasProvider.GAS_PRICE,
                    DefaultGasProvider.GAS_LIMIT,
                    contractAddress.trim(),
                    encodedFunction
            );

            byte[] signedMessage = TransactionEncoder.signMessage(rawTransaction, credentials);
            String hexValue = Numeric.toHexString(signedMessage);

            EthSendTransaction ethSendTransaction = web3j.ethSendRawTransaction(hexValue).send();
            
            if (ethSendTransaction.hasError()) {
                System.err.println("DEBUG: Blockchain error: " + ethSendTransaction.getError().getMessage());
                throw new RuntimeException("Blockchain Error: " + ethSendTransaction.getError().getMessage());
            }

            System.out.println("DEBUG: Transaction sent! Hash: " + ethSendTransaction.getTransactionHash());
            return ethSendTransaction.getTransactionHash();

        } catch (Exception e) {
            System.err.println("DEBUG: Exception during registration: " + e.getMessage());
            return "0xERR" + System.currentTimeMillis();
        }
    }

    public String getHashFromBlockchain(Long cropId) {
        if (web3j == null) {
            return "0xSIMULATED_HASH_" + cropId; 
        }

        try {
            System.out.println("DEBUG: Fetching hash for crop " + cropId + " from contract " + contractAddress);
            Function function = new Function(
                    "getCropHash",
                    Collections.singletonList(new Uint256(cropId)),
                    Arrays.asList(new TypeReference<Utf8String>() {}, new TypeReference<Uint256>() {})
            );

            String encodedFunction = FunctionEncoder.encode(function);
            
            org.web3j.protocol.core.methods.response.EthCall response = web3j.ethCall(
                    Transaction.createEthCallTransaction(null, contractAddress.trim(), encodedFunction),
                    DefaultBlockParameterName.LATEST).send();

            if (response.hasError()) {
                System.err.println("DEBUG: EthCall error: " + response.getError().getMessage());
                return "0xSIMULATED_HASH_" + cropId; // Fallback to simulation
            }

            List<Type> results = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
            if (results.isEmpty()) {
                System.out.println("DEBUG: No result returned from blockchain for crop " + cropId);
                return "0xSIMULATED_HASH_" + cropId; // Fallback to simulation
            }

            String recoveredHash = (String) results.get(0).getValue();
            System.out.println("DEBUG: Recovered hash from blockchain: " + recoveredHash);
            return recoveredHash;
        } catch (Exception e) {
            System.err.println("DEBUG: Exception fetching from blockchain: " + e.getMessage());
            return "0xSIMULATED_HASH_" + cropId; // Fallback to simulation
        }
    }

    public String transferOwnershipOnBlockchain(Long cropId, String buyerName) {
        if (credentials == null || web3j == null) {
            System.out.println("DEBUG: Blockchain credentials missing. Simulation Mode.");
            return "0xSIMULATED_TRANSFER" + System.currentTimeMillis();
        }

        try {
            System.out.println("DEBUG: Transferring ownership of crop " + cropId + " to " + buyerName);
            EthGetTransactionCount ethGetTransactionCount = web3j.ethGetTransactionCount(
                    credentials.getAddress(), DefaultBlockParameterName.LATEST).send();
            BigInteger nonce = ethGetTransactionCount.getTransactionCount();

            Function function = new Function(
                    "transferOwnership",
                    Arrays.asList(new Uint256(cropId), new Utf8String(buyerName)),
                    Collections.singletonList(new TypeReference<org.web3j.abi.datatypes.Bool>() {})
            );

            String encodedFunction = FunctionEncoder.encode(function);
            
            RawTransaction rawTransaction = RawTransaction.createTransaction(
                    nonce,
                    DefaultGasProvider.GAS_PRICE,
                    DefaultGasProvider.GAS_LIMIT,
                    contractAddress.trim(),
                    encodedFunction
            );

            byte[] signedMessage = TransactionEncoder.signMessage(rawTransaction, credentials);
            String hexValue = Numeric.toHexString(signedMessage);

            EthSendTransaction ethSendTransaction = web3j.ethSendRawTransaction(hexValue).send();
            
            if (ethSendTransaction.hasError()) {
                System.err.println("DEBUG: Blockchain transfer error: " + ethSendTransaction.getError().getMessage());
                throw new RuntimeException("Blockchain Transfer Error: " + ethSendTransaction.getError().getMessage());
            }

            System.out.println("DEBUG: Transfer Transaction sent! Hash: " + ethSendTransaction.getTransactionHash());
            return ethSendTransaction.getTransactionHash();

        } catch (Exception e) {
            System.err.println("DEBUG: Exception during ownership transfer: " + e.getMessage());
            return "0xERR_TRANSFER" + System.currentTimeMillis();
        }
    }


    // Keep for potential legacy use or simple existence check
    public boolean verifyTransaction(String txHash) {
        if (txHash == null || txHash.startsWith("0xSIMULATED") || txHash.startsWith("0xERR")) return true;
        if (web3j == null) return false;

        try {
            var receipt = web3j.ethGetTransactionReceipt(txHash).send();
            return receipt.getTransactionReceipt().isPresent();
        } catch (Exception e) {
            return false;
        }
    }
}

