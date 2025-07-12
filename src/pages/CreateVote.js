import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Space,
  Typography,
  Divider,
  List,
  message,
  Row,
  Col,
  Switch,
  InputNumber,
  Alert
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { createVote } from '../utils/contractUtils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CreateVote = () => {
  const navigate = useNavigate();
  const { isConnected, account } = useWallet();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(['', '']);
  const [previewVisible, setPreviewVisible] = useState(false);

  const addOption = () => {
    if (options.length >= 10) {
      message.warning('最多只能添加10个选项');
      return;
    }
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      message.warning('至少需要保留2个选项');
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (values) => {
    if (!isConnected) {
      message.error('请先连接钱包');
      return;
    }

    // 验证选项
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      message.error('至少需要2个有效选项');
      return;
    }

    // 验证时间范围
    if (!values.timeRange || values.timeRange.length !== 2) {
      message.error('请选择投票的开始和结束时间');
      return;
    }

    const startTime = values.timeRange[0].valueOf();
    const endTime = values.timeRange[1].valueOf();
    
    if (startTime <= Date.now()) {
      message.error('开始时间必须晚于当前时间');
      return;
    }

    if (endTime <= startTime) {
      message.error('结束时间必须晚于开始时间');
      return;
    }

    setLoading(true);
    try {
      // 准备投票数据
      const voteData = {
        title: values.title,
        description: values.description,
        options: validOptions,
        voteType: values.voteType,
        startTime: startTime,
        endTime: endTime,
        isPrivate: values.permissionType === 'private',
        allowedVoters: [] // 如果是私有投票，这里应该处理允许的投票者列表
      };

      console.log('创建投票数据:', voteData);

      // 调用智能合约创建投票
      const result = await createVote(voteData);
      
      if (result.success) {
        message.success('投票创建成功！');
        navigate('/votes');
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('创建投票失败:', error);
      message.error(`创建投票失败: ${error.message || '请重试'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    form.validateFields().then(values => {
      const validOptions = options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        message.error('至少需要2个有效选项才能预览');
        return;
      }
      setPreviewVisible(!previewVisible);
    }).catch(() => {
      message.error('请完善表单信息');
    });
  };

  const VotePreview = () => {
    const values = form.getFieldsValue();
    const validOptions = options.filter(opt => opt.trim() !== '');

    return (
      <Card title="投票预览" style={{ marginTop: 24 }}>
        <Title level={4}>{values.title || '投票标题'}</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          {values.description || '投票描述'}
        </Text>
        
        <Divider>投票选项</Divider>
        <List
          dataSource={validOptions}
          renderItem={(option, index) => (
            <List.Item>
              <Space>
                <Text strong>{index + 1}.</Text>
                <Text>{option}</Text>
              </Space>
            </List.Item>
          )}
        />

        <Divider>时间设置</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>开始时间：</Text>
            <Text>
              {values.timeRange && values.timeRange[0] 
                ? values.timeRange[0].format('YYYY-MM-DD HH:mm') 
                : '未设置'}
            </Text>
          </Col>
          <Col span={12}>
            <Text strong>结束时间：</Text>
            <Text>
              {values.timeRange && values.timeRange[1] 
                ? values.timeRange[1].format('YYYY-MM-DD HH:mm') 
                : '未设置'}
            </Text>
          </Col>
        </Row>
        
        {values.timeRange && values.timeRange[0] && values.timeRange[1] && (
          <Row style={{ marginTop: 8 }}>
            <Col span={24}>
              <Text strong>投票持续时间：</Text>
              <Text>
                {Math.round(values.timeRange[1].diff(values.timeRange[0], 'hour', true))} 小时
              </Text>
            </Col>
          </Row>
        )}

        <Divider>投票设置</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>投票类型：</Text>
            <Text>{values.voteType === 'single' ? '单选投票' : '多选投票'}</Text>
          </Col>
          <Col span={12}>
            <Text strong>权限设置：</Text>
            <Text>{values.permissionType === 'public' ? '公开投票' : '私有投票'}</Text>
          </Col>
        </Row>
      </Card>
    );
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Alert
          message="请先连接钱包"
          description="您需要连接Web3钱包才能创建投票"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>发起投票</Title>
        <Text type="secondary">创建一个新的去中心化投票</Text>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={previewVisible ? 12 : 16}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="create-vote-form"
              initialValues={{
                voteType: 'single',
                permissionType: 'public',
                anonymous: false,
                maxVotesPerUser: 1
              }}
            >
              {/* 基本信息 */}
              <Title level={4}>基本信息</Title>
              
              <Form.Item
                name="title"
                label="投票标题"
                rules={[
                  { required: true, message: '请输入投票标题' },
                  { max: 100, message: '标题不能超过100个字符' }
                ]}
              >
                <Input placeholder="请输入投票标题" />
              </Form.Item>

              <Form.Item
                name="description"
                label="投票描述"
                rules={[
                  { required: true, message: '请输入投票描述' },
                  { max: 500, message: '描述不能超过500个字符' }
                ]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="详细描述投票内容、背景和目的"
                />
              </Form.Item>

              <Divider />

              {/* 投票选项 */}
              <Title level={4}>投票选项</Title>
              
              <Form.Item label="选项列表">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {options.map((option, index) => (
                    <Space key={index} style={{ width: '100%' }}>
                      <Input
                        placeholder={`选项 ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        style={{ flex: 1 }}
                      />
                      {options.length > 2 && (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeOption(index)}
                        />
                      )}
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={addOption}
                    style={{ width: '100%' }}
                    disabled={options.length >= 10}
                  >
                    添加选项 ({options.length}/10)
                  </Button>
                </Space>
              </Form.Item>

              <Divider />

              {/* 时间设置 */}
              <Title level={4}>时间设置</Title>
              
              <Form.Item
                name="timeRange"
                label="投票时间"
                rules={[
                  { required: true, message: '请选择投票的开始和结束时间' },
                  {
                    validator: (_, value) => {
                      if (!value || value.length !== 2) {
                        return Promise.reject(new Error('请选择完整的时间范围'));
                      }
                      
                      const startTime = value[0];
                      const endTime = value[1];
                      const now = dayjs();
                      
                      if (startTime.isBefore(now.add(1, 'minute'))) {
                        return Promise.reject(new Error('开始时间必须至少比当前时间晚1分钟'));
                      }
                      
                      if (endTime.isBefore(startTime)) {
                        return Promise.reject(new Error('结束时间不能早于开始时间'));
                      }
                      
                      if (endTime.diff(startTime, 'minute') < 30) {
                        return Promise.reject(new Error('投票持续时间至少需要30分钟'));
                      }
                      
                      return Promise.resolve();
                    }
                  }
                ]}
                tooltip="设置投票的开始和结束时间，投票只能在此时间范围内进行"
              >
                <RangePicker
                  showTime={{
                    format: 'HH:mm',
                    minuteStep: 15
                  }}
                  format="YYYY-MM-DD HH:mm"
                  placeholder={['选择开始时间', '选择结束时间']}
                  style={{ width: '100%' }}
                  getPopupContainer={(trigger) => trigger.parentElement}
                  dropdownClassName="fixed-date-picker"
                  popupStyle={{ 
                    position: 'fixed',
                    zIndex: 9999
                  }}
                  disabledDate={(current) => {
                    // 禁用过去的日期
                    return current && current < dayjs().startOf('day');
                  }}
                  disabledTime={(current, type) => {
                    const now = dayjs();
                    if (type === 'start') {
                      // 如果是今天，禁用过去的小时和分钟
                      if (current && current.isSame(now, 'day')) {
                        return {
                          disabledHours: () => {
                            const hours = [];
                            for (let i = 0; i < now.hour(); i++) {
                              hours.push(i);
                            }
                            return hours;
                          },
                          disabledMinutes: (selectedHour) => {
                            if (selectedHour === now.hour()) {
                              const minutes = [];
                              for (let i = 0; i <= now.minute(); i++) {
                                minutes.push(i);
                              }
                              return minutes;
                            }
                            return [];
                          }
                        };
                      }
                    }
                    return {};
                  }}
                />
              </Form.Item>

              <Divider />

              {/* 投票设置 */}
              <Title level={4}>投票设置</Title>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="voteType"
                    label="投票类型"
                    rules={[{ required: true }]}
                  >
                    <Select 
                      virtual={false}
                      dropdownStyle={{ zIndex: 1050 }}
                    >
                      <Option value="single">单选投票</Option>
                      <Option value="multi">多选投票</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="permissionType"
                    label="权限设置"
                    rules={[{ required: true }]}
                  >
                    <Select 
                      virtual={false}
                      dropdownStyle={{ zIndex: 1050 }}
                    >
                      <Option value="public">公开投票</Option>
                      <Option value="private">私有投票</Option>
                      <Option value="token">代币持有者</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="maxVotesPerUser"
                    label="每人最大投票数"
                    dependencies={['voteType']}
                  >
                    <InputNumber min={1} max={10} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="anonymous"
                    label="匿名投票"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="minParticipants"
                label="最少参与人数"
                tooltip="投票生效所需的最少参与人数"
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="可选，留空表示无限制" />
              </Form.Item>

              <Divider />

              {/* 操作按钮 */}
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    size="large"
                  >
                    创建投票
                  </Button>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                    size="large"
                  >
                    {previewVisible ? '隐藏预览' : '预览投票'}
                  </Button>
                  <Button onClick={() => navigate('/dashboard')}>
                    取消
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {previewVisible && (
          <Col xs={24} lg={12}>
            <VotePreview />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default CreateVote; 