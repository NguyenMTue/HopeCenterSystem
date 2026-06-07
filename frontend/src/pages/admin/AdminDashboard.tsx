import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Table, Typography, Space, Tabs, Input, Tag, Switch, Modal, Form, Select, Row, Col, Progress, message, Tooltip } from 'antd';
import { 
  UserOutlined, 
  SafetyOutlined, 
  DatabaseOutlined, 
  SearchOutlined, 
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CloudDownloadOutlined, 
  CloudUploadOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  HddOutlined
} from '@ant-design/icons';
import apiClient from '../../services/apiClient';
import SystemLogsTable from './SystemLogsTable';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { confirm } = Modal;

interface UserRecord {
  id: string;
  userName: string;
  email: string;
  isActive: boolean;
  roles: string[];
  fullName: string;
  position?: string;
  phone?: string;
  address?: string;
  userType: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const createFormRoles = Form.useWatch('roles', createForm);
  const editFormRoles = Form.useWatch('roles', editForm);

  // Backup/Restore state
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupInfo, setBackupInfo] = useState<any>(null);

  // 1. GET USER RECORDS
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/Admin/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. SEARCH LOGIC
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.roles?.some(r => r.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [users, searchText]);

  // 3. CREATE USER ACCOUNT
  const handleCreateUser = async (values: any) => {
    try {
      await apiClient.post('/api/Admin/users', {
        userName: values.email, // Sử dụng email làm tên đăng nhập
        password: values.password,
        email: values.email,
        fullName: values.fullName,
        position: values.position,
        phone: values.phone,
        address: values.address,
        roles: values.roles
      });
      message.success('Tạo tài khoản và gán quyền thành công!');
      setIsCreateOpen(false);
      createForm.resetFields();
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data || 'Có lỗi xảy ra khi tạo tài khoản.';
      message.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }
  };

  // 4. EDIT USER ROLES / ACTIVE STATUS
  const handleEditUser = async (values: any) => {
    if (!selectedUser) return;
    try {
      await apiClient.put(`/api/Admin/users/${selectedUser.id}`, {
        isActive: values.isActive,
        roles: values.roles
      });
      message.success('Cập nhật tài khoản thành công!');
      setIsEditOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
      message.error('Cập nhật tài khoản thất bại.');
    }
  };

  const openEditModal = (record: UserRecord) => {
    setSelectedUser(record);
    editForm.setFieldsValue({
      isActive: record.isActive,
      roles: record.roles
    });
    setIsEditOpen(true);
  };

  // 5. TOGGLE STATUS DIRECTLY IN TABLE
  const handleToggleActive = async (checked: boolean, record: UserRecord) => {
    try {
      await apiClient.put(`/api/Admin/users/${record.id}`, {
        isActive: checked,
        roles: record.roles
      });
      message.success(`Đã ${checked ? 'mở khóa' : 'khóa'} tài khoản ${record.userName}.`);
      fetchUsers();
    } catch (error) {
      console.error(error);
      message.error('Thay đổi trạng thái tài khoản thất bại.');
    }
  };

  // 6. DELETE ACCOUNT
  const handleDeleteUser = (record: UserRecord) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa tài khoản này?',
      icon: <ExclamationCircleOutlined style={{ color: '#ef4444' }} />,
      content: `Hành động này sẽ xóa vĩnh viễn tài khoản "${record.userName}" và các thông tin hồ sơ liên kết. Không thể khôi phục lại!`,
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await apiClient.delete(`/api/Admin/users/${record.id}`);
          message.success('Xóa tài khoản thành công!');
          fetchUsers();
        } catch (error) {
          console.error(error);
          message.error('Không thể xóa tài khoản này.');
        }
      }
    });
  };

  // 7. BACKUP DATABASE
  const handleBackup = async () => {
    setIsBackingUp(true);
    const hide = message.loading('Đang sao lưu cơ sở dữ liệu SQL Server...', 0);
    try {
      const response = await apiClient.post('/api/Admin/backup');
      setBackupInfo(response.data);
      message.success('Sao lưu dữ liệu thành công!');
    } catch (error: any) {
      console.error(error);
      message.error('Sao lưu cơ sở dữ liệu thất bại.');
    } finally {
      hide();
      setIsBackingUp(false);
    }
  };

  // 8. RESTORE DATABASE
  const handleRestore = () => {
    confirm({
      title: 'XÁC NHẬN PHỤC HỒI CƠ SỞ DỮ LIỆU?',
      icon: <ExclamationCircleOutlined style={{ color: '#f59e0b' }} />,
      content: (
        <div>
          <Paragraph style={{ color: '#ef4444', fontWeight: 600 }}>
            CẢNH BÁO: Toàn bộ dữ liệu hiện tại trong cơ sở dữ liệu sẽ bị ghi đè hoàn toàn bởi bản sao lưu cũ.
          </Paragraph>
          <Paragraph>
            Hệ thống sẽ bị ngắt kết nối tạm thời để thiết lập chế độ Đơn người dùng (Single User Mode) trong quá trình phục hồi.
          </Paragraph>
        </div>
      ),
      okText: 'Phục hồi ngay',
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      async onOk() {
        setIsRestoring(true);
        const hide = message.loading('Đang tiến hành phục hồi dữ liệu từ bản sao lưu...', 0);
        try {
          await apiClient.post('/api/Admin/restore');
          message.success({ content: 'Phục hồi dữ liệu thành công! Hệ thống đã được tải lại.', duration: 5 });
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error: any) {
          console.error(error);
          message.error('Phục hồi dữ liệu thất bại. Vui lòng kiểm tra log SQL Server.');
        } finally {
          hide();
          setIsRestoring(false);
        }
      }
    });
  };

  // Table Columns
  const userColumns = [
    {
      title: 'Tài khoản',
      dataIndex: 'userName',
      key: 'userName',
      render: (text: string, record: UserRecord) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: '15px' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
        </Space>
      )
    },
    {
      title: 'Tên hiển thị / Họ Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string) => <Text>{text || 'Chưa thiết lập'}</Text>
    },
    {
      title: 'Vai trò (Roles)',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <Space wrap>
          {roles.map(role => {
            let color = 'blue';
            if (role === 'Administrator') color = 'red';
            else if (role === 'Director') color = 'purple';
            else if (role === 'Manager') color = 'orange';
            else if (role === 'CareGiver') color = 'green';
            else if (role === 'Donor') color = 'gold';
            return <Tag color={color} key={role} style={{ fontWeight: 600 }}>{role.toUpperCase()}</Tag>;
          })}
        </Space>
      )
    },
    {
      title: 'Loại hồ sơ',
      dataIndex: 'userType',
      key: 'userType',
      render: (type: string) => {
        let text = 'Chỉ tài khoản';
        let color = 'default';
        if (type === 'Employee') { text = 'Nhân viên'; color = 'cyan'; }
        else if (type === 'Adopter') { text = 'Người nhận nuôi'; color = 'magenta'; }
        else if (type === 'Donor') { text = 'Nhà tài trợ'; color = 'orange'; }
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      render: (isActive: boolean, record: UserRecord) => (
        <Space>
          <Switch 
            checked={isActive} 
            onChange={(checked) => handleToggleActive(checked, record)} 
            size="small" 
          />
          <Tag color={isActive ? 'success' : 'error'}>
            {isActive ? 'HOẠT ĐỘNG' : 'BỊ KHÓA'}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_: any, record: UserRecord) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa quyền/trạng thái">
            <Button 
              shape="circle" 
              icon={<EditOutlined />} 
              onClick={() => openEditModal(record)} 
            />
          </Tooltip>
          {record.roles.includes('Administrator') ? null : (
            <Tooltip title="Xóa tài khoản">
              <Button 
                shape="circle" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => handleDeleteUser(record)} 
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  // User Management Tab Content
  const userTab = (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: '12px' }}>
        <Input
          placeholder="Tìm kiếm tài khoản, email, tên hiển thị..."
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 350, borderRadius: '8px' }}
          allowClear
        />
        <Button 
          type="primary" 
          icon={<UserAddOutlined />} 
          onClick={() => setIsCreateOpen(true)}
          style={{ background: '#f43f5e', borderColor: '#f43f5e', borderRadius: '8px', fontWeight: 600 }}
        >
          Tạo tài khoản mới
        </Button>
      </div>

      <Table
        columns={userColumns}
        dataSource={filteredUsers}
        rowKey="id"
        bordered
        loading={loading}
        pagination={{ pageSize: 7 }}
        style={{ borderRadius: '8px', overflow: 'hidden' }}
      />
    </div>
  );

  // Settings & Backup Tab Content
  const settingsTab = (
    <div>
      <Row gutter={[24, 24]}>
        {/* SERVER STATUS */}
        <Col xs={24} md={12}>
          <Card 
            title={
              <Space>
                <DashboardOutlined style={{ color: '#0ea5e9' }} />
                <span>Thông số Máy chủ (Server Metrics)</span>
              </Space>
            }
            bordered={false}
            style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Trạng thái hệ thống:</Text>
                <Tag color="success" icon={<CheckCircleOutlined />}>ONLINE</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Hệ điều hành:</Text>
                <Text strong>Windows Server (localdb)</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Cơ sở dữ liệu Engine:</Text>
                <Text strong>Microsoft SQL Server 2022</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Phiên bản Backend:</Text>
                <Text strong>.NET 10.0 (WebAPI)</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Tải bộ nhớ RAM (Docker/Container):</Text>
                <div style={{ width: '50%', textAlign: 'right' }}>
                  <Progress percent={34} size="small" status="active" strokeColor="#0ea5e9" />
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* BACKUP & RESTORE ACTIONS */}
        <Col xs={24} md={12}>
          <Card 
            title={
              <Space>
                <DatabaseOutlined style={{ color: '#f43f5e' }} />
                <span>Sao lưu & Phục hồi dữ liệu (Backup / Restore)</span>
              </Space>
            }
            bordered={false}
            style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Paragraph style={{ color: '#64748b' }}>
                Admin hệ thống chịu trách nhiệm quản lý an toàn dữ liệu. Bạn nên sao lưu dữ liệu trước khi thực hiện cập nhật hoặc phân quyền tài khoản.
              </Paragraph>

              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px dashed #cbd5e1', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                  <HddOutlined style={{ fontSize: 24, color: '#f43f5e' }} />
                  <div>
                    <Text strong style={{ display: 'block' }}>File Sao Lưu Hiện Tại:</Text>
                    <Text type="secondary" style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                      {backupInfo?.backupFile || 'Chưa thực hiện sao lưu thủ công trong phiên này.'}
                    </Text>
                  </div>
                </div>
                {backupInfo && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Tạo lúc {dayjs().format('HH:mm:ss DD/MM/YYYY')}</Tag>
                )}
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Button 
                    type="primary" 
                    icon={<CloudUploadOutlined />} 
                    block 
                    onClick={handleBackup}
                    loading={isBackingUp}
                    style={{ background: '#0ea5e9', borderColor: '#0ea5e9', height: 45, borderRadius: 8, fontWeight: 600 }}
                  >
                    Sao lưu ngay
                  </Button>
                </Col>
                <Col span={12}>
                  <Button 
                    type="primary" 
                    danger
                    icon={<CloudDownloadOutlined />} 
                    block 
                    onClick={handleRestore}
                    loading={isRestoring}
                    style={{ height: 45, borderRadius: 8, fontWeight: 600 }}
                  >
                    Phục hồi dữ liệu
                  </Button>
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div style={{ padding: '0 10px' }}>
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '24px 32px', borderRadius: 16, color: 'white', marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <SafetyOutlined style={{ color: '#10b981' }} />
              CỔNG QUẢN TRỊ HỆ THỐNG (ADMIN PORTAL)
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginTop: 4 }}>
              Quản lý tài khoản, gán quyền, giám sát logs bảo mật và kiểm soát cơ sở dữ liệu.
            </Text>
          </Col>
          <Col>
            <Tag color="error" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6, border: 'none', fontWeight: 700 }}>
              <ThunderboltOutlined /> HẠ TẦNG KỸ THUẬT
            </Tag>
          </Col>
        </Row>
      </div>

      <Card style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Tabs 
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: <span style={{ fontSize: 16, fontWeight: 600 }}><UserOutlined /> Quản lý Người dùng</span>,
              children: userTab
            },
            {
              key: '2',
              label: <span style={{ fontSize: 16, fontWeight: 600 }}><SafetyOutlined /> Nhật ký hệ thống</span>,
              children: <SystemLogsTable />
            },
            {
              key: '3',
              label: <span style={{ fontSize: 16, fontWeight: 600 }}><DatabaseOutlined /> Cấu hình & Sao lưu</span>,
              children: settingsTab
            }
          ]}
        />
      </Card>

      {/* CREATE USER MODAL */}
      <Modal
        title={<Title level={4}><UserAddOutlined /> Tạo tài khoản người dùng mới</Title>}
        open={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        onOk={() => createForm.submit()}
        width={650}
        centered
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateUser} style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="email" 
                label="Địa chỉ Email (Tên đăng nhập)" 
                rules={[
                  { required: true, message: 'Nhập địa chỉ email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input placeholder="email@hopecenter.com" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Nhập mật khẩu!' }, { min: 6, message: 'Mật khẩu phải tối thiểu 6 ký tự.' }]}>
                <Input.Password placeholder="Mật khẩu bảo mật" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fullName" label="Họ và Tên (Tên hiển thị)" rules={[{ required: true, message: 'Nhập họ và tên!' }]}>
                <Input placeholder="Nguyễn Văn A" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input placeholder="09xxxxxxxx" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="position" label="Chức danh / Vị trí (Nếu là Nhân viên)">
                <Input placeholder="Bảo mẫu, Quản lý..." style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="address" label="Địa chỉ thường trú">
                <Input placeholder="Số 123 Nguyễn Văn Linh, Đà Nẵng" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="roles" 
            label="Gán quyền truy cập (Roles)" 
            rules={[
              { required: true, message: 'Chọn ít nhất 1 role!' },
              {
                validator: (_, value) => {
                  if (value && value.includes('Adopter') && value.length > 1) {
                    return Promise.reject(new Error('Tài khoản người nhận nuôi (Adopter) không được phép đồng thời giữ các vai trò khác.'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Select mode="multiple" placeholder="Chọn roles tương ứng" style={{ width: '100%', borderRadius: 8 }}>
              <Option value="Administrator" disabled={createFormRoles?.includes('Adopter')}>Administrator (Admin hệ thống)</Option>
              <Option value="Director" disabled={createFormRoles?.includes('Adopter')}>Director (Giám đốc)</Option>
              <Option value="Manager" disabled={createFormRoles?.includes('Adopter')}>Manager (Quản lý)</Option>
              <Option value="CareGiver" disabled={createFormRoles?.includes('Adopter')}>CareGiver (Nhân viên chăm sóc)</Option>
              <Option value="Adopter" disabled={createFormRoles?.some((r: string) => r !== 'Adopter')}>Adopter (Người nhận nuôi)</Option>
              <Option value="Donor" disabled={createFormRoles?.includes('Adopter')}>Donor (Nhà tài trợ)</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        title={<Title level={4}><EditOutlined /> Cập nhật quyền và trạng thái tài khoản</Title>}
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          setSelectedUser(null);
        }}
        onOk={() => editForm.submit()}
        width={500}
        centered
        destroyOnClose
      >
        {selectedUser && (
          <Form form={editForm} layout="vertical" onFinish={handleEditUser} style={{ marginTop: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">Đang chỉnh sửa tài khoản: </Text>
              <Text strong style={{ fontSize: 16 }}>{selectedUser.userName}</Text>
              <br />
              <Text type="secondary">Tên thật: </Text>
              <Text>{selectedUser.fullName}</Text>
            </div>

            <Form.Item name="isActive" label="Trạng thái tài khoản" valuePropName="checked">
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
            </Form.Item>

            <Form.Item 
              name="roles" 
              label="Quyền truy cập (Roles)" 
              rules={[
                { required: true, message: 'Chọn ít nhất 1 role!' },
                {
                  validator: (_, value) => {
                    if (value && value.includes('Adopter') && value.length > 1) {
                      return Promise.reject(new Error('Tài khoản người nhận nuôi (Adopter) không được phép đồng thời giữ các vai trò khác.'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Select mode="multiple" placeholder="Chọn roles" style={{ width: '100%', borderRadius: 8 }}>
                <Option value="Administrator" disabled={editFormRoles?.includes('Adopter')}>Administrator (Admin hệ thống)</Option>
                <Option value="Director" disabled={editFormRoles?.includes('Adopter')}>Director (Giám đốc)</Option>
                <Option value="Manager" disabled={editFormRoles?.includes('Adopter')}>Manager (Quản lý)</Option>
                <Option value="CareGiver" disabled={editFormRoles?.includes('Adopter')}>CareGiver (Nhân viên chăm sóc)</Option>
                <Option value="Adopter" disabled={editFormRoles?.some((r: string) => r !== 'Adopter')}>Adopter (Người nhận nuôi)</Option>
                <Option value="Donor" disabled={editFormRoles?.includes('Adopter')}>Donor (Nhà tài trợ)</Option>
              </Select>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
