import { useEffect, useRef, useState } from 'react';

import {
  Mail,
  UserRound,
  CalendarDays,
  ShieldCheck,
  Shield,
  CheckCircle2,
  Sparkles,
  Camera,
  ImagePlus,
  Trash2,
  X,
} from 'lucide-react';

import toast from 'react-hot-toast';

import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Input from '@/components/forms/Input';
import Button from '@/components/common/Button';

import { useAuth } from '@/contexts/AuthContext';
import { accountService } from '@/services/accountService';
import { formatDate } from '@/utils/formatters';

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-500/10 text-emerald-400">
        <Icon size={19} />
      </div>

      <div>
        <h2 className="font-semibold text-white">{title}</h2>
        <p className="text-sm text-content-muted">{description}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setName(user?.name || '');
  }, [user?.name]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const initials = (user?.name || 'User')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const profileImage = previewUrl || user?.avatarUrl || '';

  const memberDate = user?.createdAt
    ? formatDate(user.createdAt)
    : '—';

  // UPDATE PROFILE
  const submit = async (event) => {
    event.preventDefault();

    if (name.trim().length < 2) {
      return toast.error('Name must be at least 2 characters');
    }

    setSaving(true);

    try {
      const updated = await accountService.updateProfile({
        name: name.trim(),
      });

      updateUser(updated);

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  // SELECT PROFILE PHOTO
  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG and WEBP images are allowed');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5 MB');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // CANCEL PHOTO SELECTION
  const cancelPhotoSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // UPLOAD PROFILE PHOTO
  const uploadPhoto = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setUploadingPhoto(true);

    try {
      const updated = await accountService.uploadProfilePhoto(
        selectedFile
      );

      updateUser(updated);

      setSelectedFile(null);
      setPreviewUrl('');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('Profile photo updated successfully');
    } catch (error) {
      toast.error(error.message || 'Could not upload profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // REMOVE PROFILE PHOTO
  const removePhoto = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to remove your profile photo?'
    );

    if (!confirmed) return;

    try {
      setUploadingPhoto(true);

      const updated = await accountService.removeProfilePhoto();

      updateUser(updated);

      setSelectedFile(null);
      setPreviewUrl('');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('Profile photo removed successfully');
    } catch (error) {
      toast.error(error.message || 'Could not remove profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-10">

      {/* PAGE HEADER */}
      <PageHeader
        title="My profile"
        description="Manage your personal information, security and account preferences."
      />

      {/* PROFILE HERO */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-950/50 via-surface to-surface p-5 shadow-xl shadow-emerald-950/10 sm:p-7">

        <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-emerald-400/10 blur-[90px]" />

        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-52 w-52 rounded-full bg-teal-400/[0.07] blur-[80px]" />

        <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">

          <div className="flex items-center gap-4">

            {/* PROFILE AVATAR */}
            <div className="relative shrink-0">

              <div className="relative h-24 w-24 rounded-[26px] bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-950 p-[2px] shadow-lg shadow-emerald-500/20">

                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[24px] bg-[#101815] text-3xl font-bold text-emerald-300">

                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}

                </div>
              </div>

              {/* REMOVE PHOTO */}
              {user?.avatarUrl && !selectedFile && (
                <button
                  type="button"
                  onClick={removePhoto}
                  disabled={uploadingPhoto}
                  className="relative mt-3 flex items-center gap-2 text-xs font-medium text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  Remove photo
                </button>
              )}

              {/* CAMERA BUTTON */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                aria-label="Upload profile photo"
                title="Change profile photo"
                style={{
                  backgroundColor: '#10b981',
                  color: '#052e24',
                  border: '3px solid #101815',
                  zIndex: 10,
                }}
                className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full shadow-lg shadow-emerald-500/30 transition-transform duration-300 hover:scale-110 hover:rotate-6 disabled:opacity-50"
              >
                <Camera size={19} strokeWidth={2.5} />
              </button>

              {/* HIDDEN FILE INPUT */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              {/* ONLINE INDICATOR */}
              <span
                className="absolute -left-1 -top-1 h-4 w-4 rounded-full border-[3px] border-[#101815] bg-emerald-400"
                title="Active"
              />

            </div>

            {/* USER DETAILS */}
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">

                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  {user?.name || 'User'}
                </h2>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                  Active account
                </span>

              </div>

              <p className="text-sm text-content-muted">
                {user?.email}
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-xs text-content-muted">
                <CalendarDays size={13} />
                Member since {memberDate}
              </div>

            </div>

          </div>

          {/* VELTRIO ACCOUNT LABEL */}
          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3">

            <Sparkles size={17} className="text-emerald-400" />

            <div>
              <p className="text-xs font-semibold text-emerald-300">
                Your VELTRIO account
              </p>

              <p className="text-[11px] text-content-muted">
                Your personal finance workspace
              </p>
            </div>

          </div>

        </div>

        {/* PHOTO PREVIEW ACTIONS */}
        {selectedFile && (
          <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] p-3">

            <div className="flex items-center gap-2 text-sm text-emerald-300">
              <ImagePlus size={17} />
              New profile photo selected
            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={cancelPhotoSelection}
                disabled={uploadingPhoto}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-content-muted transition-colors hover:bg-white/5 hover:text-white"
              >
                <X size={14} />
                Cancel
              </button>

              <Button
                type="button"
                loading={uploadingPhoto}
                onClick={uploadPhoto}
              >
                Save photo
              </Button>

            </div>

          </div>
        )}

        <p className="relative mt-4 text-xs text-content-muted">
          Click the camera icon to upload or change your profile photo.
          JPG, PNG and WEBP · Maximum 5 MB.
        </p>

      </div>

      {/* MAIN PROFILE GRID */}
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">

        {/* PERSONAL INFORMATION */}
        <Card className="p-5 transition-all duration-300 hover:border-emerald-400/20 sm:p-6">

          <SectionHeading
            icon={UserRound}
            title="Personal information"
            description="Update the personal details associated with your account."
          />

          <form onSubmit={submit} className="space-y-4">

            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={80}
              required
            />

            <Input
              label="Email address"
              value={user?.email || ''}
              readOnly
              disabled
              hint="Email address is used for sign-in and cannot be changed here."
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">

              <p className="text-xs text-content-muted">
                Keep your account information up to date.
              </p>

              <Button type="submit" loading={saving}>
                Save changes
              </Button>

            </div>

          </form>

        </Card>

        {/* ACCOUNT OVERVIEW */}
        <Card className="p-5 transition-all duration-300 hover:border-emerald-400/20 sm:p-6">

          <SectionHeading
            icon={ShieldCheck}
            title="Account overview"
            description="Your account information at a glance."
          />

          <div className="space-y-5">

            {/* EMAIL */}
            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Mail size={17} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-content-muted">
                  Email address
                </p>

                <p className="break-all text-sm font-medium text-white">
                  {user?.email || '—'}
                </p>
              </div>

            </div>

            {/* ROLE */}
            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Shield size={17} />
              </div>

              <div>
                <p className="text-xs text-content-muted">
                  Account role
                </p>

                <p className="text-sm font-medium capitalize text-white">
                  {user?.role || 'User'}
                </p>
              </div>

            </div>

            {/* MEMBER SINCE */}
            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <CalendarDays size={17} />
              </div>

              <div>
                <p className="text-xs text-content-muted">
                  Member since
                </p>

                <p className="text-sm font-medium text-white">
                  {memberDate}
                </p>
              </div>

            </div>

            {/* ACCOUNT STATUS */}
            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={17} />
              </div>

              <div>
                <p className="text-xs text-content-muted">
                  Account status
                </p>

                <p className="text-sm font-medium text-emerald-400">
                  Active
                </p>
              </div>

            </div>

          </div>

        </Card>

      </div>

    </div>
  );
}