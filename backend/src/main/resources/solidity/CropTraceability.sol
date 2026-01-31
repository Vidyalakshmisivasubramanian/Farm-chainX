// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CropTraceability {
    
    struct CropBatch {
        string cropName;
        uint256 quantity;
        string origin;
        string certHash;
        uint256 timestamp;
        address owner;
    }

    mapping(bytes32 => CropBatch) public crops;
    event CropRegistered(bytes32 indexed hash, string cropName, address indexed owner);

    function registerCrop(string memory _name, uint256 _qty, string memory _origin, string memory _certHash) public returns (bytes32) {
        bytes32 hash = sha256(abi.encodePacked(_name, _qty, _origin, block.timestamp, msg.sender));
        
        crops[hash] = CropBatch({
            cropName: _name,
            quantity: _qty,
            origin: _origin,
            certHash: _certHash,
            timestamp: block.timestamp,
            owner: msg.sender
        });

        emit CropRegistered(hash, _name, msg.sender);
        return hash;
    }

    function getCrop(bytes32 _hash) public view returns (string memory, uint256, string memory, address) {
        CropBatch memory c = crops[_hash];
        return (c.cropName, c.quantity, c.origin, c.owner);
    }
}
