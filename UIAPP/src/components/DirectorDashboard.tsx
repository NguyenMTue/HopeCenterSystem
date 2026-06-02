import { useState } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  FileCheck2, 
  Wallet, 
  BellRing, 
  Check, 
  X, 
  CircleAlert, 
  TrendingUp,
  Award,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { PendingItem, SystemAlert } from '../types';

interface DirectorDashboardProps {
  pendingItems: PendingItem[];
  systemAlerts: SystemAlert[];
  onApproveItem: (id: string, action: 'approve' | 'reject') => void;
  onAddAlert: (alert: SystemAlert) => void;
}

export default function DirectorDashboard({ pendingItems, systemAlerts, onApproveItem, onAddAlert }: DirectorDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'adoption' | 'medical' | 'finance'>('all');
  
  // Funding chart details
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  
  const chartData = [
    { month: 'T5', amount: 45, label: '45 Triệu' },
    { month: 'T6', amount: 62, label: '62 Triệu' },
    { month: 'T7', amount: 80, label: '80 Triệu' },
    { month: 'T8', amount: 75, label: '75 Triệu' },
    { month: 'T9', amount: 110, label: '110 Triệu' },
    { month: 'T10', amount: 125, label: '125.5 Triệu' },
  ];

  const filteredPending = pendingItems.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.type === selectedCategory;
  });

  return (
    <div className="space-y-8">
      
      {/* Executive Welcome Banner */}
      <header className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Abstract vector decor */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-0"></div>
        <div className="absolute right-20 bottom-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl -z-0"></div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            Văn phòng Điều hành Quốc gia
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Giám đốc Điều hành: Hà Minh Trung</h1>
          <p className="text-slate-400 text-xs md:text-sm mt-2 leading-relaxed">
            Hôm nay bạn có <strong className="text-white">{pendingItems.length} hồ sơ tư pháp &amp; tài chính</strong> đang chờ biểu quyết phê chuẩn từ Ban điều hành.
          </p>
        </div>
      </header>

      {/* Corporate Dashboard KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm relative group">
          <div className="absolute top-4 right-4 p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trẻ em bảo bọc</p>
          <p className="text-2xl font-black text-slate-900 mt-1">42 <span className="text-xs font-semibold text-slate-400">trẻ</span></p>
          <div className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trạng thái ca trực ổn định</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm relative group">
          <div className="absolute top-4 right-4 p-2.5 bg-rose-50 text-rose-500 rounded-lg">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hồ sơ chờ duyệt</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{pendingItems.length} <span className="text-xs font-semibold text-slate-400">việc</span></p>
          <div className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1">
            <CircleAlert className="w-3.5 h-3.5" />
            <span>1 kế hoạch khẩn cấp</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm relative group">
          <div className="absolute top-4 right-4 p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Wallet className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quỹ bảo trợ dự phòng</p>
          <p className="text-2xl font-black text-slate-900 mt-1">125.5 <span className="text-xs font-semibold text-slate-400">Tr VNĐ</span></p>
          <div className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.5% tăng trưởng tháng</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm relative group">
          <div className="absolute top-4 right-4 p-2.5 bg-amber-50 text-amber-500 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bảo trợ mới trong quý</p>
          <p className="text-2xl font-black text-slate-900 mt-1">18 <span className="text-xs font-semibold text-slate-400">gia đình</span></p>
          <div className="text-[10px] text-amber-600 font-bold mt-2 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            <span>Đã hoàn tất chuyển giao</span>
          </div>
        </div>

      </section>

      {/* Main Splitted Panel: Left Pending Approvals Queue, Right Analytics & Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Pending Approvals (DANH SÁCH DUYỆT HỒ SƠ) */}
        <section className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Danh sách duyệt &amp; ký duyệt hồ sơ
              </h2>
              <p className="text-slate-400 text-[11px] mt-0.5">Vui lòng rà soát cẩn trọng trước khi đưa ra biểu quyết áp dụng pháp quy.</p>
            </div>

            {/* Approved category selector */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              <button 
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md cursor-pointer ${
                  selectedCategory === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Tất cả
              </button>
              <button 
                onClick={() => setSelectedCategory('adoption')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md cursor-pointer ${
                  selectedCategory === 'adoption' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Nhận nuôi
              </button>
              <button 
                onClick={() => setSelectedCategory('medical')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md cursor-pointer ${
                  selectedCategory === 'medical' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Y khoa
              </button>
            </div>
          </div>

          {/* Pending items cards */}
          <div className="space-y-4">
            {filteredPending.map(item => (
              <div 
                key={item.id} 
                className={`p-5 rounded-xl border flex flex-col gap-3 group relative overflow-hidden transition-all hover:shadow-md ${
                  item.urgent 
                    ? 'border-rose-200 bg-rose-50/10' 
                    : 'border-slate-150 bg-white'
                }`}
              >
                {/* ID badge and time */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      Mã: {item.id}
                    </span>
                    {item.urgent && (
                      <span className="text-[9px] font-extrabold uppercase bg-red-500 text-white px-2 py-0.5 rounded-sm animate-pulse tracking-wide">
                        Khẩn cấp
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">{item.time}</span>
                </div>

                {/* Content body */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {item.content}
                  </p>
                </div>

                {/* Approval direct action buttons */}
                <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3">
                  <button 
                    onClick={() => onApproveItem(item.id, 'reject')}
                    className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Bác bỏ
                  </button>
                  <button 
                    onClick={() => onApproveItem(item.id, 'approve')}
                    className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all hover:shadow-md cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Ký duyệt ban hành
                  </button>
                </div>

              </div>
            ))}

            {filteredPending.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                Quy trình trống. Không có tài liệu hoặc hồ sơ nhận nuôi nào chờ xét duyệt lớp này.
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Donor Analytics Charts & Alerts */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* SVG Funding Analytics Chart widget */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Sơ đồ tăng trưởng quỹ thu tài trợ (Triệu VNĐ/Tháng)
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Thống kê lũy kế 6 tháng qua của Hope Center</p>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="relative h-[180px] w-full flex items-end justify-between px-2 pt-6">
              
              {/* Y Axis Guides */}
              <div className="absolute inset-0 flex flex-col justify-between text-[9px] font-bold font-mono text-slate-300 pointer-events-none pb-[28px]">
                <div className="border-b border-slate-100 w-full text-right pr-2">120M</div>
                <div className="border-b border-slate-100 w-full text-right pr-2">80M</div>
                <div className="border-b border-slate-100 w-full text-right pr-2">40M</div>
              </div>

              {chartData.map((d, index) => {
                // Calculate height percentage
                const heightPercent = (d.amount / 130) * 100;
                const isHovered = hoveredBar === index;

                return (
                  <div 
                    key={d.month} 
                    className="flex-1 flex flex-col items-center group relative z-10 mx-2"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute top-[-26px] bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg pointer-events-none whitespace-nowrap">
                        {d.label}
                      </div>
                    )}
                    
                    {/* Interactive SVG / CSS bar */}
                    <div 
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isHovered 
                          ? 'bg-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.4)]' 
                          : 'bg-blue-505/20 bg-blue-500/80'
                      }`}
                      style={{ height: `${heightPercent}px` }}
                    ></div>

                    {/* X Axis Label */}
                    <span className="text-[10px] font-bold text-slate-500 mt-2 font-mono">
                      {d.month}
                    </span>
                  </div>
                );
              })}

            </div>
          </div>

          {/* System Alerts and Events Panel (Screen 6 alerts Block) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-blue-500 animate-wiggle" />
              Sổ tay cảnh báo vận hành toàn cục
            </h3>

            <div className="space-y-3.5">
              {systemAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3.5 text-xs ${
                    alert.type === 'error'
                      ? 'border-rose-100 bg-rose-50/20 text-rose-700'
                      : 'border-emerald-100 bg-emerald-50/20 text-emerald-700'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg mt-0.5 ${
                    alert.type === 'error' ? 'bg-rose-100' : 'bg-emerald-100'
                  }`}>
                    <CircleAlert className="w-4 h-4" />
                  </div>
                  <div className="text-left select-text">
                    <p className="font-bold underline leading-none mb-1">{alert.title}</p>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{alert.content}</p>
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
