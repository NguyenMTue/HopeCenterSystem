import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Typography, Card, Alert, Space, message, Modal, Form, Select, DatePicker, Input } from 'antd';
import { WarningOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getIncidents } from '../../services/incidentService';
import apiClient from '../../services/apiClient';

const { Title, Text } = Typography;

const IncidentManagement: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [form] = Form.useForm();

  // 1. GỌI API LẤY DỮ LIỆU THẬT
  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const resData = await getIncidents();
      // Incidents dùng .lists
      const res = resData.lists || [];
      
      const formattedData = res.map((item: any) => ({
        id: item.id,
        title: item.description || "Sự cố không có tiêu đề", // Dùng description nếu không có title
        // Chuyển đổi mức độ (Nếu DB trả về số hoặc tiếng Anh)
        severity: item.severity, 
        date: dayjs(item.incidentDate).format('DD/MM/YYYY HH:mm'),
        status: item.status || 'Đang chờ',
        childName: item.childName || "N/A"
      }));

      setData(formattedData);
    } catch (error) {
      message.error("Không thể tải danh sách sự cố!");
    } finally {
      setLoading(false);
    }
  };

  const fetchChildrenAndUser = async () => {
    try {
      const [childrenRes, meRes] = await Promise.all([
        apiClient.get('/api/Children', { params: { PageNumber: 1, PageSize: 100 } }),
        apiClient.get('/api/Users/me')
      ]);
      setChildren(childrenRes.data.items || []);
      setCurrentUser(meRes.data);
    } catch (error) {
      console.error("Lỗi lấy thông tin phụ trợ:", error);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchChildrenAndUser();
  }, []);

  const handleCreateIncident = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        childId: values.childId,
        reporterId: currentUser?.employeeId || null,
        incidentDate: values.incidentDate ? values.incidentDate.toISOString() : dayjs().toISOString(),
        description: values.description,
        severity: values.severity // 0, 1, 2
      };

      await apiClient.post('/api/Incidents', payload);
      message.success('Đã gửi báo cáo sự cố thành công!');
      setIsModalOpen(false);
      form.resetFields();
      fetchIncidents();
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra khi tạo báo cáo sự cố!');
    } finally {
      setSubmitting(false);
    }
  };

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
        let levelText = 'TRUNG BÌNH';
        if (level === 'High' || level === 2) {
          color = 'red';
          levelText = 'NGHIÊM TRỌNG';
        } else if (level === 'Low' || level === 0) {
          color = 'blue';
          levelText = 'NHẸ';
        }
        return <Tag color={color}>{levelText}</Tag>
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
        <Button 
          type="primary" 
          danger 
          icon={<PlusOutlined />} 
          style={{ borderRadius: 8, height: 40 }}
          onClick={() => {
            form.setFieldsValue({ incidentDate: dayjs() });
            setIsModalOpen(true);
          }}
        >
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

      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: '#ef4444' }} />
            <span>Tạo Báo Cáo Sự Cố Mới</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        centered
        width={600}
        okText="Gửi báo cáo"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateIncident}
          style={{ marginTop: 20 }}
          initialValues={{ severity: 1 }}
        >
          <Form.Item
            name="childId"
            label="Trẻ em liên quan"
            rules={[{ required: true, message: 'Vui lòng chọn trẻ em!' }]}
          >
            <Select 
              placeholder="Chọn trẻ em từ danh sách" 
              showSearch 
              optionFilterProp="label"
            >
              {children.map(child => (
                <Select.Option key={child.id} value={child.id} label={child.fullName}>
                  {child.fullName} (Phòng: {child.roomName || 'Chưa xếp phòng'})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="incidentDate"
            label="Thời gian xảy ra"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian xảy ra sự cố!' }]}
          >
            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="severity"
            label="Mức độ nghiêm trọng"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ nghiêm trọng!' }]}
          >
            <Select placeholder="Chọn mức độ">
              <Select.Option value={0}>Nhẹ (Low)</Select.Option>
              <Select.Option value={1}>Trung bình (Medium)</Select.Option>
              <Select.Option value={2}>Nghiêm trọng (High)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Chi tiết sự cố / Biện pháp xử lý ban đầu"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả sự cố!' }]}
          >
            <Input.TextArea rows={4} placeholder="Mô tả cụ thể sự việc xảy ra, các triệu chứng hoặc tổn thương (nếu có), và biện pháp sơ cứu đã thực hiện..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default IncidentManagement;