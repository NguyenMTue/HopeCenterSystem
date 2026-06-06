import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Input, Space, Typography, Modal, Form, Select, DatePicker, message, Popconfirm, Card, Tag } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getMedicalRecords, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord } from '../../services/medicalRecordService';
import { getChildrenList } from '../../services/childService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const MedicalRecordManagement: React.FC = () => {
  // 1. QUẢN LÝ STATES
  const [records, setRecords] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // States cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  
  const [form] = Form.useForm();

  // 2. GỌI API LẤY DỮ LIỆU
  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách bệnh án
      const recordRes = await getMedicalRecords();
      // Đối với Minimal API, lists chứa mảng bệnh án
      setRecords(recordRes.lists || []);

      // Lấy danh sách trẻ em để gán vào Select box khi tạo/sửa bệnh án
      const childRes = await getChildrenList();
      setChildren(childRes.items || []);
    } catch (error) {
      message.error('Không thể tải dữ liệu y tế. Vui lòng kiểm tra lại kết nối!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Map tên trẻ em từ danh sách children
  const childrenMap = useMemo(() => {
    return new Map(children.map(c => [c.id, c.fullName]));
  }, [children]);

  // 3. BỘ LỌC TÌM KIẾM
  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      const childName = childrenMap.get(item.childId) || '';
      return (
        childName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.diagnosis?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.doctorName?.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  }, [records, searchText, childrenMap]);

  // 4. XỬ LÝ CLICK THÊM MỚI / SỬA / XÓA
  const handleOpenAddModal = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ checkupDate: dayjs() });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({
      childId: record.childId,
      checkupDate: record.checkupDate ? dayjs(record.checkupDate) : null,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      doctorName: record.doctorName,
      notes: record.notes,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedicalRecord(id);
      message.success('Xóa hồ sơ bệnh án thành công');
      fetchData();
    } catch (error) {
      message.error('Không thể xóa hồ sơ bệnh án');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        checkupDate: values.checkupDate.toISOString(),
      };

      if (editingRecord) {
        // Update
        await updateMedicalRecord(editingRecord.id, {
          id: editingRecord.id,
          ...payload,
        });
        message.success('Cập nhật hồ sơ bệnh án thành công');
      } else {
        // Create
        await createMedicalRecord(payload);
        message.success('Thêm mới hồ sơ bệnh án thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      message.error('Vui lòng kiểm tra lại thông tin nhập liệu');
    }
  };

  // 5. ĐỊNH NGHĨA CỘT BẢNG DỮ LIỆU
  const columns = [
    {
      title: 'Tên Trẻ Em',
      dataIndex: 'childId',
      key: 'childId',
      render: (childId: string) => <Text strong>{childrenMap.get(childId) || 'Đang tải...'}</Text>,
    },
    {
      title: 'Ngày Khám',
      dataIndex: 'checkupDate',
      key: 'checkupDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a: any, b: any) => dayjs(a.checkupDate).unix() - dayjs(b.checkupDate).unix(),
    },
    {
      title: 'Chẩn Đoán',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      render: (text: string) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', fontWeight: 500, color: '#e11d48' }}>{text}</div>,
    },
    {
      title: 'Phác Đồ / Điều Trị',
      dataIndex: 'treatment',
      key: 'treatment',
      ellipsis: true,
    },
    {
      title: 'Bác Sĩ Điều Trị',
      dataIndex: 'doctorName',
      key: 'doctorName',
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="primary" 
            ghost
            icon={<EditOutlined />} 
            onClick={() => handleOpenEditModal(record)} 
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa hồ sơ này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button 
              type="primary" 
              danger 
              ghost
              icon={<DeleteOutlined />} 
            />
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
            <FileTextOutlined style={{ color: '#0ea5e9', fontSize: '20px' }} />
            <Title level={4} style={{ margin: 0 }}>Quản lý Hồ sơ Bệnh án Điện tử</Title>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleOpenAddModal}
            style={{ borderRadius: 6, backgroundColor: '#0ea5e9' }}
          >
            Thêm Bệnh Án Mới
          </Button>
        }
        style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
      >
        {/* Thanh tìm kiếm */}
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo tên trẻ, chẩn đoán, hoặc tên bác sĩ..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 400, borderRadius: 6 }}
            allowClear
          />
        </div>

        {/* Bảng danh sách bệnh án */}
        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          style={{ borderRadius: 8 }}
        />
      </Card>

      {/* POPUP / MODAL THÊM MỚI VÀ CẬP NHẬT BỆNH ÁN */}
      <Modal
        title={editingRecord ? 'Cập Nhật Hồ Sơ Bệnh Án' : 'Thêm Mới Hồ Sơ Bệnh Án'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText={editingRecord ? 'Cập nhật' : 'Lưu lại'}
        cancelText="Hủy"
        width={650}
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical" 
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="childId"
            label="Chọn Trẻ Em"
            rules={[{ required: true, message: 'Vui lòng chọn trẻ em!' }]}
          >
            <Select 
              placeholder="Chọn trẻ em cần lập bệnh án" 
              showSearch 
              optionFilterProp="children"
            >
              {children.map(child => (
                <Option key={child.id} value={child.id}>
                  {child.fullName} - {child.id.substring(0,8).toUpperCase()}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="checkupDate"
            label="Ngày Giờ Khám"
            rules={[{ required: true, message: 'Vui lòng chọn ngày khám!' }]}
          >
            <DatePicker 
              showTime 
              format="YYYY-MM-DD HH:mm" 
              style={{ width: '100%' }} 
            />
          </Form.Item>

          <Form.Item
            name="doctorName"
            label="Bác Sĩ Khám / Điều Trị"
            rules={[{ required: true, message: 'Vui lòng nhập tên bác sĩ!' }]}
          >
            <Input placeholder="Nhập tên bác sĩ hoặc y tá phụ trách" />
          </Form.Item>

          <Form.Item
            name="diagnosis"
            label="Chẩn Đoán Bệnh"
            rules={[{ required: true, message: 'Vui lòng nhập chẩn đoán!' }]}
          >
            <Input placeholder="Ví dụ: Sốt xuất huyết, Suy dinh dưỡng thể nhẹ..." />
          </Form.Item>

          <Form.Item
            name="treatment"
            label="Phác Đồ & Cách Thức Điều Trị"
          >
            <TextArea 
              rows={3} 
              placeholder="Nhập loại thuốc, liều lượng dùng, chế độ ăn uống khuyên dùng..." 
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi Chú Theo Dõi Sức Khỏe"
          >
            <TextArea 
              rows={2} 
              placeholder="Các biểu hiện cần chú ý thêm (ví dụ: cần đo nhiệt độ 4 tiếng/lần)" 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicalRecordManagement;
