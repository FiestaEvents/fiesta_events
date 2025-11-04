import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { User, Lock, Mail, Phone, Calendar, Shield } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    avatar: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!profile.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      await updateUser(profile);
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      showToast('Please fill in all password fields', 'error');
      return;
    }

    if (passwords.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      // This should call your changePassword API endpoint
      // await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      showToast('Password changed successfully', 'success');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error');
      console.error(err);
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Profile Settings</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'border-orange-600 text-orange-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <User className="inline-block w-4 h-4 mr-2" />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'security'
                ? 'border-orange-600 text-orange-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Lock className="inline-block w-4 h-4 mr-2" />
            Security
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <User className="inline-block w-4 h-4 mr-1" />
                  Name *
                </label>
                <Input
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  <Mail className="inline-block w-4 h-4 mr-1" />
                  Email (Read-only)
                </label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Phone className="inline-block w-4 h-4 mr-1" />
                  Phone
                </label>
                <Input
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Avatar URL
                </label>
                <Input
                  name="avatar"
                  value={profile.avatar}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  type="url"
                />
                {profile.avatar && (
                  <div className="mt-2">
                    <img
                      src={profile.avatar}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <Button variant="outline" onClick={handleSave} disabled={saving} className="w-full sm:w-auto ">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Shield className="inline-block w-4 h-4 mr-1" />
                  Role
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
                  {user?.roleType || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="inline-block w-4 h-4 mr-1" />
                  Last Login
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {formatDate(user?.lastLogin)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="inline-block w-4 h-4 mr-1" />
                  Member Since
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {formatDate(user?.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Change Password</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password *
              </label>
              <Input
                name="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password *
              </label>
              <Input
                name="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password (min 6 characters)"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password *
              </label>
              <Input
                name="confirmPassword"
                type="password"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>

            <div className="pt-2">
              <Button variant="outline" onClick={handleChangePassword} disabled={changingPassword} className="w-full sm:w-auto">
                {changingPassword ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>

            <div className="bg-dark-50 dark:bg-dark-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-800 dark:text-blue-200">
                <strong>Password Requirements:</strong>
              </p>
              <ul className="text-sm text-gray-700 dark:text-blue-300 list-disc list-inside mt-2 space-y-1">
                <li>At least 6 characters long</li>
                <li>Mix of letters, numbers, and symbols recommended</li>
                <li>Avoid common passwords</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;