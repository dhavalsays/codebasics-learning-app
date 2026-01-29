import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Card,
  Modal,
  Form,
  Input,
  Space,
  Typography,
  Tag,
  Avatar,
  message,
  Statistic,
  Row,
  Col,
  Descriptions,
  Tabs,
  List,
} from 'antd';
import {
  UserOutlined,
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { usersAPI } from '../services/api';

const { Title, Text } = Typography;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Mock users
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: '2024-01-15',
          totalXp: 2500,
          level: 3,
          testsCompleted: 15,
          currentStreak: 7,
          isActive: true,
          badges: ['First Test', 'Streak Master'],
          careerResult: { bestFit: 'ds', score: 85 },
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          createdAt: '2024-01-20',
          totalXp: 5200,
          level: 5,
          testsCompleted: 32,
          currentStreak: 21,
          isActive: true,
          badges: ['First Test', 'Python Master', 'Top 10'],
          careerResult: { bestFit: 'da', score: 78 },
        },
        {
          id: '3',
          name: 'Bob Wilson',
          email: 'bob@example.com',
          createdAt: '2024-02-01',
          totalXp: 800,
          level: 2,
          testsCompleted: 5,
          currentStreak: 0,
          isActive: false,
          badges: ['First Test'],
          careerResult: null,
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setDetailsModalVisible(true);
  };

  const handleToggleStatus = async (userId, activate) => {
    try {
      message.success(`User ${activate ? 'activated' : 'deactivated'}`);
      loadUsers();
    } catch (error) {
      message.error('Failed to update user status');
    }
  };

  const getRoleColor = (role) => {
    const colors = { da: 'blue', ds: 'purple', de: 'green' };
    return colors[role] || 'default';
  };

  const getRoleName = (role) => {
    const names = { da: 'Data Analyst', ds: 'Data Scientist', de: 'Data Engineer' };
    return names[role] || 'N/A';
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1E3A8A' }}>
            {record.name[0]}
          </Avatar>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      align: 'center',
      sorter: (a, b) => a.level - b.level,
      render: (level) => <Tag color="blue">Level {level}</Tag>,
    },
    {
      title: 'XP',
      dataIndex: 'totalXp',
      key: 'totalXp',
      align: 'center',
      sorter: (a, b) => a.totalXp - b.totalXp,
    },
    {
      title: 'Tests',
      dataIndex: 'testsCompleted',
      key: 'testsCompleted',
      align: 'center',
    },
    {
      title: 'Streak',
      dataIndex: 'currentStreak',
      key: 'currentStreak',
      align: 'center',
      render: (streak) => (
        <Space>
          <span>🔥</span>
          <span>{streak}</span>
        </Space>
      ),
    },
    {
      title: 'Career Fit',
      key: 'careerResult',
      render: (_, record) =>
        record.careerResult ? (
          <Tag color={getRoleColor(record.careerResult.bestFit)}>
            {getRoleName(record.careerResult.bestFit)}
          </Tag>
        ) : (
          <Text type="secondary">Not taken</Text>
        ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          />
          {record.isActive ? (
            <Button
              type="text"
              danger
              icon={<StopOutlined />}
              onClick={() => handleToggleStatus(record.id, false)}
              title="Deactivate"
            />
          ) : (
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              style={{ color: '#10B981' }}
              onClick={() => handleToggleStatus(record.id, true)}
              title="Activate"
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={4}>User Management</Title>
        <Input
          placeholder="Search users..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Summary Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={users.length}
              valueStyle={{ color: '#1E3A8A' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={users.filter((u) => u.isActive).length}
              valueStyle={{ color: '#10B981' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Level"
              value={(users.reduce((sum, u) => sum + u.level, 0) / users.length || 0).toFixed(1)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total XP Earned"
              value={users.reduce((sum, u) => sum + u.totalXp, 0)}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* User Details Modal */}
      <Modal
        title="User Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedUser && (
          <Tabs
            items={[
              {
                key: 'profile',
                label: 'Profile',
                children: (
                  <Descriptions column={2}>
                    <Descriptions.Item label="Name">{selectedUser.name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
                    <Descriptions.Item label="Joined">{selectedUser.createdAt}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={selectedUser.isActive ? 'green' : 'red'}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Level">Level {selectedUser.level}</Descriptions.Item>
                    <Descriptions.Item label="Total XP">{selectedUser.totalXp}</Descriptions.Item>
                    <Descriptions.Item label="Current Streak">
                      {selectedUser.currentStreak} days
                    </Descriptions.Item>
                    <Descriptions.Item label="Tests Completed">
                      {selectedUser.testsCompleted}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'badges',
                label: 'Badges',
                children: (
                  <List
                    dataSource={selectedUser.badges}
                    renderItem={(badge) => (
                      <List.Item>
                        <Tag color="gold">🏆 {badge}</Tag>
                      </List.Item>
                    )}
                  />
                ),
              },
              {
                key: 'career',
                label: 'Career Result',
                children: selectedUser.careerResult ? (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <Title level={4}>
                      Best Fit: {getRoleName(selectedUser.careerResult.bestFit)}
                    </Title>
                    <Tag color={getRoleColor(selectedUser.careerResult.bestFit)} style={{ fontSize: 16, padding: '4px 12px' }}>
                      Score: {selectedUser.careerResult.score}%
                    </Tag>
                  </div>
                ) : (
                  <Text type="secondary">No career test taken yet</Text>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default Users;
