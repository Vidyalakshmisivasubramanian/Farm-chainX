// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CropTraceability {
    
    struct CropRecord {
        uint256 cropId;
        string dataHash;
        uint256 timestamp;
        bool exists;
    }

    mapping(uint256 => CropRecord) public crops;
    mapping(uint256 => string) public cropOwners; // Mapping cropId to current owner name

    event CropRegistered(uint256 indexed cropId, string dataHash, uint256 timestamp);
    event OwnershipTransferred(uint256 indexed cropId, string newOwner, uint256 timestamp);

    /**
     * Register a crop with its data hash on the blockchain
     * @param _cropId Unique crop ID from the database
     * @param _dataHash SHA-256 hash of crop data (cropName + quantity + grade + harvestDate + origin)
     */
    function registerCrop(uint256 _cropId, string memory _dataHash) public returns (bool) {
        require(!crops[_cropId].exists, "Crop already registered");
        
        crops[_cropId] = CropRecord({
            cropId: _cropId,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            exists: true
        });

        emit CropRegistered(_cropId, _dataHash, block.timestamp);
        return true;
    }

    /**
     * Get the stored hash for a specific crop
     * @param _cropId The crop ID to query
     * @return dataHash The stored hash
     * @return timestamp When the crop was registered
     */
    function getCropHash(uint256 _cropId) public view returns (string memory dataHash, uint256 timestamp) {
        require(crops[_cropId].exists, "Crop not found");
        CropRecord memory record = crops[_cropId];
        return (record.dataHash, record.timestamp);
    }

    /**
     * Check if a crop is registered
     * @param _cropId The crop ID to check
     * @return exists True if crop is registered
     */
    function cropExists(uint256 _cropId) public view returns (bool) {
        return crops[_cropId].exists;
    }

    /**
     * Transfer ownership of a crop batch
     * @param _cropId The crop ID
     * @param _newOwner Name of the new owner
     */
    function transferOwnership(uint256 _cropId, string memory _newOwner) public returns (bool) {
        require(crops[_cropId].exists, "Crop not found");
        
        cropOwners[_cropId] = _newOwner;
        
        emit OwnershipTransferred(_cropId, _newOwner, block.timestamp);
        return true;
    }

    /**
     * Get current owner of a crop batch
     * @param _cropId The crop ID
     * @return owner Name of the current owner
     */
    function getCurrentOwner(uint256 _cropId) public view returns (string memory) {
        require(crops[_cropId].exists, "Crop not found");
        return cropOwners[_cropId];
    }
}
