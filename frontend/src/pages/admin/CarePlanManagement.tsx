import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag, Button, Typography, Card, Space, Input, Modal, Form, Select, DatePicker, message } from 'antd';
import { MedicineBoxOutlined, PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
// Import các service cần thiết
import { getCarePlans } from '../../services/carePlanService';
import { getChildrenList } from '../../services/childService'; 

const { Title, Text } = Typography;

const CarePlanManagement: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]); // Danh sách bé để chọn
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 1. GỌI API LẤY DỮ LIỆU
  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansData, childrenData] = await Promise.all([
        getCarePlans(),
        getChildrenList()
      ]);

      // CarePlans dùng .lists, Children dùng .items
      const plansRes = plansData.lists || [];
      const childrenRes = childrenData.items || [];

      const formattedPlans = plansRes.map((p: any) => ({
        id: p.id,
        childName: p.childName,
        type: 'Chung', // Bạn có thể thêm trường Type vào DB nếu cần
        goal: p.title,
        description: p.description,
        startDate: dayjs(p.startDate).format('YYYY-MM-DD'),
        endDate: dayjs(p.endDate).format('YYYY-MM-DD'),
        status: p.status === 1 ? 'Đang thực hiện' : p.status === 2 ? 'Hoàn thành' : 'Chưa bắt đầu'
      }));

      setData(formattedPlans);
      setChildren(childrenRes); // Lưu danh sách bé vào state
    } catch (error) {
      message.error("Lỗi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (values: any) => {
    // Bước này sẽ gọi API POST, tạm thời cập nhật giao diện để bạn test
    message.loading('Đang xử lý...');
    setIsModalOpen(false);
    fetchData(); // Load lại dữ liệu sau khi thêm
  };

  const columns = [
    { title: 'Tên trẻ em', dataIndex: 'childName', key: 'childName', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Kế hoạch', dataIndex: 'goal', key: 'goal', width: 250 },
    { title: 'Thời hạn', key: 'duration', render: (_: any, record: any) => `${record.startDate} -> ${record.endDate}` },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        let color = status === 'Đang thực hiện' ? 'processing' : status === 'Hoàn thành' ? 'success' : 'default';
        return <Tag color={color}>{status}</Tag>
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: () => <Button icon={<EditOutlined />} type="text" />
    }
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2}><MedicineBoxOutlined /> Kế hoạch Chăm sóc</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} style={{ background: '#f43f5e', height: 40 }}>
          Lập kế hoạch mới
        </Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" bordered loading={loading} />

      <Modal title="Lập kế hoạch mới" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} centered width={600}>
        <Form form={form} layout="vertical" onFinish={handleAdd} style={{ marginTop: 20 }}>
          {/* SỬA THÀNH SELECT ĐỂ CHỌN BÉ TỪ DB */}
          <Form.Item name="childId" label="Chọn trẻ em" rules={[{ required: true, message: 'Vui lòng chọn bé!' }]}>
            <Select placeholder="Chọn trẻ em từ danh sách" showSearch optionFilterProp="label">
              {children.map(child => (
                <Select.Option key={child.id} value={child.id} label={child.fullName}>
                  {child.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="title" label="Tiêu đề kế hoạch" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Điều trị dứt điểm ho kéo dài" />
          </Form.Item>

          <Form.Item name="dateRange" label="Thời gian thực hiện" rules={[{ required: true }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="description" label="Chi tiết nội dung">
            <Input.TextArea rows={4} placeholder="Nhập các bước thực hiện cụ thể..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CarePlanManagement;