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
      // 从智能合约检查用户是否为管理员
      // 由于合约中没有明确的管理员检查功能，我们使用合约的owner函数
      const contract = await getContract();
      const owner = await contract.owner();
      const isAdmin = account && account.toLowerCase() === owner.toLowerCase();
      setIsAdminUser(isAdmin);
      
      if (!isAdmin) {
        message.error('您没有管理员权限');
      }
    } catch (error) {
      console.error('检查管理员权限失败:', error);
      setIsAdminUser(false);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 从智能合约获取系统统计数据
      const allVoteIdsResult = await getAllVoteIds();
      if (allVoteIdsResult.success) {
        const voteIds = allVoteIdsResult.data;
        const totalVotes = voteIds.length;
        
        // 获取活跃投票数和总参与用户数
        let activeVotes = 0;
        let totalUsers = 0;
        const userSet = new Set();
        
        for (const voteId of voteIds) {
          const voteInfoResult = await getVoteInfo(voteId);
          if (voteInfoResult.success) {
            const voteInfo = voteInfoResult.data;
            
            // 统计活跃投票
            if (voteInfo.status === 'active') {
              activeVotes++;
            }
            
            // 统计独特用户（创建者）
            userSet.add(voteInfo.creator.toLowerCase());
            
            // 假设每个投票都有一些参与者
            totalUsers += voteInfo.totalVoters;
          }
        }
        
        setSystemStats({
          totalUsers: userSet.size,
          totalVotes,
          activeVotes,
          totalTransactions: totalVotes * 2 // 假设每个投票产生2个交易
        });
        
        // 获取用户列表（模拟数据，因为合约中没有存储用户详细信息）
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

      // 获取权限配置（模拟数据）
      const mockPermissions = [
        { id: 1, name: '创建投票', description: '允许用户创建投票', enabled: true, requiredRole: 'user' },
        { id: 2, name: '参与投票', description: '允许用户参与投票', enabled: true, requiredRole: 'user' },
        { id: 3, name: '查看结果', description: '允许用户查看投票结果', enabled: true, requiredRole: 'user' },
        { id: 4, name: '分享投票', description: '允许用户分享投票链接', enabled: true, requiredRole: 'user' },
        { id: 5, name: '删除投票', description: '允许用户删除自己的投票', enabled: false, requiredRole: 'moderator' }
      ];
      
      setPermissions(mockPermissions);

      // 获取审计日志（模拟数据）
      const mockAuditLogs = [
        {
          id: 1,
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          user: account,
          action: '查看管理面板',
          details: '管理员访问了系统管理面板',
          type: 'info'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          user: 'system',
          action: '系统启动',
          details: '系统成功启动并开始运行',
          type: 'success'
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          user: 'unknown',
          action: '访问被拒绝',
          details: '非管理员用户尝试访问管理面板',
          type: 'warning'
        }
      ];
      
      setAuditLogs(mockAuditLogs);

      setLoading(false);
    } catch (error) {
      console.error('加载管理数据失败:', error);
      message.error('加载管理数据失败');
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      // 调用智能合约删除用户
      // 由于合约中没有用户管理功能，这里只是模拟删除
      setUsers(users.filter(user => user.id !== userId));
      message.success('用户已删除');
      
      // 添加审计日志
      const newLog = {
        id: auditLogs.length + 1,
        timestamp: new Date().toISOString(),
        user: account,
        action: '删除用户',
        details: `管理员删除了用户 ID: ${userId}`,
        type: 'warning'
      };
      setAuditLogs([newLog, ...auditLogs]);
    } catch (error) {
      console.error('删除用户失败:', error);
      message.error('删除用户失败，请重试');
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRoleTag = (role) => {
    const roleConfig = {
      'admin': { color: 'red', icon: <CrownOutlined />, text: '管理员' },
      'moderator': { color: 'orange', icon: <SafetyOutlined />, text: '版主' },
      'user': { color: 'blue', icon: <UserOutlined />, text: '用户' }
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
      'active': { status: 'success', text: '正常' },
      'banned': { status: 'error', text: '封禁' },
      'suspended': { status: 'warning', text: '暂停' }
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
      
      // 调用智能合约执行用户操作
      // 由于合约中没有用户管理功能，这里只是模拟操作
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
        
        // 添加审计日志
        const newLog = {
          id: auditLogs.length + 1,
          timestamp: new Date().toISOString(),
          user: account,
          action: '添加用户',
          details: `管理员添加了新用户: ${values.address}`,
          type: 'success'
        };
        setAuditLogs([newLog, ...auditLogs]);
      } else if (modalType === 'edit') {
        const updatedUsers = users.map(user => 
          user.id === values.id ? { ...user, ...values } : user
        );
        setUsers(updatedUsers);
        
        // 添加审计日志
        const newLog = {
          id: auditLogs.length + 1,
          timestamp: new Date().toISOString(),
          user: account,
          action: '编辑用户',
          details: `管理员编辑了用户: ${values.address}`,
          type: 'info'
        };
        setAuditLogs([newLog, ...auditLogs]);
      }
      
      message.success('操作成功');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败，请重试');
    }
  };

  const handlePermissionToggle = (permission) => {
    // 调用智能合约切换权限状态
    // 由于合约中没有权限管理功能，这里只是模拟切换
    const newPermissions = permissions.map(p => 
      p.id === permission.id ? { ...p, enabled: !p.enabled } : p
    );
    setPermissions(newPermissions);
    message.success(`权限 "${permission.name}" 已${permission.enabled ? '禁用' : '启用'}`);
    
    // 添加审计日志
    const newLog = {
      id: auditLogs.length + 1,
      timestamp: new Date().toISOString(),
      user: account,
      action: '权限变更',
      details: `管理员${permission.enabled ? '禁用' : '启用'}了权限: ${permission.name}`,
      type: 'info'
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const userColumns = [
    {
      title: '用户地址',
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
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => getRoleTag(role)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status)
    },
    {
      title: '加入时间',
      dataIndex: 'joinDate',
      key: 'joinDate'
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActive',
      key: 'lastActive'
    },
    {
      title: '创建投票',
      dataIndex: 'votesCreated',
      key: 'votesCreated'
    },
    {
      title: '参与投票',
      dataIndex: 'votesParticipated',
      key: 'votesParticipated'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleUserAction('view', record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleUserAction('edit', record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDeleteUser(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  if (!isConnected) {
    return (
      <Alert
        message="请先连接钱包"
        description="您需要连接Web3钱包才能访问管理功能"
        type="warning"
        showIcon
      />
    );
  }

  if (!isAdminUser) {
    return (
      <Alert
        message="权限不足"
        description="您没有权限访问管理功能"
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>管理中心</Title>
        <Text type="secondary">系统管理和权限设置</Text>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="概览" key="overview">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总用户数"
                  value={systemStats.totalUsers}
                  prefix={<UserOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总投票数"
                  value={systemStats.totalVotes}
                  prefix={<BarChartOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="进行中投票"
                  value={systemStats.activeVotes}
                  prefix={<BarChartOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总交易数"
                  value={systemStats.totalTransactions}
                  prefix={<BarChartOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>
          </Row>

          <Card title="最新审计日志">
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
                  description="暂无审计日志"
                />
              )}
            </Spin>
          </Card>
        </TabPane>

        <TabPane tab="用户管理" key="users">
          <Card
            title="用户列表"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleUserAction('add')}
              >
                添加用户
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
                  description="暂无用户数据"
                />
              }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="权限管理" key="permissions">
          <Card title="权限设置">
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
                              需要角色: {getRoleTag(permission.requiredRole)}
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
                  description="暂无权限配置"
                />
              )}
            </Spin>
          </Card>
        </TabPane>

        <TabPane tab="系统设置" key="settings">
          <Card title="系统配置">
            <Form layout="vertical" initialValues={systemSettings}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="votingEnabled"
                    label="启用投票功能"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="enableAnonymousVoting"
                    label="允许匿名投票"
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
                    label="最短投票周期 (小时)"
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="maxVotingPeriod"
                    label="最长投票周期 (小时)"
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="maxOptionsPerVote"
                    label="每个投票最大选项数"
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="requireEmailVerification"
                    label="需要邮箱验证"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" onClick={async () => {
                  try {
                    // 保存系统设置到智能合约
                    // 由于合约中没有系统设置功能，这里只是模拟保存
                    // 实际应用中应该调用合约的设置保存函数
                    
                    // 添加审计日志
                    const newLog = {
                      id: auditLogs.length + 1,
                      timestamp: new Date().toISOString(),
                      user: account,
                      action: '系统设置',
                      details: '管理员更新了系统设置',
                      type: 'info'
                    };
                    setAuditLogs([newLog, ...auditLogs]);
                    
                    message.success('设置已保存');
                  } catch (error) {
                    console.error('保存设置失败:', error);
                    message.error('保存设置失败，请重试');
                  }
                }}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>

      {/* 用户操作模态框 */}
      <Modal
        title={
          modalType === 'add' ? '添加用户' :
          modalType === 'edit' ? '编辑用户' : '查看用户'
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="address"
            label="钱包地址"
            rules={[{ required: true, message: '请输入钱包地址' }]}
          >
            <Input placeholder="0x..." />
          </Form.Item>

          <Form.Item
            name="role"
            label="用户角色"
            rules={[{ required: true, message: '请选择用户角色' }]}
          >
            <Select 
              virtual={false}
              dropdownStyle={{ zIndex: 1050 }}
            >
              <Option value="user">用户</Option>
              <Option value="moderator">版主</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="账户状态"
            rules={[{ required: true, message: '请选择账户状态' }]}
          >
            <Select 
              virtual={false}
              dropdownStyle={{ zIndex: 1050 }}
            >
              <Option value="active">正常</Option>
              <Option value="suspended">暂停</Option>
              <Option value="banned">封禁</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admin; 