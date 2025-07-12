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

  // 监听页面焦点变化，当页面重新获得焦点时刷新数据
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
      console.log('开始加载投票列表...');
      
      //从智能合约获取投票列表
      const contract = await getContract();
      console.log('合约实例获取成功:', contract.target);
      
      const voteCount = await contract.voteCount();
      console.log('投票总数:', Number(voteCount));
      
      const votesList = [];
      
      for (let i = 0; i < voteCount; i++) {
        try {
          console.log(`正在获取投票 ${i} 的信息...`);
          const voteInfo = await contract.getVoteInfo(i);
          const voteResults = await contract.getVoteResults(i);
          
          // 将枚举值转换为字符串
          const statusMap = ['active', 'ended', 'cancelled'];
          const typeMap = ['single', 'multi'];
          
          // 获取时间戳（毫秒）
          const startTime = Number(voteInfo.startTime) * 1000;
          const endTime = Number(voteInfo.endTime) * 1000;
          const currentTime = Date.now();
          
          // 根据时间和合约状态判断实际状态
          let actualStatus = statusMap[voteInfo.status];
          if (voteInfo.status === 0) { // 合约状态为Active
            if (currentTime < startTime) {
              actualStatus = 'pending'; // 未开始
            } else if (currentTime > endTime) {
              actualStatus = 'ended'; // 已结束
            } else {
              actualStatus = 'active'; // 进行中
            }
          }
          
          const voteData = {
            id: Number(voteInfo.id),
            title: voteInfo.title,
            description: voteInfo.description,
            creator: voteInfo.creator,
            status: actualStatus,
            type: typeMap[voteInfo.voteType],
            startTime: new Date(startTime).toLocaleDateString(),
            endTime: new Date(endTime).toLocaleDateString(),
            startTimestamp: startTime,
            endTimestamp: endTime,
            participants: Number(voteInfo.totalVoters),
            totalVotes: voteResults.reduce((sum, count) => sum + Number(count), 0),
            options: voteInfo.options,
            anonymous: false, // 合约中没有这个字段，设为默认值
            tags: [] // 合约中没有这个字段，设为默认值
          };
          
          console.log(`投票 ${i} 信息:`, voteData);
          votesList.push(voteData);
        } catch (voteError) {
          console.error(`获取投票 ${i} 信息失败:`, voteError);
          // 跳过有问题的投票，继续处理其他投票
        }
      }

      
      console.log('成功加载投票列表:', votesList);
      setVotes(votesList);
      setLoading(false);
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
        (vote.tags && vote.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    setFilteredVotes(filtered);
    setCurrentPage(1); // 重置到第一页
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

  const getTypeText = (type) => {
    return type === 'single' ? '单选' : '多选';
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
                {vote.status === 'pending' && (
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      投票状态
                    </Text>
                    <div style={{ padding: '4px 0' }}>
                      <Text type="secondary">
                        投票将于 {new Date(vote.startTimestamp).toLocaleString()} 开始
                      </Text>
                    </div>
                  </div>
                )}
                {(vote.status === 'ended' || vote.status === 'cancelled') && (
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      投票状态
                    </Text>
                    <div style={{ padding: '4px 0' }}>
                      <Text type="secondary">
                        {vote.status === 'ended' ? '投票已结束' : '投票已取消'}
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
        <Title level={2}>所有投票</Title>
        <Text type="secondary">浏览和参与平台上的所有投票活动</Text>
      </div>

      {/* 筛选和搜索 */}
      <Card style={{ marginBottom: 24, position: 'relative', zIndex: 10 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索投票标题、描述或标签"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              style={{ position: 'relative', zIndex: 1 }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              {...optimizedSelectProps}
            >
              <Option value="all">全部状态</Option>
              <Option value="active">进行中</Option>
              <Option value="ended">已结束</Option>
              <Option value="pending">未开始</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="类型筛选"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: '100%' }}
              {...optimizedSelectProps}
            >
              <Option value="all">全部类型</Option>
              <Option value="single">单选投票</Option>
              <Option value="multi">多选投票</Option>
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
                loading={loading}
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
                : loading ? '正在加载投票数据...' : '暂无投票数据'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Spin>
    </div>
  );
};

export default VoteList; 