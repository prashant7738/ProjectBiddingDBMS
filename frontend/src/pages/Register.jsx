import { useState } from 'react';
import { registerUser } from '../api/auth.js';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const {setMessage,message} = useContext(AuthContext)
  const navigate = useNavigate()
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await registerUser(form);
      setMessage(res.data.message);
      if(res.data) navigate('/login')
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className=''>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="email" placeholder="Email" type="email" onChange={handleChange} />
      <input name="password" placeholder="Password" type="password" onChange={handleChange} />
      <button type="submit">Register</button>
        <p className=''>{message}</p>
    </form>
  );
}
