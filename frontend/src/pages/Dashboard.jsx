import { useEffect, useState } from 'react';
import { getProfile } from '../api/auth.js';

export default function Dashboard({ token }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) return;
    getProfile(token)
      .then(res => setUser(res.data.user))
      .catch(err => console.error(err));
  }, [token]);

  if (!token) return <p>Please login to access dashboard</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Welcome, {user.id}</h2>
      <p>Role: {user.role}</p>
    </div>
  );
}
