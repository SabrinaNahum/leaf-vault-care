# Encrypted Nightly Reflection

A confidential reflection journal built with Zama FHE (Fully Homomorphic Encryption) technology. This application allows users to record their nightly reflections with complete privacy - thoughts about stress, achievements, and mindset adjustments are encrypted on-chain.

## Features

- **Encrypted Storage**: All reflection data is encrypted using Zama FHE technology
- **Privacy-First**: Your reflections are encrypted and only you can decrypt them
- **Rainbow Wallet Integration**: Easy wallet connection using Rainbow wallet
- **Beautiful UI**: Modern, clean interface inspired by best practices
- **On-Chain Storage**: Reflections are stored on the blockchain with encrypted data
- **Real-time Decryption**: View your encrypted reflections with one-click decryption
- **User Analytics**: Track your reflection patterns and mindset trends over time

## Project Structure

```
pro30/
├── contracts/          # Solidity smart contracts
├── test/              # Test files
├── deploy/            # Deployment scripts
├── frontend/          # Next.js frontend application
└── tasks/             # Hardhat tasks
```

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 7.0.0

### Installation

1. Install dependencies:

```bash
npm install
cd frontend
npm install
```

2. Compile contracts:

```bash
npm run compile
```

3. Run tests:

```bash
npm test
```

4. Deploy contracts (localhost):

```bash
npx hardhat node
# In another terminal:
npx hardhat deploy --network localhost
```

5. Generate ABI files:

```bash
cd frontend
npm run genabi
```

6. Start frontend:

```bash
cd frontend
npm run dev
```

## Contract

The `EncryptedNightlyReflection` contract stores encrypted reflection entries with:
- Encrypted content (ebytes32)
- Encrypted stress level (euint32, 0-100)
- Encrypted achievement level (euint32, 0-100)
- Encrypted mindset boolean (ebool)

## Frontend

The frontend is built with:
- Next.js 15
- React 19
- Rainbow Wallet (RainbowKit)
- Wagmi
- Tailwind CSS

## Testing

Run local tests:
```bash
npm test
```

Run Sepolia tests:
```bash
npm run test:sepolia
```

## License

BSD-3-Clause-Clear

