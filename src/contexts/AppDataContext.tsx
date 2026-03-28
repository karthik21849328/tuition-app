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
import type { Attendance, Batch, Profile, Student } from '../types';

export interface StudentWithProfile extends Student {
  profiles?: Profile;
}

interface AppDataState {
  students: StudentWithProfile[];
  batches: Batch[];
  studentBatches: { student_id: string; batch_id: string }[];
  attendance: Attendance[];
}

const STORAGE_KEY = 'tuition-app-data-v1';

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
  };
}

function loadState(): AppDataState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppDataState;
      if (parsed.students && parsed.batches) return parsed;
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
  getStudentBatchesForBatch: (batchId: string) => string[];
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
  };
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
  markAttendance: (
    studentId: string,
    batchId: string,
    date: string
  ) => { ok: true } | { ok: false; reason: string };
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

  const getStudentBatchesForBatch = useCallback(
    (batchId: string) =>
      data.studentBatches.filter((sb) => sb.batch_id === batchId).map((sb) => sb.student_id),
    [data.studentBatches]
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

  const getTodayStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const attendanceToday = data.attendance.filter((a) => a.date === today);
    const todayPresent = attendanceToday.filter((a) => a.status === 'present').length;
    const todayAbsent = attendanceToday.filter((a) => a.status === 'absent').length;
    const n = attendanceToday.length;
    return {
      totalStudents: data.students.length,
      totalBatches: data.batches.length,
      todayPresent,
      todayAbsent,
      attendancePercentage: n > 0 ? Math.round((todayPresent / n) * 100) : 0,
    };
  }, [data.students, data.batches, data.attendance]);

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
      setData((d) => ({ ...d, students: [row, ...d.students] }));
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
      batches: d.batches.map((b) =>
        b.id === id ? { ...b, ...input } : b
      ),
    }));
  }, []);

  const deleteBatch = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      batches: d.batches.filter((b) => b.id !== id),
      studentBatches: d.studentBatches.filter((sb) => sb.batch_id !== id),
      attendance: d.attendance.filter((a) => a.batch_id !== id),
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

  const markAttendance = useCallback((studentId: string, batchId: string, date: string) => {
    const d = dataRef.current;
    if (d.attendance.some((a) => a.student_id === studentId && a.date === date)) {
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
      if (prev.attendance.some((a) => a.student_id === studentId && a.date === date)) {
        return prev;
      }
      return { ...prev, attendance: [row, ...prev.attendance] };
    });
    return { ok: true as const };
  }, []);

  const value = useMemo(
    () => ({
      data,
      getStudents,
      getBatches,
      getStudentBatchesForBatch,
      getAttendanceForDate,
      getStudentBatch,
      getStudentAttendance,
      getTodayStats,
      addStudent,
      updateStudent,
      deleteStudent,
      addBatch,
      updateBatch,
      deleteBatch,
      setBatchAssignments,
      markAttendance,
    }),
    [
      data,
      getStudents,
      getBatches,
      getStudentBatchesForBatch,
      getAttendanceForDate,
      getStudentBatch,
      getStudentAttendance,
      getTodayStats,
      addStudent,
      updateStudent,
      deleteStudent,
      addBatch,
      updateBatch,
      deleteBatch,
      setBatchAssignments,
      markAttendance,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
