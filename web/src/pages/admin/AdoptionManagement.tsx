import React, { useState, useMemo, useEffect } from 'react';
import { Table, Tag, Space, Button, Typography, Card, Input, Modal, message, Popconfirm, Descriptions, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
// IMPORT service (Đảm bảo bạn đã tạo file adoptionService.ts)
import { getAdoptionList } from '../../services/adoptionService'; 

const { Title, Text } = Typography;

const AdoptionManagement: React.FC = () => {
  // 1. QUẢN LÝ STATES
  const [data, setData] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // 2. GỌI API LẤY DỮ LIỆU THẬT
  const fetchAdoptions = async () => {
    setLoading(true);
    try {
      const res = await getAdoptionList();
      
      // Hàm dịch trạng thái từ Enum Backend sang Text
      const getStatusLabel = (status: any) => {
        // Tùy theo Enum bạn định nghĩa ở Backend (ví dụ 0, 1, 2 hoặc string)
        if (status === 0 || status === 'Pending') return 'Chờ duyệt';
        if (status === 1 || status === 'Approved') return 'Đã chấp nhận';
        if (status === 2 || status === 'Rejected') return 'Từ chối';
        if (status === 3 || status === 'Verifying') return 'Đang xác minh';
        return status;
      };

      const formattedData = res.map((item: any) => ({
        id: item.id,
        applicant: item.adopterName, // Theo Select mới ở Program.cs
        childName: item.childName,   // Theo Select mới ở Program.cs
        date: dayjs(item.submitDate).format('YYYY-MM-DD'),
        status: getStatusLabel(item.status),
        phone: item.phone || 'Chưa cập nhật',
        address: item.address || 'Chưa cập nhật',
        reason: item.notes || 'Không có ghi chú.'
      }));

      setData(formattedData);
    } catch (error) {
      message.error('Không thể tải danh sách đơn thẩm định!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdoptions();
  }, []);

  // 3. TÌM KIẾM
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.applicant?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.childName?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  // 4. XỬ LÝ DUYỆT / TỪ CHỐI (Tạm thời xử lý giao diện, sau sẽ nối API PUT)
  const updateStatus = (id: string, newStatus: string) => {
    setData(data.map(item => item.id === id ? { ...item, status: newStatus } : item));
    if (newStatus === 'Đã chấp nhận') message.success('Đã phê duyệt đơn đăng ký!');
    else if (newStatus === 'Từ chối') message.error('Đã từ chối đơn đăng ký.');
    else message.info(`Trạng thái: ${newStatus}`);
  };

  const openView = (record: any) => {
    setSelectedApp(record);
    setIsViewOpen(true);
  };

  // 5. CẤU HÌNH CỘT BẢNG
  const columns = [
    { 
      title: 'Người đăng ký', 
      dataIndex: 'applicant', 
      key: 'applicant', 
      render: (text: string) => <Text strong style={{ fontSize: 16 }}>{text}</Text> 
    },
    { title: 'Trẻ em đăng ký', dataIndex: 'childName', key: 'childName' },
    { title: 'Ngày gửi đơn', dataIndex: 'date', key: 'date', width: 120 },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status: string) => {
        let color = 'blue';
        if (status === 'Đã chấp nhận') color = 'green';
        if (status === 'Từ chối') color = 'red';
        if (status === 'Đang xác minh') color = 'orange';
        return <Tag color={color} style={{ fontWeight: 700, padding: '4px 12px', borderRadius: 6 }}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="middle">
          {record.status === 'Chờ duyệt' && (
            <Popconfirm title="Phê duyệt đơn này?" onConfirm={() => updateStatus(record.id, 'Đã chấp nhận')}>
              <Button type="text" icon={<CheckCircleOutlined />} style={{ color: '#10b981' }} />
            </Popconfirm>
          )}
          
          {record.status !== 'Từ chối' && (
            <Popconfirm title="Từ chối đơn này?" onConfirm={() => updateStatus(record.id, 'Từ chối')} okButtonProps={{ danger: true }}>
              <Button type="text" danger icon={<CloseCircleOutlined />} />
            </Popconfirm>
          )}

          <Button type="primary" ghost icon={<EyeOutlined />} onClick={() => openView(record)}>Chi tiết</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <Title level={2} style={{ margin: 0, color: '#1e293b' }}>Thẩm định Đơn nhận nuôi</Title>
        <Input 
          placeholder="Tìm tên người đăng ký hoặc tên bé..." 
          prefix={<SearchOutlined style={{ marginRight: 8 }} />} 
          style={{ width: 400, height: 45, borderRadius: 10 }}
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <Table 
        columns={columns} 
        dataSource={filteredData} 
        rowKey="id"
        pagination={{ pageSize: 5 }}
        bordered
        loading={loading}
      />

      <Modal
        title={<Title level={3} style={{ margin: 0 }}>Chi tiết đơn đăng ký nhận nuôi</Title>}
        open={isViewOpen}
        onCancel={() => setIsViewOpen(false)}
        footer={[
          <Button key="close" size="large" onClick={() => setIsViewOpen(false)}>Đóng</Button>,
          <Button key="verify" type="primary" size="large" style={{ background: '#f59e0b' }} onClick={() => updateStatus(selectedApp.id, 'Đang xác minh')}>
            Chuyển sang Xác minh
          </Button>
        ]}
        width={700}
        centered
      >
        {selectedApp && (
          <div style={{ marginTop: 24 }}>
            <Descriptions bordered column={1} labelStyle={{ fontWeight: 700, width: '200px', background: '#f8fafc' }}>
              <Descriptions.Item label="Họ tên người đăng ký">{selectedApp.applicant}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedApp.phone}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ cư trú">{selectedApp.address}</Descriptions.Item>
              <Descriptions.Item label="Trẻ em mong muốn nhận">{selectedApp.childName}</Descriptions.Item>
              <Descriptions.Item label="Ngày gửi yêu cầu">{selectedApp.date}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái hiện tại">
                  <Tag color="blue" style={{ fontWeight: 700 }}>{selectedApp.status}</Tag>
              </Descriptions.Item>
            </Descriptions>
            
<Divider style={{ marginTop: 24 }}>Lý do & Nguyện vọng</Divider>
            <div style={{ background: '#f1f5f9', padding: 20, borderRadius: 10, fontStyle: 'italic', fontSize: 16 }}>
              "{selectedApp.reason}"
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default AdoptionManagement;