"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';

export default function AccountPage() {
  const { user, token, refreshProfile, updateUser } = useAuth();
  const [saveSuccess, setSaveSuccess] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    address: '',
    birthday: '',
    gender: '',
    customGender: ''
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [sellerStats, setSellerStats] = useState<any>(null);
  const [privacySettings, setPrivacySettings] = useState({
    followersPublic: true,
    followingPublic: true
  });
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [shopData, setShopData] = useState({
    shopName: '',
    address: '',
    detailedAddress: '',
    contactNumber: '',
    transactionOptions: [] as string[],
  });
  const [isShopEditing, setIsShopEditing] = useState(false);
  const [shopErrors, setShopErrors] = useState<Record<string, string>>({});
  const [isShopSaving, setIsShopSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        contactNumber: (user as any).contactNumber || prev.contactNumber,
        address: (user as any).address || prev.address,
        birthday: (user as any).birthday ? new Date((user as any).birthday).toISOString().slice(0,10) : prev.birthday,
        gender: (user as any).gender || prev.gender,
        customGender: (user as any).customGender || prev.customGender
      }));
    }
  }, [user]);

  // Fetch seller profile and stats if user is a seller
  useEffect(() => {
    const fetchSellerData = async () => {
      if (!token || user?.role !== 'seller') return;
      
      try {
        // Fetch seller profile
        const profileRes = await fetch(`${API_BASE_URL}/api/seller/me`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setSellerProfile(profile);
        }

        // Fetch seller stats (products, orders, etc.)
        const statsRes = await fetch(`${API_BASE_URL}/api/seller/stats`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setSellerStats(stats);
        }
      } catch (e) {
        console.error('Failed to fetch seller data:', e);
      }
    };

    fetchSellerData();
  }, [token, user?.role]);

  // Fetch privacy settings
  useEffect(() => {
    const fetchPrivacySettings = async () => {
      if (!token) return;
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          console.log('Privacy settings API response:', data);
          // Handle different response structures
          const userData = data.user || data;
          setPrivacySettings({
            followersPublic: userData?.followersPublic !== false,
            followingPublic: userData?.followingPublic !== false
          });
        } else {
          console.error('Failed to fetch privacy settings, status:', res.status);
          // Set default values on API error
          setPrivacySettings({
            followersPublic: true,
            followingPublic: true
          });
        }
      } catch (e) {
        console.error('Failed to fetch privacy settings:', e);
        // Set default values on error
        setPrivacySettings({
          followersPublic: true,
          followingPublic: true
        });
      }
    };

    fetchPrivacySettings();
  }, [token]);

  // Update shop data when sellerProfile changes
  useEffect(() => {
    if (sellerProfile) {
      setShopData({
        shopName: sellerProfile.shopName || '',
        address: sellerProfile.address || '',
        detailedAddress: sellerProfile.detailedAddress || '',
        contactNumber: sellerProfile.contactNumber || '',
        transactionOptions: sellerProfile.transactionOptions || [],
      });
    }
  }, [sellerProfile]);

  const handleWishlistClick = () => {};
  const handleCartClick = () => {};

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleShopInputChange = (field: string, value: string | string[]) => {
    setShopData((prev) => ({ ...prev, [field]: value }));
  };

  const handleShopSave = async () => {
    if (!token || !sellerProfile) return;

    setIsShopSaving(true);
    setShopErrors({});
    try {
      const newErrors: Record<string, string> = {};
      if (!shopData.shopName.trim()) newErrors.shopName = 'Shop name is required';
      if (!shopData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
      else if (!/^\+?[0-9\-\s]{7,15}$/.test(shopData.contactNumber)) newErrors.contactNumber = 'Enter a valid contact number';
      if (!shopData.address.trim()) newErrors.address = 'Address is required';
      if (!shopData.detailedAddress.trim()) newErrors.detailedAddress = 'Detailed address is required';
      if (!shopData.transactionOptions || shopData.transactionOptions.length === 0) newErrors.transactionOptions = 'Select at least one transaction option';

      setShopErrors(newErrors);
      if (Object.keys(newErrors).length > 0) {
        setIsShopSaving(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/seller/shop-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(shopData),
      });

      if (res.ok) {
        const updatedProfile = await res.json();
        setSellerProfile(updatedProfile);
        setIsShopEditing(false);
        setSaveSuccess('Shop information updated successfully and submitted for admin approval');
      } else {
        const errorData = await res.json();
        setSaveError(errorData.error || 'Failed to update shop information');
      }
    } catch (e) {
      console.error('Error updating shop information:', e);
      setSaveError('Failed to update shop information');
    } finally {
      setIsShopSaving(false);
    }
  };

  const handleSaveChanges = () => {
    const run = async () => {
      try {
        setSaveError('');
        setIsSaving(true);
        const newErrors: Record<string,string> = {};
        if (!profileData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!profileData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (profileData.contactNumber && !/^\+?[0-9\-\s]{7,15}$/.test(profileData.contactNumber)) newErrors.contactNumber = 'Enter a valid contact number';
        if (profileData.birthday && isNaN(Date.parse(profileData.birthday))) newErrors.birthday = 'Enter a valid date';
        if (profileData.gender && !['male','female','other'].includes(profileData.gender)) newErrors.gender = 'Invalid gender';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) { setIsSaving(false); return; }

        if (!token) {
          setSaveError('You must be logged in to update your profile.');
          setIsSaving(false);
          return;
        }

        let profilePictureUrl: string | undefined = undefined;
        if (avatarFile) {
          const form = new FormData();
          form.append('avatar', avatarFile);
          const uploadRes = await fetch(`${API_BASE_URL}/api/users/profile/avatar`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: form,
          });
          const uploadCt = uploadRes.headers.get('content-type') || '';
          const uploadJson = uploadCt.includes('application/json') ? await uploadRes.json() : { error: await uploadRes.text() } as any;
          if (!uploadRes.ok) throw new Error(uploadJson.error || 'Avatar upload failed');
          profilePictureUrl = uploadJson.url;
        }

        const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            profilePicture: profilePictureUrl,
            contactNumber: profileData.contactNumber || undefined,
            address: profileData.address || undefined,
            birthday: profileData.birthday || undefined,
            gender: profileData.gender || undefined,
            customGender: profileData.gender === 'other' ? profileData.customGender || undefined : undefined,
          }),
        });
        const ct = res.headers.get('content-type') || '';
        const json = ct.includes('application/json') ? await res.json() : { error: await res.text() } as any;
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}${json.error ? `: ${json.error}` : ''}`);

        // Persist locally so it reflects after reload/logout/login
        updateUser({
          firstName: json.user.firstName,
          lastName: json.user.lastName,
          email: json.user.email,
          role: json.user.role,
          profilePicture: json.user.profilePicture,
          contactNumber: json.user.contactNumber,
          address: json.user.address,
          birthday: json.user.birthday,
          gender: json.user.gender,
          customGender: json.user.customGender,
        } as any);
        await refreshProfile();
        setIsEditing(false);
        setSaveSuccess('Profile updated successfully');
      } catch (e) {
        console.error(e);
        setSaveError((e as any).message || 'Failed to save changes');
      } finally {
        setIsSaving(false);
      }
    };
    run();
  };

  const handleAvatarChange = (file?: File | null) => {
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    } else {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const handlePrivacyChange = async (setting: 'followersPublic' | 'followingPublic', value: boolean) => {
    if (!token) return;
    
    setPrivacyLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/privacy-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          [setting]: value
        }),
      });

      if (res.ok) {
        setPrivacySettings(prev => ({
          ...prev,
          [setting]: value
        }));
        setSaveSuccess(`${setting === 'followersPublic' ? 'Followers' : 'Following'} privacy updated successfully`);
      } else {
        const errorData = await res.json();
        setSaveError(errorData.error || 'Failed to update privacy settings');
      }
    } catch (e) {
      console.error('Error updating privacy settings:', e);
      setSaveError('Failed to update privacy settings');
    } finally {
      setPrivacyLoading(false);
    }
  };

  return (
      <div className="w-full max-w-[1200px] mx-auto py-6">  
                    <div className="flex flex-col gap-2 mb-6 sm:mb-8">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Account Details</h1>
                      <span className="text-sm text-gray-500">
                        This is your personal information. You can edit it by clicking the edit button.
                      </span>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Profile Information
                        </h3>
                      <button
                        onClick={() => setIsEditing((v) => !v)}
                          className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-semibold"
                      >
                          {isEditing ? 'Cancel' : 'Edit Profile'}
                      </button>
                      </div>
                    </div>

                    {/* Profile Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center relative">
                        {avatarPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : user?.profilePicture ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-600 font-medium">
                            {(user?.firstName || 'U')[0]}
                            {(user?.lastName || 'N')[0]}
                          </span>
                        )}
                        {isEditing && (
                          <label className="absolute -bottom-2 -right-2 bg-(--color-green) text-white text-xs px-2 py-1 rounded cursor-pointer shadow">
                            Change Photo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
                            />
                          </label>
                        )}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Unnamed User'}
                        </div>
                        <div className="text-sm text-gray-600">{user?.email}</div>
                        {user?.role && (
                          <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {saveError && (
                      <div className="mb-4 text-sm text-red-600">{saveError}</div>
                    )}
                    {!isEditing && saveSuccess && (
                      <div className="relative mb-4 text-sm text-green-700 bg-green-100 border border-green-200 rounded px-3 py-2">
                        <span>{saveSuccess}</span>
                        <button
                          onClick={() => setSaveSuccess('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-green-800 hover:text-green-900"
                          aria-label="Close success message"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {/* Details */}
                    <div className="w-full max-w-[1200px]">
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={profileData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                className={`w-full px-4 py-3 border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600`}
                              />
                            ) : (
                              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                {user?.firstName || '-'}
                              </div>
                            )}
                            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={profileData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                className={`w-full px-4 py-3 border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600`}
                              />
                            ) : (
                              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                {user?.lastName || '-'}
                              </div>
                            )}
                            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                              {user?.email || '-'}
                            </div>
                          </div>

                          {/* Contact Number */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={profileData.contactNumber}
                                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                                className={`w-full px-4 py-3 border ${errors.contactNumber ? 'border-red-500' : 'border-gray-200'} bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600`}
                              />
                            ) : (
                              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                {(user as any)?.contactNumber || '-'}
                              </div>
                            )}
                            {errors.contactNumber && <p className="mt-1 text-xs text-red-600">{errors.contactNumber}</p>}
                          </div>

                          {/* Address */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={profileData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600"
                              />
                            ) : (
                              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                {(user as any)?.address || '-'}
                              </div>
                            )}
                          </div>

                          {/* Birthday */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
                            {isEditing ? (
                              <input
                                type="date"
                                value={profileData.birthday}
                                onChange={(e) => handleInputChange('birthday', e.target.value)}
                                className={`w-full px-4 py-3 border ${errors.birthday ? 'border-red-500' : 'border-gray-200'} bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600`}
                              />
                            ) : (
                              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                {(user as any)?.birthday ? new Date((user as any).birthday).toLocaleDateString() : '-'}
                              </div>
                            )}
                            {errors.birthday && <p className="mt-1 text-xs text-red-600">{errors.birthday}</p>}
                          </div>

                          {/* Gender */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                            {isEditing ? (
                              <div className="space-y-3">
                              <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={profileData.gender === 'female'}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                  />
                                  <span className="text-gray-800">Female</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={profileData.gender === 'male'}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                  />
                                  <span className="text-gray-800">Male</span>
                                </label>
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      name="gender"
                                      value="other"
                                      checked={profileData.gender === 'other'}
                                      onChange={(e) => handleInputChange('gender', e.target.value)}
                                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                    />
                                    <span className="text-gray-800">Other</span>
                                  </label>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Gender (if Other selected)</label>
                                  <input
                                    type="text"
                                    value={profileData.gender === 'other' ? profileData.customGender || '' : ''}
                                    onChange={(e) => handleInputChange('customGender', e.target.value)}
                                    placeholder="Enter your gender identity"
                                    className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 capitalize">
                                {(user as any)?.gender === 'other' && (user as any)?.customGender 
                                  ? (user as any).customGender 
                                  : (user as any)?.gender || '-'}
                              </div>
                            )}
                            {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
                          </div>

                          {/* Role is not editable here */}
                        </div>

                        {/* Privacy Settings */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            Privacy Settings
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Followers Privacy */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Followers List</label>
                              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                  <p className="text-sm text-gray-600">Make your followers list visible to others</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {privacySettings.followersPublic ? 'Public - Anyone can see your followers' : 'Private - Only you can see your followers'}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handlePrivacyChange('followersPublic', !privacySettings.followersPublic)}
                                  disabled={privacyLoading}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    privacySettings.followersPublic ? 'bg-blue-600' : 'bg-gray-200'
                                  } ${privacyLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      privacySettings.followersPublic ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>

                            {/* Following Privacy */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Following List</label>
                              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                  <p className="text-sm text-gray-600">Make your following list visible to others</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {privacySettings.followingPublic ? 'Public - Anyone can see who you follow' : 'Private - Only you can see who you follow'}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handlePrivacyChange('followingPublic', !privacySettings.followingPublic)}
                                  disabled={privacyLoading}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    privacySettings.followingPublic ? 'bg-blue-600' : 'bg-gray-200'
                                  } ${privacyLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      privacySettings.followingPublic ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Seller Shop Information - Only show registered fields */}
                        {user?.role === 'seller' && sellerProfile && (
                          <div className="mt-8 pt-8 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                              Shop Information
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                  (Registered during seller registration)
                                </span>
                            </h3>
                              <button
                                onClick={() => setIsShopEditing(!isShopEditing)}
                                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-semibold"
                              >
                                {isShopEditing ? 'Cancel' : 'Edit Shop Info'}
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Shop Name - Required field */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                                {isShopEditing ? (
                                  <input
                                    type="text"
                                    value={shopData.shopName}
                                    onChange={(e) => handleShopInputChange('shopName', e.target.value)}
                                    className={`w-full px-4 py-3 border ${shopErrors.shopName ? 'border-red-500' : 'border-gray-200'} bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600`}
                                  />
                                ) : (
                                <div className="px-4 py-3 bg-green-50 rounded-lg border border-green-200 text-gray-800 font-medium">
                                  {sellerProfile.shopName || '-'}
                                </div>
                                )}
                                {shopErrors.shopName && <p className="mt-1 text-xs text-red-600">{shopErrors.shopName}</p>}
                              </div>
                              
                              {/* Shop Status - Always shown */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Status</label>
                                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    sellerProfile.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    sellerProfile.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {sellerProfile.status === 'approved' ? '✓ Approved' :
                                     sellerProfile.status === 'pending' ? '⏳ Pending' :
                                     '❌ Rejected'}
                                  </span>
                                </div>
                              </div>

                              {/* Address - Required field */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                {isShopEditing ? (
                                  <input
                                    type="text"
                                    value={shopData.address}
                                    onChange={(e) => handleShopInputChange('address', e.target.value)}
                                    className={`w-full px-4 py-3 border ${shopErrors.address ? 'border-red-500' : 'border-gray-200'} bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600`}
                                  />
                                ) : (
                                  <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                    {sellerProfile.address || '-'}
                                  </div>
                                )}
                                {shopErrors.address && <p className="mt-1 text-xs text-red-600">{shopErrors.address}</p>}
                              </div>

                              {/* Detailed Address - Required field */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Address</label>
                                {isShopEditing ? (
                                  <input
                                    type="text"
                                    value={shopData.detailedAddress}
                                    onChange={(e) => handleShopInputChange('detailedAddress', e.target.value)}
                                    className={`w-full px-4 py-3 border ${shopErrors.detailedAddress ? 'border-red-500' : 'border-gray-200'} bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600`}
                                  />
                                ) : (
                                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                    {sellerProfile.detailedAddress || '-'}
                                </div>
                                )}
                                {shopErrors.detailedAddress && <p className="mt-1 text-xs text-red-600">{shopErrors.detailedAddress}</p>}
                              </div>

                              {/* Contact Number - Required field */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                                {isShopEditing ? (
                                  <input
                                    type="text"
                                    value={shopData.contactNumber}
                                    onChange={(e) => handleShopInputChange('contactNumber', e.target.value)}
                                    className={`w-full px-4 py-3 border ${shopErrors.contactNumber ? 'border-red-500' : 'border-gray-200'} bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600`}
                                  />
                                ) : (
                                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                  {sellerProfile.contactNumber || '-'}
                                </div>
                                )}
                                {shopErrors.contactNumber && <p className="mt-1 text-xs text-red-600">{shopErrors.contactNumber}</p>}
                              </div>

                              {/* Transaction Options - Required field */}
                                  <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Options</label>
                                {isShopEditing ? (
                                  <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                      {['Cash on Delivery', 'Bank Transfer', 'GCash', 'PayPal', 'Credit Card'].map((option) => (
                                        <label key={option} className="flex items-center space-x-2">
                                          <input
                                            type="checkbox"
                                            checked={shopData.transactionOptions.includes(option)}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                handleShopInputChange('transactionOptions', [...shopData.transactionOptions, option]);
                                              } else {
                                                handleShopInputChange('transactionOptions', shopData.transactionOptions.filter(opt => opt !== option));
                                              }
                                            }}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                          />
                                          <span className="text-sm text-gray-700">{option}</span>
                                        </label>
                                      ))}
                                    </div>
                                    {shopErrors.transactionOptions && <p className="text-xs text-red-600">{shopErrors.transactionOptions}</p>}
                                  </div>
                                ) : (
                                  <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                    {sellerProfile.transactionOptions && sellerProfile.transactionOptions.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {sellerProfile.transactionOptions.map((option: string, index: number) => (
                                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                            {option}
                                          </span>
                                        ))}
                                      </div>
                                    ) : '-'}
                                  </div>
                                )}
                                  </div>

                              {/* Government IDs - Required fields */}
                                  <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Government ID 1</label>
                                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                  {sellerProfile.governmentId1Front ? '✓ Uploaded' : '-'}
                                    </div>
                                  </div>

                                  <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Government ID 2</label>
                                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                  {sellerProfile.governmentId2Front ? '✓ Uploaded' : '-'}
                                    </div>
                                  </div>

                              {/* Terms Acceptance - Required field */}
                                  <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Terms Accepted</label>
                                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    sellerProfile.termsAccepted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {sellerProfile.termsAccepted ? '✓ Accepted' : '❌ Not Accepted'}
                                  </span>
                                    </div>
                                  </div>

                            </div>
                            
                            {/* Shop Save Button */}
                            {isShopEditing && (
                              <div className="mt-6 flex justify-end">
                                <button
                                  onClick={handleShopSave}
                                  disabled={isShopSaving}
                                  className={`bg-green-600 hover:bg-green-700 transition-colors text-white px-8 py-3 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm ${isShopSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                  {isShopSaving ? 'Saving...' : 'Save Shop Information'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {isEditing && (
                          <div className="mt-8 flex justify-end">
                            <button
                              onClick={handleSaveChanges}
                              disabled={isSaving}
                              className={`bg-(--color-green) hover:bg-green-800 transition-modern text-white px-8 py-3 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-[12px] md:text-[16px] ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        )}
                      </div>
      </div>
    </div>
  );
}


