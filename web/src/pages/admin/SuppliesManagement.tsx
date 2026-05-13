import React, { useState, useMemo, useEffect } from 'react';
import { Table, Tag, Button, Typography, Card, Space, Input, Modal, Form, Select, InputNumber, message, Progress, Popconfirm, Timeline } from 'antd';
import { BoxPlotOutlined, PlusOutlined, SearchOutlined, EditOutlined, HistoryOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
// Giả định bạn đã tạo file service này
import { getInventoryList, deleteInventoryItem } from '../../services/inventoryService';

const { Title, Text } = Typography;

const SuppliesManagement: React.FC = () => {
  // 1. QUẢN LÝ STATE
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<any>(null);

  const [form] = Form.useForm();

  // 2. LẤY DỮ LIỆU TỪ BACKEND
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await getInventoryList();
      // Map dữ liệu từ SQL (ItemId, CurrentQuantity...) sang định dạng Frontend
      const formattedData = res.map((item: any) => ({
        id: item.id, // ItemId từ Backend
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        minLevel: item.minLevel || 10,
        status: item.status
      }));
      setData(formattedData);
    } catch (error) {
      message.error("Không thể tải dữ liệu kho vật tư!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // 3. XỬ LÝ TÌM KIẾM
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  // 4. XỬ LÝ XÓA
  const handleDelete = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      message.success('Đã xóa vật tư khỏi hệ thống!');
      fetchInventory();
    } catch (error) {
      message.error('Lỗi khi thực hiện xóa!');
    }
  };

  const handleSave = async (values: any) => {
    // Tạm thời xử lý local, bạn có thể nối API POST/PUT tương tự các trang trước
    message.success('Thao tác thành công!');
    setIsModalOpen(false);
    fetchInventory();
  };

  // 5. CẤU HÌNH CỘT BẢNG
  const columns = [
    { 
      title: 'Tên vật tư', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text: string) => <Text strong style={{ fontSize: 16 }}>{text}</Text> 
    },
    { 
      title: 'Phân loại', 
      dataIndex: 'category', 
      key: 'category', 
      render: (cat: string) => <Tag color="geekblue">{cat}</Tag> 
    },
    { 
      title: 'Số lượng tồn kho', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (qty: number, record: any) => {
        const isLow = qty <= record.minLevel;
        return (
          <Space direction="vertical" style={{ width: '100%', minWidth: 150 }}>
            <Text strong style={{ color: isLow ? '#ef4444' : 'inherit' }}>
              {qty} {record.unit}
            </Text>
            <Progress 
              percent={qty > 100 ? 100 : (qty / (record.minLevel * 2)) * 100} 
              size="small" 
              status={isLow ? 'exception' : 'active'} 
              strokeColor={isLow ? '#ef4444' : '#10b981'}
              showInfo={false} 
            />
          </Space>
        );
      }
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Còn hàng' ? 'green' : 'red'} style={{ fontWeight: 700 }}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<HistoryOutlined />} onClick={() => { setHistoryItem(record); setIsHistoryOpen(true); }}>
            Lịch sử
          </Button>
          <Button icon={<EditOutlined />} type="text" onClick={() => { setEditingItem(record); form.setFieldsValue(record); setIsModalOpen(true); }} style={{ color: '#3b82f6' }} />
          <Popconfirm title="Xóa vật tư này?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}><BoxPlotOutlined /> Quản lý Vật tư & Kho</Title>
        <Space>
          <Input 
            placeholder="Tìm tên vật tư..." 
            prefix={<SearchOutlined style={{ color: '#94a3b8' }}/>} 
            style={{ width: 300, height: 40, borderRadius: 10 }}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => { setEditingItem(null); form.resetFields(); setIsModalOpen(true); }} 
            style={{ background: '#f43f5e', height: 40, borderRadius: 10, fontWeight: 600 }}
          >
            Nhập kho mới
          </Button>
        </Space>
      </div>

      <Table columns={columns} dataSource={filteredData} rowKey="id" bordered loading={loading} />

      {/* MODAL THÊM / SỬA */}
      <Modal 
        title={<Title level={3}>{editingItem ? 'Cập nhật vật tư' : 'Nhập kho vật tư mới'}</Title>} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onOk={() => form.submit()} 
        centered
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 20 }}>
          <Form.Item name="name" label="Tên vật tư" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="category" label="Phân loại" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="Thực phẩm">Thực phẩm</Select.Option>
                <Select.Option value="Y tế">Y tế</Select.Option>
                <Select.Option value="Nhu yếu phẩm">Nhu yếu phẩm</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true }]}>
              <Input size="large" placeholder="Ví dụ: Kg, Hộp..." />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="quantity" label="Số lượng tồn" rules={[{ required: true }]}>
              <InputNumber size="large" min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="minLevel" label="Mức cảnh báo tối thiểu">
              <InputNumber size="large" min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* MODAL LỊCH SỬ TĨNH */}
      <Modal
        title={<Title level={3}>Lịch sử nhập/xuất: {historyItem?.name}</Title>}
        open={isHistoryOpen}
        onCancel={() => setIsHistoryOpen(false)}
        footer={[<Button key="close" onClick={() => setIsHistoryOpen(false)}>Đóng</Button>]}
        centered
      >
        <div style={{ marginTop: 30, padding: '0 20px' }}>
          <Timeline
            items={[
              { color: 'green', children: 'Hôm nay - Nhập thêm 20 đơn vị từ nguồn Tài trợ (Vinamilk)' },
              { color: 'blue', children: 'Hôm qua - Xuất 5 đơn vị cho khu chăm sóc trẻ sơ sinh' },
              { color: 'gray', children: '01/05/2026 - Khởi tạo tồn kho ban đầu' },
            ]}
          />
        </div>
      </Modal>
    </Card>
  );
};

export default SuppliesManagement;