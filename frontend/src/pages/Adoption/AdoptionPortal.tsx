import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Space, Button, message, Badge, Timeline, Steps, Modal } from 'antd';
import { 
  FileSearchOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined,
  EyeOutlined,
  BellOutlined,
  HeartOutlined
} from '@ant-design/icons';
import apiClient from '../../services/apiClient';

const { Title, Text } = Typography;

const AdoptionPortal: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Giả sử API trả về danh sách đơn đăng ký của user hiện tại
        const response = await apiClient.get('/api/AdoptionApplications/my');
        setApplications(response.data);
      } catch (error) {
        // Mock data nếu API chưa có
        setApplications([
          {
            id: 'APP-001',
            childCode: 'CH-042',
            childName: 'Bé Trai (CH-042)',
            status: 'Pending',
            appliedDate: '2026-05-10',
            lastUpdated: '2026-05-12',
            notes: 'Hồ sơ đang được thẩm định bước 1.',
            timeline: [
              { status: 'Gửi hồ sơ', date: '2026-05-10', done: true },
              { status: 'Thẩm định hồ sơ', date: '2026-05-12', done: true },
              { status: 'Phỏng vấn', date: '', done: false },
              { status: 'Kiểm tra gia cảnh', date: '', done: false },
              { status: 'Hoàn tất', date: '', done: false },
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'Pending': return <Tag color="warning" icon={<ClockCircleOutlined />}>ĐANG CHỜ</Tag>;
      case 'Approved': return <Tag color="success" icon={<CheckCircleOutlined />}>ĐÃ DUYỆT</Tag>;
      case 'Rejected': return <Tag color="error" icon={<CloseCircleOutlined />}>BỊ TỪ CHỐI</Tag>;
      default: return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: 'Trẻ em',
      dataIndex: 'childName',
      key: 'childName',
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'appliedDate',
      key: 'appliedDate',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => {
              setSelectedApp(record);
              setIsModalVisible(true);
            }}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '0px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1e293b' }}>Cổng thông tin Người nhận nuôi</Title>
          <Text type="secondary">Theo dõi trạng thái và quản lý hồ sơ đăng ký nhận nuôi của bạn.</Text>
        </div>
        <Badge count={2} dot>
          <Button icon={<BellOutlined />} shape="circle" size="large" />
        </Badge>
      </div>

      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <Card hoverable style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Space direction="vertical">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <HeartOutlined style={{ fontSize: 24, color: '#f43f5e' }} />
              </div>
              <Title level={4} style={{ margin: 0 }}>Đăng ký nhận nuôi</Title>
              <Text type="secondary">Tìm hiểu về các bé và gửi hồ sơ nguyện vọng nhận nuôi mới.</Text>
              <Button type="primary" style={{ background: '#f43f5e', borderColor: '#f43f5e', borderRadius: 8, marginTop: 8 }}>
                Bắt đầu ngay
              </Button>
            </Space>
          </Card>

          <Card hoverable style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Space direction="vertical">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <FileSearchOutlined style={{ fontSize: 24, color: '#3b82f6' }} />
              </div>
              <Title level={4} style={{ margin: 0 }}>Hồ sơ cá nhân</Title>
              <Text type="secondary">Cập nhật thông tin gia cảnh để tăng khả năng xét duyệt hồ sơ.</Text>
              <Button variant="outlined" style={{ borderRadius: 8, marginTop: 8 }}>
                Cập nhật
              </Button>
            </Space>
          </Card>
        </div>

        {/* Applications Table */}
        <Card 
          title={<Space><ClockCircleOutlined /> Lịch sử hồ sơ đã gửi</Space>}
          style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}
        >
          <Table 
            columns={columns} 
            dataSource={applications} 
            rowKey="id" 
            loading={loading}
            pagination={false}
          />
        </Card>
      </Space>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết hồ sơ: ${selectedApp?.id}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>Đóng</Button>
        ]}
        width={700}
      >
        {selectedApp && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: 32 }}>
              <Title level={5}>Tiến độ thẩm định</Title>
              <Steps
                current={selectedApp.timeline.filter((t: any) => t.done).length - 1}
                size="small"
                items={selectedApp.timeline.map((t: any) => ({
                  title: t.status,
                  description: t.date,
                }))}
              />
            </div>

            <Card style={{ background: '#f8fafc', borderRadius: 12 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Thông tin trẻ em:</Text>
                <Text>{selectedApp.childName}</Text>
                <Divider style={{ margin: '8px 0' }} />
                <Text strong>Ghi chú từ Trung tâm:</Text>
                <Text>{selectedApp.notes}</Text>
              </Space>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

const Divider = ({ style }: { style?: React.CSSProperties }) => <div style={{ height: 1, background: '#e2e8f0', ...style }} />;

export default AdoptionPortal;