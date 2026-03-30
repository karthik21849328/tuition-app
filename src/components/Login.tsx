import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { SignInRole } from '../contexts/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SignInRole>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password, role);
    } catch {
      setError('Could not sign in. Enter any email and password.');
    } finally {
      setLoading(false);
    }
  };

  const roleBtn = (r: SignInRole, label: string) => (
    <button
      type="button"
      onClick={() => setRole(r)}
      className={`flex-1 py-2.5 text-sm font-medium transition ${
        role === r ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
      } ${r !== 'student' ? 'border-l border-gray-300' : ''}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Joshi Tuotrials</h1>
          <p className="text-gray-600 mt-2">Sign in (demo: any email and password)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">I am signing in as</span>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {roleBtn('student', 'Student')}
              {roleBtn('teacher', 'Teacher')}
              {roleBtn('admin', 'Admin')}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Chooses your dashboard. Teachers can use the email saved in Teachers (e.g. teacher@demo.com).
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="e.g. student@demo.com or teacher@demo.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Any password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
