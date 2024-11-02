import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoIcon from '../styles/icons/logo_orange.png';
import { useAuth } from '../context/AuthProvider';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}


const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  const { userInfo, logout, isDarkMode, token } = useAuth();
  const location = useLocation();
  const [, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    universityName: '',
  });

  useEffect(() => {
    if (userInfo) {
      setUserDetails({
        firstName: userInfo.first_name,
        lastName: userInfo.last_name,
        universityName: userInfo.university_name,
      });
    }
  }, [userInfo]);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={`m-auto shadow-md fixed top-0 left-0 w-full z-50 text-[16px] ${darkMode || isDarkMode ? 'dark:bg-gray-800' : 'bg-slate-100'}`}>
      <div className="mx-auto flex flex-col sm:flex-row justify-center sm:justify-between items-center py-4 px-6 md:px-10">
        <div className="flex items-center mb-2">
          <Link to={token ? '/home' : '/'}>
            <img src={LogoIcon} alt="Logo" style={{ minWidth: '200px', height: '100px', marginRight: '20px' }} />
          </Link>
          {userInfo && (
            <div className={`flex flex-col ${darkMode ? 'text-gray-300' : 'text-black'} ml-4`}>
              <span className="text-customColor text-[14px] font-bold">{userInfo.first_name} {userInfo.last_name}</span>
              <span className="text-customColor text-[14px] font-bold">{userInfo.university_name}</span>
            </div>
          )}
        </div>
        <nav className="flex items-center ml-10 space-x-4 ml-4 text-sm text-center">
          {userInfo && (
            <>
              {(userInfo.role === 'admin' || userInfo.role === 'teacher') && (
                <Link to={`/main`} className={`${location.pathname === `/main` ? 'border-b-2' : ''}`}>Main Dashboard</Link>
              )}
             {(userInfo.role === 'admin' || userInfo.role === 'student') && (
              <>
              <Link to="/home" className={`${location.pathname === '/home' ? 'border-b-2' : ''}`}>Choose Quizzes</Link>
              <Link to={`/results/${userInfo._id}`} className={`${location.pathname === `/results/${userInfo._id}` ? 'border-b-2' : ''}`}> Quizzes' Stats</Link>
              </>
            )}
              <Link to={`/profile/${userInfo._id}`} className={`${location.pathname === `/profile/${userInfo._id}` ? 'border-b-2' : ''}`}>My Profile</Link>
          
              {userInfo.role === 'admin' && (
                <>
                  <Link to="/admin/feedback" className={`${location.pathname === '/admin/feedback' ? 'border-b-2' : ''}`}>FeedBack</Link>
                  <Link to="/admin/addtodatabase" className={`${location.pathname === '/admin/addtodatabase' ? 'border-b-2' : ''}`}>Add to Database</Link>
                  <Link to="/admin/deletefromdatabase" className={`${location.pathname === '/admin/deletefromdatabase' ? 'border-b-2' : ''}`}>Delete from Database</Link>
                </>
              )}
              <button onClick={handleLogout} className="hover:border-b-2">Logout</button>
            </>
          )}
          <button onClick={toggleDarkMode}
          className='w-[18px] min-w-[18px]'>
            <img
              src="https://img.icons8.com/external-outline-berkahicon/18/FF9934/external-dark-mix-ui-social-media-outline-berkahicon.png"
              alt="Dark Mode Toggle"
            />
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
