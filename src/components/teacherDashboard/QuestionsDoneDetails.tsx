import { useEffect, useState } from 'react';
import axios from 'axios';
import SelectInputsForDashboard from './SelectInputsForDashboard';
import { SERVER_URL } from '../../../api';
import { useAuth } from '../../context/AuthProvider';
import localForage from 'localforage';
import SelectSubjectQuestionDone from './QuestionDoneSelectSubject';
import QuestionsDoneChart from '../modified-design/components/TeacherDashboard/questionDone/QuestionsDoneChart';
import ChaptersChart from '../modified-design/components/TeacherDashboard/questionDone/ChaptersChart';
import PeriodSelectionSection from '../modified-design/components/TeacherDashboard/averageGrades/PeriodSelectionSection';
import QuestionDonePerModeSection from '../modified-design/components/TeacherDashboard/questionDone/QuestionDonePerModeSection';

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
  overallCorrectPercentage: string;
  overallIncorrectPercentage: string;
  overallNotAnsweredYetPercentage: string;
  chapters: Chapter[];
  totalCorrect: number;
  totalIncorrect: number;
  totalNotAnsweredYet: number;
  totalQuestions: number;
  overallAverageGrade: string;
  subjectId: string;
  subjectName: string;
  subject_name: string;
  _id: string;
}

interface Chapter {
  correctPercentage: string;
  incorrectPercentage: string;
  notAnsweredYetPercentage: string;
  chapterId: string;
  chapterName: string;
  correctAnswers: number;
  incorrectAnswers: number;
  notAnsweredYet: number;
  totalQuestions: number;
  averageGrade: string;
  totalAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
}

interface TotalQuestionsResponse {
  classId: string;
  totalsPerDate: TotalQuestionsByDate[];
}

interface TotalQuestionsByDate {
  date: string;
  totalCorrect: number;
  totalIncorrect: number;
  totalQuestions: number;
}
type CalendarDataPoint = {
  x: string;
  y: number;
};

interface GradeByMode {
  totalCorrect: number;
  totalIncorrect: number;
  totalNotAnsweredYet: number;
  totalQuestions: number;
  courseId?: string;
  courseName?: string;
  subjectId?: string;
  subjectName?: string;
  doneByMode?: string;
  averageGrade?: string;
}

// interface ModeTotals {
//   totalCorrect: number;
//   totalIncorrect: number;
//   totalAnswered: number;
//   averageGrade: string;
//   percentageAnswered: string;
// }

export default function QuestionsDoneDetails({ darkMode }: any) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  // const [courseData, setCourseData] = useState<GradeByMode[]>([]);
  // const [classData, setClassData] = useState<GradeByMode[]>([]);
  // const [subjectData, setSubjectData] = useState<GradeByMode[]>([]);
  const [, setChapters] = useState<Chapter[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [, setSelectedType] = useState<'course' | 'class' | 'subject'>('subject');
  const { userInfo, token } = useAuth();
  const [data, setData] = useState<Subject[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'1W' | '1M' | '6M'>('1W');
  const [percentageByMode, setPercentageByMode] = useState<{ [key: string]: number }>({
    learn: 0,
    random: 0,
    exam: 0,
  });
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [chapterData, setChapterData] = useState<Chapter[]>([]);
  const [, setTotalQuestionsByDate] = useState<TotalQuestionsByDate[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarDataPoint[]>([]);


  // const getRandomColor = () => {
  //   const colors = [
  //     '#7c3aed',
  //     '#6366f1',
  //     '#7e22ce',
  //     '#38bdf8',
  //     '#60a5fa',
  //     '#1d4ed8',
  //     '#2563eb',
  //     '#9333ea',
  //     '#a78bfa',
  //     '#0ea5e9',
  //     '#1d4ed8',
  //     '#D6BCFA',
  //     '#C6A5F7',
  //     '#A5D8F6',
  //     '#C4E2F4',
  //     '#BFD9F1',
  //     '#E2B9D6',
  //   ];
  //   return colors[Math.floor(Math.random() * colors.length)];
  // };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response: any = await axios.get<Course[]>(`${SERVER_URL}/getspecific/courses/${userInfo?._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // setCourses(response.data);
        setCourses(response?.data?.courses);
        const lastCourseId = await localForage.getItem<string>('lastSelectedCourseId');
        if (lastCourseId) {
          setSelectedCourseId(lastCourseId);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, [userInfo?._id]);

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


  const fetchSubjects = async (classId: string) => {
    try {
      const response = await axios.get(`${SERVER_URL}/getspecific/classes/${classId}/subjects`);
      console.log("ksjdfkl", response);
      setSubjects(response.data);
      setSelectedSubjectId('');
      setSelectedType('subject');
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchSubjects(selectedClassId);
    } else {
      setSubjects([]);
      setSelectedSubjectId('');
    }
  }, [selectedClassId]);

  const handleCourseChange = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedType('course');
    setSelectedClassId('');
    setSelectedSubjectId('');
    setChapters([]);
    await localForage.setItem('lastSelectedCourseId', courseId);
    await localForage.removeItem('lastSelectedClassId');
  };

  const handleClassChange = async (classId: string) => {
    setSelectedClassId(classId);
    setSelectedType('class');
    setSelectedSubjectId('');
    setChapters([]);
    await localForage.setItem('lastSelectedClassId', classId);
  };

  const handleSubjectChange = async (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedType('subject');
    setChapters([]);
  };

  useEffect(() => {
    const getData = async () => {
      const subjects = await fetchQuestionStats();
      console.log("subjects", subjects);
      setData(subjects);

      if (selectedSubject) {
        const chapters = await fetchChaptersBySubject(selectedSubject.value);
        console.log("chapters", chapters);
        setChapterData(chapters);
      }
    };

    getData();
  }, [selectedCourseId, selectedClassId, token, selectedSubject]);

  console.log("selectedSubject", selectedSubject);


  const processedChapterData = chapterData.map((chapter: any) => ({
    chapterName: chapter.chapterName,
    totalAnswered: chapter.chapterQuestionsDone,
  }));

  console.log("processedChapterData", processedChapterData);

  const processedSubjectData = data.map((subject: any) => ({
    subjectName: subject.subjectName,
    // totalAnswered: subject.totalCorrect + subject.totalIncorrect,
    totalAnswered: subject.totalQuestionsDoneSum,
  }));

  const fetchQuestionStats = async () => {
    try {
      const url = selectedClassId
        ? `${SERVER_URL}/teacher/class/${selectedClassId}/grades`
        : `${SERVER_URL}/teacher/course/${selectedCourseId}/grades`;

      const response = await axios.get<{ subjects: Subject[] }>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.subjects;
    } catch (error) {
      console.error('Error fetching question stats:', error);
      return [];
    }
  };

  const fetchChaptersBySubject = async (subjectId: string) => {
    try {
      const url = `${SERVER_URL}/teacher/subject/${subjectId}/grades`;

      const response = await axios.get<{ chapters: Chapter[] }>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("sdkj", response)
      return response.data.chapters;
    } catch (error) {
      console.error('Error fetching chapters by subject:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchModeData = async () => {
      try {
        let url = '';
        if (selectedSubjectId) {
          url = `${SERVER_URL}/teacher/subject/${selectedSubjectId}/average-grade-per-mode`;
        } else if (selectedClassId) {
          // url = `${SERVER_URL}/teacher/class/${selectedClassId}/average-grade-per-mode`;
        } else if (selectedCourseId) {
          url = `${SERVER_URL}/teacher/course/${selectedCourseId}/average-grade-per-mode`;
        }

        if (url) {
          const response = await axios.get<{ grades: GradeByMode[] }>(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("HELL", response)
          const modes = response.data.grades;
          const percentages: any = {
            learn: 0,
            random: 0,
            exam: 0,
          };

          console.log("modes", modes)

          modes.forEach(({ doneByMode, averageGrade }: any) => {
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
        console.error('Error fetching mode data:', error);
      }
    };

    fetchModeData();
  }, [selectedCourseId, selectedClassId, selectedSubjectId, token]);

  // useEffect(() => {
  //   const computeTotals = (data: GradeByMode[]) => {
  //     const modes = ['learn', 'random', 'exam'];
  //     console.log("datadata", data);
  //     const totalCorrectAll = data.reduce((sum, d) => sum + d.totalCorrect, 0);
  //     const totalIncorrectAll = data.reduce((sum, d) => sum + d.totalIncorrect, 0);
  //     const totalAnsweredAll = totalCorrectAll + totalIncorrectAll;
  //     const totals = modes.reduce((acc, mode) => {
  //       const modeData = data.filter(d => d.doneByMode === mode);
  //       const totalCorrect = modeData.reduce((sum, d) => sum + d.totalCorrect, 0);
  //       const totalIncorrect = modeData.reduce((sum, d) => sum + d.totalIncorrect, 0);
  //       const totalAnswered = totalCorrect + totalIncorrect;
  //       const percentageAnswered = totalAnsweredAll > 0
  //         ? ((totalAnswered / totalAnsweredAll) * 100).toFixed(0) + '%'
  //         : '0%';
  //       const averageGrade = totalAnsweredAll > 0
  //         ? ((totalCorrect / totalAnsweredAll) * 100).toFixed(0) + '%'
  //         : '0%';

  //       acc[mode] = {
  //         totalCorrect,
  //         totalIncorrect,
  //         totalAnswered,
  //         averageGrade,
  //         percentageAnswered,
  //       };
  //       return acc;
  //     }, {} as Record<string, ModeTotals>);
  //     return totals;
  //   };

  //   console.log("DSDFD", { courseData, classData, subjectData });
  //   const courseTotals = computeTotals(courseData);
  //   const classTotals = computeTotals(classData);
  //   const subjectTotals = computeTotals(subjectData);
  //   setPercentageByMode({
  //     ...courseTotals,
  //     ...classTotals,
  //     ...subjectTotals,
  //   });
  // }, [selectedCourseId, selectedClassId, selectedSubjectId]);

  console.log("PPPP", percentageByMode)

  useEffect(() => {
    const fetchTotalQuestionsByDate = async () => {
      try {
        let url = '';

        if (selectedSubjectId) {
          url = `${SERVER_URL}/teacher/subject/${selectedSubjectId}/total-correct-incorrect-per-date`;
        } else if (selectedClassId) {
          url = `${SERVER_URL}/teacher/class/${selectedClassId}/total-correct-incorrect-per-date`;
        } else if (selectedCourseId) {
          url = `${SERVER_URL}/teacher/course/${selectedCourseId}/total-correct-incorrect-per-date`;
        }

        if (url) {
          const response = await axios.get<TotalQuestionsResponse>(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data && Array.isArray(response.data.totalsPerDate)) {
            setTotalQuestionsByDate(response.data.totalsPerDate);
            console.log("MONTH", response.data, url);
            setCalendarData(generateCalendarData(response.data.totalsPerDate, selectedPeriod));
          } else {
            console.error('Unexpected API response format:', response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching total questions by date:', error);
      }
    };

    fetchTotalQuestionsByDate();
  }, [selectedSubjectId, selectedClassId, selectedCourseId, selectedPeriod, token]);

  const generateCalendarData = (
    totalsPerDate: TotalQuestionsByDate[],
    selectedPeriod: '1W' | '1M' | '6M'
  ) => {
    const currentDate = new Date();
    let startDate: Date, endDate: Date;
    let dataMapping: (date: Date) => { x: string, y: number };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const groupQuestionsByDay = (totals: TotalQuestionsByDate[]) => {
      const dailyTotals: { [key: string]: number[] } = {};

      totals.forEach((total) => {
        const date = new Date(total.date).toISOString().split('T')[0];

        if (!dailyTotals[date]) {
          dailyTotals[date] = [];
        }
        dailyTotals[date].push(total.totalQuestions);
      });

      const dailyAverages = Object.keys(dailyTotals).map(date => {
        const totals = dailyTotals[date];
        const average = totals.reduce((sum, count) => sum + count, 0) / totals.length;
        return {
          date: date,
          average: average,
        };
      });

      return dailyAverages;
    };

    const getMonthName = (date: Date): string => {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return monthNames[date.getMonth()];
    };

    const groupQuestionsByMonth = (totals: TotalQuestionsByDate[]) => {
      const monthlyTotals: { [key: string]: number[] } = {};

      totals.forEach((total) => {
        const date = new Date(total.date);
        const monthName = getMonthName(date);

        if (!monthlyTotals[monthName]) {
          monthlyTotals[monthName] = [];
        }
        monthlyTotals[monthName].push(total.totalQuestions);
      });

      const monthlyAverages = Object.keys(monthlyTotals).map(key => {
        const totals = monthlyTotals[key];
        const average = totals.reduce((sum, count) => sum + count, 0) / totals.length;
        return {
          month: key,
          average
        };
      });

      return monthlyAverages;
    };

    switch (selectedPeriod) {
      case '1W':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 6); // Start of the week
        endDate = currentDate;
        const dailyAverages = groupQuestionsByDay(totalsPerDate);
        dataMapping = (date: Date) => {
          const dateString = date.toISOString().split('T')[0];
          const averageTotal = dailyAverages.find(day => day.date === dateString)?.average || 0;
          return {
            x: dayNames[date.getDay()],
            y: averageTotal,
          };
        };
        break;

      case '1M':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const weekTotalsMap: { [key: string]: number[] } = {};
        totalsPerDate.forEach(total => {
          const date = new Date(total.date);
          const weekIndex = Math.floor((date.getDate() - 1) / 7);
          const weekKey = `${weekIndex + 1} week of ${getMonthName(date)}`;

          if (!weekTotalsMap[weekKey]) {
            weekTotalsMap[weekKey] = [];
          }

          weekTotalsMap[weekKey].push(total.totalQuestions);
        });
        dataMapping = (date: Date) => {
          const weekIndex = Math.floor((date.getDate() - 1) / 7);
          const weekKey = `${weekIndex + 1} week of ${getMonthName(date)}`;
          const totalsForWeek = weekTotalsMap[weekKey] || [];
          const averageTotal = totalsForWeek.length > 0
            ? totalsForWeek.reduce((sum, count) => sum + count, 0) / totalsForWeek.length
            : 0;

          return {
            x: weekKey,
            y: averageTotal,
          };
        };
        break;

      case '6M':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const monthlyAverages = groupQuestionsByMonth(totalsPerDate);
        dataMapping = (date: Date) => {
          const monthName = getMonthName(date);
          const averageTotal = monthlyAverages.find(month => month.month === monthName)?.average || 0;

          return {
            x: monthName,
            y: averageTotal,
          };
        };
        break;

      default:
        throw new Error('Invalid selectedPeriod');
    }

    // Only add unique entries (by 'x' value)
    const uniqueData: { [key: string]: number } = {};
    const data: { x: string, y: number }[] = [];

    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
      const mappedData = dataMapping(new Date(date));
      if (!uniqueData[mappedData.x]) {
        uniqueData[mappedData.x] = mappedData.y;
        if (mappedData.y > 0) {
          data.push(mappedData);
        }
      }
    }

    return data;
  };



  const handlePeriodClick = (period: '1W' | '1M' | '6M') => {
    setSelectedPeriod(period);
  }

  console.log("selectedSubject", { calendarData });

  return (
    <div className='main-container-space mb-10'>
      <div className='font-bold text-center mb-6 text-xl'>Questions done</div>
      <div className="flex flex-row gap-4 mb-4 justify-center ">
        <SelectInputsForDashboard
          selectedCourseId={selectedCourseId}
          handleCourseChange={handleCourseChange}
          selectedClassId={selectedClassId}
          handleClassChange={handleClassChange}
          courses={courses}
          classes={classes}
        />
        <SelectSubjectQuestionDone selectedCourseId={selectedCourseId} selectedClassId={selectedClassId} selectedSubjectId={selectedSubjectId} subjects={subjects} handleSubjectChange={handleSubjectChange}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
        />
      </div>
      <div className="flex flex-wrap px-16  w-full items-stretch">
        {(selectedCourseId && selectedSubject == null) && (
          <div className="w-full">
            <QuestionsDoneChart data={processedSubjectData} darkMode={darkMode} />
          </div>
        )}

        {(selectedCourseId && selectedSubject != null) && (
          <div className="w-full">
            <ChaptersChart data={processedChapterData} darkMode={darkMode} />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-4 p-4 px-16 justify-between items-stretch">
        {selectedCourseId && (
          <div className="w-full lg:w-2/3">
            <PeriodSelectionSection
              selectedPeriod={selectedPeriod}
              handlePeriodClick={handlePeriodClick}
              calendarData={calendarData}
              darkMode={darkMode}
            />
          </div>
        )}

        {selectedCourseId && (
          <div className="w-full lg:w-1/4">
            <QuestionDonePerModeSection percentageByMode={percentageByMode} darkMode={darkMode} />
          </div>
        )}
      </div>


    </div>
  );
}
