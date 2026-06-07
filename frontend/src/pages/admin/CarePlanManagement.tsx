import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag, Button, Typography, Card, Space, Input, Modal, Form, Select, DatePicker, message, InputNumber } from 'antd';
import { MedicineBoxOutlined, PlusOutlined, EditOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
// Import các service cần thiết
import { getCarePlans, createCarePlan, updateCarePlan } from '../../services/carePlanService';
import { getChildrenList } from '../../services/childService'; 
import { getEmployees } from '../../services/employeeService';
import apiClient from '../../services/apiClient';

const { Title, Text } = Typography;

const CarePlanManagement: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]); // Danh sách bé để chọn
  const [employees, setEmployees] = useState<any[]>([]); // Danh sách nhân viên để chọn
  const [inventoryItems, setInventoryItems] = useState<any[]>([]); // Danh sách vật tư để chọn
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [form] = Form.useForm();

  // Check role Director
  const isDirector = userRoles.includes('Director');

  // 1. GỌI API LẤY DỮ LIỆU
  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansData, childrenData, employeesData, itemsRes] = await Promise.all([
        getCarePlans(),
        getChildrenList(),
        getEmployees(),
        apiClient.get('/api/InventoryItems')
      ]);

      // CarePlans dùng .lists, Children dùng .items, Employees dùng .items
      const plansRes = plansData.lists || [];
      const childrenRes = childrenData.items || [];
      const employeesRes = employeesData.items || [];
      const itemsData = itemsRes.data.lists || [];

      const formattedPlans = plansRes.map((p: any) => ({
        id: p.id,
        childId: p.childId,
        childName: p.childName,
        goal: p.title,
        startDate: dayjs(p.startDate).format('YYYY-MM-DD'),
        endDate: dayjs(p.endDate).format('YYYY-MM-DD'),
        employeeId: p.employeeId,
        employeeName: p.employeeName || 'Chưa phân công',
        status: p.status,
        supplies: p.supplies || []
      }));

      setData(formattedPlans);
      setChildren(childrenRes); // Lưu danh sách bé vào state
      setEmployees(employeesRes); // Lưu danh sách nhân viên vào state
      setInventoryItems(itemsData); // Lưu danh sách vật tư vào state
    } catch (error) {
      message.error("Lỗi tải dữ liệu!");
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
      } catch (error) {
        console.error('Failed to fetch user roles', error);
      }
    };
    fetchUserRole();
    fetchData();
  }, []);

  // Chỉ cho phép giao việc cho nhân viên có Role là Caregiver (không chứa Quản lý, Giám đốc, Quản trị)
  const caregiverEmployees = useMemo(() => {
    return employees.filter(emp => {
      const pos = (emp.position || '').toLowerCase();
      return !pos.includes('quản lý') && !pos.includes('giám đốc') && !pos.includes('quản trị');
    });
  }, [employees]);

  const handleSave = async (values: any) => {
    message.loading({ content: 'Đang xử lý...', key: 'save_plan' });
    try {
      const payload = {
        childId: values.childId,
        title: values.title,
        startDate: values.dateRange[0].startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
        endDate: values.dateRange[1].endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
        employeeId: values.employeeId || null,
        status: values.status !== undefined ? values.status : 0,
        supplies: (values.supplies || []).map((s: any) => ({
          inventoryItemId: s.inventoryItemId,
          quantity: s.quantity || 1
        }))
      };

      if (editingPlan) {
        await updateCarePlan(editingPlan.id, {
          id: editingPlan.id,
          title: payload.title,
          startDate: payload.startDate,
          endDate: payload.endDate,
          employeeId: payload.employeeId,
          status: payload.status,
          supplies: payload.supplies
        });
        message.success({ content: 'Cập nhật kế hoạch thành công!', key: 'save_plan' });
      } else {
        await createCarePlan(payload);
        message.success({ content: 'Lập kế hoạch chăm sóc mới thành công!', key: 'save_plan' });
      }
      setIsModalOpen(false);
      setEditingPlan(null);
      form.resetFields();
      fetchData(); // Load lại dữ liệu
    } catch (error) {
      console.error(error);
      message.error({ content: 'Thao tác thất bại. Vui lòng kiểm tra lại!', key: 'save_plan' });
    }
  };

  const columns = [
    { title: 'Tên trẻ em', dataIndex: 'childName', key: 'childName', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Kế hoạch', dataIndex: 'goal', key: 'goal', width: 220 },
    { title: 'Thời hạn', key: 'duration', render: (_: any, record: any) => `${dayjs(record.startDate).format('DD/MM/YYYY')} -> ${dayjs(record.endDate).format('DD/MM/YYYY')}` },
    { title: 'Nhân viên phụ trách', dataIndex: 'employeeName', key: 'employeeName', render: (text: string) => <Tag color="blue">{text}</Tag> },
    { 
      title: 'Vật tư kèm theo', 
      dataIndex: 'supplies', 
      key: 'supplies',
      render: (supplies: any[]) => (
        <Space direction="vertical" size={0}>
          {supplies && supplies.length > 0 ? (
            supplies.map((s, idx) => (
              <span key={idx} style={{ fontSize: '13px', color: '#475569' }}>
                • {s.itemName} (x{s.quantity})
              </span>
            ))
          ) : (
            <Text type="secondary" style={{ fontSize: '13px' }}>Không có</Text>
          )}
        </Space>
      )
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: number) => {
        let color = 'default';
        let text = 'Chờ duyệt';
        if (status === 1) {
          color = 'processing';
          text = 'Đã duyệt / Đang thực hiện';
        } else if (status === 2) {
          color = 'error';
          text = 'Từ chối';
        } else if (status === 3) {
          color = 'warning';
          text = 'Chờ ghép đôi';
        } else if (status === 4) {
          color = 'success';
          text = 'Hoàn thành';
        } else if (status === 5) {
          color = 'magenta';
          text = 'Trễ / Quá hạn';
        }
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          icon={<EditOutlined />} 
          type="text" 
          style={{ color: '#3b82f6' }}
          onClick={() => {
            setEditingPlan(record);
            form.setFieldsValue({
              childId: record.childId,
              title: record.goal,
              dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
              employeeId: record.employeeId,
              status: record.status,
              supplies: record.supplies.map((s: any) => ({
                inventoryItemId: s.inventoryItemId,
                quantity: s.quantity
              }))
            });
            setIsModalOpen(true);
          }}
        />
      )
    }
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}><MedicineBoxOutlined /> Kế hoạch Chăm sóc</Title>
        {!isDirector && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingPlan(null);
              form.resetFields();
              setIsModalOpen(true);
            }} 
            style={{ background: '#f43f5e', height: 40, borderRadius: 8 }}
          >
            Lập kế hoạch mới
          </Button>
        )}
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" bordered loading={loading} />

      <Modal 
        title={editingPlan ? (isDirector ? "Xem & Phê duyệt kế hoạch chăm sóc" : "Chỉnh sửa kế hoạch chăm sóc") : "Lập kế hoạch chăm sóc mới"} 
        open={isModalOpen} 
        onCancel={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }} 
        onOk={() => form.submit()} 
        centered 
        width={650}
        okText={editingPlan ? (isDirector ? "Phê duyệt" : "Cập nhật") : "Lập kế hoạch"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 20 }}>
          <Form.Item name="childId" label="Chọn trẻ em" rules={[{ required: true, message: 'Vui lòng chọn trẻ em!' }]}>
            <Select placeholder="Chọn trẻ em từ danh sách" showSearch optionFilterProp="label" disabled={!!editingPlan || isDirector}>
              {children.map(child => (
                <Select.Option key={child.id} value={child.id} label={child.fullName}>
                  {child.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="title" label="Tiêu đề kế hoạch" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề kế hoạch!' }]}>
            <Input placeholder="Ví dụ: Điều trị dứt điểm ho kéo dài" disabled={isDirector} />
          </Form.Item>

          <Form.Item name="dateRange" label="Thời gian thực hiện" rules={[{ required: true, message: 'Vui lòng chọn thời gian thực hiện!' }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled={isDirector} />
          </Form.Item>

          <Form.Item name="employeeId" label="Nhân viên chăm sóc phụ trách (Chỉ hiển thị Caregiver)">
            <Select placeholder="Chọn nhân viên từ danh sách" showSearch optionFilterProp="label" allowClear disabled={isDirector}>
              {caregiverEmployees.map(emp => (
                <Select.Option key={emp.id} value={emp.id} label={emp.fullName}>
                  {emp.fullName} {emp.position ? `(${emp.position})` : ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Chọn vật tư đi kèm (Dùng nhanh không cần chờ duyệt)">
            <Form.List name="supplies">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'inventoryItemId']}
                        rules={[{ required: true, message: 'Chọn vật tư' }]}
                        style={{ margin: 0 }}
                      >
                        <Select placeholder="Chọn vật tư" style={{ width: 350 }} showSearch optionFilterProp="label" disabled={isDirector}>
                          {inventoryItems.map(item => (
                            <Select.Option key={item.id} value={item.id} label={item.itemName}>
                              {item.itemName} (Còn: {item.currentQuantity})
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        rules={[{ required: true, message: 'Nhập số lượng' }]}
                        style={{ margin: 0 }}
                      >
                        <InputNumber min={1} placeholder="SL" style={{ width: 100 }} disabled={isDirector} />
                      </Form.Item>
                      {!isDirector && (
                        <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ef4444', fontSize: '18px', cursor: 'pointer' }} />
                      )}
                    </Space>
                  ))}
                  {!isDirector && (
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Thêm vật tư cấp phát đi kèm
                      </Button>
                    </Form.Item>
                  )}
                </>
              )}
            </Form.List>
          </Form.Item>

          {editingPlan && (
            <Form.Item name="status" label="Trạng thái phê duyệt" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}>
              <Select placeholder="Chọn trạng thái">
                <Select.Option value={0}>Chờ duyệt (Pending)</Select.Option>
                <Select.Option value={1}>Đã duyệt / Đang thực hiện (Approved)</Select.Option>
                <Select.Option value={2}>Từ chối (Rejected)</Select.Option>
                <Select.Option value={4}>Hoàn thành (Completed)</Select.Option>
                <Select.Option value={5}>Trễ / Quá hạn (Overdue)</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default CarePlanManagement;