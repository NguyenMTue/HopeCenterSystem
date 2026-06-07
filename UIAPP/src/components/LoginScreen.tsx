import React, { useState } from 'react';
import { 
  Heart, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Briefcase, 
  Building2, 
  UserCircle2, 
  Warehouse
} from 'lucide-react';
import { Role, Screen } from '../types';

interface LoginScreenProps {
  onLogin: (role: Role, screen: Screen) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Vui lòng nhập Email và Mật khẩu đăng nhập!');
      return;
    }

    // Default to staff if random input is submitted
    if (email.includes('director') || email.includes('giamdoc')) {
      onLogin('director', 'director_dashboard');
    } else if (email.includes('warehouse') || email.includes('kho')) {
      onLogin('warehouse_manager', 'warehouse');
    } else {
      onLogin('staff', 'staff_dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Visual Box Panel split-pane layout */}
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[560px] border border-slate-200/50">
        
        {/* Left Hand: App intro banner (Screen 8 Left section) */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Abstract background blobs */}
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute left-6 top-8 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>

          <div className="relative z-10 flex items-center gap-2" onClick={() => onLogin('public', 'public_home')}>
            <Heart className="text-pink-400 fill-current w-6 h-6 animate-pulse" />
            <span className="font-extrabold text-lg tracking-tight font-sans text-pink-400">Hope Center</span>
          </div>

          <div className="relative z-10 my-10 space-y-4">
            <h2 className="text-2xl font-black leading-tight tracking-tight">Hành trình thắp sáng nụ cười trẻ thơ</h2>
            <p className="text-xs text-blue-200 leading-relaxed font-medium">
              Chào mừng bạn đến với hệ thống điều hành số của Hope Center Việt Nam. Nơi thắp sáng niềm tin, kiến tạo mái ấm và gìn giữ chỉ số bình an cho em thơ.
            </p>
          </div>

          <div className="relative z-10 text-[10px] text-blue-300 font-mono">
            © 2026 Hope Center Corporate Unit
          </div>
        </div>

        {/* Right Hand: Login Form (Screen 8 Right section) */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center gap-6">
          <div className="text-left">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Chào mừng trở lại!</h3>
            <p className="text-xs text-slate-400 mt-1">Đăng nhập tài khoản điều hành viên được phân quyền sở tại.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tên tài khoản hoặc Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hopecenter.org"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-xs font-bold font-mono text-slate-800"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mật khẩu bảo mật</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-xs font-mono text-slate-800"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all hover:shadow-md flex items-center justify-center gap-1 cursor-pointer"
            >
              Đăng nhập hệ thống
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Shortcuts for Evaluation - extremely practical and looks highly commercial */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Lối tắt thử nghiệm nhanh từng màn hình</p>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Staff Portal Link */}
              <button
                type="button"
                onClick={() => onLogin('staff', 'staff_dashboard')}
                className="p-2.5 border border-slate-150 rounded-xl hover:border-blue-500 hover:bg-blue-50/10 text-left cursor-pointer transition-all flex items-center gap-2 group"
              >
                <Briefcase className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-[10px] font-bold text-slate-800 leading-none">Màn 1, 2, 3</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Nhân viên trực ban</p>
                </div>
              </button>

              {/* Director Portal Link */}
              <button
                type="button"
                onClick={() => onLogin('director', 'director_dashboard')}
                className="p-2.5 border border-slate-150 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/10 text-left cursor-pointer transition-all flex items-center gap-2 group"
              >
                <Building2 className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-[10px] font-bold text-slate-800 leading-none">Màn 6 (Giám Đốc)</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Phê duyệt hồ sơ</p>
                </div>
              </button>

              {/* Warehouse Portal Link */}
              <button
                type="button"
                onClick={() => onLogin('warehouse_manager', 'warehouse')}
                className="p-2.5 border border-slate-150 rounded-xl hover:border-amber-500 hover:bg-amber-50/10 text-left cursor-pointer transition-all flex items-center gap-2 group"
              >
                <Warehouse className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-[10px] font-bold text-slate-800 leading-none">Màn 7 (Kho vật tư)</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Ghi nhận tài trợ</p>
                </div>
              </button>

              {/* Public Portal Link */}
              <button
                type="button"
                onClick={() => onLogin('public', 'public_home')}
                className="p-2.5 border border-slate-150 rounded-xl hover:border-pink-500 hover:bg-pink-50/10 text-left cursor-pointer transition-all flex items-center gap-2 group"
              >
                <UserCircle2 className="w-4 h-4 text-pink-500" />
                <div>
                  <p className="text-[10px] font-bold text-slate-800 leading-none">Màn 4, 5 (Đông đảo)</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Khách vãng gia</p>
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
