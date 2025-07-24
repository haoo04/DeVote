import React from 'react';
import {
  Card,
  Typography,
  Space,
  Row,
  Col,
  List,
  Avatar,
  Tag,
  Button,
  Divider,
  Timeline,
  Statistic
} from 'antd';
import {
  InfoCircleOutlined,
  TeamOutlined,
  RocketOutlined,
  SafetyOutlined,
  GlobalOutlined,
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  MailOutlined,
  TrophyOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StarOutlined,
  HeartOutlined,
  InstagramOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const About = () => {
  const mission = {
    title: 'Our Mission',
    description: 'To democratize decision-making through transparent, secure, and accessible blockchain-based voting systems.',
    icon: <RocketOutlined />
  };

  const vision = {
    title: 'Our Vision',
    description: 'A world where every voice matters, every vote is counted, and every decision is transparent and verifiable.',
    icon: <GlobalOutlined />
  };

  const values = [
    {
      title: 'Transparency',
      description: 'All votes are recorded on the blockchain, ensuring complete transparency and auditability.',
      icon: <SafetyOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Security',
      description: 'Advanced cryptography and blockchain technology protect against fraud and manipulation.',
      icon: <SafetyOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Accessibility',
      description: 'Easy-to-use interface makes blockchain voting accessible to everyone, regardless of technical expertise.',
      icon: <UserOutlined />,
      color: '#722ed1'
    },
    {
      title: 'Innovation',
      description: 'Continuous development and improvement of voting mechanisms and user experience.',
      icon: <StarOutlined />,
      color: '#fa8c16'
    }
  ];

  const features = [
    'Decentralized voting on blockchain',
    'Real-time results and transparency',
    'Multiple vote types (single/multi-choice)',
    'Immutable vote records',
    'Global accessibility',
    'No centralized authority',
    'Verifiable outcomes',
    'User-friendly interface'
  ];

  const roadmap = [
    {
      phase: 'Phase 1 - Foundation',
      year: '2024',
      items: [
        'Core voting smart contracts',
        'Basic web interface',
        'Wallet integration',
        'Single and multi-choice voting'
      ]
    },
    {
      phase: 'Phase 2 - Enhancement',
      year: '2024',
      items: [
        'Advanced analytics dashboard',
        'Mobile app development',
        'Multi-chain support',
        'Governance token integration'
      ]
    },
    {
      phase: 'Phase 3 - Expansion',
      year: '2025',
      items: [
        'DAO governance features',
        'Advanced voting mechanisms',
        'Enterprise solutions',
        'Global partnerships'
      ]
    },
    {
      phase: 'Phase 4 - Ecosystem',
      year: '2025',
      items: [
        'DeFi integration',
        'Cross-chain voting',
        'AI-powered insights',
        'Community-driven development'
      ]
    }
  ];

  const team = [
    {
      name: 'YI HAO',
      role: 'Lead Developer',
      avatar: '👩‍💻',
      bio: 'Blockchain architect and smart contract developer specializing in Web3 applications',
      skills: ['Smart Contracts', 'Solidity', 'Web3']
    },
    {
      name: 'Chat GPT & Claude AI',
      role: 'UX/UI Designer & Developer',
      avatar: '🎨',
      bio: 'User experience expert focused on blockchain accessibility',
      skills: ['UI/UX', 'React']
    }
  ];

  const stats = [
    { title: 'Active Users', value: '10,000+', icon: <UserOutlined /> },
    { title: 'Votes Created', value: '5,000+', icon: <TrophyOutlined /> },
    { title: 'Blockchain Networks', value: '3+', icon: <GlobalOutlined /> },
    { title: 'Countries Reached', value: '50+', icon: <HeartOutlined /> }
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          About DeVote
        </Title>
        <Text type="secondary">
          Learn about our mission, team, and the future of decentralized voting
        </Text>
      </div>

      {/* Mission & Vision */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: 16, color: '#1890ff' }}>
                {mission.icon}
              </div>
              <Title level={4}>{mission.title}</Title>
              <Paragraph style={{ fontSize: '16px', marginBottom: 0 }}>
                {mission.description}
              </Paragraph>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: 16, color: '#52c41a' }}>
                {vision.icon}
              </div>
              <Title level={4}>{vision.title}</Title>
              <Paragraph style={{ fontSize: '16px', marginBottom: 0 }}>
                {vision.description}
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>

      {/* What is DeVote */}
      <Card title="What is DeVote?" style={{ marginBottom: 24 }}>
        <Paragraph style={{ fontSize: '16px', lineHeight: 1.8 }}>
          DeVote is a revolutionary decentralized voting platform that leverages blockchain technology 
          to provide transparent, secure, and immutable voting solutions. Built on the principles of 
          democracy and technological innovation, DeVote eliminates the need for centralized voting 
          authorities while ensuring every vote is counted and verifiable.
        </Paragraph>
        
        <Paragraph style={{ fontSize: '16px', lineHeight: 1.8 }}>
          Our platform enables individuals, organizations, and communities to create and participate 
          in voting polls with unprecedented transparency. Whether it's community governance, 
          organizational decisions, or public opinion polls, DeVote provides the tools needed for 
          fair and democratic decision-making processes.
        </Paragraph>
      </Card>

      {/* Core Values */}
      <Card title="Our Core Values" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {values.map((value, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card size="small" style={{ textAlign: 'center', height: '100%' }}>
                <div style={{ fontSize: '32px', marginBottom: 8, color: value.color }}>
                  {value.icon}
                </div>
                <Title level={5} style={{ marginBottom: 8 }}>
                  {value.title}
                </Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {value.description}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Key Features */}
      <Card title="Key Features" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <List
              dataSource={features.slice(0, 4)}
              renderItem={item => (
                <List.Item>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Col>
          <Col xs={24} md={12}>
            <List
              dataSource={features.slice(4)}
              renderItem={item => (
                <List.Item>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Card title="Platform Statistics" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {stats.map((stat, index) => (
            <Col xs={12} sm={6} key={index}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.icon}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Roadmap */}
      <Card title="Development Roadmap" style={{ marginBottom: 24 }}>
        <Timeline mode="left">
          {roadmap.map((phase, index) => (
            <Timeline.Item
              key={index}
              label={phase.year}
              color={['#1890ff', '#52c41a', '#722ed1', '#fa8c16'][index]}
            >
              <Card size="small" style={{ marginBottom: 16 }}>
                <Title level={5} style={{ marginBottom: 8 }}>
                  {phase.phase}
                </Title>
                <List
                  size="small"
                  dataSource={phase.items}
                  renderItem={item => (
                    <List.Item style={{ padding: '4px 0' }}>
                      <Text style={{ fontSize: '12px' }}>• {item}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      {/* Team */}
      <Card title="Our Team" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {team.map((member, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card size="small" style={{ textAlign: 'center', height: '100%' }}>
                <Avatar
                  size={64}
                  style={{ marginBottom: 16, fontSize: '32px' }}
                >
                  {member.avatar}
                </Avatar>
                <Title level={5} style={{ marginBottom: 4 }}>
                  {member.name}
                </Title>
                <Text type="secondary" style={{ fontSize: '12px', marginBottom: 8 }}>
                  {member.role}
                </Text>
                <Paragraph style={{ fontSize: '11px', marginBottom: 8 }}>
                  {member.bio}
                </Paragraph>
                <div>
                  {member.skills.map(skill => (
                    <Tag key={skill} size="small" style={{ marginBottom: 4 }}>
                      {skill}
                    </Tag>
                  ))}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Technology Stack */}
      <Card title="Technology Stack" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card size="small" title="Frontend">
              <List size="small">
                <List.Item>React.js</List.Item>
                <List.Item>Ant Design</List.Item>
                <List.Item>Web3.js</List.Item>
                <List.Item>Ethers.js</List.Item>
              </List>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" title="Backend">
              <List size="small">
                <List.Item>Solidity</List.Item>
                <List.Item>Hardhat</List.Item>
                <List.Item>IPFS</List.Item>
                <List.Item>MetaMask</List.Item>
              </List>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" title="Blockchain">
              <List size="small">
                <List.Item>Ethereum</List.Item>
                <List.Item>Polygon</List.Item>
                <List.Item>BSC</List.Item>
                <List.Item>Layer 2 Solutions</List.Item>
              </List>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Contact & Social */}
      <Card title="Get in Touch" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <MailOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: 8 }} />
              <Title level={5}>Email</Title>
              <Button type="link" onClick={() => window.open('mailto:contact@devote.io')}>
                contact@devote.io
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <GithubOutlined style={{ fontSize: '32px', color: '#333', marginBottom: 8 }} />
              <Title level={5}>GitHub</Title>
              <Button type="link" onClick={() => window.open('https://github.com/DeVote', '_blank')}>
                github.com/DeVote
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <InstagramOutlined style={{ fontSize: '32px', color: '#1da1f2', marginBottom: 8 }} />
              <Title level={5}>Instagram</Title>
              <Button type="link" onClick={() => window.open('https://instagram.com', '_blank')}>
                @devote_io
              </Button>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Footer */}
      <Card style={{ textAlign: 'center', background: '#f5f5f5' }}>
        <Space direction="vertical">
          <Text type="secondary">
            Made with ❤️ by the DeVote team
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            © 2025 DeVote. All rights reserved.
          </Text>
          <Space>
            <Button type="link" size="small">Privacy Policy</Button>
            <Button type="link" size="small">Terms of Service</Button>
            <Button type="link" size="small">Cookie Policy</Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default About; 