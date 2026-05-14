import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HeartFilled,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../services/apiClient';

const { Title, Text, Paragraph } = Typography;

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Đồng bộ trạng thái form với URL (nếu user gõ thẳng /login hoặc /register)
  useEffect(() => {
    if (location.pathname.includes('register')) {
      setMode('register');
    } else {
      setMode('login');
    }
  }, [location]);

  const handleLogin = async (values: any) => {
    setLoading(true);
    console.log('--- LOGIN ATTEMPT ---');
    console.log('Data being sent:', { email: values.username, password: values.password });
    try {
      // Sửa: Đường dẫn Login trong Identity API mặc định được map vào /api/Users/login 
      // do cơ chế MapEndpoints của Backend
      const response = await apiClient.post('/api/Users/login', {
        email: values.username,
        password: values.password
      });
      
      console.log('Login Success Response:', response.data);
      const { accessToken } = response.data;
      localStorage.setItem('token', accessToken);
      
      // Fetch user info to determine role-based redirection
      const userResponse = await apiClient.get('/api/Users/me');
      const user = userResponse.data;

      message.success(`Đăng nhập thành công! Chào mừng ${user.fullName} quay lại.`);
      
      if (user.userType === 'Employee') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('--- LOGIN ERROR ---');
      console.error('Error status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      
      const errorMsg = error.response?.data?.detail || error.response?.data?.title || 'Sai tài khoản hoặc mật khẩu. Vui lòng thử lại!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    setLoading(true);
    console.log('--- REGISTER ATTEMPT ---');
    console.log('Data being sent:', {
      fullName: values.fullName,
      email: values.email,
      phoneNumber: values.phone,
      password: values.password
    });
    try {
      const response = await apiClient.post('/api/Users/register-custom', {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phone,
        password: values.password
      });

      console.log('Register Success Response:', response.data);
      message.success('Đăng ký tài khoản thành công! Hãy đăng nhập để tiếp tục.');
      setMode('login');
      navigate('/login');
    } catch (error: any) {
      console.error('--- REGISTER ERROR ---');
      console.error('Error status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      message.error('Đăng ký không thành công. Vui lòng kiểm tra lại thông tin!');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    navigate(`/${newMode}`); // Thay đổi URL cho chuẩn SEO và UX
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{ position: 'absolute', top: '30px', left: '40px' }}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ color: '#64748b', fontSize: '16px', fontWeight: 600 }}>
          Quay lại Trang chủ
        </Button>
      </div>

      <Card 
        variant="none" 
        style={{ 
          width: '100%', 
          maxWidth: '500px', 
          borderRadius: '20px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          padding: '10px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <HeartFilled style={{ fontSize: '40px', color: '#f43f5e', marginBottom: '16px' }} />
          <Title level={2} style={{ color: '#f43f5e', margin: 0 }}>
            {mode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
          </Title>
          <Paragraph style={{ color: '#64748b', marginTop: '8px' }}>
            {mode === 'login' 
              ? 'Chào mừng bạn quay trở lại với Hope Center' 
              : 'Tạo tài khoản để theo dõi hồ sơ và lịch sử tài trợ'
            }
          </Paragraph>
        </div>

        {mode === 'login' ? (
          /* ================= FORM ĐĂNG NHẬP ================= */
          <Form layout="vertical" onFinish={handleLogin} size="large">
            <Form.Item 
              name="username" 
              label={<Text strong>Tên đăng nhập / Email</Text>} 
              rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
            >
              <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Nhập username hoặc email" style={{ borderRadius: '8px' }} />
            </Form.Item>

            <Form.Item 
              name="password" 
              label={<Text strong>Mật khẩu</Text>} 
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="••••••••" style={{ borderRadius: '8px' }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block style={{ background: '#f43f5e', height: '45px', borderRadius: '8px', fontWeight: 700, fontSize: '16px', marginTop: '10px' }}>
                Đăng Nhập
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', color: '#64748b' }}>
              Chưa có tài khoản? <a onClick={() => toggleMode('register')} style={{ color: '#0ea5e9', fontWeight: 700 }}>Đăng ký ngay</a>
            </div>
          </Form>
        ) : (
          /* ================= FORM ĐĂNG KÝ ================= */
          <Form layout="vertical" onFinish={handleRegister} size="large">
            <Form.Item 
              name="fullName" 
              label={<Text strong>Họ và Tên</Text>} 
              rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
            >
              <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Nhập họ tên đầy đủ" style={{ borderRadius: '8px' }} />
            </Form.Item>

            <Form.Item 
              name="email" 
              label={<Text strong>Email</Text>} 
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="example@gmail.com" style={{ borderRadius: '8px' }} />
            </Form.Item>

            <Form.Item 
              name="phone" 
              label={<Text strong>Số điện thoại</Text>} 
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
              <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="09xxxxxxxxx" style={{ borderRadius: '8px' }} />
            </Form.Item>

            <Form.Item 
              name="password" 
              label={<Text strong>Mật khẩu</Text>} 
              rules={[{ required: true, message: 'Vui lòng tạo mật khẩu!' }]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Tạo mật khẩu an toàn" style={{ borderRadius: '8px' }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block style={{ background: '#f43f5e', height: '45px', borderRadius: '8px', fontWeight: 700, fontSize: '16px', marginTop: '10px' }}>
                Tạo Tài Khoản
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', color: '#64748b' }}>
              Đã có tài khoản? <a onClick={() => toggleMode('login')} style={{ color: '#0ea5e9', fontWeight: 700 }}>Đăng nhập</a>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default AuthPage;