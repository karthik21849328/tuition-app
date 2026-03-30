import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  LogOut,
  UserPlus,
  PlusCircle,
  LayoutDashboard,
  GraduationCap,
  IndianRupee,
  ClipboardList,
  ClipboardCheck,
  Menu,
  X,
} from 'lucide-react';
import StudentManagement from './StudentManagement';
import BatchManagement from './BatchManagement';
import AttendanceView from './AttendanceView';
import TeacherManagement from './TeacherManagement';
import StudentFees from './StudentFees';
import AdminMarkAttendance from './AdminMarkAttendance';

type Tab =
  | 'dashboard'
  | 'students'
  | 'batches'
  | 'teachers'
  | 'fees'
  | 'attendance'
  | 'mark-attendance';

const nav: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'batches', label: 'Batches', icon: BookOpen },
  { id: 'teachers', label: 'Teachers', icon: GraduationCap },
  { id: 'fees', label: 'Student fees', icon: IndianRupee },
  { id: 'attendance', label: 'Attendance log', icon: ClipboardList },
  { id: 'mark-attendance', label: 'Mark attendance', icon: ClipboardCheck },
];

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const { getTodayStats } = useAppData();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileNav, setMobileNav] = useState(false);

  const stats = getTodayStats();

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentManagement />;
      case 'batches':
        return <BatchManagement />;
      case 'teachers':
        return <TeacherManagement />;
      case 'fees':
        return <StudentFees />;
      case 'attendance':
        return <AttendanceView />;
      case 'mark-attendance':
        return <AdminMarkAttendance />;
      default:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard overview</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total students</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active teachers</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeTeachers}</p>
                  </div>
                  <div className="bg-violet-100 rounded-lg p-3">
                    <GraduationCap className="w-6 h-6 text-violet-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total fees collected</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      ₹{stats.totalFeesCollected.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-emerald-100 rounded-lg p-3">
                    <IndianRupee className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total batches</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalBatches}</p>
                  </div>
                  <div className="bg-green-100 rounded-lg p-3">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Today present</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.todayPresent}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.todayAbsent} absent</p>
                  </div>
                  <div className="bg-emerald-100 rounded-lg p-3">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Attendance rate (today)</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.attendancePercentage}%</p>
                  </div>
                  <div className="bg-amber-100 rounded-lg p-3">
                    <TrendingUp className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h3>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('students');
                      setMobileNav(false);
                    }}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-left"
                  >
                    <span className="flex items-center font-medium text-gray-900">
                      <UserPlus className="w-5 h-5 text-blue-600 mr-3" />
                      Manage students
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('batches');
                      setMobileNav(false);
                    }}
                    className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition text-left"
                  >
                    <span className="flex items-center font-medium text-gray-900">
                      <PlusCircle className="w-5 h-5 text-green-600 mr-3" />
                      Manage batches
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('mark-attendance');
                      setMobileNav(false);
                    }}
                    className="w-full flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition text-left"
                  >
                    <span className="flex items-center font-medium text-gray-900">
                      <ClipboardCheck className="w-5 h-5 text-amber-700 mr-3" />
                      Mark attendance
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Present</span>
                      <span className="font-medium text-gray-900">{stats.todayPresent}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.attendancePercentage}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Absent</span>
                      <span className="font-medium text-gray-900">{stats.todayAbsent}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${100 - stats.attendancePercentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const NavButton = ({ item }: { item: (typeof nav)[number] }) => {
    const Icon = item.icon;
    const active = activeTab === item.id;
    return (
      <button
        type="button"
        onClick={() => {
          setActiveTab(item.id);
          setMobileNav(false);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
          active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        {item.label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {mobileNav && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          aria-label="Close menu"
          onClick={() => setMobileNav(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-out
        ${mobileNav ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-white truncate">Joshi Tuotrials</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-300"
            onClick={() => setMobileNav(false)}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map((item) => (
            <NavButton key={item.id} item={item} />
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800 space-y-2">
          <p className="text-xs text-slate-500 px-3 truncate">{profile?.full_name}</p>
          <button
            type="button"
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200 shadow-sm">
          <button
            type="button"
            onClick={() => setMobileNav(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-gray-900 truncate">Joshi Tuotrials</span>
          <span className="w-10" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{renderContent()}</main>
      </div>
    </div>
  );
}
