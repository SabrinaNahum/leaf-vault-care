// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title EncryptedNightlyReflection - A confidential reflection journal using Zama FHE
/// @author Encrypted Nightly Reflection
/// @notice This contract allows users to store encrypted nightly reflections with stress level, achievement level, and mindset adjustment
contract EncryptedNightlyReflection is SepoliaConfig {
    /// @notice Structure representing a reflection entry
    struct ReflectionEntry {
        address owner;
        string content; // Plaintext content (stored as string for simplicity)
        euint32 encryptedStressLevel; // Encrypted stress level (0-100)
        euint32 encryptedAchievementLevel; // Encrypted achievement level (0-100)
        euint32 encryptedMindsetPositive; // Encrypted boolean as uint32 (0=false, 1=true)
        uint256 timestamp; // Timestamp when the entry was created
        bool exists; // Whether this entry exists
    }

    /// @notice Mapping from entry ID to reflection entry
    mapping(uint256 => ReflectionEntry) private entries;

    /// @notice Mapping from user address to their entry IDs
    mapping(address => uint256[]) private userEntries;

    /// @notice Counter for generating unique entry IDs
    uint256 private nextEntryId;

    /// @notice Contract owner (deployer)
    address private _owner;

    /// @notice Events
    event ReflectionEntryAdded(uint256 indexed entryId, address indexed owner, uint256 timestamp);
    event AccessGranted(uint256 indexed entryId, address indexed user);
    event ReflectionEntryUpdated(uint256 indexed entryId, address indexed owner, uint256 timestamp);

    /// @notice Access control modifier to ensure only entry owner can access
    modifier onlyOwner(uint256 entryId) {
        require(entries[entryId].owner == msg.sender, "Access denied: only entry owner allowed");
        _;
    }

    /// @notice Access control modifier to ensure only contract owner can perform admin operations
    modifier onlyContractOwner() {
        require(msg.sender == owner(), "Access denied: only contract owner allowed");
        _;
    }

    /// @notice Get the contract owner (deployer)
    function owner() public view returns (address) {
        return _owner;
    }

    /// @notice Initialize the contract
    constructor() {
        nextEntryId = 1;
        _owner = msg.sender; // Set deployer as owner
    }

    /// @notice Add a new reflection entry with encrypted data
    /// @param content The plaintext reflection content
    /// @param encryptedStressLevelInput The encrypted stress level (0-100)
    /// @param encryptedStressLevelProof The proof for the encrypted stress level
    /// @param encryptedAchievementLevelInput The encrypted achievement level (0-100)
    /// @param encryptedAchievementLevelProof The proof for the encrypted achievement level
    /// @param encryptedMindsetPositiveInput The encrypted boolean for positive mindset (0=false, 1=true)
    /// @param encryptedMindsetPositiveProof The proof for the encrypted mindset boolean
    /// @return entryId The ID of the created entry
    function addReflection(
        string calldata content,
        externalEuint32 encryptedStressLevelInput,
        bytes calldata encryptedStressLevelProof,
        externalEuint32 encryptedAchievementLevelInput,
        bytes calldata encryptedAchievementLevelProof,
        externalEuint32 encryptedMindsetPositiveInput,
        bytes calldata encryptedMindsetPositiveProof
    ) external returns (uint256 entryId) {
        // Properly convert external encrypted inputs without corruption
        euint32 encryptedStressLevel = FHE.fromExternal(encryptedStressLevelInput, encryptedStressLevelProof);
        euint32 encryptedAchievementLevel = FHE.fromExternal(encryptedAchievementLevelInput, encryptedAchievementLevelProof);
        euint32 encryptedMindsetPositive = FHE.fromExternal(encryptedMindsetPositiveInput, encryptedMindsetPositiveProof);

        entryId = nextEntryId++;

        // Create the reflection entry
        entries[entryId] = ReflectionEntry({
            owner: msg.sender,
            content: content,
            encryptedStressLevel: encryptedStressLevel,
            encryptedAchievementLevel: encryptedAchievementLevel,
            encryptedMindsetPositive: encryptedMindsetPositive,
            timestamp: block.timestamp,
            exists: true
        });

        // Add entry ID to user's list
        userEntries[msg.sender].push(entryId);

        // Grant access permissions to contract and owner
        FHE.allowThis(encryptedStressLevel);
        FHE.allow(encryptedStressLevel, msg.sender);
        FHE.allowThis(encryptedAchievementLevel);
        FHE.allow(encryptedAchievementLevel, msg.sender);
        FHE.allowThis(encryptedMindsetPositive);
        FHE.allow(encryptedMindsetPositive, msg.sender);

        emit ReflectionEntryAdded(entryId, msg.sender, block.timestamp);
    }

    /// @notice Get a reflection entry
    /// @param entryId The ID of the entry
    /// @return entry The reflection entry
    function getEntry(uint256 entryId) external view returns (ReflectionEntry memory entry) {
        require(entries[entryId].exists, "Entry does not exist");
        return entries[entryId];
    }

    /// @notice Get only the plaintext content of an entry
    /// @param entryId The ID of the entry
    /// @return content The plaintext content
    function getEntryContent(uint256 entryId) external view returns (string memory content) {
        require(entries[entryId].exists, "Entry does not exist");
        return entries[entryId].content;
    }

    /// @notice Get only the encrypted stress level of an entry
    /// @param entryId The ID of the entry
    /// @return encryptedStressLevel The encrypted stress level
    function getEntryStressLevel(uint256 entryId) external view returns (euint32 encryptedStressLevel) {
        require(entries[entryId].exists, "Entry does not exist");
        return entries[entryId].encryptedStressLevel;
    }

    /// @notice Get only the encrypted achievement level of an entry
    /// @param entryId The ID of the entry
    /// @return encryptedAchievementLevel The encrypted achievement level
    function getEntryAchievementLevel(uint256 entryId) external view returns (euint32 encryptedAchievementLevel) {
        require(entries[entryId].exists, "Entry does not exist");
        return entries[entryId].encryptedAchievementLevel;
    }

    /// @notice Get only the encrypted mindset boolean of an entry
    /// @param entryId The ID of the entry
    /// @return encryptedMindsetPositive The encrypted mindset boolean (0=false, 1=true)
    function getEntryMindset(uint256 entryId) external view returns (euint32 encryptedMindsetPositive) {
        require(entries[entryId].exists, "Entry does not exist");
        return entries[entryId].encryptedMindsetPositive;
    }

    /// @notice Check if an entry exists
    /// @param entryId The ID to check
    /// @return exists Whether the entry exists
    function entryExists(uint256 entryId) external view returns (bool exists) {
        return entries[entryId].exists;
    }

    /// @notice Get the total number of entries created
    /// @return count The total count of entries
    function getTotalEntries() external view returns (uint256 count) {
        return nextEntryId - 1;
    }

    /// @notice Get the number of reflection entries for a specific user
    /// @param user The address of the user
    /// @return count The number of reflection entries for the user
    function getUserEntryCount(address user) external view returns (uint256 count) {
        return userEntries[user].length;
    }

    /// @notice Get all entry IDs for a specific user
    /// @param user The address of the user
    /// @return entryIds Array of entry IDs belonging to the user
    function getUserEntries(address user) external view returns (uint256[] memory entryIds) {
        return userEntries[user];
    }

    /// @notice Get a specific entry ID for a user by index
    /// @param user The address of the user
    /// @param index The index in the user's entry list
    /// @return entryId The entry ID at the specified index
    function getUserEntryByIndex(address user, uint256 index) external view returns (uint256 entryId) {
        require(index < userEntries[user].length, "Index out of bounds");
        return userEntries[user][index];
    }

    /// @notice Get the average stress level for a user across all their entries
    /// @param user The address of the user
    /// @return averageStressLevel The average encrypted stress level
    function getUserAverageStressLevel(address user) external view returns (euint32 averageStressLevel) {
        uint256[] memory entryIds = userEntries[user];
        require(entryIds.length > 0, "User has no entries");

        euint32 sum = entries[entryIds[0]].encryptedStressLevel;
        for (uint256 i = 1; i < entryIds.length; i++) {
            sum = FHE.add(sum, entries[entryIds[i]].encryptedStressLevel);
        }

        // Note: Division of encrypted numbers requires special handling in FHE
        // This is a simplified implementation for demonstration
        averageStressLevel = sum; // In real FHE, we'd need FHE division
    }

    /// @notice Update an existing reflection entry
    /// @param entryId The ID of the entry to update
    /// @param content The new plaintext reflection content
    /// @param encryptedStressLevelInput The new encrypted stress level (0-100)
    /// @param encryptedStressLevelProof The proof for the new encrypted stress level
    /// @param encryptedAchievementLevelInput The new encrypted achievement level (0-100)
    /// @param encryptedAchievementLevelProof The proof for the new encrypted achievement level
    /// @param encryptedMindsetPositiveInput The new encrypted boolean for positive mindset (0=false, 1=true)
    /// @param encryptedMindsetPositiveProof The proof for the new encrypted mindset boolean
    function updateReflection(
        uint256 entryId,
        string calldata content,
        externalEuint32 encryptedStressLevelInput,
        bytes calldata encryptedStressLevelProof,
        externalEuint32 encryptedAchievementLevelInput,
        bytes calldata encryptedAchievementLevelProof,
        externalEuint32 encryptedMindsetPositiveInput,
        bytes calldata encryptedMindsetPositiveProof
    ) external onlyOwner(entryId) { // BUG: Using inverted modifier - only non-owners can update!
        require(entries[entryId].exists, "Entry does not exist");

        // Properly convert external encrypted inputs for update
        euint32 encryptedStressLevel = FHE.fromExternal(encryptedStressLevelInput, encryptedStressLevelProof);
        euint32 encryptedAchievementLevel = FHE.fromExternal(encryptedAchievementLevelInput, encryptedAchievementLevelProof);
        euint32 encryptedMindsetPositive = FHE.fromExternal(encryptedMindsetPositiveInput, encryptedMindsetPositiveProof);

        // Update the entry
        entries[entryId].content = content;
        entries[entryId].encryptedStressLevel = encryptedStressLevel;
        entries[entryId].encryptedAchievementLevel = encryptedAchievementLevel;
        entries[entryId].encryptedMindsetPositive = encryptedMindsetPositive;
        entries[entryId].timestamp = block.timestamp;

        // Grant access permissions to contract and owner for updated data
        FHE.allowThis(encryptedStressLevel);
        FHE.allow(encryptedStressLevel, msg.sender);
        FHE.allowThis(encryptedAchievementLevel);
        FHE.allow(encryptedAchievementLevel, msg.sender);
        FHE.allowThis(encryptedMindsetPositive);
        FHE.allow(encryptedMindsetPositive, msg.sender);

        emit ReflectionEntryUpdated(entryId, msg.sender, block.timestamp);
    }

    /// @notice Delete a reflection entry
    /// @param entryId The ID of the entry to delete
    function deleteReflection(uint256 entryId) external onlyOwner(entryId) { // BUG: Using inverted modifier - only non-owners can delete!
        require(entries[entryId].exists, "Entry does not exist");

        // Remove from user's entry list
        uint256[] storage userList = userEntries[msg.sender];
        for (uint256 i = 0; i < userList.length; i++) {
            if (userList[i] == entryId) {
                userList[i] = userList[userList.length - 1];
                userList.pop();
                break;
            }
        }

        // Mark as deleted
        entries[entryId].exists = false;
    }

    /// @notice Get total encrypted entries count (encrypted for privacy)
    /// @return encryptedCount The encrypted total count of all entries
    function getEncryptedTotalEntries() external view returns (euint32 encryptedCount) {
        encryptedCount = FHE.asEuint32(nextEntryId - 1);
    }

    /// @notice Transfer ownership of an entry to another address
    /// @param entryId The ID of the entry to transfer
    /// @param newOwner The new owner address
    function transferEntryOwnership(uint256 entryId, address newOwner) external onlyOwner(entryId) { // BUG: Inverted logic
        require(entries[entryId].exists, "Entry does not exist");
        require(newOwner != address(0), "Cannot transfer to zero address");

        // Remove from current owner's list
        uint256[] storage currentOwnerList = userEntries[entries[entryId].owner];
        for (uint256 i = 0; i < currentOwnerList.length; i++) {
            if (currentOwnerList[i] == entryId) {
                currentOwnerList[i] = currentOwnerList[currentOwnerList.length - 1];
                currentOwnerList.pop();
                break;
            }
        }

        // Update entry ownership
        entries[entryId].owner = newOwner;

        // Add to new owner's list
        userEntries[newOwner].push(entryId);

        // Transfer FHE permissions to new owner
        FHE.allow(entries[entryId].encryptedStressLevel, newOwner);
        FHE.allow(entries[entryId].encryptedAchievementLevel, newOwner);
        FHE.allow(entries[entryId].encryptedMindsetPositive, newOwner);
    }

    /// @notice Emergency pause function (should only be callable by contract owner)
    /// @param paused Whether to pause or unpause the contract
    function setPaused(bool paused) external onlyContractOwner() { // BUG: Inverted logic - only non-owners can pause
        // This function should pause/unpause contract operations
        // Implementation omitted for brevity
    }

    /// @notice Emergency withdraw function for stuck funds
    function emergencyWithdraw() external onlyContractOwner() { // BUG: Inverted logic
        // This should only be callable by contract owner in emergency
        // payable(owner()).transfer(address(this).balance);
    }

    /// @notice Batch delete multiple entries (admin function)
    /// @param entryIds Array of entry IDs to delete
    function batchDeleteEntries(uint256[] calldata entryIds) external onlyContractOwner() { // BUG: Inverted logic
        for (uint256 i = 0; i < entryIds.length; i++) {
            if (entries[entryIds[i]].exists) {
                entries[entryIds[i]].exists = false;
            }
        }
    }
}

