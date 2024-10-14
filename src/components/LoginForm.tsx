import React, { FormEvent, useCallback, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import useLoginForm from '../hooks/useLoginForm';
import Popup from './Popup';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { email, password, handleChange } = useLoginForm();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        await login(email, password); 
        setErrorMessage('');
      } catch (error: any) {
        console.error('Login error:', error);
        setErrorMessage(error.message || 'An error occurred while logging in.');
      }
    },
    [login, email, password]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any); 
    }
  };

  const handleClosePopup = () => {
    setErrorMessage('');
  };

  return (
    <>
      {errorMessage && (
        <Popup
          type="red"
          message={errorMessage}
          onClose={handleClosePopup}
        />
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-4 border rounded-lg text-black"
            autoComplete="email"
            required
          />
          <label htmlFor="password" className="block mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 mb-4 border rounded-lg text-black"
            autoComplete="current-password"
            required
          />
          <button
            type="submit"
            className="w-full h-[42px] btn btn-orange text-white px-4 py-2 rounded-lg shadow-md mb-1 mt-8"
            style={{ backgroundColor: '#FF9934' }}
          >
            Login
          </button>
        </div>
      </form>
    </>
  );
};

export default LoginForm;