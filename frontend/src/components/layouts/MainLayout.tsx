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
  DashboardOutlined,
  HomeOutlined
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
        
        const userRoles = response.data.roles || [];
        const hasAdopter = userRoles.some((r: string) => r.toLowerCase() === 'adopter');
        
        // Fix: Nếu tài khoản có nhiều vai trò và chứa cả Adopter, đá ngay ra trang chủ
        if (userRoles.length > 1 && hasAdopter) {
          message.error('Tài khoản người nhận nuôi (Adopter) không được phép đồng thời giữ các vai trò khác.');
          navigate('/', { replace: true });
          return;
        }

        // Chuyển hướng nếu vào trang gốc dashboard
        if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
          if (userRoles.some((r: string) => r.toLowerCase() === 'administrator')) {
            navigate('/dashboard/admin', { replace: true });
          } else if (userRoles.some((r: string) => r.toLowerCase() === 'director') || userRoles.some((r: string) => r.toLowerCase() === 'manager')) {
            navigate('/dashboard/children', { replace: true });
          } else if (userRoles.some((r: string) => r.toLowerCase() === 'caregiver')) {
            navigate('/dashboard/checklist-sinh-hoat', { replace: true });
          } else if (userRoles.some((r: string) => r.toLowerCase() === 'donor')) {
            navigate('/dashboard/donor-portal', { replace: true });
          } else if (response.data.userType === 'Adopter' || hasAdopter) {
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
    const menuItemsList: any[] = [];

    const hasRole = (roleName: string) => roles.some(r => r.toLowerCase() === roleName.toLowerCase());

    // 1. Administrator Workspace
    if (hasRole('Administrator')) {
      menuItemsList.push({
        key: 'group-admin',
        type: 'group' as const,
        label: 'HỆ THỐNG (ADMIN)',
        children: [
          { key: '/dashboard/admin', icon: <DashboardOutlined />, label: 'Cổng quản trị (Admin)' },
          { key: '/dashboard/profile', icon: <UserOutlined />, label: 'Hồ sơ cá nhân' },
        ],
      });
    }

    // 2. Director Workspace
    if (hasRole('Director')) {
      menuItemsList.push({
        key: 'group-director',
        type: 'group' as const,
        label: 'BAN GIÁM ĐỐC',
        children: [
          { key: '/dashboard/children', icon: <HeartOutlined />, label: 'Quản lý Trẻ em' },
          { key: '/dashboard/adoptions', icon: <FileTextOutlined />, label: 'Thẩm định Nhận nuôi' },
          { key: '/dashboard/care-plans', icon: <MedicineBoxOutlined />, label: 'Kế hoạch Chăm sóc' },
          { key: '/dashboard/manager-incidents', icon: <WarningOutlined />, label: 'Báo cáo Sự cố' },
          { key: '/dashboard/donations', icon: <GiftOutlined />, label: 'Quản lý Tài trợ' },
          { key: '/dashboard/supplies', icon: <AppstoreAddOutlined />, label: 'Quản lý Vật tư' },
        ],
      });
    }

    // 3. Manager Workspace
    if (hasRole('Manager')) {
      menuItemsList.push({
        key: 'group-manager',
        type: 'group' as const,
        label: 'BAN QUẢN LÝ',
        children: [
          { key: '/dashboard/children', icon: <HeartOutlined />, label: 'Quản lý Trẻ em' },
          { key: '/dashboard/adoptions', icon: <FileTextOutlined />, label: 'Thẩm định Nhận nuôi' },
          { key: '/dashboard/care-plans', icon: <MedicineBoxOutlined />, label: 'Kế hoạch Chăm sóc' },
          { key: '/dashboard/manager-incidents', icon: <WarningOutlined />, label: 'Báo cáo Sự cố' },
          { key: '/dashboard/donations', icon: <GiftOutlined />, label: 'Quản lý Tài trợ' },
          { key: '/dashboard/supplies', icon: <AppstoreAddOutlined />, label: 'Quản lý Vật tư' },
        ],
      });
    }

    // 4. CareGiver Role
    if (hasRole('CareGiver')) {
      if (position.includes('y tá') || position.includes('điều dưỡng') || position.includes('y tế') || position.includes('bác sĩ')) {
        menuItemsList.push({
          key: 'group-medical',
          type: 'group' as const,
          label: 'Y TẾ & SỨC KHỎE',
          children: [
            { key: '/dashboard/children', icon: <HeartOutlined />, label: 'Theo dõi Sức khỏe Trẻ' },
            { key: '/dashboard/care-plans', icon: <MedicineBoxOutlined />, label: 'Hồ sơ Y tế & Bệnh án' },
            { key: '/dashboard/incidents', icon: <WarningOutlined />, label: 'Báo cáo Sự cố Y tế' },
          ],
        });
      } else {
        menuItemsList.push({
          key: 'group-caregiver',
          type: 'group' as const,
          label: 'CA TRỰC BẢO MẪU',
          children: [
            { key: '/dashboard/checklist-sinh-hoat', icon: <DashboardOutlined />, label: 'Bảng ca trực (Checklist)' },
            { key: '/dashboard/attendance', icon: <HeartOutlined />, label: 'Ca trực & Điểm danh' },
            { key: '/dashboard/incidents', icon: <WarningOutlined />, label: 'Báo cáo Sự cố' },
            { key: '/dashboard/supplies-request', icon: <AppstoreAddOutlined />, label: 'Yêu cầu Vật tư' },
            { key: '/dashboard/medical-records', icon: <FileTextOutlined />, label: 'Hồ sơ Y tế' },
          ],
        });
      }
    }

    // 5. Adopter Workspace
    if (hasRole('Adopter')) {
      menuItemsList.push({
        key: 'group-adopter',
        type: 'group' as const,
        label: 'NGƯỜI NHẬN NUÔI',
        children: [
          { key: '/adopter-portal', icon: <HeartOutlined />, label: 'Cổng thông tin' },
          { key: '/dashboard/children', icon: <TeamOutlined />, label: 'Danh sách trẻ em' },
          { key: '/dashboard/profile', icon: <UserOutlined />, label: 'Hồ sơ cá nhân' },
        ],
      });
    }

    // 6. Donor Workspace
    if (hasRole('Donor')) {
      menuItemsList.push({
        key: 'group-donor',
        type: 'group' as const,
        label: 'NHÀ TÀI TRỢ',
        children: [
          { key: '/dashboard/donor-portal', icon: <HeartOutlined />, label: 'Cổng tài trợ' },
          { key: '/dashboard/profile', icon: <UserOutlined />, label: 'Hồ sơ cá nhân' },
          { key: '/', icon: <HomeOutlined />, label: 'Quay lại Trang chủ' },
        ],
      });
    }

    return menuItemsList;
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