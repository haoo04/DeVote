import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Radio,
  Checkbox,
  Progress,
  Space,
  Tag,
  Statistic,
  Avatar,
  List,
  message,
  Modal,
  Spin,
  Alert,
  Descriptions,
  Divider,
  Empty
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TrophyOutlined,
  ShareAltOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { getVoteInfo, castVote, hasUserVoted, getUserVoteChoices } from '../utils/contractUtils';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const VoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isConnected, account } = useWallet();
  
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [vote, setVote] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteHistory, setVoteHistory] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (id) {
      loadVoteDetail();
    }
  }, [id]);

  useEffect(() => {
    if (vote && account && isConnected) {
      checkUserVoteStatus();
    }
  }, [vote, account, isConnected]);

  const loadVoteDetail = async () => {
    setLoading(true);
    try {
      console.log('Start loading vote details, ID:', id);
      
      // Get vote details from smart contract
      const result = await getVoteInfo(id);
      
      if (result.success) {
        const voteData = result.data;
        console.log('Vote details data:', voteData);
        console.log('Vote type voteType:', voteData.voteType, 'type:', typeof voteData.voteType);
        
        // Determine actual status based on time
        const currentTime = Date.now();
        let actualStatus = voteData.status;
        if (voteData.status === 'active') {
          if (currentTime < voteData.startTime) {
            actualStatus = 'pending';
          } else if (currentTime > voteData.endTime) {
            actualStatus = 'ended';
          }
        }
        
        setVote({
          id: voteData.id,
          title: voteData.title,
          description: voteData.description,
          creator: voteData.creator,
          status: actualStatus,
          type: voteData.voteType, // Here it's already a string 'single' or 'multi'
          startTime: new Date(voteData.startTime).toISOString(),
          endTime: new Date(voteData.endTime).toISOString(),
          startTimestamp: voteData.startTime,
          endTimestamp: voteData.endTime,
          totalParticipants: voteData.totalVoters,
          totalVotes: voteData.results.reduce((sum, count) => sum + count, 0),
          options: voteData.options.map((opt, index) => ({
            id: index,
            text: opt,
            votes: voteData.results[index] || 0
          })),
          anonymous: false, // The contract doesn't have this field
          tags: [], // The contract doesn't have this field
          minParticipants: 0, // The contract doesn't have this field
          maxVotesPerUser: 1, // Default value
          permissionType: voteData.isPrivate ? 'private' : 'public'
        });
        
        setResults(voteData.results);
      } else {
        throw new Error(result.error || 'Vote does not exist');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load vote details:', error);
      message.error('Vote does not exist or failed to load');
      setLoading(false);
    }
  };

  const checkUserVoteStatus = async () => {
    try {
      console.log('Check user vote status, vote ID:', id, 'user address:', account);
      
      // Check if user has voted
      const result = await hasUserVoted(id, account);
      
      if (result.success) {
        setHasVoted(result.data);
        console.log('User has voted:', result.data);
        
        // If user has voted, get vote choices
        if (result.data) {
          const choicesResult = await getUserVoteChoices(id, account);
          if (choicesResult.success) {
            setSelectedOptions(choicesResult.data);
            console.log('User vote choices:', choicesResult.data);
          }
        }
      } else {
        console.error('Check vote status failed:', result.error);
      }
    } catch (error) {
      console.error('Check vote status failed:', error);
    }
  };

  const handleVote = async () => {
    if (!isConnected) {
      message.error('Please connect your wallet');
      return;
    }

    if (selectedOptions.length === 0) {
      message.error('Please select vote options');
      return;
    }

    if (vote.type === 'single' && selectedOptions.length > 1) {
      message.error('Single vote can only select one option');
      return;
    }

    // Check vote status
    if (vote.status !== 'active') {
      message.error('Vote has ended or not started yet');
      return;
    }

    // Check if user has voted
    if (hasVoted) {
      message.error('You have already participated in this vote');
      return;
    }

    console.log('Prepare to vote - vote ID:', id, 'selected options:', selectedOptions, 'vote type:', vote.type);
    console.log('Current vote object:', vote);
    console.log('vote.options:', vote?.options);
    console.log('vote.options type:', typeof vote?.options, 'is array:', Array.isArray(vote?.options));

    console.log('Directly start voting logic...');
    setVoting(true);
    
    try {
      console.log('Start voting, vote ID:', id, 'selected options:', selectedOptions);
      
      // Validate input parameters
      if (!id || selectedOptions.length === 0) {
        throw new Error('Invalid vote parameters');
      }

      // Ensure option ID is a number type
      const normalizedOptions = selectedOptions.map(option => Number(option));
      console.log('Normalized options:', normalizedOptions);
      
      // Call smart contract to vote
      const result = await castVote(parseInt(id), normalizedOptions);
      
      console.log('Vote result:', result);
      
      if (result.success) {
        message.success('投票成功！');
        setHasVoted(true);
        setSelectedOptions([]); // Clear selection
        await loadVoteDetail(); // Reload data
        console.log('Vote successful, transaction hash:', result.txHash);
      } else {
        throw new Error(result.error || '投票失败');
      }
      
    } catch (error) {
      console.error('Vote failed detailed information:', error);
      let errorMessage = 'Vote failed';
      
      // Provide more friendly error messages based on error type
      if (error.message.includes('User denied') || error.message.includes('User denied')) {
        errorMessage = 'User canceled transaction';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Account balance is insufficient to pay gas fees';
      } else if (error.message.includes('Vote not found')) {
        errorMessage = 'Vote does not exist';
      } else if (error.message.includes('Vote not active')) {
        errorMessage = 'Vote has ended or not started yet';
      } else if (error.message.includes('Already voted')) {
        errorMessage = 'You have already voted';
      } else if (error.message.includes('Invalid choice')) {
        errorMessage = 'Invalid vote option';
      } else if (error.message.includes('revert')) {
        // Extract smart contract revert information
        const revertMatch = error.message.match(/revert\s+(.+)/);
        if (revertMatch) {
          errorMessage = revertMatch[1];
        }
      } else {
        errorMessage = error.message || 'Please check network connection and try again';
      }
      
      message.error(errorMessage);
    } finally {
      setVoting(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'active': { color: 'green', text: 'Active', icon: <ClockCircleOutlined /> },
      'ended': { color: 'blue', text: 'Ended', icon: <TrophyOutlined /> },
      'cancelled': { color: 'red', text: 'Cancelled', icon: <ExclamationCircleOutlined /> },
      'pending': { color: 'orange', text: 'Pending', icon: <CalendarOutlined /> }
    };
    return configs[status] || configs['pending'];
  };

  const calculateProgress = () => {
    if (!vote) return 0;
    if (vote.status === 'ended' || vote.status === 'cancelled') return 100;
    if (vote.status === 'pending') return 0;
    
    const now = Date.now();
    const start = vote.startTimestamp;
    const end = vote.endTimestamp;
    const total = end - start;
    const elapsed = now - start;
    
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const getTimeRemaining = () => {
    if (!vote) return '';
    
    const now = Date.now();
    const start = vote.startTimestamp;
    const end = vote.endTimestamp;
    
    if (vote.status === 'pending') {
      const remaining = start - now;
      if (remaining <= 0) return 'Starting soon';
      
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `${days} days ${hours} hours later`;
      if (hours > 0) return `${hours} hours ${minutes} minutes later`;
      return `${minutes} minutes later`;
    }
    
    if (vote.status === 'ended' || vote.status === 'cancelled') {
      return vote.status === 'ended' ? 'Ended' : 'Cancelled';
    }
    
    const remaining = end - now;
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `Remaining ${days} days ${hours} hours`;
    if (hours > 0) return `Remaining ${hours} hours ${minutes} minutes`;
    return `Remaining ${minutes} minutes`;
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const shareVote = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    message.success('Vote link copied to clipboard');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!vote) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Empty
          description="Vote does not exist or failed to load"
        />
      </div>
    );
  }

  const statusConfig = getStatusConfig(vote.status);

  // Add debug information
  //console.log('VoteDetail rendering - vote object:', vote);
  //console.log('Vote type vote.type:', vote.type, 'type:', typeof vote.type);
  //console.log('Current selected options:', selectedOptions);
  //console.log('User has voted:', hasVoted);
  //console.log('Wallet connected:', isConnected);
  //console.log('Vote status:', vote.status);

  return (
    <div>
      {/* Vote title and basic information */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Space>
                  <Title level={2} style={{ margin: 0 }}>{vote.title}</Title>
                  <Tag color={statusConfig.color} icon={statusConfig.icon}>
                    {statusConfig.text}
                  </Tag>
                  {vote.anonymous && <Tag color="purple" icon={<LockOutlined />}>Anonymous vote</Tag>}
                </Space>
              </div>
              
              <Paragraph>{vote.description}</Paragraph>
              
              <Descriptions size="small" column={2}>
                <Descriptions.Item label="Creator">
                  {formatAddress(vote.creator)}
                </Descriptions.Item>
                <Descriptions.Item label="Vote type">
                  {vote.type === 'single' ? 'Single vote' : 'Multiple vote'}
                </Descriptions.Item>
                <Descriptions.Item label="Start time">
                  {new Date(vote.startTime).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="End time">
                  {new Date(vote.endTime).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
              
              {vote.tags && vote.tags.length > 0 && (
                <Space wrap>
                  {vote.tags.map(tag => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </Space>
              )}
            </Space>
          </Col>
          
          <Col xs={24} lg={8}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Participants"
                  value={vote.totalParticipants}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Total votes"
                  value={vote.totalVotes}
                  prefix={<TrophyOutlined />}
                />
              </Col>
              <Col span={24}>
                <Card size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>{getTimeRemaining()}</Text>
                    <Progress percent={calculateProgress()} size="small" />
                  </Space>
                </Card>
              </Col>
              <Col span={24}>
                <Button
                  icon={<ShareAltOutlined />}
                  onClick={shareVote}
                  block
                >
                  Share vote
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Row gutter={24}>
        {/* Vote options */}
        <Col xs={24} lg={16}>
          <Card title="Vote options">
            {vote.status === 'active' && !hasVoted && isConnected ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">
                    Vote type: {vote.type === 'single' ? 'Single vote (can only select one option)' : 'Multiple vote (can select multiple options)'}
                  </Text>
                </div>
                {vote.type === 'single' ? (
                  <Radio.Group
                    value={selectedOptions[0]}
                    onChange={(e) => {
                      console.log('Single vote selected:', e.target.value);
                      setSelectedOptions([e.target.value]);
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {vote.options.map(option => (
                        <Radio key={option.id} value={option.id}>
                          {option.text}
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                ) : (
                  <Checkbox.Group
                    value={selectedOptions}
                    onChange={(newSelections) => {
                      console.log('Multiple vote selected:', newSelections);
                      setSelectedOptions(newSelections);
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {vote.options.map(option => (
                        <Checkbox key={option.id} value={option.id}>
                          {option.text}
                        </Checkbox>
                      ))}
                    </Space>
                  </Checkbox.Group>
                )}
                
                <div style={{ marginTop: 16 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary">
                      Current selection: {selectedOptions.length === 0 ? 'Not selected' : selectedOptions.map(id => {
                        const option = vote.options.find(opt => opt.id === id);
                        return option?.text;
                      }).join(', ')}
                    </Text>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleVote}
                    loading={voting}
                    disabled={selectedOptions.length === 0}
                  >
                    {voting ? 'Submitting...' : 'Submit vote'}
                  </Button>
                </div>
              </Space>
            ) : (
              <div>
                {!isConnected && (
                  <Alert
                    message="Please connect wallet to participate in vote"
                    type="warning"
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                {hasVoted && (
                  <Alert
                    message="You have already participated in this vote"
                    type="success"
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                {vote.status === 'pending' && (
                  <Alert
                    message="Vote has not started yet"
                    type="info"
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                {vote.status === 'ended' && (
                  <Alert
                    message="Vote has ended"
                    type="info"
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                {vote.status === 'cancelled' && (
                  <Alert
                    message="Vote has been cancelled"
                    type="error"
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                {/* Show vote results */}
                <Space direction="vertical" style={{ width: '100%' }}>
                  {vote.options.map(option => {
                    const percentage = vote.totalVotes > 0 
                      ? Math.round((option.votes / vote.totalVotes) * 100) 
                      : 0;
                    
                    return (
                      <Card key={option.id} size="small">
                        <Row justify="space-between" align="middle">
                          <Col>
                            <Text strong>{option.text}</Text>
                          </Col>
                          <Col>
                            <Text type="secondary">{option.votes} votes</Text>
                          </Col>
                        </Row>
                        <Progress
                          percent={percentage}
                          size="small"
                          style={{ marginTop: 8 }}
                        />
                      </Card>
                    );
                  })}
                </Space>
              </div>
            )}
          </Card>
        </Col>

        {/* Vote history */}
        <Col xs={24} lg={8}>
          <Card title="Vote history">
            {!vote.anonymous ? (
              voteHistory.length > 0 ? (
                <List
                  size="small"
                  dataSource={voteHistory.slice(0, 10)}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={formatAddress(item.voter)}
                        description={
                          <div>
                            <Text type="secondary">{item.choice}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {new Date(item.timestamp).toLocaleString()}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No vote history"
                />
              )
            ) : (
              <Alert
                message="Anonymous vote"
                description="This vote is anonymous, no vote history will be displayed"
                type="info"
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VoteDetail; 