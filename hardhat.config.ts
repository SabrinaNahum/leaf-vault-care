import "@fhevm/hardhat-plugin";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import type { HardhatUserConfig } from "hardhat/config";
import { vars } from "hardhat/config";
import "solidity-coverage";

import "./tasks/accounts";

// Run 'npx hardhat vars setup' to see the list of variables that need to be set

const MNEMONIC: string = vars.get("MNEMONIC", "test test test test test test test test test test test junk");
const INFURA_API_KEY: string = vars.get("INFURA_API_KEY", "b18fb7e6ca7045ac83c41157ab93f990");
const PRIVATE_KEY: string = vars.get("PRIVATE_KEY", "1299e612ebfd000683a22a4d49ec56dd8425ee5c8078305efe8b7b393771cc1b");

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: 0,
  },
  etherscan: {
    apiKey: {
      sepolia: vars.get("ETHERSCAN_API_KEY", ""),
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: MNEMONIC,
      },
      chainId: 31337,
    },
    anvil: {
      accounts: {
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0/",
        count: 10,
      },
      chainId: 31337,
      url: "http://localhost:8545",
    },
    sepolia: {
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    },
    localhost: {
      accounts: {
        mnemonic: MNEMONIC,
      },
      chainId: 31337,
      url: "http://127.0.0.1:8545",
    },
    mainnet: {
      accounts: [PRIVATE_KEY],
      chainId: 1,
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      gasPrice: 20000000000, // 20 gwei
    },
    polygon: {
      accounts: [PRIVATE_KEY],
      chainId: 137,
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      gasPrice: 40000000000, // 40 gwei
    },
    polygonMumbai: {
      accounts: [PRIVATE_KEY],
      chainId: 80001,
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`,
    },
    arbitrum: {
      accounts: [PRIVATE_KEY],
      chainId: 42161,
      url: `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    },
    arbitrumGoerli: {
      accounts: [PRIVATE_KEY],
      chainId: 421613,
      url: `https://arbitrum-goerli.infura.io/v3/${INFURA_API_KEY}`,
    },
    optimism: {
      accounts: [PRIVATE_KEY],
      chainId: 10,
      url: `https://optimism-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    },
    optimismGoerli: {
      accounts: [PRIVATE_KEY],
      chainId: 420,
      url: `https://optimism-goerli.infura.io/v3/${INFURA_API_KEY}`,
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.27",
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/hardhat-template/issues/31
        bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
      viaIR: true,
      evmVersion: "cancun",
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
};

export default config;

