'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // MFA State
  const [showMfa, setShowMfa] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState(null);
  const [mfaCode, setMfaCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!email || !password) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data = null;
      let parseError = null;

      try {
        data = await response.json();
      } catch (err) {
        parseError = err;
      }

      if (!response.ok) {
        const message = data?.error || 'Invalid credentials.';
        setError(message);
      } else if (parseError || !data) {
        setError('The sign-in response was invalid. Please try again.');
      } else {
        // Set session first
        if (data.session) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });

          if (sessionError) {
            console.error('Session sync error:', sessionError.message);
          }
        }

        // Check if user has verified TOTP factors
        const hasMFA = data.user?.factors?.some(f => f.factor_type === 'totp' && f.status === 'verified');

        if (hasMFA) {
          setSuccess('Enter your 2FA code to continue.');
          setShowMfa(true);
          setMfaFactorId(data.user.factors.find(f => f.factor_type === 'totp' && f.status === 'verified').id);
        } else {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 1200);
        }
      }
    } catch (err) {
      console.error('Signin error:', err);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.length !== 6) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.data.id,
        code: mfaCode
      });

      if (verify.error) throw verify.error;

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error('MFA error:', err);
      setError(err.message || 'Invalid 2FA code.');
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
          {/* coloured dots mimicking the reference card accent */}
          <div className="preview-dots">
            <span className="dot dot-green" />
            <span className="dot dot-yellow" />
            <span className="dot dot-red" />
          </div>

          <h2 className="preview-title">Welcome back.</h2>
          <p className="preview-body">
            Your passwords, secured and always within reach — protected the
            right way, shared your way.
          </p>

          <div className="preview-divider" />
          <span className="preview-hint">Sign in to continue</span>
        </div>

        <p className="split-tagline">New here? Your vault is waiting to be set up.</p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="split-right">
        <div className="form-panel">
          <h1 className="form-heading">
            {showMfa ? 'Two-Factor Authentication' : 'Sign in to LockBox.'}
          </h1>

          {error && (
            <div className="status-msg error" id="signin-error">
              {error}
            </div>
          )}
          {success && (
            <div className="status-msg success" id="signin-success" style={{ color: '#000000' }}>
              {success}
            </div>
          )}

          {!showMfa ? (
            <form className="auth-form" onSubmit={handleSubmit} id="signin-form" noValidate>
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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={submitted && !password ? { borderColor: 'red' } : {}}
                />
                {submitted && !password && <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '6px' }}>This field is missing</div>}
              </div>

              <button
                className="btn-submit"
                type="submit"
                disabled={loading}
                id="btn-signin-submit"
              >
                {loading ? <div className="spinner" /> : 'Sign in'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleMfaSubmit} id="mfa-form" noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="mfa-code">
                  AUTHENTICATOR CODE
                </label>
                <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '12px' }}>
                  Enter the 6-digit code from your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <input
                  id="mfa-code"
                  type="text"
                  className="form-input"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ fontSize: '1.4rem', letterSpacing: '8px', textAlign: 'center', fontFamily: 'monospace' }}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>

              <button
                className="btn-submit"
                type="submit"
                disabled={loading || mfaCode.length !== 6}
                id="btn-mfa-submit"
              >
                {loading ? <div className="spinner" /> : 'Verify & Sign In'}
              </button>
            </form>
          )}

          {!showMfa && (
            <p className="auth-footer">
              New to LockBox?{' '}
              <Link href="/signup" className="auth-link" id="link-goto-signup">
                Create an account
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
