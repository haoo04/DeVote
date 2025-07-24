import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Progress,
  Avatar,
  Pagination,
  Empty,
  Spin,
  Badge
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  FilterOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { optimizedSelectProps } from '../utils/errorHandler';
import { getContract } from '../utils/contractUtils';

const { Title, Text } = Typography;
const { Option } = Select;

const VoteList = () => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [votes, setVotes] = useState([]);
  const [filteredVotes, setFilteredVotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  useEffect(() => {
    if (isConnected) {
      loadVotes();
    }
  }, [isConnected]);

  useEffect(() => {
    filterVotes();
  }, [votes, searchTerm, statusFilter, typeFilter]);

  // Listen for page focus changes, refresh data when page regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (isConnected) {
        loadVotes();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isConnected]);

  const loadVotes = async () => {
    setLoading(true);
    try {
      console.log('Loading vote list...');
      
      // Get vote list from smart contract
      const contract = await getContract();
      console.log('Smart contract instance obtained:', contract.target);
      
      const voteCount = await contract.voteCount();
      console.log('Total votes:', Number(voteCount));
      
      const votesList = [];
      
      for (let i = 0; i < voteCount; i++) {
        try {
          console.log(`Getting vote ${i} information...`);
          const voteInfo = await contract.getVoteInfo(i);
          const voteResults = await contract.getVoteResults(i);
          
          // Convert enum values to strings
          const typeMap = ['single', 'multi'];
          
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
          
          const voteData = {
            id: Number(voteInfo.id),
            title: voteInfo.title,
            description: voteInfo.description,
            creator: voteInfo.creator,
            status: actualStatus, // Use actual status based on time
            type: typeMap[voteInfo.voteType],
            startTime: new Date(startTime).toLocaleDateString(),
            endTime: new Date(endTime).toLocaleDateString(),
            startTimestamp: startTime,
            endTimestamp: endTime,
            participants: Number(voteInfo.totalVoters),
            totalVotes: voteResults.reduce((sum, count) => sum + Number(count), 0),
            options: voteInfo.options,
            anonymous: false, // No field in contract, set to default value
            tags: [] // No field in contract, set to default value
          };
          
          console.log(`投票 ${i} 信息:`, voteData);
          votesList.push(voteData);
        } catch (voteError) {
          console.error(`Failed to get vote ${i} information:`, voteError);
          // Skip problematic votes and continue processing other votes
        }
      }

      
      console.log('Successfully loaded vote list:', votesList);
      setVotes(votesList);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load vote list:', error);
      setLoading(false);
    }
  };

  const filterVotes = () => {
    let filtered = votes;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vote => vote.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(vote => vote.type === typeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vote =>
        vote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vote.tags && vote.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    setFilteredVotes(filtered);
    setCurrentPage(1); // Reset to first page
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

  const getTypeText = (type) => {
    return type === 'single' ? 'Single vote' : 'Multiple vote';
  };

  const calculateProgress = (vote) => {
    if (vote.status === 'ended' || vote.status === 'cancelled') return 100;
    if (vote.status === 'pending') return 0;
    
    const now = Date.now();
    const start = vote.startTimestamp;
    const end = vote.endTimestamp;
    const total = end - start;
    const elapsed = now - start;
    
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Paginated data
  const paginatedVotes = filteredVotes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const VoteCard = ({ vote }) => {
    const statusConfig = getStatusConfig(vote.status);
    const progress = calculateProgress(vote);

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
              <Badge dot status={statusConfig.color}>
                <Avatar
                  size="large"
                  style={{ backgroundColor: '#1890ff' }}
                  icon={statusConfig.icon}
                />
              </Badge>
            }
            title={
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Space>
                  <Text strong style={{ fontSize: '16px' }}>{vote.title}</Text>
                  <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
                  <Tag>{getTypeText(vote.type)}</Tag>
                  {vote.anonymous && <Tag color="purple">Anonymous</Tag>}
                </Space>
                <Space wrap>
                  {vote.tags && vote.tags.map(tag => (
                    <Tag key={tag} color="blue" style={{ fontSize: '10px' }}>
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </Space>
            }
            description={
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
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
                      <Text type="secondary">Creator: {formatAddress(vote.creator)}</Text>
                    </Space>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">Start: {vote.startTime}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">End: {vote.endTime}</Text>
                  </Col>
                </Row>

                {vote.status === 'active' && (
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Vote progress
                    </Text>
                    <Progress
                      percent={Math.round(progress)}
                      size="small"
                      status="active"
                    />
                  </div>
                )}
                {vote.status === 'pending' && (
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Vote status
                    </Text>
                    <div style={{ padding: '4px 0' }}>
                      <Text type="secondary">
                        Vote will start at {new Date(vote.startTimestamp).toLocaleString()}
                      </Text>
                    </div>
                  </div>
                )}
                {(vote.status === 'ended' || vote.status === 'cancelled') && (
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Vote status
                    </Text>
                    <div style={{ padding: '4px 0' }}>
                      <Text type="secondary">
                        {vote.status === 'ended' ? 'Vote ended' : 'Vote cancelled'}
                      </Text>
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

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>All votes</Title>
        <Text type="secondary">Browse and participate in all voting activities on the platform</Text>
      </div>

      {/* Filter and search */}
      <Card style={{ marginBottom: 24, position: 'relative', zIndex: 10 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search vote title, description or tag"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              style={{ position: 'relative', zIndex: 1 }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Status filter"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              {...optimizedSelectProps}
            >
              <Option value="all">All status</Option>
              <Option value="active">Active</Option>
              <Option value="ended">Ended</Option>
              <Option value="pending">Pending</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Type filter"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: '100%' }}
              {...optimizedSelectProps}
            >
              <Option value="all">All types</Option>
              <Option value="single">Single vote</Option>
              <Option value="multi">Multiple vote</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Text type="secondary">
                Found {filteredVotes.length} votes
              </Text>
              <Button
                icon={<FilterOutlined />}
                onClick={loadVotes}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Vote list */}
      <Spin spinning={loading}>
        {paginatedVotes.length > 0 ? (
          <>
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
              dataSource={paginatedVotes}
              renderItem={(vote) => <VoteCard vote={vote} />}
            />

            {/* Pagination */}
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredVotes.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `Page ${range[0]}-${range[1]} of ${total}`
                }
              />
            </div>
          </>
        ) : (
          <Empty
            description={
              searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No votes found'
                : loading ? 'Loading vote data...' : 'No votes'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Spin>
    </div>
  );
};

export default VoteList; 