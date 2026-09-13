import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser, registerUser } from '../api/auth';
import { AuthShell } from '../components/layout/AuthShell';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Form';
import { Notice } from '../components/ui/Feedback';

const SignUp = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useContext(AuthContext);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');

    if (form.password !== form.confirmPassword) {
      setError('Those passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password });
      setStatus('Account created. Signing you in…');

      await new Promise((resolve) => setTimeout(resolve, 120));
      await loginUser({ email: form.email, password: form.password });
      await new Promise((resolve) => setTimeout(resolve, 120));
      await refreshProfile();

      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'That account could not be created. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      statement={['One account.', 'Every lot', 'in the room.']}
      note="Bid, consign and follow the ledger from a single place. New accounts start with a balance to bid against."
      footnote="Free to join. Free to register for any lot."
    >
      <p className="label mb-4">Join</p>
      <h2 className="display text-4xl leading-tight text-bone">Create your account.</h2>
      <p className="mt-4 text-sm text-bone-3">
        Already registered?{' '}
        <Link to="/login" className="link-draw text-bone">Sign in</Link>
      </p>

      <form onSubmit={submit} className="mt-10 space-y-6">
        <Field
          label="Name"
          name="name"
          autoComplete="name"
          required
          value={form.name}
          onChange={set('name')}
          placeholder="Your name"
        />
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
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
          />
          <Field
            label="Confirm"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            placeholder="••••••••"
          />
        </div>

        {error && <Notice tone="error">{error}</Notice>}
        {status && <Notice tone="success">{status}</Notice>}

        <Button type="submit" variant="signal" size="block" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-8 text-xs leading-relaxed text-bone-4">
        By continuing you agree to the terms of sale and the privacy policy.
      </p>
    </AuthShell>
  );
};

export default SignUp;
