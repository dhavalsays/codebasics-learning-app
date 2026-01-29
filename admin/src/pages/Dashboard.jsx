import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Table,
  Tag,
  Space,
  Progress,
} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  RiseOutlined,
  CompassOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { dashboardAPI } from '../services/api';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API calls
      setStats({
        totalUsers: 12500,
        activeUsers: 3200,
        careerTestsTaken: 8750,
        skillTestsTaken: 15200,
        avgCareerScore: 68,
        avgSkillScore: 72,
        newUsersToday: 45,
        testsToday: 320,
      });

      setRecentActivity([
        { id: 1, user: 'John Doe', action: 'Completed Career Test', score: 85, time: '5 mins ago' },
        { id: 2, user: 'Jane Smith', action: 'Completed Python Test', score: 92, time: '10 mins ago' },
        { id: 3, user: 'Bob Wilson', action: 'Registered', time: '15 mins ago' },
        { id: 4, user: 'Alice Brown', action: 'Completed SQL Test', score: 78, time: '20 mins ago' },
        { id: 5, user: 'Charlie Davis', action: 'Earned Badge', badge: 'First Test', time: '25 mins ago' },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activityColumns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <Space>
          <Text>{text}</Text>
          {record.score && <Tag color="blue">{record.score}%</Tag>}
          {record.badge && <Tag color="gold">{record.badge}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (time) => <Text type="secondary">{time}</Text>,
    },
  ];

  const roleDistribution = [
    { role: 'Data Analyst', percentage: 35, color: '#3B82F6' },
    { role: 'Data Scientist', percentage: 40, color: '#8B5CF6' },
    { role: 'Data Engineer', percentage: 25, color: '#10B981' },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Dashboard</Title>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="Total Users"
              value={stats?.totalUsers}
              prefix={<UserOutlined style={{ color: '#1E3A8A' }} />}
              suffix={
                <Text type="success" style={{ fontSize: 14 }}>
                  +{stats?.newUsersToday} today
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="Active Users"
              value={stats?.activeUsers}
              prefix={<RiseOutlined style={{ color: '#10B981' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="Career Tests"
              value={stats?.careerTestsTaken}
              prefix={<CompassOutlined style={{ color: '#3B82F6' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="Skill Tests"
              value={stats?.skillTestsTaken}
              prefix={<CodeOutlined style={{ color: '#8B5CF6' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Career Role Distribution */}
        <Col xs={24} lg={8}>
          <Card title="Career Test Results Distribution" loading={loading}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {roleDistribution.map((item) => (
                <div key={item.role}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text>{item.role}</Text>
                    <Text strong>{item.percentage}%</Text>
                  </div>
                  <Progress
                    percent={item.percentage}
                    showInfo={false}
                    strokeColor={item.color}
                    size="small"
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Average Scores */}
        <Col xs={24} lg={8}>
          <Card title="Average Scores" loading={loading}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Career Test Average</Text>
                  <Text strong style={{ color: '#3B82F6' }}>{stats?.avgCareerScore}%</Text>
                </div>
                <Progress
                  percent={stats?.avgCareerScore}
                  strokeColor="#3B82F6"
                  size="small"
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Skill Test Average</Text>
                  <Text strong style={{ color: '#8B5CF6' }}>{stats?.avgSkillScore}%</Text>
                </div>
                <Progress
                  percent={stats?.avgSkillScore}
                  strokeColor="#8B5CF6"
                  size="small"
                />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Today's Stats */}
        <Col xs={24} lg={8}>
          <Card title="Today's Activity" loading={loading}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="New Users"
                  value={stats?.newUsersToday}
                  valueStyle={{ color: '#10B981' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tests Taken"
                  value={stats?.testsToday}
                  valueStyle={{ color: '#3B82F6' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card title="Recent Activity" style={{ marginTop: 16 }} loading={loading}>
        <Table
          columns={activityColumns}
          dataSource={recentActivity}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Dashboard;
