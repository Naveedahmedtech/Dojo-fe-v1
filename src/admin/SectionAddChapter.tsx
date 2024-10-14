import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Popup from '../components/Popup';
import { SERVER_URL } from '../../api';

interface SectionAddChapterProps {
  universities: any[];
  courses: any[];
  classes: any[];
  fetchChapters: () => Promise<void>;
  updateUniversities: React.Dispatch<React.SetStateAction<any[]>>;
}

interface Course {
  _id: string;
  course_name: string;
}

interface Class {
  _id: string;
  class_name: string;
}

interface Subject {
  _id: string;
  subject_name: string;
}

const SectionAddChapter: React.FC<SectionAddChapterProps> = ({ universities, updateUniversities }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [chapterErrorMessage, setChapterErrorMessage] = useState('');
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/getall/universities`);
        updateUniversities(response.data);
      } catch (error) {
        setChapterErrorMessage('Error fetching universities. Please try again.');
        setShowErrorToast(true);
      }
    };

    fetchUniversities();
  }, [updateUniversities]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!selectedUniversityId) {
          setCourses([]);
          return;
        }
        const response = await axios.get(`${SERVER_URL}/getspecific/universities/${selectedUniversityId}/courses`);
        setCourses(response.data);
      } catch (error) {
        setChapterErrorMessage('Error fetching courses. Please try again.');
        setShowErrorToast(true);
      }
    };

    fetchCourses();
  }, [selectedUniversityId]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if (!selectedCourseId) {
          setClasses([]);
          return;
        }
        const response = await axios.get(`${SERVER_URL}/getspecific/courses/${selectedCourseId}/classes`);
        setClasses(response.data);
      } catch (error) {
        setChapterErrorMessage('Error fetching classes. Please try again.');
        setShowErrorToast(true);
      }
    };

    fetchClasses();
  }, [selectedCourseId]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClassId) {
        setSubjects([]);
        return;
      }
      setIsLoadingSubjects(true);
      try {
        const response = await axios.get(`${SERVER_URL}/getspecific/classes/${selectedClassId}/subjects`);
        setSubjects(response.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setChapterErrorMessage('Error fetching subjects. Please try again.');
        setShowErrorToast(true);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [selectedClassId]);

  const handleAddChapter = async () => {
    try {
      if (!selectedUniversityId || !selectedClassId || !selectedSubjectId || !chapterName) {
        throw new Error('University, class, subject, and chapter name are required.');
      }
      await axios.post(`${SERVER_URL}/add/chapters`, {
        university_ref: selectedUniversityId,
        class_ref: selectedClassId,
        subject_ref: selectedSubjectId,
        chapter_name: chapterName,
        is_available: isAvailable,
        number_of_questions: 0,
        questions_ref: []
      });
      setChapterErrorMessage('Chapter added successfully.');
      setShowSuccessToast(true);
      setChapterName('');
    } catch (error) {
      console.error('Error adding chapter:', error);
      setChapterErrorMessage('Error adding chapter. Please try again.');
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
      <h2 className="text-lg text-customColor mb-4">CHAPTERS</h2>
      <div className="flex items-center">
        <select
          value={selectedUniversityId}
          onChange={(e) => {
            setSelectedUniversityId(e.target.value);
            setSelectedCourseId('');
            setSelectedClassId('');
            setSelectedSubjectId('');
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
              setSelectedSubjectId('');
            }}
            className="input-field mr-4"
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>{course.course_name}</option>
            ))}
          </select>
        )}
        {selectedCourseId && (
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setSelectedSubjectId('');
            }}
            className="input-field mr-4"
          >
            <option value="">Select Class</option>
            {classes.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>{classItem.class_name}</option>
            ))}
          </select>)}
        {selectedClassId && (
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="input-field mr-4"
          >
            <option value="">Select Subject</option>
            {isLoadingSubjects ? (
              <option>Loading...</option>
            ) : (
              subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.subject_name}</option>
              ))
            )}
          </select>
        )}
        <input
          type="text"
          placeholder="Chapter Name"
          value={chapterName}
          onChange={(e) => setChapterName(e.target.value)}
          className="input-field mr-4"
        />
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="mr-1"
          />
          <span className="ml-2 text-base text-lg">Available</span>
        </label>
      </div>
      <button onClick={handleAddChapter} className="btn btn-orange mt-2" style={{ width: '200px' }}>
        Add Chapter
      </button>
      {showErrorToast && <Popup type="red" message={chapterErrorMessage} onClose={handleCloseError} />}
      {showSuccessToast && <Popup type="green" message="Chapter added successfully." onClose={handleCloseSuccess} />}
    </div>
  );
};

export default SectionAddChapter;
