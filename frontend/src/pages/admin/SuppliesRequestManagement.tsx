import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, InputNumber, Card, Table, Typography, Space, Tag, message } from 'antd';
import { SendOutlined, HistoryOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiClient from '../../services/apiClient';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const SuppliesRequestManagement: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState<any>(null);
  
  const [form] = Form.useForm();

  // Load danh mục vật tư từ database
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Tải danh mục vật tư
      const itemsRes = await apiClient.get('/api/InventoryItems');
      setItems(itemsRes.data.lists || []);

      // 2. Tải thông tin cá nhân bảo mẫu
      const meRes = await apiClient.get('/api/Users/me');
      const user = meRes.data;
      const currentEmp = {
        id: user.employeeId,
        fullName: user.fullName,
        position: user.position
      };
      setEmployeeInfo(currentEmp);

      // 3. Tải danh sách giao dịch gần đây của nhân viên này để làm lịch sử yêu cầu
      const txRes = await apiClient.get('/api/InventoryTransactions');
      const allTxs = txRes.data.lists || [];
      
      // Lọc các giao dịch dạng yêu cầu của bảo mẫu
      const myRequests = allTxs.filter((tx: any) => 
        tx.employeeId === currentEmp?.id && 
        (tx.notes?.includes('[ĐANG CHỜ DUYỆT]') || tx.notes?.includes('[ĐÃ DUYỆT]') || tx.notes?.includes('[YÊU CẦU]'))
      );
      setRequests(myRequests);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh mục vật tư');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Gửi yêu cầu vật tư mới
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const targetItem = items.find(i => i.id === values.itemId);
      const itemName = targetItem ? targetItem.itemName : '';

      // Định dạng ghi chú để Manager biết đây là yêu cầu cấp phát chưa xuất thực tế
      const requestNotes = `[ĐANG CHỜ DUYỆT] Bảo mẫu ${employeeInfo?.fullName || 'Bảo mẫu'} yêu cầu cấp phát ${values.quantity} ${targetItem?.unit || 'đơn vị'} ${itemName}. Lý do: ${values.reason}`;

      // Tạo giao dịch nháp trong database (sẽ được quản lý duyệt trước khi trừ kho thực tế)
      await apiClient.post('/api/InventoryTransactions', {
        itemId: values.itemId,
        employeeId: employeeInfo?.id || null,
        type: 2, // Export (Yêu cầu xuất)
        quantity: values.quantity,
        transactionDate: dayjs().toISOString(),
        notes: requestNotes,
        referenceDocument: 'REQ-' + Math.floor(1000 + Math.random() * 9000)
      });

      message.success('Đã gửi yêu cầu vật tư lên Ban Quản lý phê duyệt.');
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error(error);
      message.error('Không thể gửi yêu cầu vật tư');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'referenceDocument',
      key: 'referenceDocument',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Thời gian gửi',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Vật tư',
      dataIndex: 'itemId',
      key: 'itemId',
      render: (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        return <Text strong>{item ? item.itemName : 'Vật tư khác'}</Text>;
      }
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Trạng thái duyệt',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => {
        if (notes?.includes('[ĐANG CHỜ DUYỆT]')) {
          return <Tag color="warning">Đang chờ duyệt</Tag>;
        }
        if (notes?.includes('[ĐÃ DUYỆT]')) {
          return <Tag color="success">Đã cấp phát</Tag>;
        }
        return <Tag color="default">Yêu cầu</Tag>;
      }
    },
    {
      title: 'Chi tiết / Lý do',
      dataIndex: 'notes',
      key: 'reason',
      render: (notes: string) => {
        const parts = notes?.split('Lý do: ');
        return parts && parts.length > 1 ? parts[1] : notes;
      }
    }
  ];

  return (
    <div className="p-1" style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* FORM GỬI YÊU CẦU */}
        <Card
          title={
            <Space>
              <MedicineBoxOutlined style={{ color: '#0ea5e9', fontSize: '20px' }} />
              <Title level={4} style={{ margin: 0 }}>Tạo yêu cầu cấp phát vật tư</Title>
            </Space>
          }
          style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="itemId"
              label="Chọn vật phẩm / Nhu yếu phẩm"
              rules={[{ required: true, message: 'Vui lòng chọn vật phẩm cần yêu cầu!' }]}
            >
              <Select placeholder="Chọn sữa, tã, bỉm, thực phẩm..." showSearch optionFilterProp="children">
                {items.map(item => (
                  <Option key={item.id} value={item.id}>
                    {item.itemName} (Hiện có: {item.currentQuantity} {item.unit})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Số lượng yêu cầu cấp phát"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng cần yêu cầu!' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập số lượng" />
            </Form.Item>

            <Form.Item
              name="reason"
              label="Lý do yêu cầu cấp phát"
              rules={[{ required: true, message: 'Vui lòng nhập lý do cụ thể!' }]}
            >
              <TextArea rows={4} placeholder="Ví dụ: Cấp phát sữa tươi buổi sáng cho phòng Hướng Dương..." />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={submitting}
              style={{ width: '100%', height: 40, borderRadius: 6, backgroundColor: '#0ea5e9' }}
            >
              Gửi yêu cầu vật tư
            </Button>
          </Form>
        </Card>

        {/* LỊCH SỬ YÊU CẦU */}
        <Card
          title={
            <Space>
              <HistoryOutlined style={{ color: '#8c8c8c', fontSize: '20px' }} />
              <Title level={4} style={{ margin: 0 }}>Lịch sử gửi yêu cầu của tôi</Title>
            </Space>
          }
          style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        >
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            style={{ borderRadius: 8 }}
          />
        </Card>
      </div>
    </div>
  );
};

export default SuppliesRequestManagement;
