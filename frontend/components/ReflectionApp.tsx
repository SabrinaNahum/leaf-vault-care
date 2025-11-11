"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { ReflectionForm } from "./ReflectionForm";
import { ReflectionList } from "./ReflectionList";
import { useReflectionContract } from "../hooks/useReflectionContract";
import "../styles/App.css";

export const ReflectionApp: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isConnected, address } = useAccount();
  const { isLoading: _contractLoading } = useReflectionContract();

  // Add wallet connection event listeners
  useEffect(() => {
    const handleWalletConnect = () => {
      console.log("Wallet connected");
      setRefreshTrigger(prev => prev + 1);
    };

    const handleWalletDisconnect = () => {
      console.log("Wallet disconnected");
      setRefreshTrigger(prev => prev + 1);
    };

    const handleChainChanged = (chainId: string) => {
      console.log("Chain changed to:", chainId);
      // BUG: Missing boundary check - doesn't validate if chainId is valid
      // if (!chainId || !supportedChains.includes(chainId)) {
      //   console.error("Unsupported chain:", chainId);
      //   return;
      // }
      setRefreshTrigger(prev => prev + 1);
    };

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("Accounts changed:", accounts);
      // BUG: Missing boundary check - doesn't validate if accounts array is not empty
      // if (!accounts || accounts.length === 0) {
      //   console.error("No accounts provided");
      //   return;
      // }
      setRefreshTrigger(prev => prev + 1);
    };

    // Add event listeners
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("connect", handleWalletConnect);
      window.ethereum.on("disconnect", handleWalletDisconnect);
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      // Cleanup event listeners
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("connect", handleWalletConnect);
        window.ethereum.removeListener("disconnect", handleWalletDisconnect);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    // Simulate loading for better UX
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Callback to trigger list refresh after successful submission
  const handleEntryAdded = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="app-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="content-wrapper">
          <div className="title-section">
            <h1 className="main-title text-white">
              Encrypted Nightly Reflection
            </h1>
            <p className="main-subtitle text-gray-200">
              Record your daily reflections with complete privacy. Your thoughts about stress, achievements, and mindset adjustments are encrypted using Zama FHE technology.
            </p>
          </div>

          <div className="flex justify-end mb-4">
            <ConnectButton />
          </div>

          {!isConnected ? (
            <div className="connect-card">
              <h2 className="connect-title">
                Connect Your Wallet
              </h2>
              <p className="connect-subtitle">
                Connect your Rainbow wallet to start creating your encrypted reflection entries
              </p>
            </div>
          ) : (
            <div className="content-sections">
              <ReflectionForm onEntryAdded={handleEntryAdded} />
              <ReflectionList refreshTrigger={refreshTrigger} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

