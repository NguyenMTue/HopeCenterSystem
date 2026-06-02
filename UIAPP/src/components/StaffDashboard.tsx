import { useState } from 'react';
import { 
  Baby, 
  HeartPulse, 
  Clock, 
  CheckSquare, 
  ChevronRight, 
  Search, 
  Activity, 
  Heart, 
  Calendar,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { Child, CareTask } from '../types';

interface StaffDashboardProps {
  childrenList: Child[];
  careTasks: CareTask[];
  onSelectChild: (child: Child) => void;
  onSelectCarePlan: () => void;
}

export default function StaffDashboard({ childrenList, careTasks, onSelectChild, onSelectCarePlan }: StaffDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unstable' | 'healthy'>('all');

  const filteredChildren = childrenList.filter(child => {
    const matchesSearch = child.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          child.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'unstable') {
      return matchesSearch && (child.status === 'Cần uống thuốc' || child.status === 'Cảm nhẹ' || child.status === 'Theo dõi');
    }
    if (activeTab === 'healthy') {
      return matchesSearch && (child.status === 'Khỏe mạnh' || child.status === 'Ổn định');
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Welcome Panel */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Nhân viên nghiệp vụ bảo trợ
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chào buổi sáng, Lê Thị Mai</h1>
          <p className="text-sm text-slate-500 mt-1">Hôm nay là Ngày 1 tháng 6, 2026. Chúc bạn có một phiên trực tràn đầy niềm vui!</p>
        </div>
        <div className="flex gap-3">
          <div className="px-5 py-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Bàn giao ca trước</p>
              <p className="text-xs font-bold text-slate-700 mt-1">Đã nhận đủ 42 bé</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
            <Baby className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trẻ em bảo trợ</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">42 <span className="text-sm font-semibold text-slate-400">trẻ</span></p>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">Danh mục vừa nhận thêm 2 trẻ</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="p-4 bg-rose-50 text-rose-500 rounded-xl group-hover:scale-105 transition-transform">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cần chú ý y tế</p>
            <p className="text-3xl font-extrabold text-rose-600 mt-1">3 <span className="text-sm font-semibold text-slate-400">trẻ</span></p>
            <p className="text-[11px] text-rose-500 font-semibold mt-1">Cần cho uống thuốc trước 12:30</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="p-4 bg-amber-50 text-amber-500 rounded-xl group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hoạt động tiếp theo</p>
            <p className="text-lg font-bold text-slate-800 mt-1.5">11:30 - Bữa Trưa</p>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">Chuẩn bị sữa &amp; cháo ăn bé lớn nhỏ</p>
          </div>
        </div>
      </section>

      {/* Main Grid: Left Side Children Table, Right Side Timeline & Checklists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Children Management Table */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                Danh sách trẻ cập nhật gần đây
              </h2>
              <span className="text-xs font-bold font-mono px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                Hiển thị: {filteredChildren.length} trẻ
              </span>
            </div>

            {/* Filters and search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo mã số hoặc tên trẻ..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-xs font-medium"
                />
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tất cả
                </button>
                <button 
                  onClick={() => setActiveTab('unstable')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeTab === 'unstable' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-500 hover:text-rose-500'
                  }`}
                >
                  Cần chú ý
                </button>
                <button 
                  onClick={() => setActiveTab('healthy')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeTab === 'healthy' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-emerald-600'
                  }`}
                >
                  Ổn định
                </button>
              </div>
            </div>
          </div>

          {/* Children Table */}
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã Số</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Họ &amp; Tên trẻ</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tuổi, giới tính</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chiều cao / Cân nặng</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tình trạng y tế</th>
                  <th className="py-3 px-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChildren.map(child => (
                  <tr key={child.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="py-4 px-6 text-xs font-bold font-mono text-slate-700">{child.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                          <img 
                            alt={child.name} 
                            src={child.avatar} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{child.name}</p>
                          <p className="text-[10px] text-slate-400">{child.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-600">
                      {child.age} tuổi • {child.gender}
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-600">
                      {child.weight} kg
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        child.status === 'Khỏe mạnh' || child.status === 'Ổn định'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : child.status === 'Cần uống thuốc'
                            ? 'bg-rose-50 text-rose-500 border border-rose-100 animate-pulse'
                            : 'bg-amber-50 text-amber-500 border border-amber-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          child.status === 'Khỏe mạnh' || child.status === 'Ổn định' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}></span>
                        {child.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => onSelectChild(child)}
                        className="text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        Cập nhật
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredChildren.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                      Không tìm thấy bé nào đáp ứng bộ lọc tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Side: Timeline & Care Task Quick Checklists */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* Daily activity timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              Tiến trình hoạt động trong ngày
            </h3>
            
            <div className="mt-5 space-y-5 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {/* Event 1 */}
              <div className="flex gap-4 relative">
                <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400 z-10">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 line-through">07:00 AM - Cho trẻ ăn sáng</p>
                  <p className="text-[11px] text-slate-400 line-through mt-0.5">Tế ăn số 1 &amp; khu Rosa tầng 2</p>
                </div>
              </div>

              {/* Event 2 */}
              <div className="flex gap-4 relative">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white z-10 ring-2 ring-blue-100 animate-pulse">
                  ➜
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-600">10:00 AM - Hoạt động ngoại khóa</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Vẽ tranh và học đếm số chung</p>
                </div>
              </div>

              {/* Event 3 */}
              <div className="flex gap-4 relative">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400 z-10">
                  3
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">11:30 AM - Chuẩn bị bữa trưa</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Bữa cơm thịt kho cải củ &amp; chuối tráng miệng</p>
                </div>
              </div>

              {/* Event 4 */}
              <div className="flex gap-4 relative">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-rose-200 flex items-center justify-center text-[10px] font-bold text-rose-500 z-10">
                  4
                </div>
                <div>
                  <p className="text-xs font-semibold text-rose-600">12:30 PM - Cho An &amp; Tùng uống thuốc</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Siro và thuốc giảm sốt tại văn phòng y tế</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick checklists */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-slate-400" />
                Công việc theo dõi tháng
              </h3>
              <button 
                onClick={onSelectCarePlan}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Chi tiết
              </button>
            </div>

            <div className="space-y-3">
              {careTasks.slice(0, 2).map(task => (
                <div key={task.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">{task.location}</span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">{task.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">{task.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Đối tượng: {task.childName} ({task.age} tuổi)</p>
                  
                  {/* Miniature progress bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-grow h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ 
                          width: `${(task.checklist.filter(c => c.done).length / task.checklist.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500">
                      {task.checklist.filter(c => c.done).length}/{task.checklist.length} mục
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
