import React, { useState } from 'react';
import logo from '../../../styles/logo.png';
import { validateLoginForm, ValidationErrors } from '../utils/validation';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../../../context/AuthProvider';
import Alert from '../components/Alert'; // Import the Alert component

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null); // State for alert message
  const { login } = useAuth();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Re-validate email in real-time
    const validationErrors = validateLoginForm(value, password);
    if (validationErrors.email) {
      setErrors((prevErrors) => ({ ...prevErrors, email: validationErrors.email }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, email: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    // Re-validate password in real-time
    const validationErrors = validateLoginForm(email, value);
    if (validationErrors.password) {
      setErrors((prevErrors) => ({ ...prevErrors, password: validationErrors.password }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, password: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateLoginForm(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      setAlertMessage(null);
    } catch (error: any) {
      console.error('Login failed', error);
      setAlertMessage(error.message || 'An error occurred while logging in.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlertMessage(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-[#FF9934] to-[#ffba75] px-5">
      <div className="mb-20">
        <img src={logo} alt="Logo" className="w-48 mx-auto" />
      </div>

      {alertMessage && (
        <Alert message={alertMessage} type="error" onClose={handleCloseAlert} />
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 max-w-md w-full">
        <h2 className="mb-6 text-2xl font-bold text-gray-800 text-center">Login</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            className={`w-full p-3 border-b border-gray-300 bg-transparent text-black text-lg placeholder-gray-400 focus:outline-none focus:border-[#FF9934] transition duration-300 ${errors.email && 'border-red-500'
              }`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            className={`w-full p-3 border-b border-gray-300 bg-transparent text-black text-lg placeholder-gray-400 focus:outline-none focus:border-[#FF9934] transition duration-300 ${errors.password && 'border-red-500'
              }`}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="w-full py-3 text-white rounded-md text-lg font-medium border border-transparent bg-gradient-to-r from-[#FF9934] to-[#ffba75] transition-all duration-500 ease-in-out hover:shadow-xl flex justify-center items-center"
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : 'Login'}
        </button>

        <p className="mt-4 text-sm text-gray-500 text-center cursor-pointer hover:text-gray-700 transition duration-300">
          Forgot password?
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
