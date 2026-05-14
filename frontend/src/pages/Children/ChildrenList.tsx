import React from 'react';
import { useChildren } from '../../hooks/useChildren';

const ChildrenList = () => {
  const { data, isLoading, error } = useChildren();

  // Mapping for gender and status if they are enums
  const getGenderText = (gender?: number) => {
    if (gender === 0) return 'Nam';
    if (gender === 1) return 'Nữ';
    return 'Khác';
  };

  const getStatusText = (status: number) => {
    switch(status) {
      case 0: return 'Hoạt động';
      case 1: return 'Đã được nhận nuôi';
      case 2: return 'Đã chuyển đi';
      default: return 'Khác';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800">Hồ sơ trẻ em</h3>
          <p className="text-sm text-slate-500">Quản lý thông tin và tình trạng sức khỏe của trẻ</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
          Tiếp nhận trẻ mới
        </button>
      </div>
      
      {isLoading ? (
        <div className="p-12 text-center text-slate-500">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="p-12 text-center text-danger">Có lỗi xảy ra khi tải dữ liệu.</div>
      ) : (
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Họ và tên</th>
              <th className="px-6 py-4">Ngày sinh</th>
              <th className="px-6 py-4">Giới tính</th>
              <th className="px-6 py-4">Tình trạng sức khỏe</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.items?.length > 0 ? data.items.map((child: any) => (
              <tr key={child.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{child.fullName}</td>
                <td className="px-6 py-4 text-slate-600 text-sm">
                  {child.dob ? new Date(child.dob).toLocaleDateString('vi-VN') : 'N/A'}
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm">{getGenderText(child.gender)}</td>
                <td className="px-6 py-4 text-slate-600 text-sm">{child.healthStatus || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    child.status === 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {getStatusText(child.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-primary hover:underline text-sm font-medium">Chi tiết</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Chưa có hồ sơ nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ChildrenList;
