import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
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
  EyeOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { createVote } from '../utils/contractUtils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateVote = () => {
  const navigate = useNavigate();
  const { isConnected, account } = useWallet();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(['', '']);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [immediateStart, setImmediateStart] = useState(false);

  const addOption = () => {
    if (options.length >= 10) {
      message.warning('At most 10 options can be added');
      return;
    }
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      message.warning('At least 2 options are required');
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

  const handleImmediateStart = (checked) => {
    setImmediateStart(checked);
    if (checked) {
      const now = dayjs().format('YYYY-MM-DD HH:mm');
      form.setFieldsValue({
        startTime: now,
      });
      message.success('Set to immediate start');
    } else {
      form.setFieldsValue({
        startTime: ''
      });
      message.info('Immediate start cancelled');
    }
  };

  const handleSubmit = async (values) => {
    if (!isConnected) {
      message.error('Please connect your wallet');
      return;
    }

    // Validate options
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      message.error('At least 2 valid options are required');
      return;
    }

    // Validate time
    if (!values.startTime || !values.endTime) {
      message.error('Please enter the start and end time of the vote');
      return;
    }

    // Convert string time to dayjs object and validate
    const startDateTime = dayjs(values.startTime, 'YYYY-MM-DD HH:mm');
    const endDateTime = dayjs(values.endTime, 'YYYY-MM-DD HH:mm');
    
    if (!startDateTime.isValid() || !endDateTime.isValid()) {
      message.error('Please enter a valid time format');
      return;
    }

    const startTime = startDateTime.valueOf();
    const endTime = endDateTime.valueOf();
    
    if (!immediateStart && startTime <= Date.now()) {
      message.error('Start time must be later than the current time');
      return;
    }

    if (endTime <= startTime) {
      message.error('End time must be later than the start time');
      return;
    }

    if (endDateTime.diff(startDateTime, 'minute') < 30) {
      message.error('The vote duration must be at least 30 minutes');
      return;
    }

    setLoading(true);
    try {
      // Prepare vote data
      const voteData = {
        title: values.title,
        description: values.description,
        options: validOptions,
        voteType: values.voteType,
        startTime: startTime,
        endTime: endTime,
        isPrivate: values.permissionType === 'private',
        allowedVoters: [] // If it is a private vote, here should handle the list of allowed voters
      };

      console.log('Create vote data:', voteData);

      // Call the smart contract to create the vote
      const result = await createVote(voteData);
      
      if (result.success) {
        message.success('Vote created successfully!');
        navigate('/votes');
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Failed to create vote:', error);
      message.error(`Failed to create vote: ${error.message || 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    form.validateFields().then(values => {
      const validOptions = options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        message.error('At least 2 valid options are required to preview');
        return;
      }
      setPreviewVisible(!previewVisible);
    }).catch(() => {
      message.error('Please complete the form information');
    });
  };

  const VotePreview = () => {
    const values = form.getFieldsValue();
    const validOptions = options.filter(opt => opt.trim() !== '');

    return (
      <Card title="Vote preview" style={{ marginTop: 24 }}>
        <Title level={4}>{values.title || 'Vote title'}</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          {values.description || 'Vote description'}
        </Text>
        
        <Divider>Vote options</Divider>
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

        <Divider>Time settings</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Start time:</Text>
            <Text>
              {values.startTime || '未设置'}
            </Text>
          </Col>
          <Col span={12}>
            <Text strong>End time:</Text>
            <Text>
              {values.endTime || '未设置'}
            </Text>
          </Col>
        </Row>
        
        {values.startTime && values.endTime && (
          <Row style={{ marginTop: 8 }}>
            <Col span={24}>
              <Text strong>Vote duration:</Text>
              <Text>
                {(() => {
                  const startDateTime = dayjs(values.startTime, 'YYYY-MM-DD HH:mm');
                  const endDateTime = dayjs(values.endTime, 'YYYY-MM-DD HH:mm');
                  if (startDateTime.isValid() && endDateTime.isValid()) {
                    return Math.round(endDateTime.diff(startDateTime, 'hour', true)) + ' hours';
                  }
                  return 'Please enter a valid time format';
                })()}
              </Text>
            </Col>
          </Row>
        )}

        <Divider>Vote settings</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Vote type:</Text>
            <Text>{values.voteType === 'single' ? 'Single choice vote' : 'Multi-choice vote'}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Permission settings:</Text>
            <Text>{values.permissionType === 'public' ? 'Public vote' : 'Private vote'}</Text>
          </Col>
        </Row>
      </Card>
    );
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Alert
          message="Please connect your wallet"
          description="You need to connect your Web3 wallet to create a vote"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Create a vote</Title>
        <Text type="secondary">Create a new decentralized vote</Text>
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
              {/* Basic information */}
              <Title level={4}>Basic information</Title>
              
              <Form.Item
                name="title"
                label="Vote title"
                rules={[
                  { required: true, message: 'Please enter the vote title' },
                  { max: 100, message: 'The title cannot exceed 100 characters' }
                ]}
              >
                <Input placeholder="Please enter the vote title" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Vote description"
                rules={[
                  { required: true, message: 'Please enter the vote description' },
                  { max: 500, message: 'The description cannot exceed 500 characters' }
                ]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Please enter the vote content, background and purpose"
                />
              </Form.Item>

              <Divider />

              {/* Vote options */}
              <Title level={4}>Vote options</Title>
              
              <Form.Item label="Option list">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {options.map((option, index) => (
                    <Space key={index} style={{ width: '100%' }}>
                      <Input
                        placeholder={`Option ${index + 1}`}
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
                    Add option ({options.length}/10)
                  </Button>
                </Space>
              </Form.Item>

              <Divider />

              {/* Time settings */}
              <Title level={4}>Time settings</Title>
              
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name="immediateStart"
                  label="Immediate start"
                  valuePropName="checked"
                  initialValue={false}
                  tooltip="After enabling, the vote will start immediately, only the end time needs to be set"
                >
                  <Switch 
                    onChange={handleImmediateStart}
                    checkedChildren="Enable"
                    unCheckedChildren="Disable"
                  />
                </Form.Item>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="startTime"
                      label="Start time"
                      rules={[
                        { required: true, message: 'Please enter the start time' },
                        {
                          pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
                          message: 'The time format is incorrect, please use the YYYY-MM-DD HH:mm format'
                        },
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            
                            // Validate date format
                            const dateTime = dayjs(value, 'YYYY-MM-DD HH:mm');
                            if (!dateTime.isValid()) {
                              return Promise.reject(new Error('Please enter a valid date and time'));
                            }
                            
                            const now = dayjs();
                            
                            // If not immediate start, validate start time
                            if (!immediateStart && dateTime.isBefore(now.add(1, 'minute'))) {
                              return Promise.reject(new Error('The start time must be at least 1 minute later than the current time'));
                            }
                            
                            return Promise.resolve();
                          }
                        }
                      ]}
                    >
                      <Input
                        placeholder="For example: 2025-07-19 09:44"
                        style={{ width: '100%' }}
                        disabled={immediateStart}
                        maxLength={16}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="endTime"
                      label="End time"
                      rules={[
                        { required: true, message: 'Please enter the end time' },
                        {
                          pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
                          message: 'The time format is incorrect, please use the YYYY-MM-DD HH:mm format'
                        },
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            
                            // Validate date format
                            const endDateTime = dayjs(value, 'YYYY-MM-DD HH:mm');
                            if (!endDateTime.isValid()) {
                              return Promise.reject(new Error('Please enter a valid date and time'));
                            }
                            
                            const startTimeValue = form.getFieldValue('startTime');
                            if (startTimeValue) {
                              const startDateTime = dayjs(startTimeValue, 'YYYY-MM-DD HH:mm');
                              
                              if (startDateTime.isValid() && endDateTime.isBefore(startDateTime)) {
                                return Promise.reject(new Error('The end time cannot be earlier than the start time'));
                              }
                              
                              if (startDateTime.isValid() && endDateTime.diff(startDateTime, 'minute') < 30) {
                                return Promise.reject(new Error('The vote duration must be at least 30 minutes'));
                              }
                            }
                            
                            return Promise.resolve();
                          }
                        }
                      ]}
                    >
                      <Input
                        placeholder="For example: 2025-07-20 18:00"
                        style={{ width: '100%' }}
                        maxLength={16}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Space>

              <Divider />

              {/* Vote settings */}
              <Title level={4}>Vote settings</Title>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="voteType"
                    label="Vote type"
                    rules={[{ required: true }]}
                  >
                    <Select 
                      virtual={false}
                      dropdownStyle={{ zIndex: 1050 }}
                    >
                      <Option value="single">Single choice vote</Option>
                      <Option value="multi">Multi-choice vote</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="permissionType"
                    label="Permission settings"
                    rules={[{ required: true }]}
                  >
                    <Select 
                      virtual={false}
                      dropdownStyle={{ zIndex: 1050 }}
                    >
                      <Option value="public">Public vote</Option>
                      <Option value="private">Private vote</Option>
                      <Option value="token">Token holder</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="maxVotesPerUser"
                    label="Maximum number of votes per user"
                    dependencies={['voteType']}
                  >
                    <InputNumber min={1} max={10} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="anonymous"
                    label="Anonymous vote"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="minParticipants"
                label="Minimum number of participants"
                tooltip="The minimum number of participants required for the vote to take effect"
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Optional, leave blank for no limit" />
              </Form.Item>

              <Divider />

              {/* Operation buttons */}
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    size="large"
                  >
                    Create vote
                  </Button>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                    size="large"
                  >
                    {previewVisible ? 'Hide preview' : 'Preview vote'}
                  </Button>
                  <Button onClick={() => navigate('/dashboard')}>
                    Cancel
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