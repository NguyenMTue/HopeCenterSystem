import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Typography, Modal, Form, Select, message, Popconfirm, Card, Tag, Input, Tabs, InputNumber } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, MedicineBoxOutlined, SwapOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const initialMedicines = [
  { id: '1', name: 'Paracetamol 250mg', category: 'Giảm đau, hạ sốt', unit: 'Hộp', quantity: 15, minStock: 5 },
  { id: '2', name: 'Amoxicillin 500mg', category: 'Kháng sinh', unit: 'Vỉ', quantity: 20, minStock: 10 },
  { id: '3', name: 'Vitamin C Siro', category: 'Bổ sung đề kháng', unit: 'Chai', quantity: 4, minStock: 5 }, // Cảnh báo sắp hết
  { id: '4', name: 'Oresol gói', category: 'Bù nước', unit: 'Gói', quantity: 50, minStock: 20 },
  { id: '5', name: 'Betadine dung dịch', category: 'Sát trùng', unit: 'Chai', quantity: 2, minStock: 3 }, // Cảnh báo sắp hết
];

const initialTransactions = [
  { id: 't1', medicineName: 'Paracetamol 250mg', type: 'Nhập', quantity: 10, date: dayjs().subtract(1, 'day').toISOString(), operator: 'Nguyễn Thị Hoa', note: 'Nhập mua từ hiệu thuốc đối tác' },
  { id: 't2', medicineName: 'Amoxicillin 500mg', type: 'Xuất', quantity: 2, date: dayjs().subtract(3, 'hour').toISOString(), operator: 'Nguyễn Thị Hoa', note: 'Cấp phát điều trị cho bé A phòng Hoa Hồng' },
];

const MedicineCabinetManagement: React.FC = () => {
  const [medicines, setMedicines] = useState<any[]>(initialMedicines);
  const [transactions, setTransactions] = useState<any[]>(initialTransactions);
  const [searchText, setSearchText] = useState('');
  
  // Modals state
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any>(null);

  const [medicineForm] = Form.useForm();
  const [txForm] = Form.useForm();

  // BỘ LỌC TÌM KIẾM
  const filteredMedicines = useMemo(() => {
    return medicines.filter(item => 
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [medicines, searchText]);

  // THÊM / SỬA THUỐC
  const handleOpenMedicineModal = (record?: any) => {
    if (record) {
      setEditingMedicine(record);
      medicineForm.setFieldsValue(record);
    } else {
      setEditingMedicine(null);
      medicineForm.resetFields();
    }
    setIsMedicineModalOpen(true);
  };

  const handleSaveMedicine = async () => {
    try {
      const values = await medicineForm.validateFields();
      if (editingMedicine) {
        setMedicines(medicines.map(m => m.id === editingMedicine.id ? { ...m, ...values } : m));
        message.success('Cập nhật thông tin thuốc thành công');
      } else {
        const newMed = {
          id: Date.now().toString(),
          ...values,
          quantity: values.quantity || 0,
        };
        setMedicines([...medicines, newMed]);
        message.success('Thêm thuốc mới thành công');
      }
      setIsMedicineModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  // NHẬP XUẤT KHO THUỐC
  const handleOpenTxModal = () => {
    txForm.resetFields();
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = async () => {
    try {
      const values = await txForm.validateFields();
      const med = medicines.find(m => m.id === values.medicineId);
      if (!med) return;

      const newQty = values.type === 'Nhập' 
        ? med.quantity + values.quantity 
        : med.quantity - values.quantity;

      if (newQty < 0) {
        message.error(`Không thể xuất! Tồn kho hiện tại của ${med.name} chỉ còn ${med.quantity} ${med.unit}`);
        return;
      }

      // Cập nhật tồn kho
      setMedicines(medicines.map(m => m.id === med.id ? { ...m, quantity: newQty } : m));

      // Thêm log lịch sử giao dịch
      const newTx = {
        id: Date.now().toString(),
        medicineName: med.name,
        type: values.type,
        quantity: values.quantity,
        date: dayjs().toISOString(),
        operator: 'Nguyễn Thị Hoa',
        note: values.note || '',
      };
      setTransactions([newTx, ...transactions]);

      message.success(`${values.type} kho thuốc thành công`);
      setIsTxModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteMedicine = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
    message.success('Đã xóa thông tin thuốc khỏi tủ');
  };

  const medicineColumns = [
    {
      title: 'Tên Thuốc / Vật tư y tế',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => {
        const isLowStock = record.quantity <= record.minStock;
        return (
          <Space direction="vertical" size={0}>
            <Text strong>{name}</Text>
            {isLowStock && <Tag color="error">Cảnh báo: Sắp hết hàng</Tag>}
          </Space>
        );
      }
    },
    {
      title: 'Nhóm thuốc',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => <Tag color="geekblue">{cat}</Tag>,
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Số lượng tồn',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty: number, record: any) => (
        <span style={{ color: qty <= record.minStock ? '#f43f5e' : '#10b981', fontWeight: 'bold' }}>
          {qty}
        </span>
      ),
      sorter: (a: any, b: any) => a.quantity - b.quantity,
    },
    {
      title: 'Mức tối thiểu',
      dataIndex: 'minStock',
      key: 'minStock',
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleOpenMedicineModal(record)} />
          <Popconfirm
            title="Xóa thuốc này khỏi tủ thuốc y tế?"
            onConfirm={() => handleDeleteMedicine(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger ghost icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: 'Tên Thuốc',
      dataIndex: 'medicineName',
      key: 'medicineName',
    },
    {
      title: 'Loại Giao Dịch',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'Nhập' ? 'green' : 'red'}>
          {type === 'Nhập' ? 'NHẬP KHO' : 'XUẤT KHO'}
        </Tag>
      ),
    },
    {
      title: 'Số Lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty: number) => <strong>{qty}</strong>,
    },
    {
      title: 'Thời Gian',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Người Thực Hiện',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: 'Lý do / Note',
      dataIndex: 'note',
      key: 'note',
    },
  ];

  return (
    <div className="p-1">
      <Card
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: '#10b981', fontSize: '20px' }} />
            <Title level={4} style={{ margin: 0 }}>Quản lý Tủ thuốc & Vật tư Y tế</Title>
          </Space>
        }
        extra={
          <Space>
            <Button 
              type="default" 
              icon={<SwapOutlined />} 
              onClick={handleOpenTxModal}
              style={{ borderRadius: 6 }}
            >
              Nhập / Xuất Thuốc
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => handleOpenMedicineModal()}
              style={{ borderRadius: 6, backgroundColor: '#10b981', borderColor: '#10b981' }}
            >
              Thêm Thuốc Mới
            </Button>
          </Space>
        }
        style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Danh mục tủ thuốc & Tồn kho" key="1">
            <div style={{ marginBottom: 16 }}>
              <Input
                placeholder="Tìm kiếm theo tên thuốc, nhóm thuốc..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 400, borderRadius: 6 }}
                allowClear
              />
            </div>
            <Table columns={medicineColumns} dataSource={filteredMedicines} rowKey="id" pagination={{ pageSize: 8 }} />
          </TabPane>

          <TabPane tab="Lịch sử Nhập / Xuất thuốc" key="2">
            <Table columns={transactionColumns} dataSource={transactions} rowKey="id" pagination={{ pageSize: 8 }} />
          </TabPane>
        </Tabs>
      </Card>

      {/* MODAL THÊM / SỬA THUỐC */}
      <Modal
        title={editingMedicine ? 'Sửa Thông Tin Thuốc' : 'Thêm Thuốc Vào Tủ'}
        open={isMedicineModalOpen}
        onOk={handleSaveMedicine}
        onCancel={() => setIsMedicineModalOpen(false)}
        okText={editingMedicine ? 'Cập nhật' : 'Thêm vào'}
        cancelText="Hủy"
        width={550}
      >
        <Form form={medicineForm} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="name"
            label="Tên Thuốc / Vật tư"
            rules={[{ required: true, message: 'Nhập tên thuốc!' }]}
          >
            <Input placeholder="Ví dụ: Paracetamol 250mg, Bông y tế..." />
          </Form.Item>

          <Form.Item
            name="category"
            label="Nhóm điều trị"
            rules={[{ required: true, message: 'Nhập nhóm điều trị!' }]}
          >
            <Input placeholder="Ví dụ: Hạ sốt, Kháng sinh, Sát trùng..." />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Đơn vị tính"
            rules={[{ required: true, message: 'Nhập đơn vị tính!' }]}
          >
            <Input placeholder="Ví dụ: Hộp, Vỉ, Chai, Gói..." />
          </Form.Item>

          <Form.Item
            name="minStock"
            label="Mức Cảnh Báo Tồn Tối Thiểu"
            rules={[{ required: true, message: 'Nhập mức tối thiểu!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Số lượng tối thiểu cần có để cảnh báo" />
          </Form.Item>

          {!editingMedicine && (
            <Form.Item
              name="quantity"
              label="Số Lượng Ban Đầu"
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập số lượng ban đầu (nếu có)" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* MODAL NHẬP XUẤT THUỐC */}
      <Modal
        title="Phiếu Ghi Nhận Nhập / Xuất Kho Thuốc"
        open={isTxModalOpen}
        onOk={handleSaveTransaction}
        onCancel={() => setIsTxModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        width={550}
      >
        <Form form={txForm} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="medicineId"
            label="Chọn Thuốc"
            rules={[{ required: true, message: 'Vui lòng chọn thuốc!' }]}
          >
            <Select placeholder="Chọn thuốc cần xuất/nhập">
              {medicines.map(m => (
                <Option key={m.id} value={m.id}>{m.name} (Hiện có: {m.quantity} {m.unit})</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại Giao Dịch"
            rules={[{ required: true }]}
            initialValue="Xuất"
          >
            <Select>
              <Option value="Nhập">Nhập thuốc (Bổ sung kho)</Option>
              <Option value="Xuất">Xuất thuốc (Điều trị cho trẻ)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số Lượng Thực Hiện"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập số lượng nhập hoặc xuất" />
          </Form.Item>

          <Form.Item
            name="note"
            label="Lý Do / Ghi Chú"
            rules={[{ required: true, message: 'Vui lòng nhập lý do xuất/nhập!' }]}
          >
            <Input placeholder="Ví dụ: Xuất cấp phát cho bé A phòng Hướng Dương, Nhập bổ sung định kỳ..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicineCabinetManagement;
