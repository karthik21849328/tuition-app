import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import StudentManagement from './StudentManagement';
import BatchManagement from './BatchManagement';
import AttendanceView from './AttendanceView';

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const { getTodayStats, data } = useAppData();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'batches' | 'attendance'>(
    'dashboard'
  );

  const stats = useMemo(() => getTodayStats(), [getTodayStats, data]);

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentManagement />;
      case 'batches':
        return <BatchManagement />;
      case 'attendance':
        return <AttendanceView />;
      default:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Batches</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalBatches}</p>
                  </div>
                  <div className="bg-green-100 rounded-lg p-3">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Today Present</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.todayPresent}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.todayAbsent} absent</p>
                  </div>
                  <div className="bg-emerald-100 rounded-lg p-3">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.attendancePercentage}%</p>
                    <p className="text-xs text-gray-500 mt-1">Today</p>
                  </div>
                  <div className="bg-amber-100 rounded-lg p-3">
                    <TrendingUp className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('students')}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                  >
                    <div className="flex items-center">
                      <UserPlus className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="font-medium text-gray-900">Manage Students</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('batches')}
                    className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition"
                  >
                    <div className="flex items-center">
                      <PlusCircle className="w-5 h-5 text-green-600 mr-3" />
                      <span className="font-medium text-gray-900">Manage Batches</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
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
                      ></div>
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
                        style={{ width: `${100 - stats.attendancePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">Tuition Admin</h1>
              <div className="hidden md:flex space-x-4">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'students'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Students
                </button>
                <button
                  onClick={() => setActiveTab('batches')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'batches'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Batches
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'attendance'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Attendance
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{profile?.full_name}</span>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderContent()}</main>
    </div>
  );
}
