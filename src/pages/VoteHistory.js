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
  Empty,
  Spin,
  Badge,
  Input,
  Select,
  Tabs,
  Timeline,
  Avatar,
  Tooltip,
  Progress,
  Divider
} from 'antd';
import {
  HistoryOutlined,
  UserOutlined,
  TrophyOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  BarChartOutlined,
  FireOutlined,
  StarOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { getUserCreatedVotes, getUserParticipatedVotes, getVoteInfo, hasUserVoted, getUserVoteChoices } from '../utils/contractUtils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const VoteHistory = () => {
  const navigate = useNavigate();
  const { isConnected, account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('participated');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time');
  
  const [userStats, setUserStats] = useState({
    totalParticipated: 0,
    totalCreated: 0,
    winRate: 0,
    favoriteType: 'single',
    mostActiveDay: '',
    totalVotes: 0
  });

  const [participatedVotes, setParticipatedVotes] = useState([]);
  const [createdVotes, setCreatedVotes] = useState([]);
  const [filteredParticipated, setFilteredParticipated] = useState([]);
  const [filteredCreated, setFilteredCreated] = useState([]);
  const [activityTimeline, setActivityTimeline] = useState([]);

  useEffect(() => {
    if (isConnected && account) {
      loadVoteHistory();
    }
  }, [isConnected, account]);

  useEffect(() => {
    filterVotes();
  }, [participatedVotes, createdVotes, searchTerm, statusFilter, sortBy, activeTab]);

  const loadVoteHistory = async () => {
    setLoading(true);
    try {
      const [participatedResult, createdResult] = await Promise.all([
        getUserParticipatedVotes(account),
        getUserCreatedVotes(account)
      ]);

      let participatedList = [];
      let createdList = [];
      let totalVotesCount = 0;
      let winCount = 0;
      let typeCount = { single: 0, multi: 0 };
      let activityDays = {};

      // Process participated votes
      if (participatedResult.success) {
        for (const voteId of participatedResult.data) {
          try {
            const voteInfoResult = await getVoteInfo(voteId);
            if (voteInfoResult.success) {
              const voteInfo = voteInfoResult.data;
              
              // Get user's vote choices
              const userChoicesResult = await getUserVoteChoices(voteId, account);
              let myChoices = [];
              let myChoiceText = '未知';
              
              if (userChoicesResult.success && userChoicesResult.data.length > 0) {
                myChoices = userChoicesResult.data;
                myChoiceText = myChoices.map(index => voteInfo.options[index]).join(', ');
              }

              // Check if user is a winner (simple logic: selected the option with the most votes)
              let isWinner = false;
              if (voteInfo.status === 'ended' && voteInfo.results && myChoices.length > 0) {
                const maxVotes = Math.max(...voteInfo.results);
                const winnerIndex = voteInfo.results.findIndex(count => count === maxVotes);
                isWinner = myChoices.includes(winnerIndex);
                if (isWinner) winCount++;
              }

              // Count vote type preferences
              typeCount[voteInfo.voteType]++;

              // Count active days
              const activityDate = dayjs(voteInfo.startTime).format('YYYY-MM-DD');
              activityDays[activityDate] = (activityDays[activityDate] || 0) + 1;

              participatedList.push({
                id: voteInfo.id,
                title: voteInfo.title,
                description: voteInfo.description,
                status: voteInfo.status,
                type: voteInfo.voteType,
                participatedTime: voteInfo.startTime,
                endTime: voteInfo.endTime,
                myChoice: myChoiceText,
                myChoices: myChoices,
                isWinner: isWinner,
                participants: voteInfo.totalVoters,
                totalVotes: voteInfo.results ? voteInfo.results.reduce((sum, count) => sum + count, 0) : 0,
                winnerOption: voteInfo.results && voteInfo.options ? 
                  voteInfo.options[voteInfo.results.findIndex(count => count === Math.max(...voteInfo.results))] : '未知'
              });

              totalVotesCount++;
            }
          } catch (error) {
            console.error(`Failed to get information for participated vote ${voteId}:`, error);
          }
        }
      }

      // Process created votes
      if (createdResult.success) {
        for (const voteId of createdResult.data) {
          try {
            const voteInfoResult = await getVoteInfo(voteId);
            if (voteInfoResult.success) {
              const voteInfo = voteInfoResult.data;
              
              // Count active days
              const activityDate = dayjs(voteInfo.startTime).format('YYYY-MM-DD');
              activityDays[activityDate] = (activityDays[activityDate] || 0) + 1;

              createdList.push({
                id: voteInfo.id,
                title: voteInfo.title,
                description: voteInfo.description,
                status: voteInfo.status,
                type: voteInfo.voteType,
                createdTime: voteInfo.startTime,
                endTime: voteInfo.endTime,
                participants: voteInfo.totalVoters,
                totalVotes: voteInfo.results ? voteInfo.results.reduce((sum, count) => sum + count, 0) : 0,
                winnerOption: voteInfo.results && voteInfo.options && voteInfo.results.length > 0 ? 
                  voteInfo.options[voteInfo.results.findIndex(count => count === Math.max(...voteInfo.results))] : '待定',
                participationRate: voteInfo.totalVoters > 0 ? Math.round((voteInfo.results?.reduce((sum, count) => sum + count, 0) || 0) / voteInfo.totalVoters * 100) : 0
              });
            }
          } catch (error) {
            console.error(`Failed to get information for created vote ${voteId}:`, error);
          }
        }
      }

      // Sort by time
      participatedList.sort((a, b) => b.participatedTime - a.participatedTime);
      createdList.sort((a, b) => b.createdTime - a.createdTime);

      // Calculate statistics
      const totalParticipated = participatedList.length;
      const totalCreated = createdList.length;
      const winRate = totalParticipated > 0 ? Math.round((winCount / totalParticipated) * 100) : 0;
      const favoriteType = typeCount.single >= typeCount.multi ? 'single' : 'multi';
      
      // Find the most active day
      const mostActiveDay = Object.keys(activityDays).reduce((a, b) => 
        activityDays[a] > activityDays[b] ? a : b, Object.keys(activityDays)[0] || '');

      setUserStats({
        totalParticipated,
        totalCreated,
        winRate,
        favoriteType,
        mostActiveDay: mostActiveDay ? dayjs(mostActiveDay).format('MM月DD日') : '暂无',
        totalVotes: totalVotesCount
      });

      setParticipatedVotes(participatedList);
      setCreatedVotes(createdList);

      // Generate activity timeline
      const allActivities = [
        ...participatedList.map(vote => ({
          type: 'participated',
          vote,
          time: vote.participatedTime,
          icon: <UserOutlined />,
          color: 'blue'
        })),
        ...createdList.map(vote => ({
          type: 'created',
          vote,
          time: vote.createdTime,
          icon: <TrophyOutlined />,
          color: 'green'
        }))
      ];

      allActivities.sort((a, b) => b.time - a.time);
      setActivityTimeline(allActivities.slice(0, 20)); // Last 20 activities

      setLoading(false);
    } catch (error) {
      console.error('Failed to load vote history:', error);
      setLoading(false);
    }
  };

  const filterVotes = () => {
    const votes = activeTab === 'participated' ? participatedVotes : createdVotes;
    let filtered = [...votes];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vote => vote.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(vote =>
        vote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activeTab === 'participated' && vote.myChoice.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort
    switch (sortBy) {
      case 'time':
        filtered.sort((a, b) => b.participatedTime || b.createdTime - (a.participatedTime || a.createdTime));
        break;
      case 'participants':
        filtered.sort((a, b) => b.participants - a.participants);
        break;
      case 'votes':
        filtered.sort((a, b) => b.totalVotes - a.totalVotes);
        break;
      default:
        break;
    }

    if (activeTab === 'participated') {
      setFilteredParticipated(filtered);
    } else {
      setFilteredCreated(filtered);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      'active': { color: 'green', text: 'Active', icon: <ClockCircleOutlined /> },
      'ended': { color: 'blue', text: 'Ended', icon: <CheckCircleOutlined /> },
      'pending': { color: 'orange', text: 'Pending', icon: <CalendarOutlined /> },
      'cancelled': { color: 'red', text: 'Cancelled', icon: <CheckCircleOutlined /> }
    };
    const config = statusConfig[status] || statusConfig['pending'];
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
  };

  const ParticipatedVoteCard = ({ vote }) => (
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
            <Badge dot={vote.isWinner} status={vote.isWinner ? 'success' : 'default'}>
              <Avatar
                size="large"
                style={{ 
                  backgroundColor: vote.isWinner ? '#52c41a' : '#1890ff'
                }}
                icon={vote.isWinner ? <TrophyOutlined /> : <UserOutlined />}
              />
            </Badge>
          }
          title={
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space>
                <Text strong style={{ fontSize: '16px' }}>{vote.title}</Text>
                {getStatusTag(vote.status)}
                <Tag>{vote.type === 'single' ? 'Single vote' : 'Multiple vote'}</Tag>
                {vote.isWinner && vote.status === 'ended' && (
                  <Tag color="gold" icon={<StarOutlined />}>Winner</Tag>
                )}
              </Space>
            </Space>
          }
          description={
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text type="secondary">{vote.description}</Text>
              
              <div style={{ 
                background: '#f6ffed', 
                border: '1px solid #b7eb8f', 
                borderRadius: 4, 
                padding: 8 
              }}>
                <Text strong>My choice: </Text>
                <Tag color="blue">{vote.myChoice}</Tag>
              </div>

              {vote.status === 'ended' && (
                <div style={{ 
                  background: vote.isWinner ? '#f6ffed' : '#fff2e8', 
                  border: `1px solid ${vote.isWinner ? '#b7eb8f' : '#ffb37a'}`, 
                  borderRadius: 4, 
                  padding: 8 
                }}>
                  <Space>
                    <Text>Final winner: </Text>
                    <Tag color={vote.isWinner ? 'success' : 'orange'}>
                      {vote.winnerOption}
                    </Tag>
                    {vote.isWinner ? (
                      <Tag color="success" icon={<TrophyOutlined />}>Correct prediction</Tag>
                    ) : (
                      <Tag color="warning">Incorrect prediction</Tag>
                    )}
                  </Space>
                </div>
              )}
              
              <Row gutter={16}>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Participants</Text>
                  <br />
                  <Text strong>{vote.participants} people</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Total votes</Text>
                  <br />
                  <Text strong>{vote.totalVotes} votes</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Participated time</Text>
                  <br />
                  <Text style={{ fontSize: '11px' }}>
                    {dayjs(vote.participatedTime).format('MM-DD HH:mm')}
                  </Text>
                </Col>
              </Row>
            </Space>
          }
        />
      </Card>
    </List.Item>
  );

  const CreatedVoteCard = ({ vote }) => (
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
            Manage vote
          </Button>,
          <Button
            type="link"
            icon={<ShareAltOutlined />}
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/vote/${vote.id}`);
              // message.success('Link copied');
            }}
          >
            Share
          </Button>
        ]}
      >
        <Card.Meta
          avatar={
            <Badge count={vote.participants} showZero color="#52c41a">
              <Avatar
                size="large"
                style={{ backgroundColor: '#722ed1' }}
                icon={<TrophyOutlined />}
              />
            </Badge>
          }
          title={
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space>
                <Text strong style={{ fontSize: '16px' }}>{vote.title}</Text>
                {getStatusTag(vote.status)}
                <Tag>{vote.type === 'single' ? 'Single vote' : 'Multiple vote'}</Tag>
                {vote.participants > 10 && (
                  <Tag color="red" icon={<FireOutlined />}>Popular</Tag>
                )}
              </Space>
            </Space>
          }
          description={
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text type="secondary">{vote.description}</Text>
              
              {vote.status === 'ended' && (
                <div style={{ 
                  background: '#f0f5ff', 
                  border: '1px solid #adc6ff', 
                  borderRadius: 4, 
                  padding: 8 
                }}>
                  <Space>
                    <TrophyOutlined style={{ color: '#1890ff' }} />
                    <Text>Final winner: </Text>
                    <Tag color="blue">{vote.winnerOption}</Tag>
                  </Space>
                </div>
              )}
              
              <Row gutter={16}>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Participants</Text>
                  <br />
                  <Text strong>{vote.participants} people</Text>
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Total votes</Text>
                  <br />
                  <Text strong>{vote.totalVotes} votes</Text>
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Participation rate</Text>
                  <br />
                  <Text strong>{vote.participationRate}%</Text>
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Created time</Text>
                  <br />
                  <Text style={{ fontSize: '11px' }}>
                    {dayjs(vote.createdTime).format('MM-DD HH:mm')}
                  </Text>
                </Col>
              </Row>

              {vote.status === 'ended' && vote.participationRate > 0 && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Participation heat</Text>
                  <Progress
                    percent={Math.min(vote.participationRate, 100)}
                    size="small"
                    status={vote.participationRate > 70 ? 'success' : vote.participationRate > 40 ? 'active' : 'normal'}
                  />
                </div>
              )}
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
                Connect your Web3 wallet to view vote history
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
        <Title level={2}>Vote history</Title>
        <Text type="secondary">View your vote participation and creation history</Text>
      </div>

      {/* Statistics cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6} lg={4}>
          <Card>
            <Statistic
              title="Participated votes"
              value={userStats.totalParticipated}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card>
            <Statistic
              title="Created votes"
              value={userStats.totalCreated}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card>
            <Statistic
              title="Win rate"
              value={userStats.winRate}
              suffix="%"
              prefix={<StarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card>
            <Statistic
              title="Preference type"
              value={userStats.favoriteType === 'single' ? 'Single vote' : 'Multiple vote'}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card>
            <Statistic
              title="Most active"
              value={userStats.mostActiveDay}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card>
            <Statistic
              title="Total votes"
              value={userStats.totalVotes}
              prefix={<HistoryOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Main content */}
        <Col xs={24} lg={16}>
          {/* Filter and search */}
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8} md={6}>
                <Input
                  placeholder="Search vote title or description"
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={8} sm={4} md={3}>
                <Select
                  placeholder="Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: '100%' }}
                >
                  <Option value="all">All</Option>
                  <Option value="active">Active</Option>
                  <Option value="ended">Ended</Option>
                  <Option value="pending">Pending</Option>
                </Select>
              </Col>
              <Col xs={8} sm={4} md={3}>
                <Select
                  placeholder="Sort"
                  value={sortBy}
                  onChange={setSortBy}
                  style={{ width: '100%' }}
                >
                  <Option value="time">Time</Option>
                  <Option value="participants">Participation</Option>
                  <Option value="votes">Votes</Option>
                </Select>
              </Col>
              <Col xs={8} sm={4} md={3}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={loadVoteHistory}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Vote history tabs */}
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane 
                tab={
                  <Space>
                    <UserOutlined />
                    Participated votes ({userStats.totalParticipated})
                  </Space>
                } 
                key="participated"
              >
                <Spin spinning={loading}>
                  {filteredParticipated.length > 0 ? (
                    <List
                      grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 1,
                        md: 1,
                        lg: 1,
                        xl: 2,
                      }}
                      dataSource={filteredParticipated}
                      renderItem={(vote) => <ParticipatedVoteCard vote={vote} />}
                    />
                  ) : (
                    <Empty 
                      description="No participated record"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </Spin>
              </TabPane>

              <TabPane 
                tab={
                  <Space>
                    <TrophyOutlined />
                    Created votes ({userStats.totalCreated})
                  </Space>
                } 
                key="created"
              >
                <Spin spinning={loading}>
                  {filteredCreated.length > 0 ? (
                    <List
                      grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 1,
                        md: 1,
                        lg: 1,
                        xl: 2,
                      }}
                      dataSource={filteredCreated}
                      renderItem={(vote) => <CreatedVoteCard vote={vote} />}
                    />
                  ) : (
                    <Empty 
                      description="No created record"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </Spin>
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        {/* Right - activity timeline */}
        <Col xs={24} lg={8}>
          <Card title="Recent activities">
            <Spin spinning={loading}>
              {activityTimeline.length > 0 ? (
                <Timeline mode="left">
                  {activityTimeline.map((activity, index) => (
                    <Timeline.Item
                      key={index}
                      color={activity.color}
                      dot={
                        <Avatar
                          size="small"
                          style={{ backgroundColor: activity.color }}
                          icon={activity.icon}
                        />
                      }
                    >
                      <Space direction="vertical" size={4}>
                        <Text style={{ fontSize: '12px', color: '#999' }}>
                          {dayjs(activity.time).format('MM-DD HH:mm')}
                        </Text>
                        <Text strong style={{ fontSize: '14px' }}>
                          {activity.type === 'participated' ? 'Participated in vote' : 'Created vote'}
                        </Text>
                        <Tooltip title={activity.vote.title}>
                          <Button
                            type="link"
                            size="small"
                            style={{ padding: 0, height: 'auto', fontSize: '12px' }}
                            onClick={() => navigate(`/vote/${activity.vote.id}`)}
                          >
                            {activity.vote.title.length > 20 
                              ? `${activity.vote.title.substring(0, 20)}...`
                              : activity.vote.title
                            }
                          </Button>
                        </Tooltip>
                      </Space>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty 
                  description="No activity record"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VoteHistory; 