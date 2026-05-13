import apiClient from './apiClient';

export const getDonations = async () => {
    const response = await apiClient.get('/api/Donations');
    return response.data;
};

export const createDonation = async (data: any) => {
    const response = await apiClient.post('/api/Donations', data);
    return response.data;
};