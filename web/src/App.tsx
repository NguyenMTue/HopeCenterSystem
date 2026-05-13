import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { router } from './routes';

function App() {
  return (
// Trong file App.tsx
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#f43f5e',
      borderRadius: 8,
      fontSize: 16, // Nâng từ 14 lên 16 cho toàn bộ hệ thống
      fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif", // Dùng font hiện đại hơn
    },
components: {
  Menu: {
    fontSize: 16,
    // Ant Design dùng thuộc tính này để chỉnh độ đậm cho menu
    itemSelectedColor: '#f43f5e', 
    groupTitleFontSize: 14,
  },
  Button: {
    // Nếu muốn nút bấm có chữ đậm
    contentFontSize: 16,
    fontWeight: 600, // Với Button thì tên này lại đúng, thật rắc rối đúng không!
  }
}
  }}
>
  <RouterProvider router={router} />
</ConfigProvider>
  );
}

export default App;