# CHỈ THỊ PHÁT TRIỂN VÀ CẤP NHẬT DỰ ÁN CHO AI (AI DEVELOPMENT GUIDELINES)

## 1. Mục Tiêu Tổng Quan (Overview)
Tài liệu này thiết lập các quy tắc và chỉ thị cốt lõi dành cho AI trong quá trình phát triển, áp dụng giao diện và xử lý dữ liệu cho dự án hiện tại dựa trên khuôn mẫu có sẵn.

---

## 2. Quy Tắc Triển Khai Chi Tiết (Implementation Rules)

### 2.1. Áp Dụng Giao Diện Từ Thư Mục `UIAPP`
* **Tái sử dụng cấu trúc:** Đọc và phân tích toàn bộ giao diện, bố cục (layout), thành phần (components), và phong cách thiết kế (styles/CSS) từ thư mục `UIAPP`.
* **Cơ chế áp dụng:** Thực hiện việc chuyển đổi và áp dụng các thành phần UI này vào dự án hiện tại (tương tự hành động copy-paste nhưng có chọn lọc và tối ưu).
* **Tính linh hoạt:** Được phép thay đổi, tinh chỉnh cấu trúc mã nguồn hoặc giao diện để đảm bảo phù hợp tối đa với ngữ cảnh, luồng vận hành và kiến trúc của dự án hiện tại. Không rập khuôn máy móc nếu gây xung đột hệ thống.

### 2.2. Xử Lý Dữ Liệu Thực Tế (Real Data Integration)
* **Nghiêm cấm Hard-code:** Tuyệt đối không sử dụng dữ liệu mã hóa cứng (hardcoded data), dữ liệu giả (mock data) hoặc dữ liệu tĩnh trong các thành phần giao diện khi đưa vào vận hành.
* **Kết nối Database:** Thực hiện kết nối hệ thống, gọi API hoặc viết các câu lệnh truy vấn phù hợp để lấy dữ liệu thực tế từ cơ sở dữ liệu (Database).
* **Đảm bảo tính toàn vẹn:** Dữ liệu hiển thị trên UI phải phản ánh chính xác trạng thái thực thời (real-time) hoặc dữ liệu động từ backend. Xử lý đầy đủ các trạng thái hiển thị: Đang tải (Loading), Lỗi (Error), và Không có dữ liệu (Empty).

---

## 3. Quy Trình Bảo Trì Và Cập Nhật Tài Liệu (Maintenance & Update Protocol)

Tài liệu này là **Nguồn sự thật duy nhất (Single Source of Truth)** kiểm soát hành vi của AI. Quy trình làm việc bắt buộc tuân theo các bước sau:

1. **Đọc hiểu trước khi thực hiện:** Khi nhận được bất kỳ yêu cầu chỉnh sửa, sửa đổi hoặc nâng cấp nào từ người dùng, AI bắt buộc phải đọc lại toàn bộ nội dung file `.md` này để nắm vững các chỉ thị cốt lõi.
2. **Triển khai mã nguồn:** Tiến hành chỉnh sửa code của dự án theo yêu cầu mới nhưng không được vi phạm các nguyên tắc tại mục 2 (Vẫn giữ UI từ `UIAPP` và lấy dữ liệu thực tế).
3. **Cập nhật tài liệu tự động:** Sau khi hoàn thành việc chỉnh sửa mã nguồn, AI phải bổ sung, cập nhật các thay đổi, logic mới hoặc các lưu ý kỹ thuật quan trọng trực tiếp vào chính file `.md` này. 

---
*Lưu ý cho AI: Hãy tuân thủ nghiêm ngặt các điều khoản trên để duy trì sự đồng bộ và chất lượng của dự án.*
