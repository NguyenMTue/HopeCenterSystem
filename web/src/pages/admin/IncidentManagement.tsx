import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Typography, Card, Alert, Space, message } from 'antd';
import { WarningOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getIncidents } from '../../services/incidentService';

const { Title, Text } = Typography;

const IncidentManagement: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. GỌI API LẤY DỮ LIỆU THẬT
  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await getIncidents();
      
      const formattedData = res.map((item: any) => ({
        id: item.id,
        title: item.title,
        // Chuyển đổi mức độ (Nếu DB trả về số hoặc tiếng Anh)
        severity: item.severity, 
        date: dayjs(item.date).format('DD/MM/YYYY HH:mm'),
        status: item.status || 'Đang chờ',
        childName: item.childName
      }));

      setData(formattedData);
    } catch (error) {
      message.error("Không thể tải danh sách sự cố!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const columns = [
    { 
      title: 'Sự cố / Nội dung', 
      dataIndex: 'title', 
      key: 'title', 
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>Đối tượng: {record.childName}</Text>
        </Space>
      )
    },
    { 
      title: 'Mức độ', 
      dataIndex: 'severity', 
      key: 'severity',
      render: (level: any) => {
        let color = 'orange';
        if (level === 'Nghiêm trọng' || level === 'High' || level === 2) color = 'red';
        if (level === 'Thấp' || level === 'Low' || level === 0) color = 'blue';
        return <Tag color={color}>{level?.toString().toUpperCase()}</Tag>
      }
    },
    { title: 'Ngày ghi nhận', dataIndex: 'date', key: 'date' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag icon={status === 'Đã giải quyết' ? <CheckCircleOutlined /> : null} color={status === 'Đã giải quyết' ? 'green' : 'volcano'}>
          {status}
        </Tag>
      )
    },
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2}><WarningOutlined style={{ color: '#ef4444' }} /> Báo cáo Sự cố</Title>
        <Button type="primary" danger icon={<PlusOutlined />} style={{ borderRadius: 8, height: 40 }}>
          Báo cáo sự cố mới
        </Button>
      </div>

      <Alert
        message="Lưu ý: Các sự cố cấp cứu y tế cần được xử lý ngay lập tức trước khi ghi báo cáo hệ thống."
        type="warning"
        showIcon
        style={{ marginBottom: 24, borderRadius: 8 }}
      />

      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        bordered 
        loading={loading}
      />
    </Card>
  );
};

export default IncidentManagement;