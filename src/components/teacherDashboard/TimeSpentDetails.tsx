import { useEffect, useState } from 'react';
import axios from 'axios';
import { SERVER_URL } from '../../../api';
import { useAuth } from '../../context/AuthProvider';
import localForage from 'localforage';
import SelectInputsForDashboard from './SelectInputsForDashboard';
import SelectSubject from './SelectSubject';
import TimeSpentChart from '../modified-design/components/TeacherDashboard/timeSpent/TimeSpentChart';
import TimeSpentPerMode from '../modified-design/components/TeacherDashboard/timeSpent/TimeSpentPerMode';
import TimeSpentPerDate from '../modified-design/components/TeacherDashboard/timeSpent/TimeSpentPerDate';


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
  subject_name: string;
  _id: string;
  averageGrade: string;
  chapters?: Chapter[];
}

interface Chapter {
  chapterName: string;
  averageGrade: number;
}

interface TimeByDate {
  date: string;
  totalTimeSpent: string;
  totalTime: number;
}

interface TimeSpentPerSubject {
  chapterId: string;
  chapterName: string;
  subjectId: string;
  subjectName: string;
  doneByMode: 'learn' | 'random' | 'exam';
  totalTimeSpent: string;
}

interface TimeSpentPerChapter {
  chapterId: string;
  chapterName?: string;
  [key: string]: string | number | undefined;
}

interface FormattedTimeSpentItem {
  subjectName?: string;
  chapterName?: string;
  learn?: number;
  random?: number;
  exam?: number;
  [key: string]: string | number | undefined;
}

export default function TimeSpentDetails({ darkMode }: any) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [, setAvailableSubjects] = useState<Subject[]>([]);
  const [, setChapters] = useState<Chapter[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const { userInfo, token } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'1W' | '1M' | '6M'>('1W');
  const [timeByDate, setTimeByDate] = useState<TimeByDate[]>([]);
  const [calendarData, setCalendarData] = useState<{ x: string, y: number }[]>([]);
  const COLORS = ['#A368F0', '#3976EC', '#A6D3F3'];
  const [timeByMode, setTimeByMode] = useState([]);
  const [dataFormatted, setDataFormatted] = useState<FormattedTimeSpentItem[]>([]);
  const [, setTimeSpent] = useState<FormattedTimeSpentItem[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response:any = await axios.get<Course[]>(`${SERVER_URL}/getspecific/courses/${userInfo?._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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

        const lastClassId = await localForage.getItem<string>('lastSelectedClassId');
        if (lastClassId) {
          setSelectedClassId(lastClassId);
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
      const response = await axios.get(`${SERVER_URL}/getspecific/classes/${classId}/subjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSubjects(response.data);
      setAvailableSubjects(response.data.map((subject: any) => ({
        _id: subject._id,
        subjectName: subject.subjectName,
        averageGrade: parseFloat(subject.averageGrade?.replace('%', '') || '0') || 0,
      })));
      const lastSubjectId = await localForage.getItem<string>('lastSelectedSubjectId');
      if (lastSubjectId) {
        setSelectedSubjectId(lastSubjectId);
        fetchTimeSpentForChapter(lastSubjectId);
      }
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
    }
  };

  const handleClassChange = (classId: string) => {
    if (classId) {
      setSelectedClassId(classId);
      setAvailableSubjects([]);
      setSubjects([]);
      setSelectedSubjectId('');
      setChapters([]);
      fetchSubjects(classId);
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setChapters([]);
    fetchTimeSpentForChapter(subjectId);
  };

  const formatTimeSpent = (data: TimeSpentPerSubject[]): FormattedTimeSpentItem[] => {
    return data.reduce((acc: FormattedTimeSpentItem[], item: TimeSpentPerSubject) => {
      const name = item.subjectName || '';
      const timeSpent = parseTimeSpent(item.totalTimeSpent);
      const key = item.subjectName;

      let existing = acc.find(d => d[key] === name);
      if (existing) {
        existing[item.doneByMode] = timeSpent;
      } else {
        existing = { [key]: name, [item.doneByMode]: timeSpent };
        acc.push(existing);
      }

      return acc;
    }, []);
  };


  const formatTimeSpentN = (data: TimeSpentPerSubject[]): FormattedTimeSpentItem[] => {
    return data.reduce((acc: FormattedTimeSpentItem[], item: TimeSpentPerSubject) => {
      const { subjectName, doneByMode, totalTimeSpent } = item;
      const timeSpent = parseTimeSpent(totalTimeSpent);

      // Find if an entry for this subject already exists
      let existing = acc.find(d => d.subjectName === subjectName);
      if (existing) {
        // If it exists, add the time spent for the current mode
        existing[doneByMode] = timeSpent;
      } else {
        // If it doesn't exist, create a new entry
        existing = { subjectName, [doneByMode]: timeSpent };
        acc.push(existing);
      }

      return acc;
    }, []);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = '';
        let responseData: TimeSpentPerSubject[] = [];
        if (selectedCourseId) {
          url = `${SERVER_URL}/teacher/course/${selectedCourseId}/time-spent-per-mode`;
        } else if (selectedClassId) {
          url = `${SERVER_URL}/teacher/class/${selectedClassId}/time-spent-per-mode`;
        }
        if (url) {
          const response = await axios.get<{ timeSpentBySubject: TimeSpentPerSubject[] }>(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("DDD", { response, url, selectedCourseId, selectedClassId });
          responseData = response.data.timeSpentBySubject || [];
          const formattedData = formatTimeSpent(responseData);
          const formattedDataN = formatTimeSpentN(responseData);
          setTimeSpent(formattedData);
          setDataFormatted(formattedDataN);
        }
      } catch (error: any) {
        console.error('Error fetching time spent data:', error.response?.data || error.message);
      }
    };

    fetchData();
  }, [selectedCourseId, selectedClassId]);

  console.log("dataFormatted", dataFormatted);

  const formatTimeSpentForChapter = (timeSpent: TimeSpentPerSubject[]): TimeSpentPerChapter[] => {
    return timeSpent.reduce((acc: TimeSpentPerChapter[], item: TimeSpentPerSubject) => {
      const chapterName = item.chapterName || '';
      const timeSpentInMinutes = parseTimeSpent(item.totalTimeSpent);
      let existing = acc.find(d => d.chapterName === chapterName);
      if (existing) {
        existing[item.doneByMode as 'learn' | 'random' | 'exam'] =
          (Number(existing[item.doneByMode as 'learn' | 'random' | 'exam']) || 0) + timeSpentInMinutes;
      } else {
        const newItem: TimeSpentPerChapter = {
          chapterName,
          [item.doneByMode as 'learn' | 'random' | 'exam']: timeSpentInMinutes,
          chapterId: item.chapterId || '',
          doneByMode: item.doneByMode,
          totalTimeSpent: item.totalTimeSpent,
          subjectId: '',
          subjectName: ''
        };
        acc.push(newItem);
      }
      return acc;
    }, []);
  };

  const fetchTimeSpentForChapter = async (subjectId: string) => {
    try {
      const url = `${SERVER_URL}/teacher/subject/${subjectId}/time-spent-per-mode`;
      const response = await axios.get<{ timeSpent: TimeSpentPerSubject[] }>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const timeSpentData = response.data.timeSpent || [];
      const formattedData: FormattedTimeSpentItem[] = formatTimeSpentForChapter(timeSpentData);
      setDataFormatted(formattedData);
      setTimeSpent(formattedData);
    } catch (error: any) {
      console.error('Error fetching time spent data for chapter:', {
      });
    }
  };

  const parseTimeSpent = (time: string): number => {
    const [minutes, seconds] = time.split('m').map(str => str.trim().replace('s', ''));
    return parseInt(minutes, 10) + parseInt(seconds, 10) / 60;
  };

  const fetchTimeByDate = async () => {
    try {
      let url = '';
      if (selectedSubjectId) {
        url = `${SERVER_URL}/teacher/subject/${selectedSubjectId}/time-spent-per-date`;
      } else if (selectedClassId) {
        url = `${SERVER_URL}/teacher/class/${selectedClassId}/time-spent-per-date`;
      } else if (selectedCourseId) {
        url = `${SERVER_URL}/teacher/course/${selectedCourseId}/time-spent-per-date`;
      }
      if (url) {
        const response = await axios.get<{
          subjectId?: string;
          classId?: string;
          courseId?: string;
          totalTimeSpent: string;
          timeSpentPerDate: { date: string, totalTimeSpent: string, totalTimeSpentPercentage: string }[];
        }>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dates = response.data.timeSpentPerDate.map((dateEntry) => {
          const { date, totalTimeSpent, totalTimeSpentPercentage } = dateEntry;
          return {
            date,
            totalTimeSpent,
            totalTime: parseFloat(totalTimeSpent),
            totalTimeSpentPercentage
          };
        });

        setTimeByDate(dates);
      }
    } catch (error) {
      console.error('Error fetching time per date:', error);
    }
  };

  const generateCalendarData = (times: TimeByDate[], selectedPeriod: '1W' | '1M' | '6M') => {
    const currentDate = new Date();
    let startDate: Date, endDate: Date;
    let dataMapping: (date: Date) => { x: string, y: number };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const parseTime = (timeString: string): number => {
      const match = timeString.match(/(\d+)/);
      return match ? parseFloat(match[0]) : 0;
    };

    const groupGradesByDay = (times: TimeByDate[]) => {
      const dailyGrades: { [key: string]: number[] } = {};

      times.forEach((time) => {
        const date = new Date(time.date).toISOString().split('T')[0];
        if (!dailyGrades[date]) {
          dailyGrades[date] = [];
        }
        dailyGrades[date].push(parseTime(time.totalTimeSpent));
      });

      const dailyMaxValues = Object.keys(dailyGrades).map(date => {
        const grades = dailyGrades[date];
        const max = Math.max(...grades);
        return {
          date: date,
          max: max,
        };
      });

      return dailyMaxValues;
    };

    const getMonthName = (date: Date): string => {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return monthNames[date.getMonth()];
    };

    const groupGradesByMonth = (times: TimeByDate[]) => {
      const monthlyGrades: { [key: string]: number[] } = {};

      times.forEach((time) => {
        const date = new Date(time.date);
        const monthName = getMonthName(date);

        if (!monthlyGrades[monthName]) {
          monthlyGrades[monthName] = [];
        }
        monthlyGrades[monthName].push(parseTime(time.totalTimeSpent));
      });

      const monthlyMaxValues = Object.keys(monthlyGrades).map(key => {
        const grades = monthlyGrades[key];
        const max = Math.max(...grades);
        return {
          month: key,
          max
        };
      });

      return monthlyMaxValues;
    };

    switch (selectedPeriod) {
      case '1W':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 6); // Start of the week
        endDate = currentDate;
        const dailyMaxValues = groupGradesByDay(times);
        dataMapping = (date: Date) => {
          const dateString = date.toISOString().split('T')[0];
          const maxTime = dailyMaxValues.find(day => day.date === dateString)?.max || 0;
          return {
            x: dayNames[date.getDay()],
            y: maxTime,
          };
        };
        break;

      case '1M':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const weekGradesMap: { [key: string]: number[] } = {};
        times.forEach(time => {
          const date = new Date(time.date);
          const weekIndex = Math.floor((date.getDate() - 1) / 7);
          const weekKey = `${weekIndex + 1} week of ${getMonthName(date)}`;

          if (!weekGradesMap[weekKey]) {
            weekGradesMap[weekKey] = [];
          }
          weekGradesMap[weekKey].push(parseTime(time.totalTimeSpent));
        });
        dataMapping = (date: Date) => {
          const weekIndex = Math.floor((date.getDate() - 1) / 7);
          const weekKey = `${weekIndex + 1} week of ${getMonthName(date)}`;
          const timeForWeek = weekGradesMap[weekKey] || [];
          const maxTime = timeForWeek.length > 0
            ? Math.max(...timeForWeek)
            : 0;

          return {
            x: weekKey,
            y: maxTime,
          };
        };
        break;

      case '6M':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const monthlyMaxValues = groupGradesByMonth(times);
        dataMapping = (date: Date) => {
          const monthName = getMonthName(date);
          const maxTime = monthlyMaxValues.find(month => month.month === monthName)?.max || 0;
          return {
            x: monthName,
            y: maxTime,
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

  useEffect(() => {
    fetchTimeByDate();
  }, [selectedSubjectId, selectedClassId, selectedCourseId, token]);

  useEffect(() => {
    const data = generateCalendarData(timeByDate, selectedPeriod);
    setCalendarData(data);
  }, [timeByDate, selectedPeriod]);


  const renderDetailedView = () => {
    const currentDate = new Date();

    if (selectedPeriod === '1M') {
      const weekDates = [];
      for (let i = 0; i < 4; i++) {
        const weekStartDate = new Date(currentDate.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const weekEndDate = new Date(weekStartDate.getTime() - 6 * 24 * 60 * 60 * 1000);
        const weekLabel = `${weekEndDate.getDate()}/${weekEndDate.getMonth() + 1} - ${weekStartDate.getDate()}/${weekStartDate.getMonth() + 1}`;
        weekDates.push({
          weekLabel,
          data: timeByDate.filter((dataPoint) => {
            const date = new Date(dataPoint.date);
            const weekStart = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate());
            const weekEnd = new Date(weekEndDate.getFullYear(), weekEndDate.getMonth(), weekEndDate.getDate());
            return date >= weekStart && date <= weekEnd;
          }),
        });
      }
      return
    }

    if (selectedPeriod === '6M') {
      const monthNames = [];
      for (let i = 0; i < 6; i++) {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = monthDate.toLocaleString('default', { month: 'long' });
        monthNames.push({
          month: monthName,
          totalTime: timeByDate.find(time => time.date.startsWith(monthDate.toISOString().split('-')[0]))?.totalTime || 0,
        });
      }
      return
    }

    return null;
  };

  const handlePeriodClick = (period: '1W' | '1M' | '6M') => {
    setSelectedPeriod(period);
  };

  useEffect(() => {
    const fetchTimeByMode = async () => {
      try {
        let url = '';
        if (selectedSubjectId) {
          url = `${SERVER_URL}/teacher/subject/${selectedSubjectId}/time-spent-per-mode-percentage`;
        } else if (selectedClassId) {
          url = `${SERVER_URL}/teacher/class/${selectedClassId}/time-spent-per-mode-percentage`;
        } else if (selectedCourseId) {
          url = `${SERVER_URL}/teacher/course/${selectedCourseId}/time-spent-per-mode-percentage`;
        }
        if (url) {
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("response", response);

          const formattedData = response.data.timeSpentByMode.map((mode: { doneByMode: string; totalTimeSpentPercentage: string; formattedTotalTimeSpent: string; }) => ({
            doneByMode: mode.doneByMode === 'learn' ? 'Learn Mode' :
              mode.doneByMode === 'exam' ? 'Exam Mode' :
                mode.doneByMode === 'random' ? 'Random Mode' :
                  mode.doneByMode,
            totalTimeSpentPercentage: parseFloat(mode.totalTimeSpentPercentage) / 100,
            formattedTotalTimeSpent: mode.formattedTotalTimeSpent // Include the formatted time spent
          }));

          setTimeByMode(formattedData);
        }
      } catch (error) {
        console.error('Error fetching time by mode:', error);
      }
    };
    fetchTimeByMode();
  }, [selectedSubjectId, selectedClassId, selectedCourseId, token]);

  console.log("timeByMode", timeByMode);







  return (
    <div className="main-container-space mb-10">
      <div className='font-bold text-center mb-6 text-xl'>Time Statistics</div>
      <div className="flex flex-row gap-4 mb-4 justify-center ">
        <SelectInputsForDashboard
          selectedCourseId={selectedCourseId}
          handleCourseChange={handleCourseChange}
          selectedClassId={selectedClassId}
          handleClassChange={handleClassChange}
          courses={courses}
          classes={classes}
        />
        <SelectSubject selectedCourseId={selectedCourseId} selectedClassId={selectedClassId} selectedSubjectId={selectedSubjectId} subjects={subjects} handleSubjectChange={handleSubjectChange} />
      </div>

      <div className="flex flex-wrap px-5 lg:px-20 w-full items-stretch">
      {selectedCourseId && (
        <>
          <div className="w-full">
            <TimeSpentChart
              selectedCourseId={selectedCourseId}
              selectedClassId={selectedClassId}
              selectedSubjectId={selectedSubjectId}
              dataFormatted={dataFormatted}
              darkMode={darkMode}
            />
          </div>
        </>
      )}
      </div>

      {/* <div className="flex flex-wrap px-16  w-full items-stretch"> */}
        {selectedCourseId && (
          <>
            <div className="flex justify-around mt-10">

              <div className="w-full lg:w-1/3 lg:flex-shrink-0 lg:flex-grow-0 mt-4 lg:mt-0 lg:ml-4">
                <TimeSpentPerMode
                  timeByMode={timeByMode}
                  COLORS={COLORS}
                  darkMode={darkMode}
                />
              </div>

            <div className="w-full lg:w-1/2 lg:flex-shrink-0 lg:flex-grow-0">
                <TimeSpentPerDate
                  calendarData={calendarData}
                  handlePeriodClick={handlePeriodClick}
                  selectedPeriod={selectedPeriod}
                  darkMode={darkMode}
                />
              </div>
            </div>
          </>
        )}
        <div className="w-full">
          {renderDetailedView && renderDetailedView()}
        </div>

      {/* </div> */}

    </div>
  );
}
