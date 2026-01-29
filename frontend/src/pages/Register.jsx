import { useState } from 'react';
import { registerUser } from '../api/auth.js';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password };
      const res = await registerUser(payload);
      setSuccess(res.data?.message || 'Registration successful. Redirecting to login…');
      setTimeout(() => navigate('/login'), 600);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to register. Please try again.');
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
            <h2 className="text-3xl font-bold mb-3">Create your account</h2>
            <p className="text-white/90">Join the auction community and start bidding in minutes.</p>
          </div>
        </div>

        {/* Form side */}
        <div className="p-8 md:p-12">
          <div className="md:hidden flex items-center justify-center mb-8">
            <img src={assets.logo} alt="Logo" className="w-36" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Create an account</h1>
          <p className="text-gray-500 mb-8">
            Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Repeat your password"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 text-white font-medium py-3.5 shadow-lg hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating account…' : 'Create account'}
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
