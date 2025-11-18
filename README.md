# Encrypted Nightly Reflection

<div align="center">

![Encrypted Nightly Reflection](https://img.shields.io/badge/FHE-Powered-blue?style=for-the-badge&logo=ethereum)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)

*A fully homomorphic encryption (FHE) enabled dApp for storing encrypted nightly reflection entries on the blockchain*

[Live Demo](https://encrypted-nightly-reflection.vercel.app/) • [Smart Contract](https://sepolia.etherscan.io/address/0x...) • [Documentation](./docs/)

</div>

## 🌟 Overview

Encrypted Nightly Reflection is a revolutionary privacy-first journaling application that leverages **Zama FHEVM** (Fully Homomorphic Encryption Virtual Machine) to provide users with complete confidentiality for their personal reflections. Unlike traditional journaling apps, your thoughts remain encrypted throughout their entire lifecycle - from creation to storage to retrieval.

### 🎯 Core Mission

To empower users with a journaling experience that prioritizes **mental privacy** while maintaining the benefits of structured self-reflection and data-driven insights about personal growth.

## ✨ Key Features

### 🔐 Privacy & Security

- **Fully Homomorphic Encryption (FHE)**: All reflection data is encrypted using Zama FHEVM
- **Zero-Knowledge Architecture**: Only you can decrypt and view your personal reflections
- **End-to-End Encryption**: Data remains encrypted from client to blockchain to client
- **No Trusted Third Parties**: Direct blockchain interaction without intermediaries

### 💫 User Experience

- **Intuitive Interface**: Clean, modern UI with real-time feedback
- **Contextual Messages**: Get personalized insights based on your reflection levels
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Rainbow Wallet Integration**: Seamless Web3 wallet connection
- **Real-time Analytics**: Encrypted statistical insights about your journey

### 🔧 Technical Excellence

- **Smart Contract**: Solidity contract with FHE-enabled encrypted storage
- **Type Safety**: Full TypeScript support with strict type checking
- **Comprehensive Testing**: Test coverage including Sepolia integration tests
- **Multi-Network**: Deployable to localhost, testnets, and mainnet
- **Performance Optimized**: Compiler optimizations and efficient gas usage

### 📊 Reflection Metrics

- **Stress Level**: Track daily stress from 0-100 with contextual feedback
- **Achievement Level**: Monitor daily accomplishments and progress
- **Mindset Adjustment**: Record mental state improvements and changes
- **Encrypted Analytics**: View total reflections count (encrypted computation)

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher
- **Git**: For version control

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SabrinaNahum/encrypted-nightly-reflection.git
cd encrypted-nightly-reflection
```

2. **Install dependencies**
```bash
npm install
cd frontend
npm install
cd ..
```

3. **Set up environment variables**
```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY
```

4. **Compile contracts**
```bash
npm run compile
```

5. **Run tests**
```bash
npm run test
```

6. **Deploy to local network**
```bash
# Terminal 1: Start local FHEVM-ready node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat deploy --network localhost
```

7. **Generate ABI files**
```bash
cd frontend
npm run genabi
cd ..
```

8. **Start frontend development server**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to access the application!

## 📁 Project Structure

```
encrypted-nightly-reflection/
├── contracts/                     # Smart contract source files
│   └── EncryptedNightlyReflection.sol
├── config/                        # Network and environment configuration
│   └── networks.ts
├── deploy/                        # Deployment scripts and configurations
├── deployments/                   # Deployed contract addresses
│   ├── localhost/
│   └── sepolia/
├── frontend/                      # Next.js frontend application
│   ├── app/                      # Next.js app router
│   │   ├── globals.css           # Global styles and animations
│   │   ├── layout.tsx            # Root layout component
│   │   └── page.tsx              # Main application page
│   ├── components/               # React components
│   │   ├── BaseComponents.tsx    # Reusable UI components
│   │   ├── ReflectionApp.tsx     # Main application component
│   │   ├── ReflectionForm.tsx    # Form for creating reflections
│   │   ├── ReflectionList.tsx    # List of user reflections
│   │   └── DataVisualization.tsx # Analytics and visualization
│   ├── fhevm/                    # FHEVM integration utilities
│   ├── hooks/                    # Custom React hooks
│   └── styles/                   # Component-specific styles
├── test/                         # Test files and configurations
├── types/                        # TypeScript type definitions
├── artifacts/                    # Compiled contract artifacts
├── cache/                        # Hardhat compilation cache
└── fhevmTemp/                    # FHEVM temporary files
```

## 🏗️ Architecture

### Smart Contract Layer

The `EncryptedNightlyReflection` contract implements:

- **Encrypted Storage**: FHE-enabled data structures for private storage
- **Access Control**: Owner-based permissions with encrypted verification
- **Event Logging**: Comprehensive event emission for frontend integration
- **Gas Optimization**: Efficient operations for cost-effective interactions

**Key Functions:**
- `addReflection()`: Store encrypted reflection entries
- `getEntry()`: Retrieve encrypted entry data
- `decryptEntry()`: Client-side decryption with FHE
- `transferEntryOwnership()`: Transfer entry ownership
- `getEncryptedTotalEntries()`: Encrypted analytics computation

### Frontend Architecture

Built with modern React patterns:

- **Component Architecture**: Modular, reusable components
- **Custom Hooks**: Encapsulated business logic (useReflectionContract, useFhevm)
- **State Management**: React hooks with Wagmi for Web3 integration
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### FHE Integration

- **Zama FHEVM**: Homomorphic encryption virtual machine
- **Client-Side Encryption**: Browser-based encryption before blockchain submission
- **Decryption Workflow**: Secure key management and signature verification
- **Privacy Preservation**: Zero-knowledge operations maintain confidentiality

## 🌐 Supported Networks

| Network | Chain ID | FHE Support | Status |
|---------|----------|-------------|--------|
| Sepolia | 11155111 | ✅ | Production Ready |
| Hardhat | 31337 | ✅ | Development |
| Localhost | 31337 | ✅ | Development |
| Mainnet | 1 | ❌ | Planned |
| Polygon | 137 | ❌ | Planned |
| Arbitrum | 42161 | ❌ | Planned |
| Optimism | 10 | ❌ | Planned |

## 🧪 Testing

### Local Testing

```bash
# Run all tests
npm run test

# Run with gas reporting
REPORT_GAS=true npm run test

# Run specific test file
npx hardhat test test/EncryptedNightlyReflection.ts
```

### Sepolia Integration Testing

```bash
# Deploy to Sepolia first
npx hardhat deploy --network sepolia

# Run Sepolia tests
npm run test:sepolia
```

### Test Coverage

```bash
# Generate coverage report
npm run coverage
```

## 📊 Analytics & Insights

The application provides encrypted analytics including:

- **Personal Trends**: Track stress and achievement patterns over time
- **Mindset Analysis**: Positive mindset ratio and improvement tracking
- **Activity Metrics**: Reflection frequency and consistency insights
- **Privacy-Preserving**: All analytics computed on encrypted data

## 🔒 Security Considerations

- **Encryption**: All user data encrypted with FHE before blockchain storage
- **Key Management**: Client-side key generation and secure storage
- **Access Control**: Smart contract level permissions
- **Audit Trail**: Comprehensive event logging for transparency
- **Network Security**: Multi-network support with secure RPC endpoints

## 🚀 Deployment

### Local Development

```bash
npx hardhat deploy --network localhost
```

### Testnet Deployment

```bash
npx hardhat deploy --network sepolia
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Production Deployment

```bash
npx hardhat deploy --network mainnet
npx hardhat verify --network mainnet <CONTRACT_ADDRESS>
```

## 📚 API Reference

### Smart Contract Functions

#### Writing Functions
- `addReflection(content, stressLevel, achievementLevel, mindsetPositive)` - Add new reflection
- `updateReflection(entryId, ...)` - Update existing reflection
- `deleteReflection(entryId)` - Delete reflection entry
- `transferEntryOwnership(entryId, newOwner)` - Transfer ownership

#### Reading Functions
- `getEntry(entryId)` - Get encrypted entry data
- `getUserEntries(user)` - Get user's entry IDs
- `getEntryStressLevel(entryId)` - Get encrypted stress level
- `getEncryptedTotalEntries()` - Get encrypted total count

### Frontend Hooks

- `useReflectionContract()` - Main contract interaction hook
- `useFhevm()` - FHEVM integration and status
- `useInMemoryStorage()` - Local storage management

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes with tests
4. Run the test suite: `npm test`
5. Submit a pull request

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear** license - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama** for the revolutionary FHEVM technology
- **Ethereum Foundation** for the robust blockchain infrastructure
- **Rainbow** for the excellent wallet integration toolkit
- **Open-source community** for the foundational tools and libraries

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/SabrinaNahum/encrypted-nightly-reflection/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SabrinaNahum/encrypted-nightly-reflection/discussions)
- **Discord**: [Join our community](https://discord.gg/zama)

---

<div align="center">

**Built with ❤️ using Zama FHEVM**

## 🎬 Demo Video

Watch the full demonstration of Encrypted Nightly Reflection:

[![Encrypted Nightly Reflection Demo](./demo-video.mp4)](./demo-video.mp4)

*Note: Click the image above to play the demo video locally, or [view on GitHub](https://github.com/SabrinaNahum/encrypted-nightly-reflection/blob/main/demo-video.mp4)*

---

*Empowering mental privacy through cryptography*

</div>

