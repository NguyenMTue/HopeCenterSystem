import apiClient from './apiClient';

export const getInventoryList = async () => {
    const response = await apiClient.get('/api/InventoryItems', {
        params: { PageNumber: 1, PageSize: 100 }
    });
    return response.data;
};

// Hàm xóa vật tư
export const deleteInventoryItem = async (id: string) => {
    await apiClient.delete(`/api/InventoryItems/${id}`);
};

export const updateInventoryItem = async (id: string, data: any) => {
    await apiClient.put(`/api/InventoryItems/${id}`, { id, ...data });
};

export const createInventoryItem = async (data: any) => {
    const response = await apiClient.post('/api/InventoryItems', data);
    return response.data;
};