import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import localforage from 'localforage';
import { SERVER_URL } from '../../api';
import { Navigate } from 'react-router-dom';

interface Chapter {
  _id: string;
  chapter_name: string;
  questions: string[];
}

interface Subject {
  subject_icon_url: string;
  subject_name: string;
  chapters: Chapter[];
}

interface ClassInfo {
  class_name: string;
  subjects: Subject[];
}

interface AdminData {
  universities: any[];
  courses: any[];
  classes: any[];
  subjects: any[];
  chapters: any[];
  questions: any[];
}

interface TeacherData {
  courses: any[];
  classes: any[];
  subjects: any[];
  chapters: any[];
  questions: any[];
}

interface UserInfo {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  class_info: ClassInfo[];
  university_name: string;
  admin_data?: AdminData;
  teacher_data?: TeacherData;
  quizzes_ref: QuizResult[];
}

interface QuizResult {
  _id: string;
  chapters_ref: string[];
  user_ref: string;
  quiz_mode: string;
  total_time_spent: number;
  results_by_chapter_ref: string[];
  date: string;
}

interface AuthContextType {
  token: string | null;
  userInfo: UserInfo | null;
  role: string | null;
  isDarkMode: boolean;
  setDarkMode: (isDarkMode: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserInfo: (updatedUserInfo: Partial<UserInfo>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const authToken = await localforage.getItem<string>('authToken');
        const userData = await localforage.getItem<UserInfo>('userInfo');
        const darkModePreference = await localforage.getItem<boolean>('isDarkMode');
        if (authToken && userData) {
          setToken(authToken);
          setUserInfo(userData);
          if (darkModePreference !== null) {
            setIsDarkMode(darkModePreference);
          }
        }
      } catch (error) {
        console.error('Error fetching data from local storage:', error);
      } finally { 
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${SERVER_URL}/auth/login`, { email, password });
      const { token, userInfo } = response.data;

      const processUserInfo = (userInfo: UserInfo) => {
        const filteredUserInfo: UserInfo = {
          ...userInfo,
          class_info: userInfo.class_info.map((classInfo) => ({
            ...classInfo,
            subjects: classInfo.subjects.map((subject) => ({
              ...subject,
              chapters: subject.chapters,
            })),
          })),
        };
        return filteredUserInfo;
      };

      const filteredUserInfo = processUserInfo(userInfo);

      setToken(token);
      setUserInfo(filteredUserInfo);
      await localforage.setItem('authToken', token);
      await localforage.setItem('userInfo', filteredUserInfo);
      // window.location.href = '/home';
      Navigate({ to: "home" })
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'An error occurred while logging in.');
    }
  };

  const logout = async () => {
    try {
      await localforage.removeItem('authToken');
      await localforage.removeItem('userInfo');
      await localforage.removeItem('userData');
      setToken(null);
      setUserInfo(null);
      // window.location.href = '/';
      Navigate({ to: "/" })
    } catch (error: any) {
      console.error('Logout error:', error.message);
      throw new Error('An error occurred while logging out.');
    }
  };

  const updateUserInfo = (updatedUserInfo: Partial<UserInfo>) => {
    setUserInfo((prevUserInfo) => {
      const newUserInfo = { ...prevUserInfo, ...updatedUserInfo } as UserInfo;
      localforage.setItem('userInfo', newUserInfo);
      return newUserInfo;
    });
  };

  const setDarkMode = async (isDarkMode: boolean) => {
    try {
      setIsDarkMode(isDarkMode);
      await localforage.setItem('isDarkMode', isDarkMode);
    } catch (error) {
      console.error('Error setting dark mode preference:', error);
    }
  };

  const authContextValue: AuthContextType = {
    token,
    userInfo,
    isDarkMode,
    role: userInfo ? userInfo.role : null,
    setDarkMode,
    login,
    logout,
    updateUserInfo,
    isLoading
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};
