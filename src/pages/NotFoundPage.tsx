import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider'; 

const NotFoundPage: React.FC = () => {
  const { token, role } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (token) {
      if (role === 'admin' || role === 'teacher') {
        navigate('/main');
      } else if (role === 'student') {
        navigate('/home');
      }
    } else {
      navigate('/');
    }
  }, [token, role, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <br />
      <h1 className="text-4xl mb-4">404</h1>
      <p className="text-2xl mb-8">Page Not Found</p>
      <Link
        to={token ? (role === 'admin' || role === 'teacher' ? '/main' : '/home') : '/'}
        className="px-4 py-2 rounded text-base shadow-md mb-4 border border-customColor"
      >
        Back
      </Link>
    </div>
  );
};

export default NotFoundPage;