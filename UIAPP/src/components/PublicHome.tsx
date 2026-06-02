import { 
  Heart, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Baby, 
  Users, 
  Smile, 
  HelpCircle,
  Menu
} from 'lucide-react';
import { Screen, Role } from '../types';

interface PublicHomeProps {
  onNavigate: (screen: Screen) => void;
  setRole: (role: Role) => void;
}

export default function PublicHome({ onNavigate, setRole }: PublicHomeProps) {
  return (
    <div className="bg-slate-50 text-slate-800 antialiased font-sans min-h-screen flex flex-col pt-[70px]">
      
      {/* TopNavBar */}
      <nav className="bg-white/95 backdrop-blur-md fixed top-0 w-full z-50 border-b border-slate-200/60 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center h-[70px] px-6 lg:px-12 max-w-[1440px] mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Heart className="text-rose-500 fill-current w-8 h-8" />
            <span className="text-xl font-bold text-rose-500 font-sans tracking-tight">Hope Center</span>
          </div>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-semibold text-rose-500 border-b-2 border-rose-500 pb-1" onClick={(e) => e.preventDefault()}>Trang chủ</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-rose-500 transition-colors" onClick={(e) => { e.preventDefault(); onNavigate('adoption_register') }}>Đăng ký thử</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-rose-500 transition-colors" onClick={(e) => { e.preventDefault(); setRole('staff'); onNavigate('staff_dashboard') }}>Cổng Nghiệp Vụ</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-rose-500 transition-colors" onClick={(e) => { e.preventDefault(); setRole('director'); onNavigate('director_dashboard') }}>Cổng Giám Đốc</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setRole('login');
                onNavigate('login');
              }}
              className="hidden lg:block text-sm font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-full transition-colors border border-rose-200/50 cursor-pointer"
            >
              Đăng nhập
            </button>
            <button 
              onClick={() => onNavigate('adoption_register')}
              className="text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-full transition-all shadow-[0_4px_12px_rgba(244,63,94,0.3)] hover:shadow-[0_6px_16px_rgba(244,63,94,0.4)] hover:-translate-y-0.5 cursor-pointer"
            >
              Đăng ký nhận nuôi
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[580px] md:min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent z-10"></div>
          <img 
            alt="Hope Center Hero" 
            className="w-full h-full object-cover object-center"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvO93oInGVqp4KyOXvTlgqYVOLD4vPmlVBBgfhh1DWZ15ut2BadGEo0U4kjZuC-P7GR0teRLqmmfwZWlZkizzOtAH2HbNIMcilEpsASRbLbyYanDl7bIpSa10BQ9l1f5kERfAqcJtNqCHRYC_llR6FqcyPHYu9KOU80OVJBpFlox2ryxH7eqqHCFcrAJF6_ybB95XSalFsFu-n8KBSQHzlkjBuuqQtsg4E0jmmGK40_7xXdmo6dDTGs4NTzdIZ9SYpYrTO-6la8q0"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="container mx-auto px-6 lg:px-12 z-20 max-w-[1200px] relative">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-sm border border-rose-100 mb-6 font-semibold">
              <Sparkles className="w-4 h-4 text-rose-500 fill-current" />
              <span className="text-xs text-rose-500 uppercase tracking-wider">Hành trình tìm mái ấm</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight font-sans">
              Trao Yêu Thương, <br />
              <span className="text-rose-500 shadow-rose-200">Nhận Nụ Cười</span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
              Mỗi đứa trẻ đều xứng đáng có một gia đình hạnh phúc. Tại Hope Center, chúng tôi kết nối những trái tim nhân ái với những mảnh đời nhỏ bé đang chờ đợi một phép màu kì diệu.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onNavigate('adoption_register')}
                className="font-semibold text-sm bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-full transition-all shadow-[0_4px_12px_rgba(244,63,94,0.3)] hover:shadow-[0_8px_20px_rgba(244,63,94,0.4)] hover:-translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
              >
                Bắt đầu hành trình
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  setRole('staff');
                  onNavigate('staff_dashboard');
                }}
                className="font-semibold text-sm bg-white text-slate-800 hover:bg-slate-50 px-8 py-4 rounded-full transition-all shadow-sm border border-slate-200 hover:-translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
              >
                Cổng quản trị viên
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative Element */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-slate-100 to-transparent z-10"></div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-100 relative z-20 -mt-8">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1200px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Stat Card 1 */}
            <div className="bg-white/85 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-4 right-4 p-3 bg-rose-50 rounded-full text-rose-500 group-hover:scale-110 transition-transform">
                <Baby className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trẻ em đã tìm được nhà</p>
              <p className="text-3xl font-bold text-rose-500 mb-1">1,245<span className="text-xl">+</span></p>
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Tăng 12% so với năm ngoái
              </p>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white/85 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-4 right-4 p-3 bg-amber-50 rounded-full text-amber-500 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tình nguyện viên tích cực</p>
              <p className="text-3xl font-bold text-slate-800 mb-1">850<span className="text-xl">+</span></p>
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Tham gia trên toàn quốc
              </p>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white/85 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-4 right-4 p-3 bg-emerald-50 rounded-full text-emerald-500 group-hover:scale-110 transition-transform">
                <Smile className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tỷ lệ hồ sơ thành công</p>
              <p className="text-3xl font-bold text-slate-800 mb-1">98<span className="text-xl">%</span></p>
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Được hỗ trợ thẩm định nhanh gọn
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Children Waiting Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1200px]">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-slate-900 mb-4 font-sans tracking-tight">Đang Chờ Một Phép Màu</h2>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                Những thiên thần nhỏ hiếu động luôn mong chờ một gia đình ấm áp yêu thương bảo bọc. Vì yếu tố nhân đạo và bảo mật quyền riêng tư, toàn bộ hình ảnh và thông tin của trẻ đã được tinh chỉnh ẩn danh chuẩn hóa.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('adoption_register')}
              className="text-sm font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 group cursor-pointer"
            >
              Xem tất cả hồ sơ
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Child Listing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Child Card 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group border border-slate-200/50">
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img 
                  alt="Bé M.A" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_JceigI6fiVXzbu3mUJvAOuiJafD-CIaiW0ueg-hLXKBG6yVwGA2EHMdbYyh0Whq0XRmvGAj8MoLN-p8M-NuI1aeaytBBbDvMjyJ3P9nS5iWCEa4ncWIpS1GFrlrwE-7YLe4O2kZdYYusJsDup_lSvVVdhrFlNp0ap3rggTwSiVozlobqBPwDAcBd8TZSOWfgp63wWkWUF1cVSaqwDSLwqO6MjE-i5s-WMXPj759ynnBf6Uk14wUcmIIg6Dfnz_m77exLrjC18NM"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 shadow-sm">
                  <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                    4 tuổi
                  </span>
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-slate-800">Bé M.A</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600">Nữ</span>
                </div>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                  Một cô bé nhút nhát nhưng rất thích vẽ tranh sáp màu. Thường dành thời gian rảnh để tô màu những bức tranh tĩnh vật phong cảnh rực rỡ màu sắc.
                </p>
                <button 
                  onClick={() => onNavigate('adoption_register')}
                  className="mt-auto w-full text-xs font-bold text-rose-500 hover:bg-rose-50 py-2.5 rounded-lg border border-rose-200/50 hover:border-rose-300 transition-colors cursor-pointer"
                >
                  Tìm hiểu thêm
                </button>
              </div>
            </div>

            {/* Child Card 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group border border-slate-200/50">
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img 
                  alt="Bé T.K" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDx888pWQ6QL0UoPMEL_IXhrr95Vs6gMmruXwg05H-LWKyZuJon0rrGTV0rVpdL9Pj6negTsTtzLdiaWMaY9SNDM3mtPJ6kjrkyDO8HKDRlx36iNX4CoHwFlmPeUJLBIz0IIe8v62SiPdW_dtdO6CMw-LYkBf9brCS0myQAEmnL9jhC_nw0_XDI830BLLo3flAra92nIWk8s85v_YbkvNcK4-_EEhVdIx4vCoqgVxbGtseLrl7WC0570SXf6EA7_OkVQ5E1gZba9M"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 shadow-sm">
                  <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                    6 tuổi
                  </span>
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-slate-800">Bé T.K</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Nam</span>
                </div>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                  Một cậu bé hiếu động, đam mê thể thao và đá cầu bóng đá, sở hữu nguồn năng lượng cực kỳ tích cực sẵn lòng gắn kết mọi người.
                </p>
                <button 
                  onClick={() => onNavigate('adoption_register')}
                  className="mt-auto w-full text-xs font-bold text-rose-500 hover:bg-rose-50 py-2.5 rounded-lg border border-rose-200/50 hover:border-rose-300 transition-colors cursor-pointer"
                >
                  Tìm hiểu thêm
                </button>
              </div>
            </div>

            {/* Child Card 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group border border-slate-200/50">
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img 
                  alt="Bé H.N" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmNr-hJJw_xTvZpDy3jV8jCUz2r6z6FvbdOwoNazCYipuzBvHU9W8OyIS3RivoDf9c5msui2WrRD4TBVYmMpQiQcl7Xf8Vx_28zEaO14cM4Q801UvHXVT_MPbG1F4Qca-cLbfU5wRTAYWqCQNwoFXcYu2SEsOvvztZYc2GNUKcem867wj-ci0lA4DdGC3OwcrMYOwmfyueYGnZmXd99Ptunyr3jmfJ5mlxsEfUs_KTk4Ndc_Scz_i5UzEk20SnxbB4yHfPZ0kAdvw"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 shadow-sm">
                  <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                    2 tuổi
                  </span>
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-slate-800">Bé H.N</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600">Nữ</span>
                </div>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                  Bé gái cực kỳ lễ phép, ngoan ngoãn lắng nghe kể chuyện cổ tích trước khi ngủ. Thân thiện và rất dễ bế bồng.
                </p>
                <button 
                  onClick={() => onNavigate('adoption_register')}
                  className="mt-auto w-full text-xs font-bold text-rose-500 hover:bg-rose-50 py-2.5 rounded-lg border border-rose-200/50 hover:border-rose-300 transition-colors cursor-pointer"
                >
                  Tìm hiểu thêm
                </button>
              </div>
            </div>

            {/* Child Card 4 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group border border-slate-200/50">
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img 
                  alt="Cặp Bảo &amp; Ngọc" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAquVUCa3L6cwfmweq7EVVK_RXi96wASyOshWKvPpYGaBqMsObj9zxr0hBwt3V0EeKdIplgkv25mLK_S3RSP9_G1Az_8O5pVe1Ll3KOb9uIiLWFQPvHuMvktGAZSclpQ7E4jYV_PcfniJsqI-5nObt_nuUpK2w41XYEdaCKfzocLPb04qz73RpGAyhAT8a8ZBpgpLAEQYMh2812w4NjbT_BjBBMAO0t1exwIJyI3B7nydcnKGTm3ybiK1uiECmVIiIId0xiiv7JXMc"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 shadow-sm">
                  <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                    Cặp anh em
                  </span>
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-slate-800">Bảo &amp; Ngọc</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">Anh em</span>
                </div>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                  Hai anh em mồ côi quấn quýt bên nhau không muốn chia cách rời. Người anh chững chạc luôn chủ động chăm lo bảo vệ em gái nhỏ.
                </p>
                <button 
                  onClick={() => onNavigate('adoption_register')}
                  className="mt-auto w-full text-xs font-bold text-rose-500 hover:bg-rose-50 py-2.5 rounded-lg border border-rose-200/50 hover:border-rose-300 transition-colors cursor-pointer"
                >
                  Tìm hiểu thêm
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 w-full py-12 border-t border-slate-800 mt-auto">
        <div className="container mx-auto max-w-[1200px] flex flex-col items-center justify-center gap-6 px-4">
          <div className="flex items-center gap-2 text-white text-lg font-bold">
            <Heart className="text-rose-500 fill-current w-5 h-5" />
            <span>Hope Center</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-xs text-slate-400">
            <a href="#" className="hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>Điều khoản sử dụng</a>
            <a href="#" className="hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>Chính sách bảo mật</a>
            <a href="#" className="hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>Liên hệ hỗ trợ</a>
            <a href="#" className="hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>Câu hỏi thường gặp</a>
          </div>
          <div className="text-[11px] text-slate-500 text-center mt-4 font-mono">
            © 2026 Hope Center - Hệ thống Quản lý Bảo trợ Trẻ em. All rights reserved. Built with love &amp; care.
          </div>
        </div>
      </footer>

    </div>
  );
}
