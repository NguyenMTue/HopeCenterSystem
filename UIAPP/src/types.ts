export type Role = 'public' | 'staff' | 'director' | 'warehouse_manager' | 'login';

export type Screen = 
  | 'public_home' 
  | 'adoption_register' 
  | 'staff_dashboard' 
  | 'child_update' 
  | 'care_plan' 
  | 'director_dashboard' 
  | 'warehouse' 
  | 'login';

export interface Child {
  id: string;
  name: string;
  age: number;
  gender: 'Nam' | 'Nữ';
  dob: string;
  avatar: string;
  location: string;
  status: 'Cảm nhẹ' | 'Khỏe mạnh' | 'Cần uống thuốc' | 'Ổn định' | 'Theo dõi';
  weight: number;
  temp: number;
  unusualSymptoms: string;
  currentMeds: string;
  eatingStatus: 'good' | 'normal' | 'bad';
  sleepingStatus: 'good' | 'normal' | 'bad';
  mood: 'happy' | 'neutral' | 'sad';
  activityNotes: string;
}

export interface CareTask {
  id: string;
  time: string;
  title: string;
  childName: string;
  age: number;
  status: 'Đang thực hiện' | 'Chưa bắt đầu' | 'Hoàn thành';
  location: string;
  checklist: { text: string; done: boolean }[];
  notes?: string;
}

export interface UpdateLog {
  id: string;
  time: string;
  staffName: string;
  staffInitials: string;
  mood: string;
  summary: string;
}

export interface Donation {
  id: string;
  donorName: string;
  type: 'Tiền mặt' | 'Hiện vật';
  amountOrItems: string;
  date: string;
  status: 'Đã xác nhận' | 'Đã nhập kho' | 'Chờ phân loại';
  notes?: string;
}

export interface PendingItem {
  id: string;
  type: 'adoption' | 'medical' | 'finance';
  title: string;
  time: string;
  content: string;
  badge?: string;
  urgent?: boolean;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'success' | 'warning';
  title: string;
  content: string;
}
