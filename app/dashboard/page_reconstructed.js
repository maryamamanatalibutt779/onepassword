'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const EMPTY_FORM = { site_name: '', site_url: '', username: '', password: '' };

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const [passwords, setPasswords] = useState([]);
  const [vaultLoading, setVaultLoading] = useState(true);
  const [vaultError, setVaultError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [revealedId, setRevealedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
      } else {
        setUser(session.user);
        setToken(session.access_token);
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push('/signin');
      } else {
        setUser(session.user);
        setToken(session.access_token);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (token) fetchPasswords(token);
  }, [token]);

  const fetchPasswords = async (authToken) => {
    setVaultLoading(true);
    setVaultError('');
    try {
      const res = await fetch('/api/passwords', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load your vault.');
      setPasswords(json.passwords);
    } catch (err) {
      setVaultError(err.message);
    } finally {
      setVaultLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
    router.refresh();
  };

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setVaultError('');
    setShowForm(true);
  };

  const openEditForm = (entry) => {
    setForm({
      site_name: entry.site_name,
      site_url: entry.site_url || '',
      username: entry.username,
      password: entry.password,
    });
    setEditingId(entry.id);
    setVaultError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setVaultError('');
    try {
      const url = editingId ? `/api/passwords/${editingId}` : '/api/passwords';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not save this entry.');

      closeForm();
      fetchPasswords(token);
    } catch (err) {
      setVaultError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this password? This cannot be undone.')) return;
    setVaultError('');
    try {
      const res = await fetch(`/api/passwords/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not delete this entry.');
      setPasswords((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setVaultError(err.message);
    }
  };

  const handleCopy = (id, password) => {
    navigator.clipboard.writeText(password);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
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
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px', alignItems: 'start', marginBottom: '32px' }}>
          <section style={{ background: '#f8fafc', border: '1px solid var(--border-card)', borderRadius: '24px', padding: '30px 28px', minWidth: 0 }}>
            <div className="logo-wrapper" style={{ justifyContent: 'flex-start', marginBottom: '8px' }}>
              <span className="logo-icon" style={{ background: 'none', color: '#111827' }}>One Password</span>
            </div>
            <p className="auth-subtitle" style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: '24px' }}>
              Secure Credentials Manager
            </p>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', fontWeight: '700', marginBottom: '10px', color: '#111827' }}>
              Welcome back,
            </h2>
            <p style={{ color: '#111827', fontWeight: '600', fontSize: '1rem', wordBreak: 'break-all' }}>
              {user.email}
            </p>
          </section>

          <section style={{ background: '#ffffff', border: '1px solid var(--border-card)', borderRadius: '24px', padding: '28px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              type="button"
              onClick={openAddForm}
              className="btn-submit"
              style={{ width: '100%', padding: '14px 18px', background: '#10b981', border: '1px solid #10b981', color: '#ffffff' }}
            >
              + Add Password
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              style={{ width: '100%', padding: '14px 18px', background: '#111827', color: '#ffffff', border: '1px solid #111827', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Sign out
            </button>
          </section>
        </div>

        {vaultError && (
          <div style={{
            background: 'rgba(220,80,80,0.1)',
            border: '1px solid rgba(220,80,80,0.4)',
            color: '#e8a6a7',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            marginBottom: '24px',
          }}>
            {vaultError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid var(--border-card)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>
              Saved Passwords
            </h3>
            <p style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {vaultLoading ? '—' : passwords.length}
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid var(--border-card)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>
              Security Score
            </h3>
            <p style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>
              100%
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid var(--border-card)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>
              Biometrics
            </h3>
            <p style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent-secondary)', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Ready (Webcam)
            </p>
          </div>
        </div>

        {/* Add / Edit form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-card)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
            }}
          >
            <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px' }}>
              {editingId ? 'Edit entry' : 'New entry'}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Site name
                <input
                  required
                  value={form.site_name}
                  onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                  placeholder="e.g. GitHub"
                  className="input-field"
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Site URL
                <input
                  value={form.site_url}
                  onChange={(e) => setForm({ ...form, site_url: e.target.value })}
                  placeholder="https://github.com"
                  className="input-field"
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Username or email
                <input
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="you@example.com"
                  className="input-field"
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Password
                <input
                  required
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Stored encrypted"
                  className="input-field"
                />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={closeForm} disabled={saving} style={{ padding: '10px 20px' }}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={saving} style={{ padding: '10px 20px' }}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Save entry'}
              </button>
            </div>
          </form>
        )}

        {/* Vault list or empty state */}
        {vaultLoading ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>Loading your vault…</p>
        ) : passwords.length === 0 ? (
          <div style={{ border: '1px dashed var(--border-card)', borderRadius: '16px', padding: '40px 20px', textAlign: 'center' }}>
            <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>
              Your vault is empty
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '340px', margin: '0 auto 20px auto' }}>
              No credentials saved yet. Add password entries, certificates, or keys to keep them encrypted.
            </p>
            <button className="btn-submit" onClick={openAddForm} style={{ display: 'inline-flex', margin: '0 auto', padding: '10px 24px' }}>
              + Add Password
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button className="btn-submit" onClick={openAddForm} style={{ padding: '10px 20px' }}>
                + Add Password
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {passwords.map((entry) => {
                const revealed = revealedId === entry.id;
                return (
                  <div
                    key={entry.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid var(--border-card)',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: '1 1 160px', minWidth: '140px' }}>
                      <p style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '2px' }}>
                        {entry.site_name}
                      </p>
                      {entry.site_url && (
                        <a
                          href={entry.site_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none' }}
                        >
                          {entry.site_url}
                        </a>
                      )}
                    </div>

                    <div style={{ flex: '1 1 180px', minWidth: '160px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      <div style={{ color: 'var(--text-primary)', marginBottom: '2px' }}>{entry.username}</div>
                      <div style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                        {revealed ? entry.password : '••••••••••••'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '7px 12px', fontSize: '0.75rem' }}
                        onClick={() => setRevealedId(revealed ? null : entry.id)}
                      >
                        {revealed ? 'Hide' : 'Reveal'}
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '7px 12px', fontSize: '0.75rem' }}
                        onClick={() => handleCopy(entry.id, entry.password)}
                      >
                        {copiedId === entry.id ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '7px 12px', fontSize: '0.75rem' }}
                        onClick={() => openEditForm(entry)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '7px 12px', fontSize: '0.75rem', color: '#e08a8c' }}
                        onClick={() => handleDelete(entry.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}