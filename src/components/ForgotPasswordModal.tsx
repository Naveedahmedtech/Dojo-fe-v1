import React, { useState } from 'react';
import axios from 'axios';
import { SERVER_URL } from '../../api';
import Popup from './Popup'; 

const ForgotPasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [popup, setPopup] = useState<{ type: '' | 'green' | 'red'; message: string }>({ type: '', message: '' });

  const handleForgotPassword = async () => {
    try {
      await axios.post(`${SERVER_URL}/auth/forgot-password`, { email });
      setPopup({ type: 'green', message: 'Password reset email sent successfully.' });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 400) {
          setPopup({ type: 'red', message: 'Email does not exist.' });
        } else {
          setPopup({ type: 'red', message: 'An error occurred. Please try again later.' });
        }
      } else {
        setPopup({ type: 'red', message: 'An unexpected error occurred. Please try again later.' });
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md md:max-w-lg lg:max-w-[400px] min-w-[300px]">
        <span className="float-right text-gray-500 text-2xl cursor-pointer" onClick={onClose}>&times;</span>
        <div className="text-base text-md mb-4">
          Forgot your password? <br />
          No worries! Simply enter your email address, <br />
          and we'll promptly send you a link to reset it
        </div>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg text-black text-md"
        />
        <button
          onClick={handleForgotPassword}
          className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg shadow-md mb-4"
          style={{ backgroundColor: '#FF9934' }}
        >
          Send a link to reset
        </button>
        {popup.message && (
          <Popup
            type={popup.type}
            message={popup.message}
            onClose={() => setPopup({ type: '', message: '' })}
          />
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;