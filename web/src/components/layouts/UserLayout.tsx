import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { HeartFilled } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

const UserLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy đường dẫn hiện tại để Menu tự động active

  return (
    <Layout className="layout" style={{ minHeight: '100vh', background: '#f8fafc', width: '100%' }}>
      
      {/* ================= KHỐI CSS NỘI BỘ CHO HIỆU ỨNG HOVER ================= */}
      <style>{`
        /* Hiệu ứng nảy lên cho nút bấm */
        .header-btn { transition: all 0.3s ease !important; }
        .header-btn:hover { transform: translateY(-2px) !important; filter: brightness(1.1); }
        
        /* Hiệu ứng phóng to nhẹ cho Logo */
        .logo-hover { transition: all 0.3s ease; }
        .logo-hover:hover { transform: scale(1.05); }

        /* Ghi đè màu hover mặc định của Ant Design Menu sang màu Hồng đỏ của dự án */
        .custom-menu .ant-menu-item:hover::after, 
        .custom-menu .ant-menu-item-selected::after {
          border-bottom-color: #f43f5e !important;
        }
        .custom-menu .ant-menu-item:hover .ant-menu-title-content,
        .custom-menu .ant-menu-item-selected .ant-menu-title-content {
          color: #f43f5e !important;
        }
      `}</style>

      <Header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        width: '100%', 
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
        height: '80px',
        padding: 0, 
      }}>
        {/* Khung Container giới hạn độ rộng 1200px */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          width: '100%', 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px',
          height: '100%'
        }}>
          {/* Logo bên trái có hiệu ứng hover */}
          <div className="logo-hover" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/')}>
            <HeartFilled style={{ fontSize: '32px', color: '#f43f5e', marginRight: '12px' }} />
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#f43f5e' }}>Hope Center</span>
          </div>
          
          {/* Menu ở giữa */}
          <Menu
            className="custom-menu"
            mode="horizontal"
            selectedKeys={[location.pathname === '/' ? '/' : location.pathname]} 
            style={{ 
              flex: 1, 
              minWidth: 0, 
              justifyContent: 'center', 
              border: 'none', 
              fontSize: '18px', 
              fontWeight: 600,
              background: 'transparent',
              lineHeight: '80px' 
            }}
            items={[
              { key: '/', label: 'Trang chủ' },
              { key: '/about', label: 'Về chúng tôi' },
              { key: '/adoption', label: 'Nhận nuôi' },
              { key: '/donation', label: 'Quyên góp' },
            ]}
            onClick={({ key }) => navigate(key)}
          />

          {/* Cụm nút bấm bên phải có hiệu ứng nảy */}
          <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
            <Button className="header-btn" type="text" style={{ fontWeight: 700, color: '#64748b' }} onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
            <Button className="header-btn" type="primary" shape="round" style={{ background: '#f43f5e', border: 'none', fontWeight: 700, boxShadow: '0 4px 15px rgba(244, 63, 94, 0.3)' }} onClick={() => navigate('/register')}>
              Đăng ký
            </Button>
          </div>
        </div>
      </Header>

      <Content style={{ width: '100%', minHeight: 'calc(100vh - 80px - 100px)' }}>
        <Outlet />
      </Content>

      <Footer style={{ 
        textAlign: 'center', 
        background: '#0f172a', 
        color: '#adb5bd', 
        padding: '40px 0',
        width: '100%' 
      }}>
        © 2026 Trung tâm Bảo trợ Xã hội Hope Center. Mọi quyền được bảo lưu.
      </Footer>
    </Layout>
  );
};

export default UserLayout;