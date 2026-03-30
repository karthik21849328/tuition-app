import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import type {
  Attendance,
  Batch,
  ClassSession,
  FeePayment,
  Profile,
  StudentFeePlan,
  Teacher,
} from '../types';
import type { Student } from '../types';

export interface StudentWithProfile extends Student {
  profiles?: Profile;
}

interface AppDataState {
  students: StudentWithProfile[];
  batches: Batch[];
  studentBatches: { student_id: string; batch_id: string }[];
  attendance: Attendance[];
  teachers: Teacher[];
  batchTeachers: { batch_id: string; teacher_id: string }[];
  classSessions: ClassSession[];
  feePayments: FeePayment[];
  studentFeePlans: StudentFeePlan[];
}

const STORAGE_KEY = 'tuition-app-data-v3';
const LEGACY_STORAGE_KEY = 'tuition-app-data-v1';

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function defaultState(): AppDataState {
  const t = nowIso();
  const batchId = 'batch-seed-1';
  const studentId = 'student-seed-1';
  const teacherId = 'teacher-seed-1';
  return {
    batches: [
      {
        id: batchId,
        name: 'Evening Math',
        start_time: '17:00',
        end_time: '18:00',
        days: ['Monday', 'Wednesday', 'Friday'],
        created_at: t,
      },
    ],
    students: [
      {
        id: studentId,
        username: 'demostudent4242',
        phone: '',
        parent_phone: '',
        address: '',
        created_at: t,
        profiles: {
          id: studentId,
          email: 'student@demo.com',
          role: 'student',
          full_name: 'Demo Student',
          created_at: t,
          updated_at: t,
        },
      },
    ],
    studentBatches: [{ student_id: studentId, batch_id: batchId }],
    attendance: [],
    teachers: [
      {
        id: teacherId,
        name: 'Demo Teacher',
        phone: '',
        address: '',
        education_qualification: 'M.Sc. Mathematics',
        salary_type: 'monthly',
        salary_amount: 25000,
        active: true,
        email: 'teacher@demo.com',
        created_at: t,
      },
    ],
    batchTeachers: [{ batch_id: batchId, teacher_id: teacherId }],
    classSessions: [],
    feePayments: [],
    studentFeePlans: [{ student_id: studentId, fee_mode: 'monthly' }],
  };
}

function migrate(raw: unknown): AppDataState {
  if (!raw || typeof raw !== 'object') return defaultState();
  const r = raw as Partial<AppDataState>;
  if (!Array.isArray(r.students) || !Array.isArray(r.batches)) return defaultState();

  const students = r.students as StudentWithProfile[];
  const studentIds = new Set(students.map((s) => s.id));
  let studentFeePlans: StudentFeePlan[] = Array.isArray(r.studentFeePlans)
    ? [...r.studentFeePlans]
    : [];
  for (const id of studentIds) {
    if (!studentFeePlans.some((p) => p.student_id === id)) {
      studentFeePlans.push({ student_id: id, fee_mode: 'monthly' });
    }
  }

  return {
    students,
    batches: r.batches as Batch[],
    studentBatches: Array.isArray(r.studentBatches) ? r.studentBatches : [],
    attendance: Array.isArray(r.attendance) ? r.attendance : [],
    teachers: Array.isArray(r.teachers) ? r.teachers : [],
    batchTeachers: Array.isArray(r.batchTeachers) ? r.batchTeachers : [],
    classSessions: Array.isArray(r.classSessions) ? r.classSessions : [],
    feePayments: Array.isArray(r.feePayments) ? r.feePayments : [],
    studentFeePlans,
  };
}

function loadState(): AppDataState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const migrated = migrate(JSON.parse(legacy));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    /* ignore */
  }
  return defaultState();
}

function saveState(state: AppDataState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

interface AppDataContextValue {
  data: AppDataState;
  getStudents: () => StudentWithProfile[];
  getBatches: () => Batch[];
  getTeachers: () => Teacher[];
  getStudentBatchesForBatch: (batchId: string) => string[];
  getTeachersForBatch: (batchId: string) => Teacher[];
  getBatchesForTeacher: (teacherId: string) => Batch[];
  getAttendanceForDate: (
    date: string,
    batchId: string | 'all'
  ) => (Attendance & {
    student?: StudentWithProfile;
    batch?: Batch;
  })[];
  getStudentBatch: (studentId: string) => Batch | null;
  getStudentAttendance: (studentId: string) => Attendance[];
  getTodayStats: () => {
    totalStudents: number;
    totalBatches: number;
    todayPresent: number;
    todayAbsent: number;
    attendancePercentage: number;
    totalFeesCollected: number;
    activeTeachers: number;
  };
  getClassSession: (batchId: string, teacherId: string, date: string) => ClassSession | null;
  getStudentFeePlan: (studentId: string) => StudentFeePlan['fee_mode'];
  getFeePaymentsForStudent: (studentId: string) => FeePayment[];
  addStudent: (input: {
    full_name: string;
    email: string;
    phone: string;
    parent_phone: string;
    address: string;
  }) => { username: string; password: string };
  updateStudent: (
    id: string,
    input: {
      full_name: string;
      phone: string;
      parent_phone: string;
      address: string;
    }
  ) => void;
  deleteStudent: (id: string) => void;
  addBatch: (input: Omit<Batch, 'id' | 'created_at'>) => void;
  updateBatch: (id: string, input: Omit<Batch, 'id' | 'created_at'>) => void;
  deleteBatch: (id: string) => void;
  setBatchAssignments: (batchId: string, studentIds: string[]) => void;
  setBatchTeacherAssignments: (batchId: string, teacherIds: string[]) => void;
  addTeacher: (input: Omit<Teacher, 'id' | 'created_at'>) => void;
  updateTeacher: (id: string, input: Partial<Omit<Teacher, 'id' | 'created_at'>>) => void;
  deleteTeacher: (id: string) => void;
  upsertClassSession: (input: {
    batch_id: string;
    teacher_id: string;
    date: string;
    start_time: string;
    end_time: string;
    concept_taught: string;
    remarks?: string;
  }) => void;
  addFeePayment: (input: {
    student_id: string;
    amount: number;
    payment_date: string;
    fee_type: 'monthly' | 'installment';
    notes?: string;
  }) => void;
  setStudentFeePlan: (studentId: string, fee_mode: StudentFeePlan['fee_mode']) => void;
  markAttendance: (
    studentId: string,
    batchId: string,
    date: string
  ) => { ok: true } | { ok: false; reason: string };
  setAttendanceRecord: (
    studentId: string,
    batchId: string,
    date: string,
    status: 'present' | 'absent'
  ) => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppDataState>(() => loadState());
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    saveState(data);
  }, [data]);

  const getStudents = useCallback(() => [...data.students], [data.students]);
  const getBatches = useCallback(() => [...data.batches], [data.batches]);
  const getTeachers = useCallback(() => [...data.teachers], [data.teachers]);

  const getStudentBatchesForBatch = useCallback(
    (batchId: string) =>
      data.studentBatches.filter((sb) => sb.batch_id === batchId).map((sb) => sb.student_id),
    [data.studentBatches]
  );

  const getTeachersForBatch = useCallback(
    (batchId: string) => {
      const ids = data.batchTeachers.filter((bt) => bt.batch_id === batchId).map((bt) => bt.teacher_id);
      return data.teachers.filter((t) => ids.includes(t.id));
    },
    [data.batchTeachers, data.teachers]
  );

  const getBatchesForTeacher = useCallback(
    (teacherId: string) => {
      const batchIds = data.batchTeachers
        .filter((bt) => bt.teacher_id === teacherId)
        .map((bt) => bt.batch_id);
      return data.batches.filter((b) => batchIds.includes(b.id));
    },
    [data.batchTeachers, data.batches]
  );

  const getAttendanceForDate = useCallback(
    (date: string, batchId: string | 'all') => {
      let rows = data.attendance.filter((a) => a.date === date);
      if (batchId !== 'all') rows = rows.filter((a) => a.batch_id === batchId);
      return rows.map((a) => {
        const student = data.students.find((s) => s.id === a.student_id);
        const batch = data.batches.find((b) => b.id === a.batch_id);
        return { ...a, student, batch };
      });
    },
    [data.attendance, data.students, data.batches]
  );

  const getStudentBatch = useCallback(
    (studentId: string) => {
      const link = data.studentBatches.find((sb) => sb.student_id === studentId);
      if (!link) return null;
      return data.batches.find((b) => b.id === link.batch_id) ?? null;
    },
    [data.studentBatches, data.batches]
  );

  const getStudentAttendance = useCallback(
    (studentId: string) =>
      [...data.attendance]
        .filter((a) => a.student_id === studentId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.attendance]
  );

  const getClassSession = useCallback(
    (batchId: string, teacherId: string, date: string) => {
      return (
        data.classSessions.find(
          (c) => c.batch_id === batchId && c.teacher_id === teacherId && c.date === date
        ) ?? null
      );
    },
    [data.classSessions]
  );

  const getStudentFeePlan = useCallback(
    (studentId: string) => {
      const p = data.studentFeePlans.find((x) => x.student_id === studentId);
      return p?.fee_mode ?? 'monthly';
    },
    [data.studentFeePlans]
  );

  const getFeePaymentsForStudent = useCallback(
    (studentId: string) =>
      data.feePayments.filter((f) => f.student_id === studentId).sort((a, b) => b.payment_date.localeCompare(a.payment_date)),
    [data.feePayments]
  );

  const getTodayStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const attendanceToday = data.attendance.filter((a) => a.date === today);
    const todayPresent = attendanceToday.filter((a) => a.status === 'present').length;
    const todayAbsent = attendanceToday.filter((a) => a.status === 'absent').length;
    const n = attendanceToday.length;
    const totalFeesCollected = data.feePayments.reduce((s, f) => s + f.amount, 0);
    const activeTeachers = data.teachers.filter((t) => t.active).length;
    return {
      totalStudents: data.students.length,
      totalBatches: data.batches.length,
      todayPresent,
      todayAbsent,
      attendancePercentage: n > 0 ? Math.round((todayPresent / n) * 100) : 0,
      totalFeesCollected,
      activeTeachers,
    };
  }, [data.students, data.batches, data.attendance, data.feePayments, data.teachers]);

  const generateUsername = (fullName: string) => {
    const namePart = fullName.toLowerCase().replace(/\s+/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${namePart}${randomNum}`;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const addStudent = useCallback(
    (input: {
      full_name: string;
      email: string;
      phone: string;
      parent_phone: string;
      address: string;
    }) => {
      const username = generateUsername(input.full_name);
      const password = generatePassword();
      const id = uid('stu');
      const t = nowIso();
      const profile: Profile = {
        id,
        email: input.email.trim().toLowerCase(),
        role: 'student',
        full_name: input.full_name,
        created_at: t,
        updated_at: t,
      };
      const row: StudentWithProfile = {
        id,
        username,
        phone: input.phone,
        parent_phone: input.parent_phone,
        address: input.address,
        created_at: t,
        profiles: profile,
      };
      setData((d) => ({
        ...d,
        students: [row, ...d.students],
        studentFeePlans: [{ student_id: id, fee_mode: 'monthly' }, ...d.studentFeePlans],
      }));
      return { username, password };
    },
    []
  );

  const updateStudent = useCallback(
    (
      id: string,
      input: {
        full_name: string;
        phone: string;
        parent_phone: string;
        address: string;
      }
    ) => {
      setData((d) => ({
        ...d,
        students: d.students.map((s) =>
          s.id === id
            ? {
                ...s,
                phone: input.phone,
                parent_phone: input.parent_phone,
                address: input.address,
                profiles: s.profiles
                  ? {
                      ...s.profiles,
                      full_name: input.full_name,
                      updated_at: nowIso(),
                    }
                  : s.profiles,
              }
            : s
        ),
      }));
    },
    []
  );

  const deleteStudent = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      students: d.students.filter((s) => s.id !== id),
      studentBatches: d.studentBatches.filter((sb) => sb.student_id !== id),
      attendance: d.attendance.filter((a) => a.student_id !== id),
      feePayments: d.feePayments.filter((f) => f.student_id !== id),
      studentFeePlans: d.studentFeePlans.filter((p) => p.student_id !== id),
    }));
  }, []);

  const addBatch = useCallback((input: Omit<Batch, 'id' | 'created_at'>) => {
    const row: Batch = {
      ...input,
      id: uid('bat'),
      created_at: nowIso(),
    };
    setData((d) => ({ ...d, batches: [row, ...d.batches] }));
  }, []);

  const updateBatch = useCallback((id: string, input: Omit<Batch, 'id' | 'created_at'>) => {
    setData((d) => ({
      ...d,
      batches: d.batches.map((b) => (b.id === id ? { ...b, ...input } : b)),
    }));
  }, []);

  const deleteBatch = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      batches: d.batches.filter((b) => b.id !== id),
      studentBatches: d.studentBatches.filter((sb) => sb.batch_id !== id),
      batchTeachers: d.batchTeachers.filter((bt) => bt.batch_id !== id),
      attendance: d.attendance.filter((a) => a.batch_id !== id),
      classSessions: d.classSessions.filter((c) => c.batch_id !== id),
    }));
  }, []);

  const setBatchAssignments = useCallback((batchId: string, studentIds: string[]) => {
    setData((d) => ({
      ...d,
      studentBatches: [
        ...d.studentBatches.filter((sb) => sb.batch_id !== batchId),
        ...studentIds.map((student_id) => ({ student_id, batch_id: batchId })),
      ],
    }));
  }, []);

  const setBatchTeacherAssignments = useCallback((batchId: string, teacherIds: string[]) => {
    setData((d) => ({
      ...d,
      batchTeachers: [
        ...d.batchTeachers.filter((bt) => bt.batch_id !== batchId),
        ...teacherIds.map((teacher_id) => ({ teacher_id, batch_id: batchId })),
      ],
    }));
  }, []);

  const addTeacher = useCallback((input: Omit<Teacher, 'id' | 'created_at'>) => {
    const row: Teacher = {
      ...input,
      id: uid('tch'),
      created_at: nowIso(),
    };
    setData((d) => ({ ...d, teachers: [row, ...d.teachers] }));
  }, []);

  const updateTeacher = useCallback(
    (id: string, input: Partial<Omit<Teacher, 'id' | 'created_at'>>) => {
      setData((d) => ({
        ...d,
        teachers: d.teachers.map((t) => (t.id === id ? { ...t, ...input } : t)),
      }));
    },
    []
  );

  const deleteTeacher = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      teachers: d.teachers.filter((t) => t.id !== id),
      batchTeachers: d.batchTeachers.filter((bt) => bt.teacher_id !== id),
      classSessions: d.classSessions.filter((c) => c.teacher_id !== id),
    }));
  }, []);

  const upsertClassSession = useCallback(
    (input: {
      batch_id: string;
      teacher_id: string;
      date: string;
      start_time: string;
      end_time: string;
      concept_taught: string;
      remarks?: string;
    }) => {
      const t = nowIso();
      setData((d) => {
        const idx = d.classSessions.findIndex(
          (c) =>
            c.batch_id === input.batch_id &&
            c.teacher_id === input.teacher_id &&
            c.date === input.date
        );
        if (idx >= 0) {
          const next = [...d.classSessions];
          next[idx] = {
            ...next[idx],
            ...input,
            remarks: input.remarks,
          };
          return { ...d, classSessions: next };
        }
        const row: ClassSession = {
          id: uid('cls'),
          ...input,
          remarks: input.remarks,
          created_at: t,
        };
        return { ...d, classSessions: [row, ...d.classSessions] };
      });
    },
    []
  );

  const addFeePayment = useCallback(
    (input: {
      student_id: string;
      amount: number;
      payment_date: string;
      fee_type: 'monthly' | 'installment';
      notes?: string;
    }) => {
      const row: FeePayment = {
        id: uid('fee'),
        ...input,
        created_at: nowIso(),
      };
      setData((d) => ({ ...d, feePayments: [row, ...d.feePayments] }));
    },
    []
  );

  const setStudentFeePlan = useCallback((studentId: string, fee_mode: StudentFeePlan['fee_mode']) => {
    setData((d) => {
      const rest = d.studentFeePlans.filter((p) => p.student_id !== studentId);
      return { ...d, studentFeePlans: [...rest, { student_id: studentId, fee_mode }] };
    });
  }, []);

  const markAttendance = useCallback((studentId: string, batchId: string, date: string) => {
    const d = dataRef.current;
    if (d.attendance.some((a) => a.student_id === studentId && a.batch_id === batchId && a.date === date)) {
      return { ok: false as const, reason: 'already_marked' };
    }
    const row: Attendance = {
      id: uid('att'),
      student_id: studentId,
      batch_id: batchId,
      date,
      status: 'present',
      marked_at: nowIso(),
    };
    setData((prev) => {
      if (
        prev.attendance.some(
          (a) => a.student_id === studentId && a.batch_id === batchId && a.date === date
        )
      ) {
        return prev;
      }
      return { ...prev, attendance: [row, ...prev.attendance] };
    });
    return { ok: true as const };
  }, []);

  const setAttendanceRecord = useCallback(
    (studentId: string, batchId: string, date: string, status: 'present' | 'absent') => {
      setData((d) => {
        const filtered = d.attendance.filter(
          (a) => !(a.student_id === studentId && a.batch_id === batchId && a.date === date)
        );
        const row: Attendance = {
          id: uid('att'),
          student_id: studentId,
          batch_id: batchId,
          date,
          status,
          marked_at: nowIso(),
        };
        return { ...d, attendance: [row, ...filtered] };
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      data,
      getStudents,
      getBatches,
      getTeachers,
      getStudentBatchesForBatch,
      getTeachersForBatch,
      getBatchesForTeacher,
      getAttendanceForDate,
      getStudentBatch,
      getStudentAttendance,
      getTodayStats,
      getClassSession,
      getStudentFeePlan,
      getFeePaymentsForStudent,
      addStudent,
      updateStudent,
      deleteStudent,
      addBatch,
      updateBatch,
      deleteBatch,
      setBatchAssignments,
      setBatchTeacherAssignments,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      upsertClassSession,
      addFeePayment,
      setStudentFeePlan,
      markAttendance,
      setAttendanceRecord,
    }),
    [
      data,
      getStudents,
      getBatches,
      getTeachers,
      getStudentBatchesForBatch,
      getTeachersForBatch,
      getBatchesForTeacher,
      getAttendanceForDate,
      getStudentBatch,
      getStudentAttendance,
      getTodayStats,
      getClassSession,
      getStudentFeePlan,
      getFeePaymentsForStudent,
      addStudent,
      updateStudent,
      deleteStudent,
      addBatch,
      updateBatch,
      deleteBatch,
      setBatchAssignments,
      setBatchTeacherAssignments,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      upsertClassSession,
      addFeePayment,
      setStudentFeePlan,
      markAttendance,
      setAttendanceRecord,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
