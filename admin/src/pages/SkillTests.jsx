import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Card,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Typography,
  Tag,
  Popconfirm,
  message,
  Switch,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { skillTestsAPI } from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SkillTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockTests = [
        {
          id: '1',
          name: 'Python Fundamentals',
          description: 'Test your Python basics including data types, functions, and OOP',
          topic: 'Python',
          difficulty: 'medium',
          questionCount: 25,
          durationMinutes: 30,
          passingScore: 70,
          isActive: true,
          attemptCount: 1250,
          avgScore: 72,
        },
        {
          id: '2',
          name: 'SQL Mastery',
          description: 'Advanced SQL queries, joins, subqueries, and optimization',
          topic: 'SQL',
          difficulty: 'hard',
          questionCount: 30,
          durationMinutes: 45,
          passingScore: 60,
          isActive: true,
          attemptCount: 980,
          avgScore: 65,
        },
        {
          id: '3',
          name: 'Excel for Data Analysis',
          description: 'Excel functions, pivot tables, and data manipulation',
          topic: 'Excel',
          difficulty: 'easy',
          questionCount: 20,
          durationMinutes: 25,
          passingScore: 70,
          isActive: true,
          attemptCount: 560,
          avgScore: 78,
        },
      ];
      setTests(mockTests);
    } catch (error) {
      message.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = (test = null) => {
    setEditingTest(test);
    if (test) {
      form.setFieldsValue(test);
    } else {
      form.resetFields();
      form.setFieldsValue({
        durationMinutes: 30,
        passingScore: 70,
        isActive: true,
      });
    }
    setModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      if (editingTest) {
        message.success('Test updated successfully');
      } else {
        message.success('Test created successfully');
      }
      setModalVisible(false);
      loadTests();
    } catch (error) {
      message.error('Failed to save test');
    }
  };

  const handleDelete = async (id) => {
    try {
      message.success('Test deleted successfully');
      loadTests();
    } catch (error) {
      message.error('Failed to delete test');
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      message.success(`Test ${isActive ? 'activated' : 'deactivated'}`);
      loadTests();
    } catch (error) {
      message.error('Failed to update test status');
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'green',
      medium: 'orange',
      hard: 'red',
    };
    return colors[difficulty] || 'default';
  };

  const columns = [
    {
      title: 'Test Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
        </Space>
      ),
    },
    {
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (text) => (
        <Tag color={getDifficultyColor(text)}>{text.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Questions',
      dataIndex: 'questionCount',
      key: 'questionCount',
      align: 'center',
    },
    {
      title: 'Duration',
      dataIndex: 'durationMinutes',
      key: 'durationMinutes',
      align: 'center',
      render: (mins) => `${mins} min`,
    },
    {
      title: 'Attempts',
      dataIndex: 'attemptCount',
      key: 'attemptCount',
      align: 'center',
    },
    {
      title: 'Avg Score',
      dataIndex: 'avgScore',
      key: 'avgScore',
      align: 'center',
      render: (score) => `${score}%`,
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(record.id, checked)}
          size="small"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<QuestionCircleOutlined />}
            onClick={() => navigate(`/skill-questions?testId=${record.id}`)}
            title="Manage Questions"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleAddEdit(record)}
          />
          <Popconfirm
            title="Delete this test?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={4}>Skill Tests</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleAddEdit()}
        >
          Create Test
        </Button>
      </div>

      {/* Summary Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Tests"
              value={tests.length}
              valueStyle={{ color: '#1E3A8A' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Tests"
              value={tests.filter(t => t.isActive).length}
              valueStyle={{ color: '#10B981' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Questions"
              value={tests.reduce((sum, t) => sum + t.questionCount, 0)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Attempts"
              value={tests.reduce((sum, t) => sum + t.attemptCount, 0)}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={tests}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingTest ? 'Edit Test' : 'Create Test'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="name"
            label="Test Name"
            rules={[{ required: true, message: 'Please enter test name' }]}
          >
            <Input placeholder="e.g., Python Fundamentals" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Brief description of what this test covers" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="topic"
                label="Topic"
                rules={[{ required: true, message: 'Please select a topic' }]}
              >
                <Select placeholder="Select topic">
                  <Select.Option value="Python">Python</Select.Option>
                  <Select.Option value="SQL">SQL</Select.Option>
                  <Select.Option value="Excel">Excel</Select.Option>
                  <Select.Option value="Statistics">Statistics</Select.Option>
                  <Select.Option value="ML Basics">ML Basics</Select.Option>
                  <Select.Option value="Data Cleaning">Data Cleaning</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="difficulty"
                label="Difficulty"
                rules={[{ required: true, message: 'Please select difficulty' }]}
              >
                <Select placeholder="Select difficulty">
                  <Select.Option value="easy">Easy</Select.Option>
                  <Select.Option value="medium">Medium</Select.Option>
                  <Select.Option value="hard">Hard</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="durationMinutes"
                label="Duration (minutes)"
                rules={[{ required: true, message: 'Please enter duration' }]}
              >
                <InputNumber min={5} max={120} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="passingScore"
                label="Passing Score (%)"
                rules={[{ required: true, message: 'Please enter passing score' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTest ? 'Update Test' : 'Create Test'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SkillTests;
