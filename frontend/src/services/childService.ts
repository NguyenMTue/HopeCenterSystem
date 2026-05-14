import apiClient from './apiClient';

// Hàm gọi API lấy danh sách trẻ em
export const getChildrenList = async () => {
    try {
        // Cần truyền PageNumber và PageSize vì Backend yêu cầu bắt buộc trong Query String
        const response = await apiClient.get('/api/Children', {
            params: {
                PageNumber: 1,
                PageSize: 100 // Lấy số lượng lớn để hiển thị đủ ở Dashboard
            }
        });
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