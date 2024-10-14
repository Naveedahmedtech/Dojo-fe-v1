import { useEffect, useState } from 'react';
import axios from 'axios';
import { SERVER_URL } from '../../../api';
import { useAuth } from '../../context/AuthProvider';
import localForage from 'localforage';
import SelectInputsSection from '../modified-design/components/TeacherDashboard/averageGrades/SelectInputsSection';
import AverageGradeChart from '../modified-design/components/TeacherDashboard/examGrades/AverageGradeChart';
import AverageGradeOverTime from '../modified-design/components/TeacherDashboard/examGrades/AverageGradeOverTime';

interface Course {
  _id: string;
  course_name: string;
  years: number[];
  classes: Class[];
}

interface Class {
  _id: string;
  class_name: string;
  year_of_beginning: number;
}

interface Subject {
  _id: string;
  subjectName: string;
  averageGrade: string;  
  chapters?: Chapter[];
  subject_name: string;
}

interface Chapter {
  chapterName: string;
  averageGrade: number;
}

interface GradeByMode {
  doneByMode: string;
  averageGrade: string;  
  averageGradePerDate: string;
  date: string;
  subjectName: string;
  chapterName: string;
  totalCorrect: number;
  totalIncorrect: number;
  totalNotAnsweredYet: number;
  totalQuestions: number;
}

interface GradePerDate {
  date: string; 
  averageGrade: string; 
  totalCorrect: number;
  totalIncorrect: number;
  totalNotAnsweredYet: number;
  totalQuestions: number;
}

interface AverageGradePerDateResponse {
  classId: string;
  gradesPerDate: GradePerDate[];
}

export default function ExamResults({ darkMode }:any) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'1W' | '1M' | '6M'>('1W');
  const [_averageGradePerExamModeDate, setAverageGradePerExamModeDate] = useState<GradeByMode[]>([]);
  const { userInfo, token } = useAuth();
  const [averageGradePerDate, setAverageGradePerDate] = useState<GradePerDate[]>([]);
  const [calendarData, setCalendarData] = useState<{ x: string; y: number }[]>([]);

  
  useEffect(() => {
    if (averageGradePerDate.length > 0) {
      const data = generateCalendarData(averageGradePerDate, selectedPeriod);
      setCalendarData(data);
    }
  }, [averageGradePerDate, selectedPeriod]);

  useEffect(() => {
    fetchCalendarData();
    fetchData 
  }, [selectedCourseId, selectedClassId, selectedSubjectId, token]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response:any = await axios.get<Course[]>(`${SERVER_URL}/getspecific/courses/${userInfo?._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // setCourses(response.data);
        setCourses(response?.data?.courses);
        fetchData();
        fetchCalendarData();
        const lastCourseId = await localForage.getItem<string>('lastSelectedCourseId');
        if (lastCourseId) {
          setSelectedCourseId(lastCourseId);
          fetchData();
          fetchCalendarData();
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, [userInfo?._id, token]);


  useEffect(() => {
    const fetchClasses = async (courseId: string) => {
      try {
        if (!courseId) {
          setClasses([]);
          setSelectedClassId('');
          return;
        }
        const response = await axios.get<Class[]>(`${SERVER_URL}/getspecific/courses/${courseId}/classes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClasses(response.data);
        fetchSubjects(selectedClassId);
        fetchData();
        fetchCalendarData();
        const lastClassId = await localForage.getItem<string>('lastSelectedClassId');
        if (lastClassId) {
          setSelectedClassId(lastClassId);
          fetchData();
          fetchCalendarData();
          fetchSubjects(lastClassId);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    if (selectedCourseId) {
      fetchClasses(selectedCourseId);
    }
  }, [selectedCourseId, token]);


  const fetchSubjects = async (classId: string) => {
    try {
      const response = await axios.get(`${SERVER_URL}/getspecific/classes/${classId}/subjects`);
      setSubjects(response.data);
      setAvailableSubjects(response.data.map((subject: any) => ({
        _id: subject._id,
        subjectName: subject.subjectName,
        averageGrade: parseFloat(subject.averageGrade?.replace('%', '') || '0') || 0,
      })));
      setSelectedSubjectId('');
      fetchData();
      fetchCalendarData();
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]); 
      setAvailableSubjects([]); 
    }
  };

  
  const handleCourseChange = (courseId: string) => {
    if (courseId) {
      setSelectedCourseId(courseId);
      setSelectedClassId('');
      setSubjects([]);
      setSelectedSubjectId('');
      setChapters([]);
      fetchData();
    }
  };
  
  const handleClassChange = (classId: string) => {
    if (classId) {
      setSelectedClassId(classId);
      setSubjects([]);
      setSelectedSubjectId('');
      setChapters([]);
      fetchSubjects(classId);
      fetchData();
    }
  };
  
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    fetchData();
  };

  const fetchData = async () => {
    try {
      let urlGradesByMode = '';
      if (selectedSubjectId) {
        urlGradesByMode = `${SERVER_URL}/teacher/subject/${selectedSubjectId}/average-grade-per-exam-mode`;
      } else if (selectedClassId) {
        urlGradesByMode = `${SERVER_URL}/teacher/class/${selectedClassId}/average-grade-per-exam-mode`;
      } else if (selectedCourseId) {
        urlGradesByMode = `${SERVER_URL}/teacher/course/${selectedCourseId}/average-grade-per-exam-mode`;
      }
  
      if (urlGradesByMode) {
        const responseGrades = await axios.get<{ grades: GradeByMode[] }>(urlGradesByMode, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
  
        const modes = responseGrades.data.grades;
        const examModeGrades = modes.filter(({ doneByMode }) => doneByMode === 'exam');
        
  
        if (selectedSubjectId) {
          const chaptersData = examModeGrades.map(({ chapterName, averageGrade }) => ({
            _id: '', 
            chapterName,
            averageGrade: Number(averageGrade.replace('%', '')), 
          }));
          
          setChapters(chaptersData); 
        }
        setAverageGradePerExamModeDate(examModeGrades);
      }
    } catch (error) {
      console.error('Error fetching average grades:', error);
    }
  };

  const fetchCalendarData = async () => {
    try {
      let urlGradesByDate = '';
      if (selectedSubjectId) {
        urlGradesByDate = `${SERVER_URL}/teacher/subject/${selectedSubjectId}/average-grade-per-date-per-exam-mode`;
      } else if (selectedClassId) {
        urlGradesByDate = `${SERVER_URL}/teacher/class/${selectedClassId}/average-grade-per-date-per-exam-mode`;
      } else if (selectedCourseId) {
        urlGradesByDate = `${SERVER_URL}/teacher/course/${selectedCourseId}/average-grade-per-date-per-exam-mode`;
      }
      if (urlGradesByDate) {
        const response = await axios.get<AverageGradePerDateResponse>(urlGradesByDate, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAverageGradePerDate(response.data.gradesPerDate);
      }
    } catch (error) {
      console.error('Error fetching average grades per date:', error);
    }
  };
  
  useEffect(() => {
    fetchCalendarData();
  }, [selectedCourseId, selectedClassId, selectedSubjectId, token]);
  
  useEffect(() => {
    if (averageGradePerDate.length > 0) {
      const data = generateCalendarData(averageGradePerDate, selectedPeriod);
      setCalendarData(data);
    }
  }, [averageGradePerDate, selectedPeriod]);
  
  const generateCalendarData = (grades: GradePerDate[], selectedPeriod: '1W' | '1M' | '6M') => {
    const currentDate = new Date();
    let startDate: Date, endDate: Date;
    let dataMapping: (date: Date) => { x: string; y: number };
  
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekNames = Array.from({ length: 4 }, (_, i) => {
      const startOfWeek = new Date(currentDate.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
      return `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`;
    }).reverse();
    const monthNames = Array.from({ length: 6 }, (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1).toLocaleString('default', { month: 'long' })).reverse();
  
    switch (selectedPeriod) {
      case '1W':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 6);
        endDate = currentDate;
        dataMapping = (date: Date) => ({
          x: dayNames[date.getDay()],
          y: parseFloat(grades.find(grade => grade.date === date.toISOString().split('T')[0])?.averageGrade.replace('%', '') || '0'),
        });
        break;
  
      case '1M':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        dataMapping = (date: Date) => {
          const weekIndex = Math.floor((date.getDate() - 1) / 7);
          return {
            x: weekNames[weekIndex],
            y: parseFloat(grades.find(grade => grade.date === date.toISOString().split('T')[0])?.averageGrade.replace('%', '') || '0'),
          };
        };
        break;
  
      case '6M':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        dataMapping = (date: Date) => {
          const monthIndex = currentDate.getMonth() - 5 + date.getMonth();
          return {
            x: monthNames[monthIndex],
            y: parseFloat(grades.find(grade => grade.date === date.toISOString().split('T')[0])?.averageGrade.replace('%', '') || '0'),
          };
        };
        break;
  
      default:
        throw new Error('Invalid selectedPeriod');
    }
  
    const data = [];
    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
      data.push(dataMapping(new Date(date)));
    }
  
    return data;
  };
  

  const handlePeriodClick = (period: '1W' | '1M' | '6M') => {
    setSelectedPeriod(period);
  };


  return (
    <div className='main-container-space mb-10'>
      <div className='text-base font-bold text-center mb-6 text-xl'>Exam Results</div>
      <div className="flex justify-around">
        <SelectInputsSection
          selectedCourseId={selectedCourseId}
          selectedClassId={selectedClassId}
          selectedSubjectId={selectedSubjectId}
          courses={courses}
          classes={classes}
          subjects={subjects}
          handleCourseChange={handleCourseChange}
          handleClassChange={handleClassChange}
          handleSubjectChange={handleSubjectChange}
          darkMode={darkMode}
        />
      </div>
      <div className="flex flex-col gap-y-5 px-16 w-full items-stretch">
        {(selectedCourseId || selectedClassId) ? (
          <AverageGradeChart
            data={availableSubjects}
            title="Average Grade in Exam Mode per Course"
            xKey="subjectName"
            yKey="averageGrade"
            per="Per Subject"
          />
        ) : selectedSubjectId ? (
          <AverageGradeChart
            data={chapters}
            title="Average Grade in Exam Mod"
            xKey="chapterName"
              yKey="averageGrade"
              per="Per Chapter"
          />
        ) : null}

        {selectedCourseId && (
          <AverageGradeOverTime
            calendarData={calendarData}
            selectedPeriod={selectedPeriod}
            handlePeriodClick={handlePeriodClick}
          />
        )}
      </div>
    </div>
  );
}
