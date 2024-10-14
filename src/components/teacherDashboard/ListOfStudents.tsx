import { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import SelectInputsForDashboard from './SelectInputsForDashboard';
import { SERVER_URL } from '../../../api';
import { useAuth } from '../../context/AuthProvider';
import ProfileIcon from '../../styles/icons/profile.png';
import { Link } from 'react-router-dom';
import localForage from 'localforage';
import SortDropdown from './SortDropdown';

interface Course {
  _id: string;
  course_name: string;
  years: number[];
  classes: { _id: string; year_of_beginning: number; class_name: string }[];
}

interface Class {
  _id: string;
  class_name: string;
  year_of_beginning: number;
}

interface User {
  _id: string;
  first_name: string;
  last_name: string;
  online: boolean;
  lastVisited: Date;
}

export default function ListOfStudents({ darkMode }: any) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('Alphabetically');
  const { userInfo, token } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response: any = await axios.get<Course[]>(`${SERVER_URL}/getspecific/courses/${userInfo?._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCourses(response?.data?.courses || []);
        const lastCourseId = await localForage.getItem<string>('lastSelectedCourseId');
        if (lastCourseId) {
          setSelectedCourseId(lastCourseId);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    if (userInfo?._id) {
      fetchCourses();
    }
  }, [userInfo?._id, token]);

  useEffect(() => {
    const fetchClasses = async (courseId: string) => {
      try {
        if (!courseId) {
          setClasses([]);
          setSelectedClassId('');
          setUsers([]);
          return;
        }
        const response = await axios.get<Class[]>(`${SERVER_URL}/getspecific/courses/${courseId}/classes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClasses(response.data || []);
        const lastClassId = await localForage.getItem<string>('lastSelectedClassId');
        if (lastClassId) {
          setSelectedClassId(lastClassId);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    if (selectedCourseId) {
      fetchClasses(selectedCourseId);
    }
  }, [selectedCourseId, token]);

  const handleCourseChange = useCallback(async (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedClassId('');
    await localForage.setItem('lastSelectedCourseId', courseId);
    await localForage.removeItem('lastSelectedClassId');
  }, []);

  const handleClassChange = useCallback(async (classId: string) => {
    setSelectedClassId(classId);
    await localForage.setItem('lastSelectedClassId', classId);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (selectedClassId) {
          await fetchUsersForClass(selectedClassId);
        } else if (selectedCourseId) {
          await fetchUsersForCourse(selectedCourseId);
        } else {
          setUsers([]);
        }
      } catch (error) {
        setUsers([]);
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [selectedClassId, selectedCourseId]);

  const fetchUsersForCourse = async (courseId: string) => {
    try {
      const response = await axios.get<User[]>(`${SERVER_URL}/teacher/course/${courseId}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data || []);
    } catch (error) {
      setUsers([]);
      console.error('Error fetching users for course:', error);
    }
  };

  const fetchUsersForClass = async (classId: string) => {
    try {
      const response = await axios.get<User[]>(`${SERVER_URL}/teacher/class/${classId}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data || []);
    } catch (error) {
      setUsers([]);
      console.error('Error fetching users for class:', error);
    }
  };

  const sortedUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    switch (sortOption) {
      case 'Alphabetically':
        return [...users].sort((a, b) => a.first_name.localeCompare(b.first_name));
      case 'ReverseAlphabetically':
        return [...users].sort((a, b) => b.first_name.localeCompare(a.first_name));
      default:
        return users;
    }
  }, [users, sortOption]);

  return (
    <div className="p-8 max-w-screen-lg mx-auto">
      <div className="text-xl font-bold text-center mb-6">Students</div>
      <SelectInputsForDashboard
        selectedCourseId={selectedCourseId}
        handleCourseChange={handleCourseChange}
        selectedClassId={selectedClassId}
        handleClassChange={handleClassChange}
        courses={courses}
        classes={classes}
      />
      <div className="flex justify-between items-center mb-6">
        <SortDropdown onSortChange={(option) => setSortOption(option)} /> {/* Sort Dropdown */}
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-6 flex flex-start">
        <div className="flex-1">
          {sortedUsers.length > 0 ? (
            <div className="p-4 max-w-[400px]">
              {sortedUsers.map((user, index) => (
                <div
                  key={user._id}
                  className={`flex justify-between items-center px-4 py-2 mb-2 rounded-lg ${index % 2 === 0 ? 'bg-orange-100' : 'bg-orange-50'
                    }`}
                >
                  <div className='flex items-center'>
                    <img src={ProfileIcon} className="w-8 h-8" alt="Profile Icon" />
                    <div className="px-4 text-lg font-medium text-start text-black">{user.first_name} {user.last_name}</div>
                  </div>
                  <Link to={`/results/${user._id}`} className="text-sm text-gray-700 underline ml-4 text-end">
                    see details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-row justify-center items-center space-x-2">
              <img src={ProfileIcon} className="w-5 h-5" alt="Profile Icon" />
              <p className="text-base text-sm text-center">
                No users found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
