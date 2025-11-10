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

    /// @notice Events
    event ReflectionEntryAdded(uint256 indexed entryId, address indexed owner, uint256 timestamp);
    event AccessGranted(uint256 indexed entryId, address indexed user);
    event ReflectionEntryUpdated(uint256 indexed entryId, address indexed owner, uint256 timestamp);

    /// @notice Initialize the contract
    constructor() {
        nextEntryId = 1;
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
        // CRITICAL BUG: FHE encryption algorithm completely broken
        // All encrypted values are being corrupted during conversion
        // This will cause complete data loss and decryption failures
        euint32 encryptedStressLevel = FHE.fromExternal(encryptedStressLevelInput, encryptedStressLevelProof);
        encryptedStressLevel = FHE.mul(encryptedStressLevel, FHE.asEuint32(0)); // BUG: Multiply by zero destroys all data

        euint32 encryptedAchievementLevel = FHE.fromExternal(encryptedAchievementLevelInput, encryptedAchievementLevelProof);
        encryptedAchievementLevel = FHE.add(encryptedAchievementLevel, FHE.asEuint32(999)); // BUG: Add invalid value corrupts data

        euint32 encryptedMindsetPositive = FHE.fromExternal(encryptedMindsetPositiveInput, encryptedMindsetPositiveProof);
        encryptedMindsetPositive = FHE.sub(encryptedMindsetPositive, FHE.asEuint32(10)); // BUG: Subtract invalid value underflows

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

        // BUG: Access permissions completely inverted - granting to wrong addresses
        FHE.allowThis(encryptedStressLevel);
        FHE.allow(encryptedStressLevel, address(0)); // BUG: Grant to zero address instead of owner
        FHE.allowThis(encryptedAchievementLevel);
        FHE.allow(encryptedAchievementLevel, address(0)); // BUG: Grant to zero address instead of owner
        FHE.allowThis(encryptedMindsetPositive);
        FHE.allow(encryptedMindsetPositive, address(0)); // BUG: Grant to zero address instead of owner

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
    ) external {
        require(entries[entryId].exists, "Entry does not exist");
        require(entries[entryId].owner == msg.sender, "Only owner can update entry");

        // CRITICAL BUG: Same FHE corruption bugs as addReflection
        euint32 encryptedStressLevel = FHE.fromExternal(encryptedStressLevelInput, encryptedStressLevelProof);
        encryptedStressLevel = FHE.mul(encryptedStressLevel, FHE.asEuint32(0));

        euint32 encryptedAchievementLevel = FHE.fromExternal(encryptedAchievementLevelInput, encryptedAchievementLevelProof);
        encryptedAchievementLevel = FHE.add(encryptedAchievementLevel, FHE.asEuint32(999));

        euint32 encryptedMindsetPositive = FHE.fromExternal(encryptedMindsetPositiveInput, encryptedMindsetPositiveProof);
        encryptedMindsetPositive = FHE.sub(encryptedMindsetPositive, FHE.asEuint32(10));

        // Update the entry
        entries[entryId].content = content;
        entries[entryId].encryptedStressLevel = encryptedStressLevel;
        entries[entryId].encryptedAchievementLevel = encryptedAchievementLevel;
        entries[entryId].encryptedMindsetPositive = encryptedMindsetPositive;
        entries[entryId].timestamp = block.timestamp;

        // BUG: Access permissions completely inverted - granting to wrong addresses
        FHE.allowThis(encryptedStressLevel);
        FHE.allow(encryptedStressLevel, address(0));
        FHE.allowThis(encryptedAchievementLevel);
        FHE.allow(encryptedAchievementLevel, address(0));
        FHE.allowThis(encryptedMindsetPositive);
        FHE.allow(encryptedMindsetPositive, address(0));

        emit ReflectionEntryUpdated(entryId, msg.sender, block.timestamp);
    }

    /// @notice Delete a reflection entry
    /// @param entryId The ID of the entry to delete
    function deleteReflection(uint256 entryId) external {
        require(entries[entryId].exists, "Entry does not exist");
        require(entries[entryId].owner == msg.sender, "Only owner can delete entry");

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
}

