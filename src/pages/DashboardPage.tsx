import  { useState, useEffect } from 'react';
import axios from 'axios';
import { SERVER_URL } from '../../api';
import { useAuth } from '../context/AuthProvider';
import Popup from '../components/Popup';
import SearchBarDashboard from '../components/SearchBarDashboard';
import SelectInputsForDashboard from '../components/teacherDashboard/SelectInputsForDashboard';
import AverageGradePerSubjectForCourseClass from '../components/teacherDashboard/AverageGradePerSubjectForCourseClass';
import 'react-circular-progressbar/dist/styles.css';
import localForage from 'localforage';
import AverageScoreSection from '../components/modified-design/components/TeacherDashboard/AverageScoreSection';
import QuestionsDoneSection from '../components/modified-design/components/TeacherDashboard/QuestionsDoneSection';
import ListOfStudentsCard from '../components/modified-design/components/TeacherDashboard/ListOfStudentsCard';
import ExamModeCard from '../components/modified-design/components/TeacherDashboard/ExamModeCard';
import AverageTimeSpent from '../components/modified-design/components/TeacherDashboard/AverageTimeSpent';
import { Link, useSearchParams } from 'react-router-dom';

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

interface PopupMessage {
  type: 'green' | 'red';
  message: string;
}

interface Grade {
  averageGrade: string;
  doneByMode: string;
  subjectId: string;
  subjectName: string;
  totalCorrect: number;
  totalIncorrect: number;
  totalNotAnsweredYet: number;
  totalQuestions: number;
}

interface AverageGradesResponse {
  courseId: string;
  grades: Grade[];
}

const DashboardPage = ({ darkMode }: any) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const { userInfo, token } = useAuth();
  const [averageTimeSpent, setAverageTimeSpent] = useState<string>('');
  const [averageScore, setAverageScore] = useState<number>(0);
  const [popupMessages, setPopupMessages] = useState<PopupMessage[]>([]);
  const [, setUserResults] = useState<any[]>([]);
  const [averageGrade, setAverageGrade] = useState<string | null>(null);
  // click to display the teacher stats
  const [teacherId, setTeacherId] = useState<string>();
  const [checking, setChecking] = useState<boolean>(false);
  const [teacherNotFound, setTeacherNotFound] = useState<string>("");

  const [searchParams] = useSearchParams();
  const universityId = searchParams.get("universityId");

  const fetchTeachers = async () => {
    console.log("JSDFKLJLSDKFSDJ");
    setChecking(true);
    try {
      const response = await axios.get(`${SERVER_URL}/admin/teachers/${universityId}`);

      console.log("sdddd", response.data);
      if (response?.data?.result) {
        setTeacherId(response.data.result?._id);
        setChecking(false);
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setTeacherNotFound("Teacher stats not found for this university");
      }
      console.log("Error fetchTeacher", error?.response?.status);
    }
  }

  useEffect(() => {
    if (universityId) {
      console.log("universityId", universityId)
      fetchTeachers()
    }
  }, [universityId])

  console.log("universityId", universityId);

  useEffect(() => {
    const fetchAverageGrades = async () => {
      try {
        const url = selectedClassId
          ? `${SERVER_URL}/teacher/class/${selectedClassId}/average-grade-per-exam-mode`
          : selectedCourseId
            ? `${SERVER_URL}/teacher/course/${selectedCourseId}/average-grade-per-exam-mode`
            : '';
        const response = await axios.get<AverageGradesResponse>(url);
        const grades = response.data.grades;
        const totalGrades = grades.reduce((acc, grade) => {
          const numericGrade = parseFloat(grade.averageGrade.replace('%', ''));
          return acc + numericGrade;
        }, 0);
        const average = grades.length > 0 ? totalGrades / grades.length : 0;
        const averageGradeFormatted = `${average.toFixed(0)}%`;
        setAverageGrade(averageGradeFormatted);
      } catch (error) {
        console.error('Error fetching average grades:', error);
      } finally {
      }
    };
    if (selectedClassId || selectedCourseId) {
      fetchAverageGrades();
    }
  }, [selectedCourseId, selectedClassId]);

  useEffect(() => {
    if (userInfo?.role === "teacher") {
      fetchCourses()
    }
    if (userInfo?.role === "admin" && teacherId && universityId) {
      fetchCoursesByTeacher()
      setChecking(false)
    }
    if (userInfo?.role === "admin" && !teacherId && !universityId) {
      fetchCourses()
      setChecking(false)
    }
  }, [userInfo, teacherId, checking, universityId]);
  useEffect(() => {
    if (selectedCourseId) {
      fetchClasses(selectedCourseId);
    } else {
      setClasses([]);
      setSelectedClassId('');
    }
  }, [selectedCourseId]);

  const fetchCoursesByTeacher = async () => {
    try {
      const response: any = await axios.get<Course[]>(`${SERVER_URL}/getspecific/courses/${teacherId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCourses(response?.data?.courses);
      console.log("response_teacher", response?.data?.courses);
      // setCourses([{ _id: "hello", course_name: "kjsd", years: [2024], classes: [] }]);
      fetchAverageTimeAndScore();
      const lastCourseId = await localForage.getItem<string>('lastSelectedCourseId');
      if (lastCourseId) {
        setSelectedCourseId(lastCourseId);
        fetchAverageTimeAndScore();
      }
    } catch (error) {
      setCourses([]);
      setClasses([]);
      console.error('Error fetching courses:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response: any = await axios.get<Course[]>(`${SERVER_URL}/getspecific/courses/${userInfo?._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCourses(response?.data?.courses);
      console.log("response_admin", response?.data?.courses);
      // setCourses([{ _id: "hello", course_name: "kjsd", years: [2024], classes: [] }]);
      fetchAverageTimeAndScore();
      const lastCourseId = await localForage.getItem<string>('lastSelectedCourseId');
      if (lastCourseId) {
        setSelectedCourseId(lastCourseId);
        fetchAverageTimeAndScore();
      }
    } catch (error) {
      setCourses([]);
      setClasses([]);
      console.error('Error fetching courses:', error);
    }
  };

  const fetchClasses = async (courseId: string) => {
    try {
      const response = await axios.get<Class[]>(`${SERVER_URL}/getspecific/courses/${courseId}/classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClasses(response.data);
      fetchAverageTimeAndScore();
      const lastClassId = await localForage.getItem<string>('lastSelectedClassId');
      if (lastClassId) {
        setSelectedClassId(lastClassId);
        fetchAverageTimeAndScore();
      }
    } catch (error) {
      setClasses([]);
      console.error('Error fetching classes:', error);
    }
  };

  const handleCourseChange = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedClassId('');
    localForage.removeItem('lastSelectedCourseId');
    localForage.setItem('lastSelectedCourseId', courseId);
    localForage.removeItem('lastSelectedClassId');
  };

  const handleClassChange = async (classId: string) => {
    setSelectedClassId(classId);
    localForage.removeItem('lastSelectedClassId');
    localForage.setItem('lastSelectedClassId', classId);
  };

  const fetchAverageTimeAndScore = async () => {
    if (!selectedCourseId) return;
    try {
      const [timeResponse, scoreResponse] = await Promise.all([
        axios.get<{ averageTimeFormatted: string, percentage: number }>(
          selectedClassId
            ? `${SERVER_URL}/teacher/average-time/class/${selectedClassId}`
            : `${SERVER_URL}/teacher/average-time/course/${selectedCourseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
        axios.get<{ averageGrade: string }>(
          selectedClassId
            ? `${SERVER_URL}/teacher/average-grade/class/${selectedClassId}`
            : `${SERVER_URL}/teacher/average-grade/course/${selectedCourseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
      ]);
      console.log("timeResponse", timeResponse);
      setAverageTimeSpent(formatTime(timeResponse.data.averageTimeFormatted));
      const averageScoreNumber = parseFloat(scoreResponse.data.averageGrade);
      const roundedScore = Math.round(averageScoreNumber);
      setAverageScore(roundedScore);
    } catch (error) {
      setAverageScore(0);
      setAverageTimeSpent('');
      console.error('Error fetching averagetime aspent:', error);
    }
  };

  function formatTime(timeString: any) {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);

    let formattedTime = "";

    if (hours > 0) {
      formattedTime += `${hours} ${hours === 1 ? "hour" : "hours"} `;
    }

    if (minutes > 0) {
      formattedTime += `${minutes} ${minutes === 1 ? "minute" : "minutes"} `;
    }

    if (seconds > 0 || (hours === 0 && minutes === 0)) {
      formattedTime += `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
    }

    return formattedTime.trim();
  }

  const clearPopupMessage = (index: number) => {
    setPopupMessages(prevMessages => prevMessages.filter((_, i) => i !== index));
  };

  const handleSearch = async (query: string) => {
    if (!query) {
      setUserResults([]);
      return;
    }
    try {
      if (!userInfo?.university_name) {
        setUserResults([]);
        return;
      }
      const response = await axios.get<any[]>(
        `${SERVER_URL}/search/users?name=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setUserResults([]);
    }
  };


  return (
    <div className='main-container-space hidden md:block'>
      {
        teacherNotFound ? (
          <>
            <div className='text-center flex flex-col justify-center items-center h-[50vh]'>
              <p className='text-3xl text-red-500'>No results founds!</p>
              <Link to="/admin-home" className='underline mt-5'>Go Back</Link>
            </div>
          </>
        ) :
          (<>
            {popupMessages.map((msg, index) => (
              <Popup key={index} type={msg.type} message={msg.message} onClose={() => clearPopupMessage(index)} />
            ))}
            <div className="flex items-center justify-around flex-wrap gap-y-2">
              <div className="">
                <SelectInputsForDashboard
                  selectedCourseId={selectedCourseId}
                  handleCourseChange={handleCourseChange}
                  selectedClassId={selectedClassId}
                  handleClassChange={handleClassChange}
                  courses={courses}
                  classes={classes}
                />
              </div>
              <div className="">
                <SearchBarDashboard onSearch={handleSearch} />
              </div>
            </div>
            <div className="flex flex-col justify-around items-center md:flex-row">
              <div className="grid grid-cols-12 gap-4 mt-4 px-4 p-4 pt-0 w-full">
                {selectedCourseId && (
                  <>
                    {/* 1st Row 1st Column */}
                    <div className="col-span-12 md:col-span-6">
                      <div className="flex flex-col gap-4 min-w-[400px]">
                        <AverageGradePerSubjectForCourseClass courseId={selectedCourseId} classId={selectedClassId} darkMode={darkMode} />
                        <div className="flex items-center w-full justify-between gap-x-2">
                          <ExamModeCard averageGrade={averageGrade} darkMode={darkMode} />
                          <ListOfStudentsCard darkMode={darkMode} />
                        </div>
                      </div>
                    </div>

                    {/* 1st Row 2nd Column */}
                    <div className="col-span-12 md:col-span-3 min-w-[300px]">
                      <QuestionsDoneSection selectedCourseId={selectedCourseId} selectedClassId={selectedClassId} darkMode={darkMode} />
                    </div>

                    {/* 1st Row 3rd Column */}
                    <div className="col-span-12 md:col-span-3">
                      <div className="flex flex-col gap-4 min-w-[300px]">
                        <AverageScoreSection averageScore={averageScore} darkMode={darkMode} />
                        <AverageTimeSpent averageTimeSpent={averageTimeSpent} darkMode={darkMode} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
          )
      }
    </div >
  );
};

export default DashboardPage;
