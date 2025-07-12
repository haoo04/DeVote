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
import { getUserCreatedVotes, getUserParticipatedVotes, getVoteInfo, getAllVoteIds, hasUserVoted, getUserVoteChoices } from '../utils/contractUtils';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
  const navigate = useNavigate();
  const { isConnected, account, balance, formatAddress } = useWallet();
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const [userProfile, setUserProfile] = useState({
    address: account,
    nickname: '',
    avatar: null,
    bio: '',
    joinDate: '',
    lastActive: '',
    email: '',
    social: {
      twitter: '',
      github: ''
    }
  });
  const [userStats, setUserStats] = useState({
    votesCreated: 0,
    votesParticipated: 0,
    totalVotes: 0,
    successRate: 0,
    reputation: 0
  });
  const [myVotes, setMyVotes] = useState([]);
  const [participatedVotes, setParticipatedVotes] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (isConnected && account) {
      loadUserProfile();
    }
  }, [isConnected, account]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // 从智能合约和localStorage获取用户资料
      // 由于合约中没有用户资料功能，我们使用localStorage作为临时存储
      const savedProfile = localStorage.getItem(`userProfile_${account}`);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setUserProfile({
          ...parsedProfile,
          address: account,
          lastActive: new Date().toLocaleDateString()
        });
      } else {
        // 设置默认资料
        setUserProfile({
          address: account,
          nickname: '',
          avatar: null,
          bio: '',
          joinDate: new Date().toLocaleDateString(),
          lastActive: new Date().toLocaleDateString(),
          email: '',
          social: {
            twitter: '',
            github: ''
          }
        });
      }

      // 获取用户统计数据
      const userCreatedResult = await getUserCreatedVotes(account);
      const userParticipatedResult = await getUserParticipatedVotes(account);
      
      let votesCreated = 0;
      let votesParticipated = 0;
      
      if (userCreatedResult.success) {
        votesCreated = userCreatedResult.data.length;
      }
      
      if (userParticipatedResult.success) {
        votesParticipated = userParticipatedResult.data.length;
      }
      
      const totalVotes = votesCreated + votesParticipated;
      const successRate = totalVotes > 0 ? Math.round((votesCreated * 0.7 + votesParticipated * 0.3) * 100 / totalVotes) : 0;
      const reputation = votesCreated * 10 + votesParticipated * 5;
      
      setUserStats({
        votesCreated,
        votesParticipated,
        totalVotes,
        successRate,
        reputation
      });

      // 获取我创建的投票
      if (userCreatedResult.success) {
        const myVotesList = [];
        for (const voteId of userCreatedResult.data) {
          const voteInfoResult = await getVoteInfo(voteId);
          if (voteInfoResult.success) {
            const voteInfo = voteInfoResult.data;
            myVotesList.push({
              id: voteInfo.id,
              title: voteInfo.title,
              description: voteInfo.description,
              status: voteInfo.status,
              participants: voteInfo.totalVoters,
              createdTime: new Date(voteInfo.startTime).toLocaleDateString()
            });
          }
        }
        setMyVotes(myVotesList);
      }

      // 获取我参与的投票
      if (userParticipatedResult.success) {
        const participatedVotesList = [];
        for (const voteId of userParticipatedResult.data) {
          const voteInfoResult = await getVoteInfo(voteId);
          if (voteInfoResult.success) {
            const voteInfo = voteInfoResult.data;
            
            // 获取用户的投票选择
            const userChoicesResult = await getUserVoteChoices(voteId, account);
            let myChoice = '未知';
            if (userChoicesResult.success && userChoicesResult.data.length > 0) {
              const choiceIndex = userChoicesResult.data[0];
              myChoice = voteInfo.options[choiceIndex] || '未知';
            }
            
            // 模拟判断投票结果
            const isWinner = Math.random() > 0.5; // 简单的随机判断
            
            participatedVotesList.push({
              id: voteInfo.id,
              title: voteInfo.title,
              myChoice,
              result: voteInfo.status === 'ended' ? '已结束' : '进行中',
              isWinner,
              participatedTime: new Date(voteInfo.startTime).toLocaleDateString()
            });
          }
        }
        setParticipatedVotes(participatedVotesList);
      }

      // 获取用户成就
      const userAchievements = [
        {
          id: 'first_vote',
          name: '初次投票',
          description: '参与第一次投票',
          icon: '🗳️',
          unlocked: votesParticipated > 0,
          progress: votesParticipated > 0 ? 100 : 0,
          unlockedDate: votesParticipated > 0 ? new Date().toLocaleDateString() : null
        },
        {
          id: 'first_create',
          name: '创建者',
          description: '创建第一个投票',
          icon: '🎯',
          unlocked: votesCreated > 0,
          progress: votesCreated > 0 ? 100 : 0,
          unlockedDate: votesCreated > 0 ? new Date().toLocaleDateString() : null
        },
        {
          id: 'active_voter',
          name: '活跃投票者',
          description: '参与10次投票',
          icon: '🔥',
          unlocked: votesParticipated >= 10,
          progress: Math.min(votesParticipated * 10, 100),
          unlockedDate: votesParticipated >= 10 ? new Date().toLocaleDateString() : null
        },
        {
          id: 'vote_creator',
          name: '投票专家',
          description: '创建5个投票',
          icon: '👑',
          unlocked: votesCreated >= 5,
          progress: Math.min(votesCreated * 20, 100),
          unlockedDate: votesCreated >= 5 ? new Date().toLocaleDateString() : null
        },
        {
          id: 'community_leader',
          name: '社区领袖',
          description: '声誉达到100',
          icon: '🌟',
          unlocked: reputation >= 100,
          progress: Math.min(reputation, 100),
          unlockedDate: reputation >= 100 ? new Date().toLocaleDateString() : null
        }
      ];
      
      setAchievements(userAchievements);

      setLoading(false);
    } catch (error) {
      console.error('加载用户资料失败:', error);
      message.error('加载用户资料失败');
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
      
      // 调用智能合约更新用户资料
      // 由于合约中没有用户资料功能，我们使用localStorage作为临时存储
      const updatedProfile = {
        ...userProfile,
        ...values
      };
      
      // 保存到localStorage
      localStorage.setItem(`userProfile_${account}`, JSON.stringify(updatedProfile));
      
      setUserProfile(updatedProfile);
      
      message.success('资料更新成功');
      setEditModalVisible(false);
    } catch (error) {
      console.error('更新失败:', error);
      message.error('更新失败，请重试');
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
                  {formatAddress && account ? formatAddress(account) : account}
                </Text>
                <Text type="secondary">
                  {userProfile.joinDate ? `加入时间: ${userProfile.joinDate}` : ''}
                </Text>
              </Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  form.setFieldsValue(userProfile);
                  setEditModalVisible(true);
                }}
                style={{ marginTop: 16 }}
              >
                编辑资料
              </Button>
            </div>

            {/* 用户简介 */}
            {userProfile.bio && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>个人简介</Title>
                <Paragraph>{userProfile.bio}</Paragraph>
              </div>
            )}

            {/* 统计信息 */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5}>统计数据</Title>
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
            </div>

            {/* 联系方式 */}
            {(userProfile.social.twitter || userProfile.social.github) && (
              <div>
                <Title level={5}>社交媒体</Title>
                <Space direction="vertical">
                  {userProfile.social.twitter && (
                    <Text>Twitter: {userProfile.social.twitter}</Text>
                  )}
                  {userProfile.social.github && (
                    <Text>GitHub: {userProfile.social.github}</Text>
                  )}
                </Space>
              </div>
            )}
          </Card>
        </Col>

        {/* 右侧：详细信息 */}
        <Col xs={24} lg={16}>
          <Tabs defaultActiveKey="votes">
            <TabPane tab="我的投票" key="votes">
              <Card>
                <Spin spinning={loading}>
                  {myVotes.length > 0 ? (
                    <List
                      dataSource={myVotes}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button
                              type="link"
                              icon={<EyeOutlined />}
                              onClick={() => navigate(`/vote/${item.id}`)}
                            >
                              查看
                            </Button>,
                            <Button
                              type="link"
                              icon={<ShareAltOutlined />}
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/vote/${item.id}`);
                                message.success('链接已复制');
                              }}
                            >
                              分享
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
                                    <CalendarOutlined /> 创建于: {item.createdTime}
                                  </Text>
                                </Space>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="您还没有创建过投票"
                    />
                  )}
                </Spin>
              </Card>
            </TabPane>

            <TabPane tab="参与记录" key="participated">
              <Card>
                <Spin spinning={loading}>
                  {participatedVotes.length > 0 ? (
                    <List
                      dataSource={participatedVotes}
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
                                {item.isWinner ? (
                                  <Badge status="success" text="投票成功" />
                                ) : (
                                  <Badge status="default" text="未中选" />
                                )}
                              </Space>
                            }
                            description={
                              <div>
                                <Space>
                                  <Text type="secondary">我的选择: {item.myChoice}</Text>
                                  <Text type="secondary">最终结果: {item.result}</Text>
                                </Space>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  参与时间: {item.participatedTime}
                                </Text>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="您还没有参与过投票"
                    />
                  )}
                </Spin>
              </Card>
            </TabPane>

            <TabPane tab="成就" key="achievements">
              <Card>
                <Spin spinning={loading}>
                  {achievements.length > 0 ? (
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
                                <Text type="secondary" style={{ fontSize: '10px' }}>
                                  {achievement.unlockedDate}
                                </Text>
                              </div>
                            ) : (
                              <div style={{ marginTop: 8 }}>
                                <Progress
                                  percent={achievement.progress || 0}
                                  size="small"
                                  showInfo={false}
                                />
                                <Text type="secondary" style={{ fontSize: '10px' }}>
                                  进度: {achievement.progress || 0}%
                                </Text>
                              </div>
                            )}
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="暂无成就记录"
                    />
                  )}
                </Spin>
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
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
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
              rows={3} 
              placeholder="介绍一下自己..."
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input placeholder="your@example.com" />
          </Form.Item>

          <Form.Item
            name={['social', 'twitter']}
            label="Twitter"
          >
            <Input placeholder="@username" />
          </Form.Item>

          <Form.Item
            name={['social', 'github']}
            label="GitHub"
          >
            <Input placeholder="username" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile; 