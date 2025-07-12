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

  useEffect(() => {
    if (isConnected && isAdmin()) {
      loadAdminData();
    }
  }, [isConnected]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // TODO: 从智能合约获取系统统计数据
      // const contract = getContract();
      // const totalUsers = await contract.getTotalUsers();
      // const totalVotes = await contract.getTotalVotes();
      // const activeVotes = await contract.getActiveVotes();
      // const totalTransactions = await contract.getTotalTransactions();
      
      // setSystemStats({
      //   totalUsers: totalUsers.toNumber(),
      //   totalVotes: totalVotes.toNumber(),
      //   activeVotes: activeVotes.toNumber(),
      //   totalTransactions: totalTransactions.toNumber()
      // });

      // TODO: 获取用户列表
      // const usersList = await contract.getAllUsers();
      // setUsers(usersList.map(user => ({
      //   id: user.id.toNumber(),
      //   address: user.address,
      //   role: user.role,
      //   status: user.status,
      //   joinDate: new Date(user.joinDate * 1000).toLocaleDateString(),
      //   lastActive: new Date(user.lastActive * 1000).toLocaleDateString(),
      //   votesCreated: user.votesCreated.toNumber(),
      //   votesParticipated: user.votesParticipated.toNumber()
      // })));

      // TODO: 获取权限配置
      // const permissionsList = await contract.getPermissions();
      // setPermissions(permissionsList);

      // TODO: 获取审计日志
      // const logs = await contract.getAuditLogs(50); // 获取最近50条日志
      // setAuditLogs(logs);

      setLoading(false);
    } catch (error) {
      console.error('加载管理数据失败:', error);
      message.error('加载管理数据失败');
      setLoading(false);
    }
  };

  const isAdmin = () => {
    // TODO: 从智能合约检查用户是否为管理员
    // const contract = getContract();
    // return await contract.isAdmin(account);
    
    // 临时返回 false，需要实际的权限检查
    return false;
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
      
      // TODO: 调用智能合约执行用户操作
      // const contract = getContract();
      // if (modalType === 'add') {
      //   await contract.addUser(values.address, values.role, values.status);
      // } else if (modalType === 'edit') {
      //   await contract.updateUser(values.id, values.role, values.status);
      // }
      
      message.success('操作成功');
      setModalVisible(false);
      form.resetFields();
      loadAdminData();
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败，请重试');
    }
  };

  const handlePermissionToggle = (permission) => {
    // TODO: 调用智能合约切换权限状态
    // const contract = getContract();
    // await contract.togglePermission(permission.id, !permission.enabled);
    
    const newPermissions = permissions.map(p => 
      p.id === permission.id ? { ...p, enabled: !p.enabled } : p
    );
    setPermissions(newPermissions);
    message.success(`权限 "${permission.name}" 已${permission.enabled ? '禁用' : '启用'}`);
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
            onConfirm={() => {
              // TODO: 调用智能合约删除用户
              message.success('用户已删除');
              loadAdminData();
            }}
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

  if (!isAdmin()) {
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
                            <Tag color={log.status === 'success' ? 'green' : 'orange'}>
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
                <Button type="primary" onClick={() => {
                  // TODO: 保存系统设置到智能合约
                  message.success('设置已保存');
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