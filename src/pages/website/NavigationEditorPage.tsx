import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { NavMenu, NavItem } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Plus, Edit2, Trash2, Save, X, Loader2,
  ChevronUp, ChevronDown, Eye, EyeOff, ExternalLink,
} from 'lucide-react';

const MENU_HANDLES = ['main', 'footer'] as const;

function emptyItem(menuId: string): Omit<NavItem, 'id'> {
  return { menu_id: menuId, parent_id: null, label: '', href: '', tour_id: null, sort_order: 0, is_visible: true, opens_new_tab: false };
}

export default function NavigationEditorPage() {
  const [menus, setMenus]       = useState<NavMenu[]>([]);
  const [items, setItems]       = useState<NavItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeMenu, setActiveMenu] = useState<string>('');
  const [saving, setSaving]     = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [form, setForm] = useState<Omit<NavItem, 'id'> & { id?: string }>({ menu_id: '', parent_id: null, label: '', href: '', tour_id: null, sort_order: 0, is_visible: true, opens_new_tab: false });

  async function load() {
    setLoading(true);
    const [{ data: menuData }, { data: itemData }] = await Promise.all([
      supabase.from('nav_menus').select('*').order('handle'),
      supabase.from('nav_items').select('*').order('sort_order'),
    ]);
    const m = (menuData ?? []) as NavMenu[];
    setMenus(m);
    setItems((itemData ?? []) as NavItem[]);
    if (m.length > 0 && !activeMenu) setActiveMenu(m[0].id);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function s<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(p => ({ ...p, [k]: v }));
  }

  function openNew() {
    const menuId = activeMenu;
    const menuItems = items.filter(i => i.menu_id === menuId);
    const newForm = { ...emptyItem(menuId), sort_order: menuItems.length + 1 };
    setForm(newForm);
    setEditingItem(null);
    setShowForm(true);
  }

  function openEdit(item: NavItem) {
    setForm({ ...item });
    setEditingItem(item);
    setShowForm(true);
  }

  async function save() {
    if (!form.label.trim()) { toast.error('Label is required'); return; }
    setSaving('form');
    const payload = {
      menu_id:      form.menu_id,
      parent_id:    form.parent_id || null,
      label:        form.label.trim(),
      href:         form.href?.trim() || null,
      tour_id:      form.tour_id || null,
      sort_order:   form.sort_order,
      is_visible:   form.is_visible,
      opens_new_tab: form.opens_new_tab,
    };
    const { error } = editingItem
      ? await supabase.from('nav_items').update(payload).eq('id', editingItem.id)
      : await supabase.from('nav_items').insert(payload);
    if (error) { toast.error(error.message); setSaving(null); return; }
    toast.success(editingItem ? 'Item updated' : 'Item added');
    setShowForm(false);
    setSaving(null);
    load();
  }

  async function del(item: NavItem) {
    if (!confirm(`Delete "${item.label}"?`)) return;
    setDeleting(item.id);
    const { error } = await supabase.from('nav_items').delete().eq('id', item.id);
    if (error) { toast.error(error.message); setDeleting(null); return; }
    toast.success('Deleted');
    setDeleting(null);
    setItems(p => p.filter(x => x.id !== item.id));
  }

  async function toggleVisible(item: NavItem) {
    setSaving(item.id);
    const { error } = await supabase.from('nav_items').update({ is_visible: !item.is_visible }).eq('id', item.id);
    if (error) { toast.error(error.message); setSaving(null); return; }
    setItems(p => p.map(x => x.id === item.id ? { ...x, is_visible: !item.is_visible } : x));
    setSaving(null);
  }

  async function move(item: NavItem, dir: 'up' | 'down') {
    const menuItems = items
      .filter(i => i.menu_id === item.menu_id && !i.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const idx = menuItems.findIndex(x => x.id === item.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= menuItems.length) return;
    const other = menuItems[swapIdx];
    setSaving(item.id);
    await Promise.all([
      supabase.from('nav_items').update({ sort_order: other.sort_order }).eq('id', item.id),
      supabase.from('nav_items').update({ sort_order: item.sort_order }).eq('id', other.id),
    ]);
    setSaving(null);
    load();
  }

  const currentMenu = menus.find(m => m.id === activeMenu);
  const currentItems = items
    .filter(i => i.menu_id === activeMenu && !i.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Navigation Editor</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${currentItems.length} items in ${currentMenu?.label ?? '—'}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="https://www.besttravelmorocco.com" target="_blank" rel="noopener" className="btn btn-outline">
            <ExternalLink size={14} /> Preview Site
          </a>
          <button onClick={openNew} className="btn btn-primary" disabled={!activeMenu}>
            <Plus size={14} /> Add Item
          </button>
        </div>
      </div>

      {/* Menu tabs */}
      {menus.length > 0 && (
        <div className="tabs" style={{ marginBottom: 20 }}>
          {menus.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMenu(m.id)}
              className={`tab ${activeMenu === m.id ? 'tab-active' : ''}`}
            >
              {m.label ?? m.handle}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: 10, color: 'var(--text-3)' }}>
          <Loader2 size={18} className="animate-spin" />
          <span style={{ fontSize: 13 }}>Loading navigation…</span>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 12 }}>No items in this menu yet.</p>
          <button onClick={openNew} className="btn btn-primary"><Plus size={14} /> Add First Item</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-3)', textAlign: 'left', width: 60 }}>Order</th>
                <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-3)', textAlign: 'left' }}>Label</th>
                <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-3)', textAlign: 'left' }}>URL</th>
                <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-3)', textAlign: 'left', width: 80 }}>Options</th>
                <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-3)', textAlign: 'right', width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', opacity: item.is_visible ? 1 : 0.45, background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.01)' }}>
                  <td style={{ padding: '8px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button
                        onClick={() => move(item, 'up')} disabled={idx === 0 || saving === item.id}
                        style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: 'var(--text-3)', padding: 1, opacity: idx === 0 ? 0.25 : 1 }}
                      ><ChevronUp size={13} /></button>
                      <button
                        onClick={() => move(item, 'down')} disabled={idx === currentItems.length - 1 || saving === item.id}
                        style={{ background: 'none', border: 'none', cursor: idx === currentItems.length - 1 ? 'default' : 'pointer', color: 'var(--text-3)', padding: 1, opacity: idx === currentItems.length - 1 ? 0.25 : 1 }}
                      ><ChevronDown size={13} /></button>
                    </div>
                  </td>
                  <td style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.label}</td>
                  <td style={{ padding: '8px 16px', fontSize: 13, color: 'var(--text-3)', fontFamily: 'monospace' }}>
                    {item.href ?? <span style={{ fontStyle: 'italic', opacity: .5 }}>—</span>}
                    {item.opens_new_tab && <ExternalLink size={11} style={{ marginLeft: 4, opacity: .5 }} />}
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <span style={{ fontSize: 11, color: item.is_visible ? 'var(--sand)' : 'var(--text-3)' }}>
                      {item.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button onClick={() => toggleVisible(item)} disabled={saving === item.id} className="btn btn-ghost btn-icon" title={item.is_visible ? 'Hide' : 'Show'}>
                        {saving === item.id ? <Loader2 size={13} className="animate-spin" /> : item.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <button onClick={() => openEdit(item)} className="btn btn-ghost btn-icon" title="Edit">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => del(item)} disabled={deleting === item.id} className="btn btn-ghost btn-icon" style={{ color: '#EF4444' }} title="Delete">
                        {deleting === item.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{editingItem ? 'Edit Nav Item' : 'Add Nav Item'}</h3>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-icon"><X size={16} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Label *</label>
              <input className="form-input" value={form.label} onChange={e => s('label', e.target.value)} placeholder="e.g. Tours" autoFocus />
            </div>

            <div className="form-group">
              <label className="form-label">URL</label>
              <input className="form-input" value={form.href ?? ''} onChange={e => s('href', e.target.value)} placeholder="e.g. /tours or https://external.com" />
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Use /path for internal pages, full URL for external links.</p>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={form.is_visible} onChange={e => s('is_visible', e.target.checked)} style={{ width: 15, height: 15 }} />
                Visible in menu
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={form.opens_new_tab} onChange={e => s('opens_new_tab', e.target.checked)} style={{ width: 15, height: 15 }} />
                Open in new tab
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} className="btn btn-outline">Cancel</button>
              <button onClick={save} disabled={saving === 'form'} className="btn btn-primary">
                {saving === 'form' ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> {editingItem ? 'Update' : 'Add'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
