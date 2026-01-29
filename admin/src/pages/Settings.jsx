import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Typography,
  Divider,
  Switch,
  Select,
  message,
  Row,
  Col,
  Tabs,
  Alert,
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [generalForm] = Form.useForm();
  const [xpForm] = Form.useForm();
  const [levelsForm] = Form.useForm();

  // Initialize with default values
  React.useEffect(() => {
    generalForm.setFieldsValue({
      appName: 'Codebasics Assess',
      supportEmail: 'support@codebasics.io',
      maintenanceMode: false,
      allowRegistration: true,
    });

    xpForm.setFieldsValue({
      careerTestXp: 100,
      skillTestXpPerQuestion: 10,
      practiceCorrectXp: 5,
      streakBonusXp: 20,
      dailyLoginXp: 10,
    });

    levelsForm.setFieldsValue({
      level1: 0,
      level2: 500,
      level3: 1500,
      level4: 3500,
      level5: 7000,
      level6: 12000,
    });
  }, []);

  const handleSaveGeneral = async (values) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('General settings saved successfully');
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveXP = async (values) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('XP settings saved successfully');
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLevels = async (values) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Level settings saved successfully');
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleResetLeaderboard = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Weekly leaderboard has been reset');
    } catch (error) {
      message.error('Failed to reset leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'general',
      label: 'General',
      children: (
        <Card>
          <Form
            form={generalForm}
            layout="vertical"
            onFinish={handleSaveGeneral}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="appName"
                  label="Application Name"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="supportEmail"
                  label="Support Email"
                  rules={[{ required: true, type: 'email' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="maintenanceMode"
                  label="Maintenance Mode"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Text type="secondary">
                  When enabled, users will see a maintenance message
                </Text>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="allowRegistration"
                  label="Allow New Registrations"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Text type="secondary">
                  Disable to prevent new user sign-ups
                </Text>
              </Col>
            </Row>

            <Divider />

            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Save General Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'xp',
      label: 'XP Configuration',
      children: (
        <Card>
          <Alert
            message="XP Settings"
            description="Configure how much XP users earn for different activities. Changes affect all future XP awards."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form
            form={xpForm}
            layout="vertical"
            onFinish={handleSaveXP}
          >
            <Title level={5}>Test Completion</Title>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="careerTestXp"
                  label="Career Test Completion XP"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={0} max={500} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="skillTestXpPerQuestion"
                  label="Skill Test XP (per correct answer)"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={0} max={50} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>Practice & Daily Activities</Title>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="practiceCorrectXp"
                  label="Practice Correct Answer XP"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={0} max={20} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="streakBonusXp"
                  label="Daily Streak Bonus XP"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={0} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="dailyLoginXp"
                  label="Daily Login XP"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={0} max={50} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Save XP Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'levels',
      label: 'Level Thresholds',
      children: (
        <Card>
          <Alert
            message="Level Configuration"
            description="Define XP thresholds for each level. Users automatically level up when they reach the required XP."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form
            form={levelsForm}
            layout="vertical"
            onFinish={handleSaveLevels}
          >
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item name="level1" label="Level 1 (Beginner)">
                  <InputNumber min={0} disabled style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="level2" label="Level 2 (Explorer)">
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="level3" label="Level 3 (Learner)">
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item name="level4" label="Level 4 (Achiever)">
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="level5" label="Level 5 (Expert)">
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="level6" label="Level 6 (Master)">
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Save Level Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'leaderboard',
      label: 'Leaderboard',
      children: (
        <Card>
          <Title level={5}>Weekly Leaderboard Management</Title>
          <Paragraph type="secondary">
            The weekly leaderboard automatically resets every Monday at midnight UTC.
            You can manually trigger a reset if needed.
          </Paragraph>

          <Alert
            message="Warning"
            description="Resetting the leaderboard will clear all weekly XP data. This action cannot be undone."
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Button
            danger
            icon={<ReloadOutlined />}
            onClick={handleResetLeaderboard}
            loading={loading}
          >
            Reset Weekly Leaderboard
          </Button>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Settings</Title>
      <Tabs items={tabItems} />
    </div>
  );
};

export default Settings;
