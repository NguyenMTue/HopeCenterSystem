import React, { useState, useMemo, useEffect } from 'react';
import { Table, Tag, Space, Button, Typography, Card, Input, Modal, message, Popconfirm, Descriptions, Divider, Tabs, Select, Form, List, Badge, Radio, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SearchOutlined, EyeOutlined, HeartOutlined, FileTextOutlined, UserOutlined, AuditOutlined, HistoryOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiClient from '../../services/apiClient';
import { getAdoptionList, updateAdoption } from '../../services/adoptionService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AdoptionManagement: React.FC = () => {
  // 1. STATES
  const [activeTab, setActiveTab] = useState('applications');
  const [data, setData] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Modal states
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  
  // Matching States
  const [selectedAppForMatching, setSelectedAppForMatching] = useState<string | null>(null);
  const [selectedChildIdForApp, setSelectedChildIdForApp] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>('All');

  const [followUpForm] = Form.useForm();
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);

  // 2. FETCH DATA
  const fetchAdoptions = async () => {
    setLoading(true);
    try {
      const resData = await getAdoptionList();
      setData(resData.lists || []);
    } catch (error) {
      message.error('Không thể tải danh sách đơn nhận nuôi!');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const res = await apiClient.get('/api/Children', {
        params: { PageNumber: 1, PageSize: 100 }
      });
      setChildren(res.data.items || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFollowUps = async () => {
    try {
      const res = await apiClient.get('/api/PostAdoptionFollowUps');
      setFollowUps(res.data.lists || []);
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
    fetchAdoptions();
    fetchChildren();
    fetchFollowUps();
    fetchCurrentUser();
  }, []);

  const userRoles = currentUser?.roles || [];
  const isManagerOnly = userRoles.includes('Manager') && !userRoles.includes('Director');
  const isDirectorOrAdmin = userRoles.includes('Director') || userRoles.includes('Administrator');

  // Helper translations
  const getStatusText = (status: number | string): string => {
    const statusVal = status !== undefined && status !== null ? status.toString() : '';
    if (statusVal === '0' || statusVal === 'Pending') return 'Chờ duyệt';
    if (statusVal === '1' || statusVal === 'Approved') return 'Đã phê duyệt';
    if (statusVal === '2' || statusVal === 'Rejected') return 'Từ chối';
    if (statusVal === '3' || statusVal === 'AwaitingMatching') return 'Đã xác minh - Chờ ghép đôi';
    if (statusVal === '4' || statusVal === 'Completed') return 'Hoàn thành';
    if (statusVal === '5' || statusVal === 'Overdue') return 'Trễ';
    if (statusVal === '6' || statusVal === 'MatchingProposed') return 'Đã đề xuất bé';
    if (statusVal === '7' || statusVal === 'AdopterAccepted') return 'Người nhận nuôi đồng ý';
    if (statusVal === '8' || statusVal === 'AdopterRejected') return 'Người nhận nuôi từ chối';
    return String(status);
  };

  const getStatusColor = (status: number | string) => {
    const statusVal = status !== undefined && status !== null ? status.toString() : '';
    if (statusVal === '0' || statusVal === 'Pending') return 'blue';
    if (statusVal === '1' || statusVal === 'Approved') return 'green';
    if (statusVal === '2' || statusVal === 'Rejected') return 'red';
    if (statusVal === '3' || statusVal === 'AwaitingMatching') return 'purple';
    if (statusVal === '4' || statusVal === 'Completed') return 'success';
    if (statusVal === '5' || statusVal === 'Overdue') return 'rose';
    if (statusVal === '6' || statusVal === 'MatchingProposed') return 'indigo';
    if (statusVal === '7' || statusVal === 'AdopterAccepted') return 'cyan';
    if (statusVal === '8' || statusVal === 'AdopterRejected') return 'orange';
    return 'default';
  };

  const getAssessmentText = (rating: any): string => {
    if (rating === undefined || rating === null) return 'Chưa đánh giá';
    const ratingVal = rating.toString().trim();
    if (ratingVal === '0' || ratingVal === 'Good') return 'Tốt (Good)';
    if (ratingVal === '1' || ratingVal === 'Average') return 'Trung bình (Average)';
    if (ratingVal === '2' || ratingVal === 'NeedsIntervention') return 'Cần can thiệp (Needs Intervention)';
    return ratingVal;
  };

  const getAssessmentColor = (rating: any): string => {
    if (rating === undefined || rating === null) return 'default';
    const ratingVal = rating.toString().trim();
    if (ratingVal === '0' || ratingVal === 'Good') return 'green';
    if (ratingVal === '1' || ratingVal === 'Average') return 'orange';
    if (ratingVal === '2' || ratingVal === 'NeedsIntervention') return 'red';
    return 'default';
  };

  // 3. ACTION HANDLERS
  const handleUpdateStatus = async (id: string, statusCode: number, reason?: string) => {
    try {
      const original = data.find(item => item.id === id);
      if (!original) return;

      await updateAdoption(id, {
        status: statusCode,
        childId: original.childId,
        notes: original.notes,
        reason: original.reason,
        desiredCriteria: original.desiredCriteria,
        rejectionReason: reason || original.rejectionReason,
        approverId: currentUser?.employeeId || null
      });

      message.success('Cập nhật trạng thái thành công!');
      setIsViewOpen(false);
      fetchAdoptions();
      fetchChildren(); // Child status might change to Adopted
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.detail || 'Không thể cập nhật trạng thái đơn!';
      message.error(errMsg);
    }
  };

  const handleProposeMatch = async (appId: string, childId: string) => {
    try {
      const original = data.find(item => item.id === appId);
      if (!original) return;

      await apiClient.put(`/api/AdoptionApplications/${appId}`, {
        id: appId,
        status: 6, // MatchingProposed!
        childId: childId,
        notes: original.notes,
        reason: original.reason,
        desiredCriteria: original.desiredCriteria
      });

      message.success('Đã chọn bé đề xuất ghép đôi thành công!');
      fetchAdoptions();
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.detail || 'Không thể thực hiện ghép đôi!';
      message.error(errMsg);
    }
  };

  const handleCreateFollowUp = async (values: any) => {
    if (!selectedApp) return;
    setSubmittingFollowUp(true);
    try {
      await apiClient.post('/api/PostAdoptionFollowUps', {
        applicationId: selectedApp.id,
        evaluatorId: currentUser?.employeeId || null,
        healthNotes: values.healthNotes,
        livingEnvironmentNotes: values.livingEnvironmentNotes,
        educationNotes: values.educationNotes,
        overallAssessment: parseInt(values.overallAssessment)
      });

      message.success('Đã ghi nhận báo cáo thăm hỏi thành công!');
      setIsFollowUpModalOpen(false);
      followUpForm.resetFields();
      fetchFollowUps();
    } catch (error) {
      console.error(error);
      message.error('Không thể lưu báo cáo thăm hỏi!');
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  // 4. DATA FILTERING
  const filteredApplications = useMemo(() => {
    return data.filter(item => {
      const searchLower = searchText.toLowerCase();
      const applicantName = item.adopterName || '';
      const childName = item.childName || '';
      return applicantName.toLowerCase().includes(searchLower) || childName.toLowerCase().includes(searchLower);
    });
  }, [data, searchText]);

  // Anonymize child name
  const anonymizeChildName = (name: string) => {
    if (!name) return 'Chưa chỉ định';
    const parts = name.trim().split(' ');
    if (parts.length === 0) return '';
    const lastName = parts[parts.length - 1];
    const initials = parts.slice(0, parts.length - 1).map(p => p[0].toUpperCase() + '.').join('');
    return `Bé ${initials} ${lastName[0]}***`;
  };

  // 5. RENDER TABS
  // Tab 1: List of Applications & Verification/Approval
  const renderApplicationsTab = () => {
    const columns = [
      {
        title: 'Người nhận nuôi đăng ký',
        dataIndex: 'adopterName',
        key: 'adopterName',
        render: (text: string) => <Text strong style={{ fontSize: 15 }}>{text}</Text>
      },
      {
        title: 'Tiêu chí mong muốn',
        dataIndex: 'desiredCriteria',
        key: 'desiredCriteria',
        render: (text: string) => <Text type="secondary">{text || 'N/A'}</Text>
      },
      {
        title: 'Trẻ em đề xuất',
        dataIndex: 'childName',
        key: 'childName',
        render: (text: string) => <Text>{text || 'Chờ ghép đôi'}</Text>
      },
      {
        title: 'Ngày nộp đơn',
        dataIndex: 'submitDate',
        key: 'submitDate',
        render: (date: any) => dayjs(date).format('DD/MM/YYYY')
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (status: any) => (
          <Tag color={getStatusColor(status)} style={{ fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
            {getStatusText(status).toUpperCase()}
          </Tag>
        )
      },
      {
        title: 'Hành động',
        key: 'actions',
        width: 180,
        render: (_: any, record: any) => (
          <Space>
            {/* Manager verification */}
            {isManagerOnly && (record.status === 'Pending' || record.status === 0) && (
              <Popconfirm title="Xác minh và chuyển sang Chờ ghép đôi?" onConfirm={() => handleUpdateStatus(record.id, 3)}>
                <Button type="primary" size="small" style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }} icon={<AuditOutlined />}>
                  Xác minh
                </Button>
              </Popconfirm>
            )}

            {/* Director approval */}
            {isDirectorOrAdmin && (record.status === 'AdopterAccepted' || record.status === 7) && (
              <Popconfirm title="Phê duyệt nhận nuôi?" onConfirm={() => handleUpdateStatus(record.id, 1)}>
                <Button type="primary" size="small" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }} icon={<CheckCircleOutlined />}>
                  Phê duyệt
                </Button>
              </Popconfirm>
            )}
            {isDirectorOrAdmin && [0, 'Pending', 3, 'AwaitingMatching', 7, 'AdopterAccepted', 8, 'AdopterRejected'].includes(record.status) && (
              <Popconfirm title="Từ chối đơn nhận nuôi?" onConfirm={() => handleUpdateStatus(record.id, 2)} okButtonProps={{ danger: true }}>
                <Button danger size="small" icon={<CloseCircleOutlined />}>
                  Từ chối
                </Button>
              </Popconfirm>
            )}

            <Button type="default" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedApp(record); setIsViewOpen(true); }}>
              Chi tiết
            </Button>
          </Space>
        )
      }
    ];

    return (
      <Table
        columns={columns}
        dataSource={filteredApplications}
        rowKey="id"
        loading={loading}
        bordered
      />
    );
  };

  // Tab 2: Matching Process (Anonymized)
  const renderMatchingTab = () => {
    // Select applications in AwaitingMatching or AdopterRejected state
    const awaitingApps = data.filter(a => [3, 'AwaitingMatching', 8, 'AdopterRejected'].includes(a.status));

    const activeApp = data.find(a => a.id === selectedAppForMatching);

    const filteredChildrenList = children.filter(c => {
      // Show only active children (available for adoption)
      if (c.status !== 'Active' && c.status !== 0) return false;
      
      // Filter by gender
      if (genderFilter !== 'All') {
        const genText = c.gender === 0 || c.gender === 'Male' ? 'Boy' : 'Girl';
        if (genderFilter === 'Boy' && genText !== 'Boy') return false;
        if (genderFilter === 'Girl' && genText !== 'Girl') return false;
      }

      // Filter by age group
      if (ageGroupFilter !== 'All') {
        const age = dayjs().diff(dayjs(c.dob), 'year');
        if (ageGroupFilter === 'Nursery' && age > 3) return false;
        if (ageGroupFilter === 'Childhood' && (age < 4 || age > 10)) return false;
        if (ageGroupFilter === 'Teenage' && age < 11) return false;
      }

      return true;
    });

    return (
      <Card style={{ borderRadius: 12 }}>
        <Title level={4}>Quy trình Ghép đôi Trẻ em & Người nhận nuôi (Ẩn danh thông tin trẻ)</Title>
        <Text type="secondary">
          Bước này giúp Manager đối chiếu nguyện vọng gia đình và đề xuất ghép đôi trẻ phù hợp. Mọi thông tin nhạy cảm của trẻ như Họ tên, Gia cảnh gốc đều được ẩn danh.
        </Text>
        <Divider />
        <Row gutter={24} style={{ marginTop: 16 }}>
          {/* Left Column: Applications Awaiting Matching */}
          <Col xs={24} md={10}>
            <Card title="1. Đơn chờ ghép đôi (Đã xác minh)" size="small" style={{ background: '#f8fafc' }}>
              {awaitingApps.length === 0 ? (
                <div style={{ padding: '30px 0', textAlign: 'center' }}>
                  <Text type="secondary">Không có đơn nào ở trạng thái chờ ghép đôi.</Text>
                </div>
              ) : (
                <List
                  dataSource={awaitingApps}
                  renderItem={(item: any) => {
                    const isSelected = item.id === selectedAppForMatching;
                    return (
                      <List.Item
                        onClick={() => setSelectedAppForMatching(item.id)}
                        style={{
                          cursor: 'pointer',
                          padding: '12px 16px',
                          borderRadius: 8,
                          marginBottom: 8,
                          background: isSelected ? '#ede9fe' : '#fff',
                          border: isSelected ? '1px solid #8b5cf6' : '1px solid #e2e8f0',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div>
                          <Text strong style={{ display: 'block', color: isSelected ? '#6d28d9' : '#1e293b' }}>
                            {item.adopterName}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Đã xác minh ngày: {dayjs(item.lastModified).format('DD/MM/YYYY')}
                          </Text>
                          {item.childName && (
                            <div style={{ marginTop: 4 }}>
                              <Badge status="processing" text={`Đề xuất: ${anonymizeChildName(item.childName)}`} />
                            </div>
                          )}
                        </div>
                      </List.Item>
                    );
                  }}
                />
              )}
            </Card>
          </Col>

          {/* Right Column: Anonymized Children Filter & Matching */}
          <Col xs={24} md={14}>
            <Card title="2. Danh sách trẻ sẵn sàng nhận nuôi (Anonymized)" size="small">
              {!selectedAppForMatching ? (
                <div style={{ padding: '80px 0', textAlign: 'center' }}>
                  <HeartOutlined style={{ fontSize: '32px', color: '#cbd5e1', marginBottom: 12 }} />
                  <br />
                  <Text type="secondary">Vui lòng chọn một hồ sơ nhận nuôi ở cột trái để thực hiện ghép đôi.</Text>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
                    <div>
                      <Text type="secondary" style={{ marginRight: 8 }}>Giới tính:</Text>
                      <Radio.Group size="small" value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
                        <Radio.Button value="All">Tất cả</Radio.Button>
                        <Radio.Button value="Boy">Nam</Radio.Button>
                        <Radio.Button value="Girl">Nữ</Radio.Button>
                      </Radio.Group>
                    </div>
                    <div>
                      <Text type="secondary" style={{ marginRight: 8 }}>Độ tuổi:</Text>
                      <Radio.Group size="small" value={ageGroupFilter} onChange={e => setAgeGroupFilter(e.target.value)}>
                        <Radio.Button value="All">Tất cả</Radio.Button>
                        <Radio.Button value="Nursery">Mầm non (0-3)</Radio.Button>
                        <Radio.Button value="Childhood">Nhi đồng (4-10)</Radio.Button>
                        <Radio.Button value="Teenage">Thiếu niên (11+)</Radio.Button>
                      </Radio.Group>
                    </div>
                  </div>

                  <List
                    dataSource={filteredChildrenList}
                    pagination={{ pageSize: 4, size: 'small' }}
                    renderItem={(child: any) => {
                      const childAge = dayjs().diff(dayjs(child.dob), 'year');
                      const isCurrentlyProposed = activeApp?.childId === child.id;

                      return (
                        <List.Item
                          style={{
                            padding: '12px 16px',
                            border: '1px solid #f1f5f9',
                            borderRadius: 8,
                            marginBottom: 8,
                            background: isCurrentlyProposed ? '#f0fdf4' : '#fff',
                            borderColor: isCurrentlyProposed ? '#bbf7d0' : '#f1f5f9'
                          }}
                          actions={[
                            isCurrentlyProposed ? (
                              <Tag color="success" icon={<CheckCircleOutlined />}>Đã chọn đề xuất</Tag>
                            ) : (
                              <Button 
                                type="primary" 
                                size="small" 
                                disabled={!isDirectorOrAdmin} 
                                onClick={() => handleProposeMatch(activeApp.id, child.id)}
                              >
                                Đề xuất ghép đôi
                              </Button>
                            )
                          ]}
                        >
                          <List.Item.Meta
                            title={<Text strong style={{ color: '#0f172a' }}>{anonymizeChildName(child.fullName)}</Text>}
                            description={
                              <Space size="large" style={{ marginTop: 4, fontSize: '13px' }}>
                                <span>Giới tính: <Text strong>{child.gender === 0 || child.gender === 'Male' ? 'Nam' : 'Nữ'}</Text></span>
                                <span>Tuổi: <Text strong>{childAge} tuổi</Text></span>
                                <span>Chiều cao: <Text strong>{child.height} cm</Text></span>
                                <span>Cân nặng: <Text strong>{child.weight} kg</Text></span>
                              </Space>
                            }
                          />
                          <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginTop: 4 }}>
                            Tiểu sử: [ẨN DANH] Thông tin gia cảnh nhạy cảm đã được bảo mật.
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    );
  };

  // Tab 3: Post-Adoption Follow-Ups
  const renderPostAdoptionTab = () => {
    // Approved or Completed applications indicate successful adoptions
    const adoptedApps = data.filter(a => ['Approved', 1, 'Completed', 4].includes(a.status));

    const getAssessmentTag = (rating: any) => {
      return <Tag color={getAssessmentColor(rating)}>{getAssessmentText(rating)}</Tag>;
    };

    return (
      <Card style={{ borderRadius: 12 }}>
        <Title level={4}>Theo dõi Hậu nhận nuôi (Post-Adoption Tracking)</Title>
        <Text type="secondary">
          Ghi nhận thông tin thăm hỏi, kiểm tra điều kiện sinh sống, sức khỏe và giáo dục của các trẻ sau khi đã được nhận về gia đình nuôi dưỡng.
        </Text>
        <Divider />
        <Table
          dataSource={adoptedApps}
          rowKey="id"
          bordered
          columns={[
            {
              title: 'Người nhận nuôi',
              dataIndex: 'adopterName',
              key: 'adopterName',
              render: (text: string) => <Text strong>{text}</Text>
            },
            {
              title: 'Trẻ nhận nuôi',
              dataIndex: 'childName',
              key: 'childName'
            },
            {
              title: 'Ngày bàn giao trẻ',
              dataIndex: 'lastModified',
              key: 'lastModified',
              render: (date: any) => dayjs(date).format('DD/MM/YYYY')
            },
            {
              title: 'Lịch sử thăm hỏi',
              key: 'followUpCount',
              render: (_: any, record: any) => {
                const count = followUps.filter(f => f.applicationId === record.id).length;
                return <Badge count={count} showZero color={count > 0 ? '#10b981' : '#94a3b8'} style={{ fontSize: '12px' }} />;
              }
            },
            {
              title: 'Thao tác',
              key: 'postActions',
              render: (_: any, record: any) => (
                <Space>
                  <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { setSelectedApp(record); setIsFollowUpModalOpen(true); }}>
                    Ghi nhận thăm hỏi
                  </Button>
                  <Button type="default" size="small" icon={<HistoryOutlined />} onClick={() => { setSelectedApp(record); setIsViewOpen(true); }}>
                    Xem báo cáo
                  </Button>
                </Space>
              )
            }
          ]}
        />
      </Card>
    );
  };

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1e293b' }}>Hệ thống Quản lý & Thẩm định Nhận nuôi</Title>
          <Text type="secondary">Nhân viên: {currentUser?.fullName} - Vai trò: {userRoles.join(', ')}</Text>
        </div>
        {activeTab === 'applications' && (
          <Input
            placeholder="Tìm tên người đăng ký hoặc tên bé..."
            prefix={<SearchOutlined style={{ marginRight: 8 }} />}
            style={{ width: 350, height: 40, borderRadius: 8 }}
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
          />
        )}
      </div>

      <Tabs activeKey={activeTab} onChange={key => setActiveTab(key)}>
        <Tabs.TabPane tab="Thẩm định Hồ sơ" key="applications">
          {renderApplicationsTab()}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Quy trình Ghép đôi (Matching)" key="matching">
          {renderMatchingTab()}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Theo dõi Hậu nhận nuôi" key="post-adoption">
          {renderPostAdoptionTab()}
        </Tabs.TabPane>
      </Tabs>

      {/* MODAL 1: VIEW DETAILS & APPLICANT VERIFY LOGS */}
      <Modal
        title={<Title level={3} style={{ margin: 0 }}>Chi tiết đơn nhận nuôi</Title>}
        open={isViewOpen}
        onCancel={() => { setIsViewOpen(false); setSelectedApp(null); setSelectedChildIdForApp(null); }}
        width={750}
        centered
        footer={[
          <Button key="close" onClick={() => { setIsViewOpen(false); setSelectedApp(null); setSelectedChildIdForApp(null); }}>Đóng</Button>,
          isManagerOnly && selectedApp && (selectedApp.status === 0 || selectedApp.status === 'Pending') ? (
            <Button 
              key="verify" 
              type="primary" 
              style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
              onClick={() => handleUpdateStatus(selectedApp.id, 3)}
            >
              Xác minh hồ sơ
            </Button>
          ) : null,
          isDirectorOrAdmin && selectedApp && (selectedApp.status === 7 || selectedApp.status === 'AdopterAccepted') ? (
            <Button 
              key="approve"
              type="primary" 
              style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
              onClick={() => handleUpdateStatus(selectedApp.id, 1)}
            >
              Phê duyệt nhận nuôi
            </Button>
          ) : null,
          isDirectorOrAdmin && selectedApp && [0, 'Pending', 3, 'AwaitingMatching', 7, 'AdopterAccepted', 8, 'AdopterRejected'].includes(selectedApp.status) ? (
            <Button 
              key="reject"
              danger 
              onClick={() => handleUpdateStatus(selectedApp.id, 2)}
            >
              Từ chối đơn
            </Button>
          ) : null
        ].filter(Boolean)}
      >
        {selectedApp && (
          <div style={{ marginTop: 20 }}>
            <Descriptions bordered column={1} labelStyle={{ fontWeight: 700, width: '220px', background: '#f8fafc' }}>
              <Descriptions.Item label="Họ tên người đăng ký">{selectedApp.adopterName}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedApp.phone || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ cư trú">{selectedApp.address || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Tiêu chí mong muốn">{selectedApp.desiredCriteria || 'Chưa cung cấp'}</Descriptions.Item>
              <Descriptions.Item label="Trẻ em được đề xuất">{selectedApp.childName || 'Chờ ghép đôi'}</Descriptions.Item>
              <Descriptions.Item label="Ngày gửi yêu cầu">{dayjs(selectedApp.submitDate).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái hiện tại">
                <Tag color={getStatusColor(selectedApp.status)} style={{ fontWeight: 700 }}>
                  {getStatusText(selectedApp.status).toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }}>Lý do xin nhận nuôi</Divider>
            <div style={{ background: '#f1f5f9', padding: '16px 20px', borderRadius: 8, fontStyle: 'italic' }}>
              "{selectedApp.reason || 'Không có ghi chú.'}"
            </div>

            {/* Director Match Propose Section */}
            {isDirectorOrAdmin && (selectedApp.status === 3 || selectedApp.status === 'AwaitingMatching' || selectedApp.status === 8 || selectedApp.status === 'AdopterRejected') && (
              <div style={{ marginTop: 24, padding: 16, background: '#f5f3ff', borderRadius: 12, border: '1px solid #ddd6fe' }}>
                <Title level={5} style={{ color: '#6d28d9', margin: '0 0 12px 0' }}>Đề xuất ghép đôi (Dành cho Giám đốc)</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>Chọn một em bé từ danh sách trẻ sẵn sàng nhận nuôi để đề xuất:</Text>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Select
                      showSearch
                      placeholder="Tìm kiếm và chọn em bé..."
                      optionFilterProp="children"
                      value={selectedChildIdForApp || undefined}
                      onChange={val => setSelectedChildIdForApp(val)}
                      style={{ flex: 1 }}
                    >
                      {children
                        .filter(c => c.status === 'Active' || c.status === 0 || c.status === 'Active')
                        .map(c => {
                          const childAge = dayjs().diff(dayjs(c.dob), 'year');
                          return (
                            <Option key={c.id} value={c.id}>
                              {c.fullName} ({c.gender === 0 || c.gender === 'Male' ? 'Nam' : 'Nữ'} - {childAge} tuổi)
                            </Option>
                          );
                        })
                      }
                    </Select>
                    <Button 
                      type="primary" 
                      style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                      disabled={!selectedChildIdForApp}
                      onClick={async () => {
                        if (!selectedChildIdForApp) return;
                        await handleProposeMatch(selectedApp.id, selectedChildIdForApp);
                        setSelectedChildIdForApp(null);
                        setIsViewOpen(false);
                      }}
                    >
                      Xác nhận đề xuất
                    </Button>
                  </div>
                </Space>
              </div>
            )}

            {/* If there are post-adoption follow-ups log */}
            {['Approved', 1, 'Completed', 4].includes(selectedApp.status) ? (
              <div style={{ marginTop: 24 }}>
                <Title level={4}>Lịch sử báo cáo thăm hỏi hậu nhận nuôi</Title>
                <List
                  dataSource={followUps.filter(f => f.applicationId === selectedApp.id)}
                  renderItem={(f: any) => (
                    <List.Item style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 0' }}>
                      <List.Item.Meta
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text strong>Ngày thăm hỏi: {dayjs(f.followUpDate).format('DD/MM/YYYY')}</Text>
                            <Tag color={getAssessmentColor(f.overallAssessment)}>
                              {getAssessmentText(f.overallAssessment)}
                            </Tag>
                          </div>
                        }
                        description={
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                            <div><Text type="secondary">Sức khỏe:</Text> {f.healthNotes || 'Chưa ghi nhận'}</div>
                            <div><Text type="secondary">Môi trường sống:</Text> {f.livingEnvironmentNotes || 'Chưa ghi nhận'}</div>
                            <div><Text type="secondary">Giáo dục:</Text> {f.educationNotes || 'Chưa ghi nhận'}</div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: 'Chưa có báo cáo thăm hỏi hậu nhận nuôi nào.' }}
                />
              </div>
            ) : null}
          </div>
        )}
      </Modal>

      {/* MODAL 2: ADD POST-ADOPTION FOLLOW-UP REPORT */}
      <Modal
        title={<Title level={3} style={{ margin: 0 }}>Ghi nhận thăm hỏi Hậu nhận nuôi</Title>}
        open={isFollowUpModalOpen}
        onCancel={() => { setIsFollowUpModalOpen(false); followUpForm.resetFields(); }}
        width={650}
        centered
        confirmLoading={submittingFollowUp}
        onOk={() => followUpForm.submit()}
        okText="Lưu báo cáo"
        cancelText="Hủy"
      >
        {selectedApp && (
          <div style={{ marginTop: 16 }}>
            <Descriptions size="small" column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Gia đình">{selectedApp.adopterName}</Descriptions.Item>
              <Descriptions.Item label="Trẻ">{selectedApp.childName}</Descriptions.Item>
            </Descriptions>

            <Form form={followUpForm} layout="vertical" onFinish={handleCreateFollowUp}>
              <Form.Item name="healthNotes" label="Tình trạng sức khỏe & Phát triển thể chất" rules={[{ required: true, message: 'Vui lòng nhập ghi nhận sức khỏe!' }]}>
                <TextArea rows={3} placeholder="Nhập ghi nhận cân nặng, ăn uống, bệnh lý phát sinh..." />
              </Form.Item>
              <Form.Item name="livingEnvironmentNotes" label="Môi trường sống & Tâm lý gia đình" rules={[{ required: true, message: 'Vui lòng nhập ghi nhận môi trường sống!' }]}>
                <TextArea rows={3} placeholder="Nhập ghi nhận điều kiện chỗ ngủ, phòng học, mối quan hệ giữa ba mẹ nuôi và trẻ..." />
              </Form.Item>
              <Form.Item name="educationNotes" label="Giáo dục & Chăm sóc tinh thần" rules={[{ required: true, message: 'Vui lòng nhập ghi nhận giáo dục!' }]}>
                <TextArea rows={3} placeholder="Nhập ghi nhận tình hình đi học mầm non/lớp lá, các lớp năng khiếu, giao tiếp..." />
              </Form.Item>
              <Form.Item name="overallAssessment" label="Đánh giá tổng quan an toàn và phát triển" rules={[{ required: true, message: 'Vui lòng chọn đánh giá tổng quan!' }]}>
                <Select placeholder="Chọn mức đánh giá tổng quan">
                  <Option value="0">Tốt - Trẻ phát triển bình thường, môi trường tốt (Good)</Option>
                  <Option value="1">Trung bình - Cần theo dõi thêm (Average)</Option>
                  <Option value="2">Cần can thiệp - Có dấu hiệu bạo hành, bỏ bê hoặc rủi ro (Needs Intervention)</Option>
                </Select>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default AdoptionManagement;