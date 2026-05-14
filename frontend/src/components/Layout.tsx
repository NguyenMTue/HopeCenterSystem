import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  ClipboardList, 
  AlertCircle, 
  HeartHandshake, 
  Package, 
  ClipboardCheck, 
  UserCog, 
  ShieldCheck, 
  Database, 
  BarChart3, 
  Globe,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Báo cáo tổng hợp', path: '/' },
  { icon: Users, label: 'Quản lý trẻ em', path: '/children' },
  { icon: UserPlus, label: 'Đăng ký nhận nuôi', path: '/adoption' },
  { icon: ClipboardList, label: 'Kế hoạch chăm sóc', path: '/care-plans' },
  { icon: AlertCircle, label: 'Báo cáo sự cố', path: '/incidents' },
  { icon: HeartHandshake, label: 'Quản lý tài trợ', path: '/donations' },
  { icon: Package, label: 'Quản lý kho', path: '/inventory' },
  { icon: ClipboardCheck, label: 'Sử dụng vật tư', path: '/inventory-usage' },
  { icon: UserCog, label: 'Quản lý nhân viên', path: '/employees' },
  { icon: ShieldCheck, label: 'Phân quyền', path: '/roles' },
  { icon: Database, label: 'Bảo trì & Sao lưu', path: '/maintenance' },
  { icon: Globe, label: 'Cổng thông tin', path: '/public' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <HeartHandshake className="w-8 h-8" />
            <span>Hope Center</span>
          </h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-danger hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">
            {menuItems.find(m => m.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">Admin User</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
              AD
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
