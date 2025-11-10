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
  const { isConnected } = useAccount();
  const { isLoading: _contractLoading } = useReflectionContract();

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

