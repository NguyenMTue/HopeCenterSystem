import apiClient from './apiClient';

export const getIncidents = async () => {
    const response = await apiClient.get('/api/Incidents', {
        params: { PageNumber: 1, PageSize: 100 }
    });
    return response.data;
};