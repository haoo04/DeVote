import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Button,
  Avatar,
  Empty,
  Spin,
  Badge,
  Input,
  Select,
  Tooltip,
  Progress
} from 'antd';
import {
  TrophyOutlined,
  UserOutlined,
  BarChartOutlined,
  EyeOutlined,
  CrownOutlined,
  CalendarOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { getContract, getVoteInfo, getAllVoteIds } from '../utils/contractUtils';

const { Title, Text } = Typography;
const { Option } = Select;

const CompletedVotes = () => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [completedVotes, setCompletedVotes] = useState([]);
  const [filteredVotes, setFilteredVotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('endTime');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalParticipants: 0,
    avgParticipation: 0,
    mostPopular: null
  });

  useEffect(() => {
    if (isConnected) {
      loadCompletedVotes();
    }
  }, [isConnected]);

  useEffect(() => {
    filterAndSortVotes();
  }, [completedVotes, searchTerm, sortBy, filterType]);

  const loadCompletedVotes = async () => {
    setLoading(true);
    try {
      const contract = await getContract();
      const voteCount = await contract.voteCount();
      
      const completedVotesList = [];
      let totalParticipants = 0;
      let mostPopularVote = null;
      let maxParticipants = 0;

      for (let i = 0; i < voteCount; i++) {
        try {
          const voteInfo = await contract.getVoteInfo(i);
          const voteResults = await contract.getVoteResults(i);
          
          // Get timestamp (milliseconds)
          const startTime = Number(voteInfo.startTime) * 1000;
          const endTime = Number(voteInfo.endTime) * 1000;
          const currentTime = Date.now();
          
          // Only get completed votes
          if (currentTime > endTime || voteInfo.status === 1) {
            const participants = Number(voteInfo.totalVoters);
            const results = voteResults.map(count => Number(count));
            const totalVotesCount = results.reduce((sum, count) => sum + count, 0);
            
            // Find the winning option
            const maxVotes = Math.max(...results);
            const winnerIndex = results.findIndex(count => count === maxVotes);
            const winner = voteInfo.options[winnerIndex];
            const winnerPercentage = totalVotesCount > 0 ? Math.round((maxVotes / totalVotesCount) * 100) : 0;
            
            // Calculate the distribution of vote participation rates
            const participationData = results.map((count, index) => ({
              option: voteInfo.options[index],
              votes: count,
              percentage: totalVotesCount > 0 ? Math.round((count / totalVotesCount) * 100) : 0
            }));

            const voteData = {
              id: Number(voteInfo.id),
              title: voteInfo.title,
              description: voteInfo.description,
              creator: voteInfo.creator,
              type: Number(voteInfo.voteType) === 0 ? 'single' : 'multi',
              startTime: new Date(startTime),
              endTime: new Date(endTime),
              startTimestamp: startTime,
              endTimestamp: endTime,
              participants: participants,
              totalVotes: totalVotesCount,
              options: voteInfo.options,
              results: results,
              winner: winner,
              winnerIndex: winnerIndex,
              winnerVotes: maxVotes,
              winnerPercentage: winnerPercentage,
              participationData: participationData,
              duration: endTime - startTime,
              status: voteInfo.status === 2 ? 'cancelled' : 'completed'
            };

            completedVotesList.push(voteData);
            totalParticipants += participants;

            // Find the vote with the most participants
            if (participants > maxParticipants) {
              maxParticipants = participants;
              mostPopularVote = voteData;
            }
          }
        } catch (voteError) {
          console.error(`Failed to get vote ${i} information:`, voteError);
        }
      }

      // Sort by end time (newest first)
      completedVotesList.sort((a, b) => b.endTimestamp - a.endTimestamp);

      setCompletedVotes(completedVotesList);
      setStats({
        totalCompleted: completedVotesList.filter(v => v.status === 'completed').length,
        totalParticipants: totalParticipants,
        avgParticipation: completedVotesList.length > 0 ? Math.round(totalParticipants / completedVotesList.length) : 0,
        mostPopular: mostPopularVote
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to load completed votes:', error);
      setLoading(false);
    }
  };

  const filterAndSortVotes = () => {
    let filtered = [...completedVotes];

    // Status filter
    if (filterType !== 'all') {
      filtered = filtered.filter(vote => vote.status === filterType);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(vote =>
        vote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.winner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'endTime':
        filtered.sort((a, b) => b.endTimestamp - a.endTimestamp);
        break;
      case 'participants':
        filtered.sort((a, b) => b.participants - a.participants);
        break;
      case 'votes':
        filtered.sort((a, b) => b.totalVotes - a.totalVotes);
        break;
      case 'winnerPercentage':
        filtered.sort((a, b) => b.winnerPercentage - a.winnerPercentage);
        break;
      default:
        break;
    }

    setFilteredVotes(filtered);
  };

  const formatDuration = (duration) => {
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} days ${hours} hours`;
    } else {
      return `${hours} hours`;
    }
  };

  const getStatusConfig = (status) => {
    return status === 'completed' 
      ? { color: 'blue', text: 'Completed', icon: <CheckCircleOutlined /> }
      : { color: 'red', text: 'Cancelled', icon: <CheckCircleOutlined /> };
  };

  const VoteCard = ({ vote }) => {
    const statusConfig = getStatusConfig(vote.status);
    
    return (
      <List.Item>
        <Card
          hoverable
          style={{ width: '100%' }}
          actions={[
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/vote/${vote.id}`)}
            >
              View details
            </Button>
          ]}
        >
          <Card.Meta
            avatar={
              <Badge dot={vote.participants > 20} status="success">
                <Avatar
                  size="large"
                  style={{ backgroundColor: vote.status === 'completed' ? '#1890ff' : '#ff4d4f' }}
                  icon={statusConfig.icon}
                />
              </Badge>
            }
            title={
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Space>
                  <Text strong style={{ fontSize: '16px' }}>{vote.title}</Text>
                  <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
                  <Tag>{vote.type === 'single' ? 'Single choice' : 'Multi-choice'}</Tag>
                  {vote.participants > 20 && <Tag color="gold" icon={<CrownOutlined />}>Popular</Tag>}
                </Space>
              </Space>
            }
            description={
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Text type="secondary">{vote.description}</Text>
                
                {vote.status === 'completed' && (
                  <div style={{ 
                    background: '#f6ffed', 
                    border: '1px solid #b7eb8f', 
                    borderRadius: 4, 
                    padding: 8 
                  }}>
                    <Space>
                      <TrophyOutlined style={{ color: '#52c41a' }} />
                      <Text strong>Winning option: {vote.winner}</Text>
                      <Tag color="success">{vote.winnerVotes} 票 ({vote.winnerPercentage}%)</Tag>
                    </Space>
                  </div>
                )}
                
                <Row gutter={16}>
                  <Col span={8}>
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Participation count</Text>
                      <Text strong>{vote.participants} people</Text>
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Total votes</Text>
                      <Text strong>{vote.totalVotes} votes</Text>
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Duration</Text>
                      <Text strong>{formatDuration(vote.duration)}</Text>
                    </Space>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Start time</Text>
                    <br />
                    <Text style={{ fontSize: '11px' }}>
                      {vote.startTime.toLocaleDateString()}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>End time</Text>
                    <br />
                    <Text style={{ fontSize: '11px' }}>
                      {vote.endTime.toLocaleDateString()}
                    </Text>
                  </Col>
                </Row>

                {vote.status === 'completed' && (
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Vote distribution</Text>
                    <div style={{ marginTop: 4 }}>
                      {vote.participationData.slice(0, 3).map((item, index) => (
                        <div key={index} style={{ marginBottom: 4 }}>
                          <Space justify="space-between" style={{ width: '100%' }}>
                            <Text style={{ fontSize: '11px' }}>{item.option}</Text>
                            <Text style={{ fontSize: '11px' }}>{item.percentage}%</Text>
                          </Space>
                          <Progress
                            percent={item.percentage}
                            size="small"
                            showInfo={false}
                            strokeColor={index === vote.winnerIndex ? '#52c41a' : '#d9d9d9'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Space>
            }
          />
        </Card>
      </List.Item>
    );
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Empty
          description={
            <div>
              <Title level={4}>Please connect your wallet</Title>
              <Text type="secondary">
                Connect your Web3 wallet to view completed votes
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
        <Title level={2}>Completed votes</Title>
        <Text type="secondary">View all completed votes and their results</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed votes"
              value={stats.totalCompleted}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total participants"
              value={stats.totalParticipants}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Average participation"
              value={stats.avgParticipation}
              suffix="people/vote"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Most popular"
              value={stats.mostPopular ? stats.mostPopular.participants : 0}
              suffix="people"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
            {stats.mostPopular && (
              <div style={{ marginTop: 8 }}>
                <Tooltip title={stats.mostPopular.title}>
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => navigate(`/vote/${stats.mostPopular.id}`)}
                  >
                    View details
                  </Button>
                </Tooltip>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Filter and search */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Search vote title or winning option"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4} md={3}>
            <Select
              placeholder="Status"
              value={filterType}
              onChange={setFilterType}
              style={{ width: '100%' }}
            >
              <Option value="all">All</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Sort by"
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
            >
              <Option value="endTime">End time</Option>
              <Option value="participants">Participation count</Option>
              <Option value="votes">Total votes</Option>
              <Option value="winnerPercentage">Winner percentage</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4} md={3}>
            <Button
              icon={<FilterOutlined />}
              onClick={loadCompletedVotes}
              loading={loading}
            >
              Refresh
            </Button>
          </Col>
          <Col xs={24} sm={8} md={8}>
            <Text type="secondary">
              Total {filteredVotes.length} completed votes
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Vote list */}
      <Spin spinning={loading}>
        {filteredVotes.length > 0 ? (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 2,
              xl: 2,
              xxl: 3,
            }}
            dataSource={filteredVotes}
            renderItem={(vote) => <VoteCard vote={vote} />}
          />
        ) : (
          <Empty
            description={
              searchTerm || filterType !== 'all' || sortBy !== 'endTime'
                ? 'No completed votes found'
                : loading ? 'Loading vote data...' : 'No completed votes'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Spin>
    </div>
  );
};

export default CompletedVotes; 