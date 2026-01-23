import { useContext, useState } from 'react';
import { loginUser } from '../api/auth.js';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await loginUser(form); // POST /login
      if (res.data.user) {
        setUser(res.data.user); 
        setError(false);
        setMessage('Logged in successfully!');
        setTimeout(() => navigate('/', { replace: true }), 1000);
      } else {
        setError(true);
        setMessage('Login failed');
      }
    } catch (err) {
      setError(true);
      setMessage(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            type="submit"
            className="mt-2 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition"
          >
            Login
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              error ? 'text-red-500' : 'text-green-600'
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-sm mt-6">
          Don't have an account?{' '}
          <span
            className="text-purple-600 cursor-pointer hover:underline"
            onClick={() => navigate('/register')}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}
