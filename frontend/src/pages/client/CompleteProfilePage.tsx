import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, message, Select } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  HomeOutlined, 
  IdcardOutlined,
  HeartFilled,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../services/apiClient';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CompleteProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const accountId = searchParams.get('accountId');

  useEffect(() => {
    if (!accountId) {
      message.error('Thiếu mã tài khoản để cập nhật hồ sơ!');
      navigate('/login');
    }
  }, [accountId, navigate]);

  const handleComplete = async (values: any) => {
    if (!accountId) {
      message.error('Không tìm thấy tài khoản để cập nhật!');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/Users/complete-profile', {
        accountId: accountId,
        fullName: values.fullName,
        phone: values.phone,
        idCard: values.idCard,
        maritalStatus: values.maritalStatus,
        address: values.address,
        occupation: values.occupation,
        incomeScope: values.incomeScope
      });

      message.success('Cập nhật hồ sơ cá nhân thành công! Giờ bạn có thể đăng nhập.');
      navigate('/login');
    } catch (error: any) {
      console.error('Complete Profile Error:', error);
      const errMsg = error.response?.data || 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng kiểm tra lại!';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f8fafc',
      padding: '40px 20px'
    }}>
      <div style={{ position: 'absolute', top: '30px', left: '40px' }}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/login')} style={{ color: '#64748b', fontSize: '16px', fontWeight: 600 }}>
          Quay lại Đăng nhập
        </Button>
      </div>

      <Card 
        variant="borderless" 
        style={{ 
          width: '100%', 
          maxWidth: '650px', 
          borderRadius: '24px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          padding: '20px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <HeartFilled style={{ fontSize: '40px', color: '#f43f5e', marginBottom: '16px' }} />
          <Title level={2} style={{ color: '#f43f5e', margin: 0 }}>
            Hoàn Tất Hồ Sơ Người Nhận Nuôi
          </Title>
          <Paragraph style={{ color: '#64748b', marginTop: '8px' }}>
            Vui lòng điền đầy đủ các thông tin bắt buộc bên dưới để trung tâm xác minh và kích hoạt tài khoản của bạn.
          </Paragraph>
        </div>

        <Form layout="vertical" onFinish={handleComplete} size="large">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item 
              name="fullName" 
              label={<Text strong>Họ và Tên đầy đủ *</Text>} 
              rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
              style={{ gridColumn: 'span 2' }}
            >
              <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Nhập đầy đủ họ tên theo CCCD" style={{ borderRadius: '8px' }} />
            </Form.Item>

            <Form.Item 
              name="idCard" 
              label={<Text strong>Số CCCD *</Text>} 
              rules={[
                { required: true, message: 'Vui lòng nhập số căn cước công dân!' },
                { pattern: /^[0-9]{12}$/, message: 'Số CCCD phải gồm đúng 12 số!' }
              ]}
            >
              <Input prefix={<IdcardOutlined style={{ color: '#94a3b8' }} />} placeholder="Nhập 12 số CCCD" style={{ borderRadius: '8px' }} />
            </Form.Item>

            <Form.Item 
              name="phone" 
              label={<Text strong>Số điện thoại liên hệ *</Text>} 
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
              <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="Ví dụ: 0988xxxxxx" style={{ borderRadius: '8px' }} />
            </Form.Item>

            <Form.Item 
              name="maritalStatus" 
              label={<Text strong>Tình trạng hôn nhân *</Text>} 
              rules={[{ required: true, message: 'Vui lòng chọn tình trạng hôn nhân!' }]}
            >
              <Select placeholder="Chọn tình trạng hôn nhân" style={{ borderRadius: '8px' }}>
                <Option value="Độc thân">Độc thân</Option>
                <Option value="Đã kết hôn">Đã kết hôn</Option>
                <Option value="Ly hôn">Ly hôn / Góa</Option>
              </Select>
            </Form.Item>

            <Form.Item 
              name="incomeScope" 
              label={<Text strong>Mức thu nhập bình quân hằng tháng *</Text>} 
              rules={[{ required: true, message: 'Vui lòng chọn phạm vi thu nhập!' }]}
            >
              <Select placeholder="Chọn phạm vi thu nhập" style={{ borderRadius: '8px' }}>
                <Option value="Dưới 15 triệu VNĐ">Dưới 15 triệu VNĐ</Option>
                <Option value="Từ 15 đến 30 triệu VNĐ">Từ 15 - 30 triệu VNĐ</Option>
                <Option value="Từ 30 đến 50 triệu VNĐ">Từ 30 - 50 triệu VNĐ</Option>
                <Option value="Trên 50 triệu VNĐ">Trên 50 triệu VNĐ</Option>
              </Select>
            </Form.Item>

            <Form.Item 
              name="occupation" 
              label={<Text strong>Nghề nghiệp chính *</Text>} 
              rules={[{ required: true, message: 'Vui lòng điền nghề nghiệp!' }]}
              style={{ gridColumn: 'span 2' }}
            >
              <Input placeholder="Ví dụ: Công chức, Giáo viên, Lập trình viên..." style={{ borderRadius: '8px' }} />
            </Form.Item>

            <Form.Item 
              name="address" 
              label={<Text strong>Địa chỉ cư trú thường liên hệ *</Text>} 
              rules={[{ required: true, message: 'Vui lòng điền địa chỉ thường trú!' }]}
              style={{ gridColumn: 'span 2' }}
            >
              <Input.TextArea placeholder="Địa chỉ cụ thể nơi sinh sống hiện tại" autoSize={{ minRows: 2, maxRows: 4 }} style={{ borderRadius: '8px' }} />
            </Form.Item>
          </div>

          <Form.Item style={{ marginTop: '20px' }}>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ background: '#f43f5e', height: '48px', borderRadius: '8px', fontWeight: 700, fontSize: '16px' }}>
              Xác Nhận &amp; Kích Hoạt Tài Khoản
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CompleteProfilePage;
