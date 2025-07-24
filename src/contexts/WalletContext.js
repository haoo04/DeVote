import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { message } from 'antd';
import * as contractUtils from '../utils/contractUtils';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');

  // Check wallet connection status
  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  // Update balance
  useEffect(() => {
    if (account && provider) {
      updateBalance();
    }
  }, [account, provider]);

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          setProvider(provider);
          setSigner(signer);
          setAccount(accounts[0].address);
          setChainId(network.chainId.toString());
        }
      }
    } catch (error) {
      console.error('Check connection status failed:', error);
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      message.error('Please install MetaMask wallet');
      return false;
    }

    setIsConnecting(true);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(network.chainId.toString());

      message.success('Wallet connected successfully');
      return true;
    } catch (error) {
      console.error('Connect to MetaMask failed:', error);
      message.error('Connect to wallet failed');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWalletConnect = async () => {
    try {
      // Here can integrate WalletConnect v2
      message.info('WalletConnect development in progress...');
      return false;
    } catch (error) {
      console.error('Connect to WalletConnect failed:', error);
      message.error('Connect to WalletConnect failed');
      return false;
    }
  };

  const disconnect = async () => {
    try {
      setAccount(null);
      setProvider(null);
      setSigner(null);
      setChainId(null);
      setBalance('0');
      message.success('Wallet disconnected');
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const updateBalance = async () => {
    try {
      if (account && provider) {
        const balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(balance));
      }
    } catch (error) {
      console.error('Get balance failed:', error);
    }
  };

  const switchToEthereum = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Mainnet
      });
    } catch (error) {
      console.error('Switch network failed:', error);
      message.error('Switch to Ethereum mainnet failed');
    }
  };

  const addEthereumChain = async (chainConfig) => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [chainConfig],
      });
    } catch (error) {
      console.error('Add network failed:', error);
      message.error('Add network failed');
    }
  };

  // Event handlers
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = (chainId) => {
    setChainId(chainId);
    window.location.reload(); // Suggest reload page
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // Format address display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check if it's the correct network
  const isCorrectNetwork = () => {
    // Support Ethereum mainnet and local test networks
    const supportedChains = [
      '1', '0x1',        // Ethereum mainnet
      '31337', '0x7a69', // Local test network (Hardhat)
      '1337', '0x539'    // Local test network (Ganache)
    ];
    return supportedChains.includes(chainId);
  };

  // Switch to local test network
  const switchToLocalNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }], // 31337 in hex
      });
    } catch (error) {
      // If the network does not exist, try to add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7a69',
              chainName: 'Hardhat Local',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['http://127.0.0.1:8545'],
              blockExplorerUrls: null
            }]
          });
        } catch (addError) {
          console.error('Add local network failed:', addError);
          message.error('Add local network failed');
        }
      } else {
        console.error('Switch network failed:', error);
        message.error('Switch to local network failed');
      }
    }
  };

  // Get network name
  const getNetworkName = () => {
    switch (chainId) {
      case '1':
      case '0x1':
        return 'Ethereum mainnet';
      case '31337':
      case '0x7a69':
        return 'Hardhat local network';
      case '1337':
      case '0x539':
        return 'Ganache local network';
      default:
        return 'Unknown network';
    }
  };

  // Contract interaction functions
  const contractOperations = {
    // Create vote
    createVote: async (voteData) => {
      if (!account) {
        message.error('Please connect wallet');
        return { success: false, error: 'Wallet not connected' };
      }
      
      if (!isCorrectNetwork()) {
        message.error('Please switch to the correct network');
        return { success: false, error: 'Network error' };
      }
      
      return await contractUtils.createVote(voteData);
    },
    
    // Participate in voting
    castVote: async (voteId, choices) => {
      if (!account) {
        message.error('Please connect wallet');
        return { success: false, error: 'Wallet not connected' };
      }
      
      if (!isCorrectNetwork()) {
        message.error('Please switch to the correct network');
        return { success: false, error: 'Network error' };
      }
      
      return await contractUtils.castVote(voteId, choices);
    },
    
    // End voting
    endVote: async (voteId) => {
      if (!account) {
        message.error('Please connect wallet');
        return { success: false, error: 'Wallet not connected' };
      }
      
      if (!isCorrectNetwork()) {
        message.error('Please switch to the correct network');
        return { success: false, error: 'Network error' };
      }
      
      return await contractUtils.endVote(voteId);
    },
    
    // Cancel voting
    cancelVote: async (voteId) => {
      if (!account) {
        message.error('Please connect wallet');
        return { success: false, error: 'Wallet not connected' };
      }
      
      if (!isCorrectNetwork()) {
        message.error('Please switch to the correct network');
        return { success: false, error: 'Network error' };
      }
      
      return await contractUtils.cancelVote(voteId);
    },
    
    // Get vote information
    getVoteInfo: contractUtils.getVoteInfo,
    getAllVoteIds: contractUtils.getAllVoteIds,
    getUserCreatedVotes: contractUtils.getUserCreatedVotes,
    getUserParticipatedVotes: contractUtils.getUserParticipatedVotes,
    hasUserVoted: contractUtils.hasUserVoted,
    getUserVoteChoices: contractUtils.getUserVoteChoices,
    canUserVote: contractUtils.canUserVote,
    autoEndExpiredVotes: contractUtils.autoEndExpiredVotes,
  };

  const value = {
    // State
    account,
    provider,
    signer,
    isConnecting,
    chainId,
    balance,
    
    // Methods
    connectMetaMask,
    connectWalletConnect,
    disconnect,
    updateBalance,
    switchToEthereum,
    switchToLocalNetwork,
    addEthereumChain,
    formatAddress,
    isCorrectNetwork,
    getNetworkName,
    
    // Computed properties
    isConnected: !!account,
    
    // Contract interaction
    contractOperations,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider; 