# DeVote Deployment Guideline

## Project Overview
DeVote is a decentralized voting platform based on Ethereum that supports creating, managing, and participating in voting.

## Prerequisites

1. **Node.js** (v16 or higher)

2. **npm** or **yarn**

3. **MetaMask** browser extension

## Quick Start

### 1. Start a local blockchain node

```bash
# Start the Hardhat local node
npx hardhat node
```

This will start a local Ethereum node running at `http://127.0.0.1:8545` with 20 test accounts.

### 2. Compile smart contract

```bash
# Compile the contract
npm run hardhat:compile
```

### 3. Deploy smart contracts

```bash
# Deploy to local network
npm run hardhat:deploy
```

After successful deployment, the contract address and ABI will be automatically exported to the `src/contracts/` directory.

### 4. Start the front-end application

```bash
# Start the React application
npm start
```

The application will start at `http://localhost:3000`.

## Configure MetaMask

### 1. Add local network

Add the following network configuration in MetaMask:

- **Network Name**: Hardhat Local
- **RPC URL**: http://127.0.0.1:8545
- **Chain ID**: 1337
- **Currency Symbol**: ETH

### 2. Import the test account

Use the test account private key provided by Hardhat to import the account:

```
Test mnemonics: test test test test test test test test test test test junk
```

Or use a specific private key (obtained from the hardhat node output).

## Smart contract function

### Core function

1. **Create vote**
- Single or multiple choice voting
- Set start and end time
- Support public or private voting
- Permission control

2. **Participate in voting**
- Real-time voting
- Anti-duplicate voting
- Voting verification

3. **Voting management**
- View voting details
- Get voting results
- End or cancel voting

### Main function

- `createVote()`: Create a new vote
- `castVote()`: Participate in voting
- `getVoteInfo()`: Get voting information
- `getVoteResults()`: Get voting results
- `endVote()`: End voting
- `cancelVote()`: Cancel voting

## Front-end integration

### Wallet connection

The application supports connecting to wallets through MetaMask and automatically detects the network.

### Contract Interaction

Interact with smart contracts through the tool functions provided by `src/utils/contractUtils.js`.

### State Management

Use `src/contexts/WalletContext.js` to manage wallet status and contract operations.

## Development commands

```bash
# Compile contracts
npm run hardhat:compile

# Start local node
npm run hardhat:node

# Deploy contracts to local network
npm run hardhat:deploy

# Run contract tests
npm run hardhat:test

# Start front-end application
npm start
```

## Test

### Smart contract test

```bash
# Run all tests
npm run hardhat:test

# Run specific test files
npx hardhat test test/DeVote.js
```

### Functional test process

1. Connect MetaMask wallet
2. Switch to local test network
3. Create test votes
4. Use different accounts to participate in voting
5. View voting results

## Frequently asked questions

### Q: Contract not deployed error
A: Make sure you have run `npm run hardhat:deploy` to deploy the contract

### Q: MetaMask connection failed
A: Check if MetaMask is installed and connected to the correct network

### Q: Transaction failed
A: Make sure the account has enough ETH for gas fees

### Q: Network error
A: Make sure the Hardhat node is running and MetaMask is connected to the correct network

## Security precautions

1. This project is for learning and testing only
2. Do not use test private keys in a production environment
3. Please test thoroughly before deploying to the mainnet
4. Consider implementing additional security measures