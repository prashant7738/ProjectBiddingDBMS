import { useContext, useState } from 'react';
import { loginUser } from '../api/auth.js';
import { setToken } from '../utils/auth.js';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const {setTokenState,message} = useContext(AuthContext)
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      setToken(res.data.token); // save JWT
      setTokenState(res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className=' h-[100vh] flex items-center justify-center'>
      <div className='w-75 h-100 bg-red-400 rounded-2xl p-4 flex '>
    <form onSubmit={handleSubmit} className='flex flex-col gap-10'>
      <h1 className='text-center font-bold text-2xl '>Login</h1>
      <div className='flex flex-col gap-6'>
      <input name="email" type="email" placeholder="Email" onChange={handleChange} required className='outline-none px-2 bg-blue-200 rounded-[5px] h-10  w-full ' />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required className='outline-none px-2 bg-blue-200 rounded-[5px] h-10  w-full' /></div>
      <button type="submit" className='w-14 h-10 bg-amber-400 rounded-[5px] mx-auto font-medium hover:bg-black hover:text-white'>Login</button>
      <p>{error}</p>
      <p className=''>Don't have an account? <span onClick={() => navigate('/register')} style={{color:'blue', cursor:'pointer'}}>Register here</span></p>
      {message}
    </form></div>
    </div>
  );
}
