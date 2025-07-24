import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Statistic,
  Row,
  Col,
  Alert,
  List,
  Avatar,
  Popconfirm,
  Badge,
  Empty,
  Spin
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CrownOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useWallet } from '../contexts/WalletContext';
import { getAllVoteIds, getVoteInfo, getContract } from '../utils/contractUtils';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const Admin = () => {
  const { isConnected, account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [form] = Form.useForm();
  
  // 数据状态
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalVotes: 0,
    activeVotes: 0,
    totalTransactions: 0
  });
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [systemSettings, setSystemSettings] = useState({
    votingEnabled: true,
    minVotingPeriod: 24,
    maxVotingPeriod: 720,
    maxOptionsPerVote: 10,
    enableAnonymousVoting: true,
    requireEmailVerification: false
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    if (isConnected) {
      checkAdminStatus();
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected && isAdminUser) {
      loadAdminData();
    }
  }, [isConnected, isAdminUser]);

  const checkAdminStatus = async () => {
    try {
      // Check if the user is an admin from the smart contract
      // Since the contract does not have a clear admin check function, we use the owner function of the contract
      const contract = await getContract();
      const owner = await contract.owner();
      const isAdmin = account && account.toLowerCase() === owner.toLowerCase();
      setIsAdminUser(isAdmin);
      
      if (!isAdmin) {
        message.error('You do not have admin privileges');
      }
    } catch (error) {
      console.error('Check admin privileges failed:', error);
      setIsAdminUser(false);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Get system statistics data from the smart contract
      const allVoteIdsResult = await getAllVoteIds();
      if (allVoteIdsResult.success) {
        const voteIds = allVoteIdsResult.data;
        const totalVotes = voteIds.length;
        
        // Get the number of active votes and the total number of participating users
        let activeVotes = 0;
        let totalUsers = 0;
        const userSet = new Set();
        
        for (const voteId of voteIds) {
          const voteInfoResult = await getVoteInfo(voteId);
          if (voteInfoResult.success) {
            const voteInfo = voteInfoResult.data;
            
            // Count active votes
            if (voteInfo.status === 'active') {
              activeVotes++;
            }
            
            // Count unique users (creators)
            userSet.add(voteInfo.creator.toLowerCase());
            
            // Assume each vote has some participants
            totalUsers += voteInfo.totalVoters;
          }
        }
        
        setSystemStats({
          totalUsers: userSet.size,
          totalVotes,
          activeVotes,
          totalTransactions: totalVotes * 2 // Assume each vote generates 2 transactions
        });
        
        // Get user list (simulated data, because the contract does not store user detailed information)
        const mockUsers = Array.from(userSet).map((address, index) => ({
          id: index + 1,
          address,
          role: address.toLowerCase() === account?.toLowerCase() ? 'admin' : 'user',
          status: 'active',
          joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          votesCreated: Math.floor(Math.random() * 10),
          votesParticipated: Math.floor(Math.random() * 20)
        }));
        
        setUsers(mockUsers);
      }

      // Get permission configuration (simulated data)
      const mockPermissions = [
        { id: 1, name: 'Create vote', description: 'Allow users to create votes', enabled: true, requiredRole: 'user' },
        { id: 2, name: 'Participate in voting', description: 'Allow users to participate in voting', enabled: true, requiredRole: 'user' },
        { id: 3, name: 'View results', description: 'Allow users to view vote results', enabled: true, requiredRole: 'user' },
        { id: 4, name: 'Share vote', description: 'Allow users to share vote links', enabled: true, requiredRole: 'user' },
        { id: 5, name: 'Delete vote', description: 'Allow users to delete their own votes', enabled: false, requiredRole: 'moderator' }
      ];
      
      setPermissions(mockPermissions);

      // Get audit logs (simulated data)
      const mockAuditLogs = [
        {
          id: 1,
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          user: account,
          action: 'View management panel',
          details: 'Admin accessed the system management panel',
          type: 'info'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          user: 'system',
          action: 'System started',
          details: 'System successfully started and started running',
          type: 'success'
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          user: 'unknown',
          action: 'Access denied',
          details: 'Non-admin user tried to access the management panel',
          type: 'warning'
        }
      ];
      
      setAuditLogs(mockAuditLogs);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      message.error('Failed to load admin data');
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      // Call the smart contract to delete the user
      // Since the contract does not have user management functionality, this is just a simulation of deletion
      setUsers(users.filter(user => user.id !== userId));
      message.success('User deleted');
      
      // Add audit log
      const newLog = {
        id: auditLogs.length + 1,
        timestamp: new Date().toISOString(),
        user: account,
        action: 'Delete user',
        details: `Admin deleted user ID: ${userId}`,
        type: 'warning'
      };
      setAuditLogs([newLog, ...auditLogs]);
    } catch (error) {
      console.error('Failed to delete user:', error);
      message.error('Failed to delete user, please try again');
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRoleTag = (role) => {
    const roleConfig = {
      'admin': { color: 'red', icon: <CrownOutlined />, text: 'Admin' },
      'moderator': { color: 'orange', icon: <SafetyOutlined />, text: 'Moderator' },
      'user': { color: 'blue', icon: <UserOutlined />, text: 'User' }
    };
    const config = roleConfig[role] || roleConfig['user'];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { status: 'success', text: 'Active' },
      'banned': { status: 'error', text: 'Banned' },
      'suspended': { status: 'warning', text: 'Suspended' }
    };
    const config = statusConfig[status] || statusConfig['active'];
    return <Badge status={config.status} text={config.text} />;
  };

  const handleUserAction = (action, user) => {
    setModalType(action);
    setModalVisible(true);
    if (action === 'edit') {
      form.setFieldsValue(user);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Modal values:', values);
      
      // Call the smart contract to perform user operations
      // Since the contract does not have user management functionality, this is just a simulation of the operation
      if (modalType === 'add') {
        const newUser = {
          id: users.length + 1,
          address: values.address,
          role: values.role,
          status: values.status,
          joinDate: new Date().toLocaleDateString(),
          lastActive: new Date().toLocaleDateString(),
          votesCreated: 0,
          votesParticipated: 0
        };
        setUsers([...users, newUser]);
        
        // Add audit log
        const newLog = {
          id: auditLogs.length + 1,
          timestamp: new Date().toISOString(),
          user: account,
          action: 'Add user',
          details: `Admin added a new user: ${values.address}`,
          type: 'success'
        };
        setAuditLogs([newLog, ...auditLogs]);
      } else if (modalType === 'edit') {
        const updatedUsers = users.map(user => 
          user.id === values.id ? { ...user, ...values } : user
        );
        setUsers(updatedUsers);
        
        // Add audit log
        const newLog = {
          id: auditLogs.length + 1,
          timestamp: new Date().toISOString(),
          user: account,
          action: 'Edit user',
          details: `Admin edited user: ${values.address}`,
          type: 'info'
        };
        setAuditLogs([newLog, ...auditLogs]);
      }
      
      message.success('Operation successful');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Operation failed:', error);
      message.error('Operation failed, please try again');
    }
  };

  const handlePermissionToggle = (permission) => {
    // Call the smart contract to switch permission status
    // Since the contract does not have permission management functionality, this is just a simulation of switching
    const newPermissions = permissions.map(p => 
      p.id === permission.id ? { ...p, enabled: !p.enabled } : p
    );
    setPermissions(newPermissions);
    message.success(`Permission "${permission.name}" is ${permission.enabled ? 'disabled' : 'enabled'}`);
    
    // Add audit log
    const newLog = {
      id: auditLogs.length + 1,
      timestamp: new Date().toISOString(),
      user: account,
      action: 'Permission change',
      details: `Admin ${permission.enabled ? 'disabled' : 'enabled'} permission: ${permission.name}`,
      type: 'info'
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const userColumns = [
    {
      title: 'User address',
      dataIndex: 'address',
      key: 'address',
      render: (address) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text code>{formatAddress(address)}</Text>
        </Space>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => getRoleTag(role)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status)
    },
    {
      title: 'Join date',
      dataIndex: 'joinDate',
      key: 'joinDate'
    },
    {
      title: 'Last active',
      dataIndex: 'lastActive',
      key: 'lastActive'
    },
    {
      title: 'Create vote',
      dataIndex: 'votesCreated',
      key: 'votesCreated'
    },
    {
      title: 'Participate in voting',
      dataIndex: 'votesParticipated',
      key: 'votesParticipated'
    },
    {
      title: 'Operation',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleUserAction('view', record)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleUserAction('edit', record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  if (!isConnected) {
    return (
      <Alert
        message="Please connect your wallet"
        description="You need to connect your Web3 wallet to access the management function"
        type="warning"
        showIcon
      />
    );
  }

  if (!isAdminUser) {
    return (
      <Alert
        message="Permission denied"
        description="You do not have permission to access the management function"
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Management Center</Title>
        <Text type="secondary">System management and permission settings</Text>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Overview" key="overview">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total users"
                  value={systemStats.totalUsers}
                  prefix={<UserOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total votes"
                  value={systemStats.totalVotes}
                  prefix={<BarChartOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Ongoing votes"
                  value={systemStats.activeVotes}
                  prefix={<BarChartOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total transactions"
                  value={systemStats.totalTransactions}
                  prefix={<BarChartOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Latest audit logs">
            <Spin spinning={loading}>
              {auditLogs.length > 0 ? (
                <List
                  dataSource={auditLogs.slice(0, 10)}
                  renderItem={(log) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={
                          <Space>
                            <Text>{formatAddress(log.user)}</Text>
                            <Tag color={log.type === 'success' ? 'green' : log.type === 'warning' ? 'orange' : 'blue'}>
                              {log.action}
                            </Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <Text type="secondary">{log.details}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {new Date(log.timestamp).toLocaleString()}
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
                  description="No audit logs"
                />
              )}
            </Spin>
          </Card>
        </TabPane>

        <TabPane tab="User management" key="users">
          <Card
            title="User list"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleUserAction('add')}
              >
                Add user
              </Button>
            }
          >
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              locale={{
                emptyText: <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No user data"
                />
              }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `Total ${total} items`
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Permission management" key="permissions">
          <Card title="Permission settings">
            <Spin spinning={loading}>
              {permissions.length > 0 ? (
                <List
                  dataSource={permissions}
                  renderItem={(permission) => (
                    <List.Item
                      actions={[
                        <Switch
                          checked={permission.enabled}
                          onChange={() => handlePermissionToggle(permission)}
                        />
                      ]}
                    >
                      <List.Item.Meta
                        title={permission.name}
                        description={
                          <div>
                            <Text type="secondary">{permission.description}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Required role: {getRoleTag(permission.requiredRole)}
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
                  description="No permission configuration"
                />
              )}
            </Spin>
          </Card>
        </TabPane>

        <TabPane tab="System settings" key="settings">
          <Card title="System settings">
            <Form layout="vertical" initialValues={systemSettings}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="votingEnabled"
                    label="Enable voting function"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="enableAnonymousVoting"
                    label="Allow anonymous voting"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="minVotingPeriod"
                    label="Shortest voting period (hours)"
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="maxVotingPeriod"
                    label="Longest voting period (hours)"
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="maxOptionsPerVote"
                    label="Maximum number of options per vote"
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="requireEmailVerification"
                    label="Require email verification"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" onClick={async () => {
                  try {
                    // Save system settings to the smart contract
                    // Since the contract does not have system settings functionality, this is just a simulation of saving
                    // In actual application, the contract's setting saving function should be called
                    
                    // Add audit log
                    const newLog = {
                      id: auditLogs.length + 1,
                      timestamp: new Date().toISOString(),
                      user: account,
                      action: 'System settings',
                      details: 'Admin updated system settings',
                      type: 'info'
                    };
                    setAuditLogs([newLog, ...auditLogs]);
                    
                    message.success('Settings saved');
                  } catch (error) {
                    console.error('Failed to save settings:', error);
                    message.error('Failed to save settings, please try again');
                  }
                }}>
                  Save settings
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>

      {/* User operation modal */}
      <Modal
        title={
          modalType === 'add' ? 'Add user' :
          modalType === 'edit' ? 'Edit user' : 'View user'
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText="Confirm"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="address"
            label="Wallet address"
            rules={[{ required: true, message: 'Please enter wallet address' }]}
          >
            <Input placeholder="0x..." />
          </Form.Item>

          <Form.Item
            name="role"
            label="User role"
            rules={[{ required: true, message: 'Please select user role' }]}
          >
            <Select 
              virtual={false}
              dropdownStyle={{ zIndex: 1050 }}
            >
              <Option value="user">User</Option>
              <Option value="moderator">Moderator</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Account status"
            rules={[{ required: true, message: 'Please select account status' }]}
          >
            <Select 
              virtual={false}
              dropdownStyle={{ zIndex: 1050 }}
            >
              <Option value="active">Active</Option>
              <Option value="suspended">Suspended</Option>
              <Option value="banned">Banned</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admin; 