import apiClient from './apiClient';

export const getEmployees = async () => {
    const response = await apiClient.get('/api/Employees');
    return response.data;
};

export const updateEmployeeStatus = async (id: string, status: string) => {
    const response = await apiClient.put(`/api/Employees/${id}/status`, { status });
    return response.data;
};