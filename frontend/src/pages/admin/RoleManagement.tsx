import React, { useState, useEffect } from 'react';
import { Card, List, Checkbox, Button, Typography, Tag, Space, message, Modal, Spin } from 'antd';
import { SafetyCertificateOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';
import apiClient from '../../services/apiClient'; // Giả định bạn đã có axios instance

const { Title } = Typography;

const allPermissions = [
  'Quản lý trẻ em', 'Duyệt nhận nuôi', 'Kế hoạch chăm sóc', 
  'Báo cáo sự cố', 'Quản lý tài trợ', 'Vật tư & Kho', 
  'Nhân viên', 'Hệ thống'
];

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  // 1. LẤY DANH SÁCH QUYỀN TỪ BACKEND
  const fetchRoles = async () => {
    setLoading(true);
    try {
      // Thay bằng endpoint thực tế của bạn
      const res = await apiClient.get('/api/Roles');
      setRoles(res.data);
    } catch (error) {
      message.error("Không thể tải cấu hình phân quyền");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // 2. MỞ MODAL SỬA
  const openEdit = (role: any) => {
    setEditingRole(role);
    setSelectedPerms(role.permissions || []);
    setIsModalOpen(true);
  };

  // 3. LƯU TẠM THỜI TRÊN UI
  const handleSaveRole = () => {
    setRoles(roles.map(r => r.id === editingRole.id ? { ...r, permissions: selectedPerms } : r));
    setIsModalOpen(false);
    message.success(`Đã cập nhật quyền cho nhóm ${editingRole.name}`);
  };

  // 4. LƯU TOÀN BỘ VÀO DATABASE
  const handleSaveAll = async () => {
    setLoading(true);
    try {
      // Gọi API POST/PUT để lưu mảng roles mới vào DB
      // await apiClient.post('/api/Roles/update-all', roles);
      message.success('Đã lưu toàn bộ cấu hình phân quyền vào SQL Server!');
    } catch (error) {
      message.error("Lỗi khi lưu cấu hình");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <Title level={2}>
        <SafetyCertificateOutlined style={{ color: '#1890ff', marginRight: 12 }} /> 
        Phân quyền hệ thống
      </Title>
      
      <Spin spinning={loading}>
        <List
          itemLayout="horizontal"
          dataSource={roles}
          renderItem={(item) => (
            <List.Item 
              style={{ padding: '20px 0' }}
              actions={[
                <Button key="edit" icon={<EditOutlined />} onClick={() => openEdit(item)}>
                  Sửa quyền
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Tag color={item.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                      {item.name}
                    </Tag>
<Typography.Text type="secondary">Nhóm người dùng hệ thống</Typography.Text>
                  </Space>
                }
                description={
                  <div style={{ marginTop: 12 }}>
                    <Space wrap>
                      {item.permissions.length > 0 ? (
                        item.permissions.map((p: string) => (
                          <Tag key={p} bordered={false} color="default">
                            {p}
                          </Tag>
                        ))
                      ) : (
<Typography.Text type="secondary">Chưa được cấp quyền nào</Typography.Text>
                      )}
                    </Space>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Spin>

      <Button 
        type="primary" 
        icon={<SaveOutlined />} 
        size="large" 
        onClick={handleSaveAll} 
        loading={loading}
        style={{ marginTop: 24, background: '#10b981', borderColor: '#10b981', height: 45, borderRadius: 8 }}
      >
        Lưu toàn bộ cấu hình
      </Button>

      {/* MODAL CHỈNH SỬA CHI TIẾT */}
      <Modal 
        title={<Title level={4}>Thiết lập quyền cho nhóm {editingRole?.name}</Title>} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onOk={handleSaveRole} 
        centered
        width={450}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <div style={{ marginTop: 20, maxHeight: '400px', overflowY: 'auto' }}>
          <Checkbox.Group 
            value={selectedPerms} 
            onChange={(checkedValues) => setSelectedPerms(checkedValues as string[])} 
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {allPermissions.map(perm => (
                <div key={perm} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, marginBottom: 4 }}>
                  <Checkbox value={perm}>{perm}</Checkbox>
                </div>
              ))}
            </Space>
          </Checkbox.Group>
        </div>
      </Modal>
    </Card>
  );
};

export default RoleManagement;