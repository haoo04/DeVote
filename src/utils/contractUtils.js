import { ethers } from 'ethers';

// Default contract address (will be updated after deployment)
let contractAddress = null;
let contractABI = null;

// Dynamically import contract address and ABI
const loadContractData = async () => {
  try {
    console.log('Importing contract address and ABI...');
    const addressData = await import('../contracts/contract-address.json');
    const abiData = await import('../contracts/DeVote.json');
    
    contractAddress = addressData.DeVote;
    contractABI = abiData.abi;
    
    console.log('Contract address loaded:', contractAddress);
    console.log('ABI loaded:', contractABI ? 'Yes' : 'No');
    
    if (!contractAddress) {
      throw new Error('Contract address not found');
    }
    
    if (!contractABI) {
      throw new Error('Contract ABI not found');
    }
    
    return { contractAddress, contractABI };
  } catch (error) {
    console.error('Failed to load contract data:', error);
    throw new Error('Contract not deployed, please deploy the contract first');
  }
};

// Get contract instance
export const getContract = async (signer = null) => {
  try {
    if (!contractAddress || !contractABI) {
      console.log('Loading contract data...');
      await loadContractData();
    }
    
    console.log('Contract address:', contractAddress);
    console.log('ABI loaded:', contractABI ? 'Yes' : 'No');
    
    if (!window.ethereum) {
      throw new Error('Please install MetaMask or other Web3 wallets');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contractInstance = new ethers.Contract(contractAddress, contractABI, signer || provider);
    
    console.log('Contract instance created successfully:', contractInstance.target);
    return contractInstance;
  } catch (error) {
    console.error('Failed to get contract instance:', error);
    throw error;
  }
};

// Get contract instance with signer
export const getContractWithSigner = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return getContract(signer);
};

// Contract interaction functions

// Create vote
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
    
    // Convert timestamps to seconds
    const startTimestamp = Math.floor(startTime / 1000);
    const endTimestamp = Math.floor(endTime / 1000);
    
    // Vote type: 0 = SingleChoice, 1 = MultiChoice
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
    
    // Get vote ID from event
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
    console.error('Failed to create vote:', error);
    return { success: false, error: error.message };
  }
};

// 参与投票
export const castVote = async (voteId, choices) => {
  try {
    console.log('Start voting - voteId:', voteId, 'type:', typeof voteId);
    console.log('Vote choices:', choices, 'type:', typeof choices, 'is array:', Array.isArray(choices));
    
    const contract = await getContractWithSigner();
    console.log('Successfully got contract with signer');
    
    // Ensure voteId is number type, choices is number array
    const normalizedVoteId = Number(voteId);
    const normalizedChoices = choices.map(choice => Number(choice));
    
    console.log('Normalized parameters - voteId:', normalizedVoteId, 'choices:', normalizedChoices);
    
    console.log('Preparing to call smart contract castVote method...');
    console.log('Please check if your wallet has popped up a transaction confirmation window');
    
    // Check network status before calling smart contract
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    console.log('Current network:', network);
    
    // Check account balance
    const signer = await provider.getSigner();
    const balance = await provider.getBalance(signer.address);
    console.log('Account balance:', ethers.formatEther(balance), 'ETH');
    
    // Set gas estimation
    let gasEstimate;
    try {
      gasEstimate = await contract.castVote.estimateGas(normalizedVoteId, normalizedChoices);
      console.log('Gas estimation:', gasEstimate.toString());
    } catch (gasError) {
      console.warn('Gas estimation failed, using default value:', gasError);
    }
    
    const tx = await contract.castVote(normalizedVoteId, normalizedChoices);
    console.log('Transaction sent, waiting for confirmation... txHash:', tx.hash);
    
    // Set timeout handling
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Transaction confirmation timeout, please check network status')), 300000) // 5 minutes timeout
    );
    
    const receipt = await Promise.race([tx.wait(), timeout]);
    console.log('Transaction confirmed:', receipt);
    
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('Detailed error:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error reason:', error.reason);
    console.error('Error data:', error.data);
    
    // Provide more detailed error information
    let errorMessage = error.message || 'Unknown error';
    
    if (error.code === 'ACTION_REJECTED') {
      errorMessage = 'User rejected transaction';
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Insufficient funds to pay gas fees';
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = 'Transaction timeout, please check network connection';
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.message && error.message.includes('revert')) {
      const match = error.message.match(/revert\s+(.+)/);
      if (match) {
        errorMessage = match[1];
      }
    } else if (error.message && error.message.includes('gas')) {
      errorMessage = 'Insufficient gas or low gas limit';
    } else if (error.message && error.message.includes('nonce')) {
      errorMessage = 'Transaction nonce error, please try again';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Get vote information
export const getVoteInfo = async (voteId) => {
  try {
    const contract = await getContract();
    
    const voteInfo = await contract.getVoteInfo(voteId);
    const voteResults = await contract.getVoteResults(voteId);
    
    console.log('Raw contract data - voteInfo:', voteInfo);
    console.log('Raw vote type:', voteInfo.voteType, 'type:', typeof voteInfo.voteType);
    console.log('Number(voteInfo.voteType):', Number(voteInfo.voteType));
    
    // Get timestamps (milliseconds)
    const startTime = Number(voteInfo.startTime) * 1000;
    const endTime = Number(voteInfo.endTime) * 1000;
    const currentTime = Date.now();
    
    // Determine actual status based on time, regardless of contract status
    let actualStatus;
    const contractStatus = ['active', 'ended', 'cancelled'][voteInfo.status];
    
    if (voteInfo.status === 2) { // Contract status is cancelled
      actualStatus = 'cancelled';
    } else if (voteInfo.status === 1) { // Contract status is ended
      actualStatus = 'ended';
    } else { // Contract status is active (0) or other
      if (currentTime < startTime) {
        actualStatus = 'pending'; // Not started
      } else if (currentTime > endTime) {
        actualStatus = 'ended'; // Ended
      } else {
        actualStatus = 'active'; // Active
      }
    }
    
    const processedData = {
      id: voteInfo.id.toString(),
      title: voteInfo.title,
      description: voteInfo.description,
      options: voteInfo.options,
      voteType: Number(voteInfo.voteType) === 0 ? 'single' : 'multi',
      status: actualStatus, // Use actual status based on time
      contractStatus: contractStatus, // Keep original contract status for debugging
      creator: voteInfo.creator,
      startTime: startTime,
      endTime: endTime,
      totalVoters: Number(voteInfo.totalVoters),
      isPrivate: voteInfo.isPrivate,
      results: voteResults.map(count => Number(count))
    };
    
    console.log('Processed data:', processedData);
    console.log('Processed vote type:', processedData.voteType);
    console.log('Processed vote status:', processedData.status, '(Original contract status:', contractStatus, ')');
    
    return {
      success: true,
      data: processedData
    };
  } catch (error) {
    console.error('Failed to get vote information:', error);
    return { success: false, error: error.message };
  }
};

// Get all vote IDs
export const getAllVoteIds = async () => {
  try {
    const contract = await getContract();
    
    const voteIds = await contract.getAllVoteIds();
    return {
      success: true,
      data: voteIds.map(id => id.toString())
    };
  } catch (error) {
    console.error('Failed to get vote ID list:', error);
    return { success: false, error: error.message };
  }
};

// Get user created votes
export const getUserCreatedVotes = async (userAddress) => {
  try {
    const contract = await getContract();
    
    const voteIds = await contract.getUserCreatedVotes(userAddress);
    return {
      success: true,
      data: voteIds.map(id => id.toString())
    };
  } catch (error) {
    console.error('Failed to get user created votes:', error);
    return { success: false, error: error.message };
  }
};

// Get user participated votes
export const getUserParticipatedVotes = async (userAddress) => {
  try {
    const contract = await getContract();
    
    const voteIds = await contract.getUserParticipatedVotes(userAddress);
    return {
      success: true,
      data: voteIds.map(id => id.toString())
    };
  } catch (error) {
    console.error('Failed to get user participated votes:', error);
    return { success: false, error: error.message };
  }
};

// Check if user has voted
export const hasUserVoted = async (voteId, userAddress) => {
  try {
    const contract = await getContract();
    
    const hasVoted = await contract.hasUserVoted(voteId, userAddress);
    return { success: true, data: hasVoted };
  } catch (error) {
    console.error('Failed to check user vote status:', error);
    return { success: false, error: error.message };
  }
};

// Get user vote choices
export const getUserVoteChoices = async (voteId, userAddress) => {
  try {
    const contract = await getContract();
    
    const choices = await contract.getUserVoteChoices(voteId, userAddress);
    return {
      success: true,
      data: choices.map(choice => Number(choice))
    };
  } catch (error) {
    console.error('Failed to get user vote choices:', error);
    return { success: false, error: error.message };
  }
};

// Check if user can vote
export const canUserVote = async (voteId, userAddress) => {
  try {
    const contract = await getContract();
    
    const canVote = await contract.canUserVote(voteId, userAddress);
    return { success: true, data: canVote };
  } catch (error) {
    console.error('Failed to check user vote permission:', error);
    return { success: false, error: error.message };
  }
};

// End vote
export const endVote = async (voteId) => {
  try {
    const contract = await getContractWithSigner();
    
    const tx = await contract.endVote(voteId);
    const receipt = await tx.wait();
    
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('Failed to end vote:', error);
    return { success: false, error: error.message };
  }
};

// Cancel vote
export const cancelVote = async (voteId) => {
  try {
    const contract = await getContractWithSigner();
    
    const tx = await contract.cancelVote(voteId);
    const receipt = await tx.wait();
    
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('Failed to cancel vote:', error);
    return { success: false, error: error.message };
  }
};

// Auto end expired votes
export const autoEndExpiredVotes = async () => {
  try {
    const contract = await getContractWithSigner();
    
    const tx = await contract.autoEndExpiredVotes();
    const receipt = await tx.wait();
    
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('Failed to auto end expired votes:', error);
    return { success: false, error: error.message };
  }
};

// Utility function: format error message
export const formatContractError = (error) => {
  if (error.code === 'ACTION_REJECTED') {
    return 'User rejected transaction';
  }
  
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds';
  }
  
  if (error.message.includes('revert')) {
    // Extract revert reason
    const revertMatch = error.message.match(/revert (.+)/);
    if (revertMatch) {
      return revertMatch[1];
    }
  }
  
  return error.message || 'Unknown error';
};

// Utility function: wait for transaction confirmation
export const waitForTransaction = async (txHash, confirmations = 1) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    return { success: true, receipt };
  } catch (error) {
    console.error('Failed to wait for transaction confirmation:', error);
    return { success: false, error: error.message };
  }
};

// Utility function: get network information
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
    console.error('Failed to get network information:', error);
    return { success: false, error: error.message };
  }
}; 