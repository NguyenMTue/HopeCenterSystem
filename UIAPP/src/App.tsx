import { useState } from 'react';
import { 
  Role, 
  Screen, 
  Child, 
  CareTask, 
  Donation, 
  PendingItem, 
  SystemAlert 
} from './types';
import { 
  INITIAL_CHILDREN, 
  INITIAL_CARE_TASKS, 
  INITIAL_LOGS, 
  INITIAL_DONATIONS, 
  INITIAL_PENDING_ITEMS, 
  INITIAL_ALERTS 
} from './data';

// Components
import Sidebar from './components/Sidebar';
import PublicHome from './components/PublicHome';
import AdoptionForm from './components/AdoptionForm';
import StaffDashboard from './components/StaffDashboard';
import ChildUpdateModal from './components/ChildUpdateModal';
import CarePlanExecution from './components/CarePlanExecution';
import DirectorDashboard from './components/DirectorDashboard';
import SponsorshipWarehouse from './components/SponsorshipWarehouse';
import LoginScreen from './components/LoginScreen';

// Icons for Demo control bar
import { 
  Sliders, 
  LayoutDashboard, 
  Baby, 
  FileSignature, 
  Home, 
  FileSignature as PenIcon, 
  Building2, 
  Package, 
  Lock,
  Heart
} from 'lucide-react';

export default function App() {
  // Application Roles and Screens states
  const [role, setRole] = useState<Role>('public');
  const [activeScreen, setActiveScreen] = useState<Screen>('public_home');

  // Shared state databases (allows active mutation and reflection instantly!)
  const [childrenList, setChildrenList] = useState<Child[]>(INITIAL_CHILDREN);
  const [careTasks, setCareTasks] = useState<CareTask[]>(INITIAL_CARE_TASKS);
  const [donations, setDonations] = useState<Donation[]>(INITIAL_DONATIONS);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>(INITIAL_PENDING_ITEMS);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);

  // Active operating sub-states
  const [selectedChild, setSelectedChild] = useState<Child>(INITIAL_CHILDREN[0]);

  // Demo Switcher utilities
  const selectDemoScreen = (targetRole: Role, targetScreen: Screen) => {
    setRole(targetRole);
    setActiveScreen(targetScreen);
    if (targetScreen === 'child_update') {
      // Auto select first child if none is active to prevent crashes
      setSelectedChild(childrenList[0]);
    }
  };

  // Mutators passed down to child components
  const handleSaveChild = (updatedChild: Child, newLog?: any) => {
    // Update child list
    setChildrenList(prev => prev.map(c => c.id === updatedChild.id ? updatedChild : c));
    
    // Append log if present
    if (newLog) {
      // Just showing log saved in alerts as mock
      const alertMessage: SystemAlert = {
        id: `ALT-NEW-${Date.now()}`,
        type: 'success',
        title: `Nhật ký bé ${updatedChild.name}`,
        content: `Nhân viên Lê Thị Mai đã cập nhật: "${newLog.summary}"`
      };
      setSystemAlerts(prev => [alertMessage, ...prev]);
    }
  };

  const handleUpdateTasks = (updatedTasks: CareTask[]) => {
    setCareTasks(updatedTasks);
  };

  const handleAddDonation = (newDonation: Donation) => {
    setDonations(prev => [newDonation, ...prev]);
  };

  const handleApproveItem = (id: string, action: 'approve' | 'reject') => {
    const item = pendingItems.find(p => p.id === id);
    setPendingItems(prev => prev.filter(p => p.id !== id));
    
    if (item) {
      const alertType = action === 'approve' ? 'success' : 'error';
      const statusText = action === 'approve' ? 'ĐÃ DUYỆT BAN HÀNH' : 'ĐÃ BÁC BỎ';
      
      const newAlert: SystemAlert = {
        id: `ALT-APR-${Date.now()}`,
        type: alertType,
        title: `${statusText}: ${item.title}`,
        content: `Mã hồ sơ ${item.id} được Giám đốc ký quyết định trực tiếp vào hệ thống.`
      };
      setSystemAlerts(prev => [newAlert, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      
      {/* Upper Space Portal Swapping Console */}
      <div className="bg-slate-950 border-b border-indigo-900/50 py-3 px-6 sticky top-0 z-50 text-slate-300 shadow-xl shadow-slate-950/20">
        <div className="max-w-[1440px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
          {/* Logo Status & Portal Selector description */}
          <div className="flex items-center gap-3 justify-center xl:justify-start">
            <div className="p-2 bg-blue-600/15 rounded-lg border border-blue-500/30">
              <Sliders className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                HOPE CENTER <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black font-mono">BỘ ĐIỀU HỢP CỔNG PHÂN QUYỀN</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Bấm chuyển đổi nhanh giữa 3 không gian độc lập để trải nghiệm thiết kế:</p>
            </div>
          </div>

          {/* Three Portals Selector Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 flex-grow max-w-4xl">
            
            {/* PORTAL CODE A: CLIENT SIDE (Khách vãng lai / Đăng lý nuôi) */}
            <div className="bg-slate-900/80 border border-pink-500/20 rounded-xl p-2 flex flex-col justify-between hover:border-pink-500/40 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-pink-400 tracking-wider uppercase font-mono">🌐 1. CLIENT PORTAL (KHÁCH)</span>
                <span className="text-[8px] bg-pink-950 text-pink-400 px-1 rounded font-bold">Vãng lai & Chăm sóc</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => selectDemoScreen('public', 'public_home')}
                  className={`flex-1 py-1 px-2 rounded text-[10px] font-bold text-center cursor-pointer transition-all ${
                    activeScreen === 'public_home' && role === 'public'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => selectDemoScreen('public', 'adoption_register')}
                  className={`flex-1 py-1 px-2 rounded text-[10px] font-bold text-center cursor-pointer transition-all ${
                    activeScreen === 'adoption_register'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Đăng ký Nuôi dưỡng
                </button>
              </div>
            </div>

            {/* PORTAL CODE B: MANAGEMENT SIDE (Dành cho người Quản lý / Nhân viên) */}
            <div className="bg-slate-900/80 border border-blue-500/20 rounded-xl p-2 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-blue-400 tracking-wider uppercase font-mono">🛠️ 2. PORTAL QUẢN LÝ (STAFF)</span>
                <span className="text-[8px] bg-blue-950 text-blue-400 px-1 rounded font-bold">Thực thi nghiệp vụ</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => selectDemoScreen('staff', 'staff_dashboard')}
                  className={`flex-1 py-1 px-1.5 rounded text-[10px] font-bold text-center cursor-pointer transition-all ${
                    activeScreen === 'staff_dashboard' && role === 'staff'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-850 bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Bảng trực nhân viên
                </button>
                <button
                  onClick={() => selectDemoScreen('staff', 'child_update')}
                  className={`flex-1 py-1 px-1.5 rounded text-[10px] font-bold text-center cursor-pointer transition-all ${
                    activeScreen === 'child_update' && role === 'staff'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-850 bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Đăng bệnh trạng
                </button>
                <button
                  onClick={() => selectDemoScreen('staff', 'care_plan')}
                  className={`flex-1 py-1 px-1.5 rounded text-[10px] font-bold text-center cursor-pointer transition-all ${
                    activeScreen === 'care_plan' && role === 'staff'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-850 bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Nhiệm vụ
                </button>
                <button
                  onClick={() => selectDemoScreen('staff', 'warehouse')}
                  className={`flex-1 py-1 px-1.5 rounded text-[10px] font-bold text-center cursor-pointer transition-all ${
                    activeScreen === 'warehouse' && role === 'staff'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-850 bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Kho hàng
                </button>
              </div>
            </div>

            {/* PORTAL CODE C: EXECUTIVE SIDE (Dành cho Giám đốc điều hành) */}
            <div className="bg-slate-900/80 border border-indigo-500/20 rounded-xl p-2 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-indigo-400 tracking-wider uppercase font-mono">👑 3. PORTAL GIÁM ĐỐC (DIRECTOR)</span>
                <span className="text-[8px] bg-indigo-950 text-indigo-400 px-1 rounded font-bold">Thượng tầng duyệt</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => selectDemoScreen('director', 'director_dashboard')}
                  className={`flex-grow py-1 px-2 rounded text-[10px] font-bold text-center cursor-pointer transition-all ${
                    activeScreen === 'director_dashboard' && role === 'director'
                      ? 'bg-indigo-600 text-white shadow-xs animate-bounce-short'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Trang Giám Đốc Phê Duyệt Hồ Sơ
                </button>
              </div>
            </div>

          </div>

          {/* Quick Gate Link to Login portal */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => selectDemoScreen('login', 'login')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                role === 'login'
                  ? 'bg-white text-slate-950 shadow-md font-black'
                  : 'bg-slate-800 hover:bg-slate-750 hover:bg-slate-705 border border-slate-700 text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Cổng Đăng Nhập
            </button>
          </div>

        </div>
      </div>

      {/* Main Layout Container */}
      <div className="flex">
        
        {/* Navigation Sidebar (For internal dashboards) */}
        <Sidebar 
          activeScreen={activeScreen} 
          setActiveScreen={setActiveScreen} 
          role={role} 
          setRole={setRole} 
        />

        {/* Content canvas matching role context */}
        <div className={`flex-grow min-h-screen transition-all duration-300 ${
          role === 'public' || role === 'login' ? 'pl-0' : 'pl-0 md:pl-[260px]'
        }`}>
          
          <div className={`${role === 'public' || role === 'login' ? 'p-0' : 'p-6 md:p-10 max-w-7xl mx-auto'}`}>
            
            {/* Screen 1: Staff Dashboard */}
            {activeScreen === 'staff_dashboard' && role === 'staff' && (
              <StaffDashboard 
                childrenList={childrenList}
                careTasks={careTasks}
                onSelectChild={(child) => {
                  setSelectedChild(child);
                  setActiveScreen('child_update');
                }}
                onSelectCarePlan={() => setActiveScreen('care_plan')}
              />
            )}

            {/* Screen 2: Child Health/Diary Updates */}
            {activeScreen === 'child_update' && (
              <ChildUpdateModal 
                child={selectedChild}
                initialLogs={INITIAL_LOGS}
                onSave={handleSaveChild}
                onClose={() => setActiveScreen(role === 'director' ? 'director_dashboard' : 'staff_dashboard')}
              />
            )}

            {/* Screen 3: Action care plans checklist */}
            {activeScreen === 'care_plan' && (
              <CarePlanExecution 
                careTasks={careTasks}
                onUpdateTasks={handleUpdateTasks}
              />
            )}

            {/* Screen 4: Public home portal */}
            {activeScreen === 'public_home' && role === 'public' && (
              <PublicHome 
                onNavigate={setActiveScreen}
                setRole={setRole}
              />
            )}

            {/* Screen 5: Multi-step adoption register form */}
            {activeScreen === 'adoption_register' && (
              <AdoptionForm 
                onNavigate={setActiveScreen}
              />
            )}

            {/* Screen 6: Director Overview Approval board */}
            {activeScreen === 'director_dashboard' && role === 'director' && (
              <DirectorDashboard 
                pendingItems={pendingItems}
                systemAlerts={systemAlerts}
                onApproveItem={handleApproveItem}
                onAddAlert={(alert) => setSystemAlerts(prev => [alert, ...prev])}
              />
            )}

            {/* Screen 7: Resources, store, donations */}
            {activeScreen === 'warehouse' && (
              <SponsorshipWarehouse 
                donations={donations}
                onAddDonation={handleAddDonation}
              />
            )}

            {/* Screen 8: Login form splitter page */}
            {activeScreen === 'login' && (
              <LoginScreen 
                onLogin={(chosenRole, chosenScreen) => {
                  setRole(chosenRole);
                  setActiveScreen(chosenScreen);
                }}
              />
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
