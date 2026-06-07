import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Space, Typography, Card, Select, Radio, message, Tag, Spin } from 'antd';
import { CheckCircleOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiClient from '../../services/apiClient';

const { Title, Text } = Typography;
const { Option } = Select;

const AttendanceManagement: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState<any>(null);

  // 1. Tải thông tin phòng và nhân viên hiện tại
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingRooms(true);
      try {
        // Lấy thông tin user hiện tại
        const meRes = await apiClient.get('/api/Users/me');
        const user = meRes.data;
        
        // Trích xuất trực tiếp thông tin Employee từ UserDto mới được cập nhật ở backend
        const currentEmp = {
          id: user.employeeId,
          fullName: user.fullName,
          position: user.position
        };
        setEmployeeInfo(currentEmp);

        // Lấy danh sách các phòng
        const roomsRes = await apiClient.get('/api/Rooms');
        const allRooms = roomsRes.data.lists || [];
        
        // Nếu là bảo mẫu, lọc các phòng theo khu vực phụ trách
        if (currentEmp && user.roles?.includes('CareGiver')) {
          const pos = (currentEmp.position || '').toLowerCase();
          let locationFilter = '';
          if (pos.includes('mầm non')) locationFilter = 'Khu Mầm Non';
          else if (pos.includes('nhi đồng')) locationFilter = 'Khu Nhi Đồng';
          else if (pos.includes('thiếu niên')) locationFilter = 'Khu Thiếu Niên';

          if (locationFilter) {
            const filteredRooms = allRooms.filter((r: any) => r.location === locationFilter);
            setRooms(filteredRooms);
            if (filteredRooms.length > 0) {
              setSelectedRoomId(filteredRooms[0].id);
            }
            return;
          }
        }
        
        setRooms(allRooms);
        if (allRooms.length > 0) {
          setSelectedRoomId(allRooms[0].id);
        }
      } catch (error) {
        console.error(error);
        message.error('Không thể tải thông tin phòng trực');
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchInitialData();
  }, []);

  // 2. Tải danh sách trẻ em của phòng được chọn
  useEffect(() => {
    if (!selectedRoomId) return;

    const fetchChildrenInRoom = async () => {
      setLoadingChildren(true);
      try {
        // Lấy toàn bộ trẻ em
        const childRes = await apiClient.get('/api/Children', {
          params: { PageNumber: 1, PageSize: 100 }
        });
        const allChildren = childRes.data.items || [];
        
        // Lọc trẻ em thuộc phòng được chọn
        const roomChildren = allChildren.filter((c: any) => c.roomId === selectedRoomId);
        setChildren(roomChildren);

        // Khởi tạo trạng thái điểm danh mặc định là "Có mặt" cho toàn bộ trẻ
        const initialAttendance: { [key: string]: string } = {};
        roomChildren.forEach((c: any) => {
          initialAttendance[c.id] = 'Có mặt';
        });
        setAttendance(initialAttendance);
      } catch (error) {
        console.error(error);
        message.error('Không thể tải danh sách trẻ em của phòng');
      } finally {
        setLoadingChildren(false);
      }
    };

    fetchChildrenInRoom();
  }, [selectedRoomId]);

  // Thay đổi trạng thái điểm danh của từng trẻ
  const handleAttendanceChange = (childId: string, value: string) => {
    setAttendance(prev => ({
      ...prev,
      [childId]: value
    }));
  };

  // 3. GỬI XÁC NHẬN ĐIỂM DANH
  const handleSubmitAttendance = async () => {
    if (!selectedRoomId || children.length === 0) return;
    setSubmitting(true);

    try {
      const selectedRoom = rooms.find(r => r.id === selectedRoomId);
      const roomName = selectedRoom ? selectedRoom.roomName : 'Không xác định';

      // Tạo chuỗi nội dung chi tiết điểm danh để lưu vào CareLog
      const detailsList = children.map(c => {
        const status = attendance[c.id];
        return `${c.fullName}: ${status}`;
      });
      const logDetails = `Điểm danh phòng ${roomName}: ${detailsList.join(', ')}`;

      // 1. Tạo CareLog lưu lại hoạt động điểm danh
      await apiClient.post('/api/CareLogs', {
        planId: null, // Không gắn với kế hoạch cụ thể
        employeeId: employeeInfo?.id || null,
        logTime: dayjs().toISOString(),
        activityDetails: logDetails,
        status: 'Hoàn thành'
      });

      // 2. Cập nhật trạng thái thực tế của trẻ em lên database nếu vắng mặt tại phòng y tế
      for (const child of children) {
        const attStatus = attendance[child.id];
        let newStatus = 0; // Active (Đang bảo trợ)
        let newHealth = child.healthStatus;

        if (attStatus === 'Vắng mặt - Phòng Y Tế') {
          newStatus = 3; // Hospitalized (Cần chăm sóc y tế / Nằm viện)
          newHealth = 'Nhiệt độ cao / Mệt mỏi, chuyển theo dõi phòng y tế';
        } else if (attStatus === 'Vắng mặt - Đi học') {
          newStatus = 0; // Active
        }

        // Cập nhật trạng thái bé lên DB nếu có thay đổi
        if (attStatus.startsWith('Vắng mặt')) {
          await apiClient.put(`/api/Children/${child.id}`, {
            id: child.id,
            fullName: child.fullName,
            dob: child.dob,
            gender: child.gender,
            healthStatus: newHealth,
            background: child.background,
            roomId: child.roomId,
            status: newStatus,
            weight: child.weight,
            height: child.height
          });
        }
      }

      message.success(`Điểm danh phòng ${roomName} thành công! Lịch sử đã được lưu.`);
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra khi lưu thông tin điểm danh');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Họ và Tên trẻ',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string) => <Text strong><UserOutlined style={{ marginRight: 8 }} />{text}</Text>,
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: number) => (gender === 0 ? 'Nam' : 'Nữ'),
    },
    {
      title: 'Tuổi',
      dataIndex: 'dob',
      key: 'dob',
      render: (dob: string) => (dob ? dayjs().diff(dayjs(dob), 'year') : 'N/A'),
    },
    {
      title: 'Trạng thái hiện tại',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const texts = ['Đang bảo trợ', 'Đã nhận nuôi', 'Sẵn sàng nhận nuôi', 'Chăm sóc y tế'];
        const colors = ['green', 'blue', 'purple', 'orange'];
        return <Tag color={colors[status] || 'default'}>{texts[status] || 'Khác'}</Tag>;
      }
    },
    {
      title: 'Điểm Danh Trực Ca',
      key: 'attendance',
      width: 400,
      render: (_: any, record: any) => (
        <Radio.Group
          value={attendance[record.id]}
          onChange={(e) => handleAttendanceChange(record.id, e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="Có mặt" style={{ backgroundColor: attendance[record.id] === 'Có mặt' ? '#22c55e' : '', borderColor: attendance[record.id] === 'Có mặt' ? '#22c55e' : '', color: attendance[record.id] === 'Có mặt' ? 'white' : '' }}>
            Có mặt
          </Radio.Button>
          <Radio.Button value="Vắng mặt - Đi học" style={{ backgroundColor: attendance[record.id] === 'Vắng mặt - Đi học' ? '#3b82f6' : '', borderColor: attendance[record.id] === 'Vắng mặt - Đi học' ? '#3b82f6' : '', color: attendance[record.id] === 'Vắng mặt - Đi học' ? 'white' : '' }}>
            Đi học
          </Radio.Button>
          <Radio.Button value="Vắng mặt - Phòng Y Tế" style={{ backgroundColor: attendance[record.id] === 'Vắng mặt - Phòng Y Tế' ? '#ef4444' : '', borderColor: attendance[record.id] === 'Vắng mặt - Phòng Y Tế' ? '#ef4444' : '', color: attendance[record.id] === 'Vắng mặt - Phòng Y Tế' ? 'white' : '' }}>
            Phòng Y Tế
          </Radio.Button>
        </Radio.Group>
      ),
    },
  ];

  return (
    <div className="p-1">
      <Card
        title={
          <Space>
            <EnvironmentOutlined style={{ color: '#0ea5e9', fontSize: '20px' }} />
            <Title level={4} style={{ margin: 0 }}>Điểm Danh Trẻ Em & Ca Trực Bảo Mẫu</Title>
          </Space>
        }
        extra={
          <Space>
            <Text type="secondary">Phòng trực ca:</Text>
            <Select
              loading={loadingRooms}
              value={selectedRoomId}
              onChange={(val) => setSelectedRoomId(val)}
              style={{ width: 200 }}
              placeholder="Chọn phòng trực"
            >
              {rooms.map(room => (
                <Option key={room.id} value={room.id}>
                  {room.roomName} ({room.location})
                </Option>
              ))}
            </Select>
          </Space>
        }
        style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
      >
        {loadingChildren ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" tip="Đang tải danh sách trẻ em trực phòng..." />
          </div>
        ) : children.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Text type="secondary">Không có trẻ em nào được phân bổ trong phòng này.</Text>
          </div>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Table
              columns={columns}
              dataSource={children}
              rowKey="id"
              pagination={false}
              style={{ borderRadius: 8 }}
            />
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={submitting}
                onClick={handleSubmitAttendance}
                style={{ height: 40, borderRadius: 6, backgroundColor: '#10b981', borderColor: '#10b981' }}
              >
                Xác nhận hoàn thành điểm danh
              </Button>
            </div>
          </Space>
        )}
      </Card>
    </div>
  );
};

export default AttendanceManagement;
