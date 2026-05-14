import React, { useState, useMemo, useEffect } from 'react';
import { Table, Tag, Button, Card, Space, Typography, Avatar, Input, Modal, Form, Select, message, Popconfirm } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
// Import service
import { getEmployees } from '../../services/employeeService';

const { Title, Text } = Typography;

const EmployeeManagement: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  // 1. FETCH DỮ LIỆU THẬT
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const resData = await getEmployees();
      // Backend trả về PaginatedList có property items
      const items = resData.items || [];
      // Map FullName -> name, Position -> role
      const formattedData = items.map((item: any) => ({
        ...item,
        name: item.fullName,
        role: item.position
      }));
      setData(formattedData);
    } catch (error) {
      message.error("Không thể tải danh sách nhân viên từ máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 2. TÌM KIẾM
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.name?.toLowerCase().includes(searchText.toLowerCase()) || 
      item.role?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  // 3. MỞ MODAL
  const openModal = (record: any = null) => {
    setEditingItem(record);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
    setIsModalOpen(true);
  };

  // 4. LƯU DỮ LIỆU (Nối API POST/PUT ở đây)
  const handleSave = async (values: any) => {
    // Logic: Gọi API createEmployee hoặc updateEmployee
    message.loading('Đang xử lý...');
    setIsModalOpen(false);
    // Sau khi xử lý API thành công, gọi lại fetchEmployees()
    // fetchEmployees(); 
  };

  // 5. XÓA DỮ LIỆU
  const handleDelete = async (id: string) => {
    // Logic: Gọi API deleteEmployee
    message.success('Đã xóa hồ sơ nhân viên!');
    // fetchEmployees();
  };

  const columns = [
    { 
      title: 'Nhân viên', 
      key: 'user', 
      render: (_: any, record: any) => (
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ backgroundColor: record.role === 'Bác sĩ' ? '#3b82f6' : '#f43f5e' }} 
          />
          <div>
            <Text strong>{record.name}</Text><br/>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.role}</Text>
          </div>
        </Space>
      )
    },
    { 
      title: 'Liên hệ', 
      key: 'contact', 
      render: (_: any, record: any) => (
        <div>
          <Text><MailOutlined /> {record.email || 'N/A'}</Text><br/>
          <Text><PhoneOutlined /> {record.phone || 'N/A'}</Text>
        </div>
      )
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (status: string) => {
        let color = 'green';
        if (status === 'Nghỉ phép') color = 'orange';
        if (status === 'Đã nghỉ việc') color = 'red';
        return <Tag color={color}>{status?.toUpperCase() || 'ĐANG LÀM VIỆC'}</Tag>
      }
    },
    { 
      title: 'Hành động', 
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openModal(record)} style={{ color: '#3b82f6' }} />
          <Popconfirm title="Xóa nhân viên này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ) 
    }
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý Nhân viên</Title>
        <Space>
          <Input 
            placeholder="Tìm tên, chức vụ..." 
            prefix={<SearchOutlined />} 
            onChange={e => setSearchText(e.target.value)} 
            style={{ width: 250, height: 40, borderRadius: 8 }}
            allowClear
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => openModal()} 
            style={{ background: '#f43f5e', height: 40, borderRadius: 8, fontWeight: 600 }}
          >
            Thêm nhân viên
          </Button>
        </Space>
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredData} 
        rowKey="id" 
        loading={loading}
        bordered
      />

      <Modal 
        title={<Title level={4} style={{ margin: 0 }}>{editingItem ? "Sửa thông tin" : "Thêm nhân viên mới"}</Title>} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onOk={() => form.submit()} 
        centered
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 20 }}>
          <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input size="large" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
            <Form.Item name="role" label="Chức vụ" rules={[{ required: true }]}>
              <Select size="large" placeholder="Chọn chức vụ">
                <Select.Option value="Bảo mẫu">Bảo mẫu</Select.Option>
                <Select.Option value="Bác sĩ">Bác sĩ</Select.Option>
                <Select.Option value="Kế toán">Kế toán</Select.Option>
                <Select.Option value="Quản lý">Quản lý</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
            <Input size="large" />
          </Form.Item>
          {editingItem && (
            <Form.Item name="status" label="Trạng thái">
              <Select size="large">
                <Select.Option value="Đang làm việc">Đang làm việc</Select.Option>
                <Select.Option value="Nghỉ phép">Nghỉ phép</Select.Option>
                <Select.Option value="Đã nghỉ việc">Đã nghỉ việc</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default EmployeeManagement;