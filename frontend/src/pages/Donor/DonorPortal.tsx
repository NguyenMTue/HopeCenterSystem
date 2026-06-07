import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Typography, 
  Space, 
  Button, 
  message, 
  Badge, 
  Modal, 
  Select, 
  Input, 
  Form, 
  Spin, 
  Alert, 
  Tabs,
  Progress,
  InputNumber,
  Row,
  Col,
  Statistic,
  List
} from 'antd';
import { 
  HeartOutlined, 
  GiftOutlined, 
  DownloadOutlined, 
  FileTextOutlined, 
  SearchOutlined,
  BellOutlined,
  CalendarOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import apiClient from '../../services/apiClient';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const DonorPortal: React.FC = () => {
  // Data States
  const [userInfo, setUserInfo] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Loading States
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [submittingDonation, setSubmittingDonation] = useState(false);

  // UI States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();
  const [donationType, setDonationType] = useState<'cash' | 'item'>('cash');
  const [selectedAmount, setSelectedAmount] = useState<number | 'other'>(200000);

  useEffect(() => {
    fetchUserData();
    fetchDonations();
    fetchInventoryItems();
    fetchNotifications();
  }, []);

  const fetchUserData = async () => {
    setLoadingUser(true);
    try {
      const response = await apiClient.get('/api/Users/me');
      setUserInfo(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      message.error('Không thể tải thông tin cá nhân.');
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchDonations = async (search = '') => {
    setLoadingDonations(true);
    try {
      // API GetDonations filters by DonorId if logged in user is a Donor on the backend
      const response = await apiClient.get('/api/Donations', {
        params: { PageNumber: 1, PageSize: 100, SearchTerm: search }
      });
      setDonations(response.data.items || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      message.error('Không thể tải danh sách tài trợ.');
    } finally {
      setLoadingDonations(false);
    }
  };

  const fetchInventoryItems = async () => {
    setLoadingItems(true);
    try {
      const response = await apiClient.get('/api/InventoryItems');
      setInventoryItems(response.data.lists || []);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await apiClient.get('/api/Notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.put(`/api/Notifications/${id}/mark-as-read`);
      fetchNotifications();
      message.success('Đã đánh dấu đã đọc');
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDonations(searchTerm);
  };

  const handleSubmitDonation = async (values: any) => {
    setSubmittingDonation(true);
    try {
      const finalAmount = donationType === 'cash'
        ? (selectedAmount === 'other' ? Number(values.amount) : Number(selectedAmount))
        : 0;

      const payload = {
        donationType: donationType === 'cash' ? 0 : 1,
        totalAmount: finalAmount,
        inventoryItemId: donationType === 'item' ? values.itemId : null,
        quantity: donationType === 'item' ? Number(values.quantity) : null
      };

      await apiClient.post('/api/Donations/submit', payload);
      message.success('Gửi yêu cầu tài trợ trực tuyến thành công! Hồ sơ đang chờ ban giám đốc phê duyệt.');
      setIsModalVisible(false);
      form.resetFields();
      setDonationType('cash');
      setSelectedAmount(200000);
      fetchDonations();
    } catch (error: any) {
      console.error('Error submitting donation:', error);
      const errorMsg = error.response?.data?.detail 
        || error.response?.data?.title 
        || (typeof error.response?.data === 'string' ? error.response?.data : null)
        || 'Có lỗi xảy ra khi thực hiện tài trợ.';
      message.error(errorMsg);
    } finally {
      setSubmittingDonation(false);
    }
  };

  const handleDownloadFile = async (url: string, defaultFilename: string) => {
    try {
      const response = await apiClient.get(url, {
        responseType: 'blob'
      });
      
      // Lấy filename từ content-disposition header nếu có
      let filename = defaultFilename;
      const disposition = response.headers['content-disposition'] as string | undefined;
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const blob = new Blob([response.data], { type: response.headers['content-type'] as string | undefined });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success(`Tải tập tin ${filename} thành công!`);
    } catch (error) {
      console.error('Error downloading file:', error);
      message.error('Không thể tải chứng từ. Vui lòng thử lại sau.');
    }
  };

  // Tính toán dữ liệu thống kê
  const approvedDonations = donations.filter(d => d.status === 'Đã tiếp nhận' || d.status === 'Đã hoàn tất');
  const totalCash = approvedDonations
    .filter(d => d.donationType === 0)
    .reduce((sum, d) => sum + d.totalAmount, 0);
  const totalItemsCount = approvedDonations
    .filter(d => d.donationType === 1)
    .reduce((sum, d) => sum + (d.quantity || 0), 0);

  const columns = [
    {
      title: 'Mã tài trợ',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text copyable={{ text: id }}>{id.substring(0, 8).toUpperCase()}</Text>
    },
    {
      title: 'Loại tài trợ',
      dataIndex: 'donationType',
      key: 'donationType',
      render: (type: number) => type === 0 ? 'Tiền mặt' : 'Hiện vật'
    },
    {
      title: 'Chi tiết khoản đóng góp',
      key: 'details',
      render: (_: any, record: any) => {
        if (record.donationType === 0) {
          return <Text strong style={{ color: '#16a34a' }}>{record.totalAmount.toLocaleString('vi-VN')} VND</Text>;
        } else {
          return <Text strong style={{ color: '#0284c7' }}>{record.itemName} ({record.quantity} {record.unit || 'đơn vị'})</Text>;
        }
      }
    },
    {
      title: 'Ngày tiếp nhận',
      dataIndex: 'receiveDate',
      key: 'receiveDate',
      render: (date: string) => new Date(date).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })
    },
    {
      title: 'Phê duyệt',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'gold';
        let icon = <ClockCircleOutlined />;
        if (status === 'Đã tiếp nhận' || status === 'Đã hoàn tất') {
          color = 'green';
          icon = <CheckCircleOutlined />;
        } else if (status === 'Đã hủy') {
          color = 'red';
          icon = <CloseCircleOutlined />;
        }
        return <Tag color={color} icon={icon}>{status}</Tag>;
      }
    },
    {
      title: 'Trạng thái giải ngân / Phân bổ',
      dataIndex: 'disbursementStatus',
      key: 'disbursementStatus',
      render: (disbursementStatus: string, record: any) => {
        if (record.status === 'Chờ phê duyệt') {
          return <Tag color="default">Chờ duyệt hồ sơ</Tag>;
        }
        let percent = 0;
        if (disbursementStatus === 'Đã hoàn tất') percent = 100;
        else if (disbursementStatus.includes('%')) {
          percent = parseInt(disbursementStatus.replace(/[^0-9]/g, '')) || 50;
        } else if (disbursementStatus === 'Đã tiếp nhận') {
          percent = 0;
        }

        return (
          <div style={{ minWidth: 150 }}>
            <Text style={{ fontSize: 13 }} type="secondary">{disbursementStatus}</Text>
            <Progress percent={percent} size="small" status={percent === 100 ? 'success' : 'active'} />
          </div>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: any) => {
        const isApproved = record.status === 'Đã tiếp nhận' || record.status === 'Đã hoàn tất';
        return (
          <Space>
            <Button 
              type="link" 
              icon={<DownloadOutlined />} 
              disabled={!isApproved}
              onClick={() => handleDownloadFile(`/api/Donations/${record.id}/export-receipt`, `ChungTuTaiTro_${record.id.substring(0,8).toUpperCase()}.txt`)}
            >
              Chứng từ
            </Button>
            <Button 
              type="link" 
              icon={<FileTextOutlined />} 
              disabled={!isApproved}
              onClick={() => handleDownloadFile(`/api/Donations/${record.id}/export-thankyou`, `ThuCamOn_${record.id.substring(0,8).toUpperCase()}.txt`)}
            >
              Thư cảm ơn
            </Button>
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Banner chào mừng */}
      <Card 
        style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
          color: 'white', 
          borderRadius: 16, 
          marginBottom: 24,
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
      >
        <Row align="middle" justify="space-between">
          <Col xs={24} md={16}>
            <Space direction="vertical" size="small">
              <Tag color="rose" style={{ borderRadius: 6, fontWeight: 600 }}>CỔNG THÔNG TIN NHÀ TÀI TRỢ</Tag>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                Xin chào, {userInfo?.fullName || 'Nhà tài trợ quý mến'}!
              </Title>
              <Paragraph style={{ color: '#94a3b8', fontSize: 15, margin: 0 }}>
                Cảm ơn bạn đã đồng hành cùng Hope Center để mang lại tương lai tươi sáng hơn cho các trẻ em mồ côi và cơ nhỡ.
              </Paragraph>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right', marginTop: 16 }}>
            <Space wrap>
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />} 
                style={{ background: '#f43f5e', border: 'none', borderRadius: 8 }}
                onClick={() => setIsModalVisible(true)}
              >
                Tài trợ trực tuyến
              </Button>
              <Button 
                icon={<DownloadOutlined />} 
                size="large"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                onClick={() => handleDownloadFile('/api/Donations/export-report', 'BaoCaoTaiChinhCaNhan.csv')}
              >
                Xuất báo cáo tài chính
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Thống kê */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <Statistic 
              title={<Text style={{ color: '#64748b' }}>Tổng tiền mặt đã đóng góp</Text>}
              value={totalCash}
              precision={0}
              valueStyle={{ color: '#16a34a', fontWeight: 700 }}
              suffix="VND"
              prefix={<HeartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <Statistic 
              title={<Text style={{ color: '#64748b' }}>Tổng hiện vật đã đóng góp</Text>}
              value={totalItemsCount}
              valueStyle={{ color: '#0ea5e9', fontWeight: 700 }}
              suffix="vật phẩm"
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <Statistic 
              title={<Text style={{ color: '#64748b' }}>Số lượt tài trợ thực hiện</Text>}
              value={donations.length}
              valueStyle={{ color: '#f43f5e', fontWeight: 700 }}
              suffix="lượt"
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs nội dung */}
      <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={setActiveTab} style={{ background: 'white', padding: 24, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
        <Tabs.TabPane tab={<span><GiftOutlined />Lịch sử tài trợ &amp; Giải ngân</span>} key="1">
          {/* Bộ tìm kiếm */}
          <Form layout="inline" onSubmitCapture={handleSearch} style={{ marginBottom: 20 }}>
            <Form.Item style={{ flex: 1, maxWidth: 400 }}>
              <Input 
                prefix={<SearchOutlined />} 
                placeholder="Tra cứu mã tài trợ hoặc tên hiện vật..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Tra cứu</Button>
            </Form.Item>
          </Form>

          {/* Bảng dữ liệu */}
          <Table 
            columns={columns} 
            dataSource={donations} 
            rowKey="id" 
            loading={loadingDonations}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'Không tìm thấy dữ liệu đóng góp nào.' }}
          />
        </Tabs.TabPane>

        <Tabs.TabPane 
          tab={
            <span>
              <BellOutlined />
              Thông báo chiến dịch mới 
              {notifications.filter(n => !n.isRead).length > 0 && (
                <Badge count={notifications.filter(n => !n.isRead).length} style={{ marginLeft: 6, backgroundColor: '#f43f5e' }} />
              )}
            </span>
          } 
          key="2"
        >
          <List
            loading={loadingNotifications}
            itemLayout="horizontal"
            dataSource={notifications}
            locale={{ emptyText: 'Không có thông báo mới nào từ ban giám đốc.' }}
            renderItem={(item: any) => (
              <List.Item
                style={{ 
                  padding: '16px 24px', 
                  borderRadius: 12, 
                  marginBottom: 12, 
                  background: item.isRead ? '#f8fafc' : '#fff1f2',
                  border: item.isRead ? '1px solid #f1f5f9' : '1px solid #ffe4e6',
                  transition: 'all 0.3s'
                }}
                actions={[
                  !item.isRead && (
                    <Button type="link" onClick={() => handleMarkAsRead(item.id)}>
                      Đánh dấu đã đọc
                    </Button>
                  )
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ background: item.isRead ? '#e2e8f0' : '#ffe4e6', color: item.isRead ? '#64748b' : '#f43f5e', width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BellOutlined style={{ fontSize: 18 }} />
                    </div>
                  }
                  title={
                    <Space>
                      <Text strong style={{ fontSize: 15 }}>{item.title}</Text>
                      {!item.isRead && <Badge status="error" />}
                    </Space>
                  }
                  description={
                    <div>
                      <Paragraph style={{ margin: '4px 0 8px 0', color: '#475569' }}>{item.message}</Paragraph>
                      <Space style={{ fontSize: 12, color: '#94a3b8' }}>
                        <CalendarOutlined />
                        <Text type="secondary">{new Date(item.created).toLocaleString('vi-VN')}</Text>
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Tabs.TabPane>
      </Tabs>

      {/* Modal Tài trợ trực tuyến */}
      <Modal
        title={<Title level={3} style={{ margin: 0, color: '#f43f5e' }}>Thực hiện tài trợ trực tuyến</Title>}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setDonationType('cash');
          setSelectedAmount(200000);
        }}
        footer={null}
        destroyOnClose
        width={550}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Alert 
          message="Hồ sơ tài trợ tự động" 
          description="Khoản tài trợ của bạn sẽ tự động tạo hồ sơ chờ duyệt trên hệ thống. Sau khi được duyệt, hệ thống sẽ tự sinh Thư cảm ơn &amp; Chứng từ để bạn có thể tải về."
          type="info" 
          showIcon 
          style={{ marginBottom: 20, borderRadius: 8 }}
        />

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmitDonation}
          initialValues={{ type: 'cash' }}
        >
          <Form.Item 
            name="type" 
            label={<Text strong>Hình thức tài trợ *</Text>}
            rules={[{ required: true }]}
          >
            <Select 
              size="large"
              onChange={(val: 'cash' | 'item') => setDonationType(val)}
              style={{ borderRadius: 8 }}
            >
              <Option value="cash">Tiền mặt (Chuyển khoản / Trực tuyến)</Option>
              <Option value="item">Vật tư &amp; Nhu yếu phẩm (Hiện vật)</Option>
            </Select>
          </Form.Item>

          {donationType === 'cash' ? (
            <Form.Item label={<Text strong>Chọn mức đóng góp (VNĐ) *</Text>}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                {[
                  { value: 200000, label: '200,000' },
                  { value: 500000, label: '500,000' },
                  { value: 1000000, label: '1,000,000' },
                  { value: 2000000, label: '2,000,000' },
                  { value: 5000000, label: '5,000,000' },
                  { value: 'other', label: 'Khác...' },
                ].map((preset) => (
                  <div 
                    key={preset.value}
                    onClick={() => setSelectedAmount(preset.value as any)}
                    style={{
                      padding: '12px',
                      border: `1px solid ${selectedAmount === preset.value ? '#f43f5e' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontWeight: 700,
                      background: selectedAmount === preset.value ? 'rgba(244, 63, 94, 0.05)' : '#fff',
                      color: selectedAmount === preset.value ? '#f43f5e' : '#0f172a',
                      transition: 'all 0.2s'
                    }}
                  >
                    {preset.label}
                  </div>
                ))}
              </div>
              {selectedAmount === 'other' && (
                <Form.Item
                  name="amount"
                  noStyle
                  rules={[
                    { required: true, message: 'Vui lòng điền số tiền tài trợ!' },
                    { type: 'number', min: 10000, message: 'Số tiền tối thiểu là 10,000 VND!' }
                  ]}
                >
                  <InputNumber 
                    size="large"
                    style={{ width: '100%', borderRadius: 8 }} 
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => (value ? value.replace(/\$\s?|(,*)|\s?/g, '') : '') as any}
                    placeholder="Ví dụ: 1,000,000"
                    min={10000}
                  />
                </Form.Item>
              )}
            </Form.Item>
          ) : (
            <>
              <Form.Item
                name="itemId"
                label={<Text strong>Chọn loại vật tư đóng góp *</Text>}
                rules={[{ required: true, message: 'Vui lòng chọn loại vật tư!' }]}
              >
                <Select 
                  size="large"
                  placeholder="Chọn vật tư trong danh mục kho" 
                  loading={loadingItems}
                  style={{ borderRadius: 8 }}
                >
                  {inventoryItems.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.itemName} (Hiện có: {item.currentQuantity} {item.unit})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="quantity"
                label={<Text strong>Số lượng đóng góp *</Text>}
                rules={[
                  { required: true, message: 'Vui lòng điền số lượng!' },
                  { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' }
                ]}
              >
                <InputNumber 
                  size="large"
                  style={{ width: '100%', borderRadius: 8 }} 
                  placeholder="Ví dụ: 10" 
                  min={1} 
                />
              </Form.Item>
            </>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)} size="large" style={{ borderRadius: 8 }}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submittingDonation} 
                size="large" 
                style={{ background: '#f43f5e', border: 'none', borderRadius: 8 }}
              >
                Xác nhận tài trợ
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DonorPortal;
