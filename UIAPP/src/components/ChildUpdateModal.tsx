import React, { useState } from 'react';
import { 
  Baby, 
  Thermometer, 
  Weight, 
  AlertCircle, 
  Pill, 
  Smile, 
  Check, 
  ArrowLeft, 
  History,
  PenSquare,
  Sparkles
} from 'lucide-react';
import { Child, UpdateLog } from '../types';

interface ChildUpdateModalProps {
  child: Child;
  onSave: (updatedChild: Child, newLog?: UpdateLog) => void;
  onClose: () => void;
  initialLogs: UpdateLog[];
}

export default function ChildUpdateModal({ child, onSave, onClose, initialLogs }: ChildUpdateModalProps) {
  const [weight, setWeight] = useState<number>(child.weight);
  const [temp, setTemp] = useState<number>(child.temp);
  const [symptoms, setSymptoms] = useState<string>(child.unusualSymptoms);
  const [meds, setMeds] = useState<string>(child.currentMeds);
  
  const [eating, setEating] = useState<'good' | 'normal' | 'bad'>(child.eatingStatus);
  const [sleeping, setSleeping] = useState<'good' | 'normal' | 'bad'>(child.sleepingStatus);
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad'>(child.mood);
  const [activity, setActivity] = useState<string>(child.activityNotes);

  const [saving, setSaving] = useState(false);
  const [newLogSummary, setNewLogSummary] = useState('');
  const [logs, setLogs] = useState<UpdateLog[]>(initialLogs);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    setTimeout(() => {
      let createdLog: UpdateLog | undefined;
      if (newLogSummary.trim() !== '') {
        createdLog = {
          id: `LOG-${Date.now()}`,
          time: 'Vừa xong',
          staffName: 'Lê Thị Mai',
          staffInitials: 'LT',
          mood: mood === 'happy' ? 'Vui vẻ' : mood === 'neutral' ? 'Bình thường' : 'Uể oải',
          summary: newLogSummary.trim()
        };
      }

      const updatedChild: Child = {
        ...child,
        weight,
        temp,
        unusualSymptoms: symptoms,
        currentMeds: meds,
        eatingStatus: eating,
        sleepingStatus: sleeping,
        mood,
        activityNotes: activity,
        status: temp >= 37.5 ? 'Theo dõi' : meds !== '' ? 'Cần uống thuốc' : 'Khỏe mạnh'
      };

      onSave(updatedChild, createdLog);
      setSaving(false);
      alert('Cập nhật chỉ số và trạng thái của bé thành công!');
      onClose();
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm">
      
      {/* Header back button */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <button 
          onClick={onClose}
          className="text-slate-500 hover:text-blue-600 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Tiêu đề / Trở lại Bảng điều khiển
        </button>
        <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-3 py-1 bg-slate-100 text-slate-500 rounded-lg">
          Trang Cập Nhật Chỉ Số Chăm Sóc Trẻ
        </span>
      </div>

      {/* Child Information Card Banner (Fidelity Screen 2 Header) */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 bg-white">
            <img 
              alt={child.name} 
              src={child.avatar} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-950 leading-tight">{child.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold uppercase tracking-wider">{child.gender}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">Mã Số: {child.id} | Tuổi: {child.age} | Sinh ngày: {child.dob}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 font-medium">Trạng thái:</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            child.status === 'Ổn định' || child.status === 'Khỏe mạnh'
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              : 'bg-rose-50 text-rose-600 border border-rose-100'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              child.status === 'Ổn định' || child.status === 'Khỏe mạnh' ? 'bg-emerald-500' : 'bg-rose-500'
            }`}></span>
            {child.status}
          </span>
        </div>
      </div>

      {/* Interactive Form Split */}
      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Grid: Physiological Indicators (Sức khỏe y tế) */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-l-4 border-blue-500 pl-2.5 uppercase tracking-wider flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-blue-500" />
            Cập nhật chỉ số sức khỏe sinh học
          </h3>

          {/* Weight */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5 text-slate-400" />
                Cân nặng hằng tuần (kg)
              </label>
              <span className="text-xs font-bold font-mono text-slate-800">{weight} kg</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="45" 
              step="0.1" 
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Temp */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                Thân nhiệt hiện tại (°C)
              </label>
              <span className={`text-xs font-bold font-mono ${temp >= 37.5 ? 'text-rose-500 animate-pulse' : 'text-slate-800'}`}>{temp} °C</span>
            </div>
            <input 
              type="number" 
              step="0.1"
              min="35"
              max="42"
              value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none text-sm font-semibold"
            />
          </div>

          {/* Symptoms */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              Triệu chứng bất thường (Nếu có)
            </label>
            <textarea 
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Chảy nước mũi nhẹ, sụt sịt, phát ban ngứa..."
              className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-sm h-[90px] min-h-[90px] resize-none"
            />
          </div>

          {/* Meds */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-slate-400" />
              Sản phẩm thuốc đang sử dụng hằng ngày
            </label>
            <input 
              type="text" 
              value={meds}
              onChange={(e) => setMeds(e.target.value)}
              placeholder="Siro ho bổ phế 5ml, Efferalgan viên hạ sốt 250mg..."
              className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-sm font-semibold"
            />
          </div>
        </div>

        {/* Right Grid: Habitual and activity updates (Trạng thái sinh hoạt) */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-2.5 uppercase tracking-wider flex items-center gap-2">
            <Smile className="w-4 h-4 text-emerald-500" />
            Trạng thái tâm sinh lý &amp; hoạt động
          </h3>

          {/* Eating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tình hình ăn uống hôm nay</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: 'good', label: 'Ngon miệng' },
                { v: 'normal', label: 'Bình thường' },
                { v: 'bad', label: 'Chán ăn, sót lại' }
              ].map(opt => (
                <button 
                  key={opt.v} 
                  type="button"
                  onClick={() => setEating(opt.v as any)}
                  className={`py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                    eating === opt.v
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm font-bold'
                      : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:bg-slate-150'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sleeping */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nhịp độ hằng đêm - giấc ngủ</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: 'good', label: 'Ngủ sâu giấc' },
                { v: 'normal', label: 'Tạm ổn' },
                { v: 'bad', label: 'Khó ngủ' }
              ].map(opt => (
                <button 
                  key={opt.v} 
                  type="button"
                  onClick={() => setSleeping(opt.v as any)}
                  className={`py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                    sleeping === opt.v
                      ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm font-bold'
                      : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:bg-slate-150'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood clickers with big emojis */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Biểu hiện cảm xúc của bé</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: 'happy', emoji: '😊', label: 'Vui tươi' },
                { v: 'neutral', emoji: '😐', label: 'Bình tĩnh' },
                { v: 'sad', emoji: '😢', label: 'Hờn dỗi, khóc' }
              ].map(opt => (
                <button 
                  key={opt.v} 
                  type="button"
                  onClick={() => setMood(opt.v as any)}
                  className={`py-2.5 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                    mood === opt.v
                      ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm scale-102 ring-2 ring-amber-100 font-bold'
                      : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:bg-slate-150'
                  }`}
                >
                  <span className="text-2xl mb-1">{opt.emoji}</span>
                  <span className="text-[10px] font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Activity notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Ghi chú hoạt động vui chơi &amp; học vẽ</label>
            <textarea 
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="Bé An đã cùng bạn bè nỗ lực tô được 3 bức tranh đại bàng và hòa đồng vui chơi ở bãi cỏ mầm non..."
              className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-sm h-[90px] min-h-[90px] resize-none"
            />
          </div>

        </div>

        {/* Bottom Section: Audit Trail Logs & Add New Case Note */}
        <div className="md:col-span-2 border-t border-slate-100 pt-8 space-y-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Lịch sử ghi chép hồ sơ trực trước đây ({logs.length})
            </h3>
          </div>

          {/* Logs timeline list */}
          <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/30 text-xs">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold font-mono">
                  {log.staffInitials}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-slate-700">{log.staffName} <span className="font-medium text-slate-400">• {log.time}</span></p>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold tracking-tight text-[10px]">Tâm trạng: {log.mood}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">{log.summary}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add news case log input */}
          <div className="space-y-3 bg-blue-50/30 border border-blue-100/50 p-5 rounded-xl">
            <label className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <PenSquare className="w-4 h-4 text-blue-500" />
              Thêm ghi chú bàn giao ca trực mới *
            </label>
            <input 
              type="text"
              value={newLogSummary}
              onChange={(e) => setNewLogSummary(e.target.value)}
              placeholder="Ghi vắn tắt báo cáo: Ăn hết suất, uống siro bổ phế lúc 08:30 sáng, không sổ xịt thêm..."
              className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl focus:border-blue-500 outline-none text-xs font-bold font-sans text-slate-800"
            />
            <p className="text-[10px] text-slate-400">Ghi chú này sẽ lập tức được lưu vào nhật ký hệ thống nhằm bàn giao đồng nghiệp ca kế nhiệm.</p>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
            >
              Hủy thay đổi
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Đang lưu trữ...' : 'Ghi nhận & lưu thông tin'}
              <Check className="w-4 h-4" />
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
