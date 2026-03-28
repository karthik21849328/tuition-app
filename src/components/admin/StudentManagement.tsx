import { useState } from 'react';
import { useAppData, StudentWithProfile } from '../../contexts/AppDataContext';
import { UserPlus, CreditCard as Edit, Trash2, X } from 'lucide-react';

export default function StudentManagement() {
  const { data, addStudent, updateStudent, deleteStudent } = useAppData();
  const students = data.students;
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    parent_phone: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingStudent) {
        updateStudent(editingStudent.id, {
          full_name: formData.full_name,
          phone: formData.phone,
          parent_phone: formData.parent_phone,
          address: formData.address,
        });
        alert('Student updated successfully!');
      } else {
        const { username, password } = addStudent({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          parent_phone: formData.parent_phone,
          address: formData.address,
        });
        alert(
          `Student added successfully!\nUsername: ${username}\nPassword: ${password}\n\n(Data is stored locally in this browser only.)`
        );
      }

      setShowModal(false);
      setEditingStudent(null);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        parent_phone: '',
        address: '',
      });
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Failed to save student. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (student: StudentWithProfile) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.profiles?.full_name || '',
      email: student.profiles?.email || '',
      phone: student.phone || '',
      parent_phone: student.parent_phone || '',
      address: student.address || '',
    });
    setShowModal(true);
  };

  const handleDelete = (student: StudentWithProfile) => {
    if (
      !confirm(
        `Are you sure you want to delete ${student.profiles?.full_name}? This action cannot be undone.`
      )
    ) {
      return;
    }
    deleteStudent(student.id);
    alert('Student deleted successfully!');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      parent_phone: '',
      address: '',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Student</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Username</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{student.profiles?.full_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{student.username}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{student.profiles?.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{student.phone || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No students found. Add your first student!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                  disabled={!!editingStudent}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone</label>
                <input
                  type="tel"
                  value={formData.parent_phone}
                  onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                />
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
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingStudent ? 'Update' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
