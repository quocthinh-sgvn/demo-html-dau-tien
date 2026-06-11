import { Course, Student, Registration, Attendance, Progress, Payment, EmailNotification, ClassSession } from '../types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    code: 'FE-REACT-01',
    title: 'Lập Trình Web ReactJS & TypeScript Thực Chiến',
    description: 'Khóa học cung cấp kiến thức toàn diện về ReactJS, Vite, Tailwind CSS và TypeScript thông qua việc xây dựng các ứng dụng thực tế. Học viên tốt nghiệp có thể tự tin ứng tuyển vị trí Frontend Developer.',
    category: 'Công nghệ thông tin',
    instructor: 'ThS. Nguyễn Văn Sơn',
    fee: 4200000,
    schedule: ['Thứ 2', 'Thứ 4', 'Thứ 6'],
    time: '19:30 - 21:30',
    startDate: '2026-06-15',
    endDate: '2026-08-15',
    totalSessions: 24,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'course-2',
    code: 'UIUX-PRO-02',
    title: 'Thiết Kế Giao Diện UI/UX Chuyên Nghiệp',
    description: 'Chinh phục quy trình thiết kế UX Research, Wireframing, UI Design, Prototyping trên Figma. Học cách tối ưu trải nghiệm người dùng với các tiêu chuẩn quốc tế và xây dựng Portfolio đỉnh cao.',
    category: 'Thiết kế đồ họa',
    instructor: 'Designer Trần Hoàng Nam',
    fee: 3800000,
    schedule: ['Thứ 3', 'Thứ 5'],
    time: '18:00 - 20:30',
    startDate: '2026-06-20',
    endDate: '2026-08-25',
    totalSessions: 18,
    image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'course-3',
    code: 'ENG-IELTS-03',
    title: 'Tiếng Anh Giao Tiếp & IELTS Toàn Diện 6.5+',
    description: 'Luyện phản xạ nghe nói tự nhiên, làm quen các chủ đề phổ biến trong IELTS và tối ưu 4 kỹ năng. Học trực tuyến tương tác cao, sửa bài nói - viết trực tiếp với đội ngũ giảng viên chuyên môn cao.',
    category: 'Ngoại ngữ',
    instructor: 'Cô Nguyễn Thị Mai (8.5 IELTS)',
    fee: 5500000,
    schedule: ['Thứ 7', 'Chủ nhật'],
    time: '09:00 - 11:30',
    startDate: '2026-06-18',
    endDate: '2026-09-10',
    totalSessions: 20,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-curr',
    name: 'Trần Quyết Thịnh',
    email: 'thinhtq1609@gmail.com',
    phone: '0987654321',
    studentCode: 'HV2026-9081'
  },
  {
    id: 'student-1',
    name: 'Nguyễn Minh Thư',
    email: 'minhthu.nguyen@gmail.com',
    phone: '0912345678',
    studentCode: 'HV2026-4412'
  },
  {
    id: 'student-2',
    name: 'Lê Hoàng Minh',
    email: 'hoangminh.le@gmail.com',
    phone: '0934567890',
    studentCode: 'HV2026-7731'
  }
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-1',
    studentId: 'student-curr',
    courseId: 'course-1',
    registrationDate: '2026-06-01',
    status: 'completed',
    paymentStatus: 'paid',
    progress: 15
  },
  {
    id: 'reg-2',
    studentId: 'student-curr',
    courseId: 'course-2',
    registrationDate: '2026-06-05',
    status: 'pending',
    paymentStatus: 'unpaid',
    progress: 0
  },
  {
    id: 'reg-3',
    studentId: 'student-1',
    courseId: 'course-1',
    registrationDate: '2026-06-02',
    status: 'completed',
    paymentStatus: 'paid',
    progress: 25
  },
  {
    id: 'reg-4',
    studentId: 'student-2',
    courseId: 'course-3',
    registrationDate: '2026-06-08',
    status: 'completed',
    paymentStatus: 'paid',
    progress: 40
  }
];

// Sinh dữ liệu điểm danh mẫu cho một vài buổi đã học
export const INITIAL_ATTENDANCES: Attendance[] = [
  // student-curr, course-1
  {
    id: 'att-1',
    courseId: 'course-1',
    studentId: 'student-curr',
    date: '2026-06-15',
    time: '19:25',
    status: 'present',
    sessionNumber: 1,
    note: 'Học viên tích cực phát biểu'
  },
  {
    id: 'att-2',
    courseId: 'course-1',
    studentId: 'student-curr',
    date: '2026-06-17',
    time: '19:45',
    status: 'late',
    sessionNumber: 2,
    note: 'Kẹt xe, đi muộn 15 phút'
  },
  // student-1, course-1
  {
    id: 'att-3',
    courseId: 'course-1',
    studentId: 'student-1',
    date: '2026-06-15',
    time: '19:15',
    status: 'present',
    sessionNumber: 1,
    note: 'Đúng giờ'
  },
  {
    id: 'att-4',
    courseId: 'course-1',
    studentId: 'student-1',
    date: '2026-06-17',
    status: 'absent',
    sessionNumber: 2,
    note: 'Xin nghỉ phép có lý do'
  }
];

export const INITIAL_PROGRESS: Progress[] = [
  {
    id: 'prog-1',
    courseId: 'course-1',
    studentId: 'student-curr',
    title: 'Xây dựng layout cá nhân với HTML & CSS',
    score: 9.0,
    feedback: 'Layout sạch sẽ, sử dụng Grid và Flexbox tối ưu. Chú ý cải thiện phối màu chữ để có độ tương phản tốt hơn nữa.',
    date: '2026-06-18'
  },
  {
    id: 'prog-2',
    courseId: 'course-1',
    studentId: 'student-1',
    title: 'Xây dựng layout cá nhân với HTML & CSS',
    score: 8.5,
    feedback: 'Cấu trúc code rất tốt, tuy nhiên menu phản hồi (responsive) còn bị vỡ giao diện trên di động nhỏ.',
    date: '2026-06-18'
  },
  {
    id: 'prog-3',
    courseId: 'course-3',
    studentId: 'student-2',
    title: 'Bài tập Viết (IELTS Writing Task 1)',
    score: 7.0,
    feedback: 'Phân tích số liệu và biểu đồ mạch lạc, từ vựng phong phú. Cần lưu ý sắp xếp thời gian hợp lý hơn tránh viết vội ở phần kết luận.',
    date: '2026-06-10'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    registrationId: 'reg-1',
    studentId: 'student-curr',
    courseId: 'course-1',
    amount: 4200000,
    method: 'qr_pay',
    transactionCode: 'MOMO-93829103',
    status: 'success',
    date: '2026-06-01 14:30'
  },
  {
    id: 'pay-2',
    registrationId: 'reg-3',
    studentId: 'student-1',
    courseId: 'course-1',
    amount: 4200000,
    method: 'bank_transfer',
    transactionCode: 'VCB-29013829',
    status: 'success',
    date: '2026-06-02 10:25'
  },
  {
    id: 'pay-3',
    registrationId: 'reg-4',
    studentId: 'student-2',
    courseId: 'course-3',
    amount: 5500000,
    method: 'qr_pay',
    transactionCode: 'MB-10293819',
    status: 'success',
    date: '2026-06-08 08:31'
  }
];

export const INITIAL_NOTIFICATIONS: EmailNotification[] = [
  {
    id: 'notif-1',
    toEmail: 'thinhtq1609@gmail.com',
    subject: '📚 Xác nhận đăng ký khóa học: Lập Trình Web ReactJS',
    body: 'Chào Trần Quyết Thịnh, chúng tôi đã ghi nhận yêu cầu đăng ký của bạn cho khóa học FE-REACT-01. Vui lòng tiến hành thanh toán học phí qua mã QR trong hòm thư cá nhân để kích hoạt chính thức lớp học. Trân trọng!',
    sentAt: '2026-06-01 10:00',
    type: 'registration_confirmation',
    status: 'sent'
  },
  {
    id: 'notif-2',
    toEmail: 'thinhtq1609@gmail.com',
    subject: '💳 Xác nhận đã nhận đóng học phí thành công',
    body: 'Chào Trần Quyết Thịnh, hệ thống đã xác nhận khoản học phí 4,200,000đ từ giao dịch MOMO-93829103. Khóa học FE-REACT-01 của bạn đã chính thức được Kích Hoạt. Hãy truy cập Lịch Học để chuẩn bị buổi khai giảng ngày 2026-06-15.',
    sentAt: '2026-06-01 14:35',
    type: 'payment_received',
    status: 'sent'
  },
  {
    id: 'notif-3',
    toEmail: 'thinhtq1609@gmail.com',
    subject: '🌟 Nhận xét kết quả học tập & Cập nhật tiến độ học viên',
    body: 'Bài tập: "Xây dựng layout cá nhân với HTML & CSS"\nĐiểm số: 9.0/10\nNhận xét từ ThS. Nguyễn Văn Sơn: "Layout sạch sẽ, sử dụng Grid và Flexbox tối ưu. Chú ý cải thiện phối màu chữ để có độ tương phản tốt hơn nữa."\nTốt lắm Thịnh, hãy tiếp tục phát huy!',
    sentAt: '2026-06-18 20:00',
    type: 'progress_report',
    status: 'sent'
  }
];

// Sinh 8 buổi học đầu cho mỗi khóa học
export const generateSessions = (courses: Course[]): ClassSession[] => {
  const sessions: ClassSession[] = [];
  courses.forEach(course => {
    // Lấy ngày bắt đầu
    let currentDate = new Date(course.startDate);
    let count = 1;
    
    // Sinh mốc 24 buổi hoặc 18, 20 buổi
    while (count <= Math.min(course.totalSessions, 8)) {
      // Phác thảo các chủ đề mẫu dựa trên khóa học
      let topic = '';
      if (course.id === 'course-1') {
        const topics = [
          'Giới thiệu lộ trình Web Front-end với ReactJS & TypeScript',
          'Lắp ráp dự án đầu tiên với Vite và Syntax JSX cơ bản',
          'Xây dựng giao diện Responsive tinh xảo với Tailwind CSS',
          'Component State, Props & Cú pháp truyền dữ liệu',
          'Lập trình điều khiển form, Event Handlers',
          'Hiểu sâu về Hook quan trọng: useEffect và Lifecycle',
          'Kết nối API & Quản lý bất đồng bộ dữ liệu',
          'Thực hành xây dựng Dashboard Đăng ký học tập cá nhân'
        ];
        topic = topics[count - 1] || `Buổi học lý thuyết & thực hành thứ ${count}`;
      } else if (course.id === 'course-2') {
        const topics = [
          'Tổng quan về ngành UI/UX & Quy trình thiết kế sản phẩm tư duy',
          'Nghiên cứu hành vi người dùng (User Persona, Customer Journey)',
          'Xác định cấu trúc thông tin (Information Architecture) & Sơ đồ luồng',
          'Wireframing cơ bản & Phác thảo ý tưởng trên giấy',
          'Thiết lập Figma Workspace, Grid System & Typography',
          'Thiết kế thành phần có thể tái sử dụng (Figma Components, Auto Layout)',
          'Tạo Color Palette chuyên sâu & Hệ thống Design System sơ bộ',
          'Interactive Prototyping - Giao dịch chuyển trang mượt mà'
        ];
        topic = topics[count - 1] || `Buổi học thiết kế UI/UX thứ ${count}`;
      } else {
        const topics = [
          'Kiểm tra đầu vào (IELTS Screening) & Đề cương bứt phá nói tự nhiên',
          'Chủ đề IELTS 1: Family & Cohesiveness (Từ vựng, nâng phản xạ)',
          'Luyện nói Part 1: Sắp xếp thông tin câu trả lời mạch lạc',
          'Chiến lược chinh phục Reading: Skimming & Scanning thần tốc',
          'Listening Section 1: Kỹ năng nhận diện bẫy thông tin, điền từ',
          'Writing Task 1: Cách phân tích nhanh số liệu của Line Graph',
          'Chủ đề IELTS 2: Environment & Green Lifestyle',
          'Luyện nói Part 2: Tự tin nói liên tục 2 phút không vấp với sơ đồ tư duy'
        ];
        topic = topics[count - 1] || `Buổi ôn luyện nói quốc tế thứ ${count}`;
      }

      // Giả sử các buổi trước ngày 2026-06-11 đã hoàn thành (với localTime hiện tại là 2026-06-11)
      const dateStr = currentDate.toISOString().split('T')[0];
      const status: 'upcoming' | 'completed' = dateStr < '2026-06-11' ? 'completed' : 'upcoming';

      sessions.push({
        id: `sess-${course.id}-${count}`,
        courseId: course.id,
        sessionNumber: count,
        date: dateStr,
        topic,
        status
      });

      // Tăng thêm 1 ngày, sau đó dịch tìm ngày phù hợp lịch học
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Tìm ngày kế tiếp rơi vào schedule của khóa học (Ví dụ 'Thứ 2' là Day 1, 'Thứ 3' Day 2...)
      // Để đơn giản, cứ cộng thêm 2-3 ngày cho các buổi xa nhau một chút
      if (course.schedule.length === 3) {
        currentDate.setDate(currentDate.getDate() + (count % 2 === 0 ? 1 : 2));
      } else {
        currentDate.setDate(currentDate.getDate() + 3);
      }
      count++;
    }
  });

  return sessions;
};

export const INITIAL_SESSIONS = generateSessions(INITIAL_COURSES);
