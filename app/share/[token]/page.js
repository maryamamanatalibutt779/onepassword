'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function SharedPasswordPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Basic theme setup for public page (defaults to dark or respects system if we wanted, but let's just stick to dark for security vibe)
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.style.backgroundColor = '#000000';

    const fetchShare = async () => {
      try {
        const res = await fetch(`/api/share/${token}`);
        const json = await res.json();
        
        if (res.ok) {
          setData(json);
        } else {
          setError(json.error || 'Failed to load shared password.');
        }
      } catch (err) {
        setError('Network error while loading the shared password.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchShare();
    }
  }, [token]);

  const copyPassword = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', background: '#000000' }}>
        <div className="spinner" style={{ margin: '0 auto 16px auto', width: '32px', height: '32px' }} />
        <p style={{ color: '#888', fontWeight: '500', fontSize: '1rem' }}>Loading secure link...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', background: '#000000', padding: '20px' }}>
        <div style={{ background: '#1a1a1a', border: '1px solid #333', padding: '40px', borderRadius: '16px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ marginBottom: '16px', color: '#666', display: 'flex', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '12px' }}>Link Invalid or Expired</h2>
          <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  const initials = (data.site_name || '?').slice(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', background: '#000000', padding: '20px' }}>
      
      {/* Brand Header */}
      <div style={{ position: 'absolute', top: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: '#3b82f6', color: '#fff', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>
          LB
        </div>
        <span style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-title)', color: '#fff', letterSpacing: '1px' }}>
          LOCKBOX
        </span>
      </div>

      <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '16px', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}>
        {/* Banner */}
        <div style={{ height: '140px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '800', letterSpacing: '2px' }}>{initials}</span>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>{data.site_name}</h2>
            <p style={{ color: '#aaa', fontSize: '0.95rem' }}>Shared securely with you</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Username / Email</label>
              <div style={{ background: '#0d101b', border: '1px solid #333', padding: '14px 16px', borderRadius: '8px', color: '#fff', fontSize: '1rem', wordBreak: 'break-all' }}>
                {data.username}
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Password</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0d101b', border: '1px solid #333', padding: '10px 10px 10px 16px', borderRadius: '8px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#fff', flex: 1 }}>
                  {revealed ? data.password : '••••••••••••••••'}
                </span>
                
                <button 
                  onClick={() => setRevealed(!revealed)} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '4px' }}
                  title={revealed ? 'Hide' : 'Reveal'}
                >
                  {revealed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
                <button 
                  onClick={copyPassword} 
                  style={{ background: copied ? 'var(--success)' : '#333', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            
            {/* URL */}
            {data.site_url && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>URL</label>
                <a href={data.site_url.startsWith('http') ? data.site_url : `https://${data.site_url}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#0d101b', border: '1px solid #333', padding: '14px 16px', borderRadius: '8px', color: 'var(--accent-primary)', fontSize: '0.95rem', textDecoration: 'none', wordBreak: 'break-all' }}>
                  {data.site_url}
                </a>
              </div>
            )}
            
          </div>

          {/* Expiry Warning */}
          <div style={{ marginTop: '32px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: '#fca5a5', fontSize: '0.85rem', margin: 0 }}>
              <strong>⚠️ Warning:</strong> This link is temporary and will expire soon. Make sure you copy what you need.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
