"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia, hardhat } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";
import { InMemoryStorageProvider } from "@/hooks/useInMemoryStorage";

const config = getDefaultConfig({
  appName: "Encrypted Nightly Reflection",
  projectId: "encrypted-nightly-reflection",
  chains: [
    {
      ...sepolia,
      rpcUrls: {
        default: { http: ['https://rpc.sepolia.org'] },
        public: { http: ['https://rpc.sepolia.org'] },
      },
    },
    hardhat
  ],
  ssr: false, // Disable SSR to avoid indexedDB issues
});

const queryClient = new QueryClient();

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Suppress non-critical errors from external services
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const errorString = args.join(' ').toLowerCase();
      // Filter out non-critical errors
      if (
        errorString.includes('failed to fetch') ||
        errorString.includes('analytics') ||
        errorString.includes('walletconnect') ||
        errorString.includes('web3modal') ||
        errorString.includes('coinbase') ||
        errorString.includes('cca-lite') ||
        errorString.includes('pulse.walletconnect') ||
        errorString.includes('api.web3modal') ||
        errorString.includes('blocked by response') ||
        errorString.includes('fhevmaborterror') ||
        errorString.includes('relayer.testnet.zama.cloud') ||
        errorString.includes('relayersdk') ||
        errorString.includes('threads') ||
        errorString.includes('cross-origin') ||
        errorString.includes('cors') ||
        errorString.includes('rpc.thirdweb.com') ||
        errorString.includes('connection closed') ||
        errorString.includes('err_connection_closed') ||
        errorString.includes('jsonrpcprovider failed') ||
        errorString.includes('network detection') ||
        errorString.includes('err_failed')
      ) {
        // Suppress these errors - they don't affect functionality
        return;
      }
      // Log other errors normally
      originalError.apply(console, args);
    };
    
    // Suppress unhandled promise rejections from external services
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorString = String(event.reason || event).toLowerCase();
      if (
        errorString.includes('failed to fetch') ||
        errorString.includes('analytics') ||
        errorString.includes('walletconnect') ||
        errorString.includes('web3modal') ||
        errorString.includes('coinbase') ||
        errorString.includes('cca-lite') ||
        errorString.includes('blocked by response') ||
        errorString.includes('relayer.testnet.zama.cloud') ||
        errorString.includes('rpc.thirdweb.com') ||
        errorString.includes('connection closed') ||
        errorString.includes('cors') ||
        errorString.includes('network detection')
      ) {
        event.preventDefault(); // Suppress the error
        return;
      }
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      console.error = originalError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Always render providers, but delay wallet initialization to avoid SSR issues
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <InMemoryStorageProvider>
            {children}
          </InMemoryStorageProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

