'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!email || !password || !confirmPassword) return;

    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain an uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain a lowercase letter.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain a number.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('Password must contain a special character.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong during registration.');
      } else {
        setSuccess(data.message || 'Registration successful! Check your email to confirm.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-layout">
      {/* ── LEFT PANEL ── */}
      <div className="split-left">
        <span className="split-brand">LockBox</span>

        <div className="preview-card">
          <div className="preview-dots">
            <span className="dot dot-green" />
            <span className="dot dot-yellow" />
            <span className="dot dot-red" />
          </div>

          <h2 className="preview-title">Start your journey.</h2>
          <p className="preview-body">
            Create your vault in seconds. Store, autofill, and share
            passwords securely — the way it should be.
          </p>

          <div className="preview-divider" />
          <span className="preview-hint">Create an account to get started</span>
        </div>

        <p className="split-tagline">Already a member? Sign in to your vault.</p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="split-right">
        <div className="form-panel">
          <h1 className="form-heading">Create your account.</h1>

          {error && (
            <div className="status-msg error" id="signup-error">
              {error}
            </div>
          )}
          {success && (
            <div className="status-msg success" id="signup-success">
              {success}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} id="signup-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={submitted && !email ? { borderColor: 'red' } : {}}
              />
              {submitted && !email && <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '6px' }}>This field is missing</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={submitted && !password ? { borderColor: 'red' } : {}}
              />
              {submitted && !password && <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '6px' }}>This field is missing</div>}
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#666' }}>
                <strong style={{ display: 'block', marginBottom: '4px', color: '#1a1a1a' }}>Password requirements:</strong>
                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <li>At least 8 characters</li>
                  <li>Contains uppercase letter</li>
                  <li>Contains lowercase letter</li>
                  <li>Contains number</li>
                  <li>Contains special character</li>
                </ul>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">
                CONFIRM PASSWORD
              </label>
              <input
                id="confirm-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={submitted && !confirmPassword ? { borderColor: 'red' } : {}}
              />
              {submitted && !confirmPassword && <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '6px' }}>This field is missing</div>}
            </div>

            <button
              className="btn-submit"
              type="submit"
              disabled={loading}
              id="btn-signup-submit"
            >
              {loading ? <div className="spinner" /> : 'Create account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link href="/signin" className="auth-link" id="link-goto-signin">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
