import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Popup from '../components/Popup';
import { SERVER_URL } from '../../api';

interface Course {
  _id: string;
  course_name: string;
}

interface University {
  _id: string;
  university_name: string;
}

interface SectionAddClassProps {
  updateUniversities: React.Dispatch<React.SetStateAction<University[]>>;
  universities: University[];
  courses: Course[]; 
}

const SectionAddClass: React.FC<SectionAddClassProps> = ({ updateUniversities, universities }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [yearOfBeginning, setYearOfBeginning] = useState('');
  const [className, setClassName] = useState('');
  const [popupMessages, setPopupMessages] = useState<{ type: 'success' | 'error'; message: string }[]>([]);

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [selectedUniversityId]);

  const fetchUniversities = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/getall/universities`);
      updateUniversities(response.data);
    } catch (error) {
      displayError('Error fetching universities. Please try again.');
      console.error('Error fetching universities:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      if (!selectedUniversityId) {
        setCourses([]);
        return;
      }
      const response = await axios.get(`${SERVER_URL}/getspecific/universities/${selectedUniversityId}/courses`);
      setCourses(response.data);
    } catch (error) {
      displayError('Error fetching courses. Please try again.');
      console.error('Error fetching courses:', error);
    }
  };

  const displayError = (message: string) => {
    setPopupMessages(prevMessages => [...prevMessages, { type: 'error', message }]);
  };

  const displaySuccess = (message: string) => {
    setPopupMessages(prevMessages => [...prevMessages, { type: 'success', message }]);
  };

  const handleAddClass = async () => {
    try {
      if (!selectedUniversityId) {
        console.error("University ID is required.");
        throw new Error('University ID is required.');
      }
      if (!selectedCourseId) {
        console.error("Course ID is required.");
        throw new Error('Course ID is required.');
      }
      if (!yearOfBeginning) {
        console.error("Year is required.");
        throw new Error('Year is required.');
      }
      if (!className) {
        console.error("Class Name is required.");
        throw new Error('Class Name is required.');
      }
  
      await axios.post(`${SERVER_URL}/add/classes`, {
        university_ref: selectedUniversityId,
        course_ref: selectedCourseId,
        year_of_beginning: parseInt(yearOfBeginning),
        class_name: className
      });
  
      displaySuccess('Class added successfully.');
      setSelectedUniversityId('');
      setSelectedCourseId('');
      setYearOfBeginning('');
      setClassName('');
    } catch (error) {
      if (error instanceof Error) {
        displayError(error.message);
        console.error('Error adding class:', error.message);
      } else {
        displayError('An unknown error occurred.');
        console.error('An unknown error occurred:', error);
      }
    }
  };

  const handleClosePopup = (index: number) => {
    setPopupMessages(prevMessages => prevMessages.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-10">
      <h2 className="text-lg text-customColor mb-4">CLASSES</h2>
      <div className="flex items-center mb-4">
        <select value={selectedUniversityId} onChange={(e) => setSelectedUniversityId(e.target.value)} className="input-field mr-4">
          <option key="default" value="">Select University</option>
          {universities.map((university) => (
            <option key={university._id} value={university._id}>{university.university_name}</option>
          ))}
          {universities.length === 0 && (
            <option key="no-university" disabled>No universities available</option>
          )}
        </select>
        {selectedUniversityId && (
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="input-field mr-4"
          >
            <option key="default" value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>{course.course_name}</option>
            ))}
            {courses.length === 0 && (
              <option key="no-courses" disabled>No courses available for this university</option>
            )}
          </select>
        )}
        <input
          type="number"
          placeholder="Year"
          value={yearOfBeginning}
          onChange={(e) => setYearOfBeginning(e.target.value)}
          className="input-field mr-4"
          min={2020}
          max={2024}
        />
        <input
          type="text"
          placeholder="Class Name"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="input-field mr-4"
        />
      </div>
      <button onClick={handleAddClass} className="btn btn-orange mt-2" style={{ width: '200px' }}>Add Class</button>
      {popupMessages.map((popup, index) => (
        <Popup key={index} type={popup.type === 'success' ? 'green' : 'red'} message={popup.message} onClose={() => handleClosePopup(index)} />
      ))}
    </div>
  );
};

export default SectionAddClass;