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
function Modal({ title, onClose, children, theme }) {
  const isDark = theme === 'dark';
  const modalBg    = isDark ? '#0d101b' : '#ffffff';
  const modalBorder= isDark ? 'var(--border-card)' : '#dddddd';
  const titleColor = isDark ? '#ffffff' : '#1a1a1a';
  const closeColor = isDark ? 'rgba(255,255,255,0.5)' : '#555555';

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={{
          ...styles.modal,
          background: modalBg,
          border: `1px solid ${modalBorder}`,
          boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.6)' : '0 24px 60px rgba(0,0,0,0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div style={styles.modalHeader}>
          <h3 style={{ ...styles.modalTitle, color: titleColor }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ ...styles.closeBtn, color: closeColor }}
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
function PasswordForm({ initial = {}, onSubmit, loading, theme }) {
  const [form, setForm] = useState({
    site_name: initial.site_name || '',
    site_url: initial.site_url || '',
    username: initial.username || '',
    password: initial.password || '',
    tag: initial.tag || 'Personal',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isDark = theme === 'dark';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : '#ffffff';
  const inputColor = isDark ? '#ffffff' : '#1a1a1a';
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : '#dddddd';
  const labelColor = isDark ? '#ffffff' : '#1a1a1a';
  const selectBg = isDark ? 'rgba(255,255,255,0.06)' : '#ffffff';

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Validate required fields
    const needsPassword = !initial.id; // password only required for new entries
    if (!form.site_name || !form.username || (needsPassword && !form.password)) {
      return; // stop here, errors will show via submitted state
    }
    onSubmit(form);
  };

  const errStyle = { color: 'red', fontSize: '0.75rem', marginTop: '5px' };
  const getInputStyle = (fieldValue, extraStyle = {}) => ({
    background: inputBg,
    color: inputColor,
    borderColor: submitted && !fieldValue ? 'red' : inputBorder,
    ...extraStyle,
  });

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate style={{ gap: '16px' }}>
      {/* Site Name */}
      <div className="form-group">
        <label className="form-label" htmlFor="field-site-name" style={{ color: labelColor }}>
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
            autoComplete="off"
            style={getInputStyle(form.site_name)}
          />
        </div>
        {submitted && !form.site_name && <div style={errStyle}>fill this</div>}
      </div>

      {/* URL (optional) */}
      <div className="form-group">
        <label className="form-label" htmlFor="field-site-url" style={{ color: labelColor }}>
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
            style={{ background: inputBg, color: inputColor, borderColor: inputBorder }}
          />
        </div>
      </div>

      {/* Username */}
      <div className="form-group">
        <label className="form-label" htmlFor="field-username" style={{ color: labelColor }}>
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
            autoComplete="off"
            style={getInputStyle(form.username)}
          />
        </div>
        {submitted && !form.username && <div style={errStyle}>fill this</div>}
      </div>

      {/* Password */}
      <div className="form-group">
        <label className="form-label" htmlFor="field-password" style={{ color: labelColor }}>
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
            autoComplete="new-password"
            style={getInputStyle(!initial.id ? form.password : true, { paddingRight: '48px' })}
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
              color: isDark ? 'var(--text-secondary)' : '#666',
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
        {submitted && !initial.id && !form.password && <div style={errStyle}>fill this</div>}
        {initial.id && (
          <p style={{ fontSize: '0.78rem', color: isDark ? 'var(--text-muted)' : '#999', marginTop: '4px' }}>
            Leave blank to keep the existing password.
          </p>
        )}
      </div>

      {/* Tag */}
      <div className="form-group">
        <label className="form-label" htmlFor="field-tag" style={{ color: labelColor }}>
          Tag
        </label>
        <div className="input-container">
          <select
            id="field-tag"
            name="tag"
            className="form-input"
            value={form.tag}
            onChange={handleChange}
            style={{ appearance: 'none', background: selectBg, cursor: 'pointer', color: inputColor, borderColor: inputBorder }}
          >
            <option value="Personal">Personal</option>
            <option value="Workplace">Workplace</option>
            <option value="Social">Social</option>
            <option value="Finance">Finance</option>
            <option value="Other">Other</option>
          </select>
        </div>
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
function PasswordCard({ entry, onEdit, onDelete, theme }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyPassword = async () => {
    await navigator.clipboard.writeText(entry.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = (entry.site_name || '?').slice(0, 2).toUpperCase();
  const isDark = theme === 'dark';
  const cardBg = isDark ? '#1a1a1a' : '#ffffff';
  const textMain = isDark ? '#ffffff' : '#1a1a1a';
  const textDim = isDark ? '#aaaaaa' : '#666666';
  const textMuted = isDark ? '#cccccc' : '#555555';
  const fieldBg = isDark ? '#333333' : '#f9f9f9';
  const borderCol = isDark ? '#333333' : 'rgba(0,0,0,0.08)';

  return (
    <div style={{
      background: cardBg,
      border: `1px solid ${borderCol}`,
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
      height: '100%',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease',
    }}>
      {/* Top Banner / Avatar */}
      <div style={{
        height: '120px',
        background: 'var(--accent-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{ color: '#fff', fontSize: '2rem', fontWeight: '800', letterSpacing: '2px' }}>{initials}</span>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: textDim, letterSpacing: '0.5px' }}>
              {entry.tag || 'Personal'}
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: textMain, margin: '4px 0 2px' }}>
              {entry.site_name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: textMuted, wordBreak: 'break-all' }}>{entry.username}</p>
            {entry.site_url && (
              <a href={entry.site_url.startsWith('http') ? entry.site_url : `https://${entry.site_url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textDecoration: 'none', display: 'block', marginTop: '2px' }}>
                {entry.site_url}
              </a>
            )}
          </div>
        </div>

        {/* Password dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', marginBottom: '24px', background: fieldBg, padding: '8px 12px', borderRadius: '8px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: textMain, flex: 1 }}>
            {revealed ? entry.password : '••••••••••••'}
          </span>
          <button onClick={() => setRevealed((v) => !v)} style={{ ...styles.iconBtn, display: 'flex', alignItems: 'center', lineHeight: 1, color: textMain }} title={revealed ? 'Hide' : 'Reveal'}>
            {revealed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
          <button onClick={copyPassword} style={{ ...styles.iconBtn, color: copied ? 'var(--success)' : textMain }} title="Copy">
            {copied ? '✓' : '⎘'}
          </button>
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <button onClick={() => onDelete(entry)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', padding: '4px' }}>
            Delete
          </button>
          <button onClick={() => onEdit(entry)} style={{ background: isDark ? '#3b82f6' : '#1a1a1a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
            Edit
          </button>
        </div>
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
  const [selectedFilter, setSelectedFilter] = useState('All');

  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('lockbox-theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
    document.body.style.backgroundColor = saved === 'dark' ? '#000000' : '#ffffff';
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('lockbox-theme', next);
    document.documentElement.setAttribute('data-theme', next);
    document.body.style.backgroundColor = next === 'dark' ? '#000000' : '#ffffff';
  };

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
    try {
      await supabase.auth.signOut();
      router.push('/signin');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  /* ── filtered list ── */
  const filtered = passwords.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.site_name?.toLowerCase().includes(q) ||
      p.username?.toLowerCase().includes(q) ||
      p.site_url?.toLowerCase().includes(q);

    const tag = (p.tag || 'Personal').toLowerCase();
    const matchesFilter =
      selectedFilter === 'All' || tag === selectedFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  /* ── loading screen ── */
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', background: 'transparent' }}>
        <div className="spinner" style={{ margin: '0 auto 16px auto', width: '32px', height: '32px' }} />
        <p style={{ color: '#888', fontWeight: '500', fontSize: '1rem' }}>loading</p>
      </div>
    );
  }

  if (!user) return null;

  const dark = theme === 'dark';
  const bg = dark ? '#000000' : '#ffffff';
  const cardBg = dark ? '#1a1a1a' : '#ffffff';
  const textMain = dark ? '#ffffff' : '#1a1a1a';
  const textMuted = dark ? '#aaaaaa' : '#888888';
  const border = dark ? '#333333' : '#dddddd';

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', transition: 'background 0.3s ease' }}>

      {/* ── Top Navbar ── */}
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', background: bg, borderBottom: `1px solid ${border}`, transition: 'background 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: dark ? '#3b82f6' : '#1a1a1a', color: '#fff', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>
            LB
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-title)', color: textMain, letterSpacing: '1px' }}>
            LOCKBOX
          </span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>

          {/* Pill Toggle Switch */}
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{
              width: '56px', height: '30px', borderRadius: '999px',
              background: theme === 'dark' ? '#3b82f6' : '#d1d5db',
              position: 'relative', transition: 'background 0.3s ease', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: '3px',
                left: theme === 'dark' ? '29px' : '3px',
                width: '24px', height: '24px', borderRadius: '50%',
                background: theme === 'dark' ? '#ffffff' : '#6b7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'left 0.3s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}>
                {theme === 'dark' ? (
                  /* moon icon shown in dark mode */
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                  </svg>
                ) : (
                  /* sun icon shown in light mode */
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="4" />
                    <line x1="12" y1="2" x2="12" y2="4" />
                    <line x1="12" y1="20" x2="12" y2="22" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="2" y1="12" x2="4" y2="12" />
                    <line x1="20" y1="12" x2="22" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                )}
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#6b7280', whiteSpace: 'nowrap' }}>
              {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          <button onClick={handleSignOut} style={{ background: 'transparent', color: textMain, border: 'none', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Search & Filter Area ── */}
      <div className="dashboard-search-area" style={{ padding: '32px 40px 16px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        <div style={{ background: cardBg, borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '12px 16px', border: `1px solid ${border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '24px' }}>
          <span style={{ color: '#aaa', marginRight: '12px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by site, username or URL…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', color: textMain, background: 'transparent' }}
          />
        </div>

        <div className="dashboard-filter-scroll" style={{ display: 'flex', gap: '20px', alignItems: 'center', borderBottom: `1px solid ${border}`, paddingBottom: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>FILTER</span>
          {['All', 'Personal', 'Workplace', 'Social', 'Finance'].map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                style={{
                  background: isActive ? (dark ? '#3b82f6' : '#1a1a1a') : cardBg,
                  border: `1px solid ${dark ? '#3b82f6' : '#1a1a1a'}`,
                  borderRadius: '20px',
                  padding: '6px 16px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: isActive ? '#ffffff' : textMain,
                  cursor: 'pointer',
                }}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button onClick={() => setShowAddModal(true)} style={{ background: cardBg, color: textMain, border: `1px solid ${border}`, padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
            + Add Password
          </button>
        </div>
      </div>

      {/* ── Main Layout (Sidebar + Grid) ── */}
      <div className="dashboard-layout" style={{ display: 'flex', gap: '40px', padding: '24px 40px', maxWidth: '1400px', width: '100%', margin: '0 auto', flex: 1, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <div className="dashboard-sidebar" style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              USER PROFILE
            </h3>
            <div style={{ background: cardBg, borderRadius: '12px', padding: '16px', border: `1px solid ${border}` }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: textMain, wordBreak: 'break-all' }}>{user.email}</p>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              VAULT STATS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Saved Passwords', value: passwords.length },
                { label: 'Security Score', value: '100%' },
                { label: 'Encryption', value: 'AES-256' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: dark ? 'rgba(59,130,246,0.1)' : '#dbeafe', border: `1px solid ${dark ? 'rgba(59,130,246,0.3)' : '#93c5fd'}`, borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: dark ? '#60a5fa' : '#1d4ed8', fontWeight: '700', marginBottom: '4px' }}>{label}</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: '800', color: dark ? '#60a5fa' : '#1d4ed8' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Area */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: textMuted }}>{filtered.length} entries found</h2>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: cardBg, borderRadius: '12px', border: `1px dashed ${border}` }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: textMain, marginBottom: '8px' }}>Your vault is empty</h4>
              <p style={{ color: textMuted, marginBottom: '24px' }}>No credentials found for this search.</p>
              <button onClick={() => setShowAddModal(true)} className="btn-submit" style={{ display: 'inline-flex', padding: '10px 24px' }}>+ Add Password</button>
            </div>
          ) : (
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {filtered.map(entry => (
                <PasswordCard
                  key={entry.id}
                  entry={entry}
                  onEdit={setEditEntry}
                  onDelete={setDeleteEntry}
                  theme={theme}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Status message ── */}
      {statusMsg && (
        <div className={`status-msg ${statusMsg.type}`} role="alert" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1100 }}>
          {statusMsg.text}
        </div>
      )}

      {/* ── Add Modal ── */}
      {showAddModal && (
        <Modal title="Add New Password" onClose={() => setShowAddModal(false)} theme={theme}>
          <PasswordForm onSubmit={handleCreate} loading={formLoading} theme={theme} />
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {editEntry && (
        <Modal title="Edit Password" onClose={() => setEditEntry(null)} theme={theme}>
          <PasswordForm initial={editEntry} onSubmit={handleUpdate} loading={formLoading} theme={theme} />
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteEntry && (
        <Modal title="Delete Password" onClose={() => setDeleteEntry(null)} theme={theme}>
          <p style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#555555', marginBottom: '24px', fontSize: '0.95rem' }}>
            Are you sure you want to delete the entry for{' '}
            <strong style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1a1a1a' }}>{deleteEntry.site_name}</strong>? This
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
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '8vh 20px 20px',
    overflowY: 'hidden',
    boxSizing: 'border-box',
  },
  modal: {
    background: '#0d101b',   /* overridden at runtime via theme prop */
    border: '1px solid var(--border-card)',
    borderRadius: '20px',
    padding: '28px',
    width: '100%',
    maxWidth: '520px',
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto',
    boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
    animation: 'fade-in-up 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
    margin: '0 auto',
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
    color: '#111827',
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
    background: '#10b981',
    color: '#ffffff',
    border: '1px solid #10b981',
  },
  deleteBtn: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#fca5a5',
    fontFamily: 'var(--font-title)',
    transition: 'var(--transition-smooth)',
  },
};
