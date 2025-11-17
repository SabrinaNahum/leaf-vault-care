// Network configuration and utilities for multi-chain deployment

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
  supportsFHE: boolean;
  estimatedGasPrice: number;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  hardhat: {
    chainId: 31337,
    name: "Hardhat",
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorer: "",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    isTestnet: true,
    supportsFHE: true,
    estimatedGasPrice: 0,
  },
  localhost: {
    chainId: 31337,
    name: "Localhost",
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorer: "",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    isTestnet: true,
    supportsFHE: true,
    estimatedGasPrice: 0,
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia",
    rpcUrl: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY || ""}`,
    blockExplorer: "https://sepolia.etherscan.io",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    isTestnet: true,
    supportsFHE: true,
    estimatedGasPrice: 1000000000, // 1 gwei
  },
  mainnet: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY || ""}`,
    blockExplorer: "https://etherscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    isTestnet: false,
    supportsFHE: false, // FHE not yet supported on mainnet
    estimatedGasPrice: 20000000000, // 20 gwei
  },
  polygon: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY || ""}`,
    blockExplorer: "https://polygonscan.com",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    isTestnet: false,
    supportsFHE: false,
    estimatedGasPrice: 40000000000, // 40 gwei
  },
  polygonMumbai: {
    chainId: 80001,
    name: "Polygon Mumbai",
    rpcUrl: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY || ""}`,
    blockExplorer: "https://mumbai.polygonscan.com",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    isTestnet: true,
    supportsFHE: false,
    estimatedGasPrice: 1000000000, // 1 gwei
  },
  arbitrum: {
    chainId: 42161,
    name: "Arbitrum One",
    rpcUrl: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY || ""}`,
    blockExplorer: "https://arbiscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    isTestnet: false,
    supportsFHE: false,
    estimatedGasPrice: 100000000, // 0.1 gwei
  },
  arbitrumGoerli: {
    chainId: 421613,
    name: "Arbitrum Goerli",
    rpcUrl: `https://arbitrum-goerli.infura.io/v3/${process.env.INFURA_API_KEY || ""}`,
    blockExplorer: "https://goerli.arbiscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    isTestnet: true,
    supportsFHE: false,
    estimatedGasPrice: 100000000, // 0.1 gwei
  },
  optimism: {
    chainId: 10,
    name: "Optimism",
    rpcUrl: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY || ""}`,
    blockExplorer: "https://optimistic.etherscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    isTestnet: false,
    supportsFHE: false,
    estimatedGasPrice: 100000000, // 0.1 gwei
  },
  optimismGoerli: {
    chainId: 420,
    name: "Optimism Goerli",
    rpcUrl: `https://optimism-goerli.infura.io/v3/${process.env.INFURA_API_KEY || ""}`,
    blockExplorer: "https://goerli-optimism.etherscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    isTestnet: true,
    supportsFHE: false,
    estimatedGasPrice: 100000000, // 0.1 gwei
  },
};

export function getNetworkConfig(chainId: number): NetworkConfig | undefined {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
}

export function getSupportedNetworks(): NetworkConfig[] {
  return Object.values(NETWORKS);
}

export function isFHESupported(chainId: number): boolean {
  const network = getNetworkConfig(chainId);
  return network?.supportsFHE || false;
}

export function getFHENetworks(): NetworkConfig[] {
  return Object.values(NETWORKS).filter(network => network.supportsFHE);
}

export function getBlockExplorerUrl(chainId: number, txHash?: string): string {
  const network = getNetworkConfig(chainId);
  if (!network || !network.blockExplorer) return "";

  return txHash ? `${network.blockExplorer}/tx/${txHash}` : network.blockExplorer;
}
