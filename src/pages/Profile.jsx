import React, { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { Camera, MapPin, Mail, Phone, Briefcase, Code } from 'lucide-react';
import Card from '../components/ui/Card';
import AutoResizeTextarea from '../components/ui/AutoResizeTextarea';
import toast from 'react-hot-toast';
import PortfolioShowcase from '../components/intelligence/PortfolioShowcase';

const Profile = () => {
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });

  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedSkills = [...new Set(
      String(formData.skills || '').split(',').map(skill => skill.trim()).filter(Boolean)
    )];
    if (normalizedSkills.length === 0) {
      toast.error('Skills & Expertise is required.');
      return;
    }
    const result = await updateUser({
      ...formData,
      skills: normalizedSkills.join(', '),
      avatar: user.avatar
    });
    if (result.success) {
      setFormData(current => ({ ...current, skills: normalizedSkills.join(', ') }));
      setIsEditing(false);
      toast.success('Profile updated successfully.');
    } else {
      toast.error(result.message || 'Failed to update profile.');
    }
  };

  const handleCancel = () => {
    setFormData({ ...user });
    setIsEditing(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoError('');

    // Validation: Type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Invalid file type. Only JPG, PNG, and WEBP images are allowed.');
      return;
    }

    // Validation: Size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setPhotoError('File size is too large. Maximum size allowed is 2MB.');
      return;
    }

    setSelectedFile(file);

    // Read file for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async () => {
    if (!photoPreview) return;
    setIsUploadingPhoto(true);
    setPhotoError('');
    try {
      const res = await updateUser({ avatar: photoPreview });
      if (res.success) {
        setPhotoPreview(null);
        setSelectedFile(null);
      } else {
        setPhotoError(res.message || 'Failed to upload photo');
      }
    } catch (error) {
      setPhotoError(error.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCancelPreview = () => {
    setPhotoPreview(null);
    setSelectedFile(null);
    setPhotoError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-2">My Profile</h2>
          <p className="text-on-surface-variant font-body-lg">Manage your personal information and account settings.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-primary text-on-primary px-6 py-2 rounded-xl font-label-caps text-label-caps hover:brightness-110 active:scale-95 transition-all"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: User Card */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="p-[2rem] rounded-[1.875rem] text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-tertiary/10 rounded-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-32 h-32 mb-6 group cursor-pointer"
              >
                <img
                  src={photoPreview || user.photo}
                  alt={user.fullName}
                  className="w-full h-full rounded-full object-cover border-4 border-surface-container shadow-xl transition-all group-hover:brightness-95"
                />
                <div className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full shadow-lg border-2 border-surface-container group-hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {photoError && (
                <p className="text-error text-xs mb-4 max-w-[200px] leading-tight animate-in fade-in duration-200">
                  {photoError}
                </p>
              )}

              {photoPreview && (
                <div className="flex gap-2 mb-6 animate-in fade-in duration-200">
                  <button
                    onClick={handleUploadPhoto}
                    disabled={isUploadingPhoto}
                    type="button"
                    className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-label-caps hover:brightness-110 active:scale-95 transition-all"
                  >
                    {isUploadingPhoto ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelPreview}
                    disabled={isUploadingPhoto}
                    type="button"
                    className="border border-outline-variant/30 text-on-surface px-3 py-1.5 rounded-lg text-xs font-label-caps hover:bg-surface-variant transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{user.fullName}</h3>
              <p className="text-on-surface-variant font-label-caps text-label-caps tracking-widest mb-4">{user.role}</p>

              <div className="w-full space-y-3 mt-6 text-left">
                <div className="flex items-center gap-3 text-body-sm text-on-surface-variant">
                  <Briefcase className="w-5 h-5 text-primary" />
                  {user.title}
                </div>
                <div className="flex items-center gap-3 text-body-sm text-on-surface-variant">
                  <MapPin className="w-5 h-5 text-primary" />
                  {user.location}
                </div>
                <div className="flex items-center gap-3 text-body-sm text-on-surface-variant">
                  <Mail className="w-5 h-5 text-primary" />
                  {user.email}
                </div>
                <div className="flex items-center gap-3 text-body-sm text-on-surface-variant">
                  <Phone className="w-5 h-5 text-primary" />
                  {user.phone}
                </div>
                <div className="flex items-start gap-3 text-body-sm text-on-surface-variant">
                  <Code className="w-5 h-5 text-primary mt-1" />
                  <span>{user.skills}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Profile Details/Form */}
        <div className="xl:col-span-2">
          <Card className="p-[2rem] rounded-[1.875rem] h-full">
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-8 border-b border-outline-variant/10 pb-4">
              {isEditing ? 'Edit Information' : 'About Me'}
            </h4>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Full Name *</label>
                    <input name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Email *</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Phone Number</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Location</label>
                    <input name="location" value={formData.location} onChange={handleChange} className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Role</label>
                    <input name="role" value={formData.role} onChange={handleChange} className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Company/Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Skills &amp; Expertise *</label>
                    <input name="skills" value={formData.skills || ''} onChange={handleChange} required placeholder="React, Node.js, MongoDB, Express, Tailwind CSS" className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">Bio/About</label>
                    <AutoResizeTextarea name="bio" value={formData.bio} onChange={handleChange} rows={4} maxHeight={224} className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" />
                  </div>
                </div>
                <div className="flex gap-4 justify-end pt-4">
                  <button type="button" onClick={handleCancel} className="px-6 py-3 rounded-xl font-label-caps text-label-caps border border-outline-variant/20 hover:bg-surface-variant transition-all text-on-surface">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-3 rounded-xl font-label-caps text-label-caps bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-300">
                <p className="text-on-surface-variant font-body-md leading-relaxed whitespace-pre-wrap break-words">
                  {user.bio}
                </p>
                <div>
                  <h5 className="font-label-caps text-label-caps text-on-surface mb-4 tracking-widest">Account Information</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6">
                    <div>
                      <p className="text-on-surface-variant text-label-caps mb-1">Status</p>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-caps text-[10px] border border-tertiary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Active
                      </span>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-label-caps mb-1">Member Since</p>
                      <p className="text-on-surface font-body-md">{user.joinedDate || 'January 2024'}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-label-caps mb-1">Current Plan</p>
                      <p className="text-primary font-body-md font-bold">{user.plan || 'Pro Plan'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
      <PortfolioShowcase />
    </div>
  );
};

export default Profile;
