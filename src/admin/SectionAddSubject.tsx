import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Popup from '../components/Popup';
import { SERVER_URL } from '../../api';
import DefatultSubjectIcon from '../../src/styles/icons/reading.png';

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
}

interface SectionAddSubjectProps {
  universities: University[];
  courses: Course[];
  classes: Class[];
  fetchSubjects: () => void;
}

const SectionAddSubject: React.FC<SectionAddSubjectProps> = ({ universities }) => {
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectIconURL, setSubjectIconURL] = useState('');
  const [subjectErrorMessage, setSubjectErrorMessage] = useState('');
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [useDefaultIcon, setUseDefaultIcon] = useState(true); 
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  useEffect(() => {
    if (selectedUniversityId) {
      fetchCourses(selectedUniversityId);
    }
  }, [selectedUniversityId]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchClasses(selectedCourseId);
    }
  }, [selectedCourseId]);

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

  const handleAddSubject = async () => {
    try {
      if (!selectedUniversityId || !selectedClassId || !subjectName || (!subjectIconURL && !useDefaultIcon)) {
        throw new Error('University ID, class ID, subject name, and subject icon URL are required.');
      }
      const iconURL = useDefaultIcon ? `${DefatultSubjectIcon}` : subjectIconURL;
      await axios.post(`${SERVER_URL}/add/subjects`, {
        university_ref: selectedUniversityId,
        class_ref: selectedClassId,
        subject_name: subjectName,
        subject_icon_url: iconURL,
      });
      setSuccessMessage('Subject added successfully.');
      setShowSuccessToast(true);
      setSubjectName('');
      setSubjectIconURL('');
      setUseDefaultIcon(true); 
    } catch (error) {
      console.error('Error adding subject:', error);
      setSubjectErrorMessage('Error adding subject. Please try again.');
      setShowErrorToast(true);
    }
  };

  const handleCloseError = () => {
    setShowErrorToast(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccessToast(false);
  };

  return (
    <div className="mb-10">
      <h2 className="text-lg text-customColor mb-4">SUBJECTS</h2>
      <div className="flex items-center">
        <select
          value={selectedUniversityId}
          onChange={(e) => {
            setSelectedUniversityId(e.target.value);
            setSelectedCourseId('');
          }}
          className="input-field mr-4"
        >
          <option value="">Select University</option>
          {universities.map((university) => (
            <option key={university._id} value={university._id}>{university.university_name}</option>
          ))}
        </select>
        {selectedUniversityId && (
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setSelectedClassId('');
            }}
            className="input-field mr-4"
            disabled={isLoadingCourses}
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
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="input-field mr-4"
            disabled={isLoadingClasses}
          >
            <option value="">Select Class</option>
            {isLoadingClasses ? (
              <option>Loading...</option>
            ) : (
              classes.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>{classItem.class_name}</option>
              ))
            )}
          </select>
        )}
        <input
          type="text"
          placeholder="Subject Name"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          className="input-field mr-4"
        />
        <input
          type="text"
          placeholder="Subject Icon URL"
          value={subjectIconURL}
          onChange={(e) => {
            setSubjectIconURL(e.target.value);
            setUseDefaultIcon(false); 
          }}
          className="input-field mr-4"
        />
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={useDefaultIcon}
            onChange={(e) => setUseDefaultIcon(e.target.checked)}
            className="mr-1"
          />
          Use default icon
        </label>
      </div>
      <button onClick={handleAddSubject} className="btn btn-orange mt-2" style={{ width: '200px' }}>
        Add Subject
      </button>
      {showErrorToast && <Popup type="red" message={subjectErrorMessage} onClose={handleCloseError} />}
      {showSuccessToast && <Popup type="green" message={successMessage} onClose={handleCloseSuccess} />}
    </div>
  );
};

export default SectionAddSubject;