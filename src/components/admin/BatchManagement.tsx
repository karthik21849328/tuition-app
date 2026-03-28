import { useState } from 'react';
import { useAppData, StudentWithProfile } from '../../contexts/AppDataContext';
import { PlusCircle, CreditCard as Edit, Trash2, X, Users } from 'lucide-react';
import { Batch } from '../../types';

export default function BatchManagement() {
  const { data, addBatch, updateBatch, deleteBatch, setBatchAssignments, getStudentBatchesForBatch } =
    useAppData();
  const batches = data.batches;
  const students = data.students;
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: '',
    days: [] as string[],
  });
  const [assignedStudents, setAssignedStudents] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingBatch) {
        updateBatch(editingBatch.id, {
          name: formData.name,
          start_time: formData.start_time,
          end_time: formData.end_time,
          days: formData.days,
        });
        alert('Batch updated successfully!');
      } else {
        addBatch({
          name: formData.name,
          start_time: formData.start_time,
          end_time: formData.end_time,
          days: formData.days,
        });
        alert('Batch created successfully!');
      }

      setShowModal(false);
      setEditingBatch(null);
      setFormData({
        name: '',
        start_time: '',
        end_time: '',
        days: [],
      });
    } catch (error) {
      console.error('Error saving batch:', error);
      alert('Failed to save batch. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      start_time: batch.start_time,
      end_time: batch.end_time,
      days: batch.days,
    });
    setShowModal(true);
  };

  const handleDelete = (batch: Batch) => {
    if (!confirm(`Are you sure you want to delete ${batch.name}? This action cannot be undone.`)) {
      return;
    }
    deleteBatch(batch.id);
    alert('Batch deleted successfully!');
  };

  const handleAssignStudents = (batch: Batch) => {
    setSelectedBatch(batch);
    setAssignedStudents(getStudentBatchesForBatch(batch.id));
    setShowAssignModal(true);
  };

  const toggleStudentAssignment = (studentId: string) => {
    if (assignedStudents.includes(studentId)) {
      setAssignedStudents(assignedStudents.filter((id) => id !== studentId));
    } else {
      setAssignedStudents([...assignedStudents, studentId]);
    }
  };

  const saveAssignments = () => {
    if (!selectedBatch) return;
    setSubmitting(true);
    try {
      setBatchAssignments(selectedBatch.id, assignedStudents);
      alert('Student assignments saved successfully!');
      setShowAssignModal(false);
      setSelectedBatch(null);
      setAssignedStudents([]);
    } catch (error) {
      console.error('Error saving assignments:', error);
      alert('Failed to save assignments. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBatch(null);
    setFormData({
      name: '',
      start_time: '',
      end_time: '',
      days: [],
    });
  };

  const toggleDay = (day: string) => {
    if (formData.days.includes(day)) {
      setFormData({ ...formData, days: formData.days.filter((d) => d !== day) });
    } else {
      setFormData({ ...formData, days: [...formData.days, day] });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Batch Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create Batch</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.length > 0 ? (
          batches.map((batch) => (
            <div key={batch.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{batch.name}</h3>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  {batch.start_time} - {batch.end_time}
                </p>
                <div className="flex flex-wrap gap-2">
                  {batch.days.map((day) => (
                    <span
                      key={day}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                    >
                      {day.substring(0, 3)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAssignStudents(batch)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition text-sm"
                >
                  <Users className="w-4 h-4" />
                  <span>Assign</span>
                </button>
                <button
                  onClick={() => handleEdit(batch)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(batch)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No batches found. Create your first batch!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingBatch ? 'Edit Batch' : 'Create New Batch'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Evening 5 PM - 6 PM"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
                <div className="grid grid-cols-2 gap-2">
                  {daysOfWeek.map((day) => (
                    <label
                      key={day}
                      className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.days.includes(day)}
                        onChange={() => toggleDay(day)}
                        className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || formData.days.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingBatch ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Assign Students to {selectedBatch.name}</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedBatch(null);
                  setAssignedStudents([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2 mb-6">
              {students.length > 0 ? (
                students.map((student: StudentWithProfile) => (
                  <label
                    key={student.id}
                    className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={assignedStudents.includes(student.id)}
                      onChange={() => toggleStudentAssignment(student.id)}
                      className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{student.profiles?.full_name}</p>
                      <p className="text-xs text-gray-600">{student.username}</p>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No students available</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedBatch(null);
                  setAssignedStudents([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveAssignments}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
