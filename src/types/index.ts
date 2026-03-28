export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'student';
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
