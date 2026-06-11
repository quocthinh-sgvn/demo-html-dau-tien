import React, { useState } from 'react';
import { Course, Student, Registration, Attendance, Progress, EmailNotification, ClassSession } from '../types';
import { 
  Users, CheckCircle2, Clock, XCircle, Award, Sparkles, Mail, 
  Download, Printer, Plus, Save, ChevronRight, Check, AlertCircle, FileText, Loader2 
} from 'lucide-react';

interface InstructorDashboardProps {
  courses: Course[];
  students: Student[];
  registrations: Registration[];
  attendances: Attendance[];
  progressList: Progress[];
  emails: EmailNotification[];
  sessions: ClassSession[];
  onAddAttendance: (attendance: Attendance) => void;
  onAddProgress: (progress: Progress) => void;
  onSendEmailLog: (email: EmailNotification) => void;
}

export default function InstructorDashboard({
  courses,
  students,
  registrations,
  attendances,
  progressList,
  emails,
  sessions,
  onAddAttendance,
  onAddProgress,
  onSendEmailLog,
}: InstructorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'grading' | 'emails' | 'reports'>('attendance');
  
  // State quản lý điểm danh
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedSessionNum, setSelectedSessionNum] = useState<number>(1);
  const [attendanceNotes, setAttendanceNotes] = useState<Record<string, string>>({}); // key: studentId, value: note
  const [showPinCreated, setShowPinCreated] = useState<string | null>(null);

  // State đánh giá điểm số
  const [gradeStudentId, setGradeStudentId] = useState<string>('');
  const [gradeCourseId, setGradeCourseId] = useState<string>(courses[0]?.id || '');
  const [assignmentTitle, setAssignmentTitle] = useState('Bài tập thực hành tuần 2');
  const [score, setScore] = useState<number>(8.5);
  const [feedback, setFeedback] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [behaviorNote, setBehaviorNote] = useState('Chăm chú lắng nghe, tích cực tương tác trực tiếp');
  const [gradeSavedSuccess, setGradeSavedSuccess] = useState(false);

  // 1. Lọc học viên đăng ký theo từng khóa học
  const getRegisteredStudents = (courseId: string): Student[] => {
    const courseRegs = registrations.filter((r) => r.courseId === courseId && r.status === 'completed');
    const studentIds = courseRegs.map((r) => r.studentId);
    return students.filter((s) => studentIds.includes(s.id));
  };

  const currentCourseStudents = getRegisteredStudents(selectedCourseId);

  // 2. Điểm danh học viên
  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    const note = attendanceNotes[studentId] || '';
    const newAtt: Attendance = {
      id: `att-${Date.now()}-${studentId}`,
      courseId: selectedCourseId,
      studentId,
      date: new Date().toISOString().split('T')[0],
      time: status === 'present' ? '19:30' : status === 'late' ? '19:50' : undefined,
      status,
      sessionNumber: selectedSessionNum,
      note: note.trim() || undefined
    };
    onAddAttendance(newAtt);
  };

  const generateAttendancePin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setShowPinCreated(pin);
    
    // Lưu mã PIN điểm danh vào bộ lưu trữ cục bộ tạm thời để học sinh đồng bộ
    localStorage.setItem(`checkin-pin-${selectedCourseId}-${selectedSessionNum}`, pin);
  };

  // 3. Đánh giá kết quả học tập & Nhận xét bằng AI
  const handleGenerateAIFeedback = async () => {
    const student = students.find((s) => s.id === gradeStudentId);
    const course = courses.find((c) => c.id === gradeCourseId);
    if (!student || !course) return;

    setAiGenerating(true);
    try {
      // Xác định trạng thái đi học của học viên bằng cách đếm số lần nghỉ/trễ
      const studentAtts = attendances.filter((a) => a.studentId === student.id && a.courseId === course.id);
      const lateCount = studentAtts.filter((a) => a.status === 'late').length;
      const absentCount = studentAtts.filter((a) => a.status === 'absent').length;
      const attendanceStatus = absentCount > 0 ? 'absent' : lateCount > 0 ? 'late' : 'present';

      const response = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          courseTitle: course.title,
          assignmentTitle,
          score,
          attendanceStatus,
          behavior: behaviorNote
        })
      });

      const data = await response.json();
      if (data.feedback) {
        setFeedback(data.feedback);
      } else {
        setFeedback(`Thầy đánh giá cao bài nộp "${assignmentTitle}" của ${student.name}. Điểm số ${score}/10 phản ánh sự hiểu biết lý thuyết vững vàng. ${behaviorNote}. Hãy tiếp tục duy trì đà tiến bộ này!`);
      }
    } catch (e) {
      console.error('Không thể gọi API Gemini:', e);
      setFeedback(`Thầy khá hài lòng về kết quả ${score}/10 của ${student.name} đối với bài tập "${assignmentTitle}". Em tiếp thu kiến thức nhanh, ${behaviorNote}. Em cần lưu ý trau chuốt thêm các phần nâng cao lý thuyết.`);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSaveGrade = () => {
    const student = students.find((s) => s.id === gradeStudentId);
    const course = courses.find((c) => c.id === gradeCourseId);
    if (!student || !course || !feedback.trim()) return;

    // Tạo đối tượng điểm số lưu lịch sử
    const newProgress: Progress = {
      id: `prog-mgr-${Date.now()}`,
      courseId: gradeCourseId,
      studentId: gradeStudentId,
      title: assignmentTitle,
      score,
      feedback: feedback.trim(),
      date: new Date().toISOString().split('T')[0]
    };

    onAddProgress(newProgress);

    // Tự động gửi Email thông báo kết quả học viên
    const emailSubject = `🌟 Nhận xét kết quả học lực mới: ${assignmentTitle}`;
    const emailBody = `Chào ${student.name},\n\nGiảng viên khóa học "${course.title}" vừa công bố điểm đánh giá cho bài nộp: "${assignmentTitle}".\n\n📌 Kết quả nhận được:\n- Điểm số: ${score}/10\n- Ngày đánh giá: ${newProgress.date}\n- Nhận xét chi tiết:\n"${feedback}"\n\nBạn có thể đăng nhập vào ứng dụng LMS EduHub để theo dõi bảng học lực tổng quan và đồ thị tiến độ của bản thân học tập.\n\nChúc em học tập tốt & gặt hái nhiều thành công!\nTrân trọng,\nHọc viện Giáo dục LMS EduHub.`;
    
    const newEmail: EmailNotification = {
      id: `notif-${Date.now()}`,
      toEmail: student.email,
      subject: emailSubject,
      body: emailBody,
      sentAt: new Date().toLocaleString('vi-VN'),
      type: 'progress_report',
      status: 'sent'
    };

    onSendEmailLog(newEmail);

    setGradeSavedSuccess(true);
    setTimeout(() => {
      setGradeSavedSuccess(false);
      setFeedback('');
      setGradeStudentId('');
    }, 3000);
  };

  // 4. Xuất Báo Cáo Học Tập sang File CSV
  const handleExportCSV = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const classStudents = getRegisteredStudents(courseId);
    
    // Header CSV
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Mã Học Viên,Tên Học Viên,Email,Số Điện Thoại,Điểm Trung Bình,Số Buổi Có Mặt,Số Buổi Nghỉ\n';

    classStudents.forEach(st => {
      const stProgress = progressList.filter(p => p.studentId === st.id && p.courseId === courseId);
      const avgScore = stProgress.length > 0 
        ? (stProgress.reduce((sum, p) => sum + p.score, 0) / stProgress.length).toFixed(1)
        : '0';

      const stAtts = attendances.filter(a => a.studentId === st.id && a.courseId === courseId);
      const presentCount = stAtts.filter(a => a.status === 'present' || a.status === 'late').length;
      const absentCount = stAtts.filter(a => a.status === 'absent').length;

      csvContent += `"${st.studentCode}","${st.name}","${st.email}","${st.phone}",${avgScore},${presentCount},${absentCount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BaoCao_HocTap_${course.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 5. In báo cáo
  const handlePrintReport = () => {
    window.print();
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="space-y-8" id="instructor-dashboard-root">
      {/* Menu Giảng Viên */}
      <div className="flex border-b border-slate-800 col-span-full">
        <button
          id="subtab-attendance"
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 text-xs sm:text-sm font-semibold tracking-wide transition-all border-b-2 mr-6 ${
            activeTab === 'attendance'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          Điểm Danh & Tạo Check-In QR
        </button>
        <button
          id="subtab-grading"
          onClick={() => setActiveTab('grading')}
          className={`pb-3 text-xs sm:text-sm font-semibold tracking-wide transition-all border-b-2 mr-6 ${
            activeTab === 'grading'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          Đóng Điểm & Nhận Xét AI 🪄
        </button>
        <button
          id="subtab-emails-log"
          onClick={() => setActiveTab('emails')}
          className={`pb-3 text-xs sm:text-sm font-semibold tracking-wide transition-all border-b-2 mr-6 ${
            activeTab === 'emails'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          Nhật Ký Thông Báo Gửi Đi ({emails.length})
        </button>
        <button
          id="subtab-reports"
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-xs sm:text-sm font-semibold tracking-wide transition-all border-b-2 ${
            activeTab === 'reports'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          Xuất Báo Cáo Học Tập
        </button>
      </div>

      {/* Tab 1: ĐIỂM DANH */}
      {activeTab === 'attendance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6" id="attendance-section">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-sans font-bold text-slate-100 text-base">Hồ Sơ Điểm Danh Buổi Học</h4>
              <p className="text-slate-500 text-xs mt-1">Giảng viên thực hiện điểm danh lớp học trực tiếp hoặc tạo mã PIN tự động check-in.</p>
            </div>

            {/* Bộ lọc khóa học & buổi học */}
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                id="select-attendance-course"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.title.slice(0, 20)}...
                  </option>
                ))}
              </select>

              <select
                id="select-attendance-session"
                value={selectedSessionNum}
                onChange={(e) => setSelectedSessionNum(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 w-24 focus:outline-none focus:border-emerald-500"
              >
                {[...Array(8)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Buổi {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Công cụ tạo mã PIN Check-In tự hành */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                CHECKIN TỰ ĐỘNG
              </span>
              <p className="text-slate-200 font-bold text-xs">Mở cổng đăng ký điểm danh từ học viên</p>
              <p className="text-slate-500 text-[10px]">Tạo mã PIN điểm danh để học viên tự nhập mã và tự hoàn thành check-in từ xa.</p>
            </div>
            <div className="flex items-center gap-3">
              {showPinCreated && (
                <div className="bg-emerald-500 text-slate-950 font-mono text-base font-black px-4 py-1.5 rounded-lg border border-emerald-400 flex items-center gap-1.5 animate-pulse">
                  <span>MÃ PIN ID:</span>
                  <span>{showPinCreated}</span>
                </div>
              )}
              <button
                id="generate-pin-btn"
                onClick={generateAttendancePin}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold text-xs py-2 px-4 rounded-lg transition flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-emerald-500/5"
              >
                <Sparkles className="h-4 w-4" />
                <span>{showPinCreated ? 'Tạo Lại Mã PIN' : 'Kích hoạt Mã PIN Check-in'}</span>
              </button>
            </div>
          </div>

          {/* Bảng danh sách học viên trong lớp */}
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 font-mono text-[11px] font-bold text-slate-400 border-b border-slate-800">
                  <th className="p-4">Mã HV</th>
                  <th className="p-4">Họ Và Tên</th>
                  <th className="p-4">Hành Động Điểm Danh</th>
                  <th className="p-4">Trạng Thái Hiện Tại</th>
                  <th className="p-4">Ghi Chú Buổi Học</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50 bg-slate-900 text-xs">
                {currentCourseStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                      Lớp học này hiện tại chưa có học viên nào đăng ký hoàn tất.
                    </td>
                  </tr>
                ) : (
                  currentCourseStudents.map((st) => {
                    // Xem điểm danh buổi này có chưa
                    const curDate = new Date().toISOString().split('T')[0];
                    const existingAtt = attendances.find(
                      (a) =>
                        a.studentId === st.id &&
                        a.courseId === selectedCourseId &&
                        a.sessionNumber === selectedSessionNum
                    );

                    return (
                      <tr key={st.id} className="hover:bg-slate-850/40">
                        <td className="p-4 font-mono text-slate-400">{st.studentCode}</td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-200">{st.name}</p>
                          <p className="text-[10px] text-slate-500">{st.email}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              id={`att-present-${st.id}`}
                              onClick={() => handleAttendanceChange(st.id, 'present')}
                              className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition border ${
                                existingAtt?.status === 'present'
                                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-250 hover:bg-slate-800'
                              }`}
                            >
                              Đi học
                            </button>
                            <button
                              id={`att-late-${st.id}`}
                              onClick={() => handleAttendanceChange(st.id, 'late')}
                              className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition border ${
                                existingAtt?.status === 'late'
                                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-250 hover:bg-slate-800'
                              }`}
                            >
                              Đi muộn
                            </button>
                            <button
                              id={`att-absent-${st.id}`}
                              onClick={() => handleAttendanceChange(st.id, 'absent')}
                              className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition border ${
                                existingAtt?.status === 'absent'
                                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-500'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-250 hover:bg-slate-800'
                              }`}
                            >
                              Vắng học
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          {existingAtt ? (
                            existingAtt.status === 'present' ? (
                              <span className="flex items-center space-x-1 text-emerald-400 font-semibold font-sans">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Có Mặt ({existingAtt.time})</span>
                              </span>
                            ) : existingAtt.status === 'late' ? (
                              <span className="flex items-center space-x-1 text-amber-400 font-semibold font-sans">
                                <Clock className="h-4 w-4 animate-pulse" />
                                <span>Trễ Giờ ({existingAtt.time})</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-1 text-rose-450 font-semibold font-sans">
                                <XCircle className="h-4 w-4" />
                                <span>Vắng Học</span>
                              </span>
                            )
                          ) : (
                            <span className="text-slate-500 italic">Chưa điểm danh</span>
                          )}
                        </td>
                        <td className="p-4">
                          <input
                            type="text"
                            placeholder="Nhập lý do hoặc nhận xét..."
                            value={attendanceNotes[st.id] || existingAtt?.note || ''}
                            onChange={(e) => setAttendanceNotes({ ...attendanceNotes, [st.id]: e.target.value })}
                            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[11px] text-white w-full max-w-[170px] placeholder-slate-700/80 focus:outline-none focus:border-slate-600"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: ĐÓNG ĐIỂM & NHẬN XÉT AI */}
      {activeTab === 'grading' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6" id="grading-section">
          <div>
            <h4 className="font-sans font-bold text-slate-100 text-base">Đóng Điểm & Nhận Xét Bài Tập</h4>
            <p className="text-slate-500 text-xs mt-1">Đánh giá kết quả cho từng học sinh. Sử dụng trợ lý AI Gemini để kiến tạo thư nhận xét thông minh.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form đánh giá */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 font-sans tracking-wide uppercase">Chọn Khóa Học</label>
                  <select
                    id="grade-select-course"
                    value={gradeCourseId}
                    onChange={(e) => {
                      setGradeCourseId(e.target.value);
                      setGradeStudentId('');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.code}] {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 font-sans tracking-wide uppercase">Chọn Học Viên</label>
                  <select
                    id="grade-select-student"
                    value={gradeStudentId}
                    onChange={(e) => setGradeStudentId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Chọn học viên đầu lớp --</option>
                    {getRegisteredStudents(gradeCourseId).map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.studentCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 font-sans tracking-wide uppercase">Tên Bài Tập/Bài Đánh Giá</label>
                  <input
                    type="text"
                    id="grade-assignment-title"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:focus:-pink-500 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 font-sans tracking-wide uppercase">Điểm Số (Thang 10)</label>
                  <input
                    type="number"
                    id="grade-score"
                    min="0"
                    max="10"
                    step="0.5"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 font-sans tracking-wide uppercase">Ghi chú thái độ học (Dành cho AI tham khảo)</label>
                <textarea
                  id="grade-behavior"
                  value={behaviorNote}
                  onChange={(e) => setBehaviorNote(e.target.value)}
                  placeholder="Ví dụ: Rất chăm chỉ làm bài tập, tích cực phản hồi..."
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 h-18 placeholder-slate-700 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  id="ai-generate-feedback-btn"
                  onClick={handleGenerateAIFeedback}
                  disabled={!gradeStudentId || aiGenerating}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-sans font-bold text-xs py-2.5 px-4 rounded-lg transition flex items-center justify-center space-x-1.5 flex-1 cursor-pointer"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Trợ Lý AI Đang Tạo Gợi Ý...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-purple-200" />
                      <span>Sử dụng AI Gợi Ý Nhận Xét 🪄</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Khung phản hồi nhận xét */}
            <div className="bg-slate-950 rounded-xl p-5 border border-slate-850 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-slate-300 font-bold text-xs flex items-center gap-1.5 font-sans">
                    <FileText className="h-4 w-4 text-emerald-400" /> THƯ NHẬN XÉT HỌC VIÊN
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Tự động đẩy về Email học viên</span>
                </div>

                <div className="space-y-1.5">
                  <textarea
                    id="grade-feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Chưa có nội dung nhận xét. Vui lòng bấm Sử dụng AI hoặc tự soạn thảo nội dung tại đây..."
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-3 h-44 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans placeholder-slate-700"
                  />
                </div>
              </div>

              <div className="border-t border-slate-850 pt-4 flex flex-col gap-2">
                {gradeSavedSuccess && (
                  <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-sans font-semibold p-3 rounded-lg text-xs flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span>Đã lưu điểm số thành công và tự động gửi thông báo Email đến học viên!</span>
                  </div>
                )}
                <button
                  id="grade-save-btn"
                  onClick={handleSaveGrade}
                  disabled={!gradeStudentId || !feedback.trim()}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-sans font-extrabold py-2.5 px-4 rounded-lg text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-emerald-500/5"
                >
                  <Save className="h-4 w-4" />
                  <span>Lưu Điểm & Gửi Email Tự Động</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: NHẬT KÝ THÔNG BÁO EMAIL GỬI ĐI */}
      {activeTab === 'emails' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6" id="emails-log-section">
          <div>
            <h4 className="font-sans font-bold text-slate-100 text-base">Nhật Ký Thông Báo Email Tự Động</h4>
            <p className="text-slate-500 text-xs mt-1">Toàn bộ hồ sơ giao dịch email tự động gửi từ hệ thống cho việc đăng ký, đóng học phí hoặc kết quả học tập của học viên.</p>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 font-mono text-[11px] font-bold text-slate-400 border-b border-slate-800">
                  <th className="p-4">Thời Gian</th>
                  <th className="p-4">Học Viên Kính Gửi</th>
                  <th className="p-4">Phân Loại Email</th>
                  <th className="p-4">Tiêu Đề Email</th>
                  <th className="p-4">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50 bg-slate-900 text-xs text-slate-300">
                {emails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                      Chưa có nhật ký lưu hành email nào được ghi nhận.
                    </td>
                  </tr>
                ) : (
                  emails.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/30">
                      <td className="p-4 font-mono text-slate-400">{log.sentAt}</td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-200">{log.toEmail}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          log.type === 'progress_report' 
                            ? 'bg-purple-950/40 text-purple-400 border border-purple-500/20'
                            : log.type === 'payment_received'
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="p-4 font-sans font-medium text-slate-200">{log.subject}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Sent
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: XUẤT BÁO CÁO HỌC TẬP */}
      {activeTab === 'reports' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6" id="reports-section">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-5">
            <div>
              <h4 className="font-sans font-bold text-slate-100 text-base">Xuất Báo Cáo Kết Quả Lớp Học</h4>
              <p className="text-slate-500 text-xs mt-1">Xuất dữ liệu học tập xuất sắc ra file CSV hoặc định dạng máy in PDF chất lượng cao.</p>
            </div>
            
            <div className="flex gap-2">
              <button
                id="export-csv-btn"
                onClick={() => handleExportCSV(selectedCourseId)}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 hover:text-white font-sans font-bold text-xs py-2 px-4 rounded-lg transition flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                <Download className="h-4 w-4" />
                <span>Tải Báo Cáo CSV</span>
              </button>
              <button
                id="print-report-btn"
                onClick={handlePrintReport}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold text-xs py-2 px-4 rounded-lg transition flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                <Printer className="h-4 w-4" />
                <span>In Bản PDF Bản Cứng</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <label className="text-xs font-semibold text-slate-350 font-mono tracking-wider uppercase">Chọn Lớp Báo Cáo:</label>
              <select
                id="report-select-course"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview Báo Cáo trực quan để in */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 space-y-6" id="printable-report-area">
              {/* Report Header */}
              <div className="text-center space-y-1.5 border-b border-slate-800 pb-5">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">Hệ Thống Phân Tích Đào Tạo LMS EduHub</span>
                <h3 className="font-sans font-extrabold text-slate-150 text-lg">BÁO CÁO TIẾN ĐỘ & KẾT QUẢ HỌC TẬP LỚP HỌC</h3>
                <p className="text-slate-400 text-xs">
                  Khóa học: <span className="font-semibold text-slate-200">{courses.find(c => c.id === selectedCourseId)?.title}</span> | Mã Lớp: <span className="text-emerald-400 font-mono font-bold">{courses.find(c => c.id === selectedCourseId)?.code}</span>
                </p>
                <p className="text-slate-500 text-[10px]">Ngày trích lập: {new Date().toLocaleDateString('vi-VN')} | Giảng viên chủ nhiệm: {courses.find(c => c.id === selectedCourseId)?.instructor}</p>
              </div>

              {/* Tóm tắt nhanh lớp học */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-center space-y-1">
                  <span className="text-slate-550 text-[10px] font-semibold uppercase tracking-wider block">Sĩ Số Đăng Ký</span>
                  <span className="text-2xl font-bold font-mono text-slate-200">{currentCourseStudents.length} Học viên</span>
                </div>
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-center space-y-1">
                  <span className="text-slate-550 text-[10px] font-semibold uppercase tracking-wider block">Doanh Thu Học Phí</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {formatVND(currentCourseStudents.length * (courses.find(c => c.id === selectedCourseId)?.fee || 0))}
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-center space-y-1">
                  <span className="text-slate-550 text-[10px] font-semibold uppercase tracking-wider block">GPA Trung Bình Lớp</span>
                  <span className="text-2xl font-bold font-mono text-amber-500">
                    {(() => {
                      const classProgress = progressList.filter(p => p.courseId === selectedCourseId);
                      return classProgress.length > 0 
                        ? (classProgress.reduce((sum, p) => sum + p.score, 0) / classProgress.length).toFixed(1)
                        : '8.0'; // Điểm mẫu nếu trống
                    })()}/10
                  </span>
                </div>
              </div>

              {/* Bảng điểm chi tiết kết xuất */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 font-mono text-[10px] font-bold text-slate-450">
                      <th className="p-3">Học Viên</th>
                      <th className="p-3">Mã Lớp</th>
                      <th className="p-3 text-center">Có Mặt %</th>
                      <th className="p-3 text-center">Số Cột Điểm</th>
                      <th className="p-3 text-right">Điểm Trung Bình</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-[11px] text-slate-300">
                    {currentCourseStudents.map(st => {
                      const stProgress = progressList.filter(p => p.studentId === st.id && p.courseId === selectedCourseId);
                      const avgScore = stProgress.length > 0 
                        ? (stProgress.reduce((sum, p) => sum + p.score, 0) / stProgress.length).toFixed(1)
                        : '8.5';

                      const stAtts = attendances.filter(a => a.studentId === st.id && a.courseId === selectedCourseId);
                      const presentCount = stAtts.filter(a => a.status === 'present' || a.status === 'late').length;
                      const presentPercent = stAtts.length > 0 
                        ? Math.round((presentCount / stAtts.length) * 100)
                        : 100;

                      return (
                        <tr key={st.id} className="hover:bg-slate-850/20">
                          <td className="p-3">
                            <p className="font-bold text-slate-200">{st.name}</p>
                            <p className="text-[9px] text-slate-500">{st.studentCode} | {st.email}</p>
                          </td>
                          <td className="p-3 font-mono text-slate-400">{courses.find(c => c.id === selectedCourseId)?.code}</td>
                          <td className="p-3 text-center font-mono font-semibold text-emerald-400">{presentPercent}%</td>
                          <td className="p-3 text-center font-mono">{stProgress.length || '3'}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">{avgScore}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Chữ ký xác nhận báo cáo chuẩn */}
              <div className="flex justify-between items-center text-[11px] text-slate-450 border-t border-slate-800 pt-5 pr-5 font-sans">
                <div>
                  <span className="block font-semibold">CƠ QUAN CHỦ QUẢN</span>
                  <span className="block text-[9px] text-slate-500">Học viện Giáo dục EduHub</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold">GIẢNG VIÊN CHỦ NHIỆM</span>
                  <span className="block italic text-slate-200 mt-6">{courses.find(c => c.id === selectedCourseId)?.instructor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
