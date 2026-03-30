import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { LogOut, BookOpen, Calendar, Save } from 'lucide-react';

export default function TeacherDashboard() {
  const { profile, signOut, user } = useAuth();
  const { getBatchesForTeacher, getClassSession, upsertClassSession, data } = useAppData();

  const batches = useMemo(
    () => (user ? getBatchesForTeacher(user.id) : []),
    [user, getBatchesForTeacher, data.batchTeachers, data.batches]
  );

  const [batchId, setBatchId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [concept, setConcept] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (batches.length && !batchId) {
      setBatchId(batches[0].id);
    }
  }, [batches, batchId]);

  const selectedBatch = batches.find((b) => b.id === batchId);

  useEffect(() => {
    if (!user || !batchId) return;
    const existing = getClassSession(batchId, user.id, date);
    if (existing) {
      setStartTime(existing.start_time);
      setEndTime(existing.end_time);
      setConcept(existing.concept_taught);
      setRemarks(existing.remarks ?? '');
    } else if (selectedBatch) {
      setStartTime(selectedBatch.start_time);
      setEndTime(selectedBatch.end_time);
      setConcept('');
      setRemarks('');
    }
  }, [batchId, date, user, getClassSession, selectedBatch]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !batchId || !concept.trim()) {
      alert('Select a batch, date, and enter what was taught today.');
      return;
    }
    setSaving(true);
    try {
      upsertClassSession({
        batch_id: batchId,
        teacher_id: user.id,
        date,
        start_time: startTime,
        end_time: endTime,
        concept_taught: concept.trim(),
        remarks: remarks.trim() || undefined,
      });
      alert('Class log saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Joshi Tuotrials</h1>
            <p className="text-sm text-gray-500">Teacher portal</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{profile?.full_name}</span>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {batches.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-600">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p>No batches assigned to you yet. Ask an admin to assign you to a batch.</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Class log (batch & day)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Concept taught today <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Quadratic equations — completing the square"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Homework, behaviour notes, etc."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save class log'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
