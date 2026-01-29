import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Card,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Tag,
  Popconfirm,
  message,
  Upload,
  Radio,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { skillQuestionsAPI, skillTestsAPI } from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SkillQuestions = () => {
  const [searchParams] = useSearchParams();
  const testIdFromUrl = searchParams.get('testId');

  const [questions, setQuestions] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedTestId, setSelectedTestId] = useState(testIdFromUrl || '');
  const [form] = Form.useForm();

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedTestId) {
      loadQuestions();
    }
  }, [selectedTestId]);

  const loadTests = async () => {
    try {
      // Mock tests
      const mockTests = [
        { id: '1', name: 'Python Fundamentals' },
        { id: '2', name: 'SQL Mastery' },
        { id: '3', name: 'Excel for Data Analysis' },
      ];
      setTests(mockTests);
      if (testIdFromUrl) {
        setSelectedTestId(testIdFromUrl);
      }
    } catch (error) {
      message.error('Failed to load tests');
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      // Mock questions
      const mockQuestions = [
        {
          id: 'q1',
          testId: '1',
          questionText: 'What is the output of print(type([]))?',
          optionA: "<class 'list'>",
          optionB: "<class 'tuple'>",
          optionC: "<class 'dict'>",
          optionD: "<class 'set'>",
          correctAnswer: 'a',
          difficulty: 'easy',
          topic: 'Data Types',
          explanation: 'Empty square brackets [] create an empty list in Python.',
        },
        {
          id: 'q2',
          testId: '1',
          questionText: 'Which method is used to add an element to the end of a list?',
          optionA: 'add()',
          optionB: 'append()',
          optionC: 'insert()',
          optionD: 'extend()',
          correctAnswer: 'b',
          difficulty: 'easy',
          topic: 'Lists',
          explanation: 'The append() method adds a single element to the end of a list.',
        },
        {
          id: 'q3',
          testId: '1',
          questionText: 'What is the difference between a list and a tuple?',
          optionA: 'Lists are faster than tuples',
          optionB: 'Tuples can store more data',
          optionC: 'Lists are mutable, tuples are immutable',
          optionD: 'There is no difference',
          correctAnswer: 'c',
          difficulty: 'medium',
          topic: 'Data Types',
          explanation: 'Lists can be modified after creation (mutable), while tuples cannot (immutable).',
        },
      ];
      setQuestions(mockQuestions.filter(q => q.testId === selectedTestId || !selectedTestId));
    } catch (error) {
      message.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = (question = null) => {
    setEditingQuestion(question);
    if (question) {
      form.setFieldsValue(question);
    } else {
      form.resetFields();
      form.setFieldsValue({ testId: selectedTestId, difficulty: 'medium' });
    }
    setModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      if (editingQuestion) {
        message.success('Question updated successfully');
      } else {
        message.success('Question created successfully');
      }
      setModalVisible(false);
      loadQuestions();
    } catch (error) {
      message.error('Failed to save question');
    }
  };

  const handleDelete = async (id) => {
    try {
      message.success('Question deleted successfully');
      loadQuestions();
    } catch (error) {
      message.error('Failed to delete question');
    }
  };

  const handleBulkImport = async (info) => {
    // Handle CSV/JSON import
    message.success('Questions imported successfully');
    setImportModalVisible(false);
    loadQuestions();
  };

  const getDifficultyColor = (difficulty) => {
    const colors = { easy: 'green', medium: 'orange', hard: 'red' };
    return colors[difficulty] || 'default';
  };

  const columns = [
    {
      title: 'Question',
      dataIndex: 'questionText',
      key: 'questionText',
      ellipsis: true,
      width: '40%',
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
      render: (text) => <Tag color={getDifficultyColor(text)}>{text}</Tag>,
    },
    {
      title: 'Answer',
      dataIndex: 'correctAnswer',
      key: 'correctAnswer',
      render: (ans) => <Tag color="blue">{ans.toUpperCase()}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleAddEdit(record)}
          />
          <Popconfirm
            title="Delete this question?"
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
        <Title level={4}>Question Bank</Title>
        <Space>
          <Button icon={<UploadOutlined />} onClick={() => setImportModalVisible(true)}>
            Import
          </Button>
          <Button icon={<DownloadOutlined />}>
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAddEdit()}
            disabled={!selectedTestId}
          >
            Add Question
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Text strong>Filter by Test:</Text>
          <Select
            style={{ width: 300 }}
            placeholder="Select a test"
            value={selectedTestId}
            onChange={setSelectedTestId}
            allowClear
          >
            {tests.map((test) => (
              <Select.Option key={test.id} value={test.id}>
                {test.name}
              </Select.Option>
            ))}
          </Select>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={questions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingQuestion ? 'Edit Question' : 'Add Question'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="testId"
            label="Test"
            rules={[{ required: true, message: 'Please select a test' }]}
          >
            <Select placeholder="Select test">
              {tests.map((test) => (
                <Select.Option key={test.id} value={test.id}>
                  {test.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="questionText"
            label="Question"
            rules={[{ required: true, message: 'Please enter the question' }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="optionA"
                label="Option A"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="optionB"
                label="Option B"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="optionC"
                label="Option C"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="optionD"
                label="Option D"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="correctAnswer"
                label="Correct Answer"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value="a">A</Radio>
                  <Radio value="b">B</Radio>
                  <Radio value="c">C</Radio>
                  <Radio value="d">D</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="difficulty"
                label="Difficulty"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="easy">Easy</Select.Option>
                  <Select.Option value="medium">Medium</Select.Option>
                  <Select.Option value="hard">Hard</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="topic" label="Topic">
                <Input placeholder="e.g., Data Types" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="explanation" label="Explanation (shown after answering)">
            <TextArea rows={2} placeholder="Explain why this is the correct answer" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingQuestion ? 'Update' : 'Create'} Question
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Modal */}
      <Modal
        title="Import Questions"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
      >
        <Upload.Dragger accept=".csv,.json" beforeUpload={() => false} onChange={handleBulkImport}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to upload</p>
          <p className="ant-upload-hint">Support CSV or JSON format</p>
        </Upload.Dragger>
        <Button style={{ marginTop: 16 }} icon={<DownloadOutlined />}>
          Download Template
        </Button>
      </Modal>
    </div>
  );
};

export default SkillQuestions;
