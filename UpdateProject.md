# HƯỚNG DẪN CHI TIẾT DÀNH CHO AI: TÁI CẤU TRÚC HỆ THỐNG QUẢN LÝ TRUNG TÂM BẢO TRỢ XÃ HỘI

## 📌 VAI TRÒ VÀ NHIỆM VỤ CỦA AI
Bạn sẽ đóng vai trò là một **Chuyên gia Phân tích Nghiệp vụ (Business Analyst - BA) cấp cao** kết hợp với **Chuyên gia Thiết kế UI/UX xuất sắc**. Hãy thực hiện TUẦN TỰ và CHI TIẾT từng phần việc dưới đây để thiết kế lại toàn bộ luồng nghiệp vụ, danh sách Usecase và kịch bản giao diện (Dashboard) cho dự án **"Hệ thống quản lý Trung tâm bảo trợ xã hội (Trại trẻ mồ côi)"**.

---

## 🛠 RÀNG BUỘC CỐT LÕI (CORE REQUIREMENTS)
*AI phải luôn tuân thủ 2 nguyên tắc bảo mật và phân quyền này trong suốt quá trình xử lý tất cả các bước:*

1. **Phân quyền giao diện (Role-Based UI):** Sau khi đăng nhập, mỗi nhóm nhân viên nội bộ phải được điều hướng đến một Giao diện làm việc (Workspace/Dashboard) hoàn toàn độc lập. Chỉ hiển thị các Menu và Chức năng đúng với nghiệp vụ của họ. Tuyệt đối không hiển thị các chức năng chéo hoặc menu bị làm mờ (gray-out).
2. **Bảo mật nhân quyền & Quyền trẻ em (Data Privacy):** Tuân thủ tuyệt đối Luật Trẻ em. 
   - Khách vãng lai (Guest) không được phép xem danh sách trẻ em. Thông tin public chỉ là các con số thống kê tổng quan (Ví dụ: *"Đang nuôi dưỡng 145 em"*).
   - Để xem thông tin chi tiết, người dùng bắt buộc phải đăng ký tài khoản, nộp đơn xin nhận nuôi, và được Quản lý cấp quyền cụ thể. Danh sách trẻ đủ điều kiện hiển thị cho đối tượng này cũng phải được ẩn thông tin định danh nhạy cảm (ẩn tên thật, địa chỉ thực).

---

## 🔄 QUY TRÌNH THỰC HIỆN TUẦN TỰ (SEQUENTIAL WORKFLOW)

### BƯỚC 1: Chuẩn hóa danh sách Actor và Usecase
Hãy phân tích, bổ sung và phân chia lại ma trận quyền cho các Actor sát với thực tế vận hành của một trung tâm bảo trợ.

* **Danh sách các Actor cần chuẩn hóa:**
    1.  **Giám đốc (Director)**
    2.  **Quản lý / Nhân viên Công tác xã hội (Manager / Social Worker)**
    3.  **Kế toán / Thủ kho (Accountant & Inventory Staff)**
    4.  **Nhân viên Y tế (Medical Staff)**
    5.  **Bảo mẫu / Nhân viên chăm sóc trực tiếp (Caregiver)**
    6.  **Quản trị viên hệ thống (Admin)**
    7.  **Người nhận nuôi (Adopter)**
    8.  **Nhà tài trợ (Donor)**
* **Lưu ý nghiệp vụ bắt buộc:** Rút hoàn toàn chức năng *"Theo dõi sau nhận nuôi (Post-adoption tracking)"* ra khỏi vai trò của Bảo mẫu. Chức năng này phải được bàn giao cho **Quản lý / Nhân viên Công tác xã hội** để thực hiện kiểm tra định kỳ (3 tháng, 6 tháng).
* **Đầu ra yêu cầu:** Lập bảng ma trận phân quyền (Actor vs Usecase) rõ ràng, minh bạch.

---

### BƯỚC 2: Thiết kế chi tiết các Giao diện Dashboard chuyên biệt
Mô tả chi tiết kịch bản trải nghiệm người dùng, các thành phần dữ liệu, biểu đồ và menu mà mỗi Actor nội bộ sẽ nhìn thấy ngay sau khi Login thành công:

1.  **Giao diện của Giám đốc (Director Workspace):**
    * *Trọng tâm:* Số liệu tổng quan toàn trung tâm (tài chính, nhân sự, số lượng trẻ).
    * *Chức năng chính:* Xem báo cáo chiến lược, phê duyệt các quyết định pháp lý cuối cùng (Quyết định nhận con nuôi, lệnh xuất kho quy mô lớn, phê duyệt kế hoạch hoạt động tháng).
2.  **Giao diện của Quản lý / NV Công tác xã hội (Manager Workspace):**
    * *Trọng tâm:* Quản lý vòng đời của trẻ từ lúc tiếp nhận đến lúc rời trung tâm; điều phối nhân sự.
    * *Chức năng chính:* Duyệt yêu cầu vật tư từ bảo mẫu, thực hiện xác minh hồ sơ gia đình, tiến hành ghép đôi (matching) nhận nuôi, và ghi nhận tình trạng hậu nhận nuôi định kỳ.
3.  **Giao diện của Nhân viên Y tế (Medical Staff Workspace):**
    * *Trọng tâm:* Sức khỏe và y tế.
    * *Chức năng chính:* Danh sách trẻ đang điều trị/bệnh, lịch tiêm chủng/khám sức khỏe định kỳ, quản lý chi tiết tủ thuốc y tế (nhập/xuất/tồn thuốc), cập nhật hồ sơ bệnh án điện tử của từng trẻ.
4.  **Giao diện của Bảo mẫu / NV Chăm sóc (Caregiver Workspace):**
    * *Trọng tâm:* Thiết kế tối giản, tối ưu giao diện trên Thiết bị di động / Máy tính bảng (Tablet/Mobile) để dễ thao tác khi đang chăm sóc trẻ.
    * *Chức năng chính:* Xem ca trực, điểm danh trẻ theo phòng, checklist hoạt động sinh hoạt hàng ngày (ăn uống, ngủ nghỉ), tạo nhanh "Báo cáo sự cố khẩn cấp" (tai nạn, sốt đột xuất), và tạo "Phiếu yêu cầu cấp phát vật tư". *Tuyệt đối không có quyền tự thao tác trừ số lượng trong kho.*
5.  **Giao diện của Kế toán / Thủ kho (Accountant & Inventory Workspace):**
    * *Trọng tâm:* Minh bạch tài chính và tài sản.
    * *Chức năng chính:* Hạch toán các nguồn tài trợ (tiền mặt, chuyển khoản, hiện vật), quản lý danh mục kho, thực hiện lệnh xuất/nhập kho dựa trên phiếu yêu cầu đã được phê duyệt hợp lệ.
6.  **Giao diện của Quản trị viên (Admin Workspace):**
    * *Trọng tâm:* Kỹ thuật và an toàn hệ thống.
    * *Chức năng chính:* Quản lý tài khoản người dùng, phân quyền chi tiết, cấu hình hệ thống, giám sát nhật ký hoạt động (system logs). *Tuyệt đối không được quyền xem hoặc sửa nội dung hồ sơ thực tế của trẻ em hay gia đình nhận nuôi vì lý do bảo mật.*

---

### BƯỚC 3: Thiết kế kịch bản cho 2 Quy trình liên phòng ban (Cross-functional Workflow)
Viết kịch bản luồng xử lý dữ liệu chi tiết từng bước. Giải thích rõ cách thức hệ thống tự động chuyển đổi trạng thái dữ liệu (Status) qua các Dashboard của từng Actor liên quan:

#### 📊 Quy trình 1: Quản lý Kho vật tư (Inventory Management)
* **Bước 1:** *Bảo mẫu* tạo "Phiếu yêu cầu cấp phát vật tư" (Ví dụ: Yêu cầu 5 hộp sữa, 1 bịch tã cho ca trực phòng A) ngay trên tablet/mobile. Trạng thái phiếu: `Chờ duyệt`.
* **Bước 2:** *Quản lý trung tâm* nhận thông báo thời gian thực (Real-time Notification), kiểm tra tính hợp lý và bấm duyệt. Trạng thái phiếu chuyển thành: `Đã duyệt - Chờ xuất kho`.
* **Bước 3:** *Thủ kho* nhận được lệnh đã phê duyệt trên Dashboard của mình, tiến hành soạn hàng thực tế và bấm xác nhận "Xuất kho" trên phần mềm. Lúc này hệ thống mới chính thức trừ số lượng tồn kho. Trạng thái phiếu chuyển thành: `Hoàn thành`.

#### 👶 Quy trình 2: Xét duyệt hồ sơ nhận nuôi (Adoption Workflow)
* **Bước 1 (Tiếp nhận & Xác minh):** *Người nhận nuôi* nộp đơn kèm hồ sơ pháp lý trên Portal công cộng. Hệ thống đồng bộ về Dashboard của *Quản lý/NV Công tác xã hội*. Trạng thái đơn: `Đã tiếp nhận`. Quản lý tiến hành đi xác minh nhân thân, hoàn cảnh kinh tế thực tế và cập nhật báo cáo xác minh lên hệ thống. Trạng thái chuyển thành: `Đã xác minh - Chờ ghép đôi`.
* **Bước 2 (Đề xuất ghép đôi - Matching):** *Quản lý/NV Công tác xã hội* dùng bộ lọc hệ thống để tìm kiếm và đề xuất trẻ phù hợp nhất với điều kiện của gia đình nhận nuôi (tuân thủ nguyên tắc ẩn danh thông tin nhạy cảm của trẻ ở giai đoạn này). Trạng thái chuyển thành: `Đã đề xuất ghép đôi - Chờ phê duyệt`.
* **Bước 3 (Quyết định):** *Giám đốc trung tâm* truy cập hồ sơ, thẩm định toàn bộ quá trình xác minh và kết quả ghép đôi trên Dashboard của mình, sau đó bấm "Phê duyệt" quyết định cuối cùng. Hệ thống tự động chuyển trạng thái đơn thành: `Đã phê duyệt - Chờ bàn giao`, đồng thời kích hoạt các thủ tục pháp lý xuất viện cho trẻ và chuyển trạng thái của trẻ trên hệ thống thành `Đã được nhận nuôi`.

---

## 🎯 YÊU CẦU ĐẦU RA ĐỐI VỚI AI
Khi thực hiện phản hồi, AI cần:
1.  Trình bày rõ ràng, sử dụng các tiêu đề, bảng biểu (Markdown Table) để so sánh hoặc phân quyền Actor.
2.  Mô tả chi tiết cấu trúc dữ liệu thô hoặc các nút bấm hành động (Action Buttons) trên UI của từng Dashboard.
3.  Vẽ luồng quy trình bằng định dạng văn bản tuần tự rõ ràng để đội ngũ lập trình có thể dễ dàng chuyển hóa thành mã nguồn và thiết kế database.
