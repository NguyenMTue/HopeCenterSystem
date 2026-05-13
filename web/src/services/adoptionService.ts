import apiClient from './apiClient';

// Lấy danh sách đơn
export const getAdoptionList = async () => {
    const response = await apiClient.get('/api/AdoptionApplications');
    return response.data;
};

// Cập nhật trạng thái (Duyệt/Từ chối)
export const updateAdoptionStatus = async (id: string, status: number) => {
    const response = await apiClient.put(`/api/AdoptionApplications/${id}/status`, { status });
    return response.data;
};