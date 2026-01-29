import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Card,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Typography,
  Tag,
  Popconfirm,
  message,
  Collapse,
  Row,
  Col,
  Slider,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { careerQuestionsAPI } from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

const CareerQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [weightsModalVisible, setWeightsModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form] = Form.useForm();
  const [weightsForm] = Form.useForm();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockQuestions = [
        {
          id: '1',
          orderNumber: 1,
          questionText: 'How comfortable are you with coding and programming languages like Python?',
          category: 'Technical Skills',
          options: [
            { id: '1a', score: 1, text: 'Not comfortable at all' },
            { id: '1b', score: 2, text: 'Basic familiarity' },
            { id: '1c', score: 3, text: 'Comfortable with basics' },
            { id: '1d', score: 4, text: 'Proficient' },
            { id: '1e', score: 5, text: 'Expert level' },
          ],
          weights: { ds: 0.60, de: 0.35, da: 0.05 },
        },
        {
          id: '2',
          orderNumber: 2,
          questionText: 'How would you rate your mathematics and statistics background?',
          category: 'Technical Skills',
          options: [
            { id: '2a', score: 1, text: 'Limited exposure' },
            { id: '2b', score: 2, text: 'Basic understanding' },
            { id: '2c', score: 3, text: 'Intermediate' },
            { id: '2d', score: 4, text: 'Advanced' },
            { id: '2e', score: 5, text: 'Expert' },
          ],
          weights: { ds: 0.75, de: 0.10, da: 0.15 },
        },
      ];
      setQuestions(mockQuestions);
    } catch (error) {
      message.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = (question = null) => {
    setEditingQuestion(question);
    if (question) {
      form.setFieldsValue({
        questionText: question.questionText,
        category: question.category,
        options: question.options,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleEditWeights = (question) => {
    setEditingQuestion(question);
    weightsForm.setFieldsValue({
      ds: question.weights.ds * 100,
      de: question.weights.de * 100,
      da: question.weights.da * 100,
    });
    setWeightsModalVisible(true);
  };

  const handleSaveQuestion = async (values) => {
    try {
      if (editingQuestion) {
        // Update existing question
        message.success('Question updated successfully');
      } else {
        // Create new question
        message.success('Question created successfully');
      }
      setModalVisible(false);
      loadQuestions();
    } catch (error) {
      message.error('Failed to save question');
    }
  };

  const handleSaveWeights = async (values) => {
    const total = values.ds + values.de + values.da;
    if (Math.abs(total - 100) > 0.1) {
      message.error('Weights must sum to 100%');
      return;
    }

    try {
      // Save weights via API
      message.success('Weights updated successfully');
      setWeightsModalVisible(false);
      loadQuestions();
    } catch (error) {
      message.error('Failed to update weights');
    }
  };

  const handleDelete = async (id) => {
    try {
      // Delete via API
      message.success('Question deleted successfully');
      loadQuestions();
    } catch (error) {
      message.error('Failed to delete question');
    }
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 60,
    },
    {
      title: 'Question',
      dataIndex: 'questionText',
      key: 'questionText',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: 'Weights (DS/DE/DA)',
      key: 'weights',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tag color="purple">{(record.weights.ds * 100).toFixed(0)}%</Tag>
          <Tag color="green">{(record.weights.de * 100).toFixed(0)}%</Tag>
          <Tag color="blue">{(record.weights.da * 100).toFixed(0)}%</Tag>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => handleEditWeights(record)}
            title="Edit Weights"
          />
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
        <Title level={4}>Career Test Questions</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleAddEdit()}
        >
          Add Question
        </Button>
      </div>

      <Alert
        message="Weight Configuration"
        description="Each question has weights for Data Scientist (DS), Data Engineer (DE), and Data Analyst (DA). Weights must sum to 100% for each question."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card>
        <Table
          columns={columns}
          dataSource={questions}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Question Edit Modal */}
      <Modal
        title={editingQuestion ? 'Edit Question' : 'Add Question'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveQuestion}
        >
          <Form.Item
            name="questionText"
            label="Question Text"
            rules={[{ required: true, message: 'Please enter the question' }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please enter a category' }]}
          >
            <Input />
          </Form.Item>

          <Title level={5}>Answer Options (1-5 Scale)</Title>
          {[1, 2, 3, 4, 5].map((score) => (
            <Form.Item
              key={score}
              name={['options', score - 1, 'text']}
              label={`Option ${score} (Score: ${score})`}
              rules={[{ required: true, message: 'Please enter option text' }]}
            >
              <Input placeholder={`Enter text for score ${score}`} />
            </Form.Item>
          ))}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Save Question
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Weights Edit Modal */}
      <Modal
        title="Edit Question Weights"
        open={weightsModalVisible}
        onCancel={() => setWeightsModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={weightsForm}
          layout="vertical"
          onFinish={handleSaveWeights}
        >
          <Alert
            message="Role Weights"
            description="Configure how much this question contributes to each role's score. Total must equal 100%."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form.Item
            name="ds"
            label={<Text strong style={{ color: '#8B5CF6' }}>Data Scientist Weight (%)</Text>}
          >
            <Slider min={0} max={100} marks={{ 0: '0%', 50: '50%', 100: '100%' }} />
          </Form.Item>

          <Form.Item
            name="de"
            label={<Text strong style={{ color: '#10B981' }}>Data Engineer Weight (%)</Text>}
          >
            <Slider min={0} max={100} marks={{ 0: '0%', 50: '50%', 100: '100%' }} />
          </Form.Item>

          <Form.Item
            name="da"
            label={<Text strong style={{ color: '#3B82F6' }}>Data Analyst Weight (%)</Text>}
          >
            <Slider min={0} max={100} marks={{ 0: '0%', 50: '50%', 100: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Save Weights
              </Button>
              <Button onClick={() => setWeightsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CareerQuestions;
