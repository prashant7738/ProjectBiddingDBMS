import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { assets } from '../assets/assets';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { refreshProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await loginUser(form);
      console.log('Login response:', res.data);
      // Small delay to ensure cookies are committed
      await new Promise((r) => setTimeout(r, 120));
      await refreshProfile();
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Visual / Brand side */}
        <div className="relative hidden md:flex items-center justify-center bg-linear-to-r from-purple-500 to-indigo-600 p-8">
          <div className="absolute inset-0 opacity-20">
            <img src={assets.hero_img} alt="Auction" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 text-white text-center max-w-sm">
            <img src={assets.logo} alt="Logo" className="mx-auto mb-6 w-40" />
            <h2 className="text-3xl font-bold mb-3">Welcome back</h2>
            <p className="text-white/90">Sign in to continue bidding, track your items, and see your wins.</p>
          </div>
        </div>

        {/* Form side */}
        <div className="p-8 md:p-12">
          <div className="md:hidden flex items-center justify-center mb-8">
            <img src={assets.logo} alt="Logo" className="w-36" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Sign in to your account</h1>
          <p className="text-gray-500 mb-8">
            New here? <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">Create an account</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 text-white font-medium py-3.5 shadow-lg hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="text-center text-sm text-gray-500">
              By continuing you agree to our <span className="underline">Terms</span> and <span className="underline">Privacy</span>.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
