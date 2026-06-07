import apiClient from './apiClient';

export const getCarePlans = async () => {
    const response = await apiClient.get('/api/CarePlans', {
        params: { PageNumber: 1, PageSize: 100 }
    });
    return response.data;
};

export const createCarePlan = async (data: any) => {
    const response = await apiClient.post('/api/CarePlans', data);
    return response.data;
};

export const updateCarePlan = async (id: string, data: any) => {
    const response = await apiClient.put(`/api/CarePlans/${id}`, data);
    return response.data;
};

export const deleteCarePlan = async (id: string) => {
    const response = await apiClient.delete(`/api/CarePlans/${id}`);
    return response.data;
};