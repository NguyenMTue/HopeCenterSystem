import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, message } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import {
  HeartOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  WarningOutlined,
  GiftOutlined,
  AppstoreAddOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CalendarOutlined,
  DashboardOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiClient.get('/api/Users/me');
        setUserInfo(response.data);
        
        // Chuyển hướng nếu vào trang gốc dashboard
        if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
          if (response.data.userType === 'Adopter') {
            navigate('/adopter-portal', { replace: true });
          } else {
            navigate('/dashboard/children', { replace: true });
          }
        }
      } catch (error) {
        console.error('Failed to fetch user info', error);
      }
    };
    fetchUserInfo();
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    message.success('Đăng xuất thành công');
    navigate('/login');
  };

  const getMenuItems = () => {
    if (!userInfo) return [];

    const roles = userInfo.roles || [];
    const position = (userInfo.position || '').toLowerCase();

    // 1. Administrator Workspace
    if (roles.includes('Administrator')) {
      return [
        {
          key: 'group-admin',
          type: 'group' as const,
          label: 'HỆ THỐNG (ADMIN)',
          children: [
            { key: '/dashboard/employees', icon: <TeamOutlined />, label: 'Quản lý Nhân viên' },
            { key: '/dashboard/roles', icon: <SafetyCertificateOutlined />, label: 'Phân quyền (Roles)' },
            { key: '/dashboard/backup', icon: <DatabaseOutlined />, label: 'Sao lưu Dữ liệu' },
            { key: '/dashboard/profile', icon: <UserOutlined />, label: 'Hồ sơ cá nhân' },
          ],
        }
      ];
    }

    // 2. Director Workspace
    if (roles.includes('Director')) {
      return [
        {
          key: 'group-director',
          type: 'group' as const,
          label: 'BAN GIÁM ĐỐC',
          children: [
            { key: '/dashboard/children', icon: <HeartOutlined />, label: 'Quản lý Trẻ em' },
            { key: '/dashboard/adoptions', icon: <FileTextOutlined />, label: 'Thẩm định Nhận nuôi' },
            { key: '/dashboard/care-plans', icon: <MedicineBoxOutlined />, label: 'Kế hoạch Chăm sóc' },
            { key: '/dashboard/incidents', icon: <WarningOutlined />, label: 'Báo cáo Sự cố' },
            { key: '/dashboard/donations', icon: <GiftOutlined />, label: 'Quản lý Tài trợ' },
            { key: '/dashboard/supplies', icon: <AppstoreAddOutlined />, label: 'Quản lý Vật tư' },
          ],
        }
      ];
    }

    // 3. Manager Workspace
    if (roles.includes('Manager')) {
      return [
        {
          key: 'group-manager',
          type: 'group' as const,
          label: 'BAN QUẢN LÝ',
          children: [
            { key: '/dashboard/children', icon: <HeartOutlined />, label: 'Quản lý Trẻ em' },
            { key: '/dashboard/adoptions', icon: <FileTextOutlined />, label: 'Thẩm định Nhận nuôi' },
            { key: '/dashboard/care-plans', icon: <MedicineBoxOutlined />, label: 'Kế hoạch Chăm sóc' },
            { key: '/dashboard/incidents', icon: <WarningOutlined />, label: 'Báo cáo Sự cố' },
            { key: '/dashboard/donations', icon: <GiftOutlined />, label: 'Quản lý Tài trợ' },
            { key: '/dashboard/supplies', icon: <AppstoreAddOutlined />, label: 'Quản lý Vật tư' },
          ],
        }
      ];
    }

    // 4. CareGiver Role (Check position for sub-roles)
    if (roles.includes('CareGiver')) {
      // 4.1. Medical Staff (Y tá, điều dưỡng...)
      if (position.includes('y tá') || position.includes('điều dưỡng') || position.includes('y tế') || position.includes('bác sĩ')) {
        return [
          {
            key: 'group-medical',
            type: 'group' as const,
            label: 'Y TẾ & SỨC KHỎE',
            children: [
              { key: '/dashboard/children', icon: <HeartOutlined />, label: 'Theo dõi Sức khỏe Trẻ' },
              { key: '/dashboard/care-plans', icon: <MedicineBoxOutlined />, label: 'Hồ sơ Y tế & Bệnh án' },
              { key: '/dashboard/incidents', icon: <WarningOutlined />, label: 'Báo cáo Sự cố Y tế' },
            ],
          }
        ];
      }

      // 4.2. Accountant & Inventory Staff (Kế toán, thủ kho, nhà bếp, bảo vệ...)
      if (position.includes('kế toán') || position.includes('thủ kho') || position.includes('kho') || position.includes('hậu cần') || position.includes('bếp') || position.includes('vệ')) {
        return [
          {
            key: 'group-inventory',
            type: 'group' as const,
            label: 'TÀI CHÍNH & VẬT TƯ',
            children: [
              { key: '/dashboard/donations', icon: <GiftOutlined />, label: 'Quản lý Tài trợ' },
              { key: '/dashboard/supplies', icon: <AppstoreAddOutlined />, label: 'Quản lý Kho Vật tư' },
            ],
          }
        ];
      }

      // 4.3. Standard CareGiver (Bảo mẫu)
      return [
        {
          key: 'group-caregiver',
          type: 'group' as const,
          label: 'CA TRỰC BẢO MẪU',
          children: [
            { key: '/dashboard/checklist-sinh-hoat', icon: <DashboardOutlined />, label: 'Bảng ca trực (Checklist)' },
            { key: '/dashboard/attendance', icon: <HeartOutlined />, label: 'Ca trực & Điểm danh' },
            { key: '/dashboard/incidents', icon: <WarningOutlined />, label: 'Báo cáo Sự cố' },
            { key: '/dashboard/supplies-request', icon: <AppstoreAddOutlined />, label: 'Yêu cầu Vật tư' },
            { key: '/dashboard/medical-records', icon: <FileTextOutlined />, label: 'Hồ sơ Y tế' },
            { key: '/dashboard/vaccinations', icon: <CalendarOutlined />, label: 'Lịch Tiêm chủng' },
          ],
        }
      ];
    }

    // 5. Adopter Workspace
    if (roles.includes('Adopter')) {
      return [
        {
          key: 'group-adopter',
          type: 'group' as const,
          label: 'NGƯỜI NHẬN NUÔI',
          children: [
            { key: '/dashboard/adopter-portal', icon: <HeartOutlined />, label: 'Cổng thông tin' },
            { key: '/dashboard/children', icon: <TeamOutlined />, label: 'Danh sách trẻ em' },
            { key: '/dashboard/profile', icon: <UserOutlined />, label: 'Hồ sơ cá nhân' },
          ],
        }
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  const userMenu = [
    { key: 'profile', icon: <UserOutlined />, label: 'Hồ sơ cá nhân', onClick: () => navigate('/dashboard/profile') },
    { key: 'logout', icon: <LogoutOutlined />, danger: true, label: 'Đăng xuất', onClick: handleLogout },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} width={260} theme="dark" style={{ background: '#1e293b' }}>
        <div style={{ height: 64, margin: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartOutlined style={{ fontSize: 24, color: '#f43f5e', marginRight: collapsed ? 0 : 10 }} />
            {!collapsed && <Text strong style={{ color: 'white', fontSize: 18 }}>Hope Center</Text>}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} onClick={(e) => navigate(e.key)} items={menuItems} style={{ background: 'transparent' }} />
      </Sider>

      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
          <div>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: '18px', cursor: 'pointer' }
            })}
          </div>
          <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: '#0ea5e9' }} icon={<UserOutlined />} />
              <Text strong>{userInfo?.fullName || 'Admin'}</Text>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          minHeight: 280, 
          background: '#f1f5f9', 
          borderRadius: 8,
          width: 'calc(100% - 32px)'
        }}>
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;