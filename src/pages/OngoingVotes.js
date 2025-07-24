import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Progress,
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
  Tooltip
} from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  BarChartOutlined,
  EyeOutlined,
  FireOutlined,
  TrophyOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { getContract, getVoteInfo, getAllVoteIds } from '../utils/contractUtils';

const { Title, Text } = Typography;
const { Option } = Select;

const OngoingVotes = () => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [ongoingVotes, setOngoingVotes] = useState([]);
  const [filteredVotes, setFilteredVotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('startTime');
  const [stats, setStats] = useState({
    totalOngoing: 0,
    totalParticipants: 0,
    avgParticipation: 0,
    hottest: null
  });

  useEffect(() => {
    if (isConnected) {
      loadOngoingVotes();
    }
  }, [isConnected]);

  useEffect(() => {
    filterAndSortVotes();
  }, [ongoingVotes, searchTerm, sortBy]);

  const loadOngoingVotes = async () => {
    setLoading(true);
    try {
      const contract = await getContract();
      const voteCount = await contract.voteCount();
      
      const ongoingVotesList = [];
      let totalParticipants = 0;
      let hottestVote = null;
      let maxParticipants = 0;

      for (let i = 0; i < voteCount; i++) {
        try {
          const voteInfo = await contract.getVoteInfo(i);
          const voteResults = await contract.getVoteResults(i);
          
          // Get timestamp (milliseconds)
          const startTime = Number(voteInfo.startTime) * 1000;
          const endTime = Number(voteInfo.endTime) * 1000;
          const currentTime = Date.now();
          
          // Only get ongoing votes
          if (currentTime >= startTime && currentTime <= endTime && voteInfo.status !== 2) {
            const participants = Number(voteInfo.totalVoters);
            const totalVotesCount = voteResults.reduce((sum, count) => sum + Number(count), 0);
            
            // Calculate vote progress
            const timeProgress = Math.min(Math.max((currentTime - startTime) / (endTime - startTime) * 100, 0), 100);
            
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
              timeProgress: timeProgress,
              timeRemaining: Math.max(0, endTime - currentTime),
              options: voteInfo.options,
              results: voteResults.map(count => Number(count)),
              isHot: participants > 10 // More than 10 participants are considered hot
            };

            ongoingVotesList.push(voteData);
            totalParticipants += participants;

            // Find the hottest vote
            if (participants > maxParticipants) {
              maxParticipants = participants;
              hottestVote = voteData;
            }
          }
        } catch (voteError) {
          console.error(`Failed to get vote ${i} information:`, voteError);
        }
      }

      // Sort by start time (newest first)
      ongoingVotesList.sort((a, b) => b.startTimestamp - a.startTimestamp);

      setOngoingVotes(ongoingVotesList);
      setStats({
        totalOngoing: ongoingVotesList.length,
        totalParticipants: totalParticipants,
        avgParticipation: ongoingVotesList.length > 0 ? Math.round(totalParticipants / ongoingVotesList.length) : 0,
        hottest: hottestVote
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to load ongoing votes:', error);
      setLoading(false);
    }
  };

  const filterAndSortVotes = () => {
    let filtered = [...ongoingVotes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(vote =>
        vote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'startTime':
        filtered.sort((a, b) => b.startTimestamp - a.startTimestamp);
        break;
      case 'endTime':
        filtered.sort((a, b) => a.endTimestamp - b.endTimestamp);
        break;
      case 'participants':
        filtered.sort((a, b) => b.participants - a.participants);
        break;
      case 'progress':
        filtered.sort((a, b) => b.timeProgress - a.timeProgress);
        break;
      default:
        break;
    }

    setFilteredVotes(filtered);
  };

  const formatTimeRemaining = (timeRemaining) => {
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} days ${hours} hours`;
    } else if (hours > 0) {
      return `${hours} hours ${minutes} minutes`;
    } else {
      return `${minutes}分钟`;
    }
  };

  const getProgressStatus = (progress) => {
    if (progress < 30) return 'normal';
    if (progress < 70) return 'active';
    return 'exception';
  };

  const VoteCard = ({ vote }) => (
    <List.Item>
      <Card
        hoverable
        style={{ width: '100%' }}
        actions={[
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/vote/${vote.id}`)}
          >
            Participate in the vote
          </Button>
        ]}
      >
        <Card.Meta
          avatar={
            <Badge dot={vote.isHot} status="error">
              <Avatar
                size="large"
                style={{ backgroundColor: '#52c41a' }}
                icon={<ClockCircleOutlined />}
              />
            </Badge>
          }
          title={
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space>
                <Text strong style={{ fontSize: '16px' }}>{vote.title}</Text>
                <Tag color="green">Ongoing</Tag>
                <Tag>{vote.type === 'single' ? 'Single choice' : 'Multi-choice'}</Tag>
                {vote.isHot && <Tag color="red" icon={<FireOutlined />}>Hot</Tag>}
              </Space>
            </Space>
          }
          description={
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Text type="secondary">{vote.description}</Text>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Space>
                    <UserOutlined />
                    <Text type="secondary">{vote.participants} people participated</Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space>
                    <BarChartOutlined />
                    <Text type="secondary">{vote.totalVotes} votes</Text>
                  </Space>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Start time</Text>
                  <br />
                  <Text style={{ fontSize: '12px' }}>
                    {vote.startTime.toLocaleDateString()} {vote.startTime.toLocaleTimeString()}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">End time</Text>
                  <br />
                  <Text style={{ fontSize: '12px' }}>
                    {vote.endTime.toLocaleDateString()} {vote.endTime.toLocaleTimeString()}
                  </Text>
                </Col>
              </Row>

              <div>
                <Space justify="space-between" style={{ width: '100%' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Time progress
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Remaining: {formatTimeRemaining(vote.timeRemaining)}
                  </Text>
                </Space>
                <Progress
                  percent={Math.round(vote.timeProgress)}
                  size="small"
                  status={getProgressStatus(vote.timeProgress)}
                />
              </div>
            </Space>
          }
        />
      </Card>
    </List.Item>
  );

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Empty
          description={
            <div>
              <Title level={4}>Please connect your wallet</Title>
              <Text type="secondary">
                Connect your Web3 wallet to view ongoing votes
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
        <Title level={2}>Ongoing votes</Title>
        <Text type="secondary">All ongoing votes</Text>
      </div>

      {/* Statistics cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ongoing votes"
              value={stats.totalOngoing}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total participants"
              value={stats.totalParticipants}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
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
              title="Hottest vote"
              value={stats.hottest ? stats.hottest.participants : 0}
              suffix="people"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
            {stats.hottest && (
              <div style={{ marginTop: 8 }}>
                <Tooltip title={stats.hottest.title}>
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => navigate(`/vote/${stats.hottest.id}`)}
                  >
                    View hot
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
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search vote title or description"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Sort by"
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
            >
              <Option value="startTime">Latest</Option>
              <Option value="endTime">Ending soon</Option>
              <Option value="participants">Participants</Option>
              <Option value="progress">Time progress</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Button
              icon={<FilterOutlined />}
              onClick={loadOngoingVotes}
              loading={loading}
            >
              Refresh
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text type="secondary">
              Total {filteredVotes.length} ongoing votes
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
              searchTerm || sortBy !== 'startTime'
                ? 'No ongoing votes found'
                : loading ? 'Loading vote data...' : 'No ongoing votes'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Spin>
    </div>
  );
};

export default OngoingVotes; 