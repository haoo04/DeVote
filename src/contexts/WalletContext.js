import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { message } from 'antd';

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
    // 这里可以根据需要设置正确的网络ID
    return chainId === '1' || chainId === '0x1'; // 以太坊主网
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
    addEthereumChain,
    formatAddress,
    isCorrectNetwork,
    
    // 计算属性
    isConnected: !!account,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider; 