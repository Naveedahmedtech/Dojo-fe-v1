import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CorrectAnswersHalfPie from './CorrectAnswersHalfPie';
import CorrectAnsweredByModeCard from './CorrectAnsweredByModeCard';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryBar,
  VictoryLabel,
  VictoryTooltip,
  VictoryTheme
} from 'victory';
import { SERVER_URL } from '../../../api';
import { useParams } from 'react-router-dom';
import AverageGradeCard from '../modified-design/components/StudentDashboard/AverageGradeCard';
import AverageGradePerSubjectCard from '../modified-design/components/StudentDashboard/AverageGradePerSubjectCard';
import AverageGradePerModeCard from '../modified-design/components/StudentDashboard/AverageGradePerModeCard';
import CorrectAnswersTimelineCard from '../modified-design/components/StudentDashboard/CorrectAnswersTimelineCard';

interface ModeStats {
  modeTitle: string;
  correctAnswersByMode: number;
  incorrectAnswersByMode: number;
  totalAnswers: number;
}

interface ChapterData {
  y: any;
  subject_ref: string;
  chapterId: string;
  chapterName: string;
  questionCount: number;
  totalAnsweredCount: number;
  correctAnswerCount: number;
  totalQuestionsDone: number;
}

interface SubjectData {
  chapterName: any;
  y: any;
  totalCorrectAnswerCount: number;
  subjectId: string;
  subjectName: string;
  chapters: ChapterData[];
  totalQuestionCount: number;
  totalAnsweredCount: number;
}

type CorrectAnswerPerDate = {
  date: string;
  correctAnswers: number;
};

const CorrectAnswer = ({ darkMode }: any) => {
  const { id } = useParams<{ id: string }>();
  const [, setTotalQuestions] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [, setIncorrectAnswersCount] = useState<number>(0);
  const [questionsByMode, setQuestionsByMode] = useState<Record<string, ModeStats>>({});
  const modeTitles: Record<string, string> = {
    learn: 'Learn Mode',
    random: 'Random Mode',
    exam: 'Exam Mode',
  };
  const modeKeys: Array<keyof typeof modeTitles> = ['learn', 'random', 'exam'];
  const [subjectsData, setSubjectsData] = useState<SubjectData[]>([]);
  const [chaptersData, setChaptersData] = useState<ChapterData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [, setChapterData] = useState<ChapterData[]>([]);
  const [view, setView] = useState<'subject' | 'chapter'>('subject');
  const [selectedPeriod, setSelectedPeriod] = useState<'1W' | '1M' | '3M'>('1W');
  const [dayNames, setDayNames] = useState<string[]>([]);
  const [weekNames, setWeekNames] = useState<string[]>([]);
  const [monthNames, setMonthNames] = useState<string[]>([]);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [correctAnswersPerDate, setCorrectAnswersPerDate] = useState<CorrectAnswerPerDate[]>([]);
  const [totalQuestionsA, setTotalQuestionsA] = useState<number>(0);
  const [, setSubjectPercentageData] = useState<any[]>([]);
  const [, setChapterPercentageData] = useState<any[]>([]);
  const [avgCorrectAns, setAvgCorrectAns] = useState<string>();

  useEffect(() => {
    const fetchCorrectAnswersPerDate = async () => {
      try {
        if (id) {
          const response = await axios.get(`${SERVER_URL}/quiz/${id}/correct/questions-per-date`);
          const questionsDoneData: { totals: { questionsDone: number; correctAnswers: number }; stats: CorrectAnswerPerDate[] } = response.data;
          console.log("questionsDoneData", questionsDoneData)
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
          setCorrectAnswersPerDate(filteredStats);
        }
      } catch (error) {
        console.error('Error fetching questions done per date:', error);
      }
    };
    fetchCorrectAnswersPerDate();
  }, [id, selectedPeriod]);
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
        const startOfWeek = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
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
  // Function to group correct answers by week
  const groupCorrectAnswersByWeek = (totalsPerDate: any, startDate: any, endDate: any) => {
    const weekAverages: any = [];

    totalsPerDate.forEach(({ date, correctAnswers }: any) => {
      const currentDate = new Date(date);
      // Adjust the comparison to use UTC dates
      const utcCurrentDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
      const utcStartDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
      const utcEndDate = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));

      if (utcCurrentDate >= utcStartDate && utcCurrentDate <= utcEndDate) {
        const weekKey = date; // Keep the original date as the key

        weekAverages.push({
          week: weekKey,
          average: correctAnswers, // Directly use the correctAnswers value
        });
      }
    });

    weekAverages.sort((a: any, b: any) => new Date(a.week).getTime() - new Date(b.week).getTime());

    return weekAverages;
  };

  const groupCorrectAnswersByMonth = (totalsPerDate: any, startDate: any, endDate: any) => {
    const monthAverages: any = [];
    const monthCounts: any = {};

    totalsPerDate.forEach(({ date, correctAnswers }: any) => {
      const currentDate = new Date(date);
      if (currentDate >= startDate && currentDate <= endDate) {
        const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;

        if (!monthCounts[monthKey]) {
          monthCounts[monthKey] = { total: 0, count: 0 };
        }
        monthCounts[monthKey].total += correctAnswers;
        monthCounts[monthKey].count += 1;
      }
    });

    for (const monthKey in monthCounts) {
      const { total, count } = monthCounts[monthKey];
      const [year, month] = monthKey.split('-').map(Number);
      monthAverages.push({
        month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }) + ` ${year}`,
        average: total,
      });
    }

    monthAverages.sort((a:any, b:any) => new Date(a.month).getTime() - new Date(b.month).getTime());

    return monthAverages;
  };

  // Function to group correct answers by month
  // const groupCorrectAnswersByMonth = (totalsPerDate: CorrectAnswerPerDate[], startDate: Date, endDate: Date) => {
  //   const monthAverages: { month: string, average: number }[] = [];
  //   const monthCounts: { [key: string]: { total: number, count: number } } = {};

  //   totalsPerDate.forEach(({ date, correctAnswers }) => {
  //     console.log("totalsPerDatesss", { totalsPerDate, correctAnswers });
  //     const currentDate = new Date(date);
  //     if (currentDate >= startDate && currentDate <= endDate) {
  //       const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;

  //       if (!monthCounts[monthKey]) {
  //         monthCounts[monthKey] = { total: 0, count: 0 };
  //       }
  //       monthCounts[monthKey].total += correctAnswers;
  //       monthCounts[monthKey].count += 1;
  //     }
  //   });

  //   for (const monthKey in monthCounts) {
  //     const { total, count } = monthCounts[monthKey];
  //     const [year, month] = monthKey.split('-').map(Number);
  //     monthAverages.push({
  //       month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }) + ` ${year}`,
  //       average: (total / count).toFixed(0),
  //     });
  //   }

  //   monthAverages.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  //   return monthAverages;
  // };

  // Function to create the chart data for correct answers
  const createCorrectAnswersChartData = (
    correctAnswersData: CorrectAnswerPerDate[],
    selectedPeriod: '1W' | '1M' | '3M',
    dayNames: string[],
    weekNames: string[],
    monthNames: string[]
  ) => {
    const currentDate = new Date();

    const getDataForPeriod = (startDate: Date, endDate: Date, groupingFunction: any) => {
      const groupedData = groupingFunction(correctAnswersData, startDate, endDate);
      return groupedData.map(({ average, week, month }: any, index: any) => ({
        x: selectedPeriod === '1W' ? dayNames[index] :
          selectedPeriod === '1M' ? `Week ${index + 1}` : month,
        y: average,
      }));
    };

    const getStartDateAndGroupingFunction = () => {
      switch (selectedPeriod) {
        case '1W':
          return {
            startDate: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000),
            endDate: currentDate,
            groupingFunction: groupCorrectAnswersByWeek,
          };

        case '1M':
          const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          return {
            startDate: startOfMonth,
            endDate: endOfMonth,
            groupingFunction: groupCorrectAnswersByWeek,
          };

        case '3M':
          const startOfThreeMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
          return {
            startDate: startOfThreeMonthsAgo,
            endDate: currentDate,
            groupingFunction: groupCorrectAnswersByMonth,
          };

        default:
          throw new Error('Unsupported period');
      }
    };

    const { startDate, endDate, groupingFunction } = getStartDateAndGroupingFunction();
    return getDataForPeriod(startDate, endDate, groupingFunction);
  };

  // Usage in the component
  const chartData = createCorrectAnswersChartData(
    correctAnswersPerDate,
    selectedPeriod,
    dayNames,
    weekNames,
    monthNames
  );

  const handlePeriodClick = (period: '1W' | '1M' | '3M') => {
    setSelectedPeriod(period);
  };

  // ** chart data **



  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const { data }: any = await axios.get<SubjectData[]>(`${SERVER_URL}/quiz/${id}/correct-answers-by-subject-and-chapter`);
          console.log("ksdjf", data)
          setSubjectsData(data?.subjects);
          setTotalQuestionsA(data?.total_question_done)

          if (data?.subjects?.length > 0) {
            const totalQuestionsCount = data.reduce((sum: any, subject: any) => sum + (subject.totalQuestionCount || 0), 0);
            setTotalQuestions(totalQuestionsCount);
            setSelectedSubject(data[0]);
            setChapterData(data[0].chapters);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, [id]);

  // const getYTickValues = (data: number[], interval: number): number[] => {
  //   const max = Math.max(...data);
  //   const tickValues: number[] = [];
  //   let currentTick = 0;
  //   while (currentTick <= max) {
  //     tickValues.push(currentTick);
  //     currentTick += interval;
  //   }
  //   if (tickValues[tickValues.length - 1] !== max) {
  //     tickValues.push(max);
  //   }
  //   return tickValues;
  // };


  const getYTickValues = (max: number, interval: number): number[] => {
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


  const totalQuestionsDoneChap = subjectsData?.[0]?.chapters?.reduce((accumulator, chapter) => {
    console.log("chapter+++++++", chapter);
    return accumulator + (chapter.totalQuestionsDone || 0);
  }, 0);

  const maxSubjectValue = Math.max(...subjectsData.map(subject => subject.totalAnsweredCount), 0);
  const maxChapterValue = Math.max(...chaptersData.map(chapter => chapter.totalQuestionsDone), 0);

  const subjectPercentageData = subjectsData.map(subject => ({
    x: subject.subjectName,
    y: maxSubjectValue > 0
      ? (subject.totalAnsweredCount / totalQuestionsA) * 100
      : 0,
  }));


  const chapterPercentageData = chaptersData.map(chapter => {
    const totalAnsweredCount = chapter.totalAnsweredCount || 0;
    const totalQuestionDone = chapter.totalQuestionsDone || 0;
    return {
      x: chapter.chapterName,
      y: chapter.totalQuestionsDone && chapter.totalAnsweredCount > 0
        ? (totalAnsweredCount / totalQuestionDone) * 100
        : 0,
    }
  }
  );

  useEffect(() => {
    setSubjectPercentageData(subjectPercentageData);
  }, [subjectsData]);

  console.log("12subjectsData12", subjectsData, { totalQuestionsA });

  useEffect(() => {
    if (selectedSubject) {
      const newChapterPercentageData = selectedSubject.chapters.map(chapter => ({
        x: chapter.chapterName,
        y: maxChapterValue > 0
          ? (chapter.correctAnswerCount / maxChapterValue) * 100
          : 0,
      }));
      setChapterPercentageData(newChapterPercentageData);
    } else {
      setChapterPercentageData([]);
    }
  }, [selectedSubject, maxChapterValue]);

  const interval = 20;

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const response = await axios.get<{
            modes: {
              mode: string;
              totalCorrectCount: number;
              totalIncorrectCount: number;
              totalQuestionCount: number;
            }[];
            totalQuestionCount: number;
            totalCorrectCount: number;
            totalIncorrectCount: number;
          }>(`${SERVER_URL}/quiz/${id}/correct-answered-by-mode`);

          const { modes, totalQuestionCount, totalCorrectCount, totalIncorrectCount } = response.data;
          console.log("MODE", response.data);
          const averageCorrectPercentage = (totalCorrectCount / totalQuestionCount) * 100;
          setTotalQuestions(totalQuestionCount || 0);
          setCorrectAnswersCount(totalCorrectCount || 0);
          setAvgCorrectAns(averageCorrectPercentage.toFixed(2))
          setIncorrectAnswersCount(totalIncorrectCount || 0);
          const modeData = modeKeys.reduce((acc, key) => {
            const modeInfo = modes.find((mode) => mode.mode === key) || {
              mode: key,
              totalCorrectCount: 0,
              totalIncorrectCount: 0,
              totalQuestionCount: 0,
            };
            acc[key] = {
              modeTitle: modeTitles[key] || key,
              correctAnswersByMode: modeInfo.totalCorrectCount,
              incorrectAnswersByMode: modeInfo.totalIncorrectCount,
              totalAnswers: modeInfo.totalQuestionCount,
            };
            return acc;
          }, {} as Record<string, ModeStats>);

          setQuestionsByMode(modeData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };
    fetchData();
  }, [id]);


  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const answeredResponse = await axios.get(`${SERVER_URL}/quiz/${id}/questions-answered`);
          console.log("asasas", answeredResponse)
          const { countCorrect, countCorrectOtherMode, questionsAnswered } = answeredResponse.data;
          setCorrectAnswersCount(countCorrect + (countCorrectOtherMode || 0));
          setQuestionsAnswered(questionsAnswered);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };
    fetchData();
  }, [id]);

  const maxPercentage = (totalQuestionsA / totalQuestionsA) * 100;

  // console.log("chartData", { chartData });

  const maxYValue = Math.max(...chartData.map((d:any) => d.y), 0);

  return (
    <div className="flex justify-between p-6 space-x-4 rounded-lg shadow-lg overflow-x-auto">
      <div className={`flex-none w-[350px] h-[450px] p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <AverageGradeCard
          correctAnswersCount={correctAnswersCount}
          questionsAnswered={questionsAnswered}
          darkMode={darkMode}
        />
      </div>
      <div className={`flex-none w-[350px] h-[450px] p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <AverageGradePerSubjectCard
          view={view}
          subjectsData={subjectsData}
          chaptersData={chaptersData}
          setSelectedSubject={setSelectedSubject}
          setChaptersData={setChaptersData}
          setView={setView}
          subjectPercentageData={subjectPercentageData}
          chapterPercentageData={chapterPercentageData}
          totalQuestionsA={totalQuestionsA}
          maxPercentage={maxPercentage}
          interval={interval}
          getYTickValues={getYTickValues}
          darkMode={darkMode}
        />
      </div>
      <div className={`flex-none w-[350px] h-[450px] p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <AverageGradePerModeCard
          modeTitles={modeTitles}
          questionsByMode={questionsByMode}
          darkMode={darkMode}
        />
      </div>
      <div className={`flex-none w-[350px] h-[450px] p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <CorrectAnswersTimelineCard
          selectedPeriod={selectedPeriod}
          chartData={chartData}
          handlePeriodClick={handlePeriodClick}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};

export default CorrectAnswer;
