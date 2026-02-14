import { useState, useContext } from 'react';
import { registerUser, loginUser } from '../api/auth.js';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { assets } from '../assets/assets';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useContext(AuthContext);

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
      await registerUser(payload);
      setSuccess('User registered successfully. Logging you in...');
      
      await new Promise((r) => setTimeout(r, 120));
      await loginUser({ email: form.email, password: form.password });
      
      await new Promise((r) => setTimeout(r, 120));
      await refreshProfile();
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Floating Background Bubbles */}
      <div className="floating-bubble bubble-1"></div>
      <div className="floating-bubble bubble-2"></div>
      <div className="floating-bubble bubble-3"></div>

      <div className="register-card w-full max-w-5xl grid md:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">
        {/* Visual / Brand side */}
        <div className="brand-side relative hidden md:flex items-center justify-center p-8">
          <div className="absolute inset-0 opacity-10">
            <img src={assets.hero_img} alt="Auction" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 text-white text-center max-w-sm">
            <img src={assets.logo} alt="Logo" className="mx-auto mb-6 w-40 drop-shadow-2xl" />
            <h2 className="text-4xl font-black mb-4 drop-shadow-lg">Create your account</h2>
            <p className="text-white/90 text-lg font-medium">Join the auction community and start bidding in minutes.</p>
            <div className="mt-8 flex justify-center space-x-2">
              <div className="w-3 h-3 bg-white rounded-full opacity-50"></div>
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <div className="w-3 h-3 bg-white rounded-full opacity-50"></div>
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="p-8 md:p-12">
          <div className="md:hidden flex items-center justify-center mb-8">
            <img src={assets.logo} alt="Logo" className="w-36" />
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Create an account
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            Already have an account? <Link to="/login" className="link-hover text-indigo-600 hover:text-indigo-700 font-bold">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={handleChange}
                className="input-field w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                className="input-field w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                className="input-field w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className="input-field w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Repeat your password"
              />
            </div>

            {error && (
              <div className="rounded-xl border-2 border-red-200 bg-red-50 text-red-700 px-5 py-4 text-sm font-semibold flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 px-5 py-4 text-sm font-semibold flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path className="success-checkmark" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="submit-btn w-full text-white font-bold py-4 shadow-xl hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed rounded-xl relative overflow-hidden"
            >
              <span className="relative z-10">
                {submitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating account…</span>
                  </span>
                ) : 'Create account'}
              </span>
            </button>

            <div className="text-center text-sm text-gray-500 font-medium">
              By continuing you agree to our <span className="underline cursor-pointer hover:text-indigo-600">Terms</span> and <span className="underline cursor-pointer hover:text-indigo-600">Privacy</span>.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}