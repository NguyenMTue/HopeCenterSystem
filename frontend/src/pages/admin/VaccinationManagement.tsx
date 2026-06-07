import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Space, Typography, Modal, Form, Select, DatePicker, message, Popconfirm, Card, Tag, Input } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiClient from '../../services/apiClient';

const { Title, Text } = Typography;
const { Option } = Select;

const VaccinationManagement: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchVaccinations = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/Vaccinations');
      setData(res.data.lists || []);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải lịch tiêm chủng');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const childRes = await apiClient.get('/api/Children', {
        params: { PageNumber: 1, PageSize: 100 }
      });
      setChildren(childRes.data.items || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchVaccinations();
    fetchChildren();
  }, []);

  const childrenMap = useMemo(() => {
    return new Map(children.map(c => [c.id, c.fullName]));
  }, [children]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const name = childrenMap.get(item.childId) || item.childName || '';
      return (
        name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.vaccineName?.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  }, [data, searchText, childrenMap]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ date: dayjs(), status: 'Chờ tiêm' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: any) => {
    setEditingItem(record);
    form.setFieldsValue({
      childId: record.childId,
      vaccineName: record.vaccineName,
      date: dayjs(record.vaccinationDate),
      dose: record.dose,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/api/Vaccinations/${id}`);
      message.success('Xóa lịch tiêm chủng thành công');
      fetchVaccinations();
    } catch (error) {
      console.error(error);
      message.error('Không thể xóa lịch tiêm chủng');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        childId: values.childId,
        vaccineName: values.vaccineName,
        dose: values.dose,
        vaccinationDate: values.date.toISOString(),
        status: values.status,
      };

      if (editingItem) {
        await apiClient.put(`/api/Vaccinations/${editingItem.id}`, payload);
        message.success('Cập nhật lịch tiêm chủng thành công');
      } else {
        await apiClient.post('/api/Vaccinations', payload);
        message.success('Lên lịch tiêm chủng mới thành công');
      }
      setIsModalOpen(false);
      fetchVaccinations();
    } catch (error) {
      console.error(error);
      message.error('Không thể lưu thông tin lịch tiêm chủng');
    }
  };

  const columns = [
    {
      title: 'Trẻ Em',
      dataIndex: 'childId',
      key: 'childId',
      render: (childId: string, record: any) => <Text strong>{childrenMap.get(childId) || record.childName}</Text>,
    },
    {
      title: 'Vắc-xin',
      dataIndex: 'vaccineName',
      key: 'vaccineName',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Mũi tiêm',
      dataIndex: 'dose',
      key: 'dose',
    },
    {
      title: 'Ngày Tiêm',
      dataIndex: 'vaccinationDate',
      key: 'vaccinationDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Trạng Thế',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Đã tiêm' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleOpenEditModal(record)} />
          <Popconfirm
            title="Xóa lịch tiêm chủng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger ghost icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-1">
      <Card 
        title={
          <Space>
            <CalendarOutlined style={{ color: '#ec4899', fontSize: '20px' }} />
            <Title level={4} style={{ margin: 0 }}>Theo dõi Lịch Tiêm chủng & Khám định kỳ</Title>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleOpenAddModal}
            style={{ borderRadius: 6, backgroundColor: '#ec4899', borderColor: '#ec4899' }}
          >
            Thêm Lịch Mới
          </Button>
        }
        style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm theo tên trẻ, tên vắc-xin..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 400, borderRadius: 6 }}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title={editingItem ? 'Sửa Lịch Tiêm Chủng' : 'Thêm Lịch Tiêm Chủng'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText={editingItem ? 'Cập nhật' : 'Lưu lại'}
        cancelText="Hủy"
        width={550}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="childId"
            label="Chọn Trẻ Em"
            rules={[{ required: true, message: 'Vui lòng chọn trẻ em!' }]}
          >
            <Select placeholder="Chọn trẻ em">
              {children.map(child => (
                <Option key={child.id} value={child.id}>{child.fullName}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="vaccineName"
            label="Tên Vắc-xin / Mũi khám"
            rules={[{ required: true, message: 'Vui lòng nhập tên vắc-xin/lịch khám!' }]}
          >
            <Input placeholder="Ví dụ: Lao, Uốn ván, Khám sức khỏe định kỳ..." />
          </Form.Item>

          <Form.Item
            name="dose"
            label="Mũi Tiêm Thứ mấy / Lần khám"
            rules={[{ required: true, message: 'Vui lòng nhập số mũi tiêm!' }]}
          >
            <Input placeholder="Ví dụ: Mũi 1, Mũi 2, Khám tổng quát..." />
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày Tiêm / Ngày khám"
            rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng Thái"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Chờ tiêm">Chờ thực hiện / Chờ tiêm</Option>
              <Option value="Đã tiêm">Đã hoàn thành / Đã tiêm</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VaccinationManagement;
