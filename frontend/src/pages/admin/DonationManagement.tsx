import React, { useState, useMemo, useEffect } from 'react';
import { Table, Tag, Space, Button, Typography, Card, Input, Modal, Form, Select, InputNumber, message } from 'antd';
import { SearchOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
// Đảm bảo bạn đã import đúng đường dẫn service
import { getDonations } from '../../services/donationService';

const { Title, Text } = Typography;

const DonationManagement: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 1. GỌI API LẤY DỮ LIỆU TỪ SQL SERVER
  const fetchDonations = async () => {
    setLoading(true);
    try {
      const resData = await getDonations();
      const res = resData.items || [];
      // Map dữ liệu từ Backend (DonorName, TotalAmount...) sang Frontend
      const formattedData = res.map((item: any) => ({
        id: item.id,
        donor: item.donorName,
        type: item.donationType,
        amount: item.totalAmount,
        date: item.receiveDate ? dayjs(item.receiveDate).format('DD/MM/YYYY') : 'N/A',
        status: item.status || 'Đã nhận'
      }));
      setData(formattedData);
    } catch (error) {
      message.error("Không thể kết nối với máy chủ để lấy dữ liệu tài trợ!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // 2. LOGIC TÌM KIẾM
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.donor?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.type?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  // 3. XỬ LÝ THÊM MỚI (TẠM THỜI LOCAL, BẠN CÓ THỂ NỐI POST SAU)
  const handleAdd = async (values: any) => {
    message.success('Ghi nhận tài trợ thành công!');
    setIsModalOpen(false);
    form.resetFields();
    // Sau này nối API POST xong thì gọi fetchDonations() ở đây
  };

  // 4. CẤU HÌNH CỘT BẢNG
  const columns = [
    { 
      title: 'Nhà tài trợ', 
      dataIndex: 'donor', 
      key: 'donor', 
      render: (text: string) => <Text strong style={{ fontSize: 15 }}>{text}</Text> 
    },
    { 
      title: 'Hình thức', 
      dataIndex: 'type', 
      key: 'type',
      render: (type: any) => {
        // Map backend enum (0: Cash, 1: Item) to display text
        let displayType = 'N/A';
        if (type === 0 || type === 'Cash') displayType = 'Tiền mặt';
        else if (type === 1 || type === 'Item') displayType = 'Vật phẩm';
        
        const isCash = displayType === 'Tiền mặt';

        return (
          <Tag color={isCash ? 'gold' : 'purple'} style={{ fontWeight: 700 }}>
            {displayType.toUpperCase()}
          </Tag>
        );
      }
    },
    { 
      title: 'Giá trị tài trợ', 
      dataIndex: 'amount', 
      key: 'amount',
      render: (amount: number) => amount > 0 ? (
        <Text style={{ color: '#f43f5e', fontWeight: 700 }}>
          {amount.toLocaleString()} đ
        </Text>
      ) : (
        <Tag color="default">VẬT PHẨM</Tag>
      )
    },
    { title: 'Ngày đóng góp', dataIndex: 'date', key: 'date' },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Button 
          type="primary" 
          ghost 
          icon={<EyeOutlined />} 
          onClick={() => {
            Modal.info({
              title: 'Chi tiết khoản đóng góp',
              content: (
                <div style={{ marginTop: 20 }}>
                  <p><b>Nhà tài trợ:</b> {record.donor}</p>
                  <p><b>Hình thức:</b> {record.type}</p>
                  <p><b>Trạng thái hệ thống:</b> {record.status}</p>
                  <p><b>Ngày ghi nhận:</b> {record.date}</p>
                </div>
              ),
              centered: true
            });
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <Title level={2} style={{ margin: 0, color: '#1e293b' }}>Quản lý Tài trợ</Title>
        <Space size="middle">
          <Input 
            placeholder="Tìm nhà tài trợ..." 
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} 
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300, borderRadius: 10, height: 40 }}
            allowClear
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsModalOpen(true)} 
            style={{ background: '#f43f5e', borderRadius: 10, height: 40, fontWeight: 600 }}
          >
            Ghi nhận đóng góp
          </Button>
        </Space>
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredData} 
        rowKey="id" 
        bordered 
        loading={loading}
        pagination={{ pageSize: 6 }}
      />

      <Modal 
        title={<Title level={4}>Thêm khoản tài trợ mới</Title>} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        centered
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd} style={{ marginTop: 20 }}>
          <Form.Item name="donor" label="Tên nhà tài trợ (Cá nhân/Tổ chức)" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Công ty sữa Vinamilk" />
          </Form.Item>
          
          <Form.Item name="type" label="Hình thức tài trợ" rules={[{ required: true }]}>
            <Select placeholder="Chọn hình thức">
              <Select.Option value="Tiền mặt">Tiền mặt</Select.Option>
              <Select.Option value="Vật phẩm">Vật phẩm / Hiện vật</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="amount" label="Giá trị quy đổi (VNĐ)">
            <InputNumber 
              style={{ width: '100%' }} 
              min={0}
              placeholder="Nhập số tiền..."
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
              // Sửa lỗi parser as any để TypeScript không báo đỏ
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú thêm">
            <Input.TextArea rows={3} placeholder="Ví dụ: 50 thùng sữa, hỗ trợ tiền ăn..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default DonationManagement;