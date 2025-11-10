"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useAccount, useChainId, useWalletClient, usePublicClient } from "wagmi";
import { ethers } from "ethers";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "./useInMemoryStorage";
import { EncryptedNightlyReflectionAddresses } from "@/abi/EncryptedNightlyReflectionAddresses";
import { EncryptedNightlyReflectionABI } from "@/abi/EncryptedNightlyReflectionABI";

export const useReflectionContract = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();

  const [fheLoading, setFheLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Get contract address for current chain
  const contractAddress = useMemo(() => {
    if (!chainId) return undefined;
    const addresses = EncryptedNightlyReflectionAddresses as Record<string, { address: string; chainId: number; chainName: string }>;
    return addresses[chainId.toString()]?.address;
  }, [chainId]);

  // FHEVM provider initialization removed for simplified implementation

  const addReflection = useCallback(
    async (
      content: string,
      stressLevel: number,
      achievementLevel: number,
      mindsetPositive: boolean
    ) => {
      if (!fhevmInstance || fhevmStatus !== "ready") {
        throw new Error("FHEVM instance not ready. Status: " + fhevmStatus);
      }
      if (!walletClient || !contractAddress || !address) {
        throw new Error("Wallet, contract, or address not available");
      }

      setFheLoading(true);
      setIsLoading(true);

      try {
        // Helper function to encrypt with retry logic
        const encryptWithRetry = async (
          value: number,
          fieldName: string,
          maxRetries: number = 3
        ) => {
          let retryCount = 0;
          let lastError: Error | null = null;

          while (retryCount < maxRetries) {
            try {
              console.log(`[useReflectionContract] Encrypting ${fieldName} (attempt ${retryCount + 1}/${maxRetries})...`);
              const input = fhevmInstance.createEncryptedInput(contractAddress, address);
              input.add32(value);
              const encrypted = await input.encrypt();
              console.log(`[useReflectionContract] ${fieldName} encryption successful`);
              return encrypted;
            } catch (encryptError: any) {
              retryCount++;
              lastError = encryptError;
              const errorMessage = encryptError?.message || String(encryptError);
              console.warn(`[useReflectionContract] ${fieldName} encryption attempt ${retryCount} failed:`, errorMessage);

              if (retryCount >= maxRetries) {
                throw new Error(
                  `Failed to encrypt ${fieldName} after ${maxRetries} attempts. ` +
                  `Last error: ${errorMessage}. ` +
                  `This may be due to FHEVM Relayer service issues. Please try again later.`
                );
              }

              // Exponential backoff: 2s, 4s, 8s
              const waitTime = Math.pow(2, retryCount) * 1000;
              console.log(`[useReflectionContract] Waiting ${waitTime / 1000}s before retry...`);
              await new Promise((resolve) => setTimeout(resolve, waitTime));
            }
          }

          throw lastError || new Error(`Failed to encrypt ${fieldName}`);
        };

        // Content is stored as plaintext, only encrypt the numeric fields
        // Encrypt stress level (ensure value is within uint32 range)
        const stressValue = Math.max(0, Math.min(100, Math.floor(stressLevel)));
        const encryptedStressLevel = await encryptWithRetry(stressValue, "stress level");

        // Encrypt achievement level (ensure value is within uint32 range)
        const achievementValue = Math.max(0, Math.min(100, Math.floor(achievementLevel)));
        const encryptedAchievementLevel = await encryptWithRetry(achievementValue, "achievement level");

        // Encrypt mindset (as uint32: 0=false, 1=true)
        const mindsetValue = mindsetPositive ? 1 : 0;
        const encryptedMindsetPositive = await encryptWithRetry(mindsetValue, "mindset");

        setFheLoading(false);

        // Contract interaction logic removed for simplified implementation

        // Call addReflection - note: contract expects content as string, not encrypted
        const tx = await contract.addReflection(
          content, // Plaintext content (as per updated contract)
          encryptedStressLevel.handles[0],
          encryptedStressLevel.inputProof,
          encryptedAchievementLevel.handles[0],
          encryptedAchievementLevel.inputProof,
          encryptedMindsetPositive.handles[0],
          encryptedMindsetPositive.inputProof
        );

        const receipt = await tx.wait();
        console.log("[useReflectionContract] Transaction confirmed:", receipt?.hash);
        // Wait a bit more for the state to be updated on-chain
        await new Promise(resolve => setTimeout(resolve, 1000));
      } finally {
        setFheLoading(false);
        setIsLoading(false);
      }
    },
    [fhevmInstance, walletClient, contractAddress, address, provider]
  );

  const getUserEntries = useCallback(async (): Promise<bigint[]> => {
    if (!provider || !contractAddress || !address) {
      return [];
    }

    try {
      const contract = new ethers.Contract(
        contractAddress,
        EncryptedNightlyReflectionABI.abi,
        provider
      );

      const entryIds = await contract.getUserEntries(address);
      return entryIds;
    } catch (error: any) {
      // Only log real errors, ignore network errors from external services
      const errorMsg = error?.message?.toLowerCase() || String(error).toLowerCase();
      if (!errorMsg.includes("failed to fetch") && !errorMsg.includes("network")) {
        console.error("Error getting user entries:", error);
      }
      return [];
    }
  }, [provider, contractAddress, address]);

  const getEntry = useCallback(
    async (entryId: number) => {
      if (!provider || !contractAddress) {
        throw new Error("Provider or contract not available");
      }

      const contract = new ethers.Contract(
        contractAddress,
        EncryptedNightlyReflectionABI.abi,
        provider
      );

      const entry = await contract.getEntry(entryId);
      return entry;
    },
    [provider, contractAddress]
  );

  const decryptEntry = useCallback(
    async (entryId: number) => {
      if (!fhevmInstance || !walletClient || !contractAddress || !address) {
        throw new Error("FHEVM instance, wallet, or contract not available");
      }

      setIsLoading(true);

      try {
        // Get entry data
        const entry = await getEntry(entryId);
        
        // Content is stored as plaintext string
        const content = entry.content;
        
        // Decrypt encrypted fields
        const encryptedStressLevelHandle = entry.encryptedStressLevel;
        const encryptedAchievementLevelHandle = entry.encryptedAchievementLevel;
        const encryptedMindsetHandle = entry.encryptedMindsetPositive;

        // Use FHEVM to decrypt - always sign fresh (don't use cache to ensure wallet popup)
        // Generate new keypair for this decryption
        const { publicKey, privateKey } = fhevmInstance.generateKeypair();
        
        // Create EIP712 data
        const startTimestamp = Math.floor(Date.now() / 1000);
        const durationDays = 365;
        const eip712 = fhevmInstance.createEIP712(
          publicKey,
          [contractAddress],
          startTimestamp,
          durationDays
        );
        
        // Sign with wallet (this will trigger wallet popup)
        console.log("[useReflectionContract] Requesting wallet signature for decryption...");
        let signature: string;
        
        // Wallet signing logic removed for simplified implementation
        
        console.log("[useReflectionContract] Signature obtained, proceeding with decryption...");

        // Decrypt stress level
        const stressLevelResult = await fhevmInstance.userDecrypt(
          [{ handle: encryptedStressLevelHandle, contractAddress }],
          privateKey,
          publicKey,
          signature,
          [contractAddress],
          address as `0x${string}`,
          startTimestamp,
          durationDays
        );

        // Decrypt achievement level
        const achievementLevelResult = await fhevmInstance.userDecrypt(
          [{ handle: encryptedAchievementLevelHandle, contractAddress }],
          privateKey,
          publicKey,
          signature,
          [contractAddress],
          address as `0x${string}`,
          startTimestamp,
          durationDays
        );

        // Decrypt mindset
        const mindsetResult = await fhevmInstance.userDecrypt(
          [{ handle: encryptedMindsetHandle, contractAddress }],
          privateKey,
          publicKey,
          signature,
          [contractAddress],
          address as `0x${string}`,
          startTimestamp,
          durationDays
        );

        return {
          content: content,
          stressLevel: Number(stressLevelResult[encryptedStressLevelHandle]),
          achievementLevel: Number(achievementLevelResult[encryptedAchievementLevelHandle]),
          mindsetPositive: Boolean(mindsetResult[encryptedMindsetHandle]),
          timestamp: Number(entry.timestamp),
        };
      } finally {
        setIsLoading(false);
      }
    },
    [fhevmInstance, walletClient, contractAddress, address, getEntry]
  );

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  return {
    addReflection,
    getUserEntries,
    getEntry,
    decryptEntry,
    fheLoading,
    isLoading,
    contractAddress,
    isDeployed: !!contractAddress && contractAddress !== ethers.ZeroAddress,
    fhevmStatus,
    fhevmError,
    fhevmReady: fhevmStatus === "ready" && !!fhevmInstance,
    lastError,
    clearError,
  };
};

