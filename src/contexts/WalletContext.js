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

  // 检查钱包连接状态
  useEffect(() => {
    checkConnection();
    
    // 监听账户变更
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

  // 更新余额
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
      console.error('检查连接状态失败:', error);
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      message.error('请安装MetaMask钱包');
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

      message.success('钱包连接成功');
      return true;
    } catch (error) {
      console.error('连接MetaMask失败:', error);
      message.error('连接钱包失败');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWalletConnect = async () => {
    try {
      // 这里可以集成WalletConnect v2
      message.info('WalletConnect功能开发中...');
      return false;
    } catch (error) {
      console.error('连接WalletConnect失败:', error);
      message.error('连接WalletConnect失败');
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
      message.success('钱包已断开连接');
    } catch (error) {
      console.error('断开连接失败:', error);
    }
  };

  const updateBalance = async () => {
    try {
      if (account && provider) {
        const balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(balance));
      }
    } catch (error) {
      console.error('获取余额失败:', error);
    }
  };

  const switchToEthereum = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // 主网
      });
    } catch (error) {
      console.error('切换网络失败:', error);
      message.error('切换到以太坊主网失败');
    }
  };

  const addEthereumChain = async (chainConfig) => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [chainConfig],
      });
    } catch (error) {
      console.error('添加网络失败:', error);
      message.error('添加网络失败');
    }
  };

  // 事件处理器
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = (chainId) => {
    setChainId(chainId);
    window.location.reload(); // 建议重新加载页面
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // 格式化地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 检查是否为正确的网络
  const isCorrectNetwork = () => {
    // 支持以太坊主网和本地测试网络
    const supportedChains = [
      '1', '0x1',        // 以太坊主网
      '31337', '0x7a69', // 本地测试网络 (Hardhat)
      '1337', '0x539'    // 本地测试网络 (Ganache)
    ];
    return supportedChains.includes(chainId);
  };

  // 切换到本地测试网络
  const switchToLocalNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }], // 31337 in hex
      });
    } catch (error) {
      // 如果网络不存在，尝试添加它
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
          console.error('添加本地网络失败:', addError);
          message.error('添加本地网络失败');
        }
      } else {
        console.error('切换网络失败:', error);
        message.error('切换到本地网络失败');
      }
    }
  };

  // 获取网络名称
  const getNetworkName = () => {
    switch (chainId) {
      case '1':
      case '0x1':
        return '以太坊主网';
      case '31337':
      case '0x7a69':
        return 'Hardhat本地网络';
      case '1337':
      case '0x539':
        return 'Ganache本地网络';
      default:
        return '未知网络';
    }
  };

  // 合约交互功能
  const contractOperations = {
    // 创建投票
    createVote: async (voteData) => {
      if (!account) {
        message.error('请先连接钱包');
        return { success: false, error: '未连接钱包' };
      }
      
      if (!isCorrectNetwork()) {
        message.error('请切换到正确的网络');
        return { success: false, error: '网络错误' };
      }
      
      return await contractUtils.createVote(voteData);
    },
    
    // 参与投票
    castVote: async (voteId, choices) => {
      if (!account) {
        message.error('请先连接钱包');
        return { success: false, error: '未连接钱包' };
      }
      
      if (!isCorrectNetwork()) {
        message.error('请切换到正确的网络');
        return { success: false, error: '网络错误' };
      }
      
      return await contractUtils.castVote(voteId, choices);
    },
    
    // 结束投票
    endVote: async (voteId) => {
      if (!account) {
        message.error('请先连接钱包');
        return { success: false, error: '未连接钱包' };
      }
      
      if (!isCorrectNetwork()) {
        message.error('请切换到正确的网络');
        return { success: false, error: '网络错误' };
      }
      
      return await contractUtils.endVote(voteId);
    },
    
    // 取消投票
    cancelVote: async (voteId) => {
      if (!account) {
        message.error('请先连接钱包');
        return { success: false, error: '未连接钱包' };
      }
      
      if (!isCorrectNetwork()) {
        message.error('请切换到正确的网络');
        return { success: false, error: '网络错误' };
      }
      
      return await contractUtils.cancelVote(voteId);
    },
    
    // 获取投票信息
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
    // 状态
    account,
    provider,
    signer,
    isConnecting,
    chainId,
    balance,
    
    // 方法
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
    
    // 计算属性
    isConnected: !!account,
    
    // 合约交互
    contractOperations,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider; 