import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Lock, LogOut, Eye, EyeOff, Globe } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import AutoResizeTextarea from '../components/ui/AutoResizeTextarea';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useUser();
  const { notifications, updateNotification } = useSettings();

  const [activeTab, setActiveTab] = useState('account');

  // Public Profile State
  const [publicData, setPublicData] = useState({
    isPublicProfile: user?.isPublicProfile || false,
    services: user?.services || '',
    portfolio: user?.portfolio || '',
    experienceLevel: user?.experienceLevel || 'entry',
    experienceYears: user?.experienceYears ?? 0,
    availabilityType: user?.availabilityType || 'as-needed',
    availableHoursPerWeek: user?.availableHoursPerWeek ?? 0,
    bio: user?.bio || '',
    title: user?.title || '',
    location: user?.location || ''
  });

  // Account State
  const [accountData, setAccountData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    role: user?.role || ''
  });

  // Security State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    setPublicData({
      isPublicProfile: user.isPublicProfile || false,
      services: user.services || '',
      portfolio: user.portfolio || '',
      experienceLevel: user.experienceLevel || 'entry',
      experienceYears: user.experienceYears ?? 0,
      availabilityType: user.availabilityType || 'as-needed',
      availableHoursPerWeek: user.availableHoursPerWeek ?? 0,
      bio: user.bio || '',
      title: user.title || '',
      location: user.location || ''
    });
  }, [user]);

  const handlePublicProfileSave = async (e) => {
    e.preventDefault();
    const experienceYears = Number(publicData.experienceYears);
    const availableHoursPerWeek = Number(publicData.availableHoursPerWeek);
    if (user?.role === 'freelancer' && (!Number.isFinite(experienceYears) || experienceYears < 0)) {
      return toast.error('Years of experience must be 0 or greater');
    }
    if (user?.role === 'freelancer' && (!Number.isFinite(availableHoursPerWeek) || availableHoursPerWeek < 0 || availableHoursPerWeek > 168)) {
      return toast.error('Available hours per week must be between 0 and 168');
    }
    try {
      const freelancerData = user?.role === 'freelancer'
        ? { ...publicData, experienceYears, availableHoursPerWeek }
        : Object.fromEntries(Object.entries(publicData).filter(([key]) => !['experienceLevel', 'experienceYears', 'availabilityType', 'availableHoursPerWeek'].includes(key)));
      const res = await updateUser(freelancerData);
      if (res.success) {
        toast.success("Public Profile updated successfully");
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleAccountSave = async (e) => {
    e.preventDefault();
    if (!accountData.fullName || !accountData.email) {
      return toast.error("Name and Email are required");
    }

    try {
      const res = await updateUser(accountData);
      if (res.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handleSecuritySave = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword) {
      return toast.error("Current password is required");
    }
    if (!passwords.newPassword) {
      return toast.error("New password is required");
    }
    if (!passwords.confirmPassword) {
      return toast.error("Confirm password is required");
    }
    if (passwords.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      const res = await updateUser({
        currentPassword: passwords.currentPassword,
        password: passwords.newPassword
      });
      if (res.success) {
        toast.success("Password updated successfully");
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        toast.error(res.message || "Failed to update password");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update password");
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };



  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    ...(user?.role === 'freelancer' ? [{ id: 'public-profile', label: 'Public Profile', icon: Globe }] : []),
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'logout', label: 'Logout', icon: LogOut, isDanger: true }
  ];


  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Settings</h2>
        <p className="text-on-surface-variant font-body-lg">Manage your account preferences and application settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              if (tab.id === 'logout') {
                return (
                  <button
                    key={tab.id}
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-body-md transition-colors text-error hover:bg-error/10 mt-4 border border-error/20"
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body-md transition-all ${isActive
                    ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                    : 'text-on-surface hover:bg-surface-variant/50 border border-transparent'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 max-w-3xl">
          <Card className="rounded-[1.875rem] p-[2rem] min-h-[31.25rem]">

            {/* ACCOUNT TAB */}
            {activeTab === 'account' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-6 pb-4 border-b border-outline-variant/10">Account Settings</h3>
                <form onSubmit={handleAccountSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Full Name *</label>
                      <input
                        value={accountData.fullName}
                        onChange={e => setAccountData({ ...accountData, fullName: e.target.value })}
                        className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-2.5 px-4 text-on-surface text-body-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Email Address *</label>
                      <input
                        type="email"
                        value={accountData.email}
                        onChange={e => setAccountData({ ...accountData, email: e.target.value })}
                        className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-2.5 px-4 text-on-surface text-body-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Phone Number</label>
                      <input
                        type="tel"
                        value={accountData.phone}
                        onChange={e => setAccountData({ ...accountData, phone: e.target.value.replace(/[^0-9+]/g, '') })}
                        className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-2.5 px-4 text-on-surface text-body-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Company</label>
                      <input
                        value={accountData.company}
                        onChange={e => setAccountData({ ...accountData, company: e.target.value })}
                        className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-2.5 px-4 text-on-surface text-body-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Role / Job Title</label>
                      <input
                        value={accountData.role}
                        onChange={e => setAccountData({ ...accountData, role: e.target.value })}
                        className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-2.5 px-4 text-on-surface text-body-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="px-6 py-2.5 rounded-xl font-label-caps text-label-caps bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}

            {activeTab === 'public-profile' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-6 flex justify-between items-center pb-4 border-b border-outline-variant/10">
                  <h3 className="font-headline-md text-headline-md text-on-surface">Public Profile</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-body-sm font-semibold text-on-surface-variant">Profile Visibility: {publicData.isPublicProfile ? 'Public' : 'Private'}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={publicData.isPublicProfile}
                        onChange={(e) => setPublicData({ ...publicData, isPublicProfile: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <form onSubmit={handlePublicProfileSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-body-sm font-semibold text-on-surface ml-1">Professional Headline</label>
                      <input
                        type="text"
                        value={publicData.title}
                        onChange={(e) => setPublicData({ ...publicData, title: e.target.value })}
                        className="w-full h-12 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md"
                        placeholder="e.g. Senior Full-Stack Developer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-body-sm font-semibold text-on-surface ml-1">Location</label>
                      <input
                        type="text"
                        value={publicData.location}
                        onChange={(e) => setPublicData({ ...publicData, location: e.target.value })}
                        className="w-full h-12 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md"
                        placeholder="e.g. New York, USA or Remote"
                      />
                    </div>
                    {user?.role === 'freelancer' && <>
                      <div className="space-y-1">
                        <label className="text-body-sm font-semibold text-on-surface ml-1">Experience Level *</label>
                        <select required value={publicData.experienceLevel} onChange={(e) => setPublicData({ ...publicData, experienceLevel: e.target.value })} className="w-full h-12 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md">
                          <option value="entry">Entry Level</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-body-sm font-semibold text-on-surface ml-1">Years of Experience *</label>
                        <input required type="number" min="0" value={publicData.experienceYears} onChange={(e) => setPublicData({ ...publicData, experienceYears: e.target.value })} className="w-full h-12 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-body-sm font-semibold text-on-surface ml-1">Availability Type *</label>
                        <select required value={publicData.availabilityType} onChange={(e) => setPublicData({ ...publicData, availabilityType: e.target.value })} className="w-full h-12 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md">
                          <option value="full-time">Full Time</option>
                          <option value="part-time">Part Time</option>
                          <option value="as-needed">As Needed</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-body-sm font-semibold text-on-surface ml-1">Available Hours Per Week *</label>
                        <input required type="number" min="0" max="168" value={publicData.availableHoursPerWeek} onChange={(e) => setPublicData({ ...publicData, availableHoursPerWeek: e.target.value })} className="w-full h-12 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md" />
                      </div>
                    </>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-body-sm font-semibold text-on-surface ml-1">Services</label>
                    <input
                      type="text"
                      value={publicData.services}
                      onChange={(e) => setPublicData({ ...publicData, services: e.target.value })}
                      className="w-full h-12 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md"
                      placeholder="e.g. Web Development, UI/UX Design, Strategy"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-body-sm font-semibold text-on-surface ml-1">Portfolio Website</label>
                    <input
                      type="url"
                      value={publicData.portfolio}
                      onChange={(e) => setPublicData({ ...publicData, portfolio: e.target.value })}
                      className="w-full h-12 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md"
                      placeholder="https://myportfolio.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-body-sm font-semibold text-on-surface ml-1">Bio / About Me</label>
                    <AutoResizeTextarea
                      value={publicData.bio}
                      onChange={(e) => setPublicData({ ...publicData, bio: e.target.value })}
                      className="w-full h-32 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md resize-none"
                      maxHeight={224}
                      placeholder="Tell clients about your background and expertise..."
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-hover text-on-primary font-label-lg font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      Save Public Profile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-6 pb-4 border-b border-outline-variant/10">Notifications</h3>
                <div className="space-y-6">
                  {[
                    { id: 'desktop', title: 'Desktop Notifications', desc: 'Receive push notifications inside the application.' },
                    { id: 'email', title: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email.' },
                    { id: 'meetingReminders', title: 'Meeting Reminders', desc: 'Get notified 15 minutes before a meeting starts.' },
                    { id: 'taskDueAlerts', title: 'Task Due Alerts', desc: 'Alerts when a task is approaching its deadline.' },
                    { id: 'clientUpdates', title: 'Client Updates', desc: 'Notifications when a client is added or archived.' },
                    { id: 'projectUpdates', title: 'Project Updates', desc: 'Notifications on major project milestones.' },
                  ].map(notif => (
                    <div key={notif.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-body-lg text-on-surface font-semibold">{notif.title}</p>
                        <p className="text-body-sm text-on-surface-variant">{notif.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notifications[notif.id]}
                          onChange={(e) => updateNotification(notif.id, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-bright dark:after:bg-outline peer-checked:after:bg-on-primary after:border after:border-outline-variant/30 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-6 pb-4 border-b border-outline-variant/10">Security</h3>
                <form onSubmit={handleSecuritySave} className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Current Password *</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwords.currentPassword}
                        onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                        className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-2.5 pl-4 pr-12 text-on-surface text-body-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">New Password *</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwords.newPassword}
                        onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                        className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-2.5 pl-4 pr-12 text-on-surface text-body-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Confirm New Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwords.confirmPassword}
                        onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-2.5 pl-4 pr-12 text-on-surface text-body-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="pt-4">
                    <button type="submit" className="px-6 py-2.5 rounded-xl font-label-caps text-label-caps bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all">
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}

          </Card>
        </div>
      </div >
    </div >
  );
};

export default Settings;
