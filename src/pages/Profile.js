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
      // Get user profile from smart contract and localStorage
      // Since the contract doesn't have user profile functionality, we use localStorage as temporary storage
      const savedProfile = localStorage.getItem(`userProfile_${account}`);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setUserProfile({
          ...parsedProfile,
          address: account,
          lastActive: new Date().toLocaleDateString()
        });
      } else {
        // Set default profile
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

      // Get user statistics data
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

      // Get the votes I created
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

      // Get the votes I participated in
      if (userParticipatedResult.success) {
        const participatedVotesList = [];
        for (const voteId of userParticipatedResult.data) {
          const voteInfoResult = await getVoteInfo(voteId);
          if (voteInfoResult.success) {
            const voteInfo = voteInfoResult.data;
            
            // Get the user's vote choices
            const userChoicesResult = await getUserVoteChoices(voteId, account);
            let myChoice = '未知';
            if (userChoicesResult.success && userChoicesResult.data.length > 0) {
              const choiceIndex = userChoicesResult.data[0];
              myChoice = voteInfo.options[choiceIndex] || '未知';
            }
            
            // Simulate vote result
            const isWinner = Math.random() > 0.5; // Simple random judgment
            
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

      // Get user achievements
      const userAchievements = [
        {
          id: 'first_vote',
          name: 'First vote',
          description: 'Participate in the first vote',
          icon: '🗳️',
          unlocked: votesParticipated > 0,
          progress: votesParticipated > 0 ? 100 : 0,
          unlockedDate: votesParticipated > 0 ? new Date().toLocaleDateString() : null
        },
        {
          id: 'first_create',
          name: 'Creator',
          description: 'Create the first vote',
          icon: '🎯',
          unlocked: votesCreated > 0,
          progress: votesCreated > 0 ? 100 : 0,
          unlockedDate: votesCreated > 0 ? new Date().toLocaleDateString() : null
        },
        {
          id: 'active_voter',
          name: 'Active voter',
          description: 'Participate in 10 votes',
          icon: '🔥',
          unlocked: votesParticipated >= 10,
          progress: Math.min(votesParticipated * 10, 100),
          unlockedDate: votesParticipated >= 10 ? new Date().toLocaleDateString() : null
        },
        {
          id: 'vote_creator',
          name: 'Vote expert',
          description: 'Create 5 votes',
          icon: '👑',
          unlocked: votesCreated >= 5,
          progress: Math.min(votesCreated * 20, 100),
          unlockedDate: votesCreated >= 5 ? new Date().toLocaleDateString() : null
        },
        {
          id: 'community_leader',
          name: 'Community leader',
          description: 'Reputation reaches 100',
          icon: '🌟',
          unlocked: reputation >= 100,
          progress: Math.min(reputation, 100),
          unlockedDate: reputation >= 100 ? new Date().toLocaleDateString() : null
        }
      ];
      
      setAchievements(userAchievements);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      message.error('Failed to load user profile');
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'active': { color: 'green', text: 'Ongoing' },
      'completed': { color: 'blue', text: 'Ended' },
      'pending': { color: 'orange', text: 'Pending' }
    };
    const config = statusMap[status] || statusMap['pending'];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const handleEditProfile = async () => {
    try {
      const values = await form.validateFields();
      console.log('Edit profile:', values);
      
      // Call the smart contract to update user profile
      // Since the contract doesn't have user profile functionality, we use localStorage as temporary storage
      const updatedProfile = {
        ...userProfile,
        ...values
      };
      
      // Save to localStorage
      localStorage.setItem(`userProfile_${account}`, JSON.stringify(updatedProfile));
      
      setUserProfile(updatedProfile);
      
      message.success('Profile updated successfully');
      setEditModalVisible(false);
    } catch (error) {
      console.error('Update failed:', error);
      message.error('Update failed, please try again');
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      message.success('Address copied to clipboard');
    }
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Empty
          description="Please connect your wallet to view your profile"
        />
      </div>
    );
  }

  return (
    <div>
      <Row gutter={24}>
        {/* Left: basic information */}
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
                Edit profile
              </Button>
            </div>

            {/* User introduction */}
            {userProfile.bio && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>User introduction</Title>
                <Paragraph>{userProfile.bio}</Paragraph>
              </div>
            )}

            {/* Statistics information */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5}>Statistics data</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Create vote"
                    value={userStats.votesCreated}
                    prefix={<TrophyOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Participate in vote"
                    value={userStats.votesParticipated}
                    prefix={<BarChartOutlined />}
                  />
                </Col>
              </Row>
            </div>

            {/* Contact information */}
            {(userProfile.social.twitter || userProfile.social.github) && (
              <div>
                <Title level={5}>Social media</Title>
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

        {/* Right: detailed information */}
        <Col xs={24} lg={16}>
          <Tabs defaultActiveKey="votes">
            <TabPane tab="My votes" key="votes">
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
                              View
                            </Button>,
                            <Button
                              type="link"
                              icon={<ShareAltOutlined />}
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/vote/${item.id}`);
                                message.success('Link copied');
                              }}
                            >
                              Share
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
                                    <UserOutlined /> {item.participants} people participated
                                  </Text>
                                  <Text type="secondary">
                                    <CalendarOutlined /> Created at: {item.createdTime}
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
                      description="You haven't created any votes yet"
                    />
                  )}
                </Spin>
              </Card>
            </TabPane>

            <TabPane tab="Participated records" key="participated">
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
                              View details
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                {item.title}
                                {item.isWinner ? (
                                  <Badge status="success" text="Vote successful" />
                                ) : (
                                  <Badge status="default" text="Not selected" />
                                )}
                              </Space>
                            }
                            description={
                              <div>
                                <Space>
                                  <Text type="secondary">My choice: {item.myChoice}</Text>
                                  <Text type="secondary">Final result: {item.result}</Text>
                                </Space>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Participated time: {item.participatedTime}
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
                      description="You haven't participated in any votes yet"
                    />
                  )}
                </Spin>
              </Card>
            </TabPane>

            <TabPane tab="Achievements" key="achievements">
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
                                <Tag color="green">Unlocked</Tag>
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
                                  Progress: {achievement.progress || 0}%
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
                      description="No achievements yet"
                    />
                  )}
                </Spin>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* Edit profile modal */}
      <Modal
        title="Edit profile"
        open={editModalVisible}
        onOk={handleEditProfile}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nickname"
            label="Nickname"
            rules={[{ max: 50, message: 'Nickname cannot exceed 50 characters' }]}
          >
            <Input placeholder="Enter nickname" />
          </Form.Item>

          <Form.Item
            name="bio"
            label="Personal introduction"
            rules={[{ max: 200, message: 'Introduction cannot exceed 200 characters' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Introduce yourself..."
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Please enter a valid email address' }]}
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