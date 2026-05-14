import React from 'react';

const Dashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Tổng số trẻ', value: '124', change: '+2', color: 'bg-blue-500' },
        { label: 'Số nhân viên', value: '42', change: '0', color: 'bg-green-500' },
        { label: 'Đơn nhận nuôi mới', value: '12', change: '+5', color: 'bg-purple-500' },
        { label: 'Số dư quỹ', value: '450M', change: '+12M', color: 'bg-amber-500' },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
          </div>
          <div className={`h-1 w-full ${stat.color} mt-4 rounded-full opacity-20`}></div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">Hoạt động gần đây</h3>
        <div className="space-y-4">
          {[
            { action: 'Tiếp nhận trẻ mới', target: 'Nguyễn Văn A', time: '2 giờ trước' },
            { action: 'Cập nhật sức khỏe', target: 'Trần Thị B', time: '4 giờ trước' },
            { action: 'Đơn nhận nuôi mới', target: 'Gia đình ông bà X', time: 'Hôm qua' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.action}</p>
                <p className="text-xs text-slate-500">{item.target}</p>
              </div>
              <span className="text-xs text-slate-400">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">Cảnh báo hệ thống</h3>
        <div className="space-y-4">
          {[
            { message: 'Sắp hết vật tư y tế', level: 'Nghiêm trọng', time: '1 giờ trước' },
            { message: 'Lịch khám định kỳ trẻ em', level: 'Nhắc nhở', time: '3 giờ trước' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className={`w-2 h-2 rounded-full ${item.level === 'Nghiêm trọng' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{item.message}</p>
                <p className="text-xs text-slate-500">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;
