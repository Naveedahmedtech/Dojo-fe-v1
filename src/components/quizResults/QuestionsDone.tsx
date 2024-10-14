import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryLabel,
  VictoryLine,
  VictoryTooltip,
  VictoryTheme
}
  from 'victory';
import { SERVER_URL } from '../../../api';
import QuestionsDoneByModeCard from './QuestionsDoneByModeCard'
import QuestionsDonePieChart from './QuestionsDonePieChart';
import { useParams } from 'react-router-dom';
import ChaptersChart from '../../utils/ChaptersChart ';
import QuestionsDoneCard from '../modified-design/components/StudentDashboard/QuestionsDoneCard';
import QuestionsPerSubjectCard from '../modified-design/components/StudentDashboard/QuestionsPerSubjectCard';
import QuestionsPerModeCard from '../modified-design/components/StudentDashboard/QuestionsPerModeCard';
import QuestionsTimelineCard from '../modified-design/components/StudentDashboard/QuestionsTimelineCard';

interface ChapterData {
  subject_ref: string;
  chapterId: string;
  chapterName: string;
  questionCount: number;
}

interface SubjectData {
  subjectId: string;
  subjectName: string;
  chapters: ChapterData[];
  totalQuestionCount: number;
}

interface QuestionsDoneData {
  date: string;
  count: number;
  questionsDone: number
}

const QuestionsDone = ({ darkMode }: any) => {
  const { id } = useParams<{ id: string }>();
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState<number>(0);
  const [unansweredQuestionsCount, setUnansweredQuestionsCount] = useState<number>(0);
  const [subjectsData, setSubjectsData] = useState<SubjectData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [chaptersData, setChaptersData] = useState<ChapterData[]>([]);
  const [questionsByMode, setQuestionsByMode] = useState<Record<string, number>>({});
  const [view, setView] = useState<'subject' | 'chapter'>('subject');
  const modeTitles: Record<string, string> = {
    learn: 'Learn Mode',
    random: 'Random Mode',
    exam: 'Exam Mode',
  };
  const modeKeys: Array<keyof typeof modeTitles> = ['learn', 'random', 'exam'];
  const [questionsDonePerDate, setQuestionsDonePerDate] = useState<QuestionsDoneData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'1W' | '1M' | '3M'>('1W');
  const [dayNames, setDayNames] = useState<string[]>([]);
  const [weekNames, setWeekNames] = useState<string[]>([]);
  const [monthNames, setMonthNames] = useState<string[]>([]);
  const [totalQuestionDone, setTotalQuestionDone] = useState<number>(0);


  useEffect(() => {
    const fetchCorrectAnswersPerDate = async () => {
      try {
        if (id) {
          const response = await axios.get(`${SERVER_URL}/quiz/${id}/questions-per-date-new`);
          const questionsDoneData: { totals: { questionsDone: number; correctAnswers: number }; stats: QuestionsDoneData[] } = response.data;
          console.log("HEALIDH", response.data)
          const { stats } = questionsDoneData;
          const currentDate = new Date();

          const periods = {
            '1W': [
              new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000),
              currentDate
            ],
            '1M': [
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() - 1,
                Math.min(currentDate.getDate(), new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate())
              ),
              currentDate
            ],
            '3M': [
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() - 3,
                Math.min(currentDate.getDate(), new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 0).getDate())
              ),
              currentDate
            ]
          };


          console.log("PERIODS", { periods })

          // Adjust for month/year boundaries
          function adjustDate(date: any) {
            const adjustedDate = new Date(date);
            if (adjustedDate.getMonth() !== date.getMonth() - 1) {
              adjustedDate.setDate(0);
            }
            return adjustedDate;
          }

          periods['1M'][0] = adjustDate(periods['1M'][0]);
          periods['3M'][0] = adjustDate(periods['3M'][0]);
          const [startDate, endDate] = periods[selectedPeriod] || [new Date(), new Date()];
          const filteredStats = stats.filter(stat => {
            const date = new Date(stat.date);
            return date >= startDate && date <= endDate;
          });
          setQuestionsDonePerDate(filteredStats);
        }
      } catch (error) {
        console.error('Error fetching questions done per date:', error);
      }
    };
    fetchCorrectAnswersPerDate();
  }, [id, selectedPeriod]);
  const fetchUser = async () => {
    try {
      const user = await axios.get(`${SERVER_URL}/user/user-name/${id}`);
      setTotalQuestionDone(user?.data?.total_question_done)
    } catch (error) {
      console.log("erorr fetching user", error);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const answeredResponse = await axios.get(`${SERVER_URL}/quiz/${id}/questions-answered`);
          const { countCorrect, countNotCorrect } = answeredResponse.data;
          setCorrectAnswersCount(countCorrect);
          setIncorrectAnswersCount(countNotCorrect);
          const totalQuestionsResponse = await axios.get(`${SERVER_URL}/quiz/${id}/total_questions`);
          const totalQuestionsCount = totalQuestionsResponse.data.totalQuestions;
          setTotalQuestions(totalQuestionsCount);
          const unansweredCount = totalQuestionsCount - (countCorrect + countNotCorrect);
          setUnansweredQuestionsCount(unansweredCount);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };
    fetchData();
  }, [id]);


  const generateDayNames = () => {
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Array.from({ length: 7 }, (_, i) => {
      const nextDay = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      return days[nextDay.getUTCDay()];  // Use getUTCDay() to get the correct day of the week in UTC
    }).reverse();
  };
  useEffect(() => {


    const generateWeekNames = () => {
      const today = new Date();
      return Array.from({ length: 4 }, (_, i) => {
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (today.getDay() + i * 7));
        const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
        return `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`;
      }).reverse();
    };

    const generateMonthNames = () => {
      const today = new Date();
      return Array.from({ length: 3 }, (_, i) => {
        const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        return monthDate.toLocaleString('default', { month: 'long' }) + ` ${monthDate.getFullYear()}`;
      }).reverse();
    };

    setDayNames(generateDayNames());
    setWeekNames(generateWeekNames());
    setMonthNames(generateMonthNames());
  }, []);

  // ** chart data **

  const groupQuestionsByWeek = (totalsPerDate: any, startDate: any, endDate: any) => {
    const weekAverages: any = [];

    totalsPerDate.forEach(({ date, questionsDone }: any) => {
      const currentDate = new Date(date);
      // Adjust the comparison to use UTC dates
      const utcCurrentDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
      const utcStartDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
      const utcEndDate = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));

      if (utcCurrentDate >= utcStartDate && utcCurrentDate <= utcEndDate) {
        const weekKey = date; // Keep the original date as the key

        weekAverages.push({
          week: weekKey,
          average: questionsDone, // Directly use the questionsDone value
        });
      }
      // console.log("Dates checking: ", { code: "API_DATE_TOTAL_QUESTION_DONE", date, }, { code: "WEEK_AVERAGE", weekAverages })
    });
    
    weekAverages.sort((a: any, b: any) => new Date(a.week).getTime() - new Date(b.week).getTime());
    
    // console.log("weekAverages", weekAverages);

    return weekAverages;
  };





  const groupQuestionsByMonth = (totalsPerDate: any, startDate: any, endDate: any) => {
    const monthAverages: any = [];
    const monthCounts: any = {};

    totalsPerDate.forEach(({ date, questionsDone }: any) => {
      const currentDate = new Date(date);
      if (currentDate >= startDate && currentDate <= endDate) {
        const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;

        if (!monthCounts[monthKey]) {
          monthCounts[monthKey] = { total: 0, count: 0 };
        }
        monthCounts[monthKey].total += questionsDone;
        monthCounts[monthKey].count += 1;
      }
    });

    for (const monthKey in monthCounts) {
      const { total } = monthCounts[monthKey];
      const [year, month] = monthKey.split('-').map(Number);
      monthAverages.push({
        month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }) + ` ${year}`,
        average: total,
      });
    }

    monthAverages.sort((a:any, b:any) => new Date(a.month).getTime() - new Date(b.month).getTime());

    return monthAverages;
  };


  const calendarChart = (
    questionsDoneData: any,
    selectedPeriod: any,
  ) => {
    const currentDate = new Date();

    const getDataForPeriod = (startDate: any, endDate: any, groupingFunction: any) => {
      // Filter grouped data within the date range before processing
      const filteredData = questionsDoneData.filter(({ date }: any) => {
        const currentDate = new Date(date);
        return currentDate >= startDate && currentDate <= endDate;
      });

      // Call grouping function with filtered data
      const groupedData = groupingFunction(filteredData, startDate, endDate);
      console.log("groupedData", { groupedData });

      // Day names array for reference
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      return groupedData.map(({ average, week, month }: any, index: any) => {
        let xLabel;

        if (selectedPeriod === '1W') {
          // Parse the 'week' field as a date and get the day of the week
          const currentDate = new Date(week);  // week should represent the actual date in groupedData
          const dayOfWeek = currentDate.getUTCDay();  // Use getUTCDay to avoid timezone issues

          xLabel = days[dayOfWeek];  // Map to day name (e.g., 'Fri' for Friday)
        } else if (selectedPeriod === '1M') {
          xLabel = `Week ${index + 1}`;
        } else {
          xLabel = month || `Period ${index + 1}`;  // Fallback for missing month label
        }

        console.log("LABELS:", {
          x: xLabel,
          y: average,
        });

        return {
          x: xLabel,
          y: average,
        };
      });
    };




    const getStartDateAndGroupingFunction = () => {
      switch (selectedPeriod) {
        case '1W':
          return {
            startDate: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000),
            endDate: currentDate,
            groupingFunction: groupQuestionsByWeek,
          };

        case '1M':
          const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          return {
            startDate: startOfMonth,
            endDate: endOfMonth,
            groupingFunction: groupQuestionsByWeek,
          };

        case '3M':
          const startOfThreeMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
          return {
            startDate: startOfThreeMonthsAgo,
            endDate: currentDate,
            groupingFunction: groupQuestionsByMonth,
          };

        default:
          throw new Error('Unsupported period');
      }
    };

    const { startDate, endDate, groupingFunction } = getStartDateAndGroupingFunction();
    return getDataForPeriod(startDate, endDate, groupingFunction);
  };


  const chartData = calendarChart(
    questionsDonePerDate,
    selectedPeriod,
  );

  const handlePeriodClick = (period: any) => {
    setSelectedPeriod(period);
  };

  // ** chart data **
  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        if (id) {
          const response = await axios.get(`${SERVER_URL}/quiz/${id}/questions-done-by-mode`);
          const data = response.data;
          console.log("DONE!!!", data)
          modeKeys.forEach((key) => {
            if (!(key in data)) {
              data[key] = 0;
            }
          });
          // console.log("Response", response)
          setQuestionsByMode(data);
        }
      } catch (error) {
        console.error('Error fetching quiz results:', error);
      }
    };
    fetchQuizResults();
  }, [id, modeKeys]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const { data } = await axios.get<SubjectData[]>(`${SERVER_URL}/quiz/${id}/questions-by-subject`);
          console.log("DAAATAA",data)
          setSubjectsData(data);

          if (data.length > 0) {
            setSelectedSubject(data[0]);
            setChaptersData(data[0].chapters);
          }
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (selectedSubject) {
      setChaptersData(selectedSubject.chapters);
    }
  }, [selectedSubject]);

  const questionsAnswered = correctAnswersCount + incorrectAnswersCount;
  const percentageCorrect = (totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0);
  const percentageIncorrect = (totalQuestions > 0 ? (incorrectAnswersCount / totalQuestions) * 100 : 0);
  const percentageUnanswered = (totalQuestions > 0 ? (unansweredQuestionsCount / totalQuestions) * 100 : 0);


  const getYTickValues = (data: number[], interval: number): number[] => {
    const max = Math.max(...data);
    const tickValues: number[] = [];
    let currentTick = 0;
    while (currentTick <= max) {
      tickValues.push(currentTick);
      currentTick += interval;
    }
    if (tickValues[tickValues.length - 1] !== max) {
      tickValues.push(max);
    }
    return tickValues;
  };

  const maxSubjectValue = Math.max(...subjectsData.map(subject => subject.totalQuestionCount));
  const maxChapterValue = Math.max(...chaptersData.map(chapter => chapter.questionCount));


  const subjectPercentageData = subjectsData.map(subject => ({
    x: subject.subjectName,
    y: (subject.totalQuestionCount / maxSubjectValue) * 100,
  }));


  const chapterPercentageData = chaptersData.map(chapter => ({
    x: chapter.chapterName,
    y: (chapter.questionCount / maxChapterValue) * 100,
  }));


  const interval = 20;

  return (
    <div className="flex justify-between p-6 space-x-4 rounded-lg shadow-lg overflow-x-auto">
      <div className={`flex-none w-[350px] h-[450px] p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <QuestionsDoneCard
          totalQuestionDone={totalQuestionDone}
          questionsAnswered={questionsAnswered}
          totalQuestions={totalQuestions}
          correctAnswersCount={correctAnswersCount}
          incorrectAnswersCount={incorrectAnswersCount}
          unansweredQuestionsCount={unansweredQuestionsCount}
          percentageCorrect={percentageCorrect}
          percentageIncorrect={percentageIncorrect}
          percentageUnanswered={percentageUnanswered}
          darkMode={darkMode}
        />
      </div>
      <div className={`flex-none w-[350px] h-[450px] p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <QuestionsPerSubjectCard
          view={view}
          subjectsData={subjectsData}
          setSelectedSubject={setSelectedSubject}
          setChaptersData={setChaptersData}
          setView={setView}
          getYTickValues={getYTickValues}
          interval={interval}
          chaptersData={chaptersData}
          darkMode={darkMode}
        />
      </div>
      <div className={`flex-none w-[350px] h-[450px] p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <QuestionsPerModeCard
          modeKeys={modeKeys}
          modeTitles={modeTitles}
          questionsByMode={questionsByMode}
          totalQuestions={totalQuestions}
          darkMode={darkMode}
        />
      </div>
      <div className={`flex-none w-[350px] h-[450px] p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <QuestionsTimelineCard
          selectedPeriod={selectedPeriod}
          chartData={chartData}
          handlePeriodClick={handlePeriodClick}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};

export default QuestionsDone;
