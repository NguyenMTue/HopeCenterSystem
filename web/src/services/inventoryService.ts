import apiClient from './apiClient';

export const getInventoryList = async () => {
    const response = await apiClient.get('/api/Inventory');
    return response.data;
};

// Hàm xóa vật tư
export const deleteInventoryItem = async (id: string) => {
    await apiClient.delete(`/api/Inventory/${id}`);
};