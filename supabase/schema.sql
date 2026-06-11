-- =====================================================================
-- LMS EduHub - Supabase Schema
-- Project: https://supabase.com/dashboard/project/xftvhvnnshdnpxitfihd
--
-- Cách dùng: Mở Supabase Dashboard > SQL Editor > New query,
-- dán toàn bộ nội dung file này và bấm Run.
--
-- Các bảng được thiết kế khớp với các interface trong src/types.ts.
-- ID dùng kiểu text để tương thích trực tiếp với dữ liệu mẫu hiện có
-- (vd: 'course-1', 'student-curr', 'reg-1', ...).
-- =====================================================================

-- 1. Khóa học
create table if not exists public.courses (
  id text primary key,
  code text not null unique,
  title text not null,
  description text not null default '',
  category text not null default '',
  instructor text not null default '',
  fee numeric not null default 0,
  schedule text[] not null default '{}',
  "time" text not null default '',
  start_date date not null,
  end_date date not null,
  total_sessions integer not null default 0,
  image text not null default '',
  created_at timestamptz not null default now()
);

-- 2. Học viên
create table if not exists public.students (
  id text primary key,
  name text not null,
  email text not null unique,
  phone text not null default '',
  student_code text not null unique,
  created_at timestamptz not null default now()
);

-- 3. Đăng ký khóa học
create table if not exists public.registrations (
  id text primary key,
  student_id text not null references public.students(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  registration_date date not null default current_date,
  status text not null check (status in ('pending', 'completed', 'cancelled')),
  payment_status text not null check (payment_status in ('unpaid', 'pending_verification', 'paid')),
  progress integer not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now()
);
create index if not exists idx_registrations_student on public.registrations(student_id);
create index if not exists idx_registrations_course on public.registrations(course_id);

-- 4. Điểm danh
create table if not exists public.attendances (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  student_id text not null references public.students(id) on delete cascade,
  date date not null,
  "time" text,
  status text not null check (status in ('present', 'absent', 'late')),
  session_number integer not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists idx_attendances_student on public.attendances(student_id);
create index if not exists idx_attendances_course on public.attendances(course_id);

-- 5. Tiến độ & điểm số
create table if not exists public.progress (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  student_id text not null references public.students(id) on delete cascade,
  title text not null,
  score numeric not null check (score between 0 and 10),
  feedback text not null default '',
  date date not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_progress_student on public.progress(student_id);
create index if not exists idx_progress_course on public.progress(course_id);

-- 6. Thanh toán học phí
create table if not exists public.payments (
  id text primary key,
  registration_id text not null references public.registrations(id) on delete cascade,
  student_id text not null references public.students(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  amount numeric not null,
  method text not null check (method in ('bank_transfer', 'qr_pay')),
  transaction_code text not null default '',
  status text not null check (status in ('pending', 'success', 'failed')),
  date timestamptz not null default now()
);
create index if not exists idx_payments_student on public.payments(student_id);

-- 7. Thông báo email (mô phỏng hộp thư)
create table if not exists public.email_notifications (
  id text primary key,
  to_email text not null,
  subject text not null,
  body text not null,
  sent_at timestamptz not null default now(),
  type text not null check (type in ('registration_confirmation', 'payment_received', 'schedule_reminder', 'progress_report')),
  status text not null check (status in ('sent', 'failed'))
);
create index if not exists idx_email_notifications_to on public.email_notifications(to_email);

-- 8. Buổi học (lịch học)
create table if not exists public.class_sessions (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  session_number integer not null,
  date date not null,
  topic text not null,
  status text not null check (status in ('upcoming', 'completed')),
  "time" text,
  instructor text
);
create index if not exists idx_class_sessions_course on public.class_sessions(course_id);

-- =====================================================================
-- Row Level Security (RLS)
--
-- App hiện tại chưa tích hợp Supabase Auth nên tạm thời cho phép
-- đọc/ghi tự do với key "anon" để demo hoạt động được ngay.
-- ⚠️ Trước khi đưa vào sản xuất, hãy thêm Supabase Auth và thay
-- các policy "for all" bên dưới bằng điều kiện theo auth.uid().
-- =====================================================================
alter table public.courses enable row level security;
alter table public.students enable row level security;
alter table public.registrations enable row level security;
alter table public.attendances enable row level security;
alter table public.progress enable row level security;
alter table public.payments enable row level security;
alter table public.email_notifications enable row level security;
alter table public.class_sessions enable row level security;

create policy "Allow all - courses" on public.courses for all using (true) with check (true);
create policy "Allow all - students" on public.students for all using (true) with check (true);
create policy "Allow all - registrations" on public.registrations for all using (true) with check (true);
create policy "Allow all - attendances" on public.attendances for all using (true) with check (true);
create policy "Allow all - progress" on public.progress for all using (true) with check (true);
create policy "Allow all - payments" on public.payments for all using (true) with check (true);
create policy "Allow all - email_notifications" on public.email_notifications for all using (true) with check (true);
create policy "Allow all - class_sessions" on public.class_sessions for all using (true) with check (true);
