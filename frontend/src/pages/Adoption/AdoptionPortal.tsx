import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Typography, 
  Space, 
  Button, 
  message, 
  Badge, 
  Timeline, 
  Steps, 
  Modal, 
  Select, 
  Input, 
  Form, 
  Divider, 
  Spin,
  Alert,
  Tabs,
  Image
} from 'antd';
import { 
  Heart, 
  User, 
  Home, 
  FolderOpen, 
  BadgeCheck, 
  ShieldAlert, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Upload, 
  Check, 
  Clock, 
  FileText,
  Phone,
  MessageSquare,
  Building,
  HeartHandshake,
  Lock,
  Unlock,
  Eye
} from 'lucide-react';
import { 
  EyeOutlined, 
  BellOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined,
  HeartFilled,
  InfoCircleOutlined
} from '@ant-design/icons';
import apiClient from '../../services/apiClient';
import { useOutletContext } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const AdoptionPortal: React.FC = () => {
  const { fetchUserInfo } = useOutletContext<any>() || {};

  // Navigation & View State
  const [view, setView] = useState<'portal' | 'form' | 'profile'>('portal');
  const [activeTab, setActiveTab] = useState<string>('children');
  
  // Data State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  
  // Loading States
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Details Modal
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  
  // New Application Form wizard State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formState, setFormState] = useState({
    fullName: '',
    phone: '',
    maritalStatus: '',
    address: '',
    idCard: '',
    occupation: '',
    incomeScope: '',
    homeDesc: '',
    desiredCriteria: '',
    reason: '',
    doc1Uploaded: false,
    doc2Uploaded: false,
    doc3Uploaded: false,
    agreed: false
  });

  // Calculate approval status based on applications
  const isApproved = applications.some(a => {
    const s = a.status !== undefined && a.status !== null ? a.status.toString() : '';
    return s === '1' || s === 'Approved' || s === '4' || s === 'Completed';
  });

  // Calculate verified status (approved by manager/director, awaiting matching or further steps)
  const isVerified = applications.some(a => {
    const s = a.status !== undefined && a.status !== null ? a.status.toString() : '';
    return ['1', 'Approved', '3', 'AwaitingMatching', '4', 'Completed', '6', 'MatchingProposed', '7', 'AdopterAccepted'].includes(s);
  });

  const getAdoptionStep = () => {
    if (applications.length === 0) return 0;
    const latestApp = applications[0];
    const statusVal = latestApp.status !== undefined && latestApp.status !== null ? latestApp.status.toString() : '';

    if (statusVal === '0' || statusVal === 'Pending' || statusVal === '2' || statusVal === 'Rejected') {
      return 0; // Bước 1: Nộp đơn đăng ký
    }
    if (statusVal === '3' || statusVal === 'AwaitingMatching') {
      return 1; // Bước 2: Xác minh gia cảnh
    }
    if (statusVal === '6' || statusVal === 'MatchingProposed' || statusVal === '7' || statusVal === 'AdopterAccepted' || statusVal === '8' || statusVal === 'AdopterRejected') {
      return 2; // Bước 3: Đề xuất & Phản hồi
    }
    if (statusVal === '1' || statusVal === 'Approved') {
      return 3; // Bước 4: Phê duyệt quyết định
    }
    if (statusVal === '4' || statusVal === 'Completed') {
      return 4; // Bước 5: Bàn giao & Hoàn thành
    }
    return 0;
  };

  // Load User Information & Applications on mount
  useEffect(() => {
    fetchUserData();
    fetchApplications();
    fetchChildren();
  }, []);

  const fetchUserData = async () => {
    setLoadingUser(true);
    try {
      const response = await apiClient.get('/api/Users/me');
      setCurrentUser(response.data);
      
      // Sync user data to form state for stepper prefilling
      setFormState(prev => ({
        ...prev,
        fullName: response.data.fullName || '',
        phone: response.data.phone || '',
        maritalStatus: response.data.maritalStatus || '',
        address: response.data.address || '',
        idCard: response.data.idCard || '',
        occupation: response.data.position || ''
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      message.error('Không thể tải thông tin cá nhân.');
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const response = await apiClient.get('/api/AdoptionApplications/my');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching my applications:', error);
      setApplications([
        {
          id: 'APP-SEED-01',
          childName: 'Nguyễn Gia Bảo',
          submitDate: '2026-05-20',
          status: 0,
          reason: 'Gia đình có nguyện vọng nhận thêm bé trai để chăm sóc và tạo môi trường phát triển tốt nhất.',
          notes: 'Môi trường sống: Nhà 3 tầng, sân vườn thoáng mát. Công việc: Giáo viên.'
        }
      ]);
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchChildren = async () => {
    setLoadingChildren(true);
    try {
      const response = await apiClient.get('/api/Children', {
        params: { PageNumber: 1, PageSize: 100 }
      });
      // Filter out children that are already adopted
      const activeChildren = (response.data.items || []).filter((c: any) => c.status !== 2 && c.status !== 'Adopted');
      setChildren(activeChildren);
    } catch (error) {
      console.error('Error fetching children:', error);
      message.error('Không thể tải danh sách trẻ em.');
    } finally {
      setLoadingChildren(false);
    }
  };

  // Trigger form view
  const startNewApplication = () => {
    setView('form');
    setCurrentStep(1);
    setFormState(prev => ({
      ...prev,
      desiredCriteria: '',
      reason: '',
      agreed: false,
      doc1Uploaded: false,
      doc2Uploaded: false,
      doc3Uploaded: false
    }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formState.fullName || !formState.idCard || !formState.maritalStatus || !formState.address) {
        message.warning('Vui lòng điền đầy đủ các thông tin cá nhân bắt buộc (*)');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formState.desiredCriteria) {
        message.warning('Vui lòng nhập các tiêu chí trẻ em mong muốn nhận nuôi (*)');
        return;
      }
      if (!formState.occupation || !formState.incomeScope || !formState.homeDesc) {
        message.warning('Vui lòng hoàn thành thông tin khảo sát điều kiện sống (*)');
        return;
      }
    }
    if (currentStep === 3) {
      if (!formState.doc1Uploaded || !formState.doc2Uploaded || !formState.doc3Uploaded) {
        message.warning('Vui lòng tải lên đầy đủ các tài liệu pháp lý bắt buộc (*)');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFileUpload = (docType: 'doc1Uploaded' | 'doc2Uploaded' | 'doc3Uploaded') => {
    setFormState(prev => ({ ...prev, [docType]: true }));
    message.success('Tải tài liệu lên thành công!');
  };

  // Submit Adoption Application & Sync User profile details
  const handleSubmitApplication = async () => {
    if (!formState.agreed) {
      message.warning('Bạn cần đồng ý với các điều khoản cam kết pháp lý.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Update Adopter Profile if adopterId exists
      if (currentUser?.adopterId) {
        await apiClient.put(`/api/Adopters/${currentUser.adopterId}`, {
          id: currentUser.adopterId,
          fullName: formState.fullName,
          idCard: formState.idCard,
          financialStatus: `Thu nhập: ${formState.incomeScope} | Nghề nghiệp: ${formState.occupation}`,
          maritalStatus: formState.maritalStatus,
          address: formState.address
        });
      }

      // 2. Submit Adoption application
      const structuredNotes = `Nghề nghiệp: ${formState.occupation}\nThu nhập: ${formState.incomeScope}\nMô tả không gian sống: ${formState.homeDesc}`;
      await apiClient.post('/api/AdoptionApplications', {
        childId: null,
        desiredCriteria: formState.desiredCriteria,
        reason: formState.reason || 'Mong muốn nuôi dưỡng em bé trưởng thành.',
        notes: structuredNotes
      });

      message.success('Gửi hồ sơ đăng ký nhận nuôi trực tuyến thành công!');
      setView('portal');
      fetchApplications();
      fetchUserData();
      if (fetchUserInfo) {
        fetchUserInfo();
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      message.error(error.response?.data?.detail || 'Có lỗi xảy ra khi gửi hồ sơ. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit profile form submit
  const handleUpdateProfile = async (values: any) => {
    if (!currentUser?.adopterId) return;
    setSubmitting(true);
    try {
      await apiClient.put(`/api/Adopters/${currentUser.adopterId}`, {
        id: currentUser.adopterId,
        fullName: values.fullName,
        idCard: values.idCard,
        financialStatus: values.financialStatus,
        maritalStatus: values.maritalStatus,
        address: values.address
      });
      message.success('Cập nhật hồ sơ cá nhân thành công!');
      setView('portal');
      fetchUserData();
      if (fetchUserInfo) {
        fetchUserInfo();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Không thể cập nhật hồ sơ cá nhân.');
    } finally {
      setSubmitting(false);
    }
  };

  // Convert application status to Tag representation
  const getStatusTag = (status: number | string) => {
    const statusVal = typeof status === 'string' ? status : status.toString();
    switch (statusVal) {
      case '0':
      case 'Pending': 
        return <Tag color="warning" icon={<ClockCircleOutlined />} style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>ĐANG THẨM ĐỊNH</Tag>;
      case '1':
      case 'Approved': 
        return <Tag color="success" icon={<CheckCircleOutlined />} style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>ĐÃ PHÊ DUYỆT</Tag>;
      case '2':
      case 'Rejected': 
        return <Tag color="error" icon={<CloseCircleOutlined />} style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>TỪ CHỐI</Tag>;
      case '3':
      case 'AwaitingMatching':
        return <Tag color="processing" icon={<ClockCircleOutlined />} style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>CHỜ GHÉP ĐÔI</Tag>;
      case '4':
      case 'Completed':
        return <Tag color="success" icon={<CheckCircleOutlined />} style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>HOÀN THÀNH</Tag>;
      case '5':
      case 'Overdue':
        return <Tag color="error" icon={<ClockCircleOutlined />} style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>TRỄ HẠN</Tag>;
      case '6':
      case 'MatchingProposed':
        return <Tag color="purple" icon={<InfoCircleOutlined />} style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>ĐÃ ĐỀ XUẤT BÉ</Tag>;
      case '7':
      case 'AdopterAccepted':
        return <Tag color="cyan" icon={<CheckCircleOutlined />} style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>ĐÃ ĐỒNG Ý BÉ</Tag>;
      case '8':
      case 'AdopterRejected':
        return <Tag color="orange" icon={<CloseCircleOutlined />} style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>ĐÃ TỪ CHỐI BÉ</Tag>;
      default: 
        return <Tag color="default" style={{ padding: '4px 10px', borderRadius: '6px' }}>{statusVal}</Tag>;
    }
  };

  // Format date display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <Text strong className="font-mono text-slate-700">{text.substring(0, 8).toUpperCase()}</Text>,
    },
    {
      title: 'Em bé đăng ký',
      dataIndex: 'childName',
      key: 'childName',
      render: (text: string) => <Text strong style={{ color: '#0f172a' }}>{text || 'Đang cập nhật'}</Text>
    },
    {
      title: 'Ngày nộp đơn',
      dataIndex: 'submitDate',
      key: 'submitDate',
      render: (date: string) => <Text type="secondary">{formatDate(date)}</Text>,
    },
    {
      title: 'Trạng thái xét duyệt',
      dataIndex: 'status',
      key: 'status',
      render: (status: any) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => {
            setSelectedApp(record);
            setIsDetailModalVisible(true);
          }}
          className="text-rose-500 hover:text-rose-600 font-bold"
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Helper to build child photo path or fallback to Unsplash placeholder
  const getChildImageUrl = (child: any) => {
    if (isApproved && child.avatarUrl) {
      if (child.avatarUrl.startsWith('http://') || child.avatarUrl.startsWith('https://')) {
        return child.avatarUrl;
      }
      const baseUrl = apiClient.defaults.baseURL || 'http://localhost:5176';
      return `${baseUrl}${child.avatarUrl}`;
    }
    // Fallback vector placeholder for masked child
    return 'https://images.unsplash.com/photo-1595250912759-99446d5c6be2?q=80&w=300&auto=format&fit=crop';
  };

  const handleProposalDecision = async (appId: string, decisionStatus: number) => {
    Modal.confirm({
      title: decisionStatus === 7 ? 'Xác nhận đồng ý nhận nuôi?' : 'Xác nhận từ chối đề xuất?',
      content: decisionStatus === 7 
        ? 'Bạn đồng ý với đề xuất ghép đôi bé này. Hồ sơ sẽ được chuyển lên Giám đốc để phê duyệt quyết định nhận nuôi chính thức.' 
        : 'Bạn từ chối đề xuất ghép đôi này. Trung tâm sẽ tiến hành tìm kiếm và đề xuất bé khác phù hợp hơn.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const app = applications.find(a => a.id === appId);
          if (!app) return;
          await apiClient.put(`/api/AdoptionApplications/${appId}`, {
            id: appId,
            childId: app.childId,
            status: decisionStatus,
            reason: app.reason,
            notes: app.notes,
            desiredCriteria: app.desiredCriteria
          });
          message.success(decisionStatus === 7 ? 'Đã phản hồi đồng ý nhận nuôi bé!' : 'Đã phản hồi từ chối đề xuất bé.');
          fetchApplications();
        } catch (error: any) {
          console.error('Error updating proposal status:', error);
          message.error(error.response?.data?.detail || 'Không thể cập nhật phản hồi.');
        }
      }
    });
  };

  const proposedApplication = applications.find(a => {
    const s = a.status !== undefined && a.status !== null ? a.status.toString() : '';
    return s === '6' || s === 'MatchingProposed';
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', minHeight: '80vh' }}>
      
      {/* 1. PORTAL MAIN VIEW */}
      {view === 'portal' && (
        <Space direction="vertical" size={28} style={{ width: '100%' }}>
          
          {/* Welcome Warm Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 p-8 md:p-12 text-white shadow-xl">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute right-12 top-6 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 space-y-4 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wide uppercase">
                <HeartFilled className="text-white animate-pulse" /> Cổng thông tin gia đình nhận nuôi
              </span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                Chào mừng bạn, {currentUser?.fullName || 'Người nhận nuôi'}!
              </h1>
              <p className="text-rose-100 text-sm leading-relaxed font-medium">
                Mỗi quyết định nhận nuôi là một chiếc phao cứu sinh, chắp cánh và vẽ nên bầu trời hạnh phúc mới cho những tâm hồn em thơ. Hope Center Việt Nam vô cùng trân trọng tấm lòng từ ái lớn lao của bạn.
              </p>
              
              <div className="pt-2 flex flex-wrap gap-3">
                <Button 
                  size="large" 
                  onClick={() => startNewApplication()}
                  style={{ 
                    borderRadius: '99px', 
                    fontWeight: 700, 
                    border: 'none', 
                    color: '#e11d48', 
                    background: '#ffffff',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  Đăng ký nhận nuôi mới 💖
                </Button>
                
                {currentUser?.adopterId && (
                  <Button 
                    size="large" 
                    ghost
                    onClick={() => setView('profile')}
                    style={{ 
                      borderRadius: '99px', 
                      fontWeight: 700, 
                      borderColor: '#ffffff',
                      color: '#ffffff'
                    }}
                  >
                    Cập nhật hồ sơ cá nhân
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="borderless" className="shadow-xs bg-slate-50 border border-slate-100/50 rounded-2xl">
              <Space direction="vertical" size={4}>
                <Text type="secondary" className="text-xs uppercase tracking-wider font-bold">Hồ sơ đã gửi</Text>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-800">{applications.length}</span>
                  <span className="text-xs font-medium text-slate-400">hồ sơ đã nộp</span>
                </div>
              </Space>
            </Card>

            <Card variant="borderless" className="shadow-xs bg-slate-50 border border-slate-100/50 rounded-2xl">
              <Space direction="vertical" size={4}>
                <Text type="secondary" className="text-xs uppercase tracking-wider font-bold">Trạng thái xác thực</Text>
                <div className="flex items-center gap-2">
                  {isVerified ? (
                    <>
                      <BadgeCheck className="text-emerald-500 w-8 h-8" />
                      <div>
                        <p className="text-sm font-bold text-emerald-600 leading-none">Hồ sơ đã xác minh</p>
                        <p className="text-[10px] text-slate-400 mt-1">Đủ điều kiện đề xuất ghép đôi</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Lock className="text-amber-500 w-7 h-7" />
                      <div>
                        <p className="text-sm font-bold text-amber-600 leading-none">Chờ xác minh hồ sơ</p>
                        <p className="text-[10px] text-slate-400 mt-1">Đang kiểm tra điều kiện gia cảnh</p>
                      </div>
                    </>
                  )}
                </div>
              </Space>
            </Card>

            <Card variant="borderless" className="shadow-xs bg-slate-50 border border-slate-100/50 rounded-2xl">
              <Space direction="vertical" size={4}>
                <Text type="secondary" className="text-xs uppercase tracking-wider font-bold">Tài liệu tư pháp liên hệ</Text>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                    <Phone size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 leading-none">0988.123.456</p>
                    <p className="text-[10px] text-slate-400 mt-1">Tổng đài viên tư pháp Hope Center</p>
                  </div>
                </div>
              </Space>
            </Card>
          </div>

          {/* Stepper Guide to Adoption Process */}
          <Card 
            title={<span className="font-bold text-slate-800 flex items-center gap-2"><HeartHandshake size={18} className="text-rose-500" /> Quy trình thẩm định nhận nuôi</span>}
            variant="borderless" 
            style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
          >
            <Steps
              size="small"
              current={getAdoptionStep()}
              items={[
                { title: '1. Nộp đơn đăng ký', description: 'Đang thẩm định hồ sơ' },
                { title: '2. Xác minh gia cảnh', description: 'Khảo sát & Lập báo cáo' },
                { title: '3. Đề xuất & Phản hồi', description: 'Ghép đôi & Nhận phản hồi' },
                { title: '4. Phê duyệt quyết định', description: 'Giám đốc phê duyệt cuối' },
                { title: '5. Bàn giao & Hoàn thành', description: 'Ký biên bản & Nhận con' }
              ]}
              style={{ padding: '8px 0' }}
            />
          </Card>

          {/* Proposal confirmation card if any proposed matching */}
          {proposedApplication && (
            <Card 
              variant="borderless" 
              className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-purple-100 rounded-3xl shadow-md p-6 md:p-8"
            >
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                {/* Child Image */}
                <div className="relative w-48 h-48 md:w-56 md:h-56 bg-slate-200 rounded-2xl overflow-hidden shadow-lg shrink-0 border-4 border-white">
                  <Image 
                    src={proposedApplication.childAvatarUrl ? (proposedApplication.childAvatarUrl.startsWith('http') ? proposedApplication.childAvatarUrl : `${apiClient.defaults.baseURL || 'http://localhost:5176'}${proposedApplication.childAvatarUrl}`) : 'https://images.unsplash.com/photo-1595250912759-99446d5c6be2?q=80&w=300&auto=format&fit=crop'}
                    alt={proposedApplication.childName}
                    className="object-cover w-full h-full"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Đề xuất ghép đôi
                  </span>
                </div>

                {/* Proposal Info & Choices */}
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-2">
                      ✨ Đề xuất ghép đôi nhận nuôi bé {proposedApplication.childName}
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">
                      Dựa trên các tiêu chí mong muốn của gia đình bạn: <i className="text-slate-700 font-medium">"{proposedApplication.desiredCriteria || 'Tùy chọn'}"</i>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-md bg-white/70 p-4 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Họ tên bé:</span>
                      <p className="font-bold text-slate-800 mt-0.5">{proposedApplication.childName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Giới tính:</span>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {proposedApplication.childGender === 0 || proposedApplication.childGender === 'Male' ? 'Nam' : 'Nữ'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Tình trạng sức khỏe:</span>
                      <p className="font-bold text-slate-800 mt-0.5">{proposedApplication.childHealthStatus || 'Khỏe mạnh'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Lý lịch hoàn cảnh:</span>
                      <p className="font-bold text-slate-800 mt-0.5 truncate">{proposedApplication.childBackground || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<Check size={16} />}
                      onClick={() => handleProposalDecision(proposedApplication.id, 7)}
                      style={{ 
                        borderRadius: 12, 
                        fontWeight: 700, 
                        backgroundColor: '#10b981', 
                        borderColor: '#10b981',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      Đồng ý nhận nuôi bé này
                    </Button>
                    <Button 
                      type="default" 
                      danger
                      size="large" 
                      icon={<Clock size={16} />}
                      onClick={() => handleProposalDecision(proposedApplication.id, 8)}
                      style={{ 
                        borderRadius: 12, 
                        fontWeight: 700 
                      }}
                    >
                      Từ chối đề xuất, tìm bé khác
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* History applications list (replacing tabs) */}
          <Card 
            title={<span className="font-bold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-rose-500" /> Danh sách hồ sơ đăng ký nhận nuôi của bạn</span>}
            variant="borderless" 
            style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
          >
            <Table 
              columns={columns} 
              dataSource={applications} 
              rowKey="id" 
              loading={loadingApps}
              pagination={applications.length > 5 ? { pageSize: 5 } : false}
              locale={{ emptyText: 'Bạn chưa có hồ sơ đăng ký nhận nuôi nào.' }}
            />
          </Card>
        </Space>
      )}

      {/* 2. NEW ADOPTION APPLICATION STEP WIZARD */}
      {view === 'form' && (
        <Card 
          variant="borderless"
          style={{ borderRadius: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}
          className="overflow-hidden"
        >
          {/* Header of Form wizard */}
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Heart className="text-rose-500 fill-current w-6 h-6 animate-pulse" />
              <span className="text-lg font-black text-rose-500">Đăng ký Nhận nuôi Trực tuyến</span>
            </div>
            <Button 
              type="text" 
              icon={<ArrowLeft size={16} />} 
              onClick={() => setView('portal')}
              className="text-slate-500 hover:text-rose-500 font-bold"
            >
              Hủy bỏ &amp; Quay về
            </Button>
          </div>

          {/* Wizard Progress Line */}
          <div className="mb-10">
            <Steps
              current={currentStep - 1}
              size="small"
              items={[
                { title: 'Thông tin cá nhân', icon: <User size={16} /> },
                { title: 'Khảo sát điều kiện', icon: <Home size={16} /> },
                { title: 'Hồ sơ pháp lý', icon: <FolderOpen size={16} /> },
                { title: 'Cam kết & Gửi', icon: <BadgeCheck size={16} /> }
              ]}
            />
          </div>

          {submitting ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spin size="large" />
              <h3 className="text-lg font-bold text-slate-800 mt-6">Đang mã hóa hồ sơ &amp; Gửi lên hệ thống...</h3>
              <p className="text-slate-400 text-xs mt-2">Vui lòng không tắt hoặc tải lại trang web này.</p>
            </div>
          ) : (
            <div style={{ minHeight: '320px' }}>
              
              {/* STEP 1: Personal Info Prefill & Confirmation */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Bước 1: Xác nhận thông tin cá nhân</h2>
                    <p className="text-xs text-slate-400">Xác thực lý lịch cơ bản của người đứng tên hồ sơ bảo trợ nhận nuôi.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Họ và tên đầy đủ *</label>
                      <Input 
                        placeholder="Nhập đầy đủ họ tên theo CCCD" 
                        value={formState.fullName} 
                        onChange={e => setFormState(p => ({ ...p, fullName: e.target.value }))}
                        size="large"
                        style={{ borderRadius: 8 }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Số căn cước công dân (CCCD) *</label>
                      <Input 
                        placeholder="Nhập 12 số CCCD" 
                        value={formState.idCard} 
                        onChange={e => setFormState(p => ({ ...p, idCard: e.target.value }))}
                        size="large"
                        style={{ borderRadius: 8 }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Số điện thoại liên lạc *</label>
                      <Input 
                        placeholder="Nhập số điện thoại di động" 
                        value={formState.phone} 
                        onChange={e => setFormState(p => ({ ...p, phone: e.target.value }))}
                        size="large"
                        style={{ borderRadius: 8 }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tình trạng hôn nhân *</label>
                      <Select 
                        placeholder="Chọn tình trạng hôn nhân"
                        value={formState.maritalStatus || undefined}
                        onChange={val => setFormState(p => ({ ...p, maritalStatus: val }))}
                        size="large"
                        style={{ width: '100%', borderRadius: 8 }}
                        options={[
                          { value: 'Độc thân', label: 'Độc thân' },
                          { value: 'Đã kết hôn', label: 'Đã kết hôn' },
                          { value: 'Ly hôn', label: 'Ly hôn / Góa' }
                        ]}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Địa chỉ cư trú thường liên hệ *</label>
                      <Input 
                        placeholder="Địa chỉ cụ thể nơi sinh sống" 
                        value={formState.address} 
                        onChange={e => setFormState(p => ({ ...p, address: e.target.value }))}
                        size="large"
                        style={{ borderRadius: 8 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Living conditions and child selection */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Bước 2: Khảo sát điều kiện gia cảnh</h2>
                    <p className="text-xs text-slate-400">Môi trường sống an toàn và tài chính vững vàng giúp trẻ phát triển khỏe mạnh.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    
                    {/* Desired Criteria Input */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tiêu chí trẻ em mong muốn nhận nuôi *</label>
                      <Input.TextArea 
                        placeholder="Vui lòng nhập tiêu chí mong muốn của gia đình (Ví dụ: Giới tính: Nam/Nữ, Độ tuổi: 0-3 tuổi, Tình trạng sức khỏe: Bình thường/Khỏe mạnh...)" 
                        value={formState.desiredCriteria} 
                        onChange={e => setFormState(p => ({ ...p, desiredCriteria: e.target.value }))}
                        size="large"
                        autoSize={{ minRows: 3, maxRows: 5 }}
                        style={{ borderRadius: 8 }}
                      />
                      <Text type="secondary" className="text-[11px] block mt-1">
                        <InfoCircleOutlined /> Ban Giám Đốc sẽ căn cứ vào tiêu chí này để chọn đề xuất bé phù hợp nhất cho gia đình bạn.
                      </Text>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nghề nghiệp chính của người nhận nuôi *</label>
                      <Input 
                        placeholder="Ví dụ: Công chức, Lập trình viên, Kinh doanh..." 
                        value={formState.occupation} 
                        onChange={e => setFormState(p => ({ ...p, occupation: e.target.value }))}
                        size="large"
                        style={{ borderRadius: 8 }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Mức thu nhập bình quân hằng tháng *</label>
                      <Select 
                        placeholder="Chọn phạm vi thu nhập"
                        value={formState.incomeScope || undefined}
                        onChange={val => setFormState(p => ({ ...p, incomeScope: val }))}
                        size="large"
                        style={{ width: '100%', borderRadius: 8 }}
                        options={[
                          { value: 'Dưới 15 triệu VNĐ', label: 'Dưới 15 triệu VNĐ' },
                          { value: 'Từ 15 đến 30 triệu VNĐ', label: 'Từ 15 - 30 triệu VNĐ' },
                          { value: 'Từ 30 đến 50 triệu VNĐ', label: 'Từ 30 - 50 triệu VNĐ' },
                          { value: 'Trên 50 triệu VNĐ', label: 'Trên 50 triệu VNĐ' }
                        ]}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Mô tả điều kiện nhà ở &amp; phòng ngủ cho trẻ *</label>
                      <Input.TextArea 
                        placeholder="Mô tả cơ sở vật chất nơi bé sẽ sinh sống (Ví dụ: Nhà riêng rộng 100m2, có phòng riêng độc lập cho bé, gần trường mầm non...)" 
                        value={formState.homeDesc} 
                        onChange={e => setFormState(p => ({ ...p, homeDesc: e.target.value }))}
                        size="large"
                        autoSize={{ minRows: 3, maxRows: 5 }}
                        style={{ borderRadius: 8 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Upload legal paper requirements */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Bước 3: Tải lên tài liệu chứng thực pháp lý</h2>
                    <p className="text-xs text-slate-400">Cần cung cấp bản scan/ảnh chụp các giấy tờ quan trọng để đối chiếu hồ sơ tư pháp.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Doc 1 */}
                    <div className="flex flex-wrap items-center justify-between p-5 border border-slate-200 rounded-2xl bg-slate-50/50 gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          formState.doc1Uploaded ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                        }`}>
                          <User size={24} />
                        </div>
                        <div>
                          <Text strong className="text-sm block">1. Bản sao Căn cước công dân (CCCD) *</Text>
                          <Text type="secondary" className="text-xs">Ảnh scan rõ nét mặt trước và mặt sau.</Text>
                        </div>
                      </div>
                      <Button 
                        type={formState.doc1Uploaded ? 'primary' : 'default'}
                        onClick={() => handleFileUpload('doc1Uploaded')}
                        icon={formState.doc1Uploaded ? <Check size={14} /> : <Upload size={14} />}
                        style={{ 
                          borderRadius: 99, 
                          fontWeight: 600,
                          backgroundColor: formState.doc1Uploaded ? '#10b981' : undefined,
                          borderColor: formState.doc1Uploaded ? '#10b981' : undefined
                        }}
                      >
                        {formState.doc1Uploaded ? 'Đã tải lên' : 'Chọn tệp tải lên'}
                      </Button>
                    </div>

                    {/* Doc 2 */}
                    <div className="flex flex-wrap items-center justify-between p-5 border border-slate-200 rounded-2xl bg-slate-50/50 gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          formState.doc2Uploaded ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                        }`}>
                          <FileText size={24} />
                        </div>
                        <div>
                          <Text strong className="text-sm block">2. Giấy tờ chứng minh tài chính *</Text>
                          <Text type="secondary" className="text-xs">Hợp đồng lao động, sao kê bảng lương hoặc số tiết kiệm.</Text>
                        </div>
                      </div>
                      <Button 
                        type={formState.doc2Uploaded ? 'primary' : 'default'}
                        onClick={() => handleFileUpload('doc2Uploaded')}
                        icon={formState.doc2Uploaded ? <Check size={14} /> : <Upload size={14} />}
                        style={{ 
                          borderRadius: 99, 
                          fontWeight: 600,
                          backgroundColor: formState.doc2Uploaded ? '#10b981' : undefined,
                          borderColor: formState.doc2Uploaded ? '#10b981' : undefined
                        }}
                      >
                        {formState.doc2Uploaded ? 'Đã tải lên' : 'Chọn tệp tải lên'}
                      </Button>
                    </div>

                    {/* Doc 3 */}
                    <div className="flex flex-wrap items-center justify-between p-5 border border-slate-200 rounded-2xl bg-slate-50/50 gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          formState.doc3Uploaded ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                        }`}>
                          <FolderOpen size={24} />
                        </div>
                        <div>
                          <Text strong className="text-sm block">3. Phiếu lý lịch tư pháp số 1 *</Text>
                          <Text type="secondary" className="text-xs">Cấp trong vòng 6 tháng gần nhất để xác nhận lý lịch tư pháp.</Text>
                        </div>
                      </div>
                      <Button 
                        type={formState.doc3Uploaded ? 'primary' : 'default'}
                        onClick={() => handleFileUpload('doc3Uploaded')}
                        icon={formState.doc3Uploaded ? <Check size={14} /> : <Upload size={14} />}
                        style={{ 
                          borderRadius: 99, 
                          fontWeight: 600,
                          backgroundColor: formState.doc3Uploaded ? '#10b981' : undefined,
                          borderColor: formState.doc3Uploaded ? '#10b981' : undefined
                        }}
                      >
                        {formState.doc3Uploaded ? 'Đã tải lên' : 'Chọn tệp tải lên'}
                      </Button>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 4: Reason and final legal consent confirmation */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center max-w-lg mx-auto py-4 space-y-4">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 border border-rose-100 shadow-xs">
                      <ShieldAlert size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Cam kết trách nhiệm người giám hộ</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Vui lòng chia sẻ nguyện vọng cụ thể và ký tên xác nhận cam kết đảm bảo các điều kiện phát triển an toàn, giáo dục toàn diện nhất cho em nhỏ.
                    </p>
                  </div>

                  <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Lý do &amp; Nguyện vọng nhận nuôi *</label>
                      <Input.TextArea 
                        placeholder="Hãy chia sẻ lý do gia đình bạn muốn đón em bé về chăm sóc..." 
                        value={formState.reason} 
                        onChange={e => setFormState(p => ({ ...p, reason: e.target.value }))}
                        size="large"
                        autoSize={{ minRows: 4, maxRows: 6 }}
                        style={{ borderRadius: 8 }}
                      />
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formState.agreed} 
                        onChange={e => setFormState(p => ({ ...p, agreed: e.target.checked }))}
                        className="mt-1 w-4 h-4 text-rose-500 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed font-medium">
                        Tôi xin hoàn toàn chịu trách nhiệm trước pháp luật về tính chân thực của thông tin khai báo. Tôi đồng ý để trung tâm Hope Center tiến hành khảo sát và theo dõi môi trường sống của bé định kỳ sau khi nhận nuôi.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Wizard Footer controls */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                <Button 
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  icon={<ArrowLeft size={14} />}
                  style={{ borderRadius: 8, height: '40px', fontWeight: 600 }}
                >
                  Quay lại
                </Button>

                {currentStep < 4 ? (
                  <Button 
                    type="primary" 
                    onClick={handleNextStep}
                    style={{ 
                      borderRadius: 8, 
                      height: '40px', 
                      fontWeight: 600,
                      backgroundColor: '#f43f5e',
                      borderColor: '#f43f5e'
                    }}
                  >
                    Tiếp tục <ArrowRight size={14} style={{ marginLeft: 4 }} />
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    onClick={handleSubmitApplication}
                    style={{ 
                      borderRadius: 8, 
                      height: '40px', 
                      fontWeight: 600,
                      backgroundColor: '#10b981',
                      borderColor: '#10b981'
                    }}
                  >
                    Gửi hồ sơ đăng ký <Send size={14} style={{ marginLeft: 4 }} />
                  </Button>
                )}
              </div>

            </div>
          )}
        </Card>
      )}

      {/* 3. PROFILE MANAGEMENT VIEW */}
      {view === 'profile' && (
        <Card 
          title={<span className="font-bold text-slate-800 flex items-center gap-2"><User size={18} className="text-rose-500" /> Cập nhật hồ sơ cá nhân</span>}
          variant="borderless"
          style={{ borderRadius: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}
        >
          {currentUser && (
            <Form 
              layout="vertical" 
              initialValues={{
                fullName: currentUser.fullName,
                idCard: currentUser.idCard,
                financialStatus: currentUser.financialStatus,
                maritalStatus: currentUser.maritalStatus,
                address: currentUser.address
              }}
              onFinish={handleUpdateProfile}
              size="large"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item 
                  name="fullName" 
                  label={<Text strong>Họ và Tên đầy đủ</Text>}
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên đầy đủ!' }]}
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item 
                  name="idCard" 
                  label={<Text strong>Số CCCD</Text>}
                  rules={[{ required: true, message: 'Vui lòng nhập số căn cước công dân!' }]}
                >
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item 
                  name="maritalStatus" 
                  label={<Text strong>Tình trạng hôn nhân</Text>}
                >
                  <Select style={{ borderRadius: 8 }} options={[
                    { value: 'Độc thân', label: 'Độc thân' },
                    { value: 'Đã kết hôn', label: 'Đã kết hôn' },
                    { value: 'Ly hôn', label: 'Ly hôn / Góa' }
                  ]} />
                </Form.Item>

                <Form.Item 
                  name="financialStatus" 
                  label={<Text strong>Tình trạng tài chính / Nghề nghiệp</Text>}
                >
                  <Input style={{ borderRadius: 8 }} placeholder="Ví dụ: Thu nhập ổn định (Mức khá)" />
                </Form.Item>

                <Form.Item 
                  name="address" 
                  label={<Text strong>Địa chỉ thường trú</Text>}
                  className="md:col-span-2"
                >
                  <Input.TextArea style={{ borderRadius: 8 }} autoSize={{ minRows: 2, maxRows: 4 }} />
                </Form.Item>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              <div className="flex justify-end gap-3">
                <Button 
                  onClick={() => setView('portal')}
                  style={{ borderRadius: 8, height: '40px', fontWeight: 600 }}
                >
                  Hủy bỏ
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={submitting}
                  style={{ 
                    borderRadius: 8, 
                    height: '40px', 
                    fontWeight: 600,
                    backgroundColor: '#f43f5e',
                    borderColor: '#f43f5e'
                  }}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </Form>
          )}
        </Card>
      )}

      {/* 4. DETAIL TIMELINE MODAL */}
      <Modal
        title={
          <span className="font-extrabold text-base text-slate-800">
            Chi tiết hồ sơ nhận nuôi: #{selectedApp?.id?.substring(0, 8).toUpperCase()}
          </span>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalVisible(false)} style={{ borderRadius: 8, backgroundColor: '#f43f5e', borderColor: '#f43f5e' }}>
            Đóng cửa sổ
          </Button>
        ]}
        width={750}
        style={{ borderRadius: 20 }}
      >
        {selectedApp && (
          <div className="py-4 space-y-6">
            
            {/* Timeline Progress indicator */}
            <div>
              <Text strong className="text-xs uppercase tracking-wider text-slate-400 block mb-4">Tiến độ phê duyệt hồ sơ</Text>
              
              {(() => {
                const getModalStepIndexAndStatus = (status: any) => {
                  if (status === undefined || status === null) return { current: 0, stepStatus: 'process' };
                  const statusVal = typeof status === 'string' ? status : status.toString();
                  switch (statusVal) {
                    case '0':
                    case 'Pending':
                      return { current: 0, stepStatus: 'process' };
                    case '3':
                    case 'AwaitingMatching':
                      return { current: 1, stepStatus: 'process' };
                    case '6':
                    case 'MatchingProposed':
                      return { current: 2, stepStatus: 'process' };
                    case '7':
                    case 'AdopterAccepted':
                      return { current: 2, stepStatus: 'finish' };
                    case '8':
                    case 'AdopterRejected':
                      return { current: 2, stepStatus: 'error' };
                    case '2':
                    case 'Rejected':
                      return { current: 0, stepStatus: 'error' };
                    case '1':
                    case 'Approved':
                      return { current: 3, stepStatus: 'process' };
                    case '4':
                    case 'Completed':
                      return { current: 4, stepStatus: 'finish' };
                    default:
                      return { current: 0, stepStatus: 'process' };
                  }
                };
                const { current: stepCurrent, stepStatus } = getModalStepIndexAndStatus(selectedApp.status);
                return (
                  <Steps
                    size="small"
                    current={stepCurrent}
                    status={stepStatus as any}
                    items={[
                      { title: 'Nộp đơn', description: formatDate(selectedApp.submitDate) },
                      { title: 'Xác minh gia cảnh' },
                      { title: 'Đề xuất & Phản hồi' },
                      { title: 'Phê duyệt quyết định' },
                      { title: 'Bàn giao & Hoàn thành' }
                    ]}
                  />
                );
              })()}
            </div>

            {/* Application Detail Details Card */}
            <Card style={{ background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9' }} className="shadow-xs">
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                <div>
                  <Text type="secondary" className="text-xs">Trạng thái hồ sơ:</Text>
                  <div className="mt-1">{getStatusTag(selectedApp.status)}</div>
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <div>
                  <Text type="secondary" className="text-xs">Tiêu chí trẻ em mong muốn:</Text>
                  <p className="text-sm font-bold text-slate-800 mt-1">{selectedApp.desiredCriteria || 'Chưa cung cấp'}</p>
                </div>
                
                <Divider style={{ margin: '8px 0' }} />
                
                <div>
                  <Text type="secondary" className="text-xs">Nguyện vọng gia đình:</Text>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{selectedApp.reason || 'N/A'}</p>
                </div>

                {selectedApp.notes && (
                  <>
                    <Divider style={{ margin: '8px 0' }} />
                    <div>
                      <Text type="secondary" className="text-xs">Chi tiết gia cảnh &amp; Môi trường:</Text>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{selectedApp.notes}</p>
                    </div>
                  </>
                )}

                {selectedApp.childId && (
                  <>
                    <Divider style={{ margin: '8px 0' }} />
                    <div className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                      <Image 
                        src={selectedApp.childAvatarUrl ? (selectedApp.childAvatarUrl.startsWith('http') ? selectedApp.childAvatarUrl : `${apiClient.defaults.baseURL || 'http://localhost:5176'}${selectedApp.childAvatarUrl}`) : 'https://images.unsplash.com/photo-1595250912759-99446d5c6be2?q=80&w=100&auto=format&fit=crop'}
                        alt={selectedApp.childName}
                        width={60}
                        height={60}
                        style={{ borderRadius: 8, objectFit: 'cover' }}
                      />
                      <div>
                        <Text strong className="text-xs text-rose-700 block">Bé được đề xuất:</Text>
                        <Text strong className="text-sm text-slate-800">{selectedApp.childName}</Text>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Giới tính: {selectedApp.childGender === 0 || selectedApp.childGender === 'Male' ? 'Nam' : 'Nữ'} | Sức khỏe: {selectedApp.childHealthStatus || 'Khỏe mạnh'}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedApp.status === 2 || selectedApp.status === 'Rejected' ? (
                  <>
                    <Divider style={{ margin: '8px 0' }} />
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                      <Text strong className="text-red-700 text-xs block"><ShieldAlert size={14} className="inline mr-1" /> Lý do từ chối hồ sơ:</Text>
                      <p className="text-xs mt-1">{selectedApp.rejectionReason || 'Không đáp ứng đủ một số tiêu chí điều kiện chăm sóc đặc thù.'}</p>
                    </div>
                  </>
                ) : null}
              </Space>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdoptionPortal;