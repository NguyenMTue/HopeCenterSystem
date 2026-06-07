import React, { useState, useMemo, useEffect } from 'react';
import { Table, Tag, Space, Button, Typography, Card, Input, Modal, Form, Select, InputNumber, message } from 'antd';
import { SearchOutlined, EyeOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiClient from '../../services/apiClient';
import { getDonations, createDonation, updateDonation } from '../../services/donationService';

const { Title, Text } = Typography;

const DonationManagement: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState<any>(null);

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
        date: item.receiveDate ? dayjs(item.receiveDate).format('DD/MM/YYYY HH:mm') : 'N/A',
        status: item.status || 'Chờ phê duyệt'
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
    const fetchUser = async () => {
      try {
        const res = await apiClient.get('/api/Users/me');
        setCurrentUser(res.data);
      } catch (e) {
        console.error('Lỗi khi lấy thông tin user:', e);
      }
    };
    fetchUser();
    fetchDonations();
  }, []);

  const userRoles = useMemo(() => currentUser?.roles || [], [currentUser]);
  const canApprove = useMemo(() => 
    userRoles.includes('Manager') || 
    userRoles.includes('Director') || 
    userRoles.includes('Administrator'), 
    [userRoles]
  );

  // 2. LOGIC TÌM KIẾM
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.donor?.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.type === 0 || item.type === 'Cash' ? 'tiền mặt' : 'vật phẩm').includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  // 3. XỬ LÝ THÊM MỚI
  const handleAdd = async (values: any) => {
    setLoading(true);
    try {
      await createDonation({
        donorName: values.donor,
        donationType: values.type === 'Tiền mặt' ? 0 : 1,
        totalAmount: values.amount || 0
      });
      message.success('Ghi nhận tài trợ thành công!');
      setIsModalOpen(false);
      form.resetFields();
      fetchDonations();
    } catch (error) {
      console.error(error);
      message.error('Ghi nhận tài trợ thất bại!');
    } finally {
      setLoading(false);
    }
  };

  // 4. XỬ LÝ PHÊ DUYỆT TÀI TRỢ
  const handleApprove = async (record: any) => {
    try {
      message.loading({ content: 'Đang phê duyệt khoản tài trợ...', key: 'approve' });
      await updateDonation(record.id, { id: record.id, status: 'Đã tiếp nhận' });
      message.success({ content: 'Đã phê duyệt khoản tài trợ thành công!', key: 'approve' });
      fetchDonations();
    } catch (error) {
      console.error(error);
      message.error({ content: 'Phê duyệt tài trợ thất bại!', key: 'approve' });
    }
  };

  // 5. CẤU HÌNH CỘT BẢNG
  const columns = [
    { 
      title: 'Nhà tài trợ', 
      dataIndex: 'donor', 
      key: 'donor', 
      render: (text: string) => <Text strong style={{ fontSize: 14 }}>{text}</Text> 
    },
    { 
      title: 'Hình thức', 
      dataIndex: 'type', 
      key: 'type',
      render: (type: any) => {
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
      render: (amount: number, record: any) => {
        const isCash = record.type === 0 || record.type === 'Cash';
        return isCash && amount > 0 ? (
          <Text style={{ color: '#f43f5e', fontWeight: 700 }}>
            {amount.toLocaleString()} đ
          </Text>
        ) : (
          <Tag color="purple">VẬT PHẨM</Tag>
        );
      }
    },
    { 
      title: 'Ngày đóng góp', 
      dataIndex: 'date', 
      key: 'date' 
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'Chờ phê duyệt') color = 'orange';
        else if (status === 'Đã tiếp nhận') color = 'green';
        else if (status?.startsWith('Đã phân bổ')) color = 'cyan';
        else if (status === 'Đã hoàn tất') color = 'success';
        return <Tag color={color} style={{ fontWeight: 600 }}>{status}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 220,
      render: (_: any, record: any) => (
        <Space size="middle">
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
                    <p><b>Hình thức:</b> {record.type === 0 || record.type === 'Cash' ? 'Tiền mặt' : 'Vật phẩm'}</p>
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
          {canApprove && record.status === 'Chờ phê duyệt' && (
            <Button
              type="primary"
              style={{ background: '#10b981', borderColor: '#10b981' }}
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record)}
            >
              Duyệt
            </Button>
          )}
        </Space>
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