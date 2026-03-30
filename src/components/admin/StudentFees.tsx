import { useState } from 'react';
import { useAppData, StudentWithProfile } from '../../contexts/AppDataContext';
import { IndianRupee, Plus } from 'lucide-react';

export default function StudentFees() {
  const {
    data,
    getStudentFeePlan,
    getFeePaymentsForStudent,
    addFeePayment,
    setStudentFeePlan,
  } = useAppData();
  const students = data.students;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<StudentWithProfile | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [feeType, setFeeType] = useState<'monthly' | 'installment'>('monthly');
  const [notes, setNotes] = useState('');

  const openPay = (s: StudentWithProfile) => {
    setPayModal(s);
    setAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setFeeType('monthly');
    setNotes('');
  };

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModal) return;
    const n = parseFloat(amount);
    if (Number.isNaN(n) || n <= 0) {
      alert('Enter a valid amount.');
      return;
    }
    addFeePayment({
      student_id: payModal.id,
      amount: n,
      payment_date: paymentDate,
      fee_type: feeType,
      notes: notes.trim() || undefined,
    });
    setPayModal(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Student fees</h2>
      <p className="text-gray-600 mb-6 text-sm">
        Set whether each student is on a monthly plan or installments, then record payments.
      </p>

      <div className="space-y-4">
        {students.map((s) => {
          const plan = getStudentFeePlan(s.id);
          const payments = getFeePaymentsForStudent(s.id);
          const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
          const open = expandedId === s.id;

          return (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(open ? null : s.id)}
                className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{s.profiles?.full_name}</p>
                  <p className="text-sm text-gray-500">{s.profiles?.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-gray-600">
                    Plan: <strong>{plan === 'monthly' ? 'Monthly' : 'Installments'}</strong>
                  </span>
                  <span className="flex items-center gap-1 text-green-700 font-medium">
                    <IndianRupee className="w-4 h-4" />
                    {totalPaid.toLocaleString('en-IN')} collected
                  </span>
                </div>
              </button>
              {open && (
                <div className="border-t border-gray-100 px-4 py-4 bg-gray-50/80 space-y-4">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Fee structure</label>
                      <select
                        value={plan}
                        onChange={(e) =>
                          setStudentFeePlan(s.id, e.target.value as 'monthly' | 'installments')
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="installments">Installments</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => openPay(s)}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Record payment
                    </button>
                  </div>
                  {payments.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-200">
                          <th className="pb-2 pr-4">Date</th>
                          <th className="pb-2 pr-4">Amount</th>
                          <th className="pb-2 pr-4">Type</th>
                          <th className="pb-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.id} className="border-b border-gray-100">
                            <td className="py-2 pr-4">{p.payment_date}</td>
                            <td className="py-2 pr-4">₹{p.amount.toLocaleString('en-IN')}</td>
                            <td className="py-2 pr-4 capitalize">{p.fee_type}</td>
                            <td className="py-2 text-gray-600">{p.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-sm text-gray-500">No payments recorded yet.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {students.length === 0 && (
          <p className="text-gray-500 text-center py-12">No students to show.</p>
        )}
      </div>

      {payModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={submitPayment}
            className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Record payment — {payModal.profiles?.full_name}
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                min={1}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment type</label>
              <select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value as 'monthly' | 'installment')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="monthly">Monthly</option>
                <option value="installment">Installment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Receipt #, month covered, etc."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPayModal(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
