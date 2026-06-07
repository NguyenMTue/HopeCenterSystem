import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Coins, 
  FileCheck, 
  HelpCircle,
  Archive,
  History,
  Barcode,
  Search,
  Filter
} from 'lucide-react';
import { Donation } from '../types';

interface SponsorshipWarehouseProps {
  donations: Donation[];
  onAddDonation: (newDonation: Donation) => void;
}

export default function SponsorshipWarehouse({ donations, onAddDonation }: SponsorshipWarehouseProps) {
  // Form Input states
  const [donorName, setDonorName] = useState('');
  const [type, setType] = useState<'Tiền mặt' | 'Hiện vật'>('Tiền mặt');
  const [amountOrItems, setAmountOrItems] = useState('');
  const [status, setStatus] = useState<'Đã xác nhận' | 'Đã nhập kho' | 'Chờ phân loại'>('Đã xác nhận');
  const [notes, setNotes] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !amountOrItems) {
      alert('Vui lòng hoàn thành ít nhất Tên nhà tài trợ và Chi tiết tài trợ!');
      return;
    }

    const newDonation: Donation = {
      id: `#DN-${Math.floor(1000 + Math.random() * 9000)}`,
      donorName,
      type,
      amountOrItems,
      date: 'Hôm nay',
      status,
      notes: notes || 'Nhu yếu phẩm phúc lợi xã hội'
    };

    onAddDonation(newDonation);
    
    // Reset Form
    setDonorName('');
    setAmountOrItems('');
    setNotes('');
    alert(`Đã hoàn tất ghi nhận khoản tài trợ mới: ${newDonation.id} vào kho dữ trữ thành công!`);
  };

  const filteredDonations = donations.filter(d => 
    d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
          <Package className="text-blue-600 w-7 h-7" />
          Quản lý Tài trợ &amp; Kho vật tư Hope Center
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Hệ thống minh bạch hóa nguồn tiền thu và vật tư nhu yếu tế phẩm hỗ trợ nuôi dưỡng trẻ em.
        </p>
      </div>

      {/* Warehouse stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cash Balance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số dư tiền mặt quỹ tài trợ</p>
            <p className="text-2xl font-black text-slate-900 mt-1">125,500,000 đ</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Ủy thác ngân hàng minh bạch</p>
          </div>
        </div>

        {/* Goods stock */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng sản lượng hiện vật trong kho</p>
            <p className="text-2xl font-black text-slate-900 mt-1">420 <span className="text-sm font-semibold text-slate-400">kiện vật tư</span></p>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">Quần áo, sữa tươi, bỉm sữa, tập vở</p>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="p-4 bg-amber-50 text-amber-500 rounded-xl group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cảnh báo tồn kho tối thiểu</p>
            <p className="text-2xl font-black text-amber-600 mt-1">2 <span className="text-sm font-semibold text-slate-500">vật tư thấp</span></p>
            <p className="text-[11px] text-indigo-600 font-bold mt-1">Sữa công thức bộc phát hạ nhiệt</p>
          </div>
        </div>
      </section>

      {/* Main double column spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: New donations entry form (NHẬP KHO VÀ GHI NHẬN TÀI TRỢ) */}
        <section className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5 mb-5">
            <Plus className="w-4 h-4 text-blue-500" />
            Nhập kho và ghi nhận tài trợ
          </h3>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Donor */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tên nhà hảo tâm / Tổ chức *</label>
              <input 
                type="text" 
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Ví dụ: Quỹ Khát Vọng Ánh Sáng..."
                className="w-full px-4 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-xs font-semibold"
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Hình thức quyên góp / Tài trợ *</label>
              <div className="grid grid-cols-2 gap-2">
                {['Tiền mặt', 'Hiện vật'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t as any)}
                    className={`py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                      type === t
                        ? 'bg-blue-600 text-white font-bold'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Value description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {type === 'Tiền mặt' ? 'Số tiền tài trợ (VNĐ) *' : 'Chi tiết vật phẩm cứu trợ *'}
              </label>
              <input 
                type="text" 
                value={amountOrItems}
                onChange={(e) => setAmountOrItems(e.target.value)}
                placeholder={type === 'Tiền mặt' ? 'Nhập số tiền ví dụ: 5,000,000 đ' : 'Số thùng sữa, tã lót, quần bỉm...'}
                className="w-full px-4 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-xs font-semibold"
              />
            </div>

            {/* Status check checking */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Trạng thái phê duyệt lô hàng *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-xs font-semibold cursor-pointer"
              >
                <option value="Đã xác nhận">Đã xác nhận (Ủy thác tiền)</option>
                <option value="Đã nhập kho">Đã nhập kho (Vật tư cất trữ)</option>
                <option value="Chờ phân loại">Chờ phân loại thanh lý</option>
              </select>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Ghi chú vận chuyển hằng đêm</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Quần ấm dành cho trẻ em mầm non sơ sinh chuẩn quy chuẩn..."
                className="w-full px-4 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-xs h-[70px] min-h-[70px] resize-none"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <FileCheck className="w-4 h-4" />
              Ghi nhận tài trợ / Nhập kho
            </button>

          </form>
        </section>

        {/* Right column: Donation lists table & Inventory warnings */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Recent Donations Table */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex-grow flex flex-col">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-400" />
                  Danh mục bàn giao tài trợ gần đây
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Lịch trình kiểm chứng tài vật từ thiện.</p>
              </div>

              {/* Minimal Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm tài trợ..."
                  className="pl-8 pr-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white outline-none text-[11px] font-medium"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="py-3 px-5 text-[10px] font-bold text-slate-400 uppercase">Mã phiếu</th>
                    <th className="py-3 px-5 text-[10px] font-bold text-slate-400 uppercase">Nhà tài trợ</th>
                    <th className="py-3 px-5 text-[10px] font-bold text-slate-400 uppercase">Thể loại</th>
                    <th className="py-3 px-5 text-[10px] font-bold text-slate-400 uppercase">Giá trị vật tư</th>
                    <th className="py-3 px-5 text-[10px] font-bold text-slate-400 uppercase">Ngày nhận</th>
                    <th className="py-3 px-5 text-[10px] font-bold text-slate-400 uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 divide-dashed">
                  {filteredDonations.map(donation => (
                    <tr key={donation.id} className="hover:bg-slate-50/20 text-xs text-slate-700">
                      <td className="py-3.5 px-5 font-bold font-mono text-slate-500">{donation.id}</td>
                      <td className="py-3.5 px-5">
                        <p className="font-bold text-slate-800">{donation.donorName}</p>
                        <p className="text-[10px] text-slate-400 max-w-[200px] truncate">{donation.notes}</p>
                      </td>
                      <td className="py-3.5 px-5 select-all">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          donation.type === 'Tiền mặt' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                          {donation.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-850">{donation.amountOrItems}</td>
                      <td className="py-3.5 px-5 text-slate-400 font-medium">{donation.date}</td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                          donation.status === 'Đã nhập kho'
                            ? 'text-emerald-500'
                            : donation.status === 'Đã xác nhận'
                              ? 'text-blue-500'
                              : 'text-amber-500'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            donation.status === 'Đã nhập kho' ? 'bg-emerald-500' : donation.status === 'Đã xác nhận' ? 'bg-blue-500' : 'bg-amber-500'
                          }`}></span>
                          {donation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Warning Card block (right margin on Screen 7) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
              Báo cáo tồn kho yếu cần cấp bù nhu yếu phẩm
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-rose-100 rounded-xl bg-rose-50/10">
                <Barcode className="w-4 h-4 text-rose-500 mb-1" />
                <p className="text-xs font-bold text-slate-800">Sữa bột công thức dự phòng</p>
                <p className="text-[10px] text-slate-400 mt-1">Còn lại trong tủ: <strong className="text-rose-500">8 hộp</strong> (Định mức tối thiểu: 15 hộp)</p>
                <div className="w-full h-1.5 bg-slate-100 mt-2 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: '53%' }}></div>
                </div>
              </div>

              <div className="p-4 border border-rose-100 rounded-xl bg-rose-50/10">
                <Barcode className="w-4 h-4 text-rose-500 mb-1" />
                <p className="text-xs font-bold text-slate-800">Tã bỉm sữa trẻ em sơ sinh size M</p>
                <p className="text-[10px] text-slate-400 mt-1">Còn lại trong tủ: <strong className="text-rose-500">4 bịch</strong> (Định mức tối thiểu: 10 bịch)</p>
                <div className="w-full h-1.5 bg-slate-100 mt-2 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
