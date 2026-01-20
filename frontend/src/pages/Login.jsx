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
      console.log(res.data)
      setToken(res.data.token); // save JWT
      setTokenState(res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (

    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Login</button>
      <p>{error}</p>
      <p>Don't have an account? <span onClick={() => navigate('/register')} style={{color:'blue', cursor:'pointer'}}>Register here</span></p>
      {message}
    </form>
  );
}
