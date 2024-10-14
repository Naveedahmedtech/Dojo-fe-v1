import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Popup from '../components/Popup';
import { SERVER_URL } from '../../api';

interface University {
  _id: string;
  university_name: string;
}

interface Course {
  _id: string;
  course_name: string;
}

interface Class {
  _id: string;
  class_name: string;
  year_of_beginning: number;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  selectedCourseId: string;
  selectedClassIds: string[];
}

const initialUserState: User = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  selectedCourseId: '',
  selectedClassIds: []
};

const SectionAddUser: React.FC = () => {
  const [role, setRole] = useState('');
  const [users, setUsers] = useState<User[]>([initialUserState]);
  const [userErrorMessage, setUserErrorMessage] = useState('');
  const [userShowErrorToast, setUserShowErrorToast] = useState(false);
  const [userShowSuccessToast, setUserShowSuccessToast] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [universitiesList, setUniversitiesList] = useState<University[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const universitiesResponse = await axios.get(`${SERVER_URL}/getall/universities`);
        setUniversitiesList(universitiesResponse.data);
      } catch (error) {
        console.error('Error fetching universities:', error);
      }
    };
    fetchUniversities();
  }, []);

  const fetchCourses = async (universityId: string) => {
    setIsLoadingCourses(true);
    try {
      const response = await axios.get(`${SERVER_URL}/getspecific/universities/${universityId}/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchClasses = async (courseId: string) => {
    setIsLoadingClasses(true);
    try {
      const response = await axios.get(`${SERVER_URL}/getspecific/courses/${courseId}/classes`);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const generatePassword = (): string => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=';
    return Array.from({ length: 8 }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
  };

  const handleChange = (index: number, key: keyof User, value: string | string[]) => {
    const updatedUsers = [...users];
    if (key === 'selectedClassIds') {
      updatedUsers[index][key] = value as string[];
    } else if (key === 'password') {
      if (value === 'generate') {
        updatedUsers[index][key] = generatePassword();
      } else {
        updatedUsers[index][key] = value as string;
      }
    } else {
      updatedUsers[index][key] = value as string;
    }
    setUsers(updatedUsers);
  };

  const handleAddUser = () => {
    const newEmptyUser: User = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      selectedCourseId: '',
      selectedClassIds: []
    };
    setUsers([...users, newEmptyUser]);
  };

  const handleRemoveUser = (index: number) => {
    const updatedUsers = [...users];
    updatedUsers.splice(index, 1);
    setUsers(updatedUsers);
  };

  const handleAddUsers = async () => {
    try {
      const usersToAdd = users.filter(user => user.firstName && user.lastName && user.email);
      if (usersToAdd.length === 0) {
        throw new Error('Please fill in all required fields.');
      }
      if (!selectedUniversityId) {
        throw new Error('Please select a university.');
      }

      const usersData = usersToAdd.map(user => ({
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        password: user.password ? user.password : generatePassword(),
        university_ref: selectedUniversityId,
        classes_ref: user.selectedClassIds,
        role: role
      }));
      await axios.post(`${SERVER_URL}/add/users`, usersData);
      setUserErrorMessage('Users added successfully.');
      setUserShowSuccessToast(true);
    } catch (error) {
      console.error('Error adding users:', error);
      setUserShowErrorToast(true);
    }
  };

  const handleCloseError = () => {
    setUserShowErrorToast(false);
    setUserShowSuccessToast(false);
  };

  const handleReset = () => {
    const resetUsers = users.map(() => ({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      selectedCourseId: '',
      selectedClassIds: []
    }));
    setUsers(resetUsers);
    setRole('');
    setSelectedUniversityId('');
    setSelectedCourseId('');
    setClasses([]);
  };

  return (
    <div>
      <h2 className="text-lg text-customColor mb-4">USERS</h2>
      <div className="flex flex-wrap">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input-field mr-4 mb-4"
        >
          <option value="">Select Role</option>
          <option value="student">student</option>
          <option value="teacher">teacher</option>
          <option value="admin">admin</option>
        </select>
        <select
          value={selectedUniversityId}
          onChange={(e) => {
            setSelectedUniversityId(e.target.value);
            setSelectedCourseId('');
            fetchCourses(e.target.value);
          }}
          className="input-field mr-4 mb-4"
        >
          <option value="">Select University</option>
          {universitiesList.map((university) => (
            <option key={university._id} value={university._id}>{university.university_name}</option>
          ))}
        </select>
        {selectedUniversityId && (
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              fetchClasses(e.target.value);
            }}
            className="input-field mr-4 mb-4"
          >
            <option value="">Select Course</option>
            {isLoadingCourses ? (
              <option>Loading...</option>
            ) : (
              courses.map((course) => (
                <option key={course._id} value={course._id}>{course.course_name}</option>
              ))
            )}
          </select>
        )}
        {selectedCourseId && (
          <div className="input-field mr-4 mb-4">
            {isLoadingClasses ? (
              <span>Loading...</span>
            ) : (
              classes.map((classItem) => (
                <div key={classItem._id} className="mb-2">
                  <input
                    type="checkbox"
                    id={classItem._id}
                    value={classItem._id}
                    checked={users[0]?.selectedClassIds.includes(classItem._id)}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      const classId = e.target.value;
                      const updatedSelectedClassIds = isChecked
                        ? [...users[0]?.selectedClassIds, classId]
                        : users[0]?.selectedClassIds.filter((id) => id !== classId);
                      handleChange(0, 'selectedClassIds', updatedSelectedClassIds);
                    }}
                  />
                  <label htmlFor={classItem._id} className="text-gray-500 ml-2">
                    {classItem.class_name} ({classItem.year_of_beginning})
                  </label>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {users.map((user, index) => (
        <div key={index} className="flex flex-wrap mb-4">
          <input
            type="text"
            value={user.firstName}
            onChange={(e) => handleChange(index, 'firstName', e.target.value)}
            placeholder="First Name"
            className="input-field mr-4 mb-4"
          />
          <input
            type="text"
            value={user.lastName}
            onChange={(e) => handleChange(index, 'lastName', e.target.value)}
            placeholder="Last Name"
            className="input-field mr-4 mb-4"
          />
          <input
            type="email"
            value={user.email}
            onChange={(e) => handleChange(index, 'email', e.target.value)}
            placeholder="Email"
            className="input-field mr-4 mb-4"
          />
          <input
            type="text"
            value={user.password}
            onChange={(e) => handleChange(index, 'password', e.target.value)}
            placeholder="Password"
            className="input-field mr-4 mb-4"
          />
          <button onClick={() => handleChange(index, 'password', 'generate')} className="flex items-center mt-2 border border-customColor rounded text-customColor btn mb-4">Generate Password</button>
          {users.length > 1 && (
            <button onClick={() => handleRemoveUser(index)} className="flex items-center mt-2 border border-customColor rounded text-customColor btn mb-4">
              Remove
            </button>
          )}
          {selectedCourseId && (
            <div className="input-field mr-4 mb-4">
              {isLoadingClasses ? (
                <span>Loading...</span>
              ) : (
                classes.map((classItem) => (
                  <div key={classItem._id} className="mb-2">
                    <input
                      type="checkbox"
                      id={`${index}-${classItem._id}`}
                      value={classItem._id}
                      checked={user.selectedClassIds.includes(classItem._id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const classId = e.target.value;
                        const updatedSelectedClassIds = isChecked
                          ? [...user.selectedClassIds, classId]
                          : user.selectedClassIds.filter((id) => id !== classId);
                        handleChange(index, 'selectedClassIds', updatedSelectedClassIds);
                      }}
                    />
                    <label htmlFor={`${index}-${classItem._id}`} className="text-gray-500 ml-2">
                      {classItem.class_name} ({classItem.year_of_beginning})
                    </label>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
      <div className='flex flex-row space-x-4'>
        <button onClick={handleAddUser} className="flex items-center mt-2 border border-customColor rounded text-customColor btn mb-4">
          One more user
        </button>
        <button onClick={handleReset} className="flex items-center mt-2 border border-customColor rounded text-customColor btn mb-4">
          Reset
        </button>
      </div>
      <div>
        <button onClick={handleAddUsers} className="btn btn-orange">
          Add Users
        </button>
      </div>
      {userShowErrorToast && (
        <Popup type="red" message={userErrorMessage} onClose={handleCloseError} />
      )}
      {userShowSuccessToast && (
        <Popup type="green" message="Users added successfully!" onClose={handleCloseError} />
      )}
    </div>
  );
};

export default SectionAddUser;