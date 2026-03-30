export type UserRole = 'admin' | 'student' | 'teacher';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  username: string;
  phone?: string;
  parent_phone?: string;
  address?: string;
  created_at: string;
  profile?: Profile;
}

export interface Batch {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  days: string[];
  created_at: string;
}

export interface StudentBatch {
  id: string;
  student_id: string;
  batch_id: string;
  assigned_at: string;
  batch?: Batch;
  student?: Student;
}

export interface Attendance {
  id: string;
  student_id: string;
  batch_id: string;
  date: string;
  status: 'present' | 'absent';
  marked_at: string;
  student?: Student;
  batch?: Batch;
}

export interface Teacher {
  id: string;
  name: string;
  phone: string;
  address: string;
  education_qualification: string;
  salary_type: 'monthly' | 'yearly';
  salary_amount: number;
  active: boolean;
  email: string;
  created_at: string;
}

export interface ClassSession {
  id: string;
  batch_id: string;
  teacher_id: string;
  date: string;
  start_time: string;
  end_time: string;
  concept_taught: string;
  remarks?: string;
  created_at: string;
}

export type StudentFeeMode = 'monthly' | 'installments';

export interface StudentFeePlan {
  student_id: string;
  fee_mode: StudentFeeMode;
}

export interface FeePayment {
  id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  fee_type: 'monthly' | 'installment';
  notes?: string;
  created_at: string;
}
