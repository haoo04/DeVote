import React from 'react';
import {
  Card,
  Typography,
  Space,
  Steps,
  List,
  Alert,
  Divider,
  Row,
  Col,
  Tag,
  Button,
  Collapse,
  Image
} from 'antd';
import {
  BookOutlined,
  UserOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  TrophyOutlined,
  SafetyOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;

const Guide = () => {
  const navigate = useNavigate();

  const quickStartSteps = [
    {
      title: 'Connect Wallet',
      description: 'Connect your Web3 wallet (MetaMask, WalletConnect, etc.)',
      icon: <UserOutlined />
    },
    {
      title: 'Browse Votes',
      description: 'Explore ongoing and completed votes on the platform',
      icon: <EyeOutlined />
    },
    {
      title: 'Participate',
      description: 'Cast your vote on active polls',
      icon: <CheckCircleOutlined />
    },
    {
      title: 'Create',
      description: 'Create your own voting polls',
      icon: <PlusOutlined />
    }
  ];

  const features = [
    {
      title: 'Decentralized Voting',
      description: 'All votes are recorded on the blockchain, ensuring transparency and immutability',
      icon: <SafetyOutlined />
    },
    {
      title: 'Multiple Vote Types',
      description: 'Support for single-choice and multi-choice voting mechanisms',
      icon: <CheckCircleOutlined />
    },
    {
      title: 'Real-time Results',
      description: 'View live voting progress and results as they happen',
      icon: <TrophyOutlined />
    },
    {
      title: 'User Analytics',
      description: 'Track your voting history and participation statistics',
      icon: <StarOutlined />
    }
  ];

  const voteTypes = [
    {
      type: 'Single Choice',
      description: 'Voters can select only one option from the available choices',
      useCase: 'Best for binary decisions, elections, or simple polls',
      example: 'Should we implement feature X? (Yes/No)'
    },
    {
      type: 'Multiple Choice',
      description: 'Voters can select multiple options from the available choices',
      useCase: 'Best for preference surveys, feature requests, or complex decisions',
      example: 'Which features should we prioritize? (Select all that apply)'
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BookOutlined style={{ marginRight: 8 }} />
          DeVote User Guide
        </Title>
        <Text type="secondary">
          Learn how to use DeVote - the decentralized voting platform
        </Text>
      </div>

      {/* Quick Start */}
      <Card title="Quick Start Guide" style={{ marginBottom: 24 }}>
        <Steps direction="vertical" size="large">
          {quickStartSteps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>
        
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/votes')}
          >
            Start Exploring Votes
          </Button>
        </div>
      </Card>

      {/* Platform Features */}
      <Card title="Platform Features" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card size="small" style={{ textAlign: 'center', height: '100%' }}>
                <div style={{ fontSize: '32px', marginBottom: 8, color: '#1890ff' }}>
                  {feature.icon}
                </div>
                <Title level={5} style={{ marginBottom: 8 }}>
                  {feature.title}
                </Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {feature.description}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* How to Create a Vote */}
      <Card title="How to Create a Vote" style={{ marginBottom: 24 }}>
        <Alert
          message="Before creating a vote, make sure you have connected your wallet"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Steps direction="vertical" size="small">
          <Step
            title="Navigate to Create Vote"
            description="Click on 'Create Vote' in the sidebar or use the quick action button"
          />
          <Step
            title="Fill in Basic Information"
            description="Enter the title, description, and select vote type (single or multiple choice)"
          />
          <Step
            title="Add Options"
            description="Provide the voting options that participants can choose from"
          />
          <Step
            title="Set Time Parameters"
            description="Define when the vote starts and ends"
          />
          <Step
            title="Review and Submit"
            description="Review all information and submit the transaction to create your vote"
          />
        </Steps>

        <div style={{ marginTop: 16 }}>
          <Button 
            type="primary"
            onClick={() => navigate('/create')}
          >
            Create Your First Vote
          </Button>
        </div>
      </Card>

      {/* How to Participate */}
      <Card title="How to Participate in Votes" style={{ marginBottom: 24 }}>
        <Alert
          message="You can only participate in active votes that are currently running"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Steps direction="vertical" size="small">
          <Step
            title="Browse Available Votes"
            description="Visit the 'All Votes' page to see all available voting polls"
          />
          <Step
            title="Select a Vote"
            description="Click on any vote to view its details and current status"
          />
          <Step
            title="Review Information"
            description="Read the vote description, options, and current results"
          />
          <Step
            title="Cast Your Vote"
            description="Select your preferred option(s) and confirm the transaction"
          />
          <Step
            title="Track Results"
            description="Monitor the vote progress and see final results when it ends"
          />
        </Steps>
      </Card>

      {/* Vote Types */}
      <Card title="Vote Types" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {voteTypes.map((type, index) => (
            <Col xs={24} md={12} key={index}>
              <Card size="small" style={{ height: '100%' }}>
                <Title level={5} style={{ marginBottom: 8 }}>
                  {type.type}
                </Title>
                <Paragraph style={{ marginBottom: 8 }}>
                  {type.description}
                </Paragraph>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Best for: </Text>
                  <Text type="secondary">{type.useCase}</Text>
                </div>
                <div>
                  <Text strong>Example: </Text>
                  <Text type="secondary" style={{ fontStyle: 'italic' }}>
                    {type.example}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Best Practices */}
      <Card title="Best Practices" style={{ marginBottom: 24 }}>
        <Collapse defaultActiveKey={['1']}>
          <Panel header="Creating Effective Votes" key="1">
            <List>
              <List.Item>
                <Text strong>Clear and Concise Titles:</Text>
                <Text> Make your vote title descriptive and easy to understand</Text>
              </List.Item>
              <List.Item>
                <Text strong>Detailed Descriptions:</Text>
                <Text> Provide enough context for voters to make informed decisions</Text>
              </List.Item>
              <List.Item>
                <Text strong>Reasonable Timeframes:</Text>
                <Text> Set appropriate start and end times to allow sufficient participation</Text>
              </List.Item>
              <List.Item>
                <Text strong>Balanced Options:</Text>
                <Text> Ensure all voting options are clear and mutually exclusive</Text>
              </List.Item>
            </List>
          </Panel>
          
          <Panel header="Participating Responsibly" key="2">
            <List>
              <List.Item>
                <Text strong>Read Carefully:</Text>
                <Text> Take time to understand the vote context and all options</Text>
              </List.Item>
              <List.Item>
                <Text strong>Consider Impact:</Text>
                <Text> Think about the consequences of your vote on the community</Text>
              </List.Item>
              <List.Item>
                <Text strong>Stay Informed:</Text>
                <Text> Monitor vote progress and results to understand outcomes</Text>
              </List.Item>
              <List.Item>
                <Text strong>Respect Others:</Text>
                <Text> Accept the democratic outcome, even if it differs from your preference</Text>
              </List.Item>
            </List>
          </Panel>
          
          <Panel header="Security Considerations" key="3">
            <List>
              <List.Item>
                <Text strong>Wallet Security:</Text>
                <Text> Keep your private keys safe and never share them</Text>
              </List.Item>
              <List.Item>
                <Text strong>Network Verification:</Text>
                <Text> Ensure you're connected to the correct blockchain network</Text>
              </List.Item>
              <List.Item>
                <Text strong>Transaction Confirmation:</Text>
                <Text> Always verify transaction details before confirming</Text>
              </List.Item>
              <List.Item>
                <Text strong>Gas Fees:</Text>
                <Text> Be aware of gas fees required for blockchain transactions</Text>
              </List.Item>
            </List>
          </Panel>
        </Collapse>
      </Card>

      {/* Troubleshooting */}
      <Card title="Troubleshooting" style={{ marginBottom: 24 }}>
        <Alert
          message="Common Issues and Solutions"
          description="If you encounter any issues, try these solutions first"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card size="small" title="Wallet Connection Issues">
              <List size="small">
                <List.Item>
                  <Text strong>Problem:</Text> Wallet not connecting
                  <br />
                  <Text type="secondary">Solution: Refresh page, check wallet extension, ensure network compatibility</Text>
                </List.Item>
                <List.Item>
                  <Text strong>Problem:</Text> Wrong network
                  <br />
                  <Text type="secondary">Solution: Switch to the correct blockchain network in your wallet</Text>
                </List.Item>
                <List.Item>
                  <Text strong>Problem:</Text> Transaction failed
                  <br />
                  <Text type="secondary">Solution: Check gas fees, ensure sufficient balance, try again</Text>
                </List.Item>
              </List>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card size="small" title="Voting Issues">
              <List size="small">
                <List.Item>
                  <Text strong>Problem:</Text> Can't see active votes
                  <br />
                  <Text type="secondary">Solution: Check if votes are in the correct time period, refresh data</Text>
                </List.Item>
                <List.Item>
                  <Text strong>Problem:</Text> Vote not recorded
                  <br />
                  <Text type="secondary">Solution: Wait for transaction confirmation, check blockchain explorer</Text>
                </List.Item>
                <List.Item>
                  <Text strong>Problem:</Text> Results not updating
                  <br />
                  <Text type="secondary">Solution: Refresh the page, wait for blockchain sync</Text>
                </List.Item>
              </List>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Getting Help */}
      <Card title="Need More Help?">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <QuestionCircleOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: 8 }} />
              <Title level={5}>FAQ</Title>
              <Button type="link" onClick={() => navigate('/help/faq')}>
                View FAQ
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <InfoCircleOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: 8 }} />
              <Title level={5}>About</Title>
              <Button type="link" onClick={() => navigate('/help/about')}>
                Learn More
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <StarOutlined style={{ fontSize: '32px', color: '#fa8c16', marginBottom: 8 }} />
              <Title level={5}>Feedback</Title>
              <Button type="link" onClick={() => window.open('https://github.com/devote', '_blank')}>
                GitHub
              </Button>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Guide; 