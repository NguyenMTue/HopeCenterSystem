import apiClient from './apiClient';

// Lấy danh sách đơn
export const getAdoptionList = async () => {
    const response = await apiClient.get('/api/AdoptionApplications', {
        params: { PageNumber: 1, PageSize: 100 }
    });
    return response.data;
};

// Cập nhật đơn nhận nuôi
export const updateAdoption = async (id: string, payload: any) => {
    const response = await apiClient.put(`/api/AdoptionApplications/${id}`, {
        id,
        ...payload
    });
    return response.data;
};