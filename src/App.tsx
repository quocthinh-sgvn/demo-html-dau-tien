import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';
import InstructorDashboard from './components/InstructorDashboard';
import CalendarView from './components/CalendarView';
import { 
  INITIAL_COURSES, INITIAL_STUDENTS, INITIAL_REGISTRATIONS, 
  INITIAL_ATTENDANCES, INITIAL_PROGRESS, INITIAL_PAYMENTS, 
  INITIAL_NOTIFICATIONS, INITIAL_SESSIONS 
} from './data/initialData';
import { Course, Student, Registration, Attendance, Progress, Payment, EmailNotification, ClassSession } from './types';
import { BookOpen, Calendar as CalendarIcon, UserCheck, Mail, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [role, setRole] = useState<'student' | 'instructor'>('student');

  // Khởi tạo các trạng thái từ LocalStorage để lưu trữ bền vững
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('lms_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('lms_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const saved = localStorage.getItem('lms_registrations');
    return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
  });

  const [attendances, setAttendances] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem('lms_attendances');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCES;
  });

  const [progressList, setProgressList] = useState<Progress[]>(() => {
    const saved = localStorage.getItem('lms_progress');
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('lms_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [emails, setEmails] = useState<EmailNotification[]>(() => {
    const saved = localStorage.getItem('lms_emails');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [sessions, setSessions] = useState<ClassSession[]>(() => {
    const saved = localStorage.getItem('lms_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [checkedInSessions, setCheckedInSessions] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('lms_checkedin_sessions');
    return saved ? JSON.parse(saved) : {};
  });

  // Đồng bộ với LocalStorage mỗi lần state thay đổi
  useEffect(() => {
    localStorage.setItem('lms_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('lms_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('lms_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('lms_attendances', JSON.stringify(attendances));
  }, [attendances]);

  useEffect(() => {
    localStorage.setItem('lms_progress', JSON.stringify(progressList));
  }, [progressList]);

  useEffect(() => {
    localStorage.setItem('lms_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('lms_emails', JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem('lms_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('lms_checkedin_sessions', JSON.stringify(checkedInSessions));
  }, [checkedInSessions]);

  // --- CÁC HÀM NGHIỆP VỤ HỌC VIÊN ---

  // 1. Học viên đăng ký khóa học mới
  const handleRegisterCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    // Kiểm tra xem đã đăng ký chưa
    const alreadyReg = registrations.some((r) => r.studentId === 'student-curr' && r.courseId === courseId);
    if (alreadyReg) return;

    const newReg: Registration = {
      id: `reg-${Date.now()}`,
      studentId: 'student-curr',
      courseId,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      paymentStatus: 'unpaid',
      progress: 0,
    };

    setRegistrations([newReg, ...registrations]);

    // Gửi email tự động xác nhận đăng ký tuyển sinh
    const newEmail: EmailNotification = {
      id: `notif-${Date.now()}`,
      toEmail: 'thinhtq1609@gmail.com',
      subject: `📚 Đăng ký thành công khóa học: ${course.title}`,
      body: `Chào Trần Quyết Thịnh,\n\nHệ thống LMS EduHub xin xác nhận đã nhận được đơn đăng ký học tập của bạn đối với tuyển sinh khóa học:\n\n📖 Tên khóa học: ${course.title}\n🔢 Mã khóa học: ${course.code}\n💳 Học phí khóa học: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.fee)}\n\nVui lòng nhấn "Quét mã QR thanh toán" bên dưới góc chi tiết khóa học và nhập mã giao dịch xác thực để chính thức Kích hoạt học phí của bạn.\n\nTrân trọng cảm ơn,\nLMS EduHub Admin.`,
      sentAt: new Date().toLocaleString('vi-VN'),
      type: 'registration_confirmation',
      status: 'sent',
    };

    setEmails([newEmail, ...emails]);
  };

  // 2. Học viên hoàn tất thanh toán (nhập mã giao dịch)
  const handlePayCourse = (registrationId: string, amount: number, transactionCode: string) => {
    const regIndex = registrations.findIndex((r) => r.id === registrationId);
    if (regIndex === -1) return;

    const updatedRegs = [...registrations];
    const targetReg = updatedRegs[regIndex];
    targetReg.paymentStatus = 'paid';
    targetReg.status = 'completed';
    targetReg.progress = 12; // Khởi tạo mốc tiến độ ban đầu sau khi kích hoạt lớp
    setRegistrations(updatedRegs);

    // Lưu biên lai giao dịch thành công
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      registrationId,
      studentId: 'student-curr',
      courseId: targetReg.courseId,
      amount,
      method: 'qr_pay',
      transactionCode,
      status: 'success',
      date: new Date().toLocaleString('vi-VN'),
    };
    setPayments([newPayment, ...payments]);

    // Gửi email xác nhận đóng tiền thành công
    const course = courses.find((c) => c.id === targetReg.courseId);
    const newEmail: EmailNotification = {
      id: `notif-${Date.now()}`,
      toEmail: 'thinhtq1609@gmail.com',
      subject: `💳 Xác nhận thanh toán & Kích hoạt học phí thành công`,
      body: `Chào Trần Quyết Thịnh,\n\nHệ thống quản lý học phí LMS EduHub xin chân thành cảm ơn bạn đã thanh toán thành công học bổng:\n\n- Khóa học: ${course?.title}\n- Số tiền giao dịch: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}\n- Mã giao dịch: ${transactionCode}\n\nLớp học của bạn đã chính thức được KÍCH HOẠT THÀNH CÔNG. Hãy truy cập Lịch Trình học tập để chuẩn bị sẵn sàng cho ngày khai giảng ${course?.startDate} súc tích.\n\nChúc bạn có những trải nghiệm học tập tuyệt vời tại EduHub!\nTrân trọng.`,
      sentAt: new Date().toLocaleString('vi-VN'),
      type: 'payment_received',
      status: 'sent',
    };
    setEmails([newEmail, ...emails]);
  };

  // 3. Học viên tự check-in bằng nút bấm lịch học
  const handleSelfCheckIn = (courseId: string, sessionNumber: number) => {
    const session = sessions.find((s) => s.courseId === courseId && s.sessionNumber === sessionNumber);
    if (!session) return;

    // Thêm bản ghi điểm danh
    const newAttendance: Attendance = {
      id: `att-${Date.now()}`,
      courseId,
      studentId: 'student-curr',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'present',
      sessionNumber,
      note: 'Học viên tự động check-in qua cổng lịch học cá nhân',
    };

    setAttendances([newAttendance, ...attendances]);

    // Kích hoạt đánh dấu
    setCheckedInSessions({
      ...checkedInSessions,
      [session.id]: true,
    });
  };

  // --- CÁC HÀM NGHIỆP VỤ GIẢNG VIÊN ---

  // 4. Giảng viên điểm danh cho học sinh trực tiếp
  const handleAddAttendance = (newAttendance: Attendance) => {
    // Nếu đã tồn tại điểm danh cho học sinh ở khóa học, buổi này -> Cập nhật
    const index = attendances.findIndex(
      (a) =>
        a.studentId === newAttendance.studentId &&
        a.courseId === newAttendance.courseId &&
        a.sessionNumber === newAttendance.sessionNumber
    );

    if (index !== -1) {
      const updated = [...attendances];
      updated[index] = newAttendance;
      setAttendances(updated);
    } else {
      setAttendances([newAttendance, ...attendances]);
    }
  };

  // 5. Giảng viên nộp điểm & nhận xét cho học viên
  const handleAddProgress = (newProgress: Progress) => {
    setProgressList([newProgress, ...progressList]);

    // Nâng tiến trình học tập của học viên lên một bậc
    const regIndex = registrations.findIndex(
      (r) => r.studentId === newProgress.studentId && r.courseId === newProgress.courseId
    );
    if (regIndex !== -1) {
      const updatedRegs = [...registrations];
      updatedRegs[regIndex].progress = Math.min(100, updatedRegs[regIndex].progress + 20); // Mỗi mốc bài tập tăng 20% tiến độ
      setRegistrations(updatedRegs);
    }
  };

  // 6. Gửi email thông báo email mẫu của Giảng viên
  const handleSendEmailLog = (newEmail: EmailNotification) => {
    setEmails([newEmail, ...emails]);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col font-sans" id="lms-main-app-root">
      
      {/* Navbar Chuyển Vai Trò */}
      <Navbar 
        role={role} 
        setRole={setRole} 
        unreadEmailsCount={emails.filter((e) => e.toEmail === 'thinhtq1609@gmail.com').length} 
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Banner Giới Thiệu Chào Mừng */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-xl text-center md:text-left">
            <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ring-1 ring-emerald-500/20">
              {role === 'student' ? 'CỔNG THÔNG TIN HỌC VIÊN' : 'CƠ QUAN QUẢN LÝ GIẢNG VIÊN'}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 leading-tight">
              {role === 'student' 
                ? 'Chào mừng học viên Trần Quyết Thịnh quay trở lại học tập!' 
                : 'Trang quản trị lớp học & Đào tạo chuyên nghiệp'
              }
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              {role === 'student'
                ? 'Đăng ký các chương trình lập trình, ngoại ngữ quốc tế, thanh toán động bảo mật tuyệt đối, điểm danh nhanh và theo dõi chỉ số học tập để nâng tầm chuyên môn.'
                : 'Giúp giảng viên quản lý danh sách lớp, tạo mã check-in tự động, phân tích kết quả học viên với trợ lý Gemini AI chuẩn xác và tải file báo cáo học thuật CSV nhanh chóng.'
              }
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-5 py-4 text-center min-w-28 shadow-md">
              <span className="text-slate-500 text-[10px] uppercase font-mono block">Tổng số khóa</span>
              <span className="text-xl font-bold font-mono text-emerald-400 block mt-0.5">{courses.length}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-5 py-4 text-center min-w-28 shadow-md">
              <span className="text-slate-500 text-[10px] uppercase font-mono block">Tổng sĩ số</span>
              <span className="text-xl font-bold font-mono text-emerald-400 block mt-0.5">{students.length}</span>
            </div>
          </div>
        </div>

        {/* Khối Lịch Học Tập Hiệu Quả (Luôn hiển thị ở cả 2 chế độ giúp nhìn nhận trực quan) */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-emerald-400" />
            <h3 className="font-sans font-bold text-slate-200 text-sm sm:text-base tracking-wide">
              Lịch Học Tập & Giảng Dạy Tuần Này
            </h3>
          </div>
          <CalendarView 
            courses={courses} 
            sessions={sessions} 
            registeredCourseIds={role === 'student' ? registrations.filter(r => r.studentId === 'student-curr').map(r => r.courseId) : courses.map(c => c.id)}
            onCheckIn={role === 'student' ? handleSelfCheckIn : undefined}
            checkedInSessions={checkedInSessions}
          />
        </div>

        {/* Nội dung Phân Vai Trực Quan */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-emerald-400" />
            <h3 className="font-sans font-bold text-slate-200 text-sm sm:text-base tracking-wide">
              {role === 'student' ? 'Hồ Sơ & Danh Sách Học Tập Của Bạn' : 'Bảng Quản Trị Đào Tạo Giảng Viên'}
            </h3>
          </div>

          {role === 'student' ? (
            <StudentDashboard 
              courses={courses}
              registrations={registrations}
              attendances={attendances}
              progressList={progressList}
              payments={payments}
              emails={emails}
              sessions={sessions}
              onRegisterCourse={handleRegisterCourse}
              onPayCourse={handlePayCourse}
              onSelfCheckIn={handleSelfCheckIn}
              checkedInSessions={checkedInSessions}
            />
          ) : (
            <InstructorDashboard 
              courses={courses}
              students={students}
              registrations={registrations}
              attendances={attendances}
              progressList={progressList}
              emails={emails}
              sessions={sessions}
              onAddAttendance={handleAddAttendance}
              onAddProgress={handleAddProgress}
              onSendEmailLog={handleSendEmailLog}
            />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-850 py-6 text-center text-slate-500 font-sans text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 LMS EduHub Educational Ecosystem. Hệ thống quản lý học tập toàn diện.</p>
          <div className="flex justify-center space-x-6 text-[11px] text-slate-600 font-mono">
            <span>DATABASE: LOCAL-STORAGE SYNCED</span>
            <span>-</span>
            <span>PLATFORM: REAL-TIME SECURED</span>
            <span>-</span>
            <span>ENGINE: AI GEMINI INTEGRATED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
