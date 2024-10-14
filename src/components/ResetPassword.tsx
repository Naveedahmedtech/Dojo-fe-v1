import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SERVER_URL } from '../../api';
import { Link, useParams } from 'react-router-dom';
import Popup from './Popup';

const ResetPassword: React.FC = () => {
  const { userId, token } = useParams<{ userId: string; token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleResetPassword();
      }
    };
    document.addEventListener('keypress', handleKeyPress);

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [password, confirmPassword]);

  const handleResetPassword = async () => {
    try {
      setIsLoading(true);
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      const response = await axios.post(`${SERVER_URL}/auth/reset-password/${userId}/${token}`, {
        newPassword: password,
      });

      setSuccessMessage(response.data.message);
      setErrorMessage('');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setErrorMessage(error.response?.data.message || error.message || 'Failed to reset password');
      setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className={`bg-transparent flex flex-col items-center justify-center`}>
      <h2 className="mt-6 text-center text-2xl text-customColor">Reset Password</h2>
      <div className="max-w-md w-full space-y-8 flex items-center justify-center">
        {errorMessage && (
          <Popup type="red" message={errorMessage} onClose={clearMessages} />
        )}
        {successMessage && (
          <Popup type="green" message={successMessage} onClose={clearMessages} />
        )}
        <div className="mt-8 space-y-6 bg-transparent">
          <div className="rounded shadow-md space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-[320px] px-4 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md rounded-t-md  focus:outline-none focus:ring-customColor focus:border-customColor focus:z-10 text-[16px]"
                placeholder="New Password"
              />
            </div>
            <p className="text-base text-center text-xs mt-1 w-[320px] text-gray-500">
              Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)
            </p>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 ppearance-none rounded-none relative block w-[320px] px-4 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md rounded-t-md focus:outline-none focus:ring-customColor focus:border-customColor focus:z-10 text-[16px]"
                placeholder="Confirm New Password"
              />
            </div>
          </div>

          <div className='flex justify-center'>
            <button
              type="button"
              onClick={handleResetPassword}
              className={`btn btn-orange w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </div>
          <div className="text-center">
            <Link to="/" className="text-base text-customColor rounded border border-customColor px-28 py-2">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;