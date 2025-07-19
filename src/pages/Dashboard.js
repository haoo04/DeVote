import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  List, 
  Button, 
  Typography, 
  Space,
  Progress,
  Tag,
  Empty,
  Spin
} from 'antd';
import { 
  PlusOutlined, 
  TrophyOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  EyeOutlined,
  PercentageOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { getAllVoteIds, getVoteInfo, getUserCreatedVotes, getUserParticipatedVotes } from '../utils/contractUtils';

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const { isConnected, account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalVotes: 0,
    activeVotes: 0,
    participatedVotes: 0,
    totalParticipants: 0
  });
  const [recentVotes, setRecentVotes] = useState([]);
  const [myVotes, setMyVotes] = useState([]);

  useEffect(() => {
    if (isConnected) {
      loadData();
    }
  }, [isConnected]);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // 从智能合约获取统计数据
      const allVoteIdsResult = await getAllVoteIds();
      if (allVoteIdsResult.success) {
        const voteIds = allVoteIdsResult.data;
        const totalVotes = voteIds.length;
        
        // 获取所有投票信息来统计活跃投票数和参与人数
        let activeVotes = 0;
        let totalParticipants = 0;
        const allVotesInfo = [];
        
        for (const voteId of voteIds) {
          const voteInfoResult = await getVoteInfo(voteId);
          if (voteInfoResult.success) {
            const voteInfo = voteInfoResult.data;
            allVotesInfo.push(voteInfo);
            
            // 统计活跃投票
            if (voteInfo.status === 'active') {
              activeVotes++;
            }
            
            // 统计总参与人数
            totalParticipants += voteInfo.totalVoters;
          }
        }
        
        // 获取用户参与的投票数
        let participatedVotes = 0;
        if (account) {
          const userParticipatedResult = await getUserParticipatedVotes(account);
          if (userParticipatedResult.success) {
            participatedVotes = userParticipatedResult.data.length;
          }
        }
        
        setStats({
          totalVotes,
          activeVotes,
          participatedVotes,
          totalParticipants
        });

        // 获取最近的投票列表（最近5个）
        const recentVotesList = allVotesInfo
          .sort((a, b) => b.startTime - a.startTime)
          .slice(0, 5)
          .map(vote => {
            // 直接使用getVoteInfo返回的正确状态，不再需要重复判断
            return {
              id: vote.id,
              title: vote.title,
              description: vote.description,
              status: vote.status, // 直接使用已经过时间判断的状态
              participants: vote.totalVoters,
              totalVotes: vote.totalVoters,
              endTime: new Date(vote.endTime).toLocaleDateString(),
              startTime: vote.startTime,
              endTimestamp: vote.endTime
            };
          });
        
        setRecentVotes(recentVotesList);

        // 获取我创建的投票
        if (account) {
          const myVotesResult = await getUserCreatedVotes(account);
          if (myVotesResult.success) {
            const myVotesList = [];
            for (const voteId of myVotesResult.data.slice(0, 5)) {
              const voteInfoResult = await getVoteInfo(voteId);
              if (voteInfoResult.success) {
                const voteInfo = voteInfoResult.data;
                // 直接使用getVoteInfo返回的正确状态，不再需要重复判断
                myVotesList.push({
                  id: voteInfo.id,
                  title: voteInfo.title,
                  description: voteInfo.description,
                  status: voteInfo.status, // 直接使用已经过时间判断的状态
                  participants: voteInfo.totalVoters,
                  totalVotes: voteInfo.totalVoters,
                  endTime: new Date(voteInfo.endTime).toLocaleDateString(),
                  startTime: voteInfo.startTime,
                  endTimestamp: voteInfo.endTime
                });
              }
            }
            setMyVotes(myVotesList);
          }
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('加载数据失败:', error);
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'active': { color: 'green', text: '进行中' },
      'ended': { color: 'blue', text: '已结束' },
      'completed': { color: 'blue', text: '已结束' },
      'pending': { color: 'orange', text: '未开始' },
      'cancelled': { color: 'red', text: '已取消' }
    };
    const config = statusMap[status] || statusMap['pending'];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 计算投票时间进度
  const calculateTimeProgress = (item) => {
    if (item.status === 'ended' || item.status === 'completed' || item.status === 'cancelled') {
      return 100;
    }
    if (item.status === 'pending') {
      return 0;
    }
    
    const now = Date.now();
    const start = item.startTime;
    const end = item.endTimestamp;
    const total = end - start;
    const elapsed = now - start;
    
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const StatCard = ({ title, value, icon, suffix, loading }) => (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={icon}
        suffix={suffix}
        loading={loading}
      />
    </Card>
  );

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Empty
          description={
            <div>
              <Title level={4}>请先连接钱包</Title>
              <Text type="secondary">
                连接您的Web3钱包以访问DeVote平台
              </Text>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>仪表板</Title>
        <Text type="secondary">欢迎回到DeVote去中心化投票平台</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="总投票数"
            value={stats.totalVotes}
            icon={<TrophyOutlined />}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="进行中投票"
            value={stats.activeVotes}
            icon={<ClockCircleOutlined />}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="我参与的投票"
            value={stats.participatedVotes}
            icon={<UserOutlined />}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="总参与人数"
            value={stats.totalParticipants}
            icon={<PercentageOutlined />}
            loading={loading}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 最新投票 */}
        <Col xs={24} lg={14}>
          <Card 
            title="最新投票" 
            extra={
              <Button 
                type="link" 
                onClick={() => navigate('/votes')}
              >
                查看全部
              </Button>
            }
          >
            <Spin spinning={loading}>
              {recentVotes.length > 0 ? (
                <List
                  dataSource={recentVotes}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button 
                          type="link" 
                          icon={<EyeOutlined />}
                          onClick={() => navigate(`/vote/${item.id}`)}
                        >
                          查看详情
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            {item.title}
                            {getStatusTag(item.status)}
                          </Space>
                        }
                        description={
                          <div>
                            <Text type="secondary">{item.description}</Text>
                            <br />
                            <Space style={{ marginTop: 8 }}>
                              <Text type="secondary">
                                <UserOutlined /> {item.participants} 人参与
                              </Text>
                              <Text type="secondary">
                                <ClockCircleOutlined /> 截止: {item.endTime}
                              </Text>
                            </Space>
                            {item.status !== 'pending' && (
                              <Progress 
                                percent={calculateTimeProgress(item)} 
                                size="small" 
                                style={{ marginTop: 8 }}
                              />
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无最新投票"
                />
              )}
            </Spin>
          </Card>
        </Col>

        {/* 我的投票 & 快速操作 */}
        <Col xs={24} lg={10}>
          <Card 
            title="快速操作" 
            style={{ marginBottom: 16 }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                block 
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate('/create')}
              >
                发起新投票
              </Button>
              <Button 
                block 
                onClick={() => navigate('/votes')}
              >
                浏览所有投票
              </Button>
              <Button 
                block 
                onClick={() => navigate('/profile')}
              >
                查看我的资料
              </Button>
            </Space>
          </Card>

          <Card title="我发起的投票">
            <Spin spinning={loading}>
              {myVotes.length > 0 ? (
                <List
                  size="small"
                  dataSource={myVotes}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button 
                          type="link" 
                          size="small"
                          onClick={() => navigate(`/vote/${item.id}`)}
                        >
                          管理
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text style={{ fontSize: '14px' }}>{item.title}</Text>
                            {getStatusTag(item.status)}
                          </Space>
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {item.participants} 人参与 · 截止: {item.endTime}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="您还没有发起过投票"
                  style={{ padding: '20px 0' }}
                />
              )}
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 