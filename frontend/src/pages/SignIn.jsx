import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../api/auth';
import { AuthShell } from '../components/layout/AuthShell';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Form';
import { Notice } from '../components/ui/Feedback';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile, setUser } = useContext(AuthContext);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await loginUser(form);
      // Give the auth cookie a beat to land before the profile probe.
      await new Promise((resolve) => setTimeout(resolve, 120));
      const ok = await refreshProfile();
      if (!ok) {
        const fallbackName = res.data?.user?.name || res.data?.name || form.email.split('@')[0];
        setUser({ name: fallbackName, email: form.email });
      }
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Those details did not match an account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      statement={['Take a paddle.', 'Watch the clock.', 'Win the lot.']}
      note="Your bids, watchlist and consignments live in one account. Registration for any individual lot stays free."
      footnote="Bids are binding and public."
    >
      <p className="label mb-4">Sign in</p>
      <h2 className="display text-4xl leading-tight text-bone">Welcome back.</h2>
      <p className="mt-4 text-sm text-bone-3">
        New here?{' '}
        <Link to="/register" className="link-draw text-bone">Create an account</Link>
      </p>

      <form onSubmit={submit} className="mt-10 space-y-6">
        <Field
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={set('email')}
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={set('password')}
          placeholder="••••••••"
        />

        {error && <Notice tone="error">{error}</Notice>}

        <Button type="submit" variant="signal" size="block" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-8 text-xs leading-relaxed text-bone-4">
        By continuing you agree to the terms of sale and the privacy policy.
      </p>
    </AuthShell>
  );
};

export default SignIn;
