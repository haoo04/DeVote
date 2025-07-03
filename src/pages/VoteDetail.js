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

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const VoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isConnected, account } = useWallet();
  
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [vote, setVote] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteHistory, setVoteHistory] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadVoteDetail();
  }, [id]);

  useEffect(() => {
    if (vote && account) {
      checkUserVoteStatus();
    }
  }, [vote, account]);

  const loadVoteDetail = async () => {
    setLoading(true);
    try {
      // 模拟API调用获取投票详情
      setTimeout(() => {
        const mockVote = {
          id: parseInt(id),
          title: '2024年度最佳区块链项目投票',
          description: '这是一个关于选择2024年度最佳区块链项目的投票。我们将从多个维度评估各个项目，包括技术创新、生态发展、社区活跃度等。请根据您的了解和判断，选出您认为最优秀的区块链项目。\n\n投票将持续10天，期间您可以查看实时的投票结果。所有投票数据都将记录在区块链上，确保透明和不可篡改。',
          creator: '0x1234567890abcdef1234567890abcdef12345678',
          status: 'active',
          type: 'single',
          startTime: '2024-01-10T00:00:00Z',
          endTime: '2024-01-20T23:59:59Z',
          totalParticipants: 156,
          totalVotes: 203,
          options: [
            { id: 1, text: 'Ethereum', votes: 89 },
            { id: 2, text: 'Polygon', votes: 45 },
            { id: 3, text: 'Solana', votes: 38 },
            { id: 4, text: 'Avalanche', votes: 31 }
          ],
          anonymous: false,
          tags: ['区块链', '项目评选', '年度最佳'],
          minParticipants: 100,
          maxVotesPerUser: 1,
          permissionType: 'public'
        };

        setVote(mockVote);
        
        // 模拟投票历史
        const mockHistory = [
          {
            voter: '0xabcd...efgh',
            timestamp: '2024-01-15T10:30:00Z',
            choice: 'Ethereum',
            txHash: '0x123...abc'
          },
          {
            voter: '0x9876...5432',
            timestamp: '2024-01-15T10:25:00Z',
            choice: 'Polygon',
            txHash: '0x456...def'
          }
        ];
        setVoteHistory(mockHistory);
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('加载投票详情失败:', error);
      setLoading(false);
    }
  };

  const checkUserVoteStatus = async () => {
    try {
      // 检查用户是否已投票
      // const userVote = await contract.getUserVote(id, account);
      // setHasVoted(!!userVote);
      
      // 模拟检查
      setHasVoted(false); // 假设用户还未投票
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

    confirm({
      title: '确认投票',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>您选择的选项：</p>
          <ul>
            {selectedOptions.map(optionId => {
              const option = vote.options.find(opt => opt.id === optionId);
              return <li key={optionId}>{option?.text}</li>;
            })}
          </ul>
          <p style={{ color: '#ff4d4f', marginTop: 16 }}>
            注意：投票提交后无法修改，请确认您的选择。
          </p>
        </div>
      ),
      onOk: async () => {
        setVoting(true);
        try {
          // 调用智能合约进行投票
          // const tx = await contract.vote(id, selectedOptions);
          // await tx.wait();

          // 模拟投票过程
          setTimeout(() => {
            message.success('投票成功！');
            setHasVoted(true);
            loadVoteDetail(); // 重新加载数据
            setVoting(false);
          }, 2000);

        } catch (error) {
          console.error('投票失败:', error);
          message.error('投票失败，请重试');
          setVoting(false);
        }
      }
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      'active': { color: 'green', text: '进行中', icon: <ClockCircleOutlined /> },
      'completed': { color: 'blue', text: '已结束', icon: <TrophyOutlined /> },
      'pending': { color: 'orange', text: '未开始', icon: <CalendarOutlined /> }
    };
    return configs[status] || configs['pending'];
  };

  const calculateProgress = () => {
    if (!vote) return 0;
    if (vote.status === 'completed') return 100;
    if (vote.status === 'pending') return 0;
    
    const now = new Date();
    const start = new Date(vote.startTime);
    const end = new Date(vote.endTime);
    const total = end - start;
    const elapsed = now - start;
    
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const getTimeRemaining = () => {
    if (!vote) return '';
    
    const now = new Date();
    const end = new Date(vote.endTime);
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
      <Empty
        description="投票不存在或已被删除"
        style={{ padding: '60px 0' }}
      />
    );
  }

  const statusConfig = getStatusConfig(vote.status);
  const progress = calculateProgress();
  const timeRemaining = getTimeRemaining();

  return (
    <div>
      {/* 投票标题和状态 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col flex="auto">
            <Space direction="vertical" size={8}>
              <Space>
                <Title level={2} style={{ margin: 0 }}>
                  {vote.title}
                </Title>
                <Tag color={statusConfig.color} icon={statusConfig.icon}>
                  {statusConfig.text}
                </Tag>
                <Tag>{vote.type === 'single' ? '单选' : '多选'}</Tag>
                {vote.anonymous && <Tag color="purple">匿名投票</Tag>}
              </Space>
              
              <Space wrap>
                {vote.tags.map(tag => (
                  <Tag key={tag} color="blue">{tag}</Tag>
                ))}
              </Space>
              
              <Text type="secondary">
                创建者: {formatAddress(vote.creator)} | 
                创建时间: {new Date(vote.startTime).toLocaleDateString()}
              </Text>
            </Space>
          </Col>
          
          <Col>
            <Space direction="vertical" style={{ textAlign: 'right' }}>
              <Button
                icon={<ShareAltOutlined />}
                onClick={shareVote}
              >
                分享投票
              </Button>
              <Text type="secondary">{timeRemaining}</Text>
            </Space>
          </Col>
        </Row>

        {vote.status === 'active' && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>投票进度</Text>
            <Progress
              percent={Math.round(progress)}
              size="small"
              status={progress > 80 ? 'exception' : 'active'}
            />
          </div>
        )}
      </Card>

      <Row gutter={24}>
        {/* 左侧：投票内容和参与 */}
        <Col xs={24} lg={16}>
          {/* 投票描述 */}
          <Card title="投票详情" style={{ marginBottom: 24 }}>
            <Paragraph>{vote.description}</Paragraph>
            
            <Descriptions column={2} size="small">
              <Descriptions.Item label="投票类型">
                {vote.type === 'single' ? '单选投票' : '多选投票'}
              </Descriptions.Item>
              <Descriptions.Item label="权限设置">
                {vote.permissionType === 'public' ? '公开投票' : '私有投票'}
              </Descriptions.Item>
              <Descriptions.Item label="开始时间">
                {new Date(vote.startTime).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="结束时间">
                {new Date(vote.endTime).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="最少参与人数">
                {vote.minParticipants || '无限制'}
              </Descriptions.Item>
              <Descriptions.Item label="每人最大投票数">
                {vote.maxVotesPerUser}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 投票选项 */}
          <Card 
            title="投票选项" 
            extra={
              hasVoted ? (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  已投票
                </Tag>
              ) : null
            }
          >
            {vote.status === 'active' && !hasVoted && isConnected ? (
              <div>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {vote.type === 'single' ? (
                    <Radio.Group
                      value={selectedOptions[0]}
                      onChange={(e) => setSelectedOptions([e.target.value])}
                      style={{ width: '100%' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {vote.options.map((option) => (
                          <Radio key={option.id} value={option.id} style={{ width: '100%' }}>
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Text>{option.text}</Text>
                              <Text type="secondary">{option.votes} 票</Text>
                            </Space>
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>
                  ) : (
                    <Checkbox.Group
                      value={selectedOptions}
                      onChange={setSelectedOptions}
                      style={{ width: '100%' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {vote.options.map((option) => (
                          <Checkbox key={option.id} value={option.id} style={{ width: '100%' }}>
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Text>{option.text}</Text>
                              <Text type="secondary">{option.votes} 票</Text>
                            </Space>
                          </Checkbox>
                        ))}
                      </Space>
                    </Checkbox.Group>
                  )}
                </Space>

                <Divider />

                <Space>
                  <Button
                    type="primary"
                    size="large"
                    loading={voting}
                    onClick={handleVote}
                    disabled={selectedOptions.length === 0}
                  >
                    确认投票
                  </Button>
                  <Text type="secondary">
                    已选择 {selectedOptions.length} 个选项
                  </Text>
                </Space>
              </div>
            ) : (
              <div>
                {/* 显示投票结果 */}
                <Space direction="vertical" style={{ width: '100%' }}>
                  {vote.options.map((option) => {
                    const percentage = vote.totalVotes > 0 
                      ? Math.round((option.votes / vote.totalVotes) * 100)
                      : 0;
                    
                    return (
                      <Card key={option.id} size="small">
                        <Row align="middle">
                          <Col flex="auto">
                            <Text strong>{option.text}</Text>
                          </Col>
                          <Col>
                            <Space>
                              <Text>{option.votes} 票</Text>
                              <Text type="secondary">({percentage}%)</Text>
                            </Space>
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

                {!isConnected && vote.status === 'active' && (
                  <Alert
                    message="请连接钱包参与投票"
                    type="info"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}

                {hasVoted && (
                  <Alert
                    message="您已参与此投票"
                    description="感谢您的参与！投票结果将实时更新。"
                    type="success"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}
              </div>
            )}
          </Card>
        </Col>

        {/* 右侧：统计信息和投票历史 */}
        <Col xs={24} lg={8}>
          {/* 投票统计 */}
          <Card title="投票统计" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="参与人数"
                  value={vote.totalParticipants}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="总投票数"
                  value={vote.totalVotes}
                  prefix={<TrophyOutlined />}
                />
              </Col>
            </Row>
            
            <Divider />
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">参与率</Text>
                <Progress
                  percent={vote.minParticipants 
                    ? Math.round((vote.totalParticipants / vote.minParticipants) * 100)
                    : 100
                  }
                  size="small"
                />
              </div>
              
              <Row>
                <Col span={12}>
                  <Text type="secondary">状态</Text>
                  <br />
                  <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
                </Col>
                <Col span={12}>
                  <Text type="secondary">类型</Text>
                  <br />
                  <Tag>{vote.type === 'single' ? '单选' : '多选'}</Tag>
                </Col>
              </Row>
            </Space>
          </Card>

          {/* 最新投票记录 */}
          <Card 
            title="最新投票记录" 
            extra={
              <Button 
                type="link" 
                icon={<EyeOutlined />}
                onClick={() => {/* 查看全部记录 */}}
              >
                查看全部
              </Button>
            }
          >
            <List
              size="small"
              dataSource={voteHistory.slice(0, 5)}
              renderItem={(record) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar size="small" icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <Text style={{ fontSize: '12px' }}>
                          {formatAddress(record.voter)}
                        </Text>
                        {vote.anonymous && <LockOutlined style={{ fontSize: '10px' }} />}
                      </Space>
                    }
                    description={
                      <Space>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {vote.anonymous ? '匿名投票' : `选择: ${record.choice}`}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          {new Date(record.timestamp).toLocaleString()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VoteDetail; 