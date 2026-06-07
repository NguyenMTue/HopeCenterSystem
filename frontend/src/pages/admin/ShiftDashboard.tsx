import React, { useState, useEffect } from 'react';
import { Card, Button, List, Checkbox, Space, Typography, Tag, Spin, message, Row, Col, Input, Modal, Form, Select, DatePicker, InputNumber, Avatar } from 'antd';
import { WarningOutlined, PlusOutlined, MedicineBoxOutlined, EditOutlined, HeartOutlined, SmileOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiClient from '../../services/apiClient';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SyringeIcon: React.FC<{ style?: React.CSSProperties; className?: string }> = ({ style, className }) => (
  <span role="img" aria-label="syringe" className={`anticon ${className || ''}`} style={{ ...style, display: 'inline-flex', alignItems: 'center' }}>
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
      <line x1="2" y1="22" x2="9" y2="15" />
      <path d="M10 14L17.5 6.5M13.5 17.5L21 10" />
      <line x1="8.5" y1="12.5" x2="11.5" y2="15.5" />
      <line x1="16.5" y1="4.5" x2="19.5" y2="7.5" />
      <line x1="18" y1="6" x2="22" y2="2" />
      <line x1="20.5" y1="0.5" x2="23.5" y2="3.5" />
      <line x1="12.5" y1="12.5" x2="14.5" y2="14.5" />
      <line x1="15" y1="10" x2="17" y2="12" />
    </svg>
  </span>
);

const ShiftDashboard: React.FC = () => {
  const [children, setChildren] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [carePlans, setCarePlans] = useState<any[]>([]); // Danh sách kế hoạch chăm sóc để giao việc/nhiệm vụ
  const [careLogs, setCareLogs] = useState<any[]>([]); // Ghi chú/Nhật ký của bảo mẫu cho kế hoạch chăm sóc
  
  const [loading, setLoading] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [employeeInfo, setEmployeeInfo] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<any>(null);

  // Forms
  const [incidentForm] = Form.useForm();
  const [supplyForm] = Form.useForm();
  const [noteForm] = Form.useForm();

  const [submittingIncident, setSubmittingIncident] = useState(false);
  const [submittingSupply, setSubmittingSupply] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get current user
      const meRes = await apiClient.get('/api/Users/me');
      const user = meRes.data;
      const currentEmp = {
        id: user.employeeId,
        fullName: user.fullName,
        position: user.position
      };
      setEmployeeInfo(currentEmp);

      // 2. Fetch children list
      const childrenRes = await apiClient.get('/api/Children', {
        params: { PageNumber: 1, PageSize: 100 }
      });
      const allChildren = childrenRes.data.items || [];

      // Fetch Care Plans list first (needed for filtering children who are assigned care plans)
      const plansRes = await apiClient.get('/api/CarePlans');
      const carePlansList = plansRes.data.lists || [];
      setCarePlans(carePlansList);

      const assignedChildIds = carePlansList
        .filter((p: any) => p.employeeId === currentEmp.id && (p.status === 1 || p.status === 4 || p.status === 5))
        .map((p: any) => p.childId);

      // Filter children assigned to the caregiver's location (Khu Mầm Non for tue4)
      let locationFilter = '';
      const pos = (currentEmp.position || '').toLowerCase();
      if (pos.includes('mầm non')) locationFilter = 'Khu Mầm Non';
      else if (pos.includes('nhi đồng')) locationFilter = 'Khu Nhi Đồng';
      else if (pos.includes('thiếu niên')) locationFilter = 'Khu Thiếu Niên';

      let myChildren = allChildren;
      if (locationFilter) {
        const roomsRes = await apiClient.get('/api/Rooms');
        const myRoomIds = (roomsRes.data.lists || [])
          .filter((r: any) => r.location === locationFilter)
          .map((r: any) => r.id);

        myChildren = allChildren.filter((c: any) => 
          (c.roomId && myRoomIds.includes(c.roomId)) || assignedChildIds.includes(c.id)
        );
      }
      setChildren(myChildren);

      if (myChildren.length > 0 && !selectedChildId) {
        setSelectedChildId(myChildren[0].id);
      }

      // 3. Fetch medical records to show red cross icon next to name
      const medicalRes = await apiClient.get('/api/MedicalRecords');
      setMedicalRecords(medicalRes.data.lists || []);

      // 4. Fetch daily care tasks for this employee
      if (currentEmp.id) {
        const tasksRes = await apiClient.get('/api/DailyCareTasks', {
          params: { employeeId: currentEmp.id, taskDate: dayjs().toISOString() }
        });
        setDailyTasks(tasksRes.data.lists || []);
      }

      // 5. Fetch inventory items for supplies request
      const itemsRes = await apiClient.get('/api/InventoryItems');
      setInventoryItems(itemsRes.data.lists || []);

      // 6. Fetch vaccinations list
      const vacRes = await apiClient.get('/api/Vaccinations');
      setVaccinations(vacRes.data.lists || []);

      // 7. Fetch Care Logs list
      const logsRes = await apiClient.get('/api/CareLogs');
      setCareLogs(logsRes.data.lists || []);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải thông tin ca trực');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter tasks for the selected child
  const childTasks = dailyTasks.filter(t => t.childId === selectedChildId);

  // Lấy lịch tiêm chủng hôm nay của trẻ đang được chọn
  const childVaccinations = vaccinations.filter(v => 
    v.childId === selectedChildId && 
    dayjs(v.vaccinationDate).isSame(dayjs(), 'day')
  ).map(v => ({
    id: `vac-${v.id}`,
    childId: v.childId,
    taskName: `Lịch tiêm chủng: ${v.vaccineName} (${v.dose})`,
    session: 'Sáng', // Tiêm chủng thường vào buổi sáng
    careType: 'MedicalCare',
    isCompleted: v.status === 'Đã tiêm',
    note: `Đăng ký từ lịch tiêm chủng (Trạng thái: ${v.status})`,
    isVaccination: true,
    originalVacId: v.id
  }));

  // Lấy các kế hoạch/nhiệm vụ chăm sóc của trẻ đang chọn được phân công cho bảo mẫu này
  const childPlans = carePlans.filter(p => 
    p.childId === selectedChildId && 
    p.employeeId === employeeInfo?.id &&
    (p.status === 1 || p.status === 4 || p.status === 5)
  ).map(p => {
    const isOverdue = p.status === 5 || (p.status === 1 && dayjs().isAfter(dayjs(p.endDate), 'day'));
    const statusText = p.status === 4 ? 'Đã hoàn thành' : (isOverdue ? 'Quá hạn (Trễ)' : 'Đang thực hiện');
    
    // Format vật tư kèm theo
    const suppliesStr = p.supplies && p.supplies.length > 0
      ? ` [Vật tư: ${p.supplies.map((s: any) => `${s.itemName} (x${s.quantity})`).join(', ')}]`
      : '';

    const planLogs = careLogs.filter((l: any) => l.planId === p.id);
    const latestLog = planLogs.length > 0 ? planLogs[planLogs.length - 1] : null;
    const caregiverNotes = latestLog ? latestLog.activityDetails : '';

    return {
      id: `plan-${p.id}`,
      childId: p.childId,
      taskName: `Kế hoạch: ${p.title || p.goal}${suppliesStr}`,
      session: 'Sáng', // Hiển thị trong ca Sáng
      careType: 'BasicCare',
      isCompleted: p.status === 4,
      note: caregiverNotes 
        ? `Nhật ký: ${caregiverNotes} (Hạn: ${dayjs(p.endDate).format('DD/MM/YYYY')})` 
        : `Hạn: ${dayjs(p.endDate).format('DD/MM/YYYY')} - Trạng thái: ${statusText}`,
      caregiverNotes: caregiverNotes,
      isCarePlan: true,
      isOverdue: isOverdue,
      originalPlanId: p.id,
      supplies: p.supplies || []
    };
  });

  // Hợp nhất danh sách task hàng ngày, lịch tiêm chủng và kế hoạch chăm sóc
  const combinedTasks = [...childTasks, ...childVaccinations, ...childPlans];

  // Group tasks by session (Morning, Noon, Afternoon, Night)
  const sessions = {
    'Sáng': combinedTasks.filter(t => t.session === 'Sáng'),
    'Trưa': combinedTasks.filter(t => t.session === 'Trưa'),
    'Chiều': combinedTasks.filter(t => t.session === 'Chiều'),
    'Tối': combinedTasks.filter(t => t.session === 'Tối')
  };

  // Toggle completion of task
  const handleToggleComplete = async (taskId: string, checked: boolean) => {
    try {
      if (taskId.startsWith('vac-')) {
        const originalVacId = taskId.replace('vac-', '');
        const vac = vaccinations.find(v => v.id === originalVacId);
        if (vac) {
          await apiClient.put(`/api/Vaccinations/${originalVacId}`, {
            childId: vac.childId,
            vaccineName: vac.vaccineName,
            dose: vac.dose,
            vaccinationDate: vac.vaccinationDate,
            status: checked ? 'Đã tiêm' : 'Chờ tiêm'
          });
          message.success(checked ? 'Đã đánh dấu hoàn thành tiêm chủng' : 'Đã hủy hoàn thành tiêm chủng');
          
          // Refresh vaccinations list
          const vacRes = await apiClient.get('/api/Vaccinations');
          setVaccinations(vacRes.data.lists || []);
        }
      } else if (taskId.startsWith('plan-')) {
        const originalPlanId = taskId.replace('plan-', '');
        const plan = carePlans.find(p => p.id === originalPlanId);
        if (plan) {
          // Send update care plan request to mark completed (status = 4) or approved (status = 1)
          await apiClient.put(`/api/CarePlans/${originalPlanId}`, {
            id: originalPlanId,
            title: plan.title,
            startDate: plan.startDate,
            endDate: plan.endDate,
            employeeId: plan.employeeId,
            status: checked ? 4 : 1, // 4 = Completed, 1 = Approved
            supplies: (plan.supplies || []).map((s: any) => ({
              inventoryItemId: s.inventoryItemId,
              quantity: s.quantity
            }))
          });
          message.success(checked ? 'Đã hoàn thành nhiệm vụ & tự động xuất vật tư đi kèm thành công!' : 'Đã hủy hoàn thành nhiệm vụ');
          
          // Refresh care plans list
          const plansRes = await apiClient.get('/api/CarePlans');
          setCarePlans(plansRes.data.lists || []);
        }
      } else {
        const task = dailyTasks.find(t => t.id === taskId);
        await apiClient.put(`/api/DailyCareTasks/${taskId}`, {
          isCompleted: checked,
          note: task?.note || ''
        });
        message.success(checked ? 'Đã hoàn thành công việc' : 'Đã hủy hoàn thành');
        
        // Refresh task list
        const tasksRes = await apiClient.get('/api/DailyCareTasks', {
          params: { employeeId: employeeInfo?.id, taskDate: dayjs().toISOString() }
        });
        setDailyTasks(tasksRes.data.lists || []);
      }
    } catch (error) {
      console.error(error);
      message.error('Không thể cập nhật tiến độ công việc');
    }
  };

  // Save task note
  const handleSaveNote = async (values: any) => {
    if (!activeTask) return;
    setSubmittingNote(true);
    try {
      if (activeTask.isCarePlan) {
        // Create a CareLog for the CarePlan task
        await apiClient.post('/api/CareLogs', {
          planId: activeTask.originalPlanId,
          employeeId: employeeInfo?.id || null,
          logTime: dayjs().toISOString(),
          activityDetails: values.note,
          status: activeTask.isCompleted ? 'Hoàn thành' : 'Đang thực hiện'
        });
        message.success('Đã ghi nhận nhật ký chăm sóc (Ghi chú kế hoạch)');
      } else {
        // Traditional DailyCareTask note update
        await apiClient.put(`/api/DailyCareTasks/${activeTask.id}`, {
          isCompleted: activeTask.isCompleted,
          note: values.note
        });
        message.success('Đã lưu ghi chú công việc');
      }
      setIsNoteModalOpen(false);
      noteForm.resetFields();
      setActiveTask(null);
      
      // Refresh task lists
      await fetchData();
    } catch (error) {
      console.error(error);
      message.error('Không thể cập nhật ghi chú');
    } finally {
      setSubmittingNote(false);
    }
  };

  // Handle emergency incident report
  const handleCreateIncident = async (values: any) => {
    setSubmittingIncident(true);
    try {
      const payload = {
        childId: values.childId,
        reporterId: employeeInfo?.id || null,
        incidentDate: values.incidentDate ? values.incidentDate.toISOString() : dayjs().toISOString(),
        description: values.description,
        severity: values.severity // 0, 1, 2
      };

      await apiClient.post('/api/Incidents', payload);
      message.success('Đã gửi báo cáo sự cố khẩn cấp!');
      setIsIncidentModalOpen(false);
      incidentForm.resetFields();
    } catch (error) {
      console.error(error);
      message.error('Không thể gửi báo cáo sự cố!');
    } finally {
      setSubmittingIncident(false);
    }
  };

  // Handle supplies request
  const handleCreateSupplyRequest = async (values: any) => {
    setSubmittingSupply(true);
    try {
      const targetItem = inventoryItems.find(i => i.id === values.itemId);
      const itemName = targetItem ? targetItem.itemName : '';
      const requestNotes = `[ĐANG CHỜ DUYỆT] Bảo mẫu ${employeeInfo?.fullName || 'Bảo mẫu'} yêu cầu cấp phát ${values.quantity} ${targetItem?.unit || 'đơn vị'} ${itemName}. Lý do: ${values.reason}`;

      await apiClient.post('/api/InventoryTransactions', {
        itemId: values.itemId,
        employeeId: employeeInfo?.id || null,
        type: 2, // Export
        quantity: values.quantity,
        transactionDate: dayjs().toISOString(),
        notes: requestNotes,
        referenceDocument: 'REQ-' + Math.floor(1000 + Math.random() * 9000)
      });

      message.success('Đã gửi yêu cầu cấp phát vật tư/thuốc.');
      setIsSupplyModalOpen(false);
      supplyForm.resetFields();
    } catch (error) {
      console.error(error);
      message.error('Không thể gửi yêu cầu vật tư!');
    } finally {
      setSubmittingSupply(false);
    }
  };

  // Check if child has a medical record
  const hasMedicalAlert = (childId: string) => {
    return medicalRecords.some(r => r.childId === childId);
  };

  // Get active diagnosis for child list warning badge
  const getActiveDiagnosis = (childId: string) => {
    const records = medicalRecords.filter(r => r.childId === childId);
    const active = records.find(r => r.diagnosis && r.diagnosis !== 'Khám sức khỏe tổng quát ban đầu');
    return active ? active.diagnosis : null;
  };

  // Filter children by search term
  const filteredChildren = children.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-1" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* QUICK ACTIONS BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px 24px', borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <HeartOutlined style={{ color: '#ec4899', marginRight: 8 }} />
            Bảng Điều Khiển Ca Trực Bảo Mẫu
          </Title>
          <Text type="secondary">Nhân viên: {employeeInfo?.fullName || 'Đang tải...'} - Vai trò: {employeeInfo?.position || 'Bảo mẫu'}</Text>
        </div>
        <Space size="middle">
          <Button
            type="primary"
            danger
            icon={<WarningOutlined />}
            onClick={() => {
              incidentForm.setFieldsValue({ childId: selectedChildId, incidentDate: dayjs(), severity: 2 });
              setIsIncidentModalOpen(true);
            }}
            style={{ height: 40, borderRadius: 8, fontWeight: 600 }}
          >
            Báo cáo sự cố khẩn cấp
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              const selectedChild = children.find(c => c.id === selectedChildId);
              supplyForm.setFieldsValue({ reason: `Cấp phát nhu yếu phẩm/thuốc cho bé ${selectedChild?.fullName || 'Trẻ em'}` });
              setIsSupplyModalOpen(true);
            }}
            style={{ height: 40, borderRadius: 8, fontWeight: 600, backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' }}
          >
            Yêu cầu vật tư / thuốc
          </Button>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="Đang tải dữ liệu ca trực..." />
        </div>
      ) : (
        <Row gutter={24}>
          {/* LEFT COLUMN: Children list */}
          <Col xs={24} md={8} lg={8}>
            <Card
              title={<span style={{ fontWeight: 700 }}>Danh sách trẻ em trực ca</span>}
              style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
            >
              <Input
                placeholder="Tìm kiếm bé..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ marginBottom: 16, borderRadius: 6 }}
                allowClear
              />
              {filteredChildren.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <Text type="secondary">Không tìm thấy bé nào.</Text>
                </div>
              ) : (
                <List
                  dataSource={filteredChildren}
                  renderItem={(child: any) => {
                    const isSelected = child.id === selectedChildId;
                    const activeDiagnosis = getActiveDiagnosis(child.id);
                    return (
                      <List.Item
                        onClick={() => setSelectedChildId(child.id)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderRadius: 8,
                          marginBottom: 8,
                          background: isSelected ? '#f5f3ff' : '#transparent',
                          border: isSelected ? '1px solid #c084fc' : '1px solid #e5e7eb',
                          transition: 'all 0.2s',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Space>
                          <Avatar style={{ backgroundColor: isSelected ? '#8b5cf6' : '#9ca3af' }}>
                            {child.fullName ? child.fullName[0].toUpperCase() : 'C'}
                          </Avatar>
                          <span style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? '#7c3aed' : '#374151' }}>
                            {child.fullName}
                          </span>
                          {activeDiagnosis && (
                            <Tag color="error" style={{ borderRadius: 10, margin: 0, padding: '0 6px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={activeDiagnosis}>
                              <MedicineBoxOutlined style={{ marginRight: 4 }} /> {activeDiagnosis}
                            </Tag>
                          )}
                        </Space>
                      </List.Item>
                    );
                  }}
                />
              )}
            </Card>
          </Col>

          {/* RIGHT COLUMN: Checklist */}
          <Col xs={24} md={16} lg={16}>
            <Card
              title={
                <span>
                  Nhiệm vụ trong ngày cho bé:{' '}
                  <Text strong style={{ color: '#7c3aed', fontSize: '18px' }}>
                    {children.find(c => c.id === selectedChildId)?.fullName || 'Chưa chọn'}
                  </Text>
                </span>
              }
              style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
            >
              {combinedTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <SmileOutlined style={{ fontSize: '40px', color: '#bfbfbf', marginBottom: 16 }} />
                  <br />
                  <Text type="secondary">Bé chưa có kế hoạch sinh hoạt hoặc chăm sóc y tế nào được tạo hôm nay.</Text>
                </div>
              ) : (
                Object.entries(sessions).map(([sessionName, tasks]) => {
                  if (tasks.length === 0) return null;
                  return (
                    <div key={sessionName} style={{ marginBottom: 24 }}>
                      <Title level={5} style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: 8, color: '#4b5563' }}>
                        Buổi {sessionName} ({tasks.length} công việc)
                      </Title>
                      <List
                        dataSource={tasks}
                        renderItem={(task: any) => {
                          const isMedical = task.careType === 'MedicalCare';
                          return (
                            <List.Item
                              style={{
                                padding: '12px 16px',
                                borderRadius: 8,
                                marginBottom: 8,
                                background: task.isVaccination ? '#f5f3ff' : (task.isCarePlan ? (task.isOverdue ? '#fff1f2' : '#f0fdf4') : (isMedical ? '#fff5f5' : '#f9fafb')),
                                border: task.isVaccination ? '1px solid #d8b4fe' : (task.isCarePlan ? (task.isOverdue ? '1px solid #fecdd3' : '1px solid #bbf7d0') : (isMedical ? '1px solid #fecaca' : '1px solid #f3f4f6')),
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '85%' }}>
                                <Checkbox
                                  checked={task.isCompleted}
                                  onChange={e => handleToggleComplete(task.id, e.target.checked)}
                                  style={{
                                    transform: 'scale(1.1)',
                                    color: task.isVaccination ? '#8b5cf6' : (task.isCarePlan ? '#10b981' : (isMedical ? '#ef4444' : '#3b82f6'))
                                  }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <Space>
                                    {task.isVaccination && (
                                      <SyringeIcon style={{ color: '#8b5cf6', fontSize: '16px', marginRight: 4 }} />
                                    )}
                                    <Text delete={task.isCompleted} strong={isMedical || task.isVaccination || task.isCarePlan} style={{ color: task.isCompleted ? '#9ca3af' : '#1f2937' }}>
                                      {task.taskName}
                                    </Text>
                                    {task.isVaccination ? (
                                      <Tag color="purple" style={{ fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <SyringeIcon style={{ fontSize: '11px' }} /> Lịch Tiêm Chủng
                                      </Tag>
                                    ) : task.isCarePlan ? (
                                      <Tag color={task.isOverdue ? "red" : "green"} style={{ fontSize: '10px', fontWeight: 600 }}>
                                        {task.isOverdue ? "TRỄ / QUÁ HẠN" : "KẾ HOẠCH"}
                                      </Tag>
                                    ) : isMedical ? (
                                      <Tag color="red" style={{ fontSize: '10px' }}>Y Tế (Medical)</Tag>
                                    ) : (
                                      <Tag color="blue" style={{ fontSize: '10px' }}>Cơ Bản (Basic)</Tag>
                                    )}
                                  </Space>
                                  {task.note && (
                                    <Text type="secondary" style={{ fontSize: '12px', marginTop: 4, display: 'block', fontStyle: 'italic' }}>
                                      Ghi chú: {task.note}
                                    </Text>
                                  )}
                                </div>
                              </div>
                              {!task.isVaccination && (
                                <Button
                                  icon={<EditOutlined />}
                                  type="text"
                                  onClick={() => {
                                    setActiveTask(task);
                                    noteForm.setFieldsValue({ note: task.isCarePlan ? task.caregiverNotes : task.note || '' });
                                    setIsNoteModalOpen(true);
                                  }}
                                />
                              )}
                            </List.Item>
                          );
                        }}
                      />
                    </div>
                  );
                })
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* POPUP: EDIT NOTE */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#7c3aed' }} />
            <span>Ghi chú cho nhiệm vụ</span>
          </Space>
        }
        open={isNoteModalOpen}
        onCancel={() => {
          setIsNoteModalOpen(false);
          setActiveTask(null);
        }}
        onOk={() => noteForm.submit()}
        confirmLoading={submittingNote}
        centered
        okText="Lưu ghi chú"
        cancelText="Hủy"
      >
        <Form form={noteForm} layout="vertical" onFinish={handleSaveNote} style={{ marginTop: 16 }}>
          <Form.Item name="note" label="Ghi chú chi tiết công việc" rules={[{ required: true, message: 'Vui lòng nhập ghi chú!' }]}>
            <TextArea rows={4} placeholder="Nhập trạng thái trẻ, tác dụng thuốc, hoặc các lưu ý khác..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* EMERGENCY INCIDENT MODAL */}
      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: '#ef4444' }} />
            <span style={{ color: '#ef4444', fontWeight: 700 }}>Tạo Báo Cáo Sự Cố Khẩn Cấp</span>
          </Space>
        }
        open={isIncidentModalOpen}
        onCancel={() => setIsIncidentModalOpen(false)}
        onOk={() => incidentForm.submit()}
        confirmLoading={submittingIncident}
        centered
        width={600}
        okText="Báo cáo ngay"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Form form={incidentForm} layout="vertical" onFinish={handleCreateIncident} style={{ marginTop: 20 }}>
          <Form.Item name="childId" label="Trẻ em liên quan" rules={[{ required: true, message: 'Vui lòng chọn trẻ em!' }]}>
            <Select placeholder="Chọn trẻ em từ danh sách" showSearch optionFilterProp="label">
              {children.map(child => (
                <Option key={child.id} value={child.id} label={child.fullName}>
                  {child.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="incidentDate" label="Thời gian xảy ra" rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}>
            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="severity" label="Mức độ nghiêm trọng" rules={[{ required: true }]}>
            <Select placeholder="Chọn mức độ">
              <Option value={0}>Nhẹ (Low)</Option>
              <Option value={1}>Trung bình (Medium)</Option>
              <Option value={2}>Nghiêm trọng (High - Cấp cứu)</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Chi tiết sự việc & Biện pháp sơ cứu" rules={[{ required: true, message: 'Vui lòng nhập mô tả sự việc!' }]}>
            <TextArea rows={4} placeholder="Mô tả sự cố, chấn thương hoặc các dấu hiệu cấp bách cùng phương pháp xử lý tại chỗ..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* SUPPLIES REQUEST MODAL */}
      <Modal
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: '#0ea5e9' }} />
            <span>Yêu Cầu Vật Tư / Thuốc</span>
          </Space>
        }
        open={isSupplyModalOpen}
        onCancel={() => setIsSupplyModalOpen(false)}
        onOk={() => supplyForm.submit()}
        confirmLoading={submittingSupply}
        centered
        width={600}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
      >
        <Form form={supplyForm} layout="vertical" onFinish={handleCreateSupplyRequest} style={{ marginTop: 20 }}>
          <Form.Item name="itemId" label="Chọn vật phẩm / Nhu yếu phẩm / Thuốc" rules={[{ required: true, message: 'Vui lòng chọn vật phẩm!' }]}>
            <Select placeholder="Chọn sữa, tã, bỉm, thực phẩm, thuốc men..." showSearch optionFilterProp="children">
              {inventoryItems.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.itemName} (Hiện có: {item.currentQuantity} {item.unit})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="quantity" label="Số lượng yêu cầu cấp phát" rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập số lượng" />
          </Form.Item>

          <Form.Item name="reason" label="Lý do yêu cầu cấp phát & Đối tượng nhận" rules={[{ required: true, message: 'Vui lòng nhập lý do cụ thể!' }]}>
            <TextArea rows={4} placeholder="Ví dụ: Cấp phát thuốc ho cho bé Nguyễn Thị Hoa..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ShiftDashboard;
