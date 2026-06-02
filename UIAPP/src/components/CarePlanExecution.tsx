import { useState } from 'react';
import { 
  FileSignature, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Baby, 
  FileText, 
  Upload, 
  Check, 
  Save,
  ArrowRight
} from 'lucide-react';
import { CareTask } from '../types';

interface CarePlanExecutionProps {
  careTasks: CareTask[];
  onUpdateTasks: (updatedTasks: CareTask[]) => void;
}

export default function CarePlanExecution({ careTasks, onUpdateTasks }: CarePlanExecutionProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(careTasks[0]?.id || '');
  const [reportText, setReportText] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  const selectedTask = careTasks.find(t => t.id === selectedTaskId);

  const handleToggleChecklist = (taskIndex: number, itemIndex: number) => {
    const nextTasks = careTasks.map((task, tIdx) => {
      if (task.id === selectedTaskId) {
        const nextChecklist = task.checklist.map((item, iIdx) => {
          if (iIdx === itemIndex) {
            return { ...item, done: !item.done };
          }
          return item;
        });

        // Determine if all completed
        const allDone = nextChecklist.every(item => item.done);
        const nextStatus = allDone ? 'Hoàn thành' as const : 'Đang thực hiện' as const;

        return {
          ...task,
          checklist: nextChecklist,
          status: nextStatus
        };
      }
      return task;
    });

    onUpdateTasks(nextTasks);
  };

  const handleFileUpload = () => {
    setAttachedFile("Xet_nghiem_lam_sang_A.png");
    alert("Đã tải lên tờ phiếu khám xét nghiệm lâm sàng!");
  };

  const handleCompleteTask = () => {
    const nextTasks = careTasks.map(task => {
      if (task.id === selectedTaskId) {
        // Force all checklist to done
        const nextChecklist = task.checklist.map(item => ({ ...item, done: true }));
        return {
          ...task,
          checklist: nextChecklist,
          status: 'Hoàn thành' as const,
          notes: reportText || 'Đã hoàn tất kiểm tra thẩm định và điền đầy đủ mẫu.'
        };
      }
      return task;
    });

    onUpdateTasks(nextTasks);
    alert("Kế hoạch chăm sóc và khám chữa bệnh đã được hoàn thành & nghiệm thu thành công!");
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
          <FileSignature className="text-blue-600 w-7 h-7" />
          Thực hiện kế hoạch chăm sóc y tế
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi sát sao từng đầu việc nhỏ hằng tuần nhằm đồng hành bảo quản chỉ số phát triển của bé.
        </p>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand: Master Task List Panel (columns on Screen 3) */}
        <section className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hồ sơ kế hoạch tháng này</h3>
          
          <div className="space-y-3">
            {careTasks.map(task => {
              const checkedCount = task.checklist.filter(c => c.done).length;
              const totalCount = task.checklist.length;
              const isSelected = task.id === selectedTaskId;

              return (
                <button
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setReportText(task.notes || '');
                    setAttachedFile(null);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/20 shadow-sm scale-102 font-bold ring-2 ring-blue-100'
                      : 'border-slate-200/60 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">ID: {task.id}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      task.status === 'Hoàn thành'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : task.status === 'Đang thực hiện'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {task.status === 'Hoàn thành' && <CheckCircle2 className="w-3 h-3" />}
                      {task.status === 'Đang thực hiện' && <Clock className="w-3 h-3 animate-spin duration-3000" />}
                      {task.status === 'Chưa bắt đầu' && <AlertCircle className="w-3 h-3" />}
                      {task.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{task.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Baby className="w-3 h-3" />
                      {task.childName} ({task.age} tuổi)
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {task.location}
                    </span>
                    <span className="font-bold">
                      {checkedCount}/{totalCount} việc
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right Hand: Detailed Task Execution Form */}
        {selectedTask ? (
          <section className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col gap-6">
            
            {/* Task Meta */}
            <div className="border-b border-slate-100 pb-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                    Hồ sơ chi tiết: {selectedTask.id}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-2">{selectedTask.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">Đang triển khai dành riêng cho: <strong>{selectedTask.childName}</strong></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Phòng tuyến</p>
                  <p className="text-sm font-bold text-slate-700 mt-1 flex items-center gap-1 justify-end">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    {selectedTask.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist of steps (TIẾN ĐỘ THỰC HIỆN KẾ HOẠCH) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Các bước thực hiện kiểm chứng quy trình</h3>
              
              <div className="space-y-3">
                {selectedTask.checklist.map((item, idx) => (
                  <label 
                    key={idx}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      item.done
                        ? 'bg-emerald-50/10 border-emerald-200 text-slate-600'
                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={item.done}
                      onChange={() => handleToggleChecklist(careTasks.indexOf(selectedTask), idx)}
                      className="mt-0.5 w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="text-left select-none">
                      <p className={`text-xs font-bold ${item.done ? 'line-through text-slate-400 font-medium' : ''}`}>
                        {item.text}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Khảo sát lâm sàng bắt buộc</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Report & File Upload Components */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Báo cáo kết quả và kết luận y khoa
                </label>
                <textarea 
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Hãy ghi chi tiết nhịp tim, chiều cao, hoặc kết quả tư vấn tâm lý phục sinh tháng..."
                  className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-xs font-bold text-slate-800 leading-relaxed h-[100px] min-h-[100px] resize-none"
                />
              </div>

              {/* Upload file */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Đính kèm chứng chỉ lý lịch của phòng khám</label>
                <div className="flex items-center justify-between p-4 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50/30 hover:bg-slate-50 hover:border-slate-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600/80">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-700">
                        {attachedFile ? attachedFile : 'Chọn tệp tài liệu để đính kèm'}
                      </p>
                      <p className="text-[10px] text-slate-400">PDF, JPG, PNG tối đa 5MB</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleFileUpload}
                    className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Tải lên
                  </button>
                </div>
              </div>
            </div>

            {/* Actions for Task Completion */}
            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => alert('Đã lưu nháp tiến trình công việc.')}
                className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-semibold cursor-pointer flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                Lưu tạm thời
              </button>
              <button 
                type="button"
                onClick={handleCompleteTask}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Đồng thuận &amp; hoàn thành kế hoạch
                <Check className="w-4 h-4 animate-bounce" />
              </button>
            </div>

          </section>
        ) : (
          <div className="lg:col-span-7 bg-white py-16 text-center text-slate-400 rounded-2xl border">
            Vui lòng chọn một kế hoạch chăm sóc để tiến hành.
          </div>
        )}

      </div>
    </div>
  );
}
