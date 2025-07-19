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
      console.log('开始加载投票详情，ID:', id);
      
      // 从智能合约获取投票详情
      const result = await getVoteInfo(id);
      
      if (result.success) {
        const voteData = result.data;
        console.log('投票详情数据:', voteData);
        console.log('投票类型 voteType:', voteData.voteType, '类型:', typeof voteData.voteType);
        
        // 根据时间判断实际状态
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
          type: voteData.voteType, // 这里已经是转换后的字符串 'single' 或 'multi'
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
          anonymous: false, // 合约中没有这个字段
          tags: [], // 合约中没有这个字段
          minParticipants: 0, // 合约中没有这个字段
          maxVotesPerUser: 1, // 默认值
          permissionType: voteData.isPrivate ? 'private' : 'public'
        });
        
        setResults(voteData.results);
      } else {
        throw new Error(result.error || '投票不存在');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('加载投票详情失败:', error);
      message.error('投票不存在或加载失败');
      setLoading(false);
    }
  };

  const checkUserVoteStatus = async () => {
    try {
      console.log('检查用户投票状态，投票ID:', id, '用户地址:', account);
      
      // 检查用户是否已投票
      const result = await hasUserVoted(id, account);
      
      if (result.success) {
        setHasVoted(result.data);
        console.log('用户是否已投票:', result.data);
        
        // 如果已投票，获取投票选择
        if (result.data) {
          const choicesResult = await getUserVoteChoices(id, account);
          if (choicesResult.success) {
            setSelectedOptions(choicesResult.data);
            console.log('用户投票选择:', choicesResult.data);
          }
        }
      } else {
        console.error('检查投票状态失败:', result.error);
      }
    } catch (error) {
      console.error('检查投票状态失败:', error);
    }
  };

  const handleVote = async () => {
    if (!isConnected) {
      message.error('请先连接钱包');
      return;
    }

    if (selectedOptions.length === 0) {
      message.error('请选择投票选项');
      return;
    }

    if (vote.type === 'single' && selectedOptions.length > 1) {
      message.error('单选投票只能选择一个选项');
      return;
    }

    // 检查投票状态
    if (vote.status !== 'active') {
      message.error('投票已结束或尚未开始');
      return;
    }

    // 检查是否已投过票
    if (hasVoted) {
      message.error('您已经参与过此投票');
      return;
    }

    console.log('准备投票 - 投票ID:', id, '选择的选项:', selectedOptions, '投票类型:', vote.type);
    console.log('当前vote对象:', vote);
    console.log('vote.options:', vote?.options);
    console.log('vote.options类型:', typeof vote?.options, '是否为数组:', Array.isArray(vote?.options));

    console.log('直接开始投票逻辑...');
    setVoting(true);
    
    try {
      console.log('开始投票，投票ID:', id, '选择的选项:', selectedOptions);
      
      // 验证输入参数
      if (!id || selectedOptions.length === 0) {
        throw new Error('投票参数无效');
      }

      // 确保选项ID是数字类型
      const normalizedOptions = selectedOptions.map(option => Number(option));
      console.log('标准化后的选项:', normalizedOptions);
      
      // 调用智能合约进行投票
      const result = await castVote(parseInt(id), normalizedOptions);
      
      console.log('投票结果:', result);
      
      if (result.success) {
        message.success('投票成功！');
        setHasVoted(true);
        setSelectedOptions([]); // 清空选择
        await loadVoteDetail(); // 重新加载数据
        console.log('投票成功，交易哈希:', result.txHash);
      } else {
        throw new Error(result.error || '投票失败');
      }
      
    } catch (error) {
      console.error('投票失败详细信息:', error);
      let errorMessage = '投票失败';
      
      // 根据错误类型提供更友好的错误信息
      if (error.message.includes('User denied') || error.message.includes('用户拒绝')) {
        errorMessage = '用户取消了交易';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = '账户余额不足支付Gas费用';
      } else if (error.message.includes('Vote not found')) {
        errorMessage = '投票不存在';
      } else if (error.message.includes('Vote not active')) {
        errorMessage = '投票已结束或尚未开始';
      } else if (error.message.includes('Already voted')) {
        errorMessage = '您已经投过票了';
      } else if (error.message.includes('Invalid choice')) {
        errorMessage = '投票选项无效';
      } else if (error.message.includes('revert')) {
        // 提取智能合约revert信息
        const revertMatch = error.message.match(/revert\s+(.+)/);
        if (revertMatch) {
          errorMessage = revertMatch[1];
        }
      } else {
        errorMessage = error.message || '请检查网络连接后重试';
      }
      
      message.error(errorMessage);
    } finally {
      setVoting(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'active': { color: 'green', text: '进行中', icon: <ClockCircleOutlined /> },
      'ended': { color: 'blue', text: '已结束', icon: <TrophyOutlined /> },
      'cancelled': { color: 'red', text: '已取消', icon: <ExclamationCircleOutlined /> },
      'pending': { color: 'orange', text: '未开始', icon: <CalendarOutlined /> }
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
      if (remaining <= 0) return '即将开始';
      
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `${days} 天 ${hours} 小时后开始`;
      if (hours > 0) return `${hours} 小时 ${minutes} 分钟后开始`;
      return `${minutes} 分钟后开始`;
    }
    
    if (vote.status === 'ended' || vote.status === 'cancelled') {
      return vote.status === 'ended' ? '已结束' : '已取消';
    }
    
    const remaining = end - now;
    if (remaining <= 0) return '已结束';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `剩余 ${days} 天 ${hours} 小时`;
    if (hours > 0) return `剩余 ${hours} 小时 ${minutes} 分钟`;
    return `剩余 ${minutes} 分钟`;
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const shareVote = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    message.success('投票链接已复制到剪贴板');
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
          description="投票不存在或加载失败"
        />
      </div>
    );
  }

  const statusConfig = getStatusConfig(vote.status);

  // 添加调试信息
  console.log('VoteDetail 渲染 - vote对象:', vote);
  console.log('投票类型 vote.type:', vote.type, '类型:', typeof vote.type);
  console.log('当前选择的选项:', selectedOptions);
  console.log('用户是否已投票:', hasVoted);
  console.log('钱包是否连接:', isConnected);
  console.log('投票状态:', vote.status);

  return (
    <div>
      {/* 投票标题和基本信息 */}
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
                  {vote.anonymous && <Tag color="purple" icon={<LockOutlined />}>匿名投票</Tag>}
                </Space>
              </div>
              
              <Paragraph>{vote.description}</Paragraph>
              
              <Descriptions size="small" column={2}>
                <Descriptions.Item label="创建者">
                  {formatAddress(vote.creator)}
                </Descriptions.Item>
                <Descriptions.Item label="投票类型">
                  {vote.type === 'single' ? '单选投票' : '多选投票'}
                </Descriptions.Item>
                <Descriptions.Item label="开始时间">
                  {new Date(vote.startTime).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="结束时间">
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
                  title="参与人数"
                  value={vote.totalParticipants}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="总票数"
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
                  分享投票
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Row gutter={24}>
        {/* 投票选项 */}
        <Col xs={24} lg={16}>
          <Card title="投票选项">
            {vote.status === 'active' && !hasVoted && isConnected ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">
                    投票类型：{vote.type === 'single' ? '单选投票（只能选择一个选项）' : '多选投票（可以选择多个选项）'}
                  </Text>
                </div>
                {vote.type === 'single' ? (
                  <Radio.Group
                    value={selectedOptions[0]}
                    onChange={(e) => {
                      console.log('单选投票选择:', e.target.value);
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
                      console.log('多选投票选择:', newSelections);
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
                      当前选择：{selectedOptions.length === 0 ? '未选择' : selectedOptions.map(id => {
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
                    {voting ? '提交中...' : '提交投票'}
                  </Button>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      调试信息 - 选项数量: {selectedOptions.length}, 
                      投票状态: {vote.status}, 
                      已投票: {hasVoted ? '是' : '否'}, 
                      钱包连接: {isConnected ? '是' : '否'}
                    </Text>
                  </div>
                </div>
              </Space>
            ) : (
              <div>
                {!isConnected && (
                  <Alert
                    message="请连接钱包参与投票"
                    type="warning"
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                {hasVoted && (
                  <Alert
                    message="您已参与过此投票"
                    type="success"
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                {vote.status === 'pending' && (
                  <Alert
                    message="投票尚未开始"
                    type="info"
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                {vote.status === 'ended' && (
                  <Alert
                    message="投票已结束"
                    type="info"
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                {vote.status === 'cancelled' && (
                  <Alert
                    message="投票已取消"
                    type="error"
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                {/* 显示投票结果 */}
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
                            <Text type="secondary">{option.votes} 票</Text>
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

        {/* 投票历史 */}
        <Col xs={24} lg={8}>
          <Card title="投票历史">
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
                  description="暂无投票记录"
                />
              )
            ) : (
              <Alert
                message="匿名投票"
                description="此投票为匿名投票，不显示投票记录"
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