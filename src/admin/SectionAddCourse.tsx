import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Popup from '../components/Popup';
import { SERVER_URL } from '../../api';
import { Dispatch, SetStateAction } from 'react';

interface University {
  _id: string;
  university_name: string;
}

interface SectionAddCourseProps {
  fetchCourses: () => void;
  updateUniversities: Dispatch<SetStateAction<University[]>>;
  universities: University[];
}

const SectionAddCourse: React.FC<SectionAddCourseProps> = ({ fetchCourses, updateUniversities, universities }) => {
  const [courseName, setCourseName] = useState('');
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [popupMessages, setPopupMessages] = useState<{ type: 'success' | 'error'; message: string }[]>([]);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/getall/universities`);
      updateUniversities(response.data);
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  const handleAddCourse = async () => {
    try {
      if (!selectedUniversityId || !courseName) {
        throw new Error('University ID and course name are required.');
      }
      const courseData = {
        university_ref: selectedUniversityId,
        course_name: courseName
      };
      await axios.post(`${SERVER_URL}/add/courses`, courseData);
      await fetchCourses();
      setCourseName('');
      setPopupMessages(prevMessages => [...prevMessages, { type: 'success', message: 'Course added successfully.' }]);
      await fetchUniversities();
    } catch (error) {
      console.error('Error adding course:', error);
      setPopupMessages(prevMessages => [...prevMessages, { type: 'error', message: 'Error adding course. Please try again.' }]);
    }
  };

  const handleClosePopup = (index: number) => {
    setPopupMessages(prevMessages => prevMessages.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-10">
      <h2 className="text-lg text-customColor mb-4">COURSES</h2>
      <div className="flex items-center">
        <select value={selectedUniversityId} onChange={(e) => setSelectedUniversityId(e.target.value)} className="input-field mr-4">
          <option value="">Select University</option>
          {universities.map((university) => (
            <option key={university._id} value={university._id}>{university.university_name}</option>
          ))}
        </select>
        <input type="text" placeholder="Course Name" value={courseName} onChange={(e) => setCourseName(e.target.value)} className="input-field mr-4" />
      </div>
      <button onClick={handleAddCourse} className="btn btn-orange mt-2" style={{ width: '200px' }}>Add Course</button>
      {popupMessages.map((popup, index) => (
        <Popup key={index} type={popup.type === 'success' ? 'green' : 'red'} message={popup.message} onClose={() => handleClosePopup(index)} />
      ))}
    </div>
  );
};

export default SectionAddCourse;
