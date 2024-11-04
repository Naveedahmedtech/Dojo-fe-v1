import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import logo from '../../../styles/orange-logo.png';
import theme from '../../../styles/theme.png';
import user from '../../../styles/user.png';
import book from '../../../styles/book.png';
import stats from '../../../styles/stats.png';
import { useAuth } from '../../../context/AuthProvider';

const Header = ({ darkMode, toggleDarkMode }: any) => {
    const { userInfo, logout, isDarkMode } = useAuth() as any;
    const [userDetails, setUserDetails] = useState({
        firstName: '',
        lastName: '',
        universityName: '',
    });
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className={`shadow-md z-10 hidden md:block  relative ${darkMode || isDarkMode ? 'bg-gray-800' : 'bg-slate-100'}`}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <NavLink to="/">
                            <img
                                className="h-8 w-auto"
                                src={logo} // Your logo path
                                alt="Logo"
                            />
                        </NavLink>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <button
                            type="button"
                            className={`inline-flex items-center justify-center p-2 rounded-md ${darkMode || isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'} focus:outline-none`}
                            onClick={toggleMenu}
                        >
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <nav className="hidden md:flex space-x-4">
                            {(userInfo?.role === 'admin') && (
                                <NavLink
                                    to="/admin-home"
                                    className={({ isActive }) =>
                                        isActive
                                            ? `${darkMode || isDarkMode ? 'text-white' : 'text-black'} underline underline-offset-4 flex items-center font-bold`
                                            : `${darkMode || isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:${darkMode || isDarkMode ? 'text-white' : 'text-black'} flex items-center`
                                    }
                                >
                                    Home
                                </NavLink>
                            )}
                            {(userInfo?.role === 'teacher') && (
                                <NavLink
                                    to="/main"
                                    className={({ isActive }) =>
                                        isActive
                                            ? `${darkMode || isDarkMode ? 'text-white' : 'text-black'} underline underline-offset-4 flex items-center font-bold`
                                            : `${darkMode || isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:${darkMode || isDarkMode ? 'text-white' : 'text-black'} flex items-center`
                                    }
                                >
                                    Main Dashboard
                                </NavLink>
                            )}
                            {(userInfo?.role === 'admin') && (
                                <NavLink
                                    to="/main"
                                    className={({ isActive }) =>
                                        isActive
                                            ? `${darkMode || isDarkMode ? 'text-white' : 'text-black'} underline underline-offset-4 flex items-center font-bold`
                                            : `${darkMode || isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:${darkMode || isDarkMode ? 'text-white' : 'text-black'} flex items-center`
                                    }
                                >
                                    All Stats
                                </NavLink>
                            )}
                            {(userInfo?.role === "admin" || userInfo?.role === "student") && (
                                <>
                                    <NavLink
                                        to="/home"
                                        className={({ isActive }) =>
                                            isActive
                                                ? `${darkMode || isDarkMode ? 'text-white' : 'text-black'} underline underline-offset-4 flex items-center font-bold`
                                                : `${darkMode || isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:${darkMode || isDarkMode ? 'text-white' : 'text-black'} flex items-center`
                                        }
                                    >
                                        <img
                                            className="h-5 w-5 mr-1"
                                            src={book}
                                            alt="Quizzes"
                                        />
                                        Quizzes
                                    </NavLink>
                                    <NavLink
                                        to={`/results/${userInfo?._id}`}
                                        className={({ isActive }) =>
                                            isActive
                                                ? `${darkMode || isDarkMode ? 'text-white' : 'text-black'} underline underline-offset-4 flex items-center font-bold`
                                                : `${darkMode || isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:${darkMode || isDarkMode ? 'text-white' : 'text-black'} flex items-center`
                                        }
                                    >
                                        <img
                                            className="h-5 w-5 mr-1"
                                            src={stats}
                                            alt="My stats"
                                        />
                                        My stats
                                    </NavLink>
                                </>
                            )}
                            {userInfo?.role === 'admin' && (
                                <>
                                    <NavLink
                                        to="/admin/addtodatabase"
                                        className={({ isActive }) =>
                                            isActive
                                                ? `${darkMode || isDarkMode ? 'text-white' : 'text-black'} underline underline-offset-4 flex items-center font-bold`
                                                : `${darkMode || isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:${darkMode || isDarkMode ? 'text-white' : 'text-black'} flex items-center`
                                        }
                                    >
                                        Add to Database
                                    </NavLink>
                                    <NavLink
                                        to="/admin/deletefromdatabase"
                                        className={({ isActive }) =>
                                            isActive
                                                ? `${darkMode || isDarkMode ? 'text-white' : 'text-black'} underline underline-offset-4 flex items-center font-bold`
                                                : `${darkMode || isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:${darkMode || isDarkMode ? 'text-white' : 'text-black'} flex items-center`
                                        }
                                    >
                                        Delete from Database
                                    </NavLink>
                                    <NavLink
                                        to="/admin/feedback"
                                        className={({ isActive }) =>
                                            isActive
                                                ? `${darkMode || isDarkMode ? 'text-white' : 'text-black'} underline underline-offset-4 flex items-center font-bold`
                                                : `${darkMode || isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:${darkMode || isDarkMode ? 'text-white' : 'text-black'} flex items-center`
                                        }
                                    >
                                        Feedback
                                    </NavLink>
                                </>
                            )}
                            {(userInfo?.role === 'teacher') && (
                                <NavLink
                                    to="/course-results"
                                    className={({ isActive }) =>
                                        isActive
                                            ? `${darkMode || isDarkMode ? 'text-white' : 'text-black'} underline underline-offset-4 flex items-center font-bold`
                                            : `${darkMode || isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:${darkMode || isDarkMode ? 'text-white' : 'text-black'} flex items-center`
                                    }
                                >
                                    Course Results
                                </NavLink>
                            )}
                        </nav>
                        <div className="hidden md:flex flex-col text-right">
                            <span className={`${darkMode || isDarkMode ? 'text-white' : 'text-gray-900'} font-bold`}>
                                {userDetails?.firstName + " " + userDetails?.lastName}
                            </span>
                            <span className={`${darkMode || isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                                {userDetails?.universityName || ""}
                            </span>
                        </div>
                        <NavLink to={`/profile/${userInfo?._id}`} className={`${darkMode || isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:${darkMode || isDarkMode ? 'text-white' : 'text-gray-900'} bg-transparent focus:outline-none`}>
                            <img
                                className="h-8 w-8"
                                src={user} // Your user icon path
                                alt="Profile"
                            />
                        </NavLink>
                        <button onClick={handleLogout} className={`${darkMode || isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:${darkMode || isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                            Logout
                        </button>
                        <button className="bg-transparent focus:outline-none" onClick={toggleDarkMode}>
                            <img
                                className="h-8 w-8"
                                src={theme} // Your theme toggle image path
                                alt="Toggle Theme"
                            />
                            <span className="sr-only">Toggle Dark Mode</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className={`${darkMode || isDarkMode ? 'bg-gray-800' : 'bg-slate-100'} md:hidden transition-all duration-300 ease-in-out`}>
                    <div className="px-4 pt-4 pb-6 space-y-4">
                        {(userInfo?.role === "admin" || userInfo?.role === "student") && (
                            <>
                                <NavLink
                                    to="/home"
                                    className={({ isActive }) =>
                                        isActive
                                            ? `block px-4 py-2 rounded-md text-base font-medium ${darkMode || isDarkMode ? 'text-white bg-gray-700' : 'text-black bg-gray-200'}`
                                            : `block px-4 py-2 rounded-md text-base font-medium ${darkMode || isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`
                                    }
                                    onClick={toggleMenu}
                                >
                                    Quizzes
                                </NavLink>
                                <NavLink
                                    to={`/results/${userInfo?._id}`}
                                    className={({ isActive }) =>
                                        isActive
                                            ? `block px-4 py-2 rounded-md text-base font-medium ${darkMode || isDarkMode ? 'text-white bg-gray-700' : 'text-black bg-gray-200'}`
                                            : `block px-4 py-2 rounded-md text-base font-medium ${darkMode || isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`
                                    }
                                    onClick={toggleMenu}
                                >
                                    My stats
                                </NavLink>
                            </>
                        )}
                        {userInfo?.role === 'admin' && (
                            <>
                                <NavLink
                                    to="/admin/addtodatabase"
                                    className={({ isActive }) =>
                                        isActive
                                            ? `block px-4 py-2 rounded-md text-base font-medium ${darkMode || isDarkMode ? 'text-white bg-gray-700' : 'text-black bg-gray-200'}`
                                            : `block px-4 py-2 rounded-md text-base font-medium ${darkMode || isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`
                                    }
                                    onClick={toggleMenu}
                                >
                                    Add to Database
                                </NavLink>
                                <NavLink
                                    to="/admin/deletefromdatabase"
                                    className={({ isActive }) =>
                                        isActive
                                            ? `block px-4 py-2 rounded-md text-base font-medium ${darkMode || isDarkMode ? 'text-white bg-gray-700' : 'text-black bg-gray-200'}`
                                            : `block px-4 py-2 rounded-md text-base font-medium ${darkMode || isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`
                                    }
                                    onClick={toggleMenu}
                                >
                                    Delete from Database
                                </NavLink>
                            </>
                        )}
                        {(userInfo?.role === 'admin' || userInfo?.role === 'teacher') && (
                            <NavLink
                                to="/main"
                                className={({ isActive }) =>
                                    isActive
                                        ? `block px-4 py-2 rounded-md text-base font-medium ${darkMode || isDarkMode ? 'text-white bg-gray-700' : 'text-black bg-gray-200'}`
                                        : `block px-4 py-2 rounded-md text-base font-medium ${darkMode || isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`
                                }
                                onClick={toggleMenu}
                            >
                                Main Dashboard
                            </NavLink>
                        )}
                        <div className="mt-4 border-t border-gray-700 pt-4 px-4">
                            <div className="flex flex-col text-left space-y-1">
                                <span className={`${darkMode || isDarkMode ? 'text-white' : 'text-gray-900'} font-bold text-lg`}>
                                    {userDetails?.firstName + " " + userDetails?.lastName}
                                </span>
                                <span className={`${darkMode || isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                                    {userDetails?.universityName || ""}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 space-y-4 px-4">
                            <NavLink
                                to={`/profile/${userInfo?._id}`}
                                onClick={toggleMenu}
                                className={`${darkMode || isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} flex items-center space-x-3 transition duration-200 ease-in-out`}
                            >
                                <img
                                    className="h-8 w-8"
                                    src={user} // Your user icon path
                                    alt="Profile"
                                />
                                <span className="text-base font-medium">Profile</span>
                            </NavLink>
                            <button
                                onClick={handleLogout}
                                className={`${darkMode || isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} flex items-center space-x-3 text-base font-medium transition duration-200 ease-in-out`}
                            >
                                <span>Logout</span>
                            </button>
                            <button
                                className="bg-transparent focus:outline-none flex items-center space-x-3 transition duration-200 ease-in-out"
                                onClick={toggleDarkMode}
                            >
                                <img
                                    className="h-8 w-8"
                                    src={theme} // Your theme toggle image path
                                    alt="Toggle Theme"
                                />
                                <span className="text-base font-medium">Toggle Theme</span>
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </header>
    );
};

export default Header;
