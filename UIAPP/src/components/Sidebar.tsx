import { 
  LayoutDashboard, 
  Baby, 
  FileSignature, 
  Package, 
  Users2, 
  BarChart3, 
  Settings, 
  Bell, 
  LogOut, 
  Heart,
  Plus
} from 'lucide-react';
import { Screen, Role } from '../types';

interface SidebarProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  role: Role;
  setRole: (role: Role) => void;
}

export default function Sidebar({ activeScreen, setActiveScreen, role, setRole }: SidebarProps) {
  // If the active role is public or login, we don't display the internal dashboard sidebar
  if (role === 'public' || role === 'login') {
    return null;
  }

  const handleLogout = () => {
    setRole('login');
    setActiveScreen('login');
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-[260px] bg-[#1e293b] text-slate-300 shadow-xl flex flex-col py-6 z-40 hidden md:flex">
      {/* Brand */}
      <div className="px-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white cursor-pointer" onClick={() => {
            setRole('public');
            setActiveScreen('public_home');
          }}>
            <Heart className="w-5 h-5 fill-current text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-base text-white font-sans tracking-tight">Hope Center</h1>
            <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-wider">Hệ Thống Số</p>
          </div>
        </div>
      </div>

      {/* Portal Role Indicator */}
      <div className="px-6 mb-6">
        {role === 'director' ? (
          <div className="bg-indigo-950/80 border border-indigo-500/30 rounded-xl p-3 text-left">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">KHÔNG GIAN</span>
            <span className="text-xs font-black text-white flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              👑 TRANG GIÁM ĐỐC
            </span>
            <span className="text-[9px] text-slate-400 block mt-1 font-mono leading-tight">Quyền hạn tối cao thượng tầng, phê duyệt pháp quy hồ sơ xã hội.</span>
          </div>
        ) : (
          <div className="bg-blue-950/80 border border-blue-500/30 rounded-xl p-3 text-left">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">KHÔNG GIAN</span>
            <span className="text-xs font-black text-white flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              🛠️ TRANG QUẢN LÝ
            </span>
            <span className="text-[9px] text-slate-400 block mt-1 font-mono leading-tight">Nghiệp vụ trực ban điều dưỡng nhi khoa, ghi nhận vật tư tài trợ.</span>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="px-6 mb-6">
        {role === 'director' ? (
          <button 
            onClick={() => setActiveScreen('director_dashboard')}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white py-2.5 rounded-lg text-xs font-black hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <LayoutDashboard className="w-4 h-4" />
            Giám sát cấp cao
          </button>
        ) : (
          <button 
            onClick={() => setActiveScreen('staff_dashboard')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-2.5 rounded-lg text-xs font-black hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            Cập nhật Nhật ký mới
          </button>
        )}
      </div>

      {/* Navigation Links based on dedicated Portals */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        
        {role === 'director' ? (
          <>
            {/* DIRECTOR PORTAL MENU */}
            <div className="px-4 py-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Nghiệp Vụ Giám Đốc</div>
            
            <button
              onClick={() => setActiveScreen('director_dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-all font-semibold text-xs cursor-pointer ${
                activeScreen === 'director_dashboard'
                  ? 'border-l-4 border-indigo-505 border-indigo-500 bg-white/10 text-white font-bold'
                  : 'border-l-4 border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5 text-indigo-400" />
              <span>Bảng duyệt &amp; KPI</span>
            </button>

            <button
              onClick={() => setActiveScreen('warehouse')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-all font-semibold text-xs cursor-pointer ${
                activeScreen === 'warehouse'
                  ? 'border-l-4 border-indigo-500 bg-white/10 text-white font-bold'
                  : 'border-l-4 border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-4.5 h-4.5 text-indigo-400" />
              <span>Dự chi &amp; Quản trị Kho</span>
            </button>

            <button
              onClick={() => setActiveScreen('care_plan')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-all font-semibold text-xs cursor-pointer ${
                activeScreen === 'care_plan'
                  ? 'border-l-4 border-indigo-500 bg-white/10 text-white font-bold'
                  : 'border-l-4 border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileSignature className="w-4.5 h-4.5 text-indigo-400" />
              <span>Hồ sơ nhận nuôi chờ ký</span>
            </button>

            <button
              onClick={() => setActiveScreen('child_update')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-all font-semibold text-xs cursor-pointer ${
                activeScreen === 'child_update'
                  ? 'border-l-4 border-indigo-500 bg-white/10 text-white font-bold'
                  : 'border-l-4 border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Baby className="w-4.5 h-4.5 text-indigo-400" />
              <span>Xem hồ sơ nhi khoa</span>
            </button>
          </>
        ) : (
          <>
            {/* MANAGEMENT PORTAL MENU */}
            <div className="px-4 py-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">Nghiệp Vụ Quản Lý</div>
            
            <button
              onClick={() => setActiveScreen('staff_dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-all font-semibold text-xs cursor-pointer ${
                activeScreen === 'staff_dashboard'
                  ? 'border-l-4 border-blue-500 bg-white/10 text-white font-bold'
                  : 'border-l-4 border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5 text-blue-400" />
              <span>Bảng trực nhân viên</span>
            </button>

            <button
              onClick={() => setActiveScreen('child_update')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-all font-semibold text-xs cursor-pointer ${
                activeScreen === 'child_update'
                  ? 'border-l-4 border-blue-500 bg-white/10 text-white font-bold'
                  : 'border-l-4 border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Baby className="w-4.5 h-4.5 text-blue-400" />
              <span>Cập nhật Nhật ký Trẻ</span>
            </button>

            <button
              onClick={() => setActiveScreen('care_plan')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-all font-semibold text-xs cursor-pointer ${
                activeScreen === 'care_plan'
                  ? 'border-l-4 border-blue-500 bg-white/10 text-white font-bold'
                  : 'border-l-4 border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileSignature className="w-4.5 h-4.5 text-blue-400" />
              <span>Nhiệm vụ Chăm sóc</span>
            </button>

            <button
              onClick={() => setActiveScreen('warehouse')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-all font-semibold text-xs cursor-pointer ${
                activeScreen === 'warehouse'
                  ? 'border-l-4 border-blue-500 bg-white/10 text-white font-bold'
                  : 'border-l-4 border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-4.5 h-4.5 text-blue-400" />
              <span>Tài trợ &amp; Kho vật tư</span>
            </button>
          </>
        )}

        <div className="pt-4 pb-1 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tiện ích chung</div>
        
        <button
          onClick={() => {
            setRole('public');
            setActiveScreen('public_home');
          }}
          className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-lg text-slate-450 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs cursor-pointer"
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Về trang chủ Client</span>
        </button>

        <button
          onClick={() => alert('Đang liên kết dữ liệu hệ thống nhân sự.')}
          className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs cursor-pointer"
        >
          <Users2 className="w-4 h-4" />
          <span>Danh sách ca trực</span>
        </button>
      </div>

      {/* Footer Alerts and Logout */}
      <div className="px-2 mt-auto pt-6 border-t border-white/10 space-y-1">
        <button 
          onClick={() => alert(role === 'director' ? 'Hồ sơ cần duyệt của Giám đốc: Có 2 việc cần xem xét.' : 'Phân khu quản lý: Ca trực hôm nay bình an.')}
          className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs cursor-pointer relative"
        >
          <Bell className="w-4.5 h-4.5" />
          <span>Thông báo khẩn</span>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
            {role === 'director' ? '2' : '1'}
          </span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Đăng xuất hệ thống</span>
        </button>
      </div>
    </nav>
  );
}
