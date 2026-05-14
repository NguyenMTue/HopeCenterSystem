import React, { useState } from 'react';

const AdoptionPage: React.FC = () => {
  const [isModalActive, setIsModalActive] = useState(false);

  const openModal = () => setIsModalActive(true);
  const closeModal = () => setIsModalActive(false);

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', paddingBottom: '80px', minHeight: 'calc(100vh - 80px)' }}>
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

        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        .section-header { text-align: center; margin-bottom: 40px; padding-top: 50px; }
        .section-header h2 { font-size: 36px; margin-bottom: 10px; color: var(--text-dark); }
        .section-header p { color: var(--text-muted); font-size: 18px; max-width: 700px; margin: 0 auto; line-height: 1.6; }

        /* Children Grid */
        .children-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
        .child-card { background: var(--bg-white); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: 0.3s; border: 1px solid var(--border); }
        .child-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        
        .child-img { height: 250px; background: #e2e8f0; position: relative; overflow: hidden; }
        .child-img img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
        .child-card:hover .child-img img { transform: scale(1.05); }
        
        .child-badge { position: absolute; top: 15px; right: 15px; background: var(--bg-white); padding: 5px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; color: var(--primary); box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 10; }
        
        .child-info { padding: 25px; }
        .child-info h3 { font-size: 22px; margin-bottom: 10px; font-family: var(--font-heading); }
        
        .child-meta { display: flex; gap: 15px; margin-bottom: 15px; font-size: 14px; color: var(--text-muted); }
        .child-meta span { display: flex; align-items: center; gap: 5px; }
        
        .child-desc { color: var(--text-muted); margin-bottom: 20px; font-size: 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.6; }

        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 24px; border-radius: 50px; font-weight: 700; cursor: pointer; border: none; font-size: 16px; transition: all 0.3s; }
        .btn-outline { background-color: transparent; border: 2px solid var(--primary); color: var(--primary); }
        .btn-outline:hover { background-color: var(--primary); color: white; }
        .btn-secondary { background-color: var(--secondary); color: white; }

        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); display: none; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .modal-overlay.active { display: flex; }
        .modal-content { background: var(--bg-white); width: 600px; max-width: 100%; border-radius: 20px; padding: 40px; position: relative; animation: modalFadeIn 0.3s ease; }
        @keyframes modalFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .modal-close { position: absolute; top: 20px; right: 20px; font-size: 24px; color: var(--text-muted); cursor: pointer; background: none; border: none; transition: 0.3s; }
        .modal-close:hover { color: var(--primary); transform: scale(1.1); }
      `}</style>

      <div className="container">
        <div className="section-header">
          <h2>Cánh cửa tương lai đang chờ đón</h2>
          <p>Theo quy định bảo vệ quyền riêng tư của trẻ em, hệ thống chỉ hiển thị thông tin ẩn danh. Gia đình có nguyện vọng xin vui lòng liên hệ trực tiếp.</p>
        </div>

        <div className="children-grid">
          {/* Bé 1 */}
          <div className="child-card">
            <div className="child-img">
              <span className="child-badge">Bé Trai</span>
              <img src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80" style={{ filter: 'blur(5px) grayscale(50%)' }} alt="Bé Trai ẩn danh" />
            </div>
            <div className="child-info">
              <h3>Mã HS: CH-042</h3>
              <div className="child-meta">
                <span><i className="fa-regular fa-calendar"></i> 5 tuổi (2019)</span>
                <span><i className="fa-solid fa-notes-medical"></i> Khỏe mạnh</span>
              </div>
              <p className="child-desc">Bé trai ngoan ngoãn, thích vẽ tranh và chơi lắp ráp. Cần tìm một gia đình yêu thương để bé có môi trường phát triển tốt nhất.</p>
              <button className="btn btn-outline" style={{ width: '100%', marginTop: '10px' }} onClick={openModal}>Tìm hiểu thủ tục nhận nuôi</button>
            </div>
          </div>

          {/* Bé 2 */}
          <div className="child-card">
            <div className="child-img">
              <span className="child-badge" style={{ color: 'var(--secondary)' }}>Bé Gái</span>
              <img src="https://images.unsplash.com/photo-1522771731470-bea43163c43e?auto=format&fit=crop&w=600&q=80" style={{ filter: 'blur(5px) grayscale(50%)' }} alt="Bé Gái ẩn danh" />
            </div>
            <div className="child-info">
              <h3>Mã HS: CH-088</h3>
              <div className="child-meta">
                <span><i className="fa-regular fa-calendar"></i> 3 tuổi (2021)</span>
                <span><i className="fa-solid fa-notes-medical"></i> Khỏe mạnh</span>
              </div>
              <p className="child-desc">Bé gái hay cười, thích nghe kể chuyện cổ tích. Bé hơi nhút nhát với người lạ nhưng rất tình cảm và quấn người quen.</p>
              <button className="btn btn-outline" style={{ width: '100%', marginTop: '10px' }} onClick={openModal}>Tìm hiểu thủ tục nhận nuôi</button>
            </div>
          </div>

          {/* Bé 3 */}
          <div className="child-card">
            <div className="child-img">
              <span className="child-badge">Bé Trai</span>
              <img src="https://images.unsplash.com/photo-1542883339-f2682a3e61bf?auto=format&fit=crop&w=600&q=80" style={{ filter: 'blur(5px) grayscale(50%)' }} alt="Bé Trai ẩn danh" />
            </div>
            <div className="child-info">
              <h3>Mã HS: CH-105</h3>
              <div className="child-meta">
                <span><i className="fa-regular fa-calendar"></i> 8 tuổi (2016)</span>
                <span><i className="fa-solid fa-notes-medical"></i> Cần theo dõi</span>
              </div>
              <p className="child-desc">Bé trai lanh lợi, học giỏi môn Toán. Bé cần một gia đình có đủ điều kiện quan tâm và theo dõi sức khỏe định kỳ.</p>
              <button className="btn btn-outline" style={{ width: '100%', marginTop: '10px' }} onClick={openModal}>Tìm hiểu thủ tục nhận nuôi</button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL CHÍNH SÁCH NHẬN NUÔI (ĐÃ SỬA LỖI MẤT LOGO) ================= */}
      <div className={`modal-overlay ${isModalActive ? 'active' : ''}`} onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={closeModal}><i className="fa-solid fa-xmark"></i></button>
          
          {/* SỬA LỖI: Thêm lại Logo Khiên Mèo Xanh ở trên cùng */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <i className="fa-solid fa-shield-cat" style={{ color: 'var(--secondary)', fontSize: '60px' }}></i>
          </div>
          
          <h2 style={{ marginBottom: '20px', color: 'var(--primary)', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
            Chính sách Bảo vệ Trẻ em
          </h2>
          
          <p style={{ fontSize: '16px', color: 'var(--text-dark)', lineHeight: '1.8', marginBottom: '25px', textAlign: 'justify' }}>
            Theo <strong>Luật Trẻ em 2016</strong> và quy định bảo mật của Trung tâm, để đảm bảo an toàn, tránh các rủi ro bị kẻ xấu lợi dụng và bảo vệ quyền riêng tư tuyệt đối cho các bé, <strong>toàn bộ hồ sơ chi tiết, hình ảnh rõ mặt và thông tin nhân thân của trẻ mồ côi không được phép công khai trực tuyến</strong>.
          </p>

          <div style={{ backgroundColor: 'var(--bg-light)', borderLeft: '4px solid var(--secondary)', padding: '20px', borderRadius: '0 8px 8px 0', marginBottom: '30px' }}>
            
            <strong style={{ color: 'var(--secondary)', display: 'block', marginBottom: '10px', fontSize: '16px' }}>
              <i className="fa-solid fa-location-dot" style={{ marginRight: '8px' }}></i> Yêu cầu đến làm việc trực tiếp:
            </strong>
            
            <p style={{ marginBottom: '20px', color: 'var(--text-dark)', lineHeight: '1.6' }}>
              Quý gia đình có nguyện vọng nhận con nuôi vui lòng mang theo CCCD/Hộ chiếu đến trực tiếp văn phòng Trung tâm để được tư vấn, xem hồ sơ thực tế và hướng dẫn các thủ tục pháp lý.
            </p>
            
            {/* Thêm lại các icon nhỏ màu sắc chi tiết */}
            <div style={{ marginBottom: '15px' }}>
              <i className="fa-solid fa-map-pin" style={{ color: 'var(--primary)', marginBottom: '5px', fontSize: '18px' }}></i><br />
              <strong style={{ color: 'var(--secondary)', fontSize: '15px' }}>Địa chỉ:</strong><br />
              <span style={{ color: 'var(--text-dark)' }}>Số 123 Đường Hy Vọng, Quận Hải Châu, TP. Đà Nẵng</span>
            </div>

            <div>
              <i className="fa-solid fa-clock" style={{ color: 'var(--text-muted)', marginBottom: '5px', fontSize: '18px' }}></i><br />
              <strong style={{ color: 'var(--secondary)', fontSize: '15px' }}>Giờ làm việc:</strong><br />
              <span style={{ color: 'var(--text-dark)' }}>08:00 - 17:00 (Thứ 2 đến Thứ 6)</span>
            </div>

          </div>

          <button type="button" className="btn btn-secondary" style={{ width: '100%', padding: '15px', fontSize: '16px', borderRadius: '50px' }} onClick={closeModal}>
            Tôi đã hiểu thông tin
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdoptionPage;