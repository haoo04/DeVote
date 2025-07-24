import React, { useState } from 'react';
import {
  Card,
  Typography,
  Space,
  Collapse,
  List,
  Alert,
  Tag,
  Button,
  Divider,
  Row,
  Col
} from 'antd';
import {
  QuestionCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
  UserOutlined,
  WalletOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const FAQ = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      key: 'general',
      title: 'General Questions',
      icon: <InfoCircleOutlined />,
      questions: [
        {
          question: 'What is DeVote?',
          answer: 'DeVote is a decentralized voting platform built on blockchain technology. It allows users to create and participate in transparent, immutable voting polls with real-time results and verifiable outcomes.',
          tags: ['platform', 'blockchain']
        },
        {
          question: 'How is DeVote different from traditional voting systems?',
          answer: 'DeVote offers transparency through blockchain immutability, real-time results, no centralized authority, verifiable outcomes, and global accessibility. All votes are permanently recorded and cannot be tampered with.',
          tags: ['transparency', 'decentralized']
        },
        {
          question: 'Is DeVote free to use?',
          answer: 'Creating and participating in votes requires gas fees for blockchain transactions. The platform itself is free, but you need to pay network fees for your transactions.',
          tags: ['cost', 'gas-fees']
        },
        {
          question: 'Which blockchain networks does DeVote support?',
          answer: 'DeVote currently supports Ethereum and compatible networks (like Polygon, BSC). The platform is designed to be network-agnostic and can be deployed on any EVM-compatible blockchain.',
          tags: ['blockchain', 'networks']
        }
      ]
    },
    {
      key: 'wallet',
      title: 'Wallet & Connection',
      icon: <WalletOutlined />,
      questions: [
        {
          question: 'Which wallets are supported?',
          answer: 'DeVote supports MetaMask, WalletConnect, and any Web3-compatible wallet. You can connect using browser extensions, mobile wallets, or hardware wallets.',
          tags: ['wallet', 'connection']
        },
        {
          question: 'How do I connect my wallet?',
          answer: 'Click the "Connect Wallet" button in the header, select your preferred wallet, and follow the connection prompts. Make sure your wallet is unlocked and on the correct network.',
          tags: ['connection', 'setup']
        },
        {
          question: 'Why can\'t I connect my wallet?',
          answer: 'Common issues include: wallet not installed, wrong network selected, wallet locked, or browser compatibility issues. Try refreshing the page or switching networks.',
          tags: ['troubleshooting', 'connection']
        },
        {
          question: 'Is it safe to connect my wallet?',
          answer: 'Yes, DeVote only requests read access to your public address. It never asks for private keys or seed phrases. Always verify the connection request in your wallet.',
          tags: ['security', 'safety']
        }
      ]
    },
    {
      key: 'voting',
      title: 'Voting Process',
      icon: <TrophyOutlined />,
      questions: [
        {
          question: 'How do I participate in a vote?',
          answer: 'Browse available votes, click on one to view details, select your preferred option(s), and confirm the transaction in your wallet. Your vote will be recorded on the blockchain.',
          tags: ['participation', 'process']
        },
        {
          question: 'Can I change my vote after submitting?',
          answer: 'No, votes are immutable once recorded on the blockchain. This ensures the integrity of the voting process and prevents manipulation.',
          tags: ['immutability', 'integrity']
        },
        {
          question: 'What are single-choice vs multi-choice votes?',
          answer: 'Single-choice allows selecting one option, while multi-choice allows selecting multiple options. The vote creator determines the type when creating the poll.',
          tags: ['vote-types', 'options']
        },
        {
          question: 'How do I know if my vote was recorded?',
          answer: 'Check your wallet for the transaction confirmation. You can also view the vote details to see the updated results and verify your participation.',
          tags: ['verification', 'confirmation']
        }
      ]
    },
    {
      key: 'creating',
      title: 'Creating Votes',
      icon: <UserOutlined />,
      questions: [
        {
          question: 'How do I create a new vote?',
          answer: 'Navigate to "Create Vote", fill in the title, description, options, vote type, and time parameters, then submit the transaction to create your vote.',
          tags: ['creation', 'setup']
        },
        {
          question: 'What information do I need to create a vote?',
          answer: 'You need: a title, description, voting options, vote type (single/multi), start time, and end time. All fields are required for a complete vote setup.',
          tags: ['requirements', 'information']
        },
        {
          question: 'Can I edit a vote after creating it?',
          answer: 'No, votes cannot be edited once created. This ensures transparency and prevents manipulation. Plan your vote carefully before submission.',
          tags: ['immutability', 'planning']
        },
        {
          question: 'How much does it cost to create a vote?',
          answer: 'Creating a vote requires gas fees for the blockchain transaction. The cost varies based on network congestion and gas prices.',
          tags: ['cost', 'gas-fees']
        }
      ]
    },
    {
      key: 'technical',
      title: 'Technical Issues',
      icon: <ExclamationCircleOutlined />,
      questions: [
        {
          question: 'What happens if my transaction fails?',
          answer: 'If a transaction fails, your vote is not recorded. You can try again, but ensure you have sufficient balance for gas fees and the vote is still active.',
          tags: ['transactions', 'troubleshooting']
        },
        {
          question: 'Why are results not updating?',
          answer: 'Results may take time to update due to blockchain confirmation times. Try refreshing the page or wait a few minutes for the latest data.',
          tags: ['results', 'updates']
        },
        {
          question: 'What if I\'m on the wrong network?',
          answer: 'Switch to the correct network in your wallet. DeVote will display an error if you\'re connected to an unsupported network.',
          tags: ['networks', 'connection']
        },
        {
          question: 'How do I check my voting history?',
          answer: 'Visit your profile page or the voting history section to view all your past participations and created votes.',
          tags: ['history', 'profile']
        }
      ]
    },
    {
      key: 'security',
      title: 'Security & Privacy',
      icon: <SafetyOutlined />,
      questions: [
        {
          question: 'Is my voting history private?',
          answer: 'Vote participation is recorded on the public blockchain, but personal information is not stored. Only your wallet address and voting choices are visible.',
          tags: ['privacy', 'blockchain']
        },
        {
          question: 'Can votes be manipulated?',
          answer: 'No, votes are recorded on the immutable blockchain. Once confirmed, they cannot be altered or deleted, ensuring vote integrity.',
          tags: ['security', 'integrity']
        },
        {
          question: 'What if someone tries to vote multiple times?',
          answer: 'The smart contract prevents double voting. Each wallet address can only vote once per poll, ensuring fair participation.',
          tags: ['prevention', 'fairness']
        },
        {
          question: 'How is the platform secured?',
          answer: 'DeVote uses audited smart contracts, blockchain immutability, and secure Web3 connections. All transactions are verified on-chain.',
          tags: ['security', 'audit']
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(category => category.questions.length > 0);

  const quickLinks = [
    { title: 'Getting Started', path: '/help/guide', icon: <InfoCircleOutlined /> },
    { title: 'Create Vote', path: '/create', icon: <UserOutlined /> },
    { title: 'Browse Votes', path: '/votes', icon: <TrophyOutlined /> },
    { title: 'About DeVote', path: '/help/about', icon: <QuestionCircleOutlined /> }
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <QuestionCircleOutlined style={{ marginRight: 8 }} />
          Frequently Asked Questions
        </Title>
        <Text type="secondary">
          Find answers to common questions about DeVote platform
        </Text>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={4}>Search FAQ</Title>
          <input
            type="text"
            placeholder="Search questions, answers, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          {searchTerm && (
            <Text type="secondary">
              Found {filteredCategories.reduce((sum, cat) => sum + cat.questions.length, 0)} matching questions
            </Text>
          )}
        </Space>
      </Card>

      {/* Quick Links */}
      <Card title="Quick Links" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {quickLinks.map((link, index) => (
            <Col xs={12} sm={6} key={index}>
              <Button
                type="dashed"
                block
                icon={link.icon}
                onClick={() => navigate(link.path)}
                style={{ height: 'auto', padding: '12px' }}
              >
                <div style={{ fontSize: '12px' }}>{link.title}</div>
              </Button>
            </Col>
          ))}
        </Row>
      </Card>

      {/* FAQ Categories */}
      {filteredCategories.map(category => (
        <Card 
          key={category.key}
          title={
            <Space>
              {category.icon}
              {category.title}
              <Tag color="blue">{category.questions.length} questions</Tag>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Collapse defaultActiveKey={[]} ghost>
            {category.questions.map((item, index) => (
              <Panel
                key={index}
                header={
                  <div style={{ fontWeight: 'bold' }}>
                    {item.question}
                  </div>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Paragraph style={{ marginBottom: 8 }}>
                    {item.answer}
                  </Paragraph>
                  <div>
                    {item.tags.map(tag => (
                      <Tag key={tag} size="small" color="geekblue">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </Space>
              </Panel>
            ))}
          </Collapse>
        </Card>
      ))}

      {/* No Results */}
      {searchTerm && filteredCategories.length === 0 && (
        <Card>
          <Alert
            message="No matching questions found"
            description={`Try searching with different keywords or browse all categories above.`}
            type="info"
            showIcon
          />
        </Card>
      )}

      {/* Still Need Help */}
      <Card title="Still Need Help?" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <InfoCircleOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: 8 }} />
              <Title level={5}>User Guide</Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Detailed step-by-step instructions
              </Text>
              <br />
              <Button type="link" onClick={() => navigate('/help/guide')}>
                Read Guide
              </Button>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <QuestionCircleOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: 8 }} />
              <Title level={5}>About DeVote</Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Learn more about the platform
              </Text>
              <br />
              <Button type="link" onClick={() => navigate('/help/about')}>
                Learn More
              </Button>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <ExclamationCircleOutlined style={{ fontSize: '32px', color: '#fa8c16', marginBottom: 8 }} />
              <Title level={5}>Report Issue</Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Found a bug or have feedback?
              </Text>
              <br />
              <Button type="link" onClick={() => window.open('https://github.com/devote/issues', '_blank')}>
                GitHub Issues
              </Button>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Tips */}
      <Card title="Pro Tips" style={{ marginTop: 24 }}>
        <Alert
          message="Before asking for help, try these solutions:"
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <List size="small">
          <List.Item>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            <Text>Refresh the page and try again</Text>
          </List.Item>
          <List.Item>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            <Text>Check your wallet connection and network</Text>
          </List.Item>
          <List.Item>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            <Text>Ensure you have sufficient balance for gas fees</Text>
          </List.Item>
          <List.Item>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            <Text>Wait for blockchain confirmations (usually 1-2 minutes)</Text>
          </List.Item>
          <List.Item>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            <Text>Try using a different browser or clear cache</Text>
          </List.Item>
        </List>
      </Card>
    </div>
  );
};

export default FAQ; 