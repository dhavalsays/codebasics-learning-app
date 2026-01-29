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
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { badgesAPI } from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    setLoading(true);
    try {
      // Mock badges
      const mockBadges = [
        {
          id: '1',
          name: 'First Test',
          type: 'first_test',
          description: 'Complete your first test',
          xpReward: 50,
          earnedCount: 12500,
          icon: 'rocket',
        },
        {
          id: '2',
          name: 'Streak Starter',
          type: 'streak_7',
          description: 'Maintain a 7-day streak',
          xpReward: 100,
          earnedCount: 3200,
          icon: 'flame',
        },
        {
          id: '3',
          name: 'Streak Master',
          type: 'streak_30',
          description: 'Maintain a 30-day streak',
          xpReward: 500,
          earnedCount: 450,
          icon: 'fire',
        },
        {
          id: '4',
          name: 'Perfect Score',
          type: 'perfect_score',
          description: 'Score 100% on any test',
          xpReward: 200,
          earnedCount: 890,
          icon: 'star',
        },
        {
          id: '5',
          name: 'Python Master',
          type: 'skill_master',
          description: 'Score 90%+ on Python test',
          xpReward: 150,
          earnedCount: 1200,
          icon: 'code',
        },
        {
          id: '6',
          name: 'Top 10 Weekly',
          type: 'top_10_weekly',
          description: 'Reach top 10 on weekly leaderboard',
          xpReward: 250,
          earnedCount: 520,
          icon: 'trophy',
        },
      ];
      setBadges(mockBadges);
    } catch (error) {
      message.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = (badge = null) => {
    setEditingBadge(badge);
    if (badge) {
      form.setFieldsValue(badge);
    } else {
      form.resetFields();
      form.setFieldsValue({ xpReward: 50 });
    }
    setModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      if (editingBadge) {
        message.success('Badge updated successfully');
      } else {
        message.success('Badge created successfully');
      }
      setModalVisible(false);
      loadBadges();
    } catch (error) {
      message.error('Failed to save badge');
    }
  };

  const handleDelete = async (id) => {
    try {
      message.success('Badge deleted successfully');
      loadBadges();
    } catch (error) {
      message.error('Failed to delete badge');
    }
  };

  const getIconPreview = (type) => {
    const icons = {
      first_test: '🚀',
      streak_7: '🔥',
      streak_30: '💪',
      perfect_score: '⭐',
      skill_master: '🎓',
      top_10_weekly: '🏆',
      top_3_weekly: '🥇',
      share_result: '📤',
      career_explorer: '🧭',
    };
    return icons[type] || '🏅';
  };

  const columns = [
    {
      title: 'Badge',
      key: 'badge',
      render: (_, record) => (
        <Space>
          <span style={{ fontSize: 24 }}>{getIconPreview(record.type)}</span>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: 'XP Reward',
      dataIndex: 'xpReward',
      key: 'xpReward',
      align: 'center',
      render: (xp) => <Tag color="gold">{xp} XP</Tag>,
    },
    {
      title: 'Times Earned',
      dataIndex: 'earnedCount',
      key: 'earnedCount',
      align: 'center',
      sorter: (a, b) => a.earnedCount - b.earnedCount,
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
            title="Delete this badge?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const badgeTypes = [
    { value: 'first_test', label: 'First Test Completed' },
    { value: 'streak_7', label: '7-Day Streak' },
    { value: 'streak_30', label: '30-Day Streak' },
    { value: 'perfect_score', label: 'Perfect Score' },
    { value: 'skill_master', label: 'Skill Master' },
    { value: 'top_10_weekly', label: 'Top 10 Weekly' },
    { value: 'top_3_weekly', label: 'Top 3 Weekly' },
    { value: 'share_result', label: 'Share Result' },
    { value: 'career_explorer', label: 'Career Explorer' },
    { value: 'completionist', label: 'Completionist' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={4}>Badge Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleAddEdit()}
        >
          Create Badge
        </Button>
      </div>

      {/* Summary Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Badges"
              value={badges.length}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Earned"
              value={badges.reduce((sum, b) => sum + b.earnedCount, 0)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg XP Reward"
              value={Math.round(badges.reduce((sum, b) => sum + b.xpReward, 0) / badges.length || 0)}
              suffix="XP"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Most Popular"
              value={badges.sort((a, b) => b.earnedCount - a.earnedCount)[0]?.name || 'N/A'}
              valueStyle={{ fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={badges}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingBadge ? 'Edit Badge' : 'Create Badge'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="name"
            label="Badge Name"
            rules={[{ required: true, message: 'Please enter badge name' }]}
          >
            <Input placeholder="e.g., Python Master" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Badge Type"
            rules={[{ required: true, message: 'Please select badge type' }]}
          >
            <Select placeholder="Select type">
              {badgeTypes.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  {getIconPreview(type.value)} {type.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={2} placeholder="How to earn this badge" />
          </Form.Item>

          <Form.Item
            name="xpReward"
            label="XP Reward"
            rules={[{ required: true, message: 'Please enter XP reward' }]}
          >
            <InputNumber min={0} max={1000} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingBadge ? 'Update' : 'Create'} Badge
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Badges;
