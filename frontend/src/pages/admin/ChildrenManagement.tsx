import React, { useState, useMemo, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, Typography, Modal, Form, Select, DatePicker, message, Popconfirm, Upload } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getChildrenList, deleteChild, createChild, updateChild } from '../../services/childService';
import apiClient from '../../services/apiClient';

const { Title, Text } = Typography;
const { Option } = Select;

const ChildrenManagement: React.FC = () => {
  // 1. QUẢN LÝ STATES
  const [data, setData] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false); 
  const [isAdopter, setIsAdopter] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [searchText, setSearchText] = useState(''); 
  
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); 
  const [editingChild, setEditingChild] = useState<any>(null); 
  
  const [uploading, setUploading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');

  const [form] = Form.useForm(); 

  // 2. GỌI API LẤY DỮ LIỆU TỪ BACKEND
  const fetchChildrenData = async () => {
    setLoading(true);
    try {
      const responseData = await getChildrenList();
      const rawData = responseData.items || [];
      
      const getStatusText = (statusValue: number) => {
        switch(statusValue) {
          case 0: return 'Đang bảo trợ';
          case 1: return 'Đã được nhận nuôi';
          case 2: return 'Đang nằm viện';
          case 3: return 'Đã chuyển tuyến';
          case 4: return 'Chờ phê duyệt';
          default: return 'Không xác định';
        }
      };

      const formattedData = rawData.map((item: any) => ({
        id: item.id, 
        code: item.id.substring(0, 8).toUpperCase(), 
        name: item.fullName,
        age: item.dob ? dayjs().diff(dayjs(item.dob), 'year') : 'N/A',
        gender: item.gender === 0 ? 'Nam' : item.gender === 1 ? 'Nữ' : 'Khác',
        admissionDate: item.admissionDate,
        status: getStatusText(item.status), 
        health: item.healthStatus,
        avatarUrl: item.avatarUrl
      }));

      setData(formattedData);
    } catch (error) {
      message.error('Không thể tải dữ liệu từ máy chủ. Vui lòng kiểm tra lại Backend!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await apiClient.get('/api/Users/me');
        const roles = response.data.roles || [];
        setUserRoles(roles);
        if (roles.includes('Adopter')) {
          setIsAdopter(true);
        }
      } catch (error) {
        console.error('Failed to fetch user roles', error);
      }
    };
    fetchUserRole();
    fetchChildrenData();
  }, []);

  // 3. CHỨC NĂNG TÌM KIẾM
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  // 4. XỬ LÝ MỞ MODAL
  const handleView = (record: any) => {
    setEditingChild(record);
    setIsViewModalOpen(true);
  };

  const openEditModal = (record: any = null) => {
    setEditingChild(record); 
    setIsModalOpen(true);
    
    if (record) {
      form.setFieldsValue({
        ...record,
        admissionDate: dayjs(record.admissionDate), 
        avatarUrl: record.avatarUrl
      });
      if (record.avatarUrl) {
        const baseUrl = apiClient.defaults.baseURL || 'http://localhost:5176';
        setPreviewImageUrl(record.avatarUrl.startsWith('http') ? record.avatarUrl : `${baseUrl}${record.avatarUrl}`);
      } else {
        setPreviewImageUrl('');
      }
    } else {
      form.resetFields();
      setPreviewImageUrl('');
    }
  };

  // 4.5 XỬ LÝ UPLOAD FILE ẢNH
  const handleCustomUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    try {
      const response = await apiClient.post('/api/Attachments/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const filePath = response.data.filePath;
      form.setFieldValue('avatarUrl', filePath);
      
      const baseUrl = apiClient.defaults.baseURL || 'http://localhost:5176';
      setPreviewImageUrl(filePath.startsWith('http') ? filePath : `${baseUrl}${filePath}`);
      
      onSuccess("OK");
      message.success("Tải ảnh lên thành công!");
    } catch (err) {
      console.error(err);
      onError(err);
      message.error("Tải ảnh lên thất bại!");
    } finally {
      setUploading(false);
    }
  };

  // 5. XỬ LÝ LƯU (Nối API POST/PUT xuống Backend)
  const handleSave = async () => {
    try {
      const values = await form.validateFields(); 
      
      const genderMap: Record<string, number> = { 'Nam': 0, 'Nữ': 1, 'Khác': 2 };
      const genderVal = genderMap[values.gender] !== undefined ? genderMap[values.gender] : 0;

      const statusMap: Record<string, number> = {
        'Đang bảo trợ': 0,
        'Đã được nhận nuôi': 1,
        'Đang nằm viện': 2,
        'Đã chuyển tuyến': 3,
        'Chờ phê duyệt': 4
      };
      
      const statusVal = editingChild 
        ? (statusMap[values.status] !== undefined ? statusMap[values.status] : 4)
        : 4;

      const payload = {
        fullName: values.name,
        dob: editingChild?.dob || dayjs().subtract(Number(values.age), 'year').format('YYYY-MM-DD'),
        gender: genderVal,
        healthStatus: values.health || 'Khỏe mạnh',
        background: editingChild?.background || 'Thông tin bảo mật',
        roomId: editingChild?.roomId || null,
        status: statusVal,
        admissionDate: values.admissionDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        weight: editingChild?.weight || 15,
        height: editingChild?.height || 100,
        avatarUrl: values.avatarUrl || ''
      };

      if (editingChild) {
        const updatePayload = {
          id: editingChild.id,
          ...payload
        };
        await updateChild(editingChild.id, updatePayload);
        message.success(`Đã cập nhật hồ sơ bé ${values.name} thành công!`);
      } else {
        await createChild(payload);
        message.success(`Đã thêm hồ sơ mới cho bé ${values.name} thành công và đang chờ Director phê duyệt!`);
      }

      setIsModalOpen(false);
      setEditingChild(null);
      fetchChildrenData(); 
    } catch (error) {
      console.error('Save Failed:', error);
      message.error('Không thể lưu hồ sơ trẻ. Vui lòng kiểm tra lại!');
    }
  };

  // 5.5 XỬ LÝ PHÊ DUYỆT HỒ SƠ (Chỉ dành cho Director)
  const handleApprove = async (record: any) => {
    try {
      const response = await apiClient.get(`/api/Children/${record.id}`);
      const childData = response.data;
      
      const payload = {
        id: childData.id,
        fullName: childData.fullName,
        dob: childData.dob,
        gender: childData.gender,
        healthStatus: childData.healthStatus,
        background: childData.background,
        roomId: childData.roomId,
        status: 0, 
        admissionDate: childData.admissionDate,
        weight: childData.weight,
        height: childData.height,
        avatarUrl: childData.avatarUrl
      };
      
      await updateChild(record.id, payload);
      message.success(`Đã phê duyệt hồ sơ bé ${record.name} thành công sang trạng thái Đang bảo trợ!`);
      fetchChildrenData();
    } catch (error) {
      console.error('Approval Failed:', error);
      message.error('Không thể phê duyệt hồ sơ. Vui lòng thử lại!');
    }
  };

  // 6. XỬ LÝ XÓA
  const handleDelete = async (id: string) => {
    try {
      await deleteChild(id); 
      setData(data.filter(item => item.id !== id)); 
      message.success('Đã xóa hồ sơ khỏi hệ thống thành công!');
    } catch (error) {
      message.error('Không thể xóa hồ sơ. Vui lòng thử lại!');
      console.error(error);
    }
  };

  // 7. CẤU HÌNH CỘT BẢNG
  const columns = [
    {
      title: 'Ảnh đại diện',
      dataIndex: 'avatarUrl',
      key: 'avatarUrl',
      width: 100,
      render: (url: string) => {
        const baseUrl = apiClient.defaults.baseURL || 'http://localhost:5176';
        const displayUrl = url ? (url.startsWith('http') ? url : `${baseUrl}${url}`) : 'https://via.placeholder.com/150';
        return (
          <img 
            src={displayUrl} 
            alt="Avatar" 
            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%', border: '2px solid #f3f4f6' }} 
          />
        );
      }
    },
    { title: 'Mã hồ sơ', dataIndex: 'code', key: 'code', width: 100, render: (text: string) => <b>{text}</b> },
    { title: 'Họ và tên', dataIndex: 'name', key: 'name', render: (text: string) => <Text strong style={{ fontSize: 15 }}>{text}</Text> },
    { title: 'Tuổi', dataIndex: 'age', key: 'age', width: 70 },
    { title: 'Giới tính', dataIndex: 'gender', key: 'gender', width: 90 },
    { title: 'Ngày tiếp nhận', dataIndex: 'admissionDate', key: 'admissionDate', width: 130, render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status: string) => {
        let color = 'blue';
        if (status === 'Đã được nhận nuôi') color = 'green';
        else if (status === 'Đang nằm viện') color = 'red';
        else if (status === 'Đã chuyển tuyến') color = 'orange';
        else if (status === 'Chờ phê duyệt') color = 'gold';
        return <Tag color={color} style={{ fontWeight: 600, padding: '2px 10px', borderRadius: 6 }}>{status}</Tag>;
      },
    },
    ...(!isAdopter ? [{
      title: 'Hành động',
      key: 'action',
      width: 220,
      fixed: 'right' as const, 
      render: (_: any, record: any) => {
        const isDirector = userRoles.includes('Director');
        const isPending = record.status === 'Chờ phê duyệt';
        return (
          <Space size="small">
            {isDirector && isPending && (
              <Popconfirm
                title="Phê duyệt hồ sơ"
                description={`Bạn có chắc chắn muốn phê duyệt hồ sơ của bé ${record.name}?`}
                onConfirm={() => handleApprove(record)}
                okText="Phê duyệt"
                cancelText="Hủy"
                okButtonProps={{ style: { background: '#10b981' } }}
              >
                <Button type="primary" size="small" style={{ background: '#10b981', borderColor: '#10b981', fontWeight: 600 }}>
                  Duyệt
                </Button>
              </Popconfirm>
            )}
            <Button type="text" icon={<EyeOutlined />} style={{ color: '#10b981' }} onClick={() => handleView(record)} />
            <Button type="text" icon={<EditOutlined />} style={{ color: '#3b82f6' }} onClick={() => openEditModal(record)} />
            <Popconfirm
              title="Xóa hồ sơ"
              description={`Bạn có chắc chắn muốn xóa hồ sơ của bé ${record.name}?`}
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa ngay"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    }] : [])
  ];

  return (
    <div style={{ background: '#fff', padding: 28, borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#1e293b', fontSize: 28 }}>Quản lý Hồ sơ Trẻ em</Title>
        {!isAdopter && (
          <Button 
            type="primary" 
            size="large" 
            icon={<PlusOutlined />} 
            style={{ background: '#f43f5e', fontWeight: 600, height: 45, borderRadius: 10 }}
            onClick={() => openEditModal()} 
          >
            Thêm hồ sơ mới
          </Button>
        )}
      </div>

      {/* TÌM KIẾM */}
      <div style={{ marginBottom: 24 }}>
        <Input 
          size="large" 
          placeholder="Tìm kiếm theo tên hoặc mã hồ sơ..." 
          prefix={<SearchOutlined style={{ color: '#94a3b8', marginRight: 8 }} />} 
          style={{ width: 450, borderRadius: 10, height: 45 }} 
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)} 
        />
      </div>

      {/* BẢNG DỮ LIỆU */}
      <Table 
        columns={columns} 
        dataSource={filteredData} 
        rowKey="id" 
        pagination={{ pageSize: 5, showSizeChanger: false }} 
        scroll={{ x: 1000 }} 
        bordered={true}
        loading={loading} 
      />

      {/* --- MODAL 1: THÊM & SỬA HỒ SƠ --- */}
      <Modal
        title={<Title level={3} style={{ margin: 0 }}>{editingChild ? `Chỉnh sửa hồ sơ: ${editingChild.code}` : 'Thêm hồ sơ trẻ em mới'}</Title>}
        open={isModalOpen}
        onOk={handleSave} 
        onCancel={() => setIsModalOpen(false)} 
        okText={editingChild ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy bỏ"
        width={650}
        centered
        okButtonProps={{ style: { background: '#f43f5e', height: 40, fontWeight: 600 } }}
        cancelButtonProps={{ style: { height: 40 } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
              <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn A" />
            </Form.Item>
            <Form.Item name="admissionDate" label="Ngày tiếp nhận" rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
            </Form.Item>
            <Form.Item name="age" label="Tuổi" rules={[{ required: true, message: 'Vui lòng nhập tuổi!' }]}>
              <Input type="number" placeholder="Ví dụ: 5" />
            </Form.Item>
            <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn!' }]}>
              <Select placeholder="Chọn giới tính">
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
                <Option value="Khác">Khác</Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item label="Ảnh đại diện của bé">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
              <img 
                src={previewImageUrl || 'https://via.placeholder.com/150'} 
                alt="Preview Avatar" 
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', border: '2px solid #e2e8f0' }} 
              />
              <Upload
                accept="image/*"
                showUploadList={false}
                customRequest={handleCustomUpload}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  Chọn ảnh từ máy tính
                </Button>
              </Upload>
            </div>
            <Form.Item name="avatarUrl" noStyle>
              <Input type="hidden" />
            </Form.Item>
          </Form.Item>
          {editingChild && (
            <Form.Item name="status" label="Trạng thái chăm sóc" rules={[{ required: true, message: 'Vui lòng chọn!' }]}>
              <Select placeholder="Chọn trạng thái">
                <Option value="Đang bảo trợ">Đang bảo trợ</Option>
                <Option value="Đã được nhận nuôi">Đã được nhận nuôi</Option>
                <Option value="Đang nằm viện">Đang nằm viện</Option>
                <Option value="Đã chuyển tuyến">Đã chuyển tuyến</Option>
                <Option value="Chờ phê duyệt">Chờ phê duyệt</Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item name="health" label="Tình trạng sức khỏe">
            <Input.TextArea rows={3} placeholder="Mô tả tình trạng sức khỏe, bệnh lý (nếu có)..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* --- MODAL 2: XEM CHI TIẾT HỒ SƠ --- */}
      <Modal
        title={<Title level={3} style={{ margin: 0 }}>Chi tiết hồ sơ: {editingChild?.code}</Title>}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[<Button key="close" onClick={() => setIsViewModalOpen(false)}>Đóng</Button>]}
        width={600}
        centered
      >
        {editingChild && (
          <div style={{ marginTop: 24, fontSize: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <img 
                src={editingChild.avatarUrl ? (editingChild.avatarUrl.startsWith('http') ? editingChild.avatarUrl : `${apiClient.defaults.baseURL || 'http://localhost:5176'}${editingChild.avatarUrl}`) : 'https://via.placeholder.com/150'} 
                alt="Avatar" 
                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '50%', border: '4px solid #f43f5e', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
              />
            </div>
            <p><Text type="secondary">Họ và tên:</Text> <Text strong style={{ fontSize: 18 }}>{editingChild.name}</Text></p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <p><Text type="secondary">Giới tính:</Text> <Text strong>{editingChild.gender}</Text></p>
              <p><Text type="secondary">Tuổi:</Text> <Text strong>{editingChild.age}</Text></p>
              <p><Text type="secondary">Ngày vào trung tâm:</Text> <Text strong>{editingChild.admissionDate ? dayjs(editingChild.admissionDate).format('DD/MM/YYYY') : 'N/A'}</Text></p>
              <p><Text type="secondary">Trạng thái:</Text> <Tag color={editingChild.status === 'Đã được nhận nuôi' ? 'green' : editingChild.status === 'Đang nằm viện' ? 'red' : editingChild.status === 'Đã chuyển tuyến' ? 'orange' : editingChild.status === 'Chờ phê duyệt' ? 'gold' : 'blue'}>{editingChild.status}</Tag></p>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <p><Text type="secondary">Tình trạng sức khỏe:</Text></p>
            <div style={{ background: '#f1f5f9', padding: 15, borderRadius: 8, minHeight: 80 }}>
              {editingChild.health || "Chưa có thông tin cụ thể."}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const Divider = ({ style }: any) => <div style={{ height: '1px', background: '#e2e8f0', ...style }} />;

export default ChildrenManagement;