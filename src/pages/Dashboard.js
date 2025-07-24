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
      // Get statistics data from smart contract
      const allVoteIdsResult = await getAllVoteIds();
      if (allVoteIdsResult.success) {
        const voteIds = allVoteIdsResult.data;
        const totalVotes = voteIds.length;
        
        // Get all vote information to count active votes and participants
        let activeVotes = 0;
        let totalParticipants = 0;
        const allVotesInfo = [];
        
        for (const voteId of voteIds) {
          const voteInfoResult = await getVoteInfo(voteId);
          if (voteInfoResult.success) {
            const voteInfo = voteInfoResult.data;
            allVotesInfo.push(voteInfo);
            
            // Count active votes
            if (voteInfo.status === 'active') {
              activeVotes++;
            }
            
            // Count total participants
            totalParticipants += voteInfo.totalVoters;
          }
        }
        
        // Get the number of votes the user participated in
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

        // Get the list of recent votes (the last 5)
        const recentVotesList = allVotesInfo
          .sort((a, b) => b.startTime - a.startTime)
          .slice(0, 5)
          .map(vote => {
            // Use the correct status returned by getVoteInfo, no need to repeat the check
            return {
              id: vote.id,
              title: vote.title,
              description: vote.description,
              status: vote.status, // Use the status that has already passed the time check
              participants: vote.totalVoters,
              totalVotes: vote.totalVoters,
              endTime: new Date(vote.endTime).toLocaleDateString(),
              startTime: vote.startTime,
              endTimestamp: vote.endTime
            };
          });
        
        setRecentVotes(recentVotesList);

        // Get the votes I created
        if (account) {
          const myVotesResult = await getUserCreatedVotes(account);
          if (myVotesResult.success) {
            const myVotesList = [];
            for (const voteId of myVotesResult.data.slice(0, 5)) {
              const voteInfoResult = await getVoteInfo(voteId);
              if (voteInfoResult.success) {
                const voteInfo = voteInfoResult.data;
                // Use the correct status returned by getVoteInfo, no need to repeat the check
                myVotesList.push({
                  id: voteInfo.id,
                  title: voteInfo.title,
                  description: voteInfo.description,
                  status: voteInfo.status, // Use the status that has already passed the time check
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
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'active': { color: 'green', text: 'Active' },
      'ended': { color: 'blue', text: 'Ended' },
      'completed': { color: 'blue', text: 'Ended' },
      'pending': { color: 'orange', text: 'Pending' },
      'cancelled': { color: 'red', text: 'Cancelled' }
    };
    const config = statusMap[status] || statusMap['pending'];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Calculate the progress of the vote time
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
              <Title level={4}>Please connect your wallet</Title>
              <Text type="secondary">
                Connect your Web3 wallet to access the DeVote platform
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
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">Welcome back to the DeVote decentralized voting platform</Text>
      </div>

      {/* Statistics cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total votes"
            value={stats.totalVotes}
            icon={<TrophyOutlined />}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Active votes"
            value={stats.activeVotes}
            icon={<ClockCircleOutlined />}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Votes I participated in"
            value={stats.participatedVotes}
            icon={<UserOutlined />}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total participants"
            value={stats.totalParticipants}
            icon={<PercentageOutlined />}
            loading={loading}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Latest votes */}
        <Col xs={24} lg={14}>
          <Card 
            title="Latest votes" 
            extra={
              <Button 
                type="link" 
                onClick={() => navigate('/votes')}
              >
                View all
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
                          View details
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
                                <UserOutlined /> {item.participants} people participated
                              </Text>
                              <Text type="secondary">
                                <ClockCircleOutlined /> End time: {item.endTime}
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
                  description="No latest votes"
                />
              )}
            </Spin>
          </Card>
        </Col>

        {/* My votes & Quick actions */}
        <Col xs={24} lg={10}>
          <Card 
            title="Quick actions" 
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
                Create a new vote
              </Button>
              <Button 
                block 
                onClick={() => navigate('/votes')}
              >
                Browse all votes
              </Button>
              <Button 
                block 
                onClick={() => navigate('/profile')}
              >
                View my profile
              </Button>
            </Space>
          </Card>

          <Card title="Votes I created">
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
                          Manage
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
                            {item.participants} people participated · End time: {item.endTime}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="You haven't created any votes yet"
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