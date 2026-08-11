import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import AutoResizeTextarea from '../../components/ui/AutoResizeTextarea';
import { useUser } from '../../context/UserContext';
import ClientReliabilityCard from '../../components/intelligence/ClientReliabilityCard';

const emptyProfile = {
  fullName: '',
  email: '',
  phone: '',
  company: '',
  location: '',
  bio: ''
};

const ClientProfile = () => {
  const { user, loading, updateUser } = useUser();
  const [formData, setFormData] = useState(emptyProfile);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      company: user.company || '',
      location: user.location || '',
      bio: user.bio || ''
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, and WEBP images are allowed.');
      event.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Profile picture must be 2MB or smaller.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error('Full Name is required.');
      return;
    }
    setSaving(true);
    try {
      const result = await updateUser({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        bio: formData.bio.trim(),
        ...(photoPreview && { avatar: photoPreview })
      });
      if (!result.success) throw new Error(result.message || 'Failed to update profile.');
      setPhotoPreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Profile updated successfully.');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return <div className="flex min-h-[60vh] items-center justify-center text-on-surface-variant">Loading profile…</div>;
  }

  const avatar = photoPreview || user.avatar || user.photo;

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full min-w-0">
      <div>
        <h1 className="font-headline-md text-3xl font-bold text-on-surface tracking-tight">My Profile</h1>
        <p className="text-on-surface-variant text-body-md mt-2">Manage your personal and company information.</p>
      </div>

      <Card className="p-6 md:p-8 overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative shrink-0">
              <img src={avatar} alt="Client profile" className="w-24 h-24 rounded-2xl object-cover border border-outline-variant/30" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-md" aria-label="Change profile picture">
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
            </div>
            <div className="text-center sm:text-left min-w-0">
              <h2 className="font-headline-sm text-xl font-bold text-on-surface truncate">{formData.fullName}</h2>
              <p className="text-body-sm text-on-surface-variant break-all">{formData.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Full Name *</label>
              <input name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Email Address</label>
              <input name="email" type="email" value={formData.email} readOnly aria-readonly="true" className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface font-body-md focus:outline-none opacity-70" />
            </div>
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Phone Number</label>
              <input name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Company</label>
              <input name="company" value={formData.company} onChange={handleChange} className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Location</label>
              <input name="location" value={formData.location} onChange={handleChange} className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Bio / About</label>
              <AutoResizeTextarea name="bio" value={formData.bio} onChange={handleChange} rows={4} maxHeight={224} className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl font-label-caps text-label-caps bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Card>
      {user?._id && <ClientReliabilityCard clientId={user._id} />}
    </div>
  );
};

export default ClientProfile;
