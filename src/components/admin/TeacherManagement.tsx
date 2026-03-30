import { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { UserPlus, CreditCard as Edit, Trash2, X } from 'lucide-react';
import type { Teacher } from '../../types';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  education_qualification: '',
  salary_type: 'monthly' as 'monthly' | 'yearly',
  salary_amount: '',
  active: true,
};

export default function TeacherManagement() {
  const { data, addTeacher, updateTeacher, deleteTeacher } = useAppData();
  const teachers = data.teachers;
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    setForm({
      name: t.name,
      email: t.email,
      phone: t.phone,
      address: t.address,
      education_qualification: t.education_qualification,
      salary_type: t.salary_type,
      salary_amount: String(t.salary_amount),
      active: t.active,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.salary_amount);
    if (Number.isNaN(amount) || amount < 0) {
      alert('Enter a valid salary amount.');
      return;
    }
    if (editing) {
      updateTeacher(editing.id, {
        name: form.name,
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        address: form.address,
        education_qualification: form.education_qualification,
        salary_type: form.salary_type,
        salary_amount: amount,
        active: form.active,
      });
    } else {
      addTeacher({
        name: form.name,
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        address: form.address,
        education_qualification: form.education_qualification,
        salary_type: form.salary_type,
        salary_amount: amount,
        active: form.active,
      });
    }
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleDelete = (t: Teacher) => {
    if (!confirm(`Remove teacher ${t.name}? Assignments and class logs for this teacher will be unlinked.`)) {
      return;
    }
    deleteTeacher(t.id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Teachers</h2>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <UserPlus className="w-5 h-5" />
          Add teacher
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Qualification</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Salary</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{t.name}</td>
                  <td className="py-3 px-4 text-gray-600">{t.email}</td>
                  <td className="py-3 px-4 text-gray-600">{t.phone || '—'}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-[180px] truncate" title={t.education_qualification}>
                    {t.education_qualification || '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    ₹{t.salary_amount.toLocaleString('en-IN')} / {t.salary_type}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {t.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(t)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No teachers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{editing ? 'Edit teacher' : 'New teacher'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (for teacher login)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education qualification</label>
                <input
                  value={form.education_qualification}
                  onChange={(e) => setForm({ ...form, education_qualification: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. B.Ed, M.Sc Mathematics"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary type</label>
                  <select
                    value={form.salary_type}
                    onChange={(e) =>
                      setForm({ ...form, salary_type: e.target.value as 'monthly' | 'yearly' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={form.salary_amount}
                    onChange={(e) => setForm({ ...form, salary_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              {editing && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Active (can log in)</span>
                </label>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editing ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
