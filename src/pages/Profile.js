import React, { useState, useEffect } from 'react';
import {
  Card,
  Avatar,
  Typography,
  Tabs,
  List,
  Button,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  Progress,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  message,
  Descriptions,
  Badge
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  EyeOutlined,
  ShareAltOutlined,
  CalendarOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
  const navigate = useNavigate();
  const { isConnected, account, balance, formatAddress } = useWallet();
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const [userProfile, setUserProfile] = useState({});
  const [userStats, setUserStats] = useState({});
  const [myVotes, setMyVotes] = useState([]);
  const [participatedVotes, setParticipatedVotes] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (isConnected) {
      loadUserProfile();
    }
  }, [isConnected, account]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // 模拟用户数据加载
      setTimeout(() => {
        setUserProfile({
          address: account,
          nickname: '区块链爱好者',
          avatar: null,
          bio: '热爱区块链技术，积极参与社区治理和投票活动。相信去中心化的力量能够改变世界。',
          joinDate: '2024-01-01',
          lastActive: '2024-01-15',
          email: 'user@example.com',
          social: {
            twitter: '@blockchain_lover',
            github: 'blockchain-dev'
          }
        });

        setUserStats({
          votesCreated: 8,
          votesParticipated: 45,
          totalVotes: 156,
          successRate: 85,
          reputation: 1250
        });

        setMyVotes([
          {
            id: 1,
            title: '我发起的投票 #001',
            description: '关于社区发展方向的重要投票',
            status: 'active',
            participants: 45,
            totalVotes: 67,
            endTime: '2024-01-25',
            createdTime: '2024-01-15'
          },
          {
            id: 2,
            title: '技术升级提案投票',
            description: '针对平台技术升级的提案讨论',
            status: 'completed',
            participants: 123,
            totalVotes: 189,
            endTime: '2024-01-10',
            createdTime: '2024-01-05'
          }
        ]);

        setParticipatedVotes([
          {
            id: 3,
            title: '2024年度最佳区块链项目投票',
            myChoice: 'Ethereum',
            result: 'Ethereum',
            isWinner: true,
            endTime: '2024-01-20',
            participatedTime: '2024-01-15'
          },
          {
            id: 4,
            title: 'DeFi协议安全审计结果投票',
            myChoice: '接受审计结果',
            result: '接受审计结果',
            isWinner: true,
            endTime: '2024-01-15',
            participatedTime: '2024-01-12'
          },
          {
            id: 5,
            title: '社区治理提案 #001',
            myChoice: '赞成',
            result: '反对',
            isWinner: false,
            endTime: '2024-01-18',
            participatedTime: '2024-01-16'
          }
        ]);

        setAchievements([
          {
            id: 1,
            name: '投票新手',
            description: '参与了第一次投票',
            icon: '🥉',
            unlocked: true,
            unlockedDate: '2024-01-02'
          },
          {
            id: 2,
            name: '活跃参与者',
            description: '参与了10次投票',
            icon: '🥈',
            unlocked: true,
            unlockedDate: '2024-01-10'
          },
          {
            id: 3,
            name: '投票达人',
            description: '参与了50次投票',
            icon: '🥇',
            unlocked: false,
            progress: 45
          },
          {
            id: 4,
            name: '创建者',
            description: '创建了第一个投票',
            icon: '🎯',
            unlocked: true,
            unlockedDate: '2024-01-05'
          }
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('加载用户资料失败:', error);
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'active': { color: 'green', text: '进行中' },
      'completed': { color: 'blue', text: '已结束' },
      'pending': { color: 'orange', text: '未开始' }
    };
    const config = statusMap[status] || statusMap['pending'];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const handleEditProfile = async () => {
    try {
      const values = await form.validateFields();
      console.log('编辑资料:', values);
      
      setUserProfile({
        ...userProfile,
        ...values
      });
      
      message.success('资料更新成功');
      setEditModalVisible(false);
    } catch (error) {
      console.error('更新失败:', error);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      message.success('地址已复制到剪贴板');
    }
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Empty
          description="请先连接钱包查看个人资料"
        />
      </div>
    );
  }

  return (
    <div>
      <Row gutter={24}>
        {/* 左侧：基本信息 */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{ marginBottom: 16 }}
              />
              <Title level={4} style={{ marginBottom: 8 }}>
                {userProfile.nickname || '匿名用户'}
              </Title>
              <Space direction="vertical" size={4}>
                <Text type="secondary" copyable={{ onCopy: copyAddress }}>
                  {formatAddress(account)}
                </Text>
                <Text type="secondary">
                  加入时间: {userProfile.joinDate}
                </Text>
              </Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                style={{ marginTop: 16 }}
                onClick={() => {
                  form.setFieldsValue(userProfile);
                  setEditModalVisible(true);
                }}
              >
                编辑资料
              </Button>
            </div>

            <Descriptions column={1} size="small">
              <Descriptions.Item label="钱包余额">
                {parseFloat(balance).toFixed(4)} ETH
              </Descriptions.Item>
              <Descriptions.Item label="声誉值">
                {userStats.reputation}
              </Descriptions.Item>
              <Descriptions.Item label="最后活跃">
                {userProfile.lastActive}
              </Descriptions.Item>
            </Descriptions>

            {userProfile.bio && (
              <div style={{ marginTop: 16 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>个人简介</Text>
                <Paragraph style={{ marginTop: 8 }}>
                  {userProfile.bio}
                </Paragraph>
              </div>
            )}
          </Card>

          {/* 统计信息 */}
          <Card title="统计数据" style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="创建投票"
                  value={userStats.votesCreated}
                  prefix={<TrophyOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="参与投票"
                  value={userStats.votesParticipated}
                  prefix={<BarChartOutlined />}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic
                  title="总投票数"
                  value={userStats.totalVotes}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="成功率"
                  value={userStats.successRate}
                  suffix="%"
                  prefix={<TrophyOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 右侧：详细信息 */}
        <Col xs={24} lg={16}>
          <Tabs defaultActiveKey="myVotes">
            <TabPane tab="我创建的投票" key="myVotes">
              <Spin spinning={loading}>
                <List
                  dataSource={myVotes}
                  renderItem={(vote) => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          icon={<EyeOutlined />}
                          onClick={() => navigate(`/vote/${vote.id}`)}
                        >
                          查看详情
                        </Button>,
                        <Button
                          type="link"
                          icon={<ShareAltOutlined />}
                          onClick={() => {
                            const url = `${window.location.origin}/vote/${vote.id}`;
                            navigator.clipboard.writeText(url);
                            message.success('投票链接已复制');
                          }}
                        >
                          分享
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            {vote.title}
                            {getStatusTag(vote.status)}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={4}>
                            <Text type="secondary">{vote.description}</Text>
                            <Space>
                              <Text type="secondary">
                                <UserOutlined /> {vote.participants} 人参与
                              </Text>
                              <Text type="secondary">
                                <CalendarOutlined /> 截止: {vote.endTime}
                              </Text>
                            </Space>
                            {vote.status === 'active' && (
                              <Progress
                                percent={Math.round((vote.participants / (vote.totalVotes || 1)) * 100)}
                                size="small"
                              />
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Spin>
            </TabPane>

            <TabPane tab="参与的投票" key="participated">
              <Spin spinning={loading}>
                <List
                  dataSource={participatedVotes}
                  renderItem={(vote) => (
                    <List.Item
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
                      <List.Item.Meta
                        avatar={
                          <Badge dot status={vote.isWinner ? 'success' : 'default'}>
                            <Avatar icon={vote.isWinner ? <TrophyOutlined /> : <ClockCircleOutlined />} />
                          </Badge>
                        }
                        title={
                          <Space>
                            {vote.title}
                            {vote.isWinner ? (
                              <Tag color="green">预测正确</Tag>
                            ) : (
                              <Tag color="orange">预测失败</Tag>
                            )}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={4}>
                            <Space>
                              <Text type="secondary">我的选择: </Text>
                              <Text strong>{vote.myChoice}</Text>
                            </Space>
                            <Space>
                              <Text type="secondary">最终结果: </Text>
                              <Text>{vote.result}</Text>
                            </Space>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              参与时间: {vote.participatedTime} | 结束时间: {vote.endTime}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Spin>
            </TabPane>

            <TabPane tab="成就徽章" key="achievements">
              <Row gutter={[16, 16]}>
                {achievements.map((achievement) => (
                  <Col xs={24} sm={12} md={8} key={achievement.id}>
                    <Card
                      size="small"
                      style={{
                        textAlign: 'center',
                        opacity: achievement.unlocked ? 1 : 0.5
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: 8 }}>
                        {achievement.icon}
                      </div>
                      <Title level={5} style={{ marginBottom: 4 }}>
                        {achievement.name}
                      </Title>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {achievement.description}
                      </Text>
                      {achievement.unlocked ? (
                        <div style={{ marginTop: 8 }}>
                          <Tag color="green">已解锁</Tag>
                          <br />
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {achievement.unlockedDate}
                          </Text>
                        </div>
                      ) : (
                        <div style={{ marginTop: 8 }}>
                          <Progress
                            percent={achievement.progress}
                            size="small"
                            showInfo={false}
                          />
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            进度: {achievement.progress}/50
                          </Text>
                        </div>
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>

            <TabPane tab="设置" key="settings">
              <Card title="账户设置">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button icon={<EditOutlined />} onClick={() => setEditModalVisible(true)}>
                    编辑个人资料
                  </Button>
                  <Button icon={<SettingOutlined />}>
                    隐私设置
                  </Button>
                  <Button icon={<ShareAltOutlined />}>
                    分享我的资料
                  </Button>
                </Space>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* 编辑资料模态框 */}
      <Modal
        title="编辑个人资料"
        open={editModalVisible}
        onOk={handleEditProfile}
        onCancel={() => setEditModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ max: 50, message: '昵称不能超过50个字符' }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item
            name="bio"
            label="个人简介"
            rules={[{ max: 200, message: '简介不能超过200个字符' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="介绍一下自己..."
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input placeholder="your@email.com" />
          </Form.Item>

          <Form.Item name="twitter" label="Twitter">
            <Input placeholder="@username" />
          </Form.Item>

          <Form.Item name="github" label="GitHub">
            <Input placeholder="username" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile; 