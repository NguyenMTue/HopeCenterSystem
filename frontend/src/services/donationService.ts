import apiClient from './apiClient';

export const getDonations = async () => {
    const response = await apiClient.get('/api/Donations', {
        params: { PageNumber: 1, PageSize: 100 }
    });
    return response.data;
};

export const createDonation = async (data: any) => {
    const response = await apiClient.post('/api/Donations', data);
    return response.data;
};

export const updateDonation = async (id: string, data: { id: string; status: string }) => {
    const response = await apiClient.put(`/api/Donations/${id}`, data);
    return response.data;
};