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
  DatePicker,
  Badge
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  FilterOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

const { Title, Text } = Typography;
const { Option } = Select;

const VoteList = () => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState([]);
  const [filteredVotes, setFilteredVotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  useEffect(() => {
    loadVotes();
  }, []);

  useEffect(() => {
    filterVotes();
  }, [votes, searchTerm, statusFilter, typeFilter]);

  const loadVotes = async () => {
    setLoading(true);
    try {
      // 模拟API调用获取投票列表
      setTimeout(() => {
        const mockVotes = [
          {
            id: 1,
            title: '2024年度最佳区块链项目投票',
            description: '选出您认为最优秀的区块链项目，包括DeFi、NFT、Layer2等各个赛道',
            creator: '0x1234...5678',
            status: 'active',
            type: 'single',
            startTime: '2024-01-10',
            endTime: '2024-01-20',
            participants: 89,
            totalVotes: 156,
            options: ['Ethereum', 'Polygon', 'Solana', 'Avalanche'],
            anonymous: false,
            tags: ['区块链', '项目评选']
          },
          {
            id: 2,
            title: '社区治理提案 #001',
            description: '关于更新投票规则的重要提案，涉及投票权重、时间限制等关键参数调整',
            creator: '0xabcd...efgh',
            status: 'active',
            type: 'single',
            startTime: '2024-01-15',
            endTime: '2024-01-18',
            participants: 234,
            totalVotes: 289,
            options: ['赞成', '反对', '弃权'],
            anonymous: true,
            tags: ['治理', '规则']
          },
          {
            id: 3,
            title: 'DeFi协议安全审计结果投票',
            description: '对最新完成的安全审计结果进行社区投票确认',
            creator: '0x9876...5432',
            status: 'completed',
            type: 'multiple',
            startTime: '2024-01-05',
            endTime: '2024-01-15',
            participants: 567,
            totalVotes: 892,
            options: ['接受审计结果', '要求重新审计', '延期讨论'],
            anonymous: false,
            tags: ['DeFi', '安全审计']
          },
          {
            id: 4,
            title: 'NFT市场发展方向讨论',
            description: '探讨NFT市场未来的发展方向和重点关注领域',
            creator: '0x5555...7777',
            status: 'pending',
            type: 'multiple',
            startTime: '2024-01-25',
            endTime: '2024-02-01',
            participants: 0,
            totalVotes: 0,
            options: ['艺术NFT', '游戏NFT', '实用NFT', '元宇宙NFT'],
            anonymous: true,
            tags: ['NFT', '市场']
          },
          {
            id: 5,
            title: 'Layer2扩容方案选择',
            description: '为项目选择最适合的Layer2扩容解决方案',
            creator: '0x3333...9999',
            status: 'active',
            type: 'single',
            startTime: '2024-01-12',
            endTime: '2024-01-22',
            participants: 156,
            totalVotes: 203,
            options: ['Optimism', 'Arbitrum', 'Polygon', 'zkSync'],
            anonymous: false,
            tags: ['Layer2', '扩容']
          }
        ];
        setVotes(mockVotes);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('加载投票列表失败:', error);
      setLoading(false);
    }
  };

  const filterVotes = () => {
    let filtered = votes;

    // 按状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vote => vote.status === statusFilter);
    }

    // 按类型筛选
    if (typeFilter !== 'all') {
      filtered = filtered.filter(vote => vote.type === typeFilter);
    }

    // 按搜索词筛选
    if (searchTerm) {
      filtered = filtered.filter(vote =>
        vote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredVotes(filtered);
    setCurrentPage(1); // 重置到第一页
  };

  const getStatusConfig = (status) => {
    const configs = {
      'active': { color: 'green', text: '进行中', icon: <ClockCircleOutlined /> },
      'completed': { color: 'blue', text: '已结束', icon: <TrophyOutlined /> },
      'pending': { color: 'orange', text: '未开始', icon: <CalendarOutlined /> }
    };
    return configs[status] || configs['pending'];
  };

  const getTypeText = (type) => {
    return type === 'single' ? '单选' : '多选';
  };

  const calculateProgress = (vote) => {
    if (vote.status === 'completed') return 100;
    if (vote.status === 'pending') return 0;
    
    const now = new Date();
    const start = new Date(vote.startTime);
    const end = new Date(vote.endTime);
    const total = end - start;
    const elapsed = now - start;
    
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 分页数据
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
              查看详情
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
                  {vote.anonymous && <Tag color="purple">匿名</Tag>}
                </Space>
                <Space wrap>
                  {vote.tags.map(tag => (
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
                      <Text type="secondary">{vote.participants} 人参与</Text>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space>
                      <Text type="secondary">创建者: {formatAddress(vote.creator)}</Text>
                    </Space>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">开始: {vote.startTime}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">结束: {vote.endTime}</Text>
                  </Col>
                </Row>

                {vote.status === 'active' && (
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      投票进度
                    </Text>
                    <Progress
                      percent={Math.round(progress)}
                      size="small"
                      status={progress > 80 ? 'exception' : 'active'}
                    />
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
        <Title level={2}>所有投票</Title>
        <Text type="secondary">浏览和参与平台上的所有投票活动</Text>
      </div>

      {/* 筛选和搜索 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索投票标题、描述或标签"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">全部状态</Option>
              <Option value="active">进行中</Option>
              <Option value="completed">已结束</Option>
              <Option value="pending">未开始</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="类型筛选"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">全部类型</Option>
              <Option value="single">单选投票</Option>
              <Option value="multiple">多选投票</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Text type="secondary">
                共找到 {filteredVotes.length} 个投票
              </Text>
              <Button
                icon={<FilterOutlined />}
                onClick={loadVotes}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 投票列表 */}
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

            {/* 分页 */}
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredVotes.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                }
              />
            </div>
          </>
        ) : (
          <Empty
            description={
              searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? '没有找到符合条件的投票'
                : '暂无投票数据'
            }
          />
        )}
      </Spin>
    </div>
  );
};

export default VoteList; 