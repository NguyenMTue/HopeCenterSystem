import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Typography, Card, Space, message, Modal, Form, Select, Input } from 'antd';
import { WarningOutlined, EditOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getIncidents } from '../../services/incidentService';
import apiClient from '../../services/apiClient';

const { Title, Text } = Typography;

const ManagerIncidentManagement: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // 1. LẤY DỮ LIỆU
  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const resData = await getIncidents();
      const res = resData.lists || [];
      
      const formattedData = res.map((item: any) => ({
        id: item.id,
        description: item.description || "Không có mô tả",
        severity: item.severity, 
        date: dayjs(item.incidentDate).format('DD/MM/YYYY HH:mm'),
        status: item.status || 'Đang chờ',
        childName: item.childName || "N/A",
        resolutionNotes: item.resolutionNotes || ""
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

  // 2. XỬ LÝ CẬP NHẬT TRẠNG THÁI VÀ GHI CHÚ
  const handleUpdateIncident = async (values: any) => {
    if (!selectedIncident) return;
    setSubmitting(true);
    try {
      const payload = {
        id: selectedIncident.id,
        status: values.status,
        resolutionNotes: values.resolutionNotes || ""
      };

      await apiClient.put(`/api/Incidents/${selectedIncident.id}`, payload);
      message.success('Đã cập nhật trạng thái sự cố thành công!');
      setIsModalOpen(false);
      setSelectedIncident(null);
      form.resetFields();
      fetchIncidents();
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra khi cập nhật sự cố!');
    } finally {
      setSubmitting(false);
    }
  };

  const openResolveModal = (record: any) => {
    setSelectedIncident(record);
    form.setFieldsValue({
      status: record.status,
      resolutionNotes: record.resolutionNotes
    });
    setIsModalOpen(true);
  };

  const columns = [
    { 
      title: 'Thông tin sự cố', 
      dataIndex: 'description', 
      key: 'description', 
      width: 300,
      render: (text: string, record: any) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: '15px' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>Trẻ liên quan: <b style={{ color: '#1e293b' }}>{record.childName}</b></Text>
        </Space>
      )
    },
    { 
      title: 'Mức độ', 
      dataIndex: 'severity', 
      key: 'severity',
      width: 120,
      render: (level: any) => {
        let color = 'orange';
        let levelText = 'TRUNG BÌNH';
        if (level === 'High' || level === 2) {
          color = 'red';
          levelText = 'NGHIÊM TRỌNG';
        } else if (level === 'Low' || level === 0) {
          color = 'blue';
          levelText = 'NHẸ';
        }
        return <Tag color={color} style={{ fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>{levelText}</Tag>
      }
    },
    { title: 'Thời gian xảy ra', dataIndex: 'date', key: 'date', width: 150 },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      width: 150,
      render: (status: string) => {
        let color = 'gold';
        if (status === 'Đã giải quyết') {
          color = 'green';
        } else if (status === 'Đang xử lý') {
          color = 'blue';
        }
        return (
          <Tag color={color} style={{ fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
            {status}
          </Tag>
        );
      }
    },
    {
      title: 'Giải quyết & Hướng xử lý',
      dataIndex: 'resolutionNotes',
      key: 'resolutionNotes',
      render: (text: string) => text ? <Text italic style={{ color: '#475569' }}>{text}</Text> : <Text type="secondary" style={{ fontSize: '13px' }}>Chưa cập nhật hướng giải quyết</Text>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          style={{ background: '#3b82f6', borderColor: '#3b82f6', fontWeight: 600 }}
          onClick={() => openResolveModal(record)}
        >
          Xử lý
        </Button>
      )
    }
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}><WarningOutlined style={{ color: '#ef4444' }} /> Quản lý xử lý Sự cố</Title>
      </div>

      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        bordered 
        loading={loading}
      />

      <Modal
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#3b82f6' }} />
            <span>Cập nhật phương án xử lý sự cố</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedIncident(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        centered
        width={600}
        okText="Lưu thông tin"
        cancelText="Hủy"
      >
        {selectedIncident && (
          <div style={{ marginBottom: 20 }}>
            <p><Text type="secondary">Nội dung sự cố:</Text> <Text strong>{selectedIncident.description}</Text></p>
            <p><Text type="secondary">Bé liên quan:</Text> <Text strong>{selectedIncident.childName}</Text></p>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateIncident}
        >
          <Form.Item name="status" label="Trạng thái xử lý" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}>
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="Đang chờ">Đang chờ</Select.Option>
              <Select.Option value="Đang xử lý">Đang xử lý</Select.Option>
              <Select.Option value="Đã giải quyết">Đã giải quyết</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="resolutionNotes" label="Ghi chú & Hướng giải quyết" rules={[{ required: true, message: 'Vui lòng nhập hướng giải quyết!' }]}>
            <Input.TextArea rows={4} placeholder="Ghi nhận cụ thể phương án xử lý, người thực hiện, thời gian..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ManagerIncidentManagement;
