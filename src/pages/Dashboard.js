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

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVotes: 0,
    activeVotes: 0,
    participatedVotes: 0,
    totalParticipants: 0
  });
  const [recentVotes, setRecentVotes] = useState([]);
  const [myVotes, setMyVotes] = useState([]);

  useEffect(() => {
    // 模拟数据加载
    const loadData = async () => {
      setLoading(true);
      
      // 模拟API调用
      setTimeout(() => {
        setStats({
          totalVotes: 156,
          activeVotes: 23,
          participatedVotes: 45,
          totalParticipants: 1234
        });

        setRecentVotes([
          {
            id: 1,
            title: '2024年度最佳区块链项目投票',
            description: '选出您认为最优秀的区块链项目',
            status: 'active',
            endTime: '2024-01-20',
            participants: 89,
            totalVotes: 156
          },
          {
            id: 2,
            title: '社区治理提案 #001',
            description: '关于更新投票规则的提案',
            status: 'active',
            endTime: '2024-01-18',
            participants: 234,
            totalVotes: 289
          },
          {
            id: 3,
            title: 'DeFi协议安全审计结果投票',
            description: '对审计结果进行社区投票确认',
            status: 'completed',
            endTime: '2024-01-15',
            participants: 567,
            totalVotes: 892
          }
        ]);

        setMyVotes([
          {
            id: 1,
            title: '我发起的投票 #001',
            status: 'active',
            participants: 45,
            endTime: '2024-01-25'
          },
          {
            id: 2,
            title: '我发起的投票 #002',
            status: 'completed',
            participants: 123,
            endTime: '2024-01-10'
          }
        ]);

        setLoading(false);
      }, 1000);
    };

    loadData();
  }, []);

  const getStatusTag = (status) => {
    const statusMap = {
      'active': { color: 'green', text: '进行中' },
      'completed': { color: 'blue', text: '已结束' },
      'pending': { color: 'orange', text: '未开始' }
    };
    const config = statusMap[status] || statusMap['pending'];
    return <Tag color={config.color}>{config.text}</Tag>;
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
                          {item.status === 'active' && (
                            <Progress 
                              percent={Math.round((item.participants / item.totalVotes) * 100)} 
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
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 