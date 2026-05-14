import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import UserLayout from '../components/layouts/UserLayout';

// Admin Pages
import ChildrenManagement from '../pages/admin/ChildrenManagement';
import AdoptionManagement from '../pages/admin/AdoptionManagement';
import DonationManagement from '../pages/admin/DonationManagement';
import CarePlanManagement from '../pages/admin/CarePlanManagement';
import IncidentManagement from '../pages/admin/IncidentManagement';
import SuppliesManagement from '../pages/admin/SuppliesManagement';
import EmployeeManagement from '../pages/admin/EmployeeManagement';
import RoleManagement from '../pages/admin/RoleManagement';
import BackupManagement from '../pages/admin/BackupManagement';
import ProfilePage from '../pages/admin/ProfilePage';

// Adopter Pages
import AdoptionPortal from '../pages/Adoption/AdoptionPortal';

// Client Pages
import HomePage from '../pages/client/HomePage';
import AboutPage from '../pages/client/AboutPage';
import AdoptionPage from '../pages/client/AdoptionPage';
import DonationPage from '../pages/client/DonationPage';
import AuthPage from '../pages/client/AuthPage';

export const router = createBrowserRouter([
  // ==========================================
  // 1. GIAO DIỆN NGƯỜI DÙNG (CLIENT)
  // ==========================================
  {
    path: '/',
    element: <UserLayout />,
    children: [
      { index: true, element: <HomePage /> }, // Đã thay thế giao diện mới
{ path: 'about', element: <AboutPage /> },
{ path: 'adoption', element: <AdoptionPage /> },
{ path: 'donation', element: <DonationPage /> },
    ],
  },

// ==========================================
  // 2. XÁC THỰC (AUTH)
  // ==========================================
  {
    path: '/login',
    element: <AuthPage initialMode="login" />,
  },
  {
    path: '/register',
    element: <AuthPage initialMode="register" />,
  },

  // ==========================================
  // 3. GIAO DIỆN QUẢN TRỊ (ADMIN)
  // ==========================================
  {
    path: '/dashboard',
    element: <MainLayout />,
    children: [
      // Chuyển hướng được xử lý động trong MainLayout dựa trên Role
      
      // Các module quản lý chính
      { path: 'children', element: <ChildrenManagement /> },
      { path: 'adoptions', element: <AdoptionManagement /> },
      { path: 'donations', element: <DonationManagement /> },
      { path: 'care-plans', element: <CarePlanManagement /> },
      { path: 'incidents', element: <IncidentManagement /> },
      { path: 'supplies', element: <SuppliesManagement /> },
      { path: 'employees', element: <EmployeeManagement /> },
      { path: 'roles', element: <RoleManagement /> },
      { path: 'backup', element: <BackupManagement /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'adopter-portal', element: <AdoptionPortal /> },
    ],
  },

  // ==========================================
  // 4. LỖI 404
  // ==========================================
  {
    path: '*',
    element: <div style={{ padding: 80, textAlign: 'center', fontSize: 24, color: '#f43f5e', fontWeight: 700 }}>
      404 - Không tìm thấy trang này!
    </div>,
  },
]);