import React, { useState } from 'react';
import { Typography, Row, Col, Form, Input, Select, Tabs, Button, Alert, message, Space } from 'antd';
import { 
  BankOutlined, 
  InfoCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const DonationPage: React.FC = () => {
  const [moneyForm] = Form.useForm();
  const [itemsForm] = Form.useForm();
  const [selectedAmount, setSelectedAmount] = useState<number | 'other'>(200000);

  const presetAmounts: { value: number | 'other', label: string }[] = [
    { value: 200000, label: '200,000' },
    { value: 500000, label: '500,000' },
    { value: 1000000, label: '1,000,000' },
    { value: 2000000, label: '2,000,000' },
    { value: 5000000, label: '5,000,000' },
    { value: 'other', label: 'Khác...' },
  ];

  const handleMoneySubmit = (values: any) => {
    message.loading({ content: 'Hệ thống đang chuyển hướng sang Cổng thanh toán VNPay...', key: 'donate' });
    setTimeout(() => {
      message.success({ content: 'Chuyển hướng thành công!', key: 'donate', duration: 2 });
    }, 2000);
  };

  const handleItemsSubmit = (values: any) => {
    message.success({ content: 'Đã ghi nhận thông tin gửi hiện vật. Bộ phận Quản lý Vật tư sẽ liên hệ với bạn trong 24h tới. Xin cảm ơn!', duration: 4 });
    itemsForm.resetFields();
  };

  const moneyTabContent = (
    <Form form={moneyForm} layout="vertical" onFinish={handleMoneySubmit} style={{ marginTop: '20px' }}>
      <Form.Item label={<Text strong>Chọn mức đóng góp (VNĐ)</Text>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
          {presetAmounts.map((preset) => (
            <div 
              key={preset.value}
              onClick={() => setSelectedAmount(preset.value)}
              style={{
                padding: '12px',
                border: `1px solid ${selectedAmount === preset.value ? '#0ea5e9' : '#e2e8f0'}`,
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                fontWeight: 700,
                background: selectedAmount === preset.value ? 'rgba(14, 165, 233, 0.05)' : '#fff',
                color: selectedAmount === preset.value ? '#0ea5e9' : '#0f172a',
                transition: 'all 0.2s'
              }}
            >
              {preset.label}
            </div>
          ))}
        </div>
        {selectedAmount === 'other' && (
          <Input size="large" placeholder="Nhập số tiền bạn muốn đóng góp..." style={{ borderRadius: '8px' }} />
        )}
      </Form.Item>

      <Form.Item name="fullName" label={<Text strong>Họ và Tên (Hoặc tên Doanh nghiệp)</Text>} rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
        <Input size="large" placeholder="Ví dụ: Nguyễn Văn A" style={{ borderRadius: '8px' }} />
      </Form.Item>

      <Form.Item name="contact" label={<Text strong>Số điện thoại / Email</Text>} rules={[{ required: true, message: 'Vui lòng nhập liên hệ!' }]}>
        <Input size="large" placeholder="Để trung tâm gửi thư tri ân" style={{ borderRadius: '8px' }} />
      </Form.Item>

      <Form.Item name="message" label={<Text strong>Lời nhắn gửi tới các bé (Không bắt buộc)</Text>}>
        <TextArea rows={3} placeholder="Chúc các con luôn vui vẻ và khỏe mạnh..." style={{ borderRadius: '8px' }} />
      </Form.Item>

      <Button type="primary" htmlType="submit" size="large" block style={{ background: '#0ea5e9', height: '50px', borderRadius: '8px', fontSize: '18px', fontWeight: 700 }}>
        Quyên Góp Trực Tuyến Ngay
      </Button>
    </Form>
  );

  const itemsTabContent = (
    <Form form={itemsForm} layout="vertical" onFinish={handleItemsSubmit} style={{ marginTop: '20px' }}>
      <Alert
        message={<span style={{ color: '#d97706', fontWeight: 600, fontSize: '16px' }}><ExclamationCircleOutlined /> Vật tư trung tâm đang thiếu tuần này:</span>}
        description={
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e', marginTop: '8px' }}>
            <li>Bỉm (Tã) dán size M, L (cho trẻ sơ sinh)</li>
            <li>Sữa bột công thức cho bé 0-6 tháng tuổi</li>
            <li>Khăn giấy ướt, nước giặt xả cho trẻ em</li>
            <li>Gạo tẻ, gia vị sinh hoạt</li>
          </ul>
        }
        type="warning"
        style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', marginBottom: '24px' }}
      />

      <Form.Item name="senderName" label={<Text strong>Họ và Tên người gửi</Text>} rules={[{ required: true }]}>
        <Input size="large" placeholder="Ví dụ: Hội Thiện Nguyện ABC" style={{ borderRadius: '8px' }} />
      </Form.Item>

      <Form.Item name="category" label={<Text strong>Danh mục hàng hóa tài trợ</Text>} rules={[{ required: true }]}>
        <Select size="large" placeholder="Chọn danh mục">
          <Select.Option value="Thực phẩm">Thực phẩm (Sữa, Gạo, Đồ khô...)</Select.Option>
          <Select.Option value="Sinh hoạt">Đồ dùng sinh hoạt (Bỉm, Quần áo...)</Select.Option>
          <Select.Option value="Học tập">Đồ dùng học tập (Sách vở, Bút...)</Select.Option>
          <Select.Option value="Y tế">Vật tư Y tế cơ bản</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="details" label={<Text strong>Chi tiết số lượng và loại hàng</Text>} rules={[{ required: true }]}>
        <TextArea rows={3} placeholder="Ví dụ: 10 thùng sữa Vinamilk, 5 bịch bỉm Bobby size L..." style={{ borderRadius: '8px' }} />
      </Form.Item>

      <Form.Item name="delivery" label={<Text strong>Hình thức gửi hàng</Text>} rules={[{ required: true }]}>
        <Select size="large" placeholder="Chọn hình thức gửi">
          <Select.Option value="Tự mang đến">Tôi sẽ tự mang đến tận Trung tâm</Select.Option>
          <Select.Option value="Bưu điện">Gửi qua bưu điện / Đơn vị vận chuyển</Select.Option>
          <Select.Option value="Trung tâm đến lấy">Trung tâm cử xe đến lấy (Chỉ áp dụng số lượng lớn)</Select.Option>
        </Select>
      </Form.Item>

      <Button type="primary" htmlType="submit" size="large" block style={{ background: '#0ea5e9', height: '50px', borderRadius: '8px', fontSize: '18px', fontWeight: 700 }}>
        Đăng ký Gửi Hiện Vật
      </Button>
    </Form>
  );

  return (
    <div style={{ background: '#f8fafc', padding: '60px 10%', minHeight: 'calc(100vh - 80px)' }}>
      <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap' }}>
        
        {/* ================= LEFT PANEL (INFO) ================= */}
        <div style={{ flex: '1 1 400px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', padding: '50px', color: 'white' }}>
          <Title level={2} style={{ color: 'white', marginBottom: '20px', fontSize: '32px' }}>Đóng góp của bạn tạo nên sự thay đổi</Title>
          <Paragraph style={{ color: 'white', opacity: 0.9, fontSize: '16px', lineHeight: 1.8, marginBottom: '40px' }}>
            Mọi khoản đóng góp dù lớn hay nhỏ đều được chúng tôi trân trọng, cập nhật minh bạch lên hệ thống và sử dụng đúng mục đích chăm lo cho các em.
          </Paragraph>

          <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: '40px' }}>
            {[
              { step: '1', title: 'Chọn hình thức tài trợ', desc: 'Tiền mặt (tài trợ quỹ y tế/sinh hoạt) hoặc tài trợ hiện vật (sữa, bỉm, gạo, sách vở...)' },
              { step: '2', title: 'Điền thông tin', desc: 'Thông tin sẽ được ghi nhận vào hệ thống quản lý để xuất Giấy chứng nhận Tri ân.' },
              { step: '3', title: 'Theo dõi tiến độ', desc: 'Quản lý toàn bộ lịch sử tài trợ và xem báo cáo tài chính ngay trên tài khoản của bạn.' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                  {item.step}
                </div>
                <div>
                  <Title level={5} style={{ color: 'white', margin: '0 0 4px 0' }}>{item.title}</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{item.desc}</Text>
                </div>
              </div>
            ))}
          </Space>

          <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '24px' }}>
            <Title level={4} style={{ color: 'white', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '12px' }}>
              <BankOutlined style={{ marginRight: '8px' }} /> Chuyển khoản trực tiếp
            </Title>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Ngân hàng:</Text> <Text strong style={{ color: 'white' }}>Vietcombank - CN Đà Nẵng</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Tên tài khoản:</Text> <Text strong style={{ color: 'white' }}>QUY BAO TRO HOPE CENTER</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Số tài khoản:</Text> <Text strong style={{ color: 'white', fontFamily: 'monospace', fontSize: '16px' }}>1023 4567 8900</Text>
            </div>
            <Text style={{ fontSize: '13px', color: '#bae6fd', display: 'block' }}>
              <InfoCircleOutlined /> Vui lòng ghi rõ cú pháp: [Tên của bạn] - [Số Điện Thoại] - Dong gop tre em
            </Text>
          </div>
        </div>

        {/* ================= RIGHT PANEL (FORMS) ================= */}
        <div style={{ flex: '1.3 1 500px', padding: '50px' }}>
          <Tabs 
            defaultActiveKey="1" 
            items={[
              { key: '1', label: <span style={{ fontSize: '16px', fontWeight: 600 }}>Tài trợ Tài chính</span>, children: moneyTabContent },
              { key: '2', label: <span style={{ fontSize: '16px', fontWeight: 600 }}>Tài trợ Hiện vật</span>, children: itemsTabContent },
            ]} 
          />
        </div>
      </div>
    </div>
  );
};

export default DonationPage;