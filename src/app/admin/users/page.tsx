'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { Search, Plus, Edit2, Trash2, UserX, UserCheck, Key, Loader2, X, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'staff' | 'customer';
  department: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

interface UserForm {
  full_name: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  department: string;
  phone: string;
}

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | 'deactivate' | 'reset' | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<UserForm>({ full_name: '', email: '', role: 'staff', department: '', phone: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('user_profiles').select('*', { count: 'exact' });
    if (search) query = query.ilike('full_name', `%${search}%`);
    if (roleFilter !== 'all') query = query.eq('role', roleFilter);
    query = query.order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    const { data, count, error } = await query;
    if (!error && data) {
      setUsers(data as UserProfile[]);
      setTotal(count || 0);
    }
    setLoading(false);
  }, [supabase, search, roleFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function openEdit(u: UserProfile) {
    setSelectedUser(u);
    setForm({ full_name: u.full_name, email: u.email, role: u.role, department: u.department || '', phone: u.phone || '' });
    setModal('edit');
  }

  function openDelete(u: UserProfile) {
    setSelectedUser(u);
    setConfirmText('');
    setModal('delete');
  }

  function openDeactivate(u: UserProfile) {
    setSelectedUser(u);
    setModal('deactivate');
  }

  function openReset(u: UserProfile) {
    setSelectedUser(u);
    setModal('reset');
  }

  async function handleAdd() {
    if (!form.full_name || !form.email) return;
    setFormLoading(true);
    try {
      // Create auth user via Supabase admin (using service role would be needed in production)
      // For now, insert directly into user_profiles (user must sign up separately)
      const { error } = await supabase.from('user_profiles').insert({
        id: crypto.randomUUID(),
        email: form.email,
        full_name: form.full_name,
        role: form.role,
        department: form.department,
        phone: form.phone,
        is_active: true,
      });
      if (error) throw error;
      showToast('success', `User ${form.full_name} added successfully`);
      setModal(null);
      fetchUsers();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to add user');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleEdit() {
    if (!selectedUser) return;
    setFormLoading(true);
    try {
      const { error } = await supabase.from('user_profiles').update({
        full_name: form.full_name,
        role: form.role,
        department: form.department,
        phone: form.phone,
      }).eq('id', selectedUser.id);
      if (error) throw error;
      showToast('success', 'User updated successfully');
      setModal(null);
      fetchUsers();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to update user');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeactivate() {
    if (!selectedUser) return;
    setFormLoading(true);
    try {
      const newStatus = !selectedUser.is_active;
      const { error } = await supabase.from('user_profiles').update({ is_active: newStatus }).eq('id', selectedUser.id);
      if (error) throw error;
      showToast('success', `User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      setModal(null);
      fetchUsers();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to update user status');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedUser || confirmText !== selectedUser.full_name) return;
    setFormLoading(true);
    try {
      const { error } = await supabase.from('user_profiles').delete().eq('id', selectedUser.id);
      if (error) throw error;
      showToast('success', 'User deleted successfully');
      setModal(null);
      fetchUsers();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete user');
    } finally {
      setFormLoading(false);
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AppLayout role="admin" currentPath="/admin/users">
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold"
            style={{ background: toast.type === 'success' ? '#22C55E' : '#EF4444', color: '#fff' }}>
            {toast.type === 'success' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] mb-2">Administration</p>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground mt-2">Manage system users, roles, and access permissions.</p>
          </div>
          <button
            onClick={() => { setForm({ full_name: '', email: '', role: 'staff', department: '', phone: '' }); setModal('add'); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Add User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: total, color: 'text-foreground' },
            { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-warning' },
            { label: 'Staff', value: users.filter(u => u.role === 'staff').length, color: 'text-info' },
            { label: 'Customers', value: users.filter(u => u.role === 'customer').length, color: 'text-success' },
          ].map((stat) => (
            <div key={stat.label} className="card-dark p-4 rounded-3xl border border-border">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="input-dark w-full pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'admin', 'staff', 'customer'].map((r) => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setPage(0); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${roleFilter === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="card-dark rounded-3xl border border-border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-accent" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-xs font-bold text-primary-foreground flex items-center justify-center">
                            {u.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{u.full_name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge
                          variant={u.role === 'admin' ? 'warning' : u.role === 'staff' ? 'info' : 'ok'}
                          label={u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        />
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{u.department || '—'}</td>
                      <td className="px-4 py-4">
                        <StatusBadge variant={u.is_active ? 'ok' : 'danger'} label={u.is_active ? 'Active' : 'Inactive'} />
                      </td>
                      <td className="px-4 py-4 text-muted-foreground text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => openDeactivate(u)} className={`p-1.5 rounded-lg transition-all ${u.is_active ? 'text-warning hover:bg-warning/10' : 'text-success hover:bg-success/10'}`} title={u.is_active ? 'Deactivate' : 'Activate'}>
                            {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                          <button onClick={() => openReset(u)} className="p-1.5 rounded-lg text-info hover:bg-info/10 transition-all" title="Reset Password">
                            <Key size={14} />
                          </button>
                          {u.id !== user?.id && (
                            <button onClick={() => openDelete(u)} className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-all" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-all">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {(modal === 'add' || modal === 'edit') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setModal(null)}>
            <div className="card-dark rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">{modal === 'add' ? 'Add New User' : 'Edit User'}</h3>
                <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                  <input type="text" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} className="input-dark w-full" placeholder="John Doe" />
                </div>
                {modal === 'add' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input-dark w-full" placeholder="user@mvcawood.com" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                  <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as any }))} className="input-dark w-full">
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Department</label>
                  <input type="text" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} className="input-dark w-full" placeholder="Production, QA, Management..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="input-dark w-full" placeholder="+1 234 567 8900" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={modal === 'add' ? handleAdd : handleEdit} disabled={formLoading || !form.full_name} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {formLoading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  {formLoading ? 'Saving...' : modal === 'add' ? 'Add User' : 'Save Changes'}
                </button>
                <button onClick={() => setModal(null)} className="btn-secondary px-4">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Deactivate Modal */}
        {modal === 'deactivate' && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setModal(null)}>
            <div className="card-dark rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground mb-3">
                {selectedUser.is_active ? 'Deactivate' : 'Activate'} User
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                {selectedUser.is_active
                  ? `Are you sure you want to deactivate ${selectedUser.full_name}? They will lose access to the system.`
                  : `Are you sure you want to activate ${selectedUser.full_name}? They will regain access to the system.`}
              </p>
              <div className="flex gap-3">
                <button onClick={handleDeactivate} disabled={formLoading} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedUser.is_active ? 'bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30' : 'bg-success/20 text-success border border-success/30 hover:bg-success/30'}`}>
                  {formLoading ? <Loader2 size={14} className="animate-spin" /> : selectedUser.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                  {selectedUser.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => setModal(null)} className="btn-secondary px-4">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {modal === 'delete' && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setModal(null)}>
            <div className="card-dark rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-danger mb-3">Delete User</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This action cannot be undone. Type <strong className="text-foreground">{selectedUser.full_name}</strong> to confirm.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="input-dark w-full mb-4"
                placeholder="Type user name to confirm"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={formLoading || confirmText !== selectedUser.full_name}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30 transition-all disabled:opacity-40"
                >
                  {formLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete User
                </button>
                <button onClick={() => setModal(null)} className="btn-secondary px-4">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {modal === 'reset' && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setModal(null)}>
            <div className="card-dark rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground mb-3">Reset Password</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Send a password reset email to <strong className="text-foreground">{selectedUser.email}</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    setFormLoading(true);
                    try {
                      const { error } = await supabase.auth.resetPasswordForEmail(selectedUser.email, {
                        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
                      });
                      if (error) throw error;
                      showToast('success', `Password reset email sent to ${selectedUser.email}`);
                      setModal(null);
                    } catch (err: any) {
                      showToast('error', err?.message || 'Failed to send reset email');
                    } finally {
                      setFormLoading(false);
                    }
                  }}
                  disabled={formLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {formLoading ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                  Send Reset Email
                </button>
                <button onClick={() => setModal(null)} className="btn-secondary px-4">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
