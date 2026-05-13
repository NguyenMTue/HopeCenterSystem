import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', minHeight: 'calc(100vh - 80px)' }}>
      {/* ================= TOÀN BỘ CSS GỐC CỦA BẠN ================= */}
      <style>{`
        :root {
            --primary: #f43f5e;
            --primary-hover: #e11d48;
            --secondary: #0ea5e9;
            --secondary-hover: #0284c7;
            --bg-light: #f8fafc;
            --bg-white: #ffffff;
            --text-dark: #0f172a;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --success: #10b981;
            --warning: #f59e0b;
            --font-heading: 'Quicksand', sans-serif;
            --font-body: 'Nunito', sans-serif;
        }

        h1, h2, h3, h4 { font-family: var(--font-heading); color: var(--text-dark); }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        /* Buttons */
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 24px; border-radius: 50px; font-weight: 700; cursor: pointer; border: none; font-size: 16px; transition: all 0.3s; }
        .btn-primary { background-color: var(--primary); color: white; box-shadow: 0 4px 15px rgba(244, 63, 94, 0.3); }
        .btn-primary:hover { background-color: var(--primary-hover); transform: translateY(-2px); }
        .btn-secondary { background-color: var(--secondary); color: white; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3); }
        .btn-secondary:hover { background-color: var(--secondary-hover); transform: translateY(-2px); }

        /* Hero */
        .hero { display: flex; align-items: center; gap: 50px; margin-bottom: 60px; padding-top: 50px; }
        .hero-text { flex: 1; }
        .hero-text h1 { font-size: 48px; line-height: 1.2; margin-bottom: 20px; color: var(--text-dark); }
        .hero-text h1 span { color: var(--primary); }
        .hero-text p { font-size: 18px; color: var(--text-muted); margin-bottom: 30px; line-height: 1.8; }
        .hero-img { flex: 1; }
        .hero-img img { width: 100%; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        
        /* Stats */
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 60px; }
        .stat-box { background: var(--bg-white); padding: 30px; border-radius: 16px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid var(--border); transition: 0.3s; }
        .stat-box:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .stat-box i { font-size: 40px; color: var(--secondary); margin-bottom: 15px; }
        .stat-box h3 { font-size: 36px; color: var(--primary); margin-bottom: 5px; }
        .stat-box p { color: var(--text-muted); font-weight: 600; }

        .section-header { text-align: center; margin-bottom: 40px; }
        .section-header h2 { font-size: 36px; margin-bottom: 10px; color: var(--text-dark); }
        .section-header p { color: var(--text-muted); font-size: 18px; max-width: 700px; margin: 0 auto; line-height: 1.6; }

        /* Impact */
        .impact-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 80px; }
        .impact-card { background: var(--bg-white); padding: 35px 25px; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 15px rgba(0,0,0,0.03); text-align: center; transition: 0.3s; }
        .impact-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .impact-card .icon-wrapper { width: 70px; height: 70px; background: rgba(244, 63, 94, 0.1); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 20px; }
        .impact-card h3 { font-size: 22px; margin-bottom: 15px; }
        .impact-card p { color: var(--text-muted); font-size: 15px; }

        /* News */
        .news-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 50px; }
        .news-card { background: var(--bg-white); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid var(--border); transition: 0.3s; }
        .news-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .news-img { height: 200px; background: #e2e8f0; }
        .news-img img { width: 100%; height: 100%; object-fit: cover; }
        .news-content { padding: 25px; }
        .news-date { font-size: 13px; color: var(--secondary); font-weight: 700; margin-bottom: 10px; display: block; }
        .news-title { font-size: 18px; font-weight: 700; margin-bottom: 15px; line-height: 1.4; color: var(--text-dark); }
        .news-excerpt { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      {/* ================= CẤU TRÚC HTML GỐC ================= */}
      <div className="container">
          
          {/* Hero Section */}
          <div className="hero">
              <div className="hero-text">
                  <h1>Mỗi em nhỏ đều xứng đáng có một <span>Mái ấm gia đình</span></h1>
                  <p>Trung tâm Bảo trợ Xã hội Hope Center hiện đang là mái nhà yêu thương che chở, nuôi dưỡng và giáo dục cho hơn 145 trẻ em mồ côi, trẻ bị bỏ rơi và có hoàn cảnh đặc biệt khó khăn. Chúng tôi tin rằng, với tình yêu thương và sự chung tay của cộng đồng, mọi đứa trẻ đều có thể vẽ nên một tương lai rạng rỡ.</p>
                  <div style={{ display: 'flex', gap: '15px' }}>
                      <button className="btn btn-primary" onClick={() => navigate('/adoption')}>
                          <i className="fa-solid fa-heart"></i> Đăng ký nhận nuôi
                      </button>
                      <button className="btn btn-secondary" onClick={() => navigate('/donation')}>
                          <i className="fa-solid fa-hand-holding-dollar"></i> Ủng hộ ngay
                      </button>
                  </div>
              </div>
              <div className="hero-img">
                  <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Trẻ em mỉm cười" />
              </div>
          </div>

          {/* Stats Section */}
          <div className="stats-grid">
              <div className="stat-box">
                  <i className="fa-solid fa-children"></i>
                  <h3>145+</h3>
                  <p>Trẻ em đang được nuôi dưỡng</p>
              </div>
              <div className="stat-box">
                  <i className="fa-solid fa-house-chimney-user"></i>
                  <h3>320+</h3>
                  <p>Bé đã tìm được gia đình mới</p>
              </div>
              <div className="stat-box">
                  <i className="fa-solid fa-hand-holding-heart"></i>
                  <h3>15,000+</h3>
                  <p>Lượt quyên góp từ cộng đồng</p>
              </div>
          </div>

          {/* Impact Section */}
          <div className="impact-section" style={{ marginTop: '80px' }}>
              <div className="section-header">
                  <h2>Dấu ấn của Tình yêu thương</h2>
                  <p>Mỗi ngày tại Hope Center, nhờ sự hỗ trợ mạnh mẽ của cộng đồng nhà tài trợ và đội ngũ tình nguyện viên, chúng tôi đang tạo ra những thay đổi thiết thực và bền vững nhất.</p>
              </div>
              <div className="impact-grid">
                  <div className="impact-card">
                      <div className="icon-wrapper"><i className="fa-solid fa-book-open-reader"></i></div>
                      <h3>100% Trẻ được đến trường</h3>
                      <p>Các em từ bậc Mầm non đến Trung học Phổ thông đều được đảm bảo quyền lợi học tập. Ngoài ra, trung tâm còn có các lớp học kỹ năng mềm và hướng nghiệp dạy nghề cho trẻ lớn.</p>
                  </div>
                  <div className="impact-card">
                      <div className="icon-wrapper"><i className="fa-solid fa-stethoscope"></i></div>
                      <h3>Chăm sóc y tế toàn diện</h3>
                      <p>Tổ chức khám bệnh định kỳ 6 tháng/lần. Đặc biệt hỗ trợ chi phí phẫu thuật cho các bé mang bệnh bẩm sinh, duy trì chế độ dinh dưỡng phục hồi theo phác đồ của bác sĩ chuyên khoa.</p>
                  </div>
                  <div className="impact-card">
                      <div className="icon-wrapper"><i className="fa-solid fa-people-roof"></i></div>
                      <h3>Kết nối Mái ấm gia đình</h3>
                      <p>Hoàn thiện thủ tục pháp lý chặt chẽ, kết nối thành công hàng trăm em nhỏ với các gia đình nhận nuôi trong và ngoài nước, luôn đồng hành và giám sát kỹ lưỡng trong thời gian đầu.</p>
                  </div>
              </div>
          </div>

          {/* News & Events */}
          <div className="news-section" style={{ marginTop: '80px', marginBottom: '40px' }}>
              <div className="section-header">
                  <h2>Tin tức & Hoạt động nổi bật</h2>
                  <p>Cập nhật những thông tin, sự kiện và hành trình phát triển mới nhất tại Trung tâm.</p>
              </div>
              <div className="news-grid">
                  <div className="news-card">
                      <div className="news-img"><img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="News 1" /></div>
                      <div className="news-content">
                          <span className="news-date">10 Tháng 4, 2026</span>
                          <h3 className="news-title">Tổ chức Lễ hội Trăng Rằm - Trung thu ấm áp cho các em nhỏ</h3>
                          <p className="news-excerpt">Vừa qua, Hope Center đã phối hợp cùng Đoàn Thanh niên tổ chức đêm hội rước đèn, múa lân và trao hơn 200 suất quà Trung thu cho các em, mang lại tiếng cười rộn rã khắp trung tâm...</p>
                          <a href="#" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              Đọc tiếp <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }}></i>
                          </a>
                      </div>
                  </div>
                  <div className="news-card">
                      <div className="news-img"><img src="https://images.unsplash.com/photo-1584820927498-cafe2c1c7669?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="News 2" /></div>
                      <div className="news-content">
                          <span className="news-date">05 Tháng 4, 2026</span>
                          <h3 className="news-title">Phẫu thuật tim thành công cho bé Tuấn (Mã HS: CH-105)</h3>
                          <p className="news-excerpt">Nhờ sự đóng góp quý báu từ "Quỹ Trái Tim Nhân Ái", ca phẫu thuật tim bẩm sinh của bé Tuấn đã diễn ra thành công tốt đẹp. Hiện sức khỏe của bé đang tiến triển rất tích cực...</p>
                          <a href="#" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              Đọc tiếp <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }}></i>
                          </a>
                      </div>
                  </div>
                  <div className="news-card">
                      <div className="news-img"><img src="https://images.unsplash.com/photo-1529390079861-591de354faf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="News 3" /></div>
                      <div className="news-content">
                          <span className="news-date">28 Tháng 3, 2026</span>
                          <h3 className="news-title">Tiếp nhận lô hàng tài trợ vật tư y tế và sữa bột từ công ty ABC</h3>
                          <p className="news-excerpt">Trung tâm xin trân trọng cảm ơn quý công ty TNHH ABC đã trao tặng lô vật tư gồm 500 hộp sữa bột và các trang thiết bị y tế cơ bản, góp phần hỗ trợ công tác chăm sóc sức khỏe cho các em sơ sinh...</p>
                          <a href="#" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              Đọc tiếp <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }}></i>
                          </a>
                      </div>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default HomePage;