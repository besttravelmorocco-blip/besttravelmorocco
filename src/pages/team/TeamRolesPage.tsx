import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRole, type AdminRole } from '@/context/RoleContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Shield, Plus, Trash2, RefreshCw, Info } from 'lucide-react';

interface TeamMember {
  email: string;
  role: AdminRole;
  full_name: string | null;
  created_at: string;
}

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin:        'Super Admin',
  website_manager:    'Website Manager',
  operations_manager: 'Operations Manager',
  finance_manager:    'Finance Manager',
  sales_agent:        'Sales Agent',
  content_editor:     'Content Editor',
};

const ROLE_DESC: Record<AdminRole, string> = {
  super_admin:        'Full access to all sections including system settings and team management.',
  website_manager:    'Manages website content, tours, blog, destinations, experiences, and appearance.',
  operations_manager: 'Manages bookings, staff, vehicles, accommodations, suppliers, pricing, and reports.',
  finance_manager:    'Manages pricing engine, coupons, financial reports, and email templates.',
  sales_agent:        'Handles inquiries, bookings, custom tour requests, and customer records.',
  content_editor:     'Creates and edits tours, blog posts, testimonials, FAQs, and media files.',
};

const ROLE_COLOR: Record<AdminRole, string> = {
  super_admin:        '#C9A96E',
  website_manager:    '#60A5FA',
  operations_manager: '#F97316',
  finance_manager:    '#C9A96E',
  sales_agent:        '#10B981',
  content_editor:     '#A78BFA',
};

const ALL_ROLES = Object.keys(ROLE_LABELS) as AdminRole[];

export default function TeamRolesPage() {
  const { user }              = useAuth();
  const { hasAccess }         = useRole();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName,  setNewName]  = useState('');
  const [newRole,  setNewRole]  = useState<AdminRole>('content_editor');
  const [saving,   setSaving]   = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_user_roles')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) toast.error(error.message);
    setMembers((data ?? []) as TeamMember[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addMember() {
    const email = newEmail.trim().toLowerCase();
    if (!email) { toast.error('Email is required'); return; }
    setSaving(true);
    const { error } = await supabase.from('admin_user_roles').insert({
      email,
      role: newRole,
      full_name: newName.trim() || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Team member added');
    setShowAdd(false);
    setNewEmail('');
    setNewName('');
    setNewRole('content_editor');
    load();
  }

  async function updateRole(email: string, role: AdminRole) {
    const { error } = await supabase
      .from('admin_user_roles')
      .update({ role })
      .eq('email', email);
    if (error) { toast.error(error.message); return; }
    setMembers(prev => prev.map(m => m.email === email ? { ...m, role } : m));
    toast.success('Role updated');
  }

  async function remove(email: string) {
    if (email === user?.email) { toast.error("You can't remove yourself"); return; }
    if (!confirm(`Remove ${email} from the team?`)) return;
    const { error } = await supabase
      .from('admin_user_roles')
      .delete()
      .eq('email', email);
    if (error) { toast.error(error.message); return; }
    setMembers(prev => prev.filter(m => m.email !== email));
    toast.success('Member removed');
  }

  if (!hasAccess(['super_admin'])) {
    return (
      <div className="page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
          <Shield size={36} style={{ margin: '0 auto 12px', color: '#EF4444' }} />
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Access Denied</p>
          <p style={{ fontSize: 13 }}>Team management is restricted to Super Admins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Team & Roles</h1>
          <p className="page-subtitle">Manage who can access the admin portal and what they can do.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="btn btn-outline" style={{ padding: '8px 12px' }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={() => setShowAdd(s => !s)} className="btn btn-primary">
            <Plus size={15} /> Add Member
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 className="card-title" style={{ marginBottom: 16 }}>Add Team Member</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px auto', gap: 12, alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email *</label>
              <input
                className="form-input"
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="staff@example.com"
                onKeyDown={e => e.key === 'Enter' && addMember()}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Role</label>
              <select
                className="form-input"
                value={newRole}
                onChange={e => setNewRole(e.target.value as AdminRole)}
              >
                {ALL_ROLES.map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, paddingBottom: 0 }}>
              <button onClick={addMember} disabled={saving} className="btn btn-primary">
                {saving ? '…' : 'Add'}
              </button>
              <button onClick={() => setShowAdd(false)} className="btn btn-outline">Cancel</button>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Info size={12} />
            The team member must sign in using this exact email address to receive their role.
          </p>
        </div>
      )}

      {/* Role reference */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title" style={{ marginBottom: 12 }}>Role Permissions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
          {ALL_ROLES.map(r => (
            <div
              key={r}
              style={{
                padding: '10px 12px',
                background: 'var(--bg-3)',
                borderRadius: 8,
                borderLeft: `3px solid ${ROLE_COLOR[r]}`,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: ROLE_COLOR[r], marginBottom: 5 }}>
                {ROLE_LABELS[r]}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
                {ROLE_DESC[r]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Members table */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 16 }}>
          Team Members ({members.length})
        </h3>
        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : members.length === 0 ? (
          <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No team members found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Added</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => {
                  const isMe = m.email === user?.email;
                  const initial = (m.full_name ?? m.email)[0].toUpperCase();
                  return (
                    <tr key={m.email}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: ROLE_COLOR[m.role],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, color: '#1A0F0A', flexShrink: 0,
                          }}>
                            {initial}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {m.full_name ?? '—'}
                            {isMe && (
                              <span style={{
                                marginLeft: 8, fontSize: 10,
                                background: 'var(--sand)', color: '#1A0F0A',
                                padding: '1px 7px', borderRadius: 10, fontWeight: 700,
                              }}>
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-2)' }}>{m.email}</td>
                      <td>
                        <select
                          className="form-input"
                          value={m.role}
                          disabled={isMe}
                          onChange={e => updateRole(m.email, e.target.value as AdminRole)}
                          style={{
                            padding: '4px 8px',
                            fontSize: 12,
                            width: 'auto',
                            minWidth: 170,
                            borderLeft: `3px solid ${ROLE_COLOR[m.role]}`,
                          }}
                        >
                          {ALL_ROLES.map(r => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                        {new Date(m.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td>
                        {!isMe && (
                          <button
                            type="button"
                            onClick={() => remove(m.email)}
                            title="Remove member"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#EF4444',
                              padding: 6,
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
