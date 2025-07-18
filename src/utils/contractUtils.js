import { ethers } from 'ethers';

// 默认合约地址（将在部署后更新）
let contractAddress = null;
let contractABI = null;

// 动态导入合约地址和ABI
const loadContractData = async () => {
  try {
    console.log('正在导入合约地址和ABI...');
    const addressData = await import('../contracts/contract-address.json');
    const abiData = await import('../contracts/DeVote.json');
    
    contractAddress = addressData.DeVote;
    contractABI = abiData.abi;
    
    console.log('合约地址加载成功:', contractAddress);
    console.log('ABI加载成功:', contractABI ? 'Yes' : 'No');
    
    if (!contractAddress) {
      throw new Error('合约地址未找到');
    }
    
    if (!contractABI) {
      throw new Error('合约ABI未找到');
    }
    
    return { contractAddress, contractABI };
  } catch (error) {
    console.error('Failed to load contract data:', error);
    throw new Error('合约尚未部署，请先部署合约');
  }
};

// 获取合约实例
export const getContract = async (signer = null) => {
  try {
    if (!contractAddress || !contractABI) {
      console.log('正在加载合约数据...');
      await loadContractData();
    }
    
    console.log('合约地址:', contractAddress);
    console.log('ABI已加载:', contractABI ? 'Yes' : 'No');
    
    if (!window.ethereum) {
      throw new Error('请安装MetaMask或其他Web3钱包');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contractInstance = new ethers.Contract(contractAddress, contractABI, signer || provider);
    
    console.log('合约实例创建成功:', contractInstance.target);
    return contractInstance;
  } catch (error) {
    console.error('获取合约实例失败:', error);
    throw error;
  }
};

// 获取带签名者的合约实例
export const getContractWithSigner = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return getContract(signer);
};

// 合约交互函数

// 创建投票
export const createVote = async ({
  title,
  description,
  options,
  voteType,
  startTime,
  endTime,
  isPrivate = false,
  allowedVoters = []
}) => {
  try {
    const contract = await getContractWithSigner();
    
    // 将时间戳转换为秒
    const startTimestamp = Math.floor(startTime / 1000);
    const endTimestamp = Math.floor(endTime / 1000);
    
    // 投票类型：0 = SingleChoice, 1 = MultiChoice
    const voteTypeNum = voteType === 'single' ? 0 : 1;
    
    const tx = await contract.createVote(
      title,
      description,
      options,
      voteTypeNum,
      startTimestamp,
      endTimestamp,
      isPrivate,
      allowedVoters
    );
    
    const receipt = await tx.wait();
    
    // 从事件中获取投票ID
    const voteCreatedEvent = receipt.logs.find(log => {
      try {
        const parsedLog = contract.interface.parseLog(log);
        return parsedLog.name === 'VoteCreated';
      } catch (error) {
        return false;
      }
    });
    
    if (voteCreatedEvent) {
      const parsedEvent = contract.interface.parseLog(voteCreatedEvent);
      return {
        success: true,
        voteId: parsedEvent.args.voteId.toString(),
        txHash: receipt.hash
      };
    }
    
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('创建投票失败:', error);
    return { success: false, error: error.message };
  }
};

// 参与投票
export const castVote = async (voteId, choices) => {
  try {
    console.log('开始投票 - voteId:', voteId, '类型:', typeof voteId);
    console.log('投票选择 - choices:', choices, '类型:', typeof choices, '是否为数组:', Array.isArray(choices));
    
    const contract = await getContractWithSigner();
    console.log('获取带签名者的合约成功');
    
    // 确保voteId是number类型，choices是number数组
    const normalizedVoteId = Number(voteId);
    const normalizedChoices = choices.map(choice => Number(choice));
    
    console.log('标准化后的参数 - voteId:', normalizedVoteId, 'choices:', normalizedChoices);
    
    console.log('准备调用智能合约 castVote 方法...');
    console.log('请检查您的钱包是否弹出了交易确认窗口');
    
    // 调用智能合约前先检查网络状态
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    console.log('当前网络:', network);
    
    // 检查账户余额
    const signer = await provider.getSigner();
    const balance = await provider.getBalance(signer.address);
    console.log('账户余额:', ethers.formatEther(balance), 'ETH');
    
    // 设置Gas估算
    let gasEstimate;
    try {
      gasEstimate = await contract.castVote.estimateGas(normalizedVoteId, normalizedChoices);
      console.log('Gas估算:', gasEstimate.toString());
    } catch (gasError) {
      console.warn('Gas估算失败，使用默认值:', gasError);
    }
    
    const tx = await contract.castVote(normalizedVoteId, normalizedChoices);
    console.log('交易已发送，等待确认... txHash:', tx.hash);
    
    // 设置超时处理
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('交易确认超时，请检查网络状况')), 300000) // 5分钟超时
    );
    
    const receipt = await Promise.race([tx.wait(), timeout]);
    console.log('交易已确认:', receipt);
    
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('投票失败详细错误:', error);
    console.error('错误消息:', error.message);
    console.error('错误代码:', error.code);
    console.error('错误原因:', error.reason);
    console.error('错误数据:', error.data);
    
    // 提供更详细的错误信息
    let errorMessage = error.message || '未知错误';
    
    if (error.code === 'ACTION_REJECTED') {
      errorMessage = '用户拒绝了交易';
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = '余额不足支付Gas费用';
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = '交易超时，请检查网络连接';
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.message && error.message.includes('revert')) {
      const match = error.message.match(/revert\s+(.+)/);
      if (match) {
        errorMessage = match[1];
      }
    } else if (error.message && error.message.includes('gas')) {
      errorMessage = 'Gas费用不足或Gas限制过低';
    } else if (error.message && error.message.includes('nonce')) {
      errorMessage = '交易随机数错误，请重试';
    }
    
    return { success: false, error: errorMessage };
  }
};

// 获取投票信息
export const getVoteInfo = async (voteId) => {
  try {
    const contract = await getContract();
    
    const voteInfo = await contract.getVoteInfo(voteId);
    const voteResults = await contract.getVoteResults(voteId);
    
    console.log('原始合约数据 - voteInfo:', voteInfo);
    console.log('原始投票类型:', voteInfo.voteType, '类型:', typeof voteInfo.voteType);
    console.log('Number(voteInfo.voteType):', Number(voteInfo.voteType));
    
    // 获取时间戳（毫秒）
    const startTime = Number(voteInfo.startTime) * 1000;
    const endTime = Number(voteInfo.endTime) * 1000;
    const currentTime = Date.now();
    
    // 根据时间判断实际状态，不管合约状态如何
    let actualStatus;
    const contractStatus = ['active', 'ended', 'cancelled'][voteInfo.status];
    
    if (voteInfo.status === 2) { // 合约状态为cancelled
      actualStatus = 'cancelled';
    } else if (voteInfo.status === 1) { // 合约状态为ended
      actualStatus = 'ended';
    } else { // 合约状态为active (0) 或其他
      if (currentTime < startTime) {
        actualStatus = 'pending'; // 未开始
      } else if (currentTime > endTime) {
        actualStatus = 'ended'; // 已结束
      } else {
        actualStatus = 'active'; // 进行中
      }
    }
    
    const processedData = {
      id: voteInfo.id.toString(),
      title: voteInfo.title,
      description: voteInfo.description,
      options: voteInfo.options,
      voteType: Number(voteInfo.voteType) === 0 ? 'single' : 'multi',
      status: actualStatus, // 使用基于时间判断的实际状态
      contractStatus: contractStatus, // 保留原始合约状态供调试使用
      creator: voteInfo.creator,
      startTime: startTime,
      endTime: endTime,
      totalVoters: Number(voteInfo.totalVoters),
      isPrivate: voteInfo.isPrivate,
      results: voteResults.map(count => Number(count))
    };
    
    console.log('处理后的数据:', processedData);
    console.log('处理后的投票类型:', processedData.voteType);
    console.log('处理后的投票状态:', processedData.status, '(原合约状态:', contractStatus, ')');
    
    return {
      success: true,
      data: processedData
    };
  } catch (error) {
    console.error('获取投票信息失败:', error);
    return { success: false, error: error.message };
  }
};

// 获取所有投票ID
export const getAllVoteIds = async () => {
  try {
    const contract = await getContract();
    
    const voteIds = await contract.getAllVoteIds();
    return {
      success: true,
      data: voteIds.map(id => id.toString())
    };
  } catch (error) {
    console.error('获取投票ID列表失败:', error);
    return { success: false, error: error.message };
  }
};

// 获取用户创建的投票
export const getUserCreatedVotes = async (userAddress) => {
  try {
    const contract = await getContract();
    
    const voteIds = await contract.getUserCreatedVotes(userAddress);
    return {
      success: true,
      data: voteIds.map(id => id.toString())
    };
  } catch (error) {
    console.error('获取用户创建的投票失败:', error);
    return { success: false, error: error.message };
  }
};

// 获取用户参与的投票
export const getUserParticipatedVotes = async (userAddress) => {
  try {
    const contract = await getContract();
    
    const voteIds = await contract.getUserParticipatedVotes(userAddress);
    return {
      success: true,
      data: voteIds.map(id => id.toString())
    };
  } catch (error) {
    console.error('获取用户参与的投票失败:', error);
    return { success: false, error: error.message };
  }
};

// 检查用户是否已投票
export const hasUserVoted = async (voteId, userAddress) => {
  try {
    const contract = await getContract();
    
    const hasVoted = await contract.hasUserVoted(voteId, userAddress);
    return { success: true, data: hasVoted };
  } catch (error) {
    console.error('检查用户投票状态失败:', error);
    return { success: false, error: error.message };
  }
};

// 获取用户投票选择
export const getUserVoteChoices = async (voteId, userAddress) => {
  try {
    const contract = await getContract();
    
    const choices = await contract.getUserVoteChoices(voteId, userAddress);
    return {
      success: true,
      data: choices.map(choice => Number(choice))
    };
  } catch (error) {
    console.error('获取用户投票选择失败:', error);
    return { success: false, error: error.message };
  }
};

// 检查用户是否可以投票
export const canUserVote = async (voteId, userAddress) => {
  try {
    const contract = await getContract();
    
    const canVote = await contract.canUserVote(voteId, userAddress);
    return { success: true, data: canVote };
  } catch (error) {
    console.error('检查用户投票权限失败:', error);
    return { success: false, error: error.message };
  }
};

// 结束投票
export const endVote = async (voteId) => {
  try {
    const contract = await getContractWithSigner();
    
    const tx = await contract.endVote(voteId);
    const receipt = await tx.wait();
    
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('结束投票失败:', error);
    return { success: false, error: error.message };
  }
};

// 取消投票
export const cancelVote = async (voteId) => {
  try {
    const contract = await getContractWithSigner();
    
    const tx = await contract.cancelVote(voteId);
    const receipt = await tx.wait();
    
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('取消投票失败:', error);
    return { success: false, error: error.message };
  }
};

// 自动结束过期的投票
export const autoEndExpiredVotes = async () => {
  try {
    const contract = await getContractWithSigner();
    
    const tx = await contract.autoEndExpiredVotes();
    const receipt = await tx.wait();
    
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('自动结束过期投票失败:', error);
    return { success: false, error: error.message };
  }
};

// 工具函数：格式化错误消息
export const formatContractError = (error) => {
  if (error.code === 'ACTION_REJECTED') {
    return '用户拒绝了交易';
  }
  
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return '余额不足';
  }
  
  if (error.message.includes('revert')) {
    // 提取revert原因
    const revertMatch = error.message.match(/revert (.+)/);
    if (revertMatch) {
      return revertMatch[1];
    }
  }
  
  return error.message || '未知错误';
};

// 工具函数：等待交易确认
export const waitForTransaction = async (txHash, confirmations = 1) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    return { success: true, receipt };
  } catch (error) {
    console.error('等待交易确认失败:', error);
    return { success: false, error: error.message };
  }
};

// 工具函数：获取网络信息
export const getNetworkInfo = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    
    return {
      success: true,
      data: {
        chainId: Number(network.chainId),
        name: network.name,
        isLocalhost: Number(network.chainId) === 31337
      }
    };
  } catch (error) {
    console.error('获取网络信息失败:', error);
    return { success: false, error: error.message };
  }
}; 