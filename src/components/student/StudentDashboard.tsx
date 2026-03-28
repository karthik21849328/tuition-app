import { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { LogOut, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Attendance } from '../../types';

export default function StudentDashboard() {
  const { profile, signOut, user } = useAuth();
  const { getStudentBatch, getStudentAttendance, markAttendance, data } = useAppData();
  const [marking, setMarking] = useState(false);

  const batch = useMemo(() => (user ? getStudentBatch(user.id) : null), [user, getStudentBatch, data.studentBatches, data.batches]);

  const attendance = useMemo(() => {
    if (!user) return [] as Attendance[];
    return getStudentAttendance(user.id).slice(0, 30);
  }, [user, getStudentAttendance, data.attendance]);

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = useMemo(
    () => attendance.find((a) => a.date === today) ?? null,
    [attendance, today]
  );

  const markAttendanceClick = async () => {
    if (!user || !batch) return;
    setMarking(true);
    try {
      const result = markAttendance(user.id, batch.id, today);
      if (!result.ok) {
        alert('Failed to mark attendance. You may have already marked it today.');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance.');
    } finally {
      setMarking(false);
    }
  };

  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const attendancePercentage =
    attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Dashboard</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">My Batch</h3>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            {batch ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">{batch.name}</p>
                <p className="text-sm text-gray-600">
                  {batch.start_time} - {batch.end_time}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {batch.days.map((day) => (
                    <span
                      key={day}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No batch assigned</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Attendance Rate</h3>
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 mb-2">{attendancePercentage}%</p>
              <p className="text-sm text-gray-600">
                {presentCount} of {attendance.length} classes attended
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${attendancePercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
              {todayAttendance ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            {todayAttendance ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900">Marked Present</p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(todayAttendance.marked_at).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={markAttendanceClick}
                  disabled={marking || !batch}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {marking ? 'Marking...' : 'Mark Attendance'}
                </button>
                {!batch && <p className="text-xs text-red-600 mt-2">No batch assigned</p>}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Time</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length > 0 ? (
                  attendance.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.status === 'present' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(record.marked_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
