import { useState, useEffect } from 'react';
import { useAppData, StudentWithProfile } from '../../contexts/AppDataContext';
import { ClipboardCheck } from 'lucide-react';

export default function AdminMarkAttendance() {
  const { data, getStudentBatchesForBatch, setAttendanceRecord } = useAppData();
  const [batchId, setBatchId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const batches = data.batches;

  useEffect(() => {
    if (batches.length && !batchId) {
      setBatchId(batches[0].id);
    }
  }, [batches, batchId]);

  const studentIds = batchId ? getStudentBatchesForBatch(batchId) : [];
  const students: StudentWithProfile[] = studentIds
    .map((id) => data.students.find((s) => s.id === id))
    .filter((s): s is StudentWithProfile => !!s);

  const getStatus = (studentId: string) => {
    const row = data.attendance.find(
      (a) => a.student_id === studentId && a.batch_id === batchId && a.date === date
    );
    return row?.status ?? null;
  };

  const setStatus = (studentId: string, status: 'present' | 'absent') => {
    if (!batchId) return;
    setAttendanceRecord(studentId, batchId, date, status);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <ClipboardCheck className="w-7 h-7 text-blue-600" />
        Mark attendance
      </h2>
      <p className="text-gray-600 mb-6 text-sm">
        Choose a batch and date, then mark each student present or absent.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {!batchId ? (
        <p className="text-gray-500 text-sm">Select a batch to load students.</p>
      ) : students.length === 0 ? (
        <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-lg p-4">
          No students assigned to this batch. Assign students under Batches first.
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Username</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const st = getStatus(s.id);
                return (
                  <tr key={s.id} className="border-t border-gray-100">
                    <td className="py-3 px-4 text-gray-900">{s.profiles?.full_name}</td>
                    <td className="py-3 px-4 text-gray-600">{s.username}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setStatus(s.id, 'present')}
                          className={`px-3 py-1.5 text-xs font-medium ${
                            st === 'present'
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-green-50'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(s.id, 'absent')}
                          className={`px-3 py-1.5 text-xs font-medium border-l border-gray-200 ${
                            st === 'absent'
                              ? 'bg-red-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-red-50'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
