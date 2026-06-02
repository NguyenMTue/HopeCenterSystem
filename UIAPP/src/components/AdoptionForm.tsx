import { useState } from 'react';
import { 
  User, 
  Home, 
  FolderOpen, 
  ShieldAlert, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Upload, 
  BadgeCheck, 
  Heart,
  Briefcase,
  DollarSign,
  HeartHandshake
} from 'lucide-react';
import { Screen } from '../types';

interface AdoptionFormProps {
  onNavigate: (screen: Screen) => void;
}

export default function AdoptionForm({ onNavigate }: AdoptionFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formState, setFormState] = useState({
    fullName: '',
    phone: '',
    email: '',
    maritalStatus: '',
    address: '',
    occupation: '',
    incomeScope: '',
    homeDesc: '',
    doc1Uploaded: false,
    doc2Uploaded: false,
    doc3Uploaded: false,
    agreed: false
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const totalSteps = 4;

  const handleNext = () => {
    // Validate simple required inputs for step 1
    if (currentStep === 1) {
      if (!formState.fullName || !formState.phone || !formState.maritalStatus || !formState.address) {
        alert('Vui lòng điền đầy đủ các thông tin bắt buộc có dấu (*)');
        return;
      }
    }
    // Validate inputs for step 2
    if (currentStep === 2) {
      if (!formState.occupation || !formState.incomeScope || !formState.homeDesc) {
        alert('Vui lòng hoàn thành thông tin điều kiện khảo sát hằng mùa (*)');
        return;
      }
    }
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!formState.agreed) {
      alert('Vui lòng đồng ý với các chính sách và quy trình thẩm định để tiếp tục');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
    }, 2000);
  };

  const handleFileUpload = (docName: 'doc1Uploaded' | 'doc2Uploaded' | 'doc3Uploaded') => {
    setFormState(prev => ({ ...prev, [docName]: true }));
    alert('Tải lên tệp tài liệu thành công!');
  };

  // Stepper icon utility
  const renderStepIcon = (step: number) => {
    const isCompleted = step < currentStep;
    const isActive = step === currentStep;

    if (isCompleted) {
      return <Check className="w-5 h-5 text-emerald-600" />;
    }

    switch (step) {
      case 1: return <User className="w-5 h-5" />;
      case 2: return <Home className="w-5 h-5" />;
      case 3: return <FolderOpen className="w-5 h-5" />;
      case 4: return <BadgeCheck className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans antialiased pt-[70px] pb-12">
      
      {/* Minimal Header */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 h-[70px] flex justify-between items-center px-6 lg:px-12 mx-auto">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('public_home')}>
          <Heart className="text-rose-500 fill-current w-6 h-6" />
          <span className="text-lg font-bold text-rose-500 font-sans">Hope Center</span>
        </div>
        <button 
          onClick={() => onNavigate('public_home')}
          className="text-slate-500 hover:text-rose-500 transition-colors flex items-center gap-1.5 font-medium text-sm cursor-pointer"
        >
          Trở lại trang chủ
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight font-sans">Đăng ký nhận nuôi trực tuyến</h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
            Cảm ơn bạn đã mở rộng tấm lòng từ ái đón mừng thành viên nhỏ mới. Vui lòng hoàn tất biểu mẫu bốn chương trình dưới đây để khởi động tiến trình thẩm định pháp lý có hệ thống.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200/60 overflow-hidden relative">
          
          {/* Progress Indicator Top Bar */}
          {!isSuccess && !loading && (
            <div className="w-full h-1.5 bg-slate-100 absolute top-0 left-0">
              <div 
                className="h-full bg-rose-500 transition-all duration-500 ease-out" 
                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
              ></div>
            </div>
          )}

          <div className="p-8 md:p-12">
            
            {/* Stepper visual navigation */}
            {!isSuccess && !loading && (
              <nav className="mb-10 relative">
                {/* Connector Line behind pins */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-10 hidden md:block"></div>
                <div 
                  className="absolute top-5 left-0 h-0.5 bg-rose-500 -z-10 hidden md:block transition-all duration-500" 
                  style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                ></div>

                <ul className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 md:gap-0">
                  {[
                    { s: 1, label: 'Bước 1', title: 'Thông tin cá nhân' },
                    { s: 2, label: 'Bước 2', title: 'Điều kiện sống' },
                    { s: 3, label: 'Bước 3', title: 'Hồ sơ pháp lý' },
                    { s: 4, label: 'Bước 4', title: 'Xác nhận' }
                  ].map(step => (
                    <li 
                      key={step.s}
                      onClick={() => {
                        if (step.s < currentStep) setCurrentStep(step.s);
                      }}
                      className="flex md:flex-col items-center gap-3 relative z-10 w-full md:w-1/4 cursor-pointer group"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        step.s < currentStep 
                          ? 'bg-rose-50 text-rose-500 border border-rose-200' 
                          : step.s === currentStep 
                            ? 'bg-rose-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)]' 
                            : 'bg-slate-100 text-slate-400'
                      }`}>
                        {renderStepIcon(step.s)}
                      </div>
                      <div className="flex flex-col md:items-center text-left md:text-center">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          step.s <= currentStep ? 'text-rose-500' : 'text-slate-400'
                        }`}>{step.label}</span>
                        <span className={`text-xs ${
                          step.s <= currentStep ? 'text-slate-800 font-semibold' : 'text-slate-400'
                        }`}>{step.title}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* Simulated Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 animate-pulse">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-bold text-slate-800">Đang khởi tạo mã hóa &amp; kiểm tra hồ sơ...</h3>
                <p className="text-slate-400 text-xs mt-2">Vui lòng không đóng trình duyệt web</p>
              </div>
            )}

            {/* Success Screen */}
            {isSuccess && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 border border-emerald-100">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Gửi hồ sơ thành công!</h2>
                <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed mb-8">
                  Chào mừng tấm lòng vàng của bạn! Hệ thống Hope Center đã ghi nhận hồ sơ của bạn với mã khóa <strong className="text-slate-900">HC-2026-8921</strong>. Nhân viên nghiệp vụ tư pháp sẽ liên lạc thẩm định từ 3-5 ngày làm việc.
                </p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => {
                      // reset
                      setIsSuccess(false);
                      setCurrentStep(1);
                      setFormState({
                        fullName: '',
                        phone: '',
                        email: '',
                        maritalStatus: '',
                        address: '',
                        occupation: '',
                        incomeScope: '',
                        homeDesc: '',
                        doc1Uploaded: false,
                        doc2Uploaded: false,
                        doc3Uploaded: false,
                        agreed: false
                      });
                      onNavigate('public_home');
                    }}
                    className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-semibold text-sm transition-all shadow-md cursor-pointer"
                  >
                    Về trang chủ
                  </button>
                </div>
              </div>
            )}

            {/* Main Form Fields */}
            {!loading && !isSuccess && (
              <div className="min-h-[300px]">
                
                {/* STEP 1: Personal Info */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Chi tiết thông tin cá nhân &amp; Gia đình</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Họ và tên người đại diện *</label>
                        <input 
                          type="text" 
                          value={formState.fullName}
                          onChange={(e) => setFormState(p => ({ ...p, fullName: e.target.value }))}
                          placeholder="Nhập đầy đủ tên theo CCCD"
                          className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/10 outline-none transition-all text-sm text-slate-800 font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Số điện thoại *</label>
                        <input 
                          type="tel" 
                          value={formState.phone}
                          onChange={(e) => setFormState(p => ({ ...p, phone: e.target.value }))}
                          placeholder="Nhập số điện thoại di động"
                          className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/10 outline-none transition-all text-sm text-slate-800 font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Email liên lạc</label>
                        <input 
                          type="email" 
                          value={formState.email}
                          onChange={(e) => setFormState(p => ({ ...p, email: e.target.value }))}
                          placeholder="email@example.com"
                          className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/10 outline-none transition-all text-sm text-slate-800 font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Tình trạng hôn nhân *</label>
                        <select 
                          value={formState.maritalStatus}
                          onChange={(e) => setFormState(p => ({ ...p, maritalStatus: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/10 outline-none transition-all text-sm text-slate-800 font-medium cursor-pointer"
                        >
                          <option value="">Chọn tình trạng hôn nhân</option>
                          <option value="single">Độc thân</option>
                          <option value="married">Đã kết hôn</option>
                          <option value="divorced">Ly hôn</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Địa chỉ thường trú liên hệ *</label>
                        <input 
                          type="text" 
                          value={formState.address}
                          onChange={(e) => setFormState(p => ({ ...p, address: e.target.value }))}
                          placeholder="Số nhà, tên đường, phường xã, quận huyện, tỉnh thành..."
                          className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/10 outline-none transition-all text-sm text-slate-800 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Living conditions */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Khảo sát điều kiện tài chính &amp; Môi trường nuôi dưỡng</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Nghề nghiệp chính của người giám hộ *</label>
                        <input 
                          type="text" 
                          value={formState.occupation}
                          onChange={(e) => setFormState(p => ({ ...p, occupation: e.target.value }))}
                          placeholder="Kinh doanh tự do, Nhân viên văn phòng..."
                          className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-rose-500 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Thu nhập bình quân hàng tháng *</label>
                        <select 
                          value={formState.incomeScope}
                          onChange={(e) => setFormState(p => ({ ...p, incomeScope: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-rose-500 focus:bg-white cursor-pointer"
                        >
                          <option value="">Chọn mức thu nhập bình quân</option>
                          <option value="1">Dưới 15 Triệu VNĐ</option>
                          <option value="2">Từ 15 đến 30 Triệu VNĐ</option>
                          <option value="3">Từ 30 đến 50 Triệu VNĐ</option>
                          <option value="4">Trên 50 Triệu VNĐ</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Mục tiêu &amp; Mô tả chi tiết không gian sống *</label>
                        <textarea 
                          value={formState.homeDesc}
                          onChange={(e) => setFormState(p => ({ ...p, homeDesc: e.target.value }))}
                          placeholder="Chia sẻ cấu trúc phòng ngủ riêng, sân vận động hoặc không gian quanh nhà nhằm phục vụ hoạt động vui chơi của trẻ..."
                          className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-rose-500 focus:bg-white outline-none transition-all text-sm leading-relaxed min-h-[120px] resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Document Attachments */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="text-lg font-bold text-slate-800">Cập nhật hồ sơ &amp; Giấy tờ đính kèm</h2>
                      <p className="text-xs text-slate-400 mt-1">Đính kèm các bản sao pháp lý chứng thực (Tối đa 5MB mỗi tệp, định dạng PDF/JPG/PNG).</p>
                    </div>

                    <div className="space-y-4">
                      {/* Doc 1 */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 hover:border-rose-500/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            formState.doc1Uploaded ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                          }`}>
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">1. Căn cước công dân (CCCD) *</p>
                            <p className="text-xs text-slate-400">Yêu cầu ảnh chụp chính diện 2 mặt, rõ số</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleFileUpload('doc1Uploaded')}
                          className={`px-4 py-2 text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer ${
                            formState.doc1Uploaded
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {formState.doc1Uploaded ? 'Đã tải lên' : 'Tải lên'}
                        </button>
                      </div>

                      {/* Doc 2 */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 hover:border-rose-500/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            formState.doc2Uploaded ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                          }`}>
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">2. Giấy tờ xác nhận thu nhập *</p>
                            <p className="text-xs text-slate-400">Hợp đồng lao động, bảng xác nhận lương 3 tháng</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleFileUpload('doc2Uploaded')}
                          className={`px-4 py-2 text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer ${
                            formState.doc2Uploaded
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {formState.doc2Uploaded ? 'Đã tải lên' : 'Tải lên'}
                        </button>
                      </div>

                      {/* Doc 3 */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 hover:border-rose-500/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            formState.doc3Uploaded ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                          }`}>
                            <HeartHandshake className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">3. Lý lịch tư pháp xác thực *</p>
                            <p className="text-xs text-slate-400">Phiếu lý lịch tư pháp số 1 cấp tối đa 6 tháng quay lại</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleFileUpload('doc3Uploaded')}
                          className={`px-4 py-2 text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer ${
                            formState.doc3Uploaded
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {formState.doc3Uploaded ? 'Đã tải lên' : 'Tải lên'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Legal confirmation terms */}
                {currentStep === 4 && (
                  <div className="space-y-6 text-center max-w-lg mx-auto py-4">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 border border-rose-100">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Xác thực cam kết trách nhiệm</h2>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">
                      Tôi trân trọng cam đoan toàn bộ tư liệu, thông tin hằng ngày khai báo trên đây hoàn toàn đúng sự thật khách quan. Hope Center có toàn quyền xác thực với cơ quan hành chính địa phương theo hiến pháp Việt Nam.
                    </p>

                    <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer text-left">
                      <input 
                        type="checkbox" 
                        checked={formState.agreed}
                        onChange={(e) => setFormState(p => ({ ...p, agreed: e.target.checked }))}
                        className="mt-1 w-5 h-5 text-rose-500 border-slate-300 rounded focus:ring-rose-500" 
                      />
                      <span className="text-xs text-slate-600 leading-relaxed font-medium">
                        Tôi xác nhận đã đọc, hiểu thấu và tự nguyện tuân chủ tuyệt đối với <a href="#" className="text-rose-500 hover:underline inline font-bold" onClick={e => e.preventDefault()}>Chính sách pháp lý bảo bọc trẻ em</a> và <a href="#" className="text-rose-500 hover:underline inline font-bold" onClick={e => e.preventDefault()}>Quy trình thẩm định hộ gia đình</a>.
                      </span>
                    </label>
                  </div>
                )}

              </div>
            )}

            {/* Stepper Footer actions */}
            {!loading && !isSuccess && (
              <div className="mt-8 pt-6 border-t border-slate-200/60 flex justify-between items-center">
                <button 
                  type="button"
                  onClick={handlePrev}
                  className={`px-6 py-3 rounded-full font-bold text-sm border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    currentStep === 1 ? 'opacity-0 pointer-events-none' : ''
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại
                </button>

                {currentStep < totalSteps ? (
                  <button 
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold text-sm shadow-[0_4px_12px_rgba(244,63,94,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Tiếp tục
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-sm shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Gửi hồ sơ đăng ký
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

          </div>

        </div>
      </main>

    </div>
  );
}
