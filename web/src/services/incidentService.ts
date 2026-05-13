import apiClient from './apiClient';

export const getIncidents = async () => {
    const response = await apiClient.get('/api/Incidents');
    return response.data;
};