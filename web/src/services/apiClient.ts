import axios from 'axios';

// Tạo một cổng kết nối với các cấu hình mặc định
const apiClient = axios.create({
    baseURL: 'http://localhost:5176', // Địa chỉ gốc trỏ thẳng vào Backend
    headers: {
        'Content-Type': 'application/json',
    },
});

/* Sau này ở Bước 4, chúng ta sẽ thêm code vào đây 
  để nó tự động đính kèm Token đăng nhập vào mỗi request 
*/

export default apiClient;