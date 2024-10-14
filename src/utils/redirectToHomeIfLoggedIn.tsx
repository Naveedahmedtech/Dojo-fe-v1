import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import Login from '../components/modified-design/Login';

const RedirectToHomeIfLoggedIn: React.FC = () => {
  const { token, role } = useAuth();

  if (token) {
    if (role === 'teacher') {
      return <Navigate to="/main" />;
    } else if (role === 'admin') {
      return <Navigate to="/admin-home" />;
    }
    else if (role === 'student') {
      return <Navigate to="/home" />;
    } else {
      return <Navigate to="/" />;
    }
  }

  return <Login />;
  // return <StartPage />;
};

export default RedirectToHomeIfLoggedIn;
