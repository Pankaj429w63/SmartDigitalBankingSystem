/**
 * ProfilePage — View and update user profile details
 */
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/layout/DashboardLayout';
import { userService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateUserData } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handlePwdChange = (e) => setPwdForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userService.updateProfile(form);
      if (data.success) {
        updateUserData(data.data.user);
        toast.success('Profile updated successfully!');
        setEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwdForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setSavingPwd(true);
    try {
      const { data } = await authService.updatePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      });
      if (data.success) {
        toast.success('Password changed successfully!');
        setPwdForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setSavingPwd(false);
    }
  };

  const InfoRow = ({ label, value, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <i className={`bi ${icon}`} style={{ color: '#6c63ff', fontSize: '0.9rem' }}></i>
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: '#4a5568' }}>{label}</div>
        <div style={{ fontSize: '0.95rem', color: '#f0f4ff', fontWeight: 500 }}>{value || '—'}</div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Profile">
      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-lg-4">
          <div className="glass-card text-center">
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2.2rem', fontWeight: 700, color: '#fff' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <h5 style={{ fontWeight: 700 }}>{user?.firstName} {user?.lastName}</h5>
            <p style={{ color: '#8892b0', fontSize: '0.85rem' }}>{user?.email}</p>
            <div style={{ background: 'rgba(108,99,255,0.1)', borderRadius: 8, padding: '0.5rem 1rem', display: 'inline-block', marginBottom: '1rem' }}>
              <span style={{ color: '#6c63ff', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                <i className="bi bi-star-fill me-1"></i>{user?.accountType} Account
              </span>
            </div>
            <div style={{ textAlign: 'left' }}>
              <InfoRow label="Account Number" value={user?.accountNumber?.replace(/(\d{4})/g, '$1 ').trim()} icon="bi-credit-card" />
              <InfoRow label="Account Type" value={user?.accountType?.charAt(0).toUpperCase() + user?.accountType?.slice(1)} icon="bi-bank" />
              <InfoRow label="Balance" value={`₹${(user?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} icon="bi-wallet2" />
              <InfoRow label="Member Since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : ''} icon="bi-calendar3" />
              <InfoRow label="Status" value={user?.isActive ? 'Active' : 'Inactive'} icon="bi-shield-check" />
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="col-lg-8">
          <div className="glass-card mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 style={{ fontWeight: 700, margin: 0 }}>Personal Information</h6>
              <button onClick={() => setEditing(!editing)} className={editing ? 'btn-outline-custom' : 'btn-primary-custom'} style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }}>
                {editing ? 'Cancel' : <><i className="bi bi-pencil me-1"></i>Edit</>}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleProfileSave}>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>First Name</label>
                    <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className="form-control-custom" id="profile-firstname" />
                  </div>
                  <div className="col-6">
                    <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Last Name</label>
                    <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="form-control-custom" id="profile-lastname" />
                  </div>
                </div>
                <div className="mb-4">
                  <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Phone</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="form-control-custom" id="profile-phone" placeholder="10-digit number" />
                </div>
                <button type="submit" disabled={saving} className="btn-primary-custom">
                  {saving ? 'Saving...' : <><i className="bi bi-check-lg me-1"></i>Save Changes</>}
                </button>
              </form>
            ) : (
              <div>
                <InfoRow label="First Name" value={user?.firstName} icon="bi-person" />
                <InfoRow label="Last Name" value={user?.lastName} icon="bi-person" />
                <InfoRow label="Email" value={user?.email} icon="bi-envelope" />
                <InfoRow label="Phone" value={user?.phone} icon="bi-phone" />
                <InfoRow label="Role" value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} icon="bi-shield" />
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="glass-card">
            <h6 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Change Password</h6>
            <form onSubmit={handlePasswordChange}>
              <div className="mb-3">
                <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Current Password</label>
                <input type="password" name="currentPassword" value={pwdForm.currentPassword} onChange={handlePwdChange} className="form-control-custom" id="current-password" placeholder="Enter current password" />
              </div>
              <div className="mb-3">
                <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>New Password</label>
                <input type="password" name="newPassword" value={pwdForm.newPassword} onChange={handlePwdChange} className="form-control-custom" id="new-password" placeholder="Min. 8 characters" />
              </div>
              <div className="mb-4">
                <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Confirm New Password</label>
                <input type="password" name="confirmNewPassword" value={pwdForm.confirmNewPassword} onChange={handlePwdChange} className="form-control-custom" id="confirm-new-password" placeholder="Re-enter new password" />
              </div>
              <button type="submit" disabled={savingPwd} className="btn-primary-custom">
                {savingPwd ? 'Updating...' : <><i className="bi bi-lock me-1"></i>Update Password</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
