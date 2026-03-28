import { useState, useMemo } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { Calendar, CheckCircle, XCircle, Filter } from 'lucide-react';
import { Attendance, Batch, Student, Profile } from '../../types';

interface AttendanceWithDetails extends Attendance {
  student?: Student & { profiles?: Profile };
  batch?: Batch;
}

export default function AttendanceView() {
  const { data, getAttendanceForDate, getBatches } = useAppData();
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const batches = useMemo(() => getBatches(), [getBatches, data.batches]);

  const attendance = useMemo(() => {
    return getAttendanceForDate(selectedDate, selectedBatch) as AttendanceWithDetails[];
  }, [getAttendanceForDate, selectedDate, selectedBatch, data.attendance]);

  const stats = useMemo(() => {
    const present = attendance.filter((a) => a.status === 'present').length;
    const absent = attendance.filter((a) => a.status === 'absent').length;
    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, percentage };
  }, [attendance]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Attendance Records</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Batches</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Present</p>
              <p className="text-3xl font-bold text-green-600">{stats.present}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Absent</p>
              <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
              <p className="text-3xl font-bold text-blue-600">{stats.percentage}%</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Student</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Username</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Batch</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Time</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length > 0 ? (
                attendance.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {record.student?.profiles?.full_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{record.student?.username}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{record.batch?.name}</td>
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
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No attendance records found for the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
