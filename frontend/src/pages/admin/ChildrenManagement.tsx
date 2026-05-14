import React, { useState, useMemo, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, Typography, Modal, Form, Select, DatePicker, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
// IMPORT hàm gọi API (Đảm bảo bạn đã tạo file childService.ts như hướng dẫn trước đó)
// Tìm dòng import này ở đầu file
import { getChildrenList, deleteChild } from '../../services/childService';

const { Title, Text } = Typography;
const { Option } = Select;

const ChildrenManagement: React.FC = () => {
  // 1. QUẢN LÝ STATES
  const [data, setData] = useState<any[]>([]); // Khởi tạo mảng rỗng thay vì initialData
  const [loading, setLoading] = useState(false); // Trạng thái đang tải dữ liệu
  const [searchText, setSearchText] = useState(''); 
  
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); 
  const [editingChild, setEditingChild] = useState<any>(null); 
  
  const [form] = Form.useForm(); 

// 2. GỌI API LẤY DỮ LIỆU TỪ BACKEND
  const fetchChildrenData = async () => {
    setLoading(true);
    try {
      const responseData = await getChildrenList();
      
      // Backend trả về PaginatedList { items: [], pageNumber: 1, totalPages: 1, ... }
      // Do đó ta cần lấy trường .items
      const rawData = responseData.items || [];
      
      // Hàm phụ để dịch trạng thái từ Số (Backend) sang Chữ (Frontend)
      // (Bạn có thể điều chỉnh các con số này cho khớp với khai báo Enum ở Backend của bạn nhé)
      const getStatusText = (statusValue: number) => {
        switch(statusValue) {
          case 0: return 'Mới tiếp nhận';
          case 1: return 'Đang chăm sóc';
          case 2: return 'Sẵn sàng nhận nuôi';
          case 3: return 'Cần chăm sóc y tế';
          case 4: return 'Đã được nhận nuôi';
          default: return 'Không xác định';
        }
      };

      const formattedData = rawData.map((item: any) => ({
        id: item.id, // Dùng item.id theo đúng JSON trả về
        code: item.id.substring(0, 8).toUpperCase(), // Cắt 8 ký tự đầu của ID làm mã hiển thị
        name: item.fullName,
        age: item.dob ? dayjs().diff(dayjs(item.dob), 'year') : 'N/A',
        // Dịch giới tính: Giả sử 0 là Nam, 1 là Nữ
        gender: item.gender === 0 ? 'Nam' : item.gender === 1 ? 'Nữ' : 'Khác',
        admissionDate: item.admissionDate,
        status: getStatusText(item.status), // Dịch trạng thái
        health: item.healthStatus
      }));

      setData(formattedData);
    } catch (error) {
      message.error('Không thể tải dữ liệu từ máy chủ. Vui lòng kiểm tra lại Backend!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Tự động chạy hàm fetchChildrenData khi component vừa được render lần đầu
  useEffect(() => {
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
      });
    } else {
      form.resetFields();
    }
  };

  // 5. XỬ LÝ LƯU (Tạm thời vẫn giữ logic Frontend, bước sau sẽ nối API POST/PUT)
  const handleSave = async () => {
    try {
      const values = await form.validateFields(); 
      const formattedValues = {
        ...values,
        admissionDate: values.admissionDate.format('YYYY-MM-DD'), 
      };

      if (editingChild) {
        setData(data.map(item => item.id === editingChild.id ? { ...editingChild, ...formattedValues } : item));
        message.success(`Đã cập nhật hồ sơ ${editingChild.code} thành công!`);
      } else {
        const newChild = {
          id: Date.now().toString(), 
          code: `TE${(data.length + 1).toString().padStart(3, '0')}`, 
          ...formattedValues,
        };
        setData([newChild, ...data]); 
        message.success(`Đã thêm hồ sơ mới cho bé ${newChild.name} thành công!`);
      }

      setIsModalOpen(false);
      setEditingChild(null);
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  // 6. XỬ LÝ XÓA (Tạm thời giữ logic Frontend, bước sau sẽ nối API DELETE)
// Nhớ thêm deleteChild vào phần import ở đầu file nhé
const handleDelete = async (id: string) => {
    try {
        await deleteChild(id); // Gửi lệnh xóa xuống SQL Server
        
        // Sau khi DB xóa xong, mới cập nhật lại giao diện
        setData(data.filter(item => item.id !== id)); 
        message.success('Đã xóa hồ sơ khỏi hệ thống thành công!');
    } catch (error) {
        message.error('Không thể xóa hồ sơ. Vui lòng thử lại!');
        console.error(error);
    }
};

  // 7. CẤU HÌNH CỘT BẢNG
  const columns = [
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
        let color = status === 'Sẵn sàng nhận nuôi' ? 'green' : status === 'Cần chăm sóc y tế' ? 'red' : 'blue';
        return <Tag color={color} style={{ fontWeight: 600, padding: '2px 10px', borderRadius: 6 }}>{status}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      fixed: 'right' as const, 
      render: (_: any, record: any) => (
        <Space size="small">
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
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 28, borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#1e293b', fontSize: 28 }}>Quản lý Hồ sơ Trẻ em</Title>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          style={{ background: '#f43f5e', fontWeight: 600, height: 45, borderRadius: 10 }}
          onClick={() => openEditModal()} 
        >
          Thêm hồ sơ mới
        </Button>
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

      {/* BẢNG DỮ LIỆU - Thêm thuộc tính loading */}
      <Table 
        columns={columns} 
        dataSource={filteredData} 
        rowKey="id" 
        pagination={{ pageSize: 5, showSizeChanger: false }} 
        scroll={{ x: 1000 }} 
        variant="bordered"
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
          <Form.Item name="status" label="Trạng thái chăm sóc" rules={[{ required: true, message: 'Vui lòng chọn!' }]}>
            <Select placeholder="Chọn trạng thái">
              <Option value="Đang chăm sóc">Đang chăm sóc</Option>
              <Option value="Sẵn sàng nhận nuôi">Sẵn sàng nhận nuôi</Option>
              <Option value="Cần chăm sóc y tế">Cần chăm sóc y tế</Option>
              <Option value="Đã được nhận nuôi">Đã được nhận nuôi</Option>
            </Select>
          </Form.Item>
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
            <p><Text type="secondary">Họ và tên:</Text> <Text strong style={{ fontSize: 18 }}>{editingChild.name}</Text></p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <p><Text type="secondary">Giới tính:</Text> <Text strong>{editingChild.gender}</Text></p>
              <p><Text type="secondary">Tuổi:</Text> <Text strong>{editingChild.age}</Text></p>
              <p><Text type="secondary">Ngày vào trung tâm:</Text> <Text strong>{editingChild.admissionDate ? dayjs(editingChild.admissionDate).format('DD/MM/YYYY') : 'N/A'}</Text></p>
              <p><Text type="secondary">Trạng thái:</Text> <Tag color="blue">{editingChild.status}</Tag></p>
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