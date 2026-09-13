import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../api/auth';
import { AuthShell } from '../components/layout/AuthShell';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Form';
import { Notice } from '../components/ui/Feedback';

const AdminSignIn = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await loginAdmin(form);
      const adminUser = res.data?.user || { email: form.email, name: 'Admin', role: 'admin' };
      localStorage.setItem('adminToken', 'admin-session');
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Those credentials were not accepted.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      statement={['The room', 'behind', 'the room.']}
      note="Settlement, consignments and accounts. Restricted to authorised staff."
      footnote="All actions here are logged against your account."
    >
      <p className="label mb-4">Staff access</p>
      <h2 className="display text-4xl leading-tight text-bone">Administration.</h2>
      <p className="mt-4 text-sm text-bone-3">Sign in with your staff credentials.</p>

      <form onSubmit={submit} className="mt-10 space-y-6">
        <Field
          label="Staff email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={set('email')}
          placeholder="admin@livebid.test"
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={set('password')}
          placeholder="••••••••"
        />

        {error && <Notice tone="error">{error}</Notice>}

        <Button type="submit" variant="signal" size="block" disabled={submitting}>
          {submitting ? 'Verifying…' : 'Enter console'}
        </Button>
      </form>
    </AuthShell>
  );
};

export default AdminSignIn;
