import React, { useState, useEffect } from 'react';
import { Card, Typography, Descriptions, Avatar, Tag, Space, Button, message, Skeleton, Divider, Row, Col } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  SafetyCertificateOutlined, 
  CalendarOutlined,
  EditOutlined,
  EnvironmentOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import apiClient from '../../services/apiClient';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/api/Users/me');
        setUser(response.data);
      } catch (error) {
        message.error('Không thể tải thông tin hồ sơ cá nhân');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '0px' }}>
        <Card style={{ borderRadius: 16 }}>
          <Skeleton avatar active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card 
        styles={{ body: { padding: 0 } }}
        style={{ 
          borderRadius: 16, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: 'none'
        }}
      >
        <div style={{ 
          height: 160, 
          background: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
          position: 'relative'
        }}>
          <div style={{ 
            position: 'absolute', 
            bottom: -50, 
            left: 32,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 20
          }}>
            <Avatar 
              size={120} 
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: '#fff', 
                color: '#f43f5e',
                border: '4px solid #fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }} 
            />
          </div>
        </div>
        
        <div style={{ padding: '60px 32px 32px 32px' }}>
          <Row justify="space-between" align="top">
            <Col>
              <Title level={2} style={{ margin: 0, color: '#1e293b' }}>{user?.fullName || 'Người dùng'}</Title>
              <Space direction="vertical" size={0}>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  {user?.position || (user?.userType === 'Employee' ? 'Nhân viên hệ thống' : 'Người nhận nuôi')}
                </Text>
                <Space split={<Divider type="vertical" />} style={{ marginTop: 4 }}>
                   <Text type="secondary"><IdcardOutlined /> {user?.userName}</Text>
                   <Tag color={user?.isActive ? 'success' : 'error'} style={{ borderRadius: 10 }}>
                      {user?.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                   </Tag>
                </Space>
              </Space>
            </Col>
            <Col>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                style={{ 
                  borderRadius: 8, 
                  height: 40, 
                  background: '#f43f5e', 
                  borderColor: '#f43f5e',
                  boxShadow: '0 2px 8px rgba(244, 63, 94, 0.3)'
                }}
                onClick={() => message.info('Tính năng chỉnh sửa đang được phát triển')}
              >
                Chỉnh sửa hồ sơ
              </Button>
            </Col>
          </Row>

          <Divider style={{ margin: '32px 0' }} />

          <Descriptions 
            title={<Title level={4} style={{ margin: 0 }}>Thông tin chi tiết</Title>}
            bordered 
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            labelStyle={{ fontWeight: 600, width: 180, background: '#f8fafc' }}
            contentStyle={{ background: '#fff' }}
          >
            <Descriptions.Item label={<Space><MailOutlined /> Email</Space>}>
              {user?.email}
            </Descriptions.Item>
            <Descriptions.Item label={<Space><PhoneOutlined /> Số điện thoại</Space>}>
              {user?.phone || <Text type="secondary" italic>Chưa cập nhật</Text>}
            </Descriptions.Item>
            <Descriptions.Item label={<Space><SafetyCertificateOutlined /> Quyền hạn</Space>}>
              <Space size={[0, 4]} wrap>
                {user?.roles && user.roles.length > 0 ? (
                  user.roles.map((role: string) => (
                    <Tag color="blue" key={role} style={{ borderRadius: 4 }}>{role}</Tag>
                  ))
                ) : (
                  <Tag color="default">Member</Tag>
                )}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={<Space><CalendarOutlined /> Loại tài khoản</Space>}>
               <Tag color={user?.userType === 'Employee' ? 'gold' : 'cyan'} style={{ fontWeight: 500 }}>
                  {user?.userType === 'Employee' ? 'NHÂN VIÊN' : 'NGƯỜI NHẬN NUÔI'}
               </Tag>
            </Descriptions.Item>
            {user?.address && (
              <Descriptions.Item label={<Space><EnvironmentOutlined /> Địa chỉ</Space>} span={2}>
                {user.address}
              </Descriptions.Item>
            )}
          </Descriptions>

          <div style={{ marginTop: 40, background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px dashed #cbd5e1' }}>
            <Title level={5} style={{ marginTop: 0 }}>Bảo mật tài khoản</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Bạn nên thường xuyên thay đổi mật khẩu để đảm bảo an toàn cho tài khoản của mình.
            </Text>
            <Button 
              variant="outlined" 
              style={{ borderRadius: 8 }}
              onClick={() => message.info('Tính năng đổi mật khẩu đang được phát triển')}
            >
              Đổi mật khẩu
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;