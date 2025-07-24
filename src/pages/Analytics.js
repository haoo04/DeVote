import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Button,
  DatePicker,
  Select,
  Empty,
  Spin,
  Progress,
  List,
  Tag,
  Divider,
  Tooltip,
  Badge,
  Avatar
} from 'antd';
import {
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  TrophyOutlined,
  UserOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  DownloadOutlined,
  CalendarOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { getContract, getVoteInfo, getAllVoteIds } from '../utils/contractUtils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics = () => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [analyticsType, setAnalyticsType] = useState('overview');
  
  const [overallStats, setOverallStats] = useState({
    totalVotes: 0,
    activeVotes: 0,
    completedVotes: 0,
    totalParticipants: 0,
    avgParticipation: 0,
    totalVotesCount: 0
  });

  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [participationAnalysis, setParticipationAnalysis] = useState([]);
  const [typeAnalysis, setTypeAnalysis] = useState({
    single: { count: 0, participation: 0 },
    multi: { count: 0, participation: 0 }
  });
  const [topVotes, setTopVotes] = useState([]);
  const [trendsData, setTrendsData] = useState([]);

  useEffect(() => {
    if (isConnected) {
      loadAnalyticsData();
    }
  }, [isConnected, dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const contract = await getContract();
      const voteCount = await contract.voteCount();
      
      const allVotes = [];
      let totalParticipants = 0;
      let totalVotesCount = 0;
      let activeCount = 0;
      let completedCount = 0;
      
      const singleChoiceStats = { count: 0, participation: 0 };
      const multiChoiceStats = { count: 0, participation: 0 };
      
      const dailyData = {};
      const currentTime = Date.now();

      for (let i = 0; i < voteCount; i++) {
        try {
          const voteInfo = await contract.getVoteInfo(i);
          const voteResults = await contract.getVoteResults(i);
          
          const startTime = Number(voteInfo.startTime) * 1000;
          const endTime = Number(voteInfo.endTime) * 1000;
          const participants = Number(voteInfo.totalVoters);
          const votesCount = voteResults.reduce((sum, count) => sum + Number(count), 0);
          const voteType = Number(voteInfo.voteType) === 0 ? 'single' : 'multi';
          
          // Determine the status 
          let status = 'active';
          if (currentTime > endTime || voteInfo.status === 1) {
            status = 'completed';
            completedCount++;
          } else if (voteInfo.status === 2) {
            status = 'cancelled';
          } else if (currentTime >= startTime && currentTime <= endTime) {
            activeCount++;
          }
          
          // Filter date range
          const voteStartDate = dayjs(startTime);
          const rangeStart = dateRange[0];
          const rangeEnd = dateRange[1];
          
          if (voteStartDate.isBetween(rangeStart, rangeEnd, 'day', '[]')) {
            const voteData = {
              id: Number(voteInfo.id),
              title: voteInfo.title,
              description: voteInfo.description,
              startTime: startTime,
              endTime: endTime,
              participants: participants,
              totalVotes: votesCount,
              type: voteType,
              status: status,
              duration: endTime - startTime,
              participationRate: participants > 0 ? Math.round((votesCount / participants) * 100) : 0
            };
            
            allVotes.push(voteData);
            totalParticipants += participants;
            totalVotesCount += votesCount;
            
            // Count vote type
            if (voteType === 'single') {
              singleChoiceStats.count++;
              singleChoiceStats.participation += participants;
            } else {
              multiChoiceStats.count++;
              multiChoiceStats.participation += participants;
            }
            
            // Count daily data
            const dateKey = voteStartDate.format('YYYY-MM-DD');
            if (!dailyData[dateKey]) {
              dailyData[dateKey] = {
                date: dateKey,
                votes: 0,
                participants: 0,
                totalVotes: 0
              };
            }
            dailyData[dateKey].votes++;
            dailyData[dateKey].participants += participants;
            dailyData[dateKey].totalVotes += votesCount;
          }
        } catch (error) {
          console.error(`Failed to get vote ${i} analysis data:`, error);
        }
      }

      // Set overall statistics
      setOverallStats({
        totalVotes: allVotes.length,
        activeVotes: activeCount,
        completedVotes: completedCount,
        totalParticipants: totalParticipants,
        avgParticipation: allVotes.length > 0 ? Math.round(totalParticipants / allVotes.length) : 0,
        totalVotesCount: totalVotesCount
      });

      // Set vote type analysis
      setTypeAnalysis({
        single: {
          count: singleChoiceStats.count,
          participation: singleChoiceStats.count > 0 ? Math.round(singleChoiceStats.participation / singleChoiceStats.count) : 0
        },
        multi: {
          count: multiChoiceStats.count,
          participation: multiChoiceStats.count > 0 ? Math.round(multiChoiceStats.participation / multiChoiceStats.count) : 0
        }
      });

      // Time series data
      const timeData = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
      setTimeSeriesData(timeData);

      // Participation analysis
      const participationRanges = [
        { range: '1-5人', min: 1, max: 5, count: 0 },
        { range: '6-20人', min: 6, max: 20, count: 0 },
        { range: '21-50人', min: 21, max: 50, count: 0 },
        { range: '50+人', min: 51, max: Infinity, count: 0 }
      ];
      
      allVotes.forEach(vote => {
        const range = participationRanges.find(r => 
          vote.participants >= r.min && vote.participants <= r.max
        );
        if (range) range.count++;
      });
      
      setParticipationAnalysis(participationRanges);

      // Popular votes (sorted by participation count)
      const topVotesList = allVotes
        .filter(vote => vote.status === 'completed')
        .sort((a, b) => b.participants - a.participants)
        .slice(0, 10);
      setTopVotes(topVotesList);

      // Trend analysis
      const trends = [];
      if (timeData.length > 1) {
        const recent = timeData.slice(-7); // Recent 7 days
        const previous = timeData.slice(-14, -7); // Previous 7 days
        
        const recentAvg = recent.reduce((sum, day) => sum + day.votes, 0) / recent.length;
        const previousAvg = previous.reduce((sum, day) => sum + day.votes, 0) / previous.length;
        const votesTrend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg * 100) : 0;
        
        const recentParticipants = recent.reduce((sum, day) => sum + day.participants, 0) / recent.length;
        const previousParticipants = previous.reduce((sum, day) => sum + day.participants, 0) / previous.length;
        const participantsTrend = previousParticipants > 0 ? ((recentParticipants - previousParticipants) / previousParticipants * 100) : 0;
        
        trends.push(
          {
            metric: 'Vote count',
            trend: votesTrend,
            current: Math.round(recentAvg * 10) / 10,
            previous: Math.round(previousAvg * 10) / 10
          },
          {
            metric: 'Participation count',
            trend: participantsTrend,
            current: Math.round(recentParticipants * 10) / 10,
            previous: Math.round(previousParticipants * 10) / 10
          }
        );
      }
      setTrendsData(trends);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load analysis data:', error);
      setLoading(false);
    }
  };

  const renderTrendIcon = (trend) => {
    if (trend > 0) {
      return <RiseOutlined style={{ color: '#52c41a' }} />;
    } else if (trend < 0) {
      return <FallOutlined style={{ color: '#f5222d' }} />;
    } else {
      return <BarChartOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const formatTrendValue = (trend) => {
    const absValue = Math.abs(trend);
    return `${trend > 0 ? '+' : ''}${absValue.toFixed(1)}%`;
  };

  const exportData = () => {
    const data = {
      overallStats,
      timeSeriesData,
      participationAnalysis,
      typeAnalysis,
      topVotes,
      dateRange: dateRange.map(d => d.format('YYYY-MM-DD'))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devote-analytics-${dayjs().format('YYYY-MM-DD')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Empty
          description={
            <div>
              <Title level={4}>Please connect your wallet</Title>
              <Text type="secondary">
                Connect your Web3 wallet to view data analysis
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
        <Space justify="space-between" style={{ width: '100%' }}>
          <div>
            <Title level={2}>Data Analysis</Title>
            <Text type="secondary">Deeply understand the voting data and trends of the platform</Text>
          </div>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="YYYY-MM-DD"
            />
            <Select
              value={analyticsType}
              onChange={setAnalyticsType}
              style={{ width: 120 }}
            >
              <Option value="overview">Overview</Option>
              <Option value="trends">Trends</Option>
              <Option value="comparison">Comparison</Option>
            </Select>
            <Button
              icon={<DownloadOutlined />}
              onClick={exportData}
            >
              Export data
            </Button>
          </Space>
        </Space>
      </div>

      <Spin spinning={loading}>
        {/* Overall statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total votes"
                value={overallStats.totalVotes}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total participants"
                value={overallStats.totalParticipants}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Average participation"
                value={overallStats.avgParticipation}
                suffix="people/vote"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total votes count"
                value={overallStats.totalVotesCount}
                prefix={<PieChartOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Left - Trend analysis */}
          <Col xs={24} lg={16}>
            <Card 
              title="Trend analysis" 
              extra={
                <Button 
                  type="link" 
                  icon={<LineChartOutlined />}
                  onClick={() => setAnalyticsType('trends')}
                >
                  View details
                </Button>
              }
            >
              {trendsData.length > 0 ? (
                <Row gutter={16}>
                  {trendsData.map((trend, index) => (
                    <Col span={12} key={index}>
                      <Card size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Text type="secondary">{trend.metric}</Text>
                          <Space>
                            <Text strong style={{ fontSize: 18 }}>
                              {trend.current}
                            </Text>
                            <Space>
                              {renderTrendIcon(trend.trend)}
                              <Text 
                                style={{ 
                                  color: trend.trend > 0 ? '#52c41a' : trend.trend < 0 ? '#f5222d' : '#d9d9d9'
                                }}
                              >
                                {formatTrendValue(trend.trend)}
                              </Text>
                            </Space>
                          </Space>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            vs last week average: {trend.previous}
                          </Text>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="No trend data" />
              )}
            </Card>

            {/* Time series chart simulation */}
            <Card title="Activity time series" style={{ marginTop: 16 }}>
              {timeSeriesData.length > 0 ? (
                <div>
                  <Text type="secondary">Recent {timeSeriesData.length} days of voting activities</Text>
                  <div style={{ marginTop: 16 }}>
                    {timeSeriesData.slice(-10).map((day, index) => (
                      <div key={index} style={{ marginBottom: 8 }}>
                        <Space justify="space-between" style={{ width: '100%' }}>
                          <Text style={{ fontSize: 12 }}>{dayjs(day.date).format('MM-DD')}</Text>
                          <Space>
                            <Text style={{ fontSize: 12 }}>{day.votes} votes</Text>
                            <Text style={{ fontSize: 12 }}>{day.participants} people</Text>
                          </Space>
                        </Space>
                        <Progress
                          percent={Math.min(day.votes * 20, 100)}
                          size="small"
                          showInfo={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Empty description="No time series data" />
              )}
            </Card>
          </Col>

          {/* Right - Detailed analysis */}
          <Col xs={24} lg={8}>
            {/* Vote type analysis */}
            <Card title="Vote type analysis" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Space justify="space-between" style={{ width: '100%' }}>
                    <Text>Single choice vote</Text>
                    <Text strong>{typeAnalysis.single.count}</Text>
                  </Space>
                  <Progress
                    percent={Math.round((typeAnalysis.single.count / overallStats.totalVotes) * 100) || 0}
                    size="small"
                    strokeColor="#1890ff"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Average participation: {typeAnalysis.single.participation} people
                  </Text>
                </div>
                <div>
                  <Space justify="space-between" style={{ width: '100%' }}>
                    <Text>Multi-choice vote</Text>
                    <Text strong>{typeAnalysis.multi.count}</Text>
                  </Space>
                  <Progress
                    percent={Math.round((typeAnalysis.multi.count / overallStats.totalVotes) * 100) || 0}
                    size="small"
                    strokeColor="#52c41a"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Average participation: {typeAnalysis.multi.participation} people
                  </Text>
                </div>
              </Space>
            </Card>

            {/* Participation analysis */}
            <Card title="Participation distribution" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {participationAnalysis.map((range, index) => (
                  <div key={index}>
                    <Space justify="space-between" style={{ width: '100%' }}>
                      <Text>{range.range}</Text>
                      <Text strong>{range.count}</Text>
                    </Space>
                    <Progress
                      percent={Math.round((range.count / overallStats.totalVotes) * 100) || 0}
                      size="small"
                      strokeColor={['#ff4d4f', '#fa8c16', '#1890ff', '#52c41a'][index]}
                    />
                  </div>
                ))}
              </Space>
            </Card>

            {/* Popular votes */}
            <Card 
              title="Popular votes TOP 5" 
              extra={
                <Button 
                  type="link" 
                  onClick={() => navigate('/votes')}
                >
                  View all
                </Button>
              }
            >
              <List
                size="small"
                dataSource={topVotes.slice(0, 5)}
                renderItem={(vote, index) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/vote/${vote.id}`)}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge count={index + 1} style={{ backgroundColor: '#f5222d' }}>
                          <Avatar size="small" icon={<FireOutlined />} />
                        </Badge>
                      }
                      title={
                        <Tooltip title={vote.title}>
                          <Text ellipsis style={{ width: 120 }}>
                            {vote.title}
                          </Text>
                        </Tooltip>
                      }
                      description={
                        <Space>
                          <Text type="secondary" style={{ fontSize: 10 }}>
                            {vote.participants} people participated
                          </Text>
                          <Tag size="small" color="blue">{vote.type}</Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Analytics; 