import React from 'react';
import { Typography, Row, Col, Card } from 'antd';
import { 
  AimOutlined, 
  EyeOutlined, 
  HeartFilled, 
  TeamOutlined, 
  SafetyCertificateOutlined 
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const AboutPage: React.FC = () => {
  return (
    <div style={{ background: '#f8fafc', padding: '60px 10%', minHeight: 'calc(100vh - 80px)' }}>
      
      {/* ================= HERO SECTION ================= */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <Title level={2} style={{ fontSize: '36px', color: '#f43f5e', marginBottom: '16px' }}>
          Về Hope Center
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#64748b', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
          Hơn 15 năm hình thành và phát triển, Trung tâm Bảo trợ Xã hội Hope Center đã trở thành mái nhà chung của hàng ngàn trẻ em mồ côi, trẻ em cơ nhỡ và mang trong mình những hoàn cảnh đặc biệt.
        </Paragraph>
      </div>

      {/* ================= SỨ MỆNH & TẦM NHÌN ================= */}
      <Row gutter={[40, 40]} style={{ marginBottom: '60px' }}>
        <Col xs={24} md={12}>
          <Card 
            variant="none" 
            style={{ 
              padding: '20px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
              height: '100%' 
            }}
          >
            <AimOutlined style={{ fontSize: '40px', color: '#0ea5e9', marginBottom: '20px' }} />
            <Title level={3} style={{ fontSize: '24px', marginBottom: '16px', color: '#0f172a' }}>
              Sứ Mệnh
            </Title>
            <Paragraph style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.7 }}>
              Bảo vệ, chăm sóc và nuôi dưỡng trẻ em có hoàn cảnh đặc biệt. Chúng tôi cam kết mang đến cho các em một môi trường an toàn, cung cấp đầy đủ dinh dưỡng, y tế và nền tảng giáo dục vững chắc để các em tự tin hòa nhập cộng đồng khi trưởng thành.
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            variant="none" 
            style={{ 
              padding: '20px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
              height: '100%' 
            }}
          >
            <EyeOutlined style={{ fontSize: '40px', color: '#0ea5e9', marginBottom: '20px' }} />
            <Title level={3} style={{ fontSize: '24px', marginBottom: '16px', color: '#0f172a' }}>
              Tầm Nhìn
            </Title>
            <Paragraph style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.7 }}>
              Trở thành mô hình trung tâm bảo trợ xã hội kiểu mẫu tại Đà Nẵng và Việt Nam, tiên phong trong việc ứng dụng các phương pháp giáo dục, tâm lý học hiện đại vào việc chữa lành tổn thương và phát triển toàn diện cho trẻ em mồ côi.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* ================= GIÁ TRỊ CỐT LÕI ================= */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f172a, #1e293b)', 
        padding: '60px 40px', 
        borderRadius: '20px', 
        color: 'white', 
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <Title level={2} style={{ color: 'white', marginBottom: '50px', fontSize: '32px' }}>
          Giá Trị Cốt Lõi
        </Title>
        <Row gutter={[30, 40]}>
          <Col xs={24} md={8}>
            <HeartFilled style={{ fontSize: '40px', color: '#f43f5e', marginBottom: '20px' }} />
            <Title level={4} style={{ color: 'white', fontSize: '20px', marginBottom: '12px' }}>
              Tình Yêu Thương
            </Title>
            <Text style={{ color: '#94a3b8', fontSize: '15px' }}>
              Mọi hành động đều xuất phát từ trái tim và sự bao dung.
            </Text>
          </Col>
          <Col xs={24} md={8}>
            <TeamOutlined style={{ fontSize: '40px', color: '#f43f5e', marginBottom: '20px' }} />
            <Title level={4} style={{ color: 'white', fontSize: '20px', marginBottom: '12px' }}>
              Bình Đẳng
            </Title>
            <Text style={{ color: '#94a3b8', fontSize: '15px' }}>
              Mọi trẻ em đều được đối xử công bằng và tôn trọng.
            </Text>
          </Col>
          <Col xs={24} md={8}>
            <SafetyCertificateOutlined style={{ fontSize: '40px', color: '#f43f5e', marginBottom: '20px' }} />
            <Title level={4} style={{ color: 'white', fontSize: '20px', marginBottom: '12px' }}>
              Minh Bạch
            </Title>
            <Text style={{ color: '#94a3b8', fontSize: '15px' }}>
              Rõ ràng trong mọi khoản tài trợ và hoạt động vận hành.
            </Text>
          </Col>
        </Row>
      </div>

    </div>
  );
};

export default AboutPage;