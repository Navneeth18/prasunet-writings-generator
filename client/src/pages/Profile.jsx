import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Upload, ZoomIn } from 'lucide-react';
import PhotoPopup from '../components/PhotoPopup';

const Profile = () => {
  const { user, updateProfile, changePassword, updateProfilePhoto, deleteProfilePhoto } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  // Initialize with empty values and update when user data is available
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    profilePhoto: 'https://ui-avatars.com/api/?name=User'
  });

  // Update profile data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        profilePhoto: user.profilePhoto || 'https://ui-avatars.com/api/?name=User'
      });
    }
  }, [user]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPhotoPopup, setShowPhotoPopup] = useState(false);
  const [popupPhotoUrl, setPopupPhotoUrl] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle profile info edit
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open photo popup
  const openPhotoPopup = (url) => {
    setPopupPhotoUrl(url);
    setShowPhotoPopup(true);
  };

  // Handle file selection for profile photo
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile info changes
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Call the actual API function
      await updateProfile(profileData);
      setSuccess('Profile information updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change submission
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Call the actual API function
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please check your current password and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile photo upload
  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('profilePhoto', selectedFile);

      // For preview, create a photoUrl from the selected file
      const photoUrl = previewUrl;
      formData.append('photoUrl', photoUrl);

      // Call the actual API function
      const updatedUser = await updateProfilePhoto(formData);

      setSuccess('Profile photo updated successfully!');
      setProfileData(prev => ({
        ...prev,
        profilePhoto: updatedUser.profilePhoto || previewUrl
      }));
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Error uploading profile photo:', err);
      setError(err.response?.data?.message || 'Failed to upload profile photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile photo deletion
  const handleDeletePhoto = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Call the API to delete the profile photo
      const updatedUser = await deleteProfilePhoto();

      setSuccess('Profile photo removed successfully!');
      setProfileData(prev => ({
        ...prev,
        profilePhoto: updatedUser.profilePhoto
      }));
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Error deleting profile photo:', err);
      setError(err.response?.data?.message || 'Failed to delete profile photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Photo Popup */}
      {showPhotoPopup && (
        <PhotoPopup
          photoUrl={popupPhotoUrl}
          onClose={() => setShowPhotoPopup(false)}
        />
      )}

      {/* Delete Photo Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 dark:text-white">Delete Profile Photo?</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">Are you sure you want to delete your profile photo? This action cannot be undone.</p>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white transition-colors text-sm sm:text-base"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeletePhoto();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm sm:text-base mb-2 sm:mb-0"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 dark:text-white">My Profile</h1>

        {/* Profile Header with Photo */}
        <div className="flex flex-col sm:flex-row items-center mb-6 sm:mb-8 gap-4 sm:gap-6">
          <div className="relative cursor-pointer group" onClick={() => openPhotoPopup(previewUrl || profileData.profilePhoto)}>
            <img
              src={previewUrl || profileData.profilePhoto}
              alt="Profile"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900 transition-all group-hover:opacity-90"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all">
              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-all" size={24} />
            </div>
          </div>
          <div className="flex flex-col text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-semibold dark:text-white">{user?.username || 'User'}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{user?.email || 'email@example.com'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 overflow-x-auto">
          <nav className="flex space-x-2 sm:space-x-8 min-w-max">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 sm:py-4 px-2 sm:px-3 inline-flex items-center gap-1 sm:gap-2 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'info'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <User size={16} />
              <span className="hidden xs:inline">Personal Information</span>
              <span className="xs:hidden">Info</span>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-3 sm:py-4 px-2 sm:px-3 inline-flex items-center gap-1 sm:gap-2 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'password'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Lock size={16} />
              <span className="hidden xs:inline">Change Password</span>
              <span className="xs:hidden">Password</span>
            </button>
            <button
              onClick={() => setActiveTab('photo')}
              className={`py-3 sm:py-4 px-2 sm:px-3 inline-flex items-center gap-1 sm:gap-2 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'photo'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Upload size={16} />
              <span className="hidden xs:inline">Profile Photo</span>
              <span className="xs:hidden">Photo</span>
            </button>
          </nav>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md dark:bg-red-900 dark:text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md dark:bg-green-900 dark:text-green-300">
            {success}
          </div>
        )}

        {/* Personal Information Tab */}
        {activeTab === 'info' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium dark:text-white">Personal Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                >
                  Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveInfo}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profileData.username}
                    onChange={handleInfoChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInfoChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        username: user?.username || '',
                        email: user?.email || '',
                        profilePhoto: user?.profilePhoto || 'https://ui-avatars.com/api/?name=User'
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div>
            <h3 className="text-lg font-medium mb-4 dark:text-white">Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Profile Photo Tab */}
        {activeTab === 'photo' && (
          <div>
            <h3 className="text-lg font-medium mb-4 dark:text-white">Profile Photo</h3>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
              <div className="w-full md:w-1/3 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0">
                <div className="mb-0 md:mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center md:text-left">Current Photo</p>
                  <div className="flex flex-col items-center">
                    <div className="cursor-pointer group relative" onClick={() => openPhotoPopup(profileData.profilePhoto)}>
                      <img
                        src={profileData.profilePhoto}
                        alt="Current Profile"
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 transition-all group-hover:opacity-90"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all">
                        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-all" size={20} />
                      </div>
                    </div>
                    {/* Only show delete button if not using default avatar */}
                    {!profileData.profilePhoto.includes('ui-avatars.com') && (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="mt-2 px-3 py-1 text-xs sm:text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                        disabled={isLoading}
                      >
                        Delete Photo
                      </button>
                    )}
                  </div>
                </div>

                {previewUrl && (
                  <div className="mb-0 md:mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center md:text-left">Preview</p>
                    <div className="cursor-pointer group relative" onClick={() => openPhotoPopup(previewUrl)}>
                      <img
                        src={previewUrl}
                        alt="New Profile Preview"
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-700 transition-all group-hover:opacity-90"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all">
                        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-all" size={20} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full md:w-2/3 mt-4 md:mt-0">
                <form onSubmit={handleUploadPhoto}>
                  <div className="mb-4">
                    <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Upload New Photo
                    </label>
                    <input
                      type="file"
                      id="profilePhoto"
                      name="profilePhoto"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>

                  {selectedFile && (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Uploading...' : 'Upload Photo'}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
