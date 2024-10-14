import { useEffect, useState } from 'react';
import axios from 'axios';
import SelectInputsForDashboard from './SelectInputsForDashboard';
import { SERVER_URL } from '../../../api';
import { useAuth } from '../../context/AuthProvider';
import { VictoryChart, VictoryAxis, VictoryLine, VictoryScatter, VictoryBar, VictoryTheme } from 'victory';
import AverageGradeModeCard from './AverageGradeModeCard';
import localForage from 'localforage';
import SelectSubject from './SelectSubject';
import DashboardHeader from '../modified-design/components/TeacherDashboard/averageGrades/DashboardHeader';
import SelectInputsSection from '../modified-design/components/TeacherDashboard/averageGrades/SelectInputsSection';
import AverageGradeChartSection from '../modified-design/components/TeacherDashboard/averageGrades/AverageGradeChartSection';
import PeriodSelectionSection from '../modified-design/components/TeacherDashboard/averageGrades/PeriodSelectionSection';
import AverageGradeModeSection from '../modified-design/components/TeacherDashboard/averageGrades/AverageGradeModeSection';

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
  subject_name: string;
  averageGrade: string;
  chapters?: Chapter[];
}

interface Chapter {
  chapterName: string;
  averageGrade: number;
}

interface GradeByMode {
  doneByMode: string;
  averageGrade: string;
}

type GradeByDate = {
  x: string;
  chapterId: string;
  chapterName: string;
  date: string;
  grade: string;
};

export const AverageGradeDetails = ({ darkMode }: any) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [percentageByMode, setPercentageByMode] = useState<{ [key: string]: number }>({
    learn: 0,
    random: 0,
    exam: 0,
  });
  const { userInfo, token } = useAuth();
  const [gradeByDate, setGradeByDate] = useState<GradeByDate[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'1W' | '1M' | '6M'>('1W');
  const [, setSelectedType] = useState<'course' | 'class' | 'subject'>('subject');

  const generateCalendarData = (
    grades: GradeByDate[],
    selectedPeriod: '1W' | '1M' | '6M'
  ) => {
    const currentDate = new Date();
    let startDate: Date, endDate: Date;
    let dataMapping: any;
    // let dataMapping: (date: Date) => { x: string, y: number };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Group grades by day
    const groupGradesByDay = (grades: GradeByDate[]) => {
      const dailyGrades: { [key: string]: number[] } = {};

      grades.forEach((grade) => {
        const date = new Date(grade.date).toISOString().split('T')[0];

        if (!dailyGrades[date]) {
          dailyGrades[date] = [];
        }
        dailyGrades[date].push(parseFloat(grade.grade.replace('%', '')));
      });

      return Object.keys(dailyGrades)?.map(date => {
        const grades = dailyGrades[date];
        const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
        return { date, average };
      });
    };

    // Get month name
    const getMonthName = (date: Date): string => {
      const monthNames = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
      ];
      return monthNames[date.getMonth()];
    };

    // Group grades by month
    const groupGradesByMonth = (grades: GradeByDate[]) => {
      const monthlyGrades: { [key: string]: number[] } = {};

      grades.forEach((grade) => {
        const date = new Date(grade.date);
        const monthName = getMonthName(date);

        if (!monthlyGrades[monthName]) {
          monthlyGrades[monthName] = [];
        }
        monthlyGrades[monthName].push(parseFloat(grade.grade.replace('%', '')));
      });

      return Object.keys(monthlyGrades)?.map(month => {
        const grades = monthlyGrades[month];
        const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
        return { month, average };
      });
    };

    switch (selectedPeriod) {
      case '1W':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 6); // Start of the week
        endDate = currentDate;
        const dailyAverages = groupGradesByDay(grades);
        dataMapping = (date: Date) => {
          const dateString = date.toISOString().split('T')[0];
          const averageGrade = dailyAverages.find(day => day.date === dateString)?.average || 0;
          return {
            x: dayNames[date.getDay()],
            y: averageGrade,
          };
        };
        break;

      case '1M':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const weeklyAverages = groupGradesByWeek(grades, startDate, endDate);
        dataMapping = (weekData: any) => ({
          x: weekData.week,
          y: weekData.average,
        });
        return weeklyAverages?.map(dataMapping);

      case '6M':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);
        endDate = currentDate;
        const monthlyAverages = groupGradesByMonth(grades);
        dataMapping = (monthData: any) => ({
          x: monthData.month,
          y: monthData.average,
        });
        return monthlyAverages?.map(dataMapping);

      default:
        throw new Error('Invalid selectedPeriod');
    }

    // Create data array for the chart
    const data = [];
    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
      data.push(dataMapping(new Date(date)));
    }

    return data;
  };

  // Additional function to group grades by week
  const groupGradesByWeek = (grades: GradeByDate[], startDate: Date, endDate: Date) => {
    const weekAverages: any = [];
    const weekCounts: any = {};

    grades.forEach(({ date, grade }: any) => {
      const currentDate = new Date(date);
      if (currentDate >= startDate && currentDate <= endDate) {
        const weekStartDate = new Date(currentDate);
        weekStartDate.setDate(currentDate.getDate() - currentDate.getDay()); // Get start of the week
        const weekKey = `${weekStartDate.toISOString().split('T')[0]}`; // Get a string representation of the date

        if (!weekCounts[weekKey]) {
          weekCounts[weekKey] = { total: 0, count: 0 };
        }
        weekCounts[weekKey].total += parseFloat(grade.replace('%', ''));
        weekCounts[weekKey].count += 1;
      }
    });

    for (const weekKey in weekCounts) {
      const { total, count } = weekCounts[weekKey];
      weekAverages.push({
        week: weekKey,
        average: total / count,
      });
    }

    weekAverages.sort((a: any, b: any) => new Date(a.week).getTime() - new Date(b.week).getTime());

    return weekAverages;
  };


  const calendarData = generateCalendarData(gradeByDate, selectedPeriod);
  console.log("calendarData", calendarData);
  const handlePeriodClick = (period: '1W' | '1M' | '6M') => {
    setSelectedPeriod(period);
  };

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

        const lastCourseId = await localForage.getItem<string>('lastSelectedCourseId');
        if (lastCourseId) {
          setSelectedCourseId(lastCourseId);
          fetchChartData('course', lastCourseId);
          setSelectedType('course');
          fetchGradesByDate();
          fetchGradesByMode();
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
        console.log("response.data", response.data);
        setClasses(response.data);
        fetchSubjects(selectedClassId);
        const lastClassId = await localForage.getItem<string>('lastSelectedClassId');
        if (lastClassId) {
          setSelectedClassId(lastClassId);
          fetchChartData('class', lastClassId);
          setSelectedType('class');
          fetchGradesByDate();
          fetchGradesByMode();
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
      setAvailableSubjects(response.data?.map((subject: any) => ({
        _id: subject._id,
        subjectName: subject.subjectName,
        averageGrade: parseFloat(subject.averageGrade?.replace('%', '') || '0') || 0,
      })));
      setSelectedSubjectId('');
      setSelectedType('subject');
      fetchGradesByDate();
      fetchGradesByMode();
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
      setAvailableSubjects([]);
      setSubjects([]);
      setSelectedSubjectId('');
      setChapters([]);
      fetchChartData('course', courseId);
      fetchGradesByDate();
      fetchGradesByMode();
    }
  };

  const handleClassChange = (classId: string) => {
    if (classId) {
      setSelectedClassId(classId);
      setAvailableSubjects([]);
      setSubjects([]);
      setSelectedSubjectId('');
      setChapters([]);
      fetchChartData('class', classId);
      fetchSubjects(classId);
      fetchGradesByDate();
      fetchGradesByMode();
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setChapters([]);
    fetchChartData('subject', subjectId);
    fetchGradesByDate();
    fetchGradesByMode();
  }

  const fetchChartData = async (type: 'course' | 'class' | 'subject', id: string): Promise<void> => {
    try {
      let url = '';
      switch (type) {
        case 'course':
          url = `${SERVER_URL}/teacher/course/${id}/grades`;
          break;
        case 'class':
          url = `${SERVER_URL}/teacher/class/${id}/grades`;
          break;
        case 'subject':
          url = `${SERVER_URL}/teacher/subject/${id}/grades`;
          break;
        default:
          throw new Error('Invalid type for fetchChartData');
      }

      const response = await axios.get<any>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (type === 'subject') {
        if (!response.data.chapters) {
          throw new Error('No chapters found for this subject');
        }
        console.log("ABG", response);
        setChapters(response.data.chapters?.map((chapter: any) => ({
          chapterName: chapter.chapterName,
          averageGrade: parseFloat(chapter.averageGrade?.replace('%', '') || '0') || 0,
        })));
      } else if (type === 'class') {
        if (!response.data.subjects) {
          throw new Error('No subjects found');
        }

        setAvailableSubjects(response.data.subjects?.map((subject: any) => ({
          _id: subject.subjectId,
          subjectName: subject.subjectName,
          averageGrade: parseFloat(subject.overallAverageGrade?.replace('%', '') || '0') || 0,
        })));
      } else if (type === 'course') {
        if (!response.data.subjects) {
          throw new Error('No subjects found');
        }

        console.log("ABGC", response.data, url);
        setAvailableSubjects(response.data.subjects?.map((subject: any) => ({
          _id: subject.subjectId,
          subjectName: subject.subjectName,
          averageGrade: parseFloat(subject.overallAverageGrade?.replace('%', '') || '0') || 0,
        })));
      }
    } catch (error: any) {
      console.error(`Error fetching ${type} data:`, error.response?.data || error.message);
    }
  };




  const fetchGradesByMode = async () => {
    try {
      let url = '';
      if (selectedSubjectId) {
        url = `${SERVER_URL}/teacher/subject/${selectedSubjectId}/average-grade-per-mode`;
      } else if (selectedClassId) {
        url = `${SERVER_URL}/teacher/class/${selectedClassId}/average-grade-per-mode`;
      } else if (selectedCourseId) {
        url = `${SERVER_URL}/teacher/course/${selectedCourseId}/average-grade-per-mode`;
      }

      if (url) {
        const response = await axios.get<{ grades: GradeByMode[] }>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("mode", response);

        const modes = response.data.grades;
        const percentages: any = {
          learn: 0,
          random: 0,
          exam: 0,
        };

        modes.forEach(({ doneByMode, averageGrade }) => {
          // Remove '%' sign and convert to a number
          const percentage = parseFloat(averageGrade.replace('%', ''));
          console.log(percentage);
          console.log("percentages", { percentages, averageGrade, url });

          if (doneByMode === 'learn') {
            percentages.learn = percentage;
          } else if (doneByMode === 'random') {
            percentages.random = percentage;
          } else if (doneByMode === 'exam') {
            percentages.exam = percentage;
          }
        });

        setPercentageByMode({
          learn: percentages.learn,
          random: percentages.random,
          exam: percentages.exam,
        });
      }
    } catch (error) {
      console.error('Error fetching average grade by mode:', error);
    }
  };


  const fetchGradesByDate = async () => {
    try {
      let url = '';
      if (selectedSubjectId) {
        url = `${SERVER_URL}/teacher/subject/${selectedSubjectId}/average-grade-per-date`;
      } else if (selectedClassId) {
        url = `${SERVER_URL}/teacher/class/${selectedClassId}/average-grade-per-date`;
      } else if (selectedCourseId) {
        url = `${SERVER_URL}/teacher/course/${selectedCourseId}/average-grade-per-date`;
      }

      if (url) {
        const response = await axios.get<{ grades: GradeByDate[] }>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("grades", { grades: response.data, url })

        const grades = response.data.grades?.map((gradeEntry) => {
          const { chapterId, chapterName, date, grade } = gradeEntry;
          return {
            x: date,
            chapterId,
            chapterName,
            grade,
            date,
          };
        });

        setGradeByDate(grades);
      }
    } catch (error) {
      console.error('Error fetching average grade by date:', error);
    }
  };

  return (
    <div className="main-container-space mb-10">
      <DashboardHeader darkMode={darkMode} />
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
      <div className="flex flex-wrap px-5 lg:px-52 w-full items-stretch">
        {selectedCourseId && (
          <>
            <div className="w-full">
              <AverageGradeChartSection
                selectedCourseId={selectedCourseId}
                darkMode={darkMode}
                chapters={chapters}
                availableSubjects={availableSubjects}
                selectedSubjectId={selectedSubjectId}
                selectedClassId={selectedClassId}
              />
            </div>
          </>
        )
        }
      </div >
      <div>
        {selectedCourseId && (
          <div className="flex flex-wrap justify-around px-40 mt-10">
            <div className="w-full lg:w-1/2 lg:flex-shrink-0 lg:flex-grow-0">
              <PeriodSelectionSection
                selectedPeriod={selectedPeriod}
                handlePeriodClick={handlePeriodClick}
                calendarData={calendarData}
                darkMode={darkMode}
              />
            </div>

            <div className="w-full lg:w-1/3 lg:flex-shrink-0 lg:flex-grow-0 mt-4 lg:mt-0 lg:ml-4">
              <AverageGradeModeSection
                percentageByMode={percentageByMode}
                darkMode={darkMode}
              />
            </div>
          </div>
        )}
      </div>



    </div >
  );
};

export default AverageGradeDetails;
