'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push('/signin');
      } else {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="auth-wrapper" style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px auto', width: '32px', height: '32px' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Decrypting Vault...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="auth-wrapper dashboard-card" style={{ maxWidth: '800px' }}>
      <div className="auth-card" style={{ padding: '32px' }}>
        <header className="auth-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="logo-wrapper" style={{ justifyContent: 'flex-start', marginBottom: '4px' }}>
              <span className="logo-icon">One Password</span>
            </div>
            <p className="auth-subtitle" style={{ fontSize: '0.85rem' }}>Secure Credentials Manager</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link href="/signin" className="btn-secondary" id="btn-go-back" style={{ padding: '10px 18px', fontSize: '0.85rem', textDecoration: 'none' }}>
              Back to Sign In
            </Link>
            <button className="btn-secondary" onClick={handleSignOut} id="btn-signout" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              Lock Vault
            </button>
          </div>
        </header>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>
            Welcome back,
          </h2>
          <p style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '1.1rem', wordBreak: 'break-all' }}>
            {user.email}
          </p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-card)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>
              Saved Passwords
            </h3>
            <p style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              0
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-card)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>
              Security Score
            </h3>
            <p style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>
              100%
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-card)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>
              Biometrics
            </h3>
            <p style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent-secondary)', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Ready (Webcam)
            </p>
          </div>
        </div>

        <div style={{ border: '1px dashed var(--border-card)', borderRadius: '16px', padding: '40px 20px', textAlign: 'center' }}>
          <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>
            Your vault is empty
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '340px', margin: '0 auto 20px auto' }}>
            No credentials saved yet. Add password entries, certificates, or keys to keep them encrypted.
          </p>
          <button className="btn-submit" style={{ display: 'inline-flex', margin: '0 auto', padding: '10px 24px' }}>
            + Add Password
          </button>
        </div>
      </div>
    </div>
  );
}
