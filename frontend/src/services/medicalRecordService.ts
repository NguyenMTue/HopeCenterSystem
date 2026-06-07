import apiClient from './apiClient';

// Lấy danh sách hồ sơ bệnh án từ API
export const getMedicalRecords = async () => {
    try {
        const response = await apiClient.get('/api/MedicalRecords');
        // Đối với Minimal API, dữ liệu trả về nằm trong trường .lists
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bệnh án:", error);
        throw error;
    }
};

// Thêm mới hồ sơ bệnh án
export const createMedicalRecord = async (data: {
    childId: string;
    checkupDate: string;
    diagnosis: string;
    treatment?: string;
    doctorName?: string;
    notes?: string;
}) => {
    try {
        const response = await apiClient.post('/api/MedicalRecords', data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo mới bệnh án:", error);
        throw error;
    }
};

// Cập nhật thông tin bệnh án
export const updateMedicalRecord = async (id: string, data: {
    id: string;
    checkupDate: string;
    diagnosis: string;
    treatment?: string;
    doctorName?: string;
    notes?: string;
}) => {
    try {
        const response = await apiClient.put(`/api/MedicalRecords/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật bệnh án ${id}:`, error);
        throw error;
    }
};

// Xóa hồ sơ bệnh án
export const deleteMedicalRecord = async (id: string) => {
    try {
        const response = await apiClient.delete(`/api/MedicalRecords/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa bệnh án ${id}:`, error);
        throw error;
    }
};
