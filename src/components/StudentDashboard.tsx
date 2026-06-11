import React, { useState } from 'react';
import { Course, Registration, Attendance, Progress, Payment, EmailNotification, ClassSession } from '../types';
import { generateVietQRUrl } from '../utils/vietqr';
import { 
  BookOpen, CreditCard, Play, CheckCircle, Clock, AlertTriangle, 
  Award, TrendingUp, Mail, Send, ChevronRight, X, FileText, Smartphone 
} from 'lucide-react';

interface StudentDashboardProps {
  courses: Course[];
  registrations: Registration[];
  attendances: Attendance[];
  progressList: Progress[];
  payments: Payment[];
  emails: EmailNotification[];
  sessions: ClassSession[];
  onRegisterCourse: (courseId: string) => void;
  onPayCourse: (registrationId: string, amount: number, transactionCode: string) => void;
  onSelfCheckIn: (courseId: string, sessionNumber: number) => void;
  checkedInSessions: Record<string, boolean>;
}

export default function StudentDashboard({
  courses,
  registrations,
  attendances,
  progressList,
  payments,
  emails,
  sessions,
  onRegisterCourse,
  onPayCourse,
  onSelfCheckIn,
  checkedInSessions,
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'courses' | 'my-courses' | 'grades' | 'emails'>('courses');
  const [paymentModalReg, setPaymentModalReg] = useState<Registration | null>(null);
  const [transactionCode, setTransactionCode] = useState('');
  const [copiedBankInfo, setCopiedBankInfo] = useState(false);

  // Lọc thông tin của học viên hiện tại (ID: student-curr)
  const myRegistrations = registrations.filter((r) => r.studentId === 'student-curr');
  const myProgress = progressList.filter((p) => p.studentId === 'student-curr');
  const myAttendances = attendances.filter((a) => a.studentId === 'student-curr');
  const myEmails = emails.filter((e) => e.toEmail === 'thinhtq1609@gmail.com');

  const registeredCourseIds = myRegistrations.map((r) => r.courseId);

  // Mở thanh toán
  const openPayment = (reg: Registration) => {
    setPaymentModalReg(reg);
    // Sinh mã ngẫu nhiên cho dễ nhập
    setTransactionCode(`VCB-${Math.floor(10000000 + Math.random() * 90000000)}`);
  };

  const handleConfirmPayment = () => {
    if (!paymentModalReg || !transactionCode.trim()) return;
    const course = courses.find((c) => c.id === paymentModalReg.courseId);
    if (!course) return;

    onPayCourse(paymentModalReg.id, course.fee, transactionCode);
    setPaymentModalReg(null);
    setTransactionCode('');
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="space-y-8" id="student-dashboard-root">
      {/* Thống kê nhanh */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider block">Khóa đang học</span>
            <span className="font-mono text-2xl font-bold text-emerald-400">
              {myRegistrations.filter((r) => r.status === 'completed' && r.paymentStatus === 'paid').length}
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider block">Chờ thanh toán</span>
            <span className="font-mono text-2xl font-bold text-amber-500">
              {myRegistrations.filter((r) => r.paymentStatus === 'unpaid').length}
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider block">Buổi học đúng giờ</span>
            <span className="font-mono text-2xl font-bold text-emerald-400">
              {myAttendances.filter((a) => a.status === 'present').length}
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider block">Điểm trung bình (GPA)</span>
            <span className="font-mono text-2xl font-bold text-emerald-400">
              {myProgress.length > 0 
                ? (myProgress.reduce((acc, p) => acc + p.score, 0) / myProgress.length).toFixed(1)
                : 'N/A'
              }
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Menu Tabs */}
      <div className="flex border-b border-slate-800 col-span-full">
        <button
          id="tab-courses-lookup"
          onClick={() => setActiveTab('courses')}
          className={`pb-3 text-xs sm:text-sm font-semibold tracking-wide transition-all border-b-2 mr-6 ${
            activeTab === 'courses'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          Đăng Ký Khóa Học
        </button>
        <button
          id="tab-my-courses"
          onClick={() => setActiveTab('my-courses')}
          className={`pb-3 text-xs sm:text-sm font-semibold tracking-wide transition-all border-b-2 mr-6 ${
            activeTab === 'my-courses'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          Khóa Học Của Tôi ({myRegistrations.length})
        </button>
        <button
          id="tab-grades"
          onClick={() => setActiveTab('grades')}
          className={`pb-3 text-xs sm:text-sm font-semibold tracking-wide transition-all border-b-2 mr-6 ${
            activeTab === 'grades'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          Theo Dõi Tiến Trình & Điểm Số
        </button>
        <button
          id="tab-emails"
          onClick={() => setActiveTab('emails')}
          className={`pb-3 text-xs sm:text-sm font-semibold tracking-wide transition-all border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'emails'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          <span>Hòm Thư Hệ Thống ({myEmails.length})</span>
          {myEmails.length > 0 && (
            <span className="bg-rose-500 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold">
              NEW
            </span>
          )}
        </button>
      </div>

      {/* Tab content 1: Đăng Ký Khóa Học */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="courses-registration-tab">
          {courses.map((course) => {
            const isRegistered = registeredCourseIds.includes(course.id);
            const registration = myRegistrations.find((r) => r.courseId === course.id);

            return (
              <div 
                key={course.id} 
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition duration-150 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="h-44 relative bg-slate-800 fill-slate-700">
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale opacity-90"
                    />
                    <span className="absolute top-3 left-3 bg-slate-950/70 text-emerald-400 font-mono text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded backdrop-blur-sm">
                      {course.category}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-emerald-500 text-slate-950 font-mono text-xs font-bold px-2.5 py-1 rounded shadow-md">
                      {formatVND(course.fee)}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-medium text-emerald-400">{course.code}</p>
                      <h4 className="font-sans font-bold text-slate-100 text-sm leading-tight hover:text-emerald-400 transition cursor-pointer">
                        {course.title}
                      </h4>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                      {course.description}
                    </p>

                    <div className="border-t border-slate-800 pt-3 flex flex-wrap gap-y-1.5 gap-x-4 text-[11px] text-slate-400">
                      <div>
                        <span className="font-medium text-slate-300">Lịch:</span> {course.schedule.join(', ')} ({course.time})
                      </div>
                      <div>
                        <span className="font-medium text-slate-300">Khai giảng:</span> {course.startDate}
                      </div>
                      <div>
                        <span className="font-medium text-slate-300">Giảng viên:</span> {course.instructor}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-800/40">
                  {isRegistered ? (
                    registration?.paymentStatus === 'paid' ? (
                      <div className="w-full bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 font-bold py-2 px-4 rounded-lg text-xs text-center flex items-center justify-center space-x-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Đã Đăng Ký & Đã Kích Hoạt</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => openPayment(registration!)}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-4 rounded-lg text-xs transition duration-150 flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Chờ Thanh Toán - Nhấn Thanh Toán Ngay</span>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => onRegisterCourse(course.id)}
                      className="w-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold py-2 px-4 rounded-lg text-xs transition duration-150 flex items-center justify-center space-x-1 border border-emerald-500/10 hover:border-transparent cursor-pointer"
                    >
                      <Play className="h-3 w-3" />
                      <span>Đăng Ký Khóa Học Này</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab content 2: Khóa Học Của Tôi */}
      {activeTab === 'my-courses' && (
        <div className="space-y-6" id="my-courses-tab">
          {myRegistrations.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
              <AlertTriangle className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="text-slate-400 text-sm">Bạn chưa đăng ký khóa học nào. Hãy quay lại mục Đăng Ký Khóa Học nhé!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRegistrations.map((reg) => {
                const course = courses.find((c) => c.id === reg.courseId);
                if (!course) return null;

                const isPaid = reg.paymentStatus === 'paid';
                const progressWidth = `${reg.progress}%`;

                return (
                  <div key={reg.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold bg-slate-850 border border-slate-700/60 text-slate-400 px-2 py-0.5 rounded">
                          {course.code}
                        </span>
                        {isPaid ? (
                          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded">
                            Đã kích hoạt lớp học
                          </span>
                        ) : (
                          <span className="bg-amber-500/10 text-amber-500 text-[10px] font-semibold px-2 py-0.5 rounded">
                            Chờ đóng học phí
                          </span>
                        )}
                      </div>
                      <h4 className="font-sans font-bold text-slate-100 text-sm leading-snug">{course.title}</h4>
                      <p className="text-slate-400 text-xs">Giảng viên: {course.instructor} | Ngày khai giảng: {course.startDate}</p>
                      
                      {isPaid && (
                        <div className="space-y-1.5 pt-2 max-w-md">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-500">Tiến trình khóa học</span>
                            <span className="text-emerald-400 font-bold">{reg.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-850 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: progressWidth }}></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                      {isPaid ? (
                        <>
                          <button
                            onClick={() => setActiveTab('grades')}
                            className="flex-1 sm:flex-initial bg-slate-850 hover:bg-slate-800 text-slate-200 font-medium py-2 px-4 rounded-lg text-xs transition border border-slate-700 flex items-center justify-center space-x-1.5"
                          >
                            <Award className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Xem Tiến Trình Học</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => openPayment(reg)}
                          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-5 rounded-lg text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Đóng học phí ngay để kích hoạt</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab content 3: Theo Dõi Tiến Trình & Điểm Số */}
      {activeTab === 'grades' && (
        <div className="space-y-6" id="grades-tab">
          {myProgress.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
              <Award className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm">Hiện tại chưa có điểm kiểm tra hoặc phản hồi nào từ giảng viên được ghi nhận.</p>
              <p className="text-[11px] text-slate-500">Trạng thái sẽ được cập nhật khi Giảng viên đánh giá tiến trình học tập của bạn.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lịch sử điểm số */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="font-sans font-bold text-slate-200 text-sm tracking-wide">Nhật Ký Đánh Giá & Bài Tập</h4>
                <div className="space-y-4">
                  {myProgress.map((prog) => {
                    const course = courses.find((c) => c.id === prog.courseId);
                    return (
                      <div key={prog.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded">
                              {course?.code}
                            </span>
                            <h5 className="font-sans font-bold text-slate-100 text-sm mt-1">{prog.title}</h5>
                            <p className="text-slate-500 text-[11px]">{prog.date} | Khóa học: {course?.title}</p>
                          </div>
                          <div className="bg-slate-950 border border-slate-800 h-12 w-12 rounded-lg flex flex-col items-center justify-center font-mono">
                            <span className="text-emerald-400 font-bold text-base leading-none">{prog.score}</span>
                            <span className="text-slate-600 text-[8px] mt-1">/10</span>
                          </div>
                        </div>

                        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                          <p className="text-[11px] font-sans font-medium text-slate-400 uppercase tracking-wider block">Giảng viên nhận xét:</p>
                          <p className="text-slate-350 text-xs mt-1 leading-relaxed">"{prog.feedback}"</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tóm tắt & Trực quan điểm số dạng SVG */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
                <div>
                  <h4 className="font-sans font-bold text-slate-200 text-sm tracking-wide">Phân Tích Tiến Độ</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Biểu diễn phân bố điểm số qua các bài tập</p>
                </div>

                {/* Biểu đồ SVG tinh tế */}
                <div className="h-44 flex items-center justify-center bg-slate-950 rounded-lg p-2 relative">
                  <svg className="w-full h-full text-emerald-500" viewBox="0 0 200 100">
                    {/* Vẽ trục tọa độ */}
                    <line x1="20" y1="10" x2="20" y2="85" stroke="#334155" strokeWidth="1" />
                    <line x1="20" y1="85" x2="190" y2="85" stroke="#334155" strokeWidth="1" />
                    
                    {/* Vẽ mốc Grid */}
                    <line x1="20" y1="47.5" x2="190" y2="47.5" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                    <text x="5" y="88" className="fill-slate-600 text-[8px] font-mono">0</text>
                    <text x="5" y="50" className="fill-slate-600 text-[8px] font-mono">5</text>
                    <text x="5" y="14" className="fill-slate-600 text-[8px] font-mono">10</text>

                    {/* Vẽ đoạn thẳng kết nối điểm số (Nếu có) */}
                    {myProgress.length > 0 && (() => {
                      const points = myProgress.map((p, idx) => {
                        const x = 20 + ((170 / Math.max(1, myProgress.length - 1)) * idx);
                        const y = 85 - (p.score * 7); // Phóng to quy mô điểm
                        return { x, y, score: p.score };
                      });

                      const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                      return (
                        <>
                          {myProgress.length > 1 && (
                            <path d={pathD} fill="none" stroke="#10b981" strokeWidth="1.5" />
                          )}
                          {points.map((p, i) => (
                            <g key={i}>
                              <circle cx={p.x} cy={p.y} r="3" fill="#10b981" />
                              <text x={p.x - 3} y={p.y - 6} className="fill-emerald-400 font-mono text-[8px] font-bold">{p.score}</text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                  {myProgress.length === 0 && (
                    <span className="absolute text-slate-600 text-[10px] font-mono">Chưa đủ dữ liệu biểu đồ</span>
                  )}
                </div>

                <div className="space-y-3.5 border-t border-slate-800 pt-4 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Số bài đã hoàn tất</span>
                    <span className="text-slate-200 font-semibold font-mono">{myProgress.length || '0'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Nâng cao & Học bổng</span>
                    <span className="text-emerald-400 font-semibold">Đủ Điều Kiện</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab content 4: Email Notifications Inbox Simulator */}
      {activeTab === 'emails' && (
        <div className="space-y-4" id="emails-simulator-tab">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-sans font-bold text-slate-200 text-sm tracking-wide">Hòm Thư Tự Động LMS-EduHub</h4>
              <p className="text-[11px] text-slate-500">Mô phỏng thông báo email tự động được gửi từ hệ thống cho tài khoản của bạn</p>
            </div>
            <span className="bg-slate-800 text-slate-300 rounded px-2.5 py-1 text-xs font-mono">
              Nhận cho: thinhtq1609@gmail.com
            </span>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 shadow-sm flex flex-col md:flex-row h-[420px]">
            {/* List emails */}
            <div className="w-full md:w-1/3 border-r border-slate-800 overflow-y-auto block">
              {myEmails.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-sans">
                  Hộp thư trống. Bạn sẽ nhận được email khi đăng ký mới hoặc thanh toán thành công khóa học.
                </div>
              ) : (
                myEmails.map((email) => (
                  <div 
                    key={email.id} 
                    className="p-4 border-b border-slate-80o/40 hover:bg-slate-850 cursor-pointer transition border border-slate-800"
                  >
                    <div className="flex justify-between items-start">
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-mono font-medium bg-emerald-500/10 text-emerald-400">
                        {email.type}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">{email.sentAt}</span>
                    </div>
                    <p className="font-sans font-bold text-slate-200 text-xs truncate mt-2">{email.subject}</p>
                    <p className="text-slate-400 text-[11px] line-clamp-1 mt-1 leading-snug">{email.body}</p>
                  </div>
                ))
              )}
            </div>

            {/* Email detail (Hiển thị email đầu tiên làm mẫu hoặc demo chi tiết) */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-950/40">
              {myEmails.length > 0 ? (
                (() => {
                  const latestEmail = myEmails[0]; // Lấy tạm email mới nhất làm chi tiết chính
                  return (
                    <div className="space-y-4">
                      <div className="border-b border-slate-850 pb-4">
                        <h4 className="font-sans font-extrabold text-slate-100 text-base leading-snug">
                          {latestEmail.subject}
                        </h4>
                        <div className="flex flex-col sm:flex-row justify-between text-xs text-slate-400 mt-2 gap-1.5">
                          <div>
                            <span className="text-slate-500 font-medium">Người gửi:</span> hệ thống tự động <span className="text-emerald-400 font-mono">noreply@eduhub.edu.vn</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium font-sans">Thời gian:</span> {latestEmail.sentAt}
                          </div>
                        </div>
                      </div>

                      <div className="whitespace-pre-line text-xs sm:text-sm text-slate-300 leading-relaxed font-sans prose prose-invert bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
                        {latestEmail.body}
                      </div>

                      <div className="border-t border-slate-850 pt-3 text-[10px] text-slate-500 font-sans italic text-center">
                        Email này được gửi tự động bởi tiến trình đăng ký và phân tích học tập LMS. Vui lòng không trả lời.
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                  <Mail className="h-10 w-10 text-slate-700" />
                  <p className="text-slate-500 text-xs">Vui lòng đón đọc thông báo email của bạn ở danh sách bên trái!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal thanh toán học phí VietQR */}
      {paymentModalReg && (() => {
        const course = courses.find((c) => c.id === paymentModalReg.courseId);
        if (!course) return null;

        // Sinh link VietQR động
        const qrUrl = generateVietQRUrl({
          amount: course.fee,
          description: `EduHub ${paymentModalReg.id.slice(0, 5)} dong hoc phi ${course.code}`,
          accountName: 'CONG TY KHAI THAC PHAT TRIEN CONG NGHE GIAO DUC EDUHUB'
        });

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-sans font-bold text-slate-100 text-base">Thanh Toán Học Phí (Thước Đơn Cổng VietQR)</h3>
                </div>
                <button 
                  onClick={() => setPaymentModalReg(null)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  
                  {/* Mã QR */}
                  <div className="bg-white p-3 rounded-xl flex flex-col items-center justify-center space-y-2 border border-slate-200">
                    <img 
                      src={qrUrl} 
                      alt="VietQR Code" 
                      referrerPolicy="no-referrer"
                      className="w-full h-auto aspect-square rounded-lg shadow-sm"
                    />
                    <span className="text-[10px] font-bold text-slate-500 font-mono tracking-wider flex items-center gap-1">
                      <Smartphone className="h-3 w-3" /> QUÉT QR ĐỂ CHUYỂN KHOẢN
                    </span>
                  </div>

                  {/* Thông tin chuyển khoản */}
                  <div className="space-y-3.5 text-xs">
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-850 space-y-1.5 font-mono">
                      <p className="text-slate-500 text-[10px] uppercase">Ngân hàng thụ hưởng</p>
                      <p className="text-slate-200 font-semibold text-xs">Ngân hàng Quân Đội (MB Bank)</p>
                      <p className="text-slate-500 text-[10px] uppercase mt-2">Số tài khoản</p>
                      <p className="text-emerald-400 font-bold text-sm">160920261993</p>
                      <p className="text-slate-500 text-[10px] uppercase mt-2">Nội dung chuyển khoản</p>
                      <p className="text-white text-[11px] font-bold bg-slate-900 px-2 py-1.5 rounded truncate">
                        EduHub {paymentModalReg.id.slice(0, 5)} dong hoc phi {course.code}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-400 font-medium">Khóa học đăng ký:</p>
                      <p className="text-slate-100 font-bold leading-tight">{course.title}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-400 font-medium">Học phí cần đóng:</p>
                      <p className="text-emerald-400 font-extrabold text-sm font-mono">{formatVND(course.fee)}</p>
                    </div>
                  </div>

                </div>

                {/* Xác nhận mã */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                  <label className="block text-xs font-semibold text-slate-200 font-sans uppercase tracking-wide">
                    Nhập Mã Giao Dịch ngân hàng để kích hoạt tự động:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="tx-code-input"
                      value={transactionCode}
                      onChange={(e) => setTransactionCode(e.target.value)}
                      placeholder="Ví dụ: VCB-102938192"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleConfirmPayment}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold text-xs px-4 py-2 rounded-lg transition shrink-0 cursor-pointer"
                    >
                      Xác Nhận Đã Thanh Toán
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans">
                    * Mẹo demo: Điền mã giao dịch dạng chữ có sẵn ở trên, bấm Xác Nhận Đã Thanh Toán. Hệ thống tự cập nhật học phí học viên thành Đã Đóng và tự động gửi 1 Biên lai Email về hòm thư ảo!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
