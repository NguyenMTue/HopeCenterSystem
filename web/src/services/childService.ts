import apiClient from './apiClient';

// Hàm gọi API lấy danh sách trẻ em
export const getChildrenList = async () => {
    try {
        // Gọi đến đúng đường dẫn API mà ta vừa tạo ở Backend
        const response = await apiClient.get('/api/Children');
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu trẻ em:", error);
        throw error;
    }
};
export const deleteChild = async (id: string) => {
    const response = await apiClient.delete(`/api/Children/${id}`);
    return response.data;
};