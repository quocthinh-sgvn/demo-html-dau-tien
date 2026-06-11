export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  instructor: string;
  fee: number;
  schedule: string[]; // ['Thứ 2', 'Thứ 4']
  time: string; // "18:00 - 20:00"
  startDate: string;
  endDate: string;
  image: string;
  category: string;
  totalSessions: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentCode: string;
}

export interface Registration {
  id: string;
  studentId: string;
  courseId: string;
  registrationDate: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'pending_verification' | 'paid';
  progress: number; // 0 to 100
}

export interface Attendance {
  id: string;
  courseId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  time?: string;
  status: 'present' | 'absent' | 'late';
  sessionNumber: number;
  note?: string;
}

export interface Progress {
  id: string;
  courseId: string;
  studentId: string;
  title: string; // vd: "Assignment 1", "Midterm Project"
  score: number; // 0 to 10
  feedback: string;
  date: string;
}

export interface Payment {
  id: string;
  registrationId: string;
  studentId: string;
  courseId: string;
  amount: number;
  method: 'bank_transfer' | 'qr_pay';
  transactionCode: string;
  status: 'pending' | 'success' | 'failed';
  date: string;
}

export interface EmailNotification {
  id: string;
  toEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  type: 'registration_confirmation' | 'payment_received' | 'schedule_reminder' | 'progress_report';
  status: 'sent' | 'failed';
}

export interface ClassSession {
  id: string;
  courseId: string;
  sessionNumber: number;
  date: string;
  topic: string;
  status: 'upcoming' | 'completed';
  time?: string;
  instructor?: string;
}
