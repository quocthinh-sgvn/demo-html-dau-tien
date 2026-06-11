import React, { useState } from 'react';
import { Course, ClassSession } from '../types';
import { Calendar, Clock, BookOpen, MapPin, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface CalendarViewProps {
  courses: Course[];
  sessions: ClassSession[];
  registeredCourseIds: string[];
  onCheckIn?: (courseId: string, sessionNumber: number) => void;
  checkedInSessions?: Record<string, boolean>; // key là `sessId`, value là true
}

export default function CalendarView({
  courses,
  sessions,
  registeredCourseIds,
  onCheckIn,
  checkedInSessions = {},
}: CalendarViewProps) {
  // Lọc các buổi học của các khóa học đã đăng ký
  const registeredSessions = sessions.filter((s) => registeredCourseIds.includes(s.courseId));

  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5)); // Tháng 6 năm 2026 (Tháng 5 là tháng index 5)
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(
    registeredSessions.length > 0 ? registeredSessions[0] : null
  );

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0: Chủ nhật, 1: Thứ 2...
  };

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  const monthNames = [
    'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
    'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Tạo các mảng ô lịch
  const calendarCells = [];
  // Các ô trống của tháng trước
  // Ở Việt Nam, lịch thường bắt đầu từ Thứ 2, nhưng để đơn giản ta lấy chuẩn Chủ Nhật (thứ 0)
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  // Các ngày trong tháng
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  // Lấy các buổi học trong ngày cụ thể (YYYY-MM-DD)
  const getSessionsForDate = (day: number) => {
    const monthStr = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${currentMonth.getFullYear()}-${monthStr}-${dayStr}`;
    return registeredSessions.filter((s) => s.date === dateStr);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="calendar-view-panel">
      {/* Header điều hướng lịch */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-emerald-400" />
          <h3 className="font-sans font-bold text-slate-100 tracking-tight text-base sm:text-lg">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ring-1 ring-emerald-500/20">
            Lịch Học Linh Hoạt
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            id="prev-month-btn"
            onClick={handlePrevMonth}
            className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:bg-slate-700 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            id="next-month-btn"
            onClick={handleNextMonth}
            className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:bg-slate-700 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Phần Lịch */}
        <div className="lg:col-span-2 space-y-4">
          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 font-mono tracking-wider">
            <div>CN</div>
            <div>T2</div>
            <div>T3</div>
            <div>T4</div>
            <div>T5</div>
            <div>T6</div>
            <div>T7</div>
          </div>

          {/* Grid ngày */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return (
                  <div key={`empty-${idx}`} className="aspect-square bg-slate-950/20 rounded-lg border border-slate-900/30"></div>
                );
              }

              const dateSessions = getSessionsForDate(day);
              const isToday =
                day === 11 && currentMonth.getMonth() === 5 && currentMonth.getFullYear() === 2026; // Ngày hiện tại mô phỏng là 11/06/2026
              const hasSession = dateSessions.length > 0;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => hasSession && setSelectedSession(dateSessions[0])}
                  className={`aspect-square p-1.5 rounded-lg border flex flex-col justify-between transition relative cursor-pointer ${
                    isToday
                      ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                      : hasSession
                      ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850'
                      : 'bg-slate-950/40 border-transparent text-slate-600'
                  }`}
                >
                  <span
                    className={`font-mono text-xs font-semibold ${
                      isToday ? 'text-emerald-400' : hasSession ? 'text-slate-200' : 'text-slate-600'
                    }`}
                  >
                    {day}
                  </span>

                  {hasSession && (
                    <div className="flex flex-col gap-0.5 mt-1">
                      {dateSessions.map((s) => {
                        const course = courses.find((c) => c.id === s.courseId);
                        const isSessCheckedIn = checkedInSessions[s.id] || s.status === 'completed';
                        return (
                          <div
                            key={s.id}
                            className={`text-[8px] px-1 py-0.5 rounded truncate font-sans ${
                              isSessCheckedIn
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                            }`}
                            title={course?.title}
                          >
                            {course?.code.split('-')[0]}•B{s.sessionNumber}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isToday && (
                    <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Thông tin buổi học chi tiết đã chọn */}
        <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800 flex flex-col justify-between h-full">
          {selectedSession ? (
            (() => {
              const course = courses.find((c) => c.id === selectedSession.courseId);
              const isSessionCheckedIn =
                checkedInSessions[selectedSession.id] || selectedSession.status === 'completed';

              return (
                <div className="space-y-4" key={selectedSession.id}>
                  <div className="space-y-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-400">
                      {course?.code}
                    </span>
                    <h4 className="font-sans font-bold text-slate-100 leading-snug">
                      {course?.title}
                    </h4>
                  </div>

                  <div className="border-t border-slate-800 pt-3 space-y-2.5 text-sm text-slate-300">
                    <div className="flex items-center space-x-2.5">
                      <Clock className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium font-sans text-slate-200 text-xs">Thời gian buổi học</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {selectedSession.date} | {course?.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <BookOpen className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium font-sans text-slate-200 text-xs">Chủ đề buổi {selectedSession.sessionNumber}</p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          {selectedSession.topic}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium font-sans text-slate-200 text-xs">Giảng viên & Phòng học</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {course?.instructor} | Phòng trực tuyến Zoom Pro
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4 flex flex-col gap-2">
                    {isSessionCheckedIn ? (
                      <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-3 flex items-center space-x-2 text-emerald-400 text-xs">
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        <span>Đã xác nhận điểm danh có mặt trong buổi học này!</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Học viên có thể thực hiện Check-in nhanh khi đến giờ giảng dạy để xác nhận điểm danh tự động.
                        </p>
                        {onCheckIn && (
                          <button
                            id={`checkin-btn-${selectedSession.id}`}
                            onClick={() => onCheckIn(selectedSession.courseId, selectedSession.sessionNumber)}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold py-2 px-4 rounded-lg text-xs transition duration-150 flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer"
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span>Nhấn Điểm Danh Buổi Học</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-center py-10 space-y-2">
              <Calendar className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-xs">Hãy chọn một ngày có buổi học trên lịch để xem lịch trình của bạn.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
