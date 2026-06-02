import { Child, CareTask, UpdateLog, Donation, PendingItem, SystemAlert } from './types';

export const INITIAL_CHILDREN: Child[] = [
  {
    id: 'HC-2024-089',
    name: 'Nguyễn Văn An',
    age: 5,
    gender: 'Nam',
    dob: '12/05/2019',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdOxqdC1yebcXQwu5NpRXJphhkizSuLj0ClobFaQwEhtsnYto1_rL_wQqHeGJ_aVM_AEi-hxaNvniSG7mU2ubgGH6LRVVicH3pBd903Mn2yXN0tqN06YD-J3pz2_GWL0eKadx5h9FYK8K-8_6ohvvJDpPUBDQoPk0_x1YAaIeQ5cmr1SQgrMG-TzKzmiMIcpgibc6tL9fzGh2SwyRBs8jG8HhFnI6HRjrlbjz6Lea1XtDtWqBR_GsUYBpLQUwk0CZ_6G46q_NUrAo',
    location: 'Khu Hoa Hồng - Tầng 2',
    status: 'Ổn định',
    weight: 18.5,
    temp: 36.8,
    unusualSymptoms: 'Ho nhẹ vào sáng sớm, nhưng không sốt quấy khóc.',
    currentMeds: 'Siro ho bổ phế - 5ml sau ăn',
    eatingStatus: 'good',
    sleepingStatus: 'good',
    mood: 'happy',
    activityNotes: 'Hôm nay bé chơi bóng rổ tốt, tham gia vẽ tranh rất tích cực với các bạn.'
  },
  {
    id: 'HC-2024-112',
    name: 'Trần Thị Bình',
    age: 3,
    gender: 'Nữ',
    dob: '20/09/2021',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_JceigI6fiVXzbu3mUJvAOuiJafD-CIaiW0ueg-hLXKBG6yVwGA2EHMdbYyh0Whq0XRmvGAj8MoLN-p8M-NuI1aeaytBBbDvMjyJ3P9nS5iWCEa4ncWIpS1GFrlrwE-7YLe4O2kZdYYusJsDup_lSvVVdhrFlNp0ap3rggTwSiVozlobqBPwDAcBd8TZSOWfgp63wWkWUF1cVSaqwDSLwqO6MjE-i5s-WMXPj759ynnBf6Uk14wUcmIIg6Dfnz_m77exLrjC18NM',
    location: 'Khu Hoa Hồng - Tầng 2',
    status: 'Khỏe mạnh',
    weight: 14.2,
    temp: 36.5,
    unusualSymptoms: 'Bình thường, tinh thần phấn chấn.',
    currentMeds: '',
    eatingStatus: 'good',
    sleepingStatus: 'good',
    mood: 'happy',
    activityNotes: 'Thích vẽ tranh sắc màu, ngoan ngoãn lắng nghe giáo viên.'
  },
  {
    id: 'HC-2024-032',
    name: 'Lê Tùng',
    age: 4,
    gender: 'Nam',
    dob: '15/02/2020',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDx888pWQ6QL0UoPMEL_IXhrr95Vs6gMmruXwg05H-LWKyZuJon0rrGTV0rVpdL9Pj6negTsTtzLdiaWMaY9SNDM3mtPJ6kjrkyDO8HKDRlx36iNX4CoHwFlmPeUJLBIz0IIe8v62SiPdW_dtdO6CMw-LYkBf9brCS0myQAEmnL9jhC_nw0_XDI830BLLo3flAra92nIWk8s85v_YbkvNcK4-_EEhVdIx4vCoqgVxbGtseLrl7WC0570SXf6EA7_OkVQ5E1gZba9M',
    location: 'Khu Hướng Dương - Tầng 1',
    status: 'Cần uống thuốc',
    weight: 16.0,
    temp: 37.2,
    unusualSymptoms: 'Sốt nhẹ 37.2 độ lúc xế chiều, hơi mệt.',
    currentMeds: 'Paracetamol 150mg - 1 gói khi sốt trên 38.5 độ',
    eatingStatus: 'normal',
    sleepingStatus: 'normal',
    mood: 'neutral',
    activityNotes: 'Hôm nay hơi uể oải, ngủ trưa nhiều hơn bình thường.'
  }
];

export const INITIAL_CARE_TASKS: CareTask[] = [
  {
    id: 'TSK-001',
    time: '09:00',
    title: 'Khám sức khỏe định kỳ',
    childName: 'Bé Trần Văn A',
    age: 5,
    status: 'Đang thực hiện',
    location: 'Phòng y tế',
    checklist: [
      { text: 'Đo chiều cao, cân nặng (chỉ số phát triển thể chất)', done: true },
      { text: 'Kiểm tra thị lực, thính giác lâm sàng căn bản', done: false },
      { text: 'Khám nội khoa tổng quát (tim mạch, hô hấp)', done: false }
    ],
    notes: 'Bé hợp tác tốt, nhịp tim đều, cân nặng ổn định.'
  },
  {
    id: 'TSK-002',
    time: '14:30',
    title: 'Đánh giá tâm lý tháng 10',
    childName: 'Bé Lê Thị B',
    age: 8,
    status: 'Chưa bắt đầu',
    location: 'Phòng Tư vấn Tâm lý',
    checklist: [
      { text: 'Trắc nghiệm vẽ tranh ước mơ tương lai', done: false },
      { text: 'Phỏng vấn chuyên sâu hành vi giao tiếp xã hội', done: false },
      { text: 'Đánh giá chỉ số hòa nhập tập thể', done: false }
    ]
  },
  {
    id: 'TSK-003',
    time: '08:00',
    title: 'Cập nhật hồ sơ tiêm chủng',
    childName: 'Bé Phạm C',
    age: 2,
    status: 'Hoàn thành',
    location: 'Văn phòng Tiếp nhận',
    checklist: [
      { text: 'Kiểm tra khớp sổ tiêm chủng phường', done: true },
      { text: 'Cập nhật mũi tiêm viêm gan B, bạch hầu', done: true },
      { text: 'Ghi sổ theo dõi phản ứng sau tiêm', done: true }
    ],
    notes: 'Đã hoàn tất tiêm phòng theo đúng chu kỳ 2 tuổi.'
  }
];

export const INITIAL_LOGS: UpdateLog[] = [
  {
    id: 'LOG-01',
    time: 'Hôm nay, 08:30',
    staffName: 'Lê Thị Mai',
    staffInitials: 'LT',
    mood: 'Vui vẻ',
    summary: 'Ăn hết suất, uống sữa đầy đủ, không có biểu hiện sốt/ốm nào.'
  },
  {
    id: 'LOG-02',
    time: 'Hôm qua, 17:00',
    staffName: 'Lê Thị Mai',
    staffInitials: 'LT',
    mood: 'Bình thường',
    summary: 'Hơi sổ mũi nhẹ vào buổi chiều muộn, đã chuẩn bị súc họng nước muối ấm.'
  }
];

export const INITIAL_DONATIONS: Donation[] = [
  {
    id: '#DN-1042',
    donorName: 'Công ty TNHH ABC',
    type: 'Tiền mặt',
    amountOrItems: '50,000,000 đ',
    date: '15/10/2026',
    status: 'Đã xác nhận',
    notes: 'Quyện vào quỹ giáo dục trẻ em vùng cao'
  },
  {
    id: '#DN-1043',
    donorName: 'Nguyễn Văn A',
    type: 'Hiện vật',
    amountOrItems: '50 Thùng sữa, 20 Đồ chơi',
    date: '14/10/2026',
    status: 'Đã nhập kho',
    notes: 'Nhu yếu phẩm hằng ngày'
  },
  {
    id: '#DN-1044',
    donorName: 'Nhóm Thiện Nguyện Ánh Sáng',
    type: 'Hiện vật',
    amountOrItems: 'Quần áo cũ (100kg)',
    date: '14/10/2026',
    status: 'Chờ phân loại',
    notes: 'Quần áo ấm mùa đông cho các bé lớn nhỏ'
  }
];

export const INITIAL_PENDING_ITEMS: PendingItem[] = [
  {
    id: '#HS-2024-089',
    type: 'adoption',
    title: 'Hồ sơ nhận nuôi mới',
    time: '2 giờ trước',
    content: 'Gia đình Nguyễn Văn A xin nhận nuôi bé Trần B (Mã: TE-142). Hồ sơ đã qua hoàn thành vòng thẩm định tư pháp & điều kiện tài chính.'
  },
  {
    id: '#MED-2026-04',
    type: 'medical',
    title: 'Kế hoạch chăm sóc y tế đặc biệt',
    time: '12 giờ trước',
    content: 'Phẫu thuật tim bẩm sinh khẩn cấp cho bé Lê C. Dự kiến chi phí: 150.000.000 đ (Đã đề xuất trích từ quỹ tài trợ y tế dự phòng khẩn cấp).',
    badge: 'Gấp',
    urgent: true
  },
  {
    id: '#FIN-2026-10',
    type: 'finance',
    title: 'Báo cáo tài chính Tháng 10/2026',
    time: '1 ngày trước',
    content: 'Trưởng phòng Tài chính đã trình ký duyệt báo cáo thu chi, quyết toán vật tư kho dự trữ thuộc Quầy bảo trợ Hope Center.'
  }
];

export const INITIAL_ALERTS: SystemAlert[] = [
  {
    id: 'ALT-01',
    type: 'error',
    title: 'Kiểm tra PCCC định kỳ',
    content: 'Lịch thanh tra an toàn phòng cháy chữa cháy toàn bộ tòa nhà Hope Center dự kiến vào 15/11. Yêu cầu Ban quản trị văn phòng chuẩn bị đầy đủ chứng từ và bình xịt cứu hỏa.'
  },
  {
    id: 'ALT-02',
    type: 'success',
    title: 'Chuyến thăm của Đoàn Đại biểu',
    content: 'Đoàn thanh tra và Đại diện nhà tài trợ UNICEF Việt Nam sẽ đến tham quan các lớp học mẫu giáo vào lúc 09:00 sáng mai.'
  }
];
