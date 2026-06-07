import React, { useState, useMemo, useEffect } from 'react';
import { Table, Tag, Button, Typography, Card, Space, Input, Modal, Form, Select, InputNumber, message, Progress, Popconfirm, Timeline, Tabs } from 'antd';
import { BoxPlotOutlined, PlusOutlined, SearchOutlined, EditOutlined, HistoryOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiClient from '../../services/apiClient';
import { getInventoryList, deleteInventoryItem, updateInventoryItem, createInventoryItem } from '../../services/inventoryService';

const { Title, Text } = Typography;

const SuppliesManagement: React.FC = () => {
  // 1. STATE MANAGEMENT
  const [activeTab, setActiveTab] = useState('inventory');
  const [data, setData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<any>(null);

  const [form] = Form.useForm();

  // 2. FETCH DATA FROM BACKEND
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const resData = await getInventoryList();
      const res = resData.lists || [];
      const formattedData = res.map((item: any) => ({
        id: item.id,
        name: item.itemName,
        category: item.category,
        quantity: item.currentQuantity,
        unit: item.unit,
        minLevel: item.minStockLevel || 10,
        status: item.currentQuantity > (item.minStockLevel || 10) ? 'Còn hàng' : 'Sắp hết'
      }));
      setData(formattedData);
    } catch (error) {
      message.error("Không thể tải dữ liệu kho vật tư!");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await apiClient.get('/api/InventoryTransactions');
      setTransactions(res.data.lists || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await apiClient.get('/api/Users/me');
      setCurrentUser(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchTransactions();
    fetchCurrentUser();
  }, []);

  const userRoles = currentUser?.roles || [];
  const isManagerOnly = userRoles.includes('Manager') && !userRoles.includes('Director');
  const isDirectorOrAdmin = userRoles.includes('Director') || userRoles.includes('Administrator');

  // 3. ACTION HANDLERS
  const handleDelete = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      message.success('Đã xóa vật tư khỏi hệ thống!');
      fetchInventory();
    } catch (error) {
      message.error('Lỗi khi thực hiện xóa!');
    }
  };

  const handleSave = async (values: any) => {
    try {
      const payload = {
        itemName: values.name,
        category: values.category,
        unit: values.unit,
        currentQuantity: values.quantity,
        minStockLevel: values.minLevel
      };

      if (editingItem) {
        await updateInventoryItem(editingItem.id, { id: editingItem.id, ...payload });
        message.success('Cập nhật vật tư thành công!');
      } else {
        await createInventoryItem(payload);
        message.success('Thêm mới vật tư thành công!');
      }
      setIsModalOpen(false);
      fetchInventory();
    } catch (error) {
      message.error('Lỗi khi lưu dữ liệu!');
      console.error(error);
    }
  };

  const handleProcessRequest = async (transactionId: string, approved: boolean) => {
    try {
      await apiClient.put(`/api/InventoryTransactions/${transactionId}`, {
        id: transactionId,
        approved
      });
      message.success(approved ? 'Đã duyệt yêu cầu cấp phát!' : 'Đã từ chối yêu cầu cấp phát!');
      fetchTransactions();
      fetchInventory(); // Inventory quantities will update upon approval
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.detail || 'Không thể xử lý yêu cầu cấp phát!';
      message.error(errMsg);
    }
  };

  // 4. DATA FILTERING
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  const pendingRequests = useMemo(() => {
    return transactions.filter(t => t.notes && t.notes.includes('[ĐANG CHỜ DUYỆT]'));
  }, [transactions]);

  // 5. COLUMNS CONFIG
  const columns = [
    { 
      title: 'Tên vật tư', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text: string) => <Text strong style={{ fontSize: 16 }}>{text}</Text> 
    },
    { 
      title: 'Phân loại', 
      dataIndex: 'category', 
      key: 'category', 
      render: (cat: string) => <Tag color="geekblue">{cat}</Tag> 
    },
    { 
      title: 'Số lượng tồn kho', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (qty: number, record: any) => {
        const isLow = qty <= record.minLevel;
        return (
          <Space direction="vertical" size="small" style={{ width: '100%', minWidth: 150 }}>
            <Text strong style={{ color: isLow ? '#ef4444' : 'inherit' }}>
              {qty} {record.unit}
            </Text>
            <Progress 
              percent={qty > 100 ? 100 : (qty / (record.minLevel * 2)) * 100} 
              size="small" 
              status={isLow ? 'exception' : 'active'} 
              strokeColor={isLow ? '#ef4444' : '#10b981'}
              showInfo={false} 
            />
          </Space>
        );
      }
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Còn hàng' ? 'green' : 'red'} style={{ fontWeight: 700 }}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<HistoryOutlined />} onClick={() => { setHistoryItem(record); setIsHistoryOpen(true); }}>
            Lịch sử
          </Button>
          {isDirectorOrAdmin && (
            <>
              <Button icon={<EditOutlined />} type="text" onClick={() => { setEditingItem(record); form.setFieldsValue(record); setIsModalOpen(true); }} style={{ color: '#3b82f6' }} />
              <Popconfirm title="Xóa vật tư này?" onConfirm={() => handleDelete(record.id)}>
                <Button icon={<DeleteOutlined />} type="text" danger />
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ];

  // Render transactions history timeline in history modal
  const renderHistoryTimeline = () => {
    if (!historyItem) return null;
    const itemLogs = transactions.filter(t => t.itemId === historyItem.id);
    if (itemLogs.length === 0) {
      return <Text type="secondary">Chưa có lịch sử giao dịch nào.</Text>;
    }

    return (
      <Timeline
        items={itemLogs.map((log: any) => {
          const isImport = log.type === 1 || log.type === 'Import';
          const isPending = log.notes && log.notes.includes('[ĐANG CHỜ DUYỆT]');
          const isRejected = log.notes && log.notes.includes('[ĐẠ TỪ CHỐI]') || (log.notes && log.notes.includes('[ĐÃ TỪ CHỐI]'));
          
          let color = 'blue';
          if (isPending) color = 'orange';
          else if (isRejected) color = 'red';
          else if (isImport) color = 'green';

          return {
            color: color,
            content: (
              <div>
                <Text strong>{dayjs(log.transactionDate).format('DD/MM/YYYY HH:mm')} - </Text>
                <Text>{log.notes || `${isImport ? 'Nhập' : 'Xuất'} ${log.quantity} ${historyItem.unit}`}</Text>
                {log.referenceDocument && (
                  <div><Text type="secondary" style={{ fontSize: '12px' }}>Mã chứng từ: {log.referenceDocument}</Text></div>
                )}
              </div>
            )
          };
        })}
      />
    );
  };

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}><BoxPlotOutlined /> Quản lý Vật tư & Yêu cầu cấp phát</Title>
          <Text type="secondary">Nhân viên: {currentUser?.fullName} - Vai trò: {userRoles.join(', ')}</Text>
        </div>
        {activeTab === 'inventory' && (
          <Space>
            <Input 
              placeholder="Tìm tên vật tư..." 
              prefix={<SearchOutlined style={{ color: '#94a3b8' }}/>} 
              style={{ width: 280, height: 40, borderRadius: 8 }}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
            {isDirectorOrAdmin && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => { setEditingItem(null); form.resetFields(); setIsModalOpen(true); }} 
                style={{ background: '#f43f5e', height: 40, borderRadius: 8, fontWeight: 600 }}
              >
                Nhập kho mới
              </Button>
            )}
          </Space>
        )}
      </div>

      <Tabs activeKey={activeTab} onChange={key => setActiveTab(key)}>
        <Tabs.TabPane tab="Danh mục tồn kho" key="inventory">
          <Table columns={columns} dataSource={filteredData} rowKey="id" bordered loading={loading} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Yêu cầu cấp phát (Chờ duyệt)" key="requests">
          <Table
            dataSource={pendingRequests}
            rowKey="id"
            bordered
            columns={[
              {
                title: 'Nội dung yêu cầu từ bảo mẫu',
                dataIndex: 'notes',
                key: 'notes',
                render: (notes: string) => {
                  // Clean up the text by removing [ĐANG CHỜ DUYỆT] prefix for nicer display
                  const cleanText = notes.replace('[ĐANG CHỜ DUYỆT] ', '').replace('[ĐANG CHỜ DUYỆT]', '');
                  return <Text strong>{cleanText}</Text>;
                }
              },
              {
                title: 'Số lượng yêu cầu',
                dataIndex: 'quantity',
                key: 'quantity',
                width: 150,
                render: (qty: number, record: any) => {
                  // Find unit from inventory
                  const invItem = data.find(i => i.id === record.itemId);
                  return <Text>{qty} {invItem?.unit || 'đơn vị'}</Text>;
                }
              },
              {
                title: 'Ngày gửi',
                dataIndex: 'transactionDate',
                key: 'transactionDate',
                width: 180,
                render: (date: any) => dayjs(date).format('DD/MM/YYYY HH:mm')
              },
              {
                title: 'Duyệt yêu cầu',
                key: 'approveAction',
                width: 150,
                render: (_: any, record: any) => (
                  <Space>
                    <Popconfirm title="Duyệt cấp phát vật tư này?" onConfirm={() => handleProcessRequest(record.id, true)}>
                      <Button type="primary" size="small" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }} icon={<CheckOutlined />}>
                        Duyệt
                      </Button>
                    </Popconfirm>
                    <Popconfirm title="Từ chối cấp phát vật tư này?" onConfirm={() => handleProcessRequest(record.id, false)} okButtonProps={{ danger: true }}>
                      <Button danger size="small" icon={<CloseOutlined />}>
                        Từ chối
                      </Button>
                    </Popconfirm>
                  </Space>
                )
              }
            ]}
          />
        </Tabs.TabPane>
      </Tabs>

      {/* MODAL THÊM / SỬA */}
      <Modal 
        title={<Title level={3}>{editingItem ? 'Cập nhật vật tư' : 'Nhập kho vật tư mới'}</Title>} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onOk={() => form.submit()} 
        centered
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 20 }}>
          <Form.Item name="name" label="Tên vật tư" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="category" label="Phân loại" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="Thực phẩm">Thực phẩm</Select.Option>
                <Select.Option value="Y tế">Y tế</Select.Option>
                <Select.Option value="Nhu yếu phẩm">Nhu yếu phẩm</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true }]}>
              <Input size="large" placeholder="Ví dụ: Kg, Hộp..." />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="quantity" label="Số lượng tồn" rules={[{ required: true }]}>
              <InputNumber size="large" min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="minLevel" label="Mức cảnh báo tối thiểu">
              <InputNumber size="large" min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* MODAL LỊCH SỬ GIAO DỊCH */}
      <Modal
        title={<Title level={3}>Lịch sử giao dịch: {historyItem?.name}</Title>}
        open={isHistoryOpen}
        onCancel={() => setIsHistoryOpen(false)}
        footer={[<Button key="close" onClick={() => setIsHistoryOpen(false)}>Đóng</Button>]}
        centered
      >
        <div style={{ marginTop: 20, padding: '0 10px', maxHeight: '400px', overflowY: 'auto' }}>
          {renderHistoryTimeline()}
        </div>
      </Modal>
    </Card>
  );
};

export default SuppliesManagement;