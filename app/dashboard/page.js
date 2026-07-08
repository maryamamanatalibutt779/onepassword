'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/* ─── helpers ─────────────────────────────────────────────────────── */
async function getAuthHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return { Authorization: `Bearer ${session.access_token}` };
}

/* ─── Modal Component ─────────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>{title}</h3>
          <button
            onClick={onClose}
            style={styles.closeBtn}
            id="btn-close-modal"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Password Form ───────────────────────────────────────────────── */
function PasswordForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    site_name: initial.site_name || '',
    site_url: initial.site_url || '',
    username: initial.username || '',
    password: initial.password || '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} style={{ gap: '16px' }}>
      <div className="form-group">
        <label className="form-label" htmlFor="field-site-name">
          Site Name *
        </label>
        <div className="input-container">
          <input
            id="field-site-name"
            name="site_name"
            className="form-input"
            placeholder="e.g. GitHub"
            value={form.site_name}
            onChange={handleChange}
            required
            autoComplete="off"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="field-site-url">
          URL
        </label>
        <div className="input-container">
          <input
            id="field-site-url"
            name="site_url"
            className="form-input"
            placeholder="https://github.com"
            value={form.site_url}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="field-username">
          Username / Email *
        </label>
        <div className="input-container">
          <input
            id="field-username"
            name="username"
            className="form-input"
            placeholder="user@example.com"
            value={form.username}
            onChange={handleChange}
            required
            autoComplete="off"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="field-password">
          Password *
        </label>
        <div className="input-container" style={{ position: 'relative' }}>
          <input
            id="field-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            className="form-input"
            placeholder="••••••••••••"
            value={form.password}
            onChange={handleChange}
            required={!initial.id}
            autoComplete="new-password"
            style={{ paddingRight: '48px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            id="btn-toggle-password-visibility"
            style={{
              position: 'absolute',
              right: '14px',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0',
              lineHeight: 1,
            }}
            aria-label="Toggle password visibility"
          >
            {showPassword ? '🔒' : '👁'}
          </button>
        </div>
        {initial.id && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Leave blank to keep the existing password.
          </p>
        )}
      </div>

      <button
        type="submit"
        className="btn-submit"
        id="btn-save-password"
        disabled={loading}
        style={{ marginTop: '8px' }}
      >
        {loading ? <span className="spinner" /> : initial.id ? 'Update Password' : 'Save Password'}
      </button>
    </form>
  );
}

/* ─── Password Card ───────────────────────────────────────────────── */
function PasswordCard({ entry, onEdit, onDelete }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyPassword = async () => {
    await navigator.clipboard.writeText(entry.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = (entry.site_name || '?').slice(0, 2).toUpperCase();

  return (
    <div style={styles.card}>
      {/* Site avatar */}
      <div style={styles.cardAvatar}>
        <span style={styles.cardAvatarText}>{initials}</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={styles.cardSiteName}>{entry.site_name}</p>
        {entry.site_url && (
          <a
            href={entry.site_url.startsWith('http') ? entry.site_url : `https://${entry.site_url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.cardUrl}
          >
            {entry.site_url}
          </a>
        )}
        <p style={styles.cardUsername}>{entry.username}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
          <span style={styles.cardPassword}>
            {revealed ? entry.password : '••••••••••••'}
          </span>
          <button
            onClick={() => setRevealed((v) => !v)}
            style={styles.iconBtn}
            id={`btn-reveal-${entry.id}`}
            title={revealed ? 'Hide password' : 'Reveal password'}
          >
            {revealed ? '🔒' : '👁'}
          </button>
          <button
            onClick={copyPassword}
            style={{ ...styles.iconBtn, color: copied ? 'var(--success)' : 'var(--text-secondary)' }}
            id={`btn-copy-${entry.id}`}
            title="Copy password"
          >
            {copied ? '✓' : '⎘'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={() => onEdit(entry)}
          className="btn-secondary"
          id={`btn-edit-${entry.id}`}
          style={styles.actionBtn}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(entry)}
          id={`btn-delete-${entry.id}`}
          style={{ ...styles.actionBtn, ...styles.deleteBtn }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* ─── Dashboard ───────────────────────────────────────────────────── */
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);   // entry being edited
  const [deleteEntry, setDeleteEntry] = useState(null); // entry awaiting delete confirm

  const [statusMsg, setStatusMsg] = useState(null); // { type: 'error'|'success', text }
  const [search, setSearch] = useState('');

  /* ── fetch passwords ── */
  const fetchPasswords = useCallback(async () => {
    const headers = await getAuthHeader();
    if (!headers) return;
    try {
      const res = await fetch('/api/passwords', { headers });
      const json = await res.json();
      if (res.ok) setPasswords(json.passwords || []);
      else showStatus('error', json.error || 'Failed to load passwords.');
    } catch {
      showStatus('error', 'Network error while fetching passwords.');
    }
  }, []);

  /* ── auth check ── */
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
      } else {
        setUser(session.user);
        await fetchPasswords();
      }
      setLoading(false);
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) router.push('/signin');
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [router, fetchPasswords]);

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  /* ── CREATE ── */
  const handleCreate = async (form) => {
    setFormLoading(true);
    const headers = await getAuthHeader();
    if (!headers) { setFormLoading(false); return; }
    try {
      const res = await fetch('/api/passwords', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok) {
        showStatus('success', 'Password saved successfully.');
        setShowAddModal(false);
        await fetchPasswords();
      } else {
        showStatus('error', json.error || 'Failed to save password.');
      }
    } catch {
      showStatus('error', 'Network error.');
    }
    setFormLoading(false);
  };

  /* ── UPDATE ── */
  const handleUpdate = async (form) => {
    setFormLoading(true);
    const headers = await getAuthHeader();
    if (!headers) { setFormLoading(false); return; }
    const payload = { ...form };
    // Don't send empty password (keep existing)
    if (!payload.password) delete payload.password;
    try {
      const res = await fetch(`/api/passwords/${editEntry.id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok) {
        showStatus('success', 'Password updated successfully.');
        setEditEntry(null);
        await fetchPasswords();
      } else {
        showStatus('error', json.error || 'Failed to update password.');
      }
    } catch {
      showStatus('error', 'Network error.');
    }
    setFormLoading(false);
  };

  /* ── DELETE ── */
  const handleDeleteConfirm = async () => {
    const headers = await getAuthHeader();
    if (!headers || !deleteEntry) return;
    try {
      const res = await fetch(`/api/passwords/${deleteEntry.id}`, {
        method: 'DELETE',
        headers,
      });
      const json = await res.json();
      if (res.ok) {
        showStatus('success', 'Password deleted.');
        setDeleteEntry(null);
        await fetchPasswords();
      } else {
        showStatus('error', json.error || 'Failed to delete password.');
      }
    } catch {
      showStatus('error', 'Network error.');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
    router.refresh();
  };

  /* ── filtered list ── */
  const filtered = passwords.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.site_name?.toLowerCase().includes(q) ||
      p.username?.toLowerCase().includes(q) ||
      p.site_url?.toLowerCase().includes(q)
    );
  });

  /* ── loading screen ── */
  if (loading) {
    return (
      <div className="auth-wrapper" style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px auto', width: '32px', height: '32px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Decrypting Vault...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="auth-wrapper dashboard-card" style={{ maxWidth: '860px' }}>
      <div className="auth-card" style={{ padding: '32px' }}>

        {/* ── Header ── */}
        <header
          className="auth-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'left',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div className="logo-wrapper" style={{ justifyContent: 'flex-start', marginBottom: '4px' }}>
              <span className="logo-icon">One Password</span>
            </div>
            <p className="auth-subtitle" style={{ fontSize: '0.85rem' }}>
              Secure Credentials Manager
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="btn-submit"
              id="btn-add-password"
              onClick={() => setShowAddModal(true)}
              style={{ padding: '10px 18px', fontSize: '0.85rem', margin: 0 }}
            >
              + Add Password
            </button>
            <button
              className="btn-secondary"
              onClick={() => router.push('/signin')}
              id="btn-back-to-signin"
              style={{ padding: '10px 18px', fontSize: '0.85rem' }}
            >
              Back to Sign In
            </button>
          </div>
        </header>

        {/* ── Status message ── */}
        {statusMsg && (
          <div className={`status-msg ${statusMsg.type}`} role="alert">
            {statusMsg.text}
          </div>
        )}

        {/* ── Welcome + Stats ── */}
        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', fontWeight: '700', marginBottom: '4px' }}>
            Welcome back,
          </h2>
          <p style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '1rem', wordBreak: 'break-all' }}>
            {user.email}
          </p>
        </section>

        {/* ── Stat chips ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {[
            { label: 'Saved Passwords', value: passwords.length, color: 'var(--text-primary)' },
            { label: 'Security Score', value: '100%', color: 'var(--success)' },
            { label: 'Encryption', value: 'AES-256', color: 'var(--accent-primary)' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-card)',
                borderRadius: '16px',
                padding: '18px',
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  letterSpacing: '0.5px',
                }}
              >
                {label}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '1.6rem',
                  fontWeight: '700',
                  color,
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Search bar ── */}
        {passwords.length > 0 && (
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <div className="input-container">
              <input
                id="search-passwords"
                className="form-input"
                placeholder="Search by site, username or URL…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search passwords"
              />
            </div>
          </div>
        )}

        {/* ── Password list ── */}
        {filtered.length === 0 ? (
          <div
            style={{
              border: '1px dashed var(--border-card)',
              borderRadius: '16px',
              padding: '48px 20px',
              textAlign: 'center',
            }}
          >
            <h4
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '8px',
              }}
            >
              {search ? 'No results found' : 'Your vault is empty'}
            </h4>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                maxWidth: '340px',
                margin: '0 auto 20px auto',
              }}
            >
              {search
                ? 'Try a different search term.'
                : 'No credentials saved yet. Add your first password entry below.'}
            </p>
            {!search && (
              <button
                className="btn-submit"
                id="btn-add-first-password"
                onClick={() => setShowAddModal(true)}
                style={{ display: 'inline-flex', margin: '0 auto', padding: '10px 24px' }}
              >
                + Add Password
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((entry) => (
              <PasswordCard
                key={entry.id}
                entry={entry}
                onEdit={setEditEntry}
                onDelete={setDeleteEntry}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Add Modal ── */}
      {showAddModal && (
        <Modal title="Add New Password" onClose={() => setShowAddModal(false)}>
          <PasswordForm onSubmit={handleCreate} loading={formLoading} />
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {editEntry && (
        <Modal title="Edit Password" onClose={() => setEditEntry(null)}>
          <PasswordForm initial={editEntry} onSubmit={handleUpdate} loading={formLoading} />
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteEntry && (
        <Modal title="Delete Password" onClose={() => setDeleteEntry(null)}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
            Are you sure you want to delete the entry for{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{deleteEntry.site_name}</strong>? This
            cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn-secondary"
              id="btn-cancel-delete"
              onClick={() => setDeleteEntry(null)}
              style={{ flex: 1, padding: '12px' }}
            >
              Cancel
            </button>
            <button
              id="btn-confirm-delete"
              onClick={handleDeleteConfirm}
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--error)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontFamily: 'var(--font-title)',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Inline styles ────────────────────────────────────────────────── */
const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: '#0d101b',
    border: '1px solid var(--border-card)',
    borderRadius: '20px',
    padding: '28px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
    animation: 'fade-in-up 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  modalTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
    transition: 'color 0.2s ease',
  },
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-card)',
    borderRadius: '16px',
    padding: '18px',
    transition: 'border-color 0.2s ease',
  },
  cardAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardAvatarText: {
    color: '#fff',
    fontFamily: 'var(--font-title)',
    fontWeight: '700',
    fontSize: '0.9rem',
  },
  cardSiteName: {
    fontFamily: 'var(--font-title)',
    fontWeight: '700',
    fontSize: '1rem',
    color: 'var(--text-primary)',
    marginBottom: '2px',
  },
  cardUrl: {
    fontSize: '0.75rem',
    color: 'var(--accent-primary)',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '2px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardUsername: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  cardPassword: {
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    padding: '2px 4px',
    lineHeight: 1,
    transition: 'color 0.2s ease',
  },
  actionBtn: {
    padding: '6px 14px',
    fontSize: '0.8rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  deleteBtn: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#fca5a5',
    fontFamily: 'var(--font-title)',
    transition: 'var(--transition-smooth)',
  },
};
