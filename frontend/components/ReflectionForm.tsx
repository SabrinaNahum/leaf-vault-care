"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useReflectionContract } from "../hooks/useReflectionContract";
import "../styles/ReflectionForm.css";

interface ReflectionFormProps {
  onEntryAdded?: () => void;
}

export const ReflectionForm: React.FC<ReflectionFormProps> = ({ onEntryAdded }) => {
  const [content, setContent] = useState("");
  const [stressLevel, setStressLevel] = useState(50);
  const [achievementLevel, setAchievementLevel] = useState(50);
  const [mindsetPositive, setMindsetPositive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [characterCount, setCharacterCount] = useState(0);
  const { address } = useAccount();
  const { addReflection, fheLoading, fhevmReady, fhevmStatus, fhevmError } = useReflectionContract();

  const handleContentChange = (value: string) => {
    setContent(value);
    setCharacterCount(value.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!content.trim()) {
      setErrorMessage("Please enter your reflection content");
      return;
    }

    if (content.length > 1000) {
      setErrorMessage("Reflection content must be less than 1000 characters");
      return;
    }

    if (!address) {
      setErrorMessage("Please connect your wallet");
      return;
    }

    setIsLoading(true);

    try {
      await addReflection(
        content.trim(),
        stressLevel,
        achievementLevel,
        mindsetPositive
      );
      setContent("");
      setStressLevel(50);
      setAchievementLevel(50);
      setMindsetPositive(true);
      setSuccessMessage("Reflection entry added successfully!");
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      // Trigger list refresh after transaction is confirmed
      if (onEntryAdded) {
        // Wait for transaction to be mined and indexed
        // Hardhat local network is fast, but we still need to wait a bit
        setTimeout(() => {
          console.log("[ReflectionForm] Triggering list refresh after entry added");
          onEntryAdded();
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error adding reflection entry:", error);
      // Only show error if it's a real contract/transaction error
      // Ignore network errors from external services (WalletConnect, analytics, etc.)
      const errorMessage = error?.message || String(error);
      const errorString = errorMessage.toLowerCase();
      
      // Filter out non-critical errors that don't affect functionality
      const ignoredErrors = [
        "failed to fetch",
        "analytics",
        "walletconnect",
        "web3modal",
        "coinbase",
        "cca-lite",
        "pulse.walletconnect",
        "api.web3modal",
        "network error",
        "cors",
        "blocked by response",
      ];
      
      const shouldIgnore = ignoredErrors.some(ignored => 
        errorString.includes(ignored)
      );
      
      if (shouldIgnore) {
        // These are external service errors, don't show to user
        // Just log to console for debugging
        console.log("Ignored non-critical error:", errorMessage);
        return;
      }
      
      // Check for FHEVM Relayer errors and provide helpful message
      if (
        errorString.includes("relayer") ||
        errorString.includes("bad json") ||
        errorString.includes("connection closed") ||
        errorString.includes("encrypt") ||
        errorString.includes("failed to encrypt")
      ) {
        setErrorMessage(
          "FHEVM Relayer service is temporarily unavailable. " +
          "This is a network issue with the encryption service. Please try again in a few moments."
        );
      } else {
        // Only show real business logic errors
        setErrorMessage("Failed to add reflection entry. Please try again.");
      }
      // Auto-hide error message after 5 seconds
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = isLoading || !content.trim() || fheLoading || !fhevmReady;

  return (
    <div className="reflection-form">
      <h2 className="reflection-form-title">
        Add New Reflection Entry
      </h2>

      <form onSubmit={handleSubmit} className="reflection-form-form">
        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded text-green-200 text-sm">
            ✓ {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
            ✗ {errorMessage}
          </div>
        )}
        <div className="reflection-form-group">
          <label htmlFor="content" className="reflection-form-label">
            Reflection Content
          </label>
          <textarea
            id="content"
            rows={6}
            className="reflection-form-textarea"
            placeholder="Write your nightly reflection here... What were your thoughts today?"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            disabled={isLoading}
            maxLength={1000}
          />
          <div className="text-xs text-gray-400 mt-1 text-right">
            {characterCount}/1000 characters
          </div>
        </div>

        <div className="reflection-form-group">
          <label htmlFor="stressLevel" className="reflection-form-label">
            Stress Level: {stressLevel}%
          </label>
          <input
            type="range"
            id="stressLevel"
            min="0"
            max="100"
            value={stressLevel}
            onChange={(e) => setStressLevel(Number(e.target.value))}
            className="reflection-form-range"
            disabled={isLoading}
          />
        </div>

        <div className="reflection-form-group">
          <label htmlFor="achievementLevel" className="reflection-form-label">
            Achievement Level: {achievementLevel}%
          </label>
          <input
            type="range"
            id="achievementLevel"
            min="0"
            max="100"
            value={achievementLevel}
            onChange={(e) => setAchievementLevel(Number(e.target.value))}
            className="reflection-form-range"
            disabled={isLoading}
          />
        </div>

        <div className="reflection-form-group">
          <label className="reflection-form-label">
            <input
              type="checkbox"
              checked={mindsetPositive}
              onChange={(e) => setMindsetPositive(e.target.checked)}
              className="reflection-form-checkbox"
              disabled={isLoading}
            />
            <span className="ml-2">Positive mindset adjustment for tomorrow</span>
          </label>
        </div>

        <div className="reflection-form-submit">
          {!fhevmReady && fhevmStatus !== "ready" && (
            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-200 text-sm">
              {fhevmStatus === "loading" && "Initializing FHE encryption..."}
              {fhevmStatus === "error" && (() => {
                const errorMsg = fhevmError?.message?.toLowerCase() || "";
                // Only show FHE errors if they're not network-related
                if (errorMsg.includes("failed to fetch") || 
                    errorMsg.includes("network") || 
                    errorMsg.includes("analytics") ||
                    errorMsg.includes("walletconnect")) {
                  return "Initializing FHE encryption...";
                }
                return `FHE initialization failed: ${fhevmError?.message || "Unknown error"}`;
              })()}
              {fhevmStatus === "idle" && "Waiting for wallet connection..."}
            </div>
          )}
          <button
            type="submit"
            disabled={isButtonDisabled}
            className={`reflection-form-button ${
              isButtonDisabled
                ? "reflection-form-button-disabled"
                : "reflection-form-button-active"
            }`}
          >
            {!fhevmReady
              ? "Initializing FHE..."
              : fheLoading
                ? "Encrypting..."
                : isLoading
                  ? "Adding Entry..."
                  : "Add Reflection Entry"}
          </button>
        </div>
      </form>
    </div>
  );
};

