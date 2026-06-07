import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag, Input, Space, Card, Typography, Select, message } from 'antd';
import { SearchOutlined, SafetyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiClient from '../../services/apiClient';

const { Title, Text } = Typography;
const { Option } = Select;

export interface SystemLogDto {
  id: string;
  accountId: string;
  action: string;
  details: string;
  timestamp: string;
  module: string;
  ipAddress: string;
}

const SystemLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<SystemLogDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [users, setUsers] = useState<any[]>([]);

  // Fetch system logs from backend (details will be auto-masked on the backend)
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/SystemLogs');
      setLogs(response.data.lists || []);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải nhật ký hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users list to map accountId to Username for readability
  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/api/Admin/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Không thể lấy danh sách người dùng để map tên:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLogs();
    
    // Auto-refresh logs every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Map AccountId to Username or FullName
  const getUserDisplayName = (accountId: string) => {
    const user = users.find(u => u.id === accountId);
    if (user) {
      return `${user.fullName} (${user.userName})`;
    }
    return accountId.substring(0, 8) + '...';
  };

  // Extract unique modules for filtering
  const modules = useMemo(() => {
    const list = new Set(logs.map(log => log.module).filter(Boolean));
    return ['All', ...Array.from(list)] as string[];
  }, [logs]);

  // Filter logs based on search and selected module
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesModule = selectedModule === 'All' || log.module === selectedModule;
      
      const userDisplayName = getUserDisplayName(log.accountId).toLowerCase();
      const matchesSearch = 
        log.details?.toLowerCase().includes(searchText.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchText.toLowerCase()) ||
        log.ipAddress?.toLowerCase().includes(searchText.toLowerCase()) ||
        log.module?.toLowerCase().includes(searchText.toLowerCase()) ||
        userDisplayName.includes(searchText.toLowerCase());

      return matchesModule && matchesSearch;
    });
  }, [logs, searchText, selectedModule, users]);

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 170,
      render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm:ss'),
      sorter: (a: SystemLogDto, b: SystemLogDto) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'accountId',
      key: 'user',
      width: 200,
      render: (accountId: string) => <Text strong>{getUserDisplayName(accountId)}</Text>,
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 130,
      render: (action: string) => {
        let color = 'default';
        if (action?.toLowerCase().includes('delete') || action?.toLowerCase().includes('remove')) color = 'volcano';
        else if (action?.toLowerCase().includes('create') || action?.toLowerCase().includes('add')) color = 'green';
        else if (action?.toLowerCase().includes('update') || action?.toLowerCase().includes('edit')) color = 'blue';
        else if (action?.toLowerCase().includes('login')) color = 'cyan';
        return <Tag color={color}>{action?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Phân hệ',
      dataIndex: 'module',
      key: 'module',
      width: 130,
      render: (module: string) => (
        <Tag color="geekblue" style={{ borderRadius: '4px' }}>
          {module || 'SYSTEM'}
        </Tag>
      )
    },
    {
      title: 'Chi tiết hành động (Đã mã hóa/che thông tin nhạy cảm)',
      dataIndex: 'details',
      key: 'details',
      render: (details: string) => (
        <Text style={{ fontFamily: 'SFMono-Regular, Consolas, Courier, monospace', fontSize: '13px' }}>
          {details}
        </Text>
      )
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 120,
      render: (ip: string) => <Tag color="gray">{ip || '127.0.0.1'}</Tag>
    }
  ];

  return (
    <Card 
      title={
        <Space>
          <SafetyOutlined style={{ color: '#10b981', fontSize: '20px' }} />
          <Title level={4} style={{ margin: 0 }}>Nhật ký hệ thống (System Logs Viewer)</Title>
        </Space>
      }
      extra={
        <Text type="secondary">
          <InfoCircleOutlined /> Dữ liệu trẻ em và gia đình nhận nuôi đã được ẩn danh tự động ở Backend
        </Text>
      }
      style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
    >
      <Space size="middle" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Input
          placeholder="Tìm kiếm hành động, chi tiết, IP, người thực hiện..."
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 350, borderRadius: '8px' }}
          allowClear
        />
        
        <Space>
          <Text>Lọc theo Phân hệ:</Text>
          <Select
            defaultValue="All"
            style={{ width: 180 }}
            onChange={value => setSelectedModule(value)}
          >
            {modules.map(mod => (
              <Option key={mod} value={mod}>{mod}</Option>
            ))}
          </Select>
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredLogs}
        rowKey="id"
        bordered
        loading={loading}
        pagination={{ pageSize: 8 }}
        style={{ borderRadius: '8px', overflow: 'hidden' }}
      />
    </Card>
  );
};

export default SystemLogsTable;
