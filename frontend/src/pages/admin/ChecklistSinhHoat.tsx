import React, { useState, useEffect } from 'react';
import { Card, Checkbox, Button, List, Space, Typography, Tag, Spin, message, Row, Col, Divider } from 'antd';
import { CheckOutlined, FileDoneOutlined, SmileOutlined, HistoryOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiClient from '../../services/apiClient';

const { Title, Text } = Typography;

const ChecklistSinhHoat: React.FC = () => {
  const [carePlans, setCarePlans] = useState<any[]>([]);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState<{ [key: string]: boolean }>({});
  const [employeeInfo, setEmployeeInfo] = useState<any>(null);

  // Lưu trữ trạng thái checklist cho mỗi CarePlan: { planId: { activityKey: checked } }
  const [checkedActivities, setCheckedActivities] = useState<{ [planId: string]: { [activity: string]: boolean } }>({});

  const activitiesList = ['Ăn sáng', 'Vệ sinh phòng ở', 'Cho uống sữa / Bổ sung dinh dưỡng', 'Ăn trưa', 'Giờ ngủ trưa', 'Hoạt động vui chơi / Thể chất'];

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Lấy thông tin user hiện tại
      const meRes = await apiClient.get('/api/Users/me');
      const user = meRes.data;

      // 2. Trích xuất trực tiếp thông tin Employee từ UserDto mới được cập nhật ở backend
      const currentEmp = {
        id: user.employeeId,
        fullName: user.fullName,
        position: user.position
      };
      setEmployeeInfo(currentEmp);

      // 3. Lấy danh sách trẻ em
      const childrenRes = await apiClient.get('/api/Children', {
        params: { PageNumber: 1, PageSize: 100 }
      });
      const allChildren = childrenRes.data.items || [];
      setChildren(allChildren);

      // 4. Lấy danh sách kế hoạch chăm sóc
      const plansRes = await apiClient.get('/api/CarePlans', {
        params: { PageNumber: 1, PageSize: 100 }
      });
      const rawPlans = plansRes.data.lists || [];
      setAllPlans(rawPlans);

      // Chỉ lấy kế hoạch đang hoạt động và đã được duyệt (Approved = 1)
      const activePlans = rawPlans.filter((p: any) => p.status === 1);

      // 5. Lấy danh sách nhật ký công việc đã thực hiện hôm nay
      try {
        const logsRes = await apiClient.get('/api/CareLogs');
        const allLogs = logsRes.data.lists || [];
        const myTodayLogs = allLogs.filter((log: any) => 
          log.employeeId === currentEmp.id && 
          dayjs(log.logTime).isSame(dayjs(), 'day')
        );
        setTodayLogs(myTodayLogs);
      } catch (logErr) {
        console.error("Lỗi lấy nhật ký công việc:", logErr);
      }

      // Lọc kế hoạch chăm sóc được phân công cho nhân viên này
      if (currentEmp && user.roles?.includes('CareGiver')) {
        const myPlans = activePlans.filter((p: any) => p.employeeId === currentEmp.id);
        setCarePlans(myPlans);
        initializeChecklists(myPlans);
        return;
      }

      setCarePlans(activePlans);
      initializeChecklists(activePlans);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách kế hoạch chăm sóc');
    } finally {
      setLoading(false);
    }
  };

  const initializeChecklists = (plans: any[]) => {
    const initialChecked: { [planId: string]: { [activity: string]: boolean } } = {};
    plans.forEach(plan => {
      initialChecked[plan.id] = {
        'Ăn sáng': false,
        'Vệ sinh phòng ở': false,
        'Cho uống sữa / Bổ sung dinh dưỡng': false,
        'Ăn trưa': false,
        'Giờ ngủ trưa': false,
        'Hoạt động vui chơi / Thể chất': false,
      };
    });
    setCheckedActivities(initialChecked);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckboxChange = (planId: string, activity: string, checked: boolean) => {
    setCheckedActivities(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [activity]: checked
      }
    }));
  };

  // Nộp kết quả checklist sinh hoạt
  const handleSaveChecklist = async (planId: string) => {
    const plan = carePlans.find(p => p.id === planId);
    if (!plan) return;

    setSubmitting(prev => ({ ...prev, [planId]: true }));

    try {
      const childName = children.find(c => c.id === plan.childId)?.fullName || 'Trẻ em';
      
      // Lấy danh sách các hoạt động đã tích chọn
      const completedActivities = Object.keys(checkedActivities[planId])
        .filter(key => checkedActivities[planId][key]);

      if (completedActivities.length === 0) {
        message.warning('Vui lòng chọn ít nhất một hoạt động sinh hoạt để hoàn thành!');
        setSubmitting(prev => ({ ...prev, [planId]: false }));
        return;
      }

      const activityStr = `Checklist sinh hoạt cho ${childName}: Đã hoàn thành các công việc (${completedActivities.join(', ')})`;

      // Tạo nhật ký chăm sóc (CareLog) lưu lại vào cơ sở dữ liệu
      await apiClient.post('/api/CareLogs', {
        planId: planId,
        employeeId: employeeInfo?.id || null,
        logTime: dayjs().toISOString(),
        activityDetails: activityStr,
        status: 'Hoàn thành'
      });

      message.success(`Đã cập nhật hoàn thành công việc sinh hoạt của bé ${childName}.`);
      
      // Reset checklist của bé này về trạng thái chưa chọn
      setCheckedActivities(prev => ({
        ...prev,
        [planId]: {
          'Ăn sáng': false,
          'Vệ sinh phòng ở': false,
          'Cho uống sữa / Bổ sung dinh dưỡng': false,
          'Ăn trưa': false,
          'Giờ ngủ trưa': false,
          'Hoạt động vui chơi / Thể chất': false,
        }
      }));

      // Tải lại dữ liệu để cập nhật bảng Nhật ký công việc hôm nay
      fetchData();
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra khi lưu nhật ký sinh hoạt');
    } finally {
      setSubmitting(prev => ({ ...prev, [planId]: false }));
    }
  };

  return (
    <div className="p-1">
      <Card
        title={
          <Space>
            <FileDoneOutlined style={{ color: '#ec4899', fontSize: '20px' }} />
            <Title level={4} style={{ margin: 0 }}>Checklist Sinh Hoạt Hàng Ngày Của Trẻ</Title>
          </Space>
        }
        style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" tip="Đang tải danh sách kế hoạch sinh hoạt..." />
          </div>
        ) : carePlans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <SmileOutlined style={{ fontSize: '40px', color: '#bfbfbf', marginBottom: 16 }} />
            <br />
            <Text type="secondary">Hôm nay không có kế hoạch chăm sóc sinh hoạt nào cần thực hiện trực ca.</Text>
          </div>
        ) : (
          <List
            grid={{ gutter: 24, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 }}
            dataSource={carePlans}
            renderItem={(plan: any) => {
              const child = children.find(c => c.id === plan.childId);
              return (
                <List.Item>
                  <Card
                    title={
                      <Space>
                        <Tag color="cyan">Kế hoạch chăm sóc</Tag>
                        <Text strong style={{ fontSize: 16 }}>{child?.fullName || 'Đang tải...'}</Text>
                      </Space>
                    }
                    style={{ borderRadius: 10, border: '1px solid #e2e8f0' }}
                    actions={[
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        loading={submitting[plan.id]}
                        onClick={() => handleSaveChecklist(plan.id)}
                        style={{ width: '90%', borderRadius: 6, backgroundColor: '#10b981', borderColor: '#10b981' }}
                      >
                        Cập nhật hoàn thành
                      </Button>
                    ]}
                  >
                    <div style={{ marginBottom: 12 }}>
                      <Text type="secondary" style={{ fontSize: 13 }}>Tiêu đề: </Text>
                      <Text strong style={{ fontSize: 13 }}>{plan.title}</Text>
                    </div>

                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      {activitiesList.map(activity => (
                        <Row key={activity} align="middle">
                          <Col span={24}>
                            <Checkbox
                              checked={checkedActivities[plan.id]?.[activity] || false}
                              onChange={(e) => handleCheckboxChange(plan.id, activity, e.target.checked)}
                            >
                              {activity}
                            </Checkbox>
                          </Col>
                        </Row>
                      ))}
                    </Space>
                  </Card>
                </List.Item>
              );
            }}
          />
        )}
      </Card>

      <Card
        title={
          <Space>
            <HistoryOutlined style={{ color: '#10b981', fontSize: '20px' }} />
            <Title level={4} style={{ margin: 0 }}>Công Việc Đã Thực Hiện Hôm Nay</Title>
          </Space>
        }
        style={{ borderRadius: 12, marginTop: 24, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
      >
        {todayLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Text type="secondary">Hôm nay bạn chưa thực hiện ghi nhận công việc sinh hoạt nào.</Text>
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={todayLogs}
            renderItem={(log: any) => {
              const plan = allPlans.find((p: any) => p.id === log.planId);
              const planTitle = plan?.title || "Kế hoạch dinh dưỡng";
              const childId = plan?.childId;
              const childName = children.find(c => c.id === childId)?.fullName || "Trẻ em";
              
              return (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong style={{ fontSize: '15px' }}>{childName}</Text>
                        <Text type="secondary" style={{ fontSize: '13px' }}>({planTitle})</Text>
                        <Tag color="green">Đã hoàn thành</Tag>
                      </Space>
                    }
                    description={
                      <div style={{ marginTop: 4 }}>
                        <Text style={{ display: 'block', color: '#374151' }}>{log.activityDetails}</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          Thời gian ghi nhận: {dayjs(log.logTime).format('HH:mm')}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default ChecklistSinhHoat;
