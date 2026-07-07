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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid credentials.');
      } else {
        setSuccess('Login successful! Redirecting...');
        
        // Sync local Supabase client session if session data is present
        if (data.session) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
          
          if (sessionError) {
            console.error('Session sync error:', sessionError.message);
          }
        }

        // Redirect to dashboard after a short delay to display success state
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1200);
      }
    } catch (err) {
      console.error('Signin error:', err);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <header className="auth-header">
          <div className="logo-wrapper">
            <span className="logo-icon">One Password</span>
          </div>
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-subtitle">Welcome back! Sign in to access your vault</p>
        </header>

        {error && <div className="status-msg error" id="signin-error">{error}</div>}
        {success && <div className="status-msg success" id="signin-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit} id="signin-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-container">
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-container">
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button className="btn-submit" type="submit" disabled={loading} id="btn-signin-submit">
            {loading ? <div className="spinner"></div> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? 
          <Link href="/signup" className="auth-link" id="link-goto-signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
