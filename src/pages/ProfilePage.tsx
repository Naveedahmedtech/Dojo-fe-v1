import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { SERVER_URL } from '../../api';
import Popup from '../components/Popup';
import { useAuth } from '../context/AuthProvider';
import localforage from 'localforage'; 
import useDarkMode from '../hooks/useDarkMode'; 

interface UserData {
  email: string;
  newPassword: string;
  confirmNewPassword: string;
  firstName: string;
  lastName: string;
}

interface ProfilePageProps {
  onSave: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onSave }) => {
  const { userInfo, updateUserInfo } = useAuth();
  const [formData, setFormData] = useState<UserData>({
    email: userInfo?.email || '',
    newPassword: '',
    confirmNewPassword: '',
    firstName: userInfo?.first_name || '',
    lastName: userInfo?.last_name || '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const isDarkMode = useDarkMode();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserData = await localforage.getItem<UserData>('userData');
        if (storedUserData) {
          setFormData(storedUserData);
        }
      } catch (error) {
        console.error('Error fetching data from local storage:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !loading) {
        handleSave();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setSuccessMessage('');
      setErrorMessage('');
  
      const updateData: any = {};
  
      if (userInfo && formData.email !== userInfo.email) updateData.email = formData.email;
      if (userInfo && formData.firstName !== userInfo.first_name) updateData.first_name = formData.firstName;
      if (userInfo && formData.lastName !== userInfo.last_name) updateData.last_name = formData.lastName;
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmNewPassword) {
          throw new Error('New password and confirm new password do not match');
        }
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongPasswordRegex.test(formData.newPassword)) {
          throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)');
        }
        updateData.newPassword = formData.newPassword;
      }
  
      if (Object.keys(updateData).length === 0) {
        throw new Error('No changes detected.');
      }
      await axios.put(`${SERVER_URL}/user/${userInfo?._id}`, updateData);
      setSuccessMessage('Your profile was successfully updated!');
      updateUserInfo(updateData);
      onSave();
    } catch (error: any) { 
      console.error('Error updating user:', error);
      console.error('Error response:', (error as AxiosError).response); 
      setErrorMessage(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
   
  useEffect(() => {
    localforage.setItem('userData', formData);
  }, [formData]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
   <div className={`min-w-[350px] flex justify-center items-center ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex justify-center items-center">
        {loading && <div className="spinner-border text-primary" role="status"></div>}
      </div>
      <div className="mb-4">
        {errorMessage && (
          <Popup type="red" message={errorMessage} onClose={() => setErrorMessage('')} />
        )}
      </div>
      <div className={`z-50 text-base shadow-md rounded px-8 pb-8 mb-4 bg-transparent mt-2`}>
        <h2 className="text-lg mb-6 pt-8">Edit Profile</h2>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2" htmlFor="firstName">
            First Name
          </label>
          <input
            className="shadow appearance-none border text-gray-800 rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            id="firstName"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2" htmlFor="lastName">
            Last Name
          </label>
          <input
            className="shadow appearance-none border text-gray-800 rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
            id="lastName"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border text-gray-800 rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2" htmlFor="newPassword">
            New Password
          </label>
          <div className="relative">
            <input
              className="shadow appearance-none border text-gray-800 rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              id="newPassword"
              type={showPassword ? "text" : "password"} 
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
            />
            <img
              src="https://img.icons8.com/ios/20/FF9934/closed-eye.png"
              alt="toggle password visibility"
              className="absolute top-1/2 transform -translate-y-1/2 right-2 cursor-pointer"
              onClick={toggleShowPassword}
            />
          </div>
          <p className={` text-xs mt-1`}>
            At least 8 characters, one uppercase, one lowercase, one number, one special character
          </p>
        </div>
        <div className="mb-4">
          <label className="block  text-sm font-bold mb-2" htmlFor="confirmNewPassword">
            Confirm New Password
          </label>
          <input
            className="shadow appearance-none border text-gray-800 rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            id="confirmNewPassword"
            type="password"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleChange}
          />
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={toggleShowPassword}
              tabIndex={-1}
            >
            </button>
        </div>
        <button
          className="text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline btn btn-orange"
          type="button"
          onClick={handleSave}
          disabled={loading}
        >
        {loading ? 'Updating...' : 'Update'}
        </button>
      </div>
      {successMessage && (
        <Popup type="green" message={successMessage} onClose={() => setSuccessMessage('')} />
      )}
    </div>
  );
};

export default ProfilePage;