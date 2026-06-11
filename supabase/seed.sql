-- =====================================================================
-- LMS EduHub - Dữ liệu mẫu (seed)
-- Chạy SAU KHI đã chạy schema.sql.
-- Dữ liệu này tương ứng với src/data/initialData.ts
-- =====================================================================

-- 1. Khóa học
insert into public.courses (id, code, title, description, category, instructor, fee, schedule, "time", start_date, end_date, total_sessions, image) values
('course-1', 'FE-REACT-01', 'Lập Trình Web ReactJS & TypeScript Thực Chiến', 'Khóa học cung cấp kiến thức toàn diện về ReactJS, Vite, Tailwind CSS và TypeScript thông qua việc xây dựng các ứng dụng thực tế. Học viên tốt nghiệp có thể tự tin ứng tuyển vị trí Frontend Developer.', 'Công nghệ thông tin', 'ThS. Nguyễn Văn Sơn', 4200000, array['Thứ 2','Thứ 4','Thứ 6'], '19:30 - 21:30', '2026-06-15', '2026-08-15', 24, 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80'),
('course-2', 'UIUX-PRO-02', 'Thiết Kế Giao Diện UI/UX Chuyên Nghiệp', 'Chinh phục quy trình thiết kế UX Research, Wireframing, UI Design, Prototyping trên Figma. Học cách tối ưu trải nghiệm người dùng với các tiêu chuẩn quốc tế và xây dựng Portfolio đỉnh cao.', 'Thiết kế đồ họa', 'Designer Trần Hoàng Nam', 3800000, array['Thứ 3','Thứ 5'], '18:00 - 20:30', '2026-06-20', '2026-08-25', 18, 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80'),
('course-3', 'ENG-IELTS-03', 'Tiếng Anh Giao Tiếp & IELTS Toàn Diện 6.5+', 'Luyện phản xạ nghe nói tự nhiên, làm quen các chủ đề phổ biến trong IELTS và tối ưu 4 kỹ năng. Học trực tuyến tương tác cao, sửa bài nói - viết trực tiếp với đội ngũ giảng viên chuyên môn cao.', 'Ngoại ngữ', 'Cô Nguyễn Thị Mai (8.5 IELTS)', 5500000, array['Thứ 7','Chủ nhật'], '09:00 - 11:30', '2026-06-18', '2026-09-10', 20, 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80'),
('course-4', 'KNX-TH-2026', 'Tập huấn Online cho dự án thi KNX 2026', 'Chương trình tập huấn trực tuyến dành cho thí sinh tham gia dự án thi Khởi Nghiệp Xanh (KNX) 2026, gồm 2 buổi: xây dựng kế hoạch kinh doanh hoàn chỉnh & lưu ý khi thi KNX, và cập nhật xu hướng thiết kế bao bì trong thời đại hội nhập kinh tế và chuyển đổi số.', 'Tập huấn Khởi nghiệp', 'CG Vũ Hòa & CG Lê Thị Bích Loan', 0, array['18/6','26/6'], 'Theo lịch từng buổi (xem Lịch Học)', '2026-06-18', '2026-06-26', 2, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80')
on conflict (id) do nothing;

-- 2. Học viên
insert into public.students (id, name, email, phone, student_code) values
('student-curr', 'Lê Thị Ngọc Tuyền', 'thinhtq1609@gmail.com', '0987654321', 'HV2026-9081'),
('student-1', 'Nguyễn Minh Thư', 'minhthu.nguyen@gmail.com', '0912345678', 'HV2026-4412'),
('student-2', 'Lê Hoàng Minh', 'hoangminh.le@gmail.com', '0934567890', 'HV2026-7731')
on conflict (id) do nothing;

-- 3. Đăng ký khóa học
insert into public.registrations (id, student_id, course_id, registration_date, status, payment_status, progress) values
('reg-1', 'student-curr', 'course-1', '2026-06-01', 'completed', 'paid', 15),
('reg-2', 'student-curr', 'course-2', '2026-06-05', 'pending', 'unpaid', 0),
('reg-3', 'student-1', 'course-1', '2026-06-02', 'completed', 'paid', 25),
('reg-4', 'student-2', 'course-3', '2026-06-08', 'completed', 'paid', 40),
('reg-5', 'student-curr', 'course-4', '2026-06-11', 'completed', 'paid', 0)
on conflict (id) do nothing;

-- 4. Điểm danh
insert into public.attendances (id, course_id, student_id, date, "time", status, session_number, note) values
('att-1', 'course-1', 'student-curr', '2026-06-15', '19:25', 'present', 1, 'Học viên tích cực phát biểu'),
('att-2', 'course-1', 'student-curr', '2026-06-17', '19:45', 'late', 2, 'Kẹt xe, đi muộn 15 phút'),
('att-3', 'course-1', 'student-1', '2026-06-15', '19:15', 'present', 1, 'Đúng giờ'),
('att-4', 'course-1', 'student-1', '2026-06-17', null, 'absent', 2, 'Xin nghỉ phép có lý do')
on conflict (id) do nothing;

-- 5. Tiến độ & điểm số
insert into public.progress (id, course_id, student_id, title, score, feedback, date) values
('prog-1', 'course-1', 'student-curr', 'Xây dựng layout cá nhân với HTML & CSS', 9.0, 'Layout sạch sẽ, sử dụng Grid và Flexbox tối ưu. Chú ý cải thiện phối màu chữ để có độ tương phản tốt hơn nữa.', '2026-06-18'),
('prog-2', 'course-1', 'student-1', 'Xây dựng layout cá nhân với HTML & CSS', 8.5, 'Cấu trúc code rất tốt, tuy nhiên menu phản hồi (responsive) còn bị vỡ giao diện trên di động nhỏ.', '2026-06-18'),
('prog-3', 'course-3', 'student-2', 'Bài tập Viết (IELTS Writing Task 1)', 7.0, 'Phân tích số liệu và biểu đồ mạch lạc, từ vựng phong phú. Cần lưu ý sắp xếp thời gian hợp lý hơn tránh viết vội ở phần kết luận.', '2026-06-10')
on conflict (id) do nothing;

-- 6. Thanh toán học phí
insert into public.payments (id, registration_id, student_id, course_id, amount, method, transaction_code, status, date) values
('pay-1', 'reg-1', 'student-curr', 'course-1', 4200000, 'qr_pay', 'MOMO-93829103', 'success', '2026-06-01 14:30'),
('pay-2', 'reg-3', 'student-1', 'course-1', 4200000, 'bank_transfer', 'VCB-29013829', 'success', '2026-06-02 10:25'),
('pay-3', 'reg-4', 'student-2', 'course-3', 5500000, 'qr_pay', 'MB-10293819', 'success', '2026-06-08 08:31')
on conflict (id) do nothing;

-- 7. Thông báo email
insert into public.email_notifications (id, to_email, subject, body, sent_at, type, status) values
('notif-1', 'thinhtq1609@gmail.com', '📚 Xác nhận đăng ký khóa học: Lập Trình Web ReactJS', 'Chào Lê Thị Ngọc Tuyền, chúng tôi đã ghi nhận yêu cầu đăng ký của bạn cho khóa học FE-REACT-01. Vui lòng tiến hành thanh toán học phí qua mã QR trong hòm thư cá nhân để kích hoạt chính thức lớp học. Trân trọng!', '2026-06-01 10:00', 'registration_confirmation', 'sent'),
('notif-2', 'thinhtq1609@gmail.com', '💳 Xác nhận đã nhận đóng học phí thành công', 'Chào Lê Thị Ngọc Tuyền, hệ thống đã xác nhận khoản học phí 4,200,000đ từ giao dịch MOMO-93829103. Khóa học FE-REACT-01 của bạn đã chính thức được Kích Hoạt. Hãy truy cập Lịch Học để chuẩn bị buổi khai giảng ngày 2026-06-15.', '2026-06-01 14:35', 'payment_received', 'sent'),
('notif-3', 'thinhtq1609@gmail.com', '🌟 Nhận xét kết quả học tập & Cập nhật tiến độ học viên', 'Bài tập: "Xây dựng layout cá nhân với HTML & CSS"' || chr(10) || 'Điểm số: 9.0/10' || chr(10) || 'Nhận xét từ ThS. Nguyễn Văn Sơn: "Layout sạch sẽ, sử dụng Grid và Flexbox tối ưu. Chú ý cải thiện phối màu chữ để có độ tương phản tốt hơn nữa."' || chr(10) || 'Tốt lắm Tuyền, hãy tiếp tục phát huy!', '2026-06-18 20:00', 'progress_report', 'sent')
on conflict (id) do nothing;

-- 8. Buổi học
-- Lưu ý: Lịch học của course-1, course-2, course-3 hiện được sinh động ở
-- phía client bằng hàm generateSessions() trong src/data/initialData.ts.
-- Chỉ 2 buổi tập huấn KNX 2026 (course-4) là dữ liệu cố định nên seed tại đây.
insert into public.class_sessions (id, course_id, session_number, date, topic, status, "time", instructor) values
('sess-course-4-1', 'course-4', 1, '2026-06-18', 'Xây dựng kế hoạch kinh doanh hoàn chỉnh & những lưu ý thi KNX', 'upcoming', '19:30 - 21:30', 'CG: Vũ Hòa'),
('sess-course-4-2', 'course-4', 2, '2026-06-26', 'Xu hướng thiết kế bao bì trong thời đại hội nhập kinh tế và chuyển đổi số', 'upcoming', '14:00 - 17:00', 'CG: Lê Thị Bích Loan')
on conflict (id) do nothing;
