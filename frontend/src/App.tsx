import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#f43f5e',
            borderRadius: 8,
            fontSize: 16,
            fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
          },
          components: {
            Menu: {
              fontSize: 16,
              itemSelectedColor: '#f43f5e', 
              groupTitleFontSize: 14,
            },
            Button: {
              contentFontSize: 16,
              fontWeight: 600,
            }
          }
        }}
      >
        <AntdApp>
          <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
