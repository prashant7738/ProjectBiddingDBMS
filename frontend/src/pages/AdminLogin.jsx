import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      // TODO: Replace with actual admin login API call
      // const res = await loginAdmin(form);
      
      // For now, simulate admin login
      if (form.email === 'admin@auction.com' && form.password === 'admin123') {
        localStorage.setItem('adminToken', 'admin-token-placeholder');
        localStorage.setItem('adminUser', JSON.stringify({ 
          email: form.email, 
          name: 'Admin', 
          role: 'admin' 
        }));
        navigate('/admin/dashboard');
      } else {
        setError('Invalid admin credentials');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <style>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0.6;
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.6);
          }
        }
        .floating-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(168, 85, 247, 0.5);
          border-radius: 50%;
          animation: float-particle 6s ease-in-out infinite;
        }
        .particle-1 {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }
        .particle-2 {
          top: 40%;
          right: 15%;
          animation-delay: 1s;
        }
        .particle-3 {
          bottom: 30%;
          left: 20%;
          animation-delay: 2s;
        }
        .particle-4 {
          top: 60%;
          right: 25%;
          animation-delay: 3s;
        }
        .particle-5 {
          bottom: 20%;
          right: 40%;
          animation-delay: 4s;
        }
        .admin-card {
          animation: slide-up 0.6s ease-out;
        }
        .admin-shield {
          animation: glow-pulse 3s ease-in-out infinite;
        }
        .input-field {
          transition: all 0.3s ease;
        }
        .input-field:focus {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(168, 85, 247, 0.2);
        }
        .submit-btn {
          background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
          background-size: 200% 200%;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        .submit-btn:hover::before {
          width: 400px;
          height: 400px;
        }
        .submit-btn:hover {
          background-position: 100% 0;
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(168, 85, 247, 0.5);
        }
        .submit-btn:active {
          transform: translateY(-1px);
        }
        .grid-bg {
          background-image: 
            linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: shimmer 20s linear infinite;
        }
      `}</style>

      {/* Animated Grid Background */}
      <div className="grid-bg absolute inset-0 opacity-20"></div>

      {/* Floating Particles */}
      <div className="floating-particle particle-1"></div>
      <div className="floating-particle particle-2"></div>
      <div className="floating-particle particle-3"></div>
      <div className="floating-particle particle-4"></div>
      <div className="floating-particle particle-5"></div>

      <div className="admin-card w-full max-w-md bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-purple-500/30">
        {/* Header */}
        <div className="px-8 py-8 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-slate-800/50 text-center">
          <div className="admin-shield inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Admin Portal
          </h1>
          <p className="text-purple-300 font-semibold">Secure Authentication Required</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-purple-300 mb-2 uppercase tracking-wide">
                Admin Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="input-field w-full rounded-xl border-2 border-purple-500/30 bg-slate-700/50 text-white px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-400"
                  placeholder="admin@auction.com"
                />
                <svg className="absolute right-4 top-4 w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-purple-300 mb-2 uppercase tracking-wide">
                Admin Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="input-field w-full rounded-xl border-2 border-purple-500/30 bg-slate-700/50 text-white px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-400"
                  placeholder="••••••••"
                />
                <svg className="absolute right-4 top-4 w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border-2 border-red-400/50 bg-red-900/30 text-red-300 px-5 py-4 text-sm font-semibold flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
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
                    <span>Authenticating…</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>Secure Login</span>
                  </span>
                )}
              </span>
            </button>

            <div className="text-center text-xs text-purple-400 font-medium">
              <p className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>This area is restricted to authorized personnel only</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}