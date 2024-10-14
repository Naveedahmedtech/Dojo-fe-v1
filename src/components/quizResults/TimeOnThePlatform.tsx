import  { useEffect, useState } from 'react';
import axios from 'axios';
import {
  VictoryPie,
  VictoryTooltip,
  VictoryLegend,
} from 'victory';
import { SERVER_URL } from '../../../api';
import formatSecondsToHHMMSS from '../../utils/formatTime.tsx';
import {
  generateTimeSpentCounts,
} from '../../utils/calendarChart';
import { useParams } from 'react-router-dom';
import TotalTimeSpentCard from '../modified-design/components/StudentDashboard/TotalTimeSpentCard.tsx';
import TimePerSubjectChapterChart from './TimePerSubjectChapterChart.tsx';
import TimeOnPlatformPerModeCard from '../modified-design/components/StudentDashboard/TimeOnPlatformPerModeCard.tsx';
import MinutesSpentOnPlatformCard from '../modified-design/components/StudentDashboard/MinutesSpentOnPlatformCard.tsx';

interface TimeSpentByMode {
  [key: string]: number;
}


interface TimeData {
  totalTimePerChapter: { name: string; total: number }[];
  totalTimePerSubject: { name: string; total: number, chapters: { name: string; total: number }[] }[];
}

interface TimeDataPoint {
  x: any;
  y: any;
  date: string;
  total_time_spent: number;
}

const TimeOnThePlatform = ({ darkMode }:any) => {
  const { id } = useParams<{ id: string }>();
  const [, setTimeSpent] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [timeSpentByMode, setTimeSpentByMode] = useState<{ [key: string]: number }>({});
  const [selectedPeriod, setSelectedPeriod] = useState<'1W' | '1M' | '3M'>('1W');
  const [totalTimeSpent, setTotalTimeSpent] = useState('00:00:00');
  const [subjectsData, setSubjectsData] = useState<{ x: string; y: number; label: string }[]>([]);
  const [chaptersData, setChaptersData] = useState<{ x: string; y: number; label: string }[]>([]);
  const [, setTotalTimePerSubject] = useState<{
    name: string;
    total: number;
    chapters: { name: string; total: number }[];
  }[]>([]);
  const [, setTotalTimePerChapter] = useState<{ name: string; total: number }[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [, setDayNames] = useState<string[]>([]);
  const [, setWeekNames] = useState<string[]>([]);
  const [, setMonthNames] = useState<string[]>([]);
  const [timePerDate, setTimePerDate] = useState<TimeDataPoint[]>([]);

  useEffect(() => {
    const fetchTimeOnPlatform = async () => {
      try {
        if (id) {
          const response = await axios.get(`${SERVER_URL}/quiz/${id}/total-time-spent`);
          const { time_ref, time_spent_by_mode, total_time_spent } = response.data;
          const currentDate = new Date();
          const periods = {
            '1W': [new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000), currentDate],
            '1M': [new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1), currentDate],
            '3M': [new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1), currentDate],
          };
          const selectedPeriodDates = periods[selectedPeriod];
          const timeSpentCounts = generateTimeSpentCounts(
            time_ref ?? [],
            selectedPeriodDates[0],
            selectedPeriodDates[1],
            selectedPeriod
          );
          // console.log("timeSpentCounts", timeSpentCounts);
          setTimeSpent(timeSpentCounts);
          setTimeSpentByMode(time_spent_by_mode ?? {});
          const totalSeconds = convertTimeToSeconds(total_time_spent);
          setTotalTimeSpent(formatSecondsToHHMMSS(totalSeconds));
        }
      } catch (error) {
        console.error('Error fetching time on platform:', error);
      }
    };
    fetchTimeOnPlatform();
  }, [id, selectedPeriod]);

  // console.log("totalTimeSpent", totalTimeSpent)

  const convertTimeToSeconds = (timeString: string) => {
    const [hoursStr, minutesStr, secondsStr] = timeString.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const seconds = parseInt(secondsStr, 10);
    return hours * 3600 + minutes * 60 + seconds;
  };

  useEffect(() => {
    const fetchTimePerDate = async () => {
      try {
        if (id) {
          const response = await axios.get<TimeDataPoint[]>(`${SERVER_URL}/quiz/${id}/time-spent-per-date`);
          // console.log("fsjkldf",response.data);
          setTimePerDate(response.data);
        }
      } catch (error) {
        console.error('Error fetching time spent per date:', error);
      }
    };
    fetchTimePerDate();
  }, [id]);

  useEffect(() => {
    const generateDayNames = () => {
      const today = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return Array.from({ length: 7 }, (_, i) => {
        const nextDay = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        return days[nextDay.getDay()];
      }).reverse();
    };

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

  const parseTimeString = (timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // const formatTime = (totalSeconds: number) => {
  //   const hours = Math.floor(totalSeconds / 3600);
  //   const minutes = Math.floor((totalSeconds % 3600) / 60);
  //   const seconds = totalSeconds % 60;
  //   return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  // };

  const groupTimeByWeek = (timePerDate: any[], startDate: Date, endDate: Date) => {
    const weekTotals: any[] = [];
    const weekCounts: { [key: string]: number } = {};

    timePerDate.forEach(({ date, total_time_spent }: any) => {
      const currentDate = new Date(date);
      if (currentDate >= startDate && currentDate <= endDate) {
        const weekStartDate = new Date(currentDate);
        weekStartDate.setDate(currentDate.getDate() - currentDate.getDay()); // Start of the week
        const weekKey = weekStartDate.toISOString().split('T')[0]; // String representation of the week start date

        if (!weekCounts[weekKey]) {
          weekCounts[weekKey] = 0;
        }
        weekCounts[weekKey] += parseTimeString(total_time_spent); // Sum total time spent in seconds
      }
    });

    for (const weekKey in weekCounts) {
      weekTotals.push({
        week: weekKey,
        total: formatTime(weekCounts[weekKey]), // Convert total seconds back to HH:MM:SS format
      });
    }

    weekTotals.sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());


    return weekTotals;
  };

  const groupTimeByMonth = (timePerDate: any[], startDate: Date, endDate: Date) => {
    const monthTotals: any[] = [];
    const monthCounts: { [key: string]: number } = {};

    timePerDate.forEach(({ date, total_time_spent }: any) => {
      const currentDate = new Date(date);
      if (currentDate >= startDate && currentDate <= endDate) {
        const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;

        if (!monthCounts[monthKey]) {
          monthCounts[monthKey] = 0;
        }
        monthCounts[monthKey] += parseTimeString(total_time_spent); // Convert and sum total time spent in seconds
      }
    });

    for (const monthKey in monthCounts) {
      const [year, month] = monthKey.split('-').map(Number);
      monthTotals.push({
        month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }) + ` ${year}`,
        total: formatTime(monthCounts[monthKey]), // Convert total seconds back to HH:MM:SS format
      });
    }

    monthTotals.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    // console.log("TIMES123", { timePerDate, monthTotals });

    return monthTotals;
  };


  //   const calendarChart = (
  //     questionsDoneData: TimeDataPoint[],
  //     selectedPeriod: '1W' | '1M' | '3M',
  //     dayNames: string[],
  //     _weekNames: string[],
  //     monthNames: string[]
  //   ) => {
  //     const currentDate = new Date();

  //     const getDataForPeriod = (
  //       startDate: Date,
  //       endDate: Date,
  //       dataMapping: (average: number, date: Date, index: number) => { x: string, y: number }
  //     ) => {
  //       const filteredData = questionsDoneData.filter(datum => {
  //         const date = new Date(datum.date);
  //         return date >= startDate && date <= endDate;
  //       });

  //       const counts = Array.from({ length: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) }).map((_, i) => {
  //         const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
  //         const dataPoint = filteredData.find(datum => new Date(datum.date).toDateString() === date.toDateString());
  //         return dataPoint ? dataPoint.total_time_spent : 0;
  //       });

  //       return counts.map((count, index) => {
  //         const date = new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000);
  //         return dataMapping(count, date, index);
  //       });
  //     };

  //     const getStartDateAndMapping = () => {
  //       switch (selectedPeriod) {
  //         case '1W':
  //           return {
  //             startDate: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000),
  //             endDate: currentDate,
  //             dataMapping: (average: number, _date: Date, index: number) => ({
  //               x: dayNames[index],
  //               y: average,
  //             }),
  //           };

  //         case '1M':
  //           const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  //           const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  //           const weeklyAverages = groupQuestionsByWeek(questionsDoneData, startOfMonth, endOfMonth);
  //           const formatDate = (date: Date) => `${date.getDate()}/${date.getMonth() + 1}`;

  //           return {
  //             startDate: startOfMonth,
  //             endDate: endOfMonth,
  //             dataMapping: (_average: number, _date: Date, index: number) => {
  //               const weekIndex = Math.floor(index / 7);
  //               const weekStartDate = new Date(startOfMonth);
  //               weekStartDate.setDate(weekStartDate.getDate() + weekIndex * 7);

  //               const weekEndDate = new Date(weekStartDate);
  //               weekEndDate.setDate(weekStartDate.getDate() + 6);
  //               const weekAverage = weeklyAverages[weekIndex]?.average || 0;

  //               return {
  //                 x: `${formatDate(weekStartDate)} - ${formatDate(weekEndDate)}`,
  //                 y: weekAverage,
  //               };
  //             },
  //           };

  //         case '3M':
  //           const startOfThreeMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
  //           const endOfThreeMonths = currentDate;
  //           const monthlyAverages = groupQuestionsByMonth(questionsDoneData, startOfThreeMonthsAgo, endOfThreeMonths);

  //           return {
  //             startDate: startOfThreeMonthsAgo,
  //             endDate: endOfThreeMonths,
  //             dataMapping: (_average: number, _date: Date, index: number) => {
  //               const monthName = monthNames[index];
  //               return {
  //                 x: monthName,
  //                 y: monthlyAverages[index] || 0, 
  //               };
  //             },
  //           };

  //         default:
  //           throw new Error('Invalid selectedPeriod');
  //       }
  //     };


  //   const { startDate, endDate, dataMapping } = getStartDateAndMapping();
  //   return getDataForPeriod(startDate, endDate, dataMapping);
  // };

  const convertTimeToSeconds_ = (time: string): number => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const totalTimeInSeconds = convertTimeToSeconds_(totalTimeSpent);
  const formattedTime = formatTime(totalTimeInSeconds);
  // console.log("Total Time Spent (in seconds):", totalTimeInSeconds);
  // console.log("Formatted Time:", formattedTime);
  // const calendarChart = (
  //   questionsDoneData: TimeDataPoint[],
  //   selectedPeriod: '1W' | '1M' | '3M'
  // ) => {
  //   const currentDate = new Date();

  //   const getDataForPeriod = (
  //     startDate: Date,
  //     endDate: Date,
  //     dataMapping: (totalTime: number, date: Date, index: number) => { x: string, y: number }
  //   ) => {

  //     console.log("questionsDoneData", questionsDoneData);
  //     // Filter data within the selected period
  //     const filteredData = questionsDoneData.filter(datum => {
  //       const date = new Date(datum.date);
  //       return date >= startDate && date <= endDate;
  //     });
  //     console.log("questionsDoneDataF", filteredData);

  //     // Aggregate data by day
  //     const counts = Array.from({ length: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) }).map((_, i) => {
  //       const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
  //       const dataPoint = filteredData.find(datum => new Date(datum.date).toDateString() === date.toDateString());
  //       return dataPoint ? dataPoint.total_time_spent : 0; // Assume time is in minutes
  //     });

  //     // Map the aggregated data to chart points
  //     return counts.map((totalTime, index) => {
  //       const date = new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000);
  //       return dataMapping(totalTime, date, index);
  //     });
  //   };

  //   // Determine the start and end dates based on the selected period
  //   const getStartDate = (period: '1W' | '1M' | '3M') => {
  //     switch (period) {
  //       case '1W':
  //         return new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  //       case '1M':
  //         return new Date(currentDate.setMonth(currentDate.getMonth() - 1));
  //       case '3M':
  //         return new Date(currentDate.setMonth(currentDate.getMonth() - 3));
  //       default:
  //         return new Date();
  //     }
  //   };

  //   const startDate = getStartDate(selectedPeriod);
  //   const endDate = new Date();

  //   // Map data to chart points
  //   const chartData = getDataForPeriod(startDate, endDate, (totalTime, date) => ({
  //     x: date.toDateString(),
  //     y: totalTime, // Ensure totalTime is correctly represented in minutes
  //   }));

  //   // Calculate the total time spent in minutes
  //   const totalTimeInMinutes = chartData.reduce((total, point) => total + point.y, 0);

  //   // Convert minutes to HH:MM:SS format
  //   const totalHours = Math.floor(totalTimeInMinutes / 60);
  //   const totalMinutes = totalTimeInMinutes % 60;
  //   const totalSeconds = 0;

  //   // Return chart data and total time spent
  //   return { chartData, totalTimeSpent: `${totalHours}:${totalMinutes}:${totalSeconds}` };
  // };

  // Destructure the result and filter chartData
  // const { chartData, totalTimeSpent: calculatedTotalTimeSpent } = calendarChart(
  //   timePerDate,
  //   selectedPeriod
  // );


  const calendarChart = (
    timePerDate: any[],
    selectedPeriod: '1W' | '1M' | '3M'
  ) => {
    const currentDate = new Date();

    // If timePerDate is not defined or empty, return an empty array and zero time spent
    if (!timePerDate || timePerDate.length === 0) {
      return { chartData: [], totalTimeSpent: '0h 0m 0s' };
    }

    const getDataForPeriod = (startDate: Date, endDate: Date, groupingFunction: any) => {
      const groupedData = groupingFunction(timePerDate, startDate, endDate);
      return groupedData.map(({ total, week, month }: any, index: any) => ({
        x: selectedPeriod === '1W' ? `Week ${index + 1}` :
          selectedPeriod === '1M' ? `Week ${index + 1}` : month,
        y: total,
      }));
    };

    const getStartDateAndGroupingFunction = () => {
      switch (selectedPeriod) {
        case '1W':
          return {
            startDate: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000),
            endDate: currentDate,
            groupingFunction: groupTimeByWeek,
          };

        case '1M':
          const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          return {
            startDate: startOfMonth,
            endDate: endOfMonth,
            groupingFunction: groupTimeByWeek,
          };

        case '3M':
          const startOfThreeMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
          return {
            startDate: startOfThreeMonthsAgo,
            endDate: currentDate,
            groupingFunction: groupTimeByMonth,
          };

        default:
          throw new Error('Unsupported period');
      }
    };

    const { startDate, endDate, groupingFunction } = getStartDateAndGroupingFunction();
    const chartData = getDataForPeriod(startDate, endDate, groupingFunction);

    return { chartData, totalTimeSpent: chartData.reduce((total:any, point:any) => total + point.y, 0) };
  };

  const { chartData, totalTimeSpent: calculatedTotalTimeSpent } = calendarChart(
    timePerDate,
    selectedPeriod
  );
  console.log(calculatedTotalTimeSpent)

  // console.log("chartDataachartData", chartData);

  // const filteredChartData = chartData ? chartData.filter((point: any) => !isNaN(point.y)) : [];

  const filteredChartData = chartData;



  // console.log("Filtered Chart Data:", filteredChartData);


  // const chartData = calendarChart(
  //   timePerDate,
  //   selectedPeriod,
  //   dayNames,
  //   weekNames,
  //   monthNames
  // ).filter(point => !isNaN(point.y));


  const handlePeriodClick = (period: '1W' | '1M' | '3M') => {
    setSelectedPeriod(period);
  };


  useEffect(() => {
    const fetchTimePerSubjectAndChapter = async () => {
      try {
        const response = await axios.get<TimeData>(`${SERVER_URL}/quiz/${id}/time-per-subject-and-chapter`);
        const { totalTimePerChapter, totalTimePerSubject } = response.data;
        setTotalTimePerChapter(totalTimePerChapter);
        setTotalTimePerSubject(totalTimePerSubject);
        transformDataForPieChart(totalTimePerSubject, totalTimePerChapter, selectedSubject);
      } catch (error) {
        console.error('Error fetching time per subject and chapter:', error);
      }
    };

    fetchTimePerSubjectAndChapter();
  }, [id, selectedSubject]);

  const transformDataForPieChart = (
    subjects: { name: string; total: number; chapters: { name: string; total: number }[] }[],
    _chapters: { name: string; total: number }[],
    selectedSubject: string | null
  ) => {
    if (selectedSubject) {
      const subject = subjects.find(subject => subject.name === selectedSubject);
      if (subject) {
        const filteredChaptersData = subject.chapters
          .filter(({ total }) => total !== null && total !== 0)
          .map(({ name, total }) => ({
            x: name,
            y: total,
            label: `${name}\n${formatSecondsToHHMMSS(total)}`
          }));
        setChaptersData(filteredChaptersData);
      }
    } else {
      const filteredSubjectsData = subjects
        .filter(({ total }) => total !== null && total !== 0)
        .map(({ name, total }) => ({
          x: name,
          y: total,
          label: `${name}\n${formatSecondsToHHMMSS(total)}`
        }));
      setSubjectsData(filteredSubjectsData);
    }
  };

  const handleSliceClick = (name: string) => {
    if (selectedSubject) {
      setSelectedSubject(null);
    } else {
      setSelectedSubject(name);
    }
  };

  useEffect(() => {
    const fetchTimeOnPlatform = async () => {
      try {
        if (id) {
          const response = await axios.get(`${SERVER_URL}/quiz/${id}/total-time-spent`);
          const { time_spent_by_mode, ...otherData } = response.data;
          const modes = ['learn', 'random', 'exam'];
          const filledTimeSpentByMode: TimeSpentByMode = modes.reduce((acc, mode) => {
            acc[mode] = time_spent_by_mode[mode] || 0;
            return acc;
          }, {} as TimeSpentByMode);
          setTimeSpent({
            ...otherData,
            time_spent_by_mode: filledTimeSpentByMode,
          });
        }
      } catch (error) {
        console.error('Error fetching time on platform:', error);
      }
    };
    fetchTimeOnPlatform();
  }, [id, selectedPeriod]);

  const customColorScale = ['#fb923c', '#ea580c', '#f97316'];
  const data = Object.keys(timeSpentByMode).map((mode, index) => ({
    mode,
    timeSpent: timeSpentByMode[mode],
    formattedTime: formatSecondsToHHMMSS(timeSpentByMode[mode]),
    color: customColorScale[index % customColorScale.length],
  }));

  const timeByModes = () => (
    <div className="flex flex-row justify-center items-center text-black">
      <VictoryPie
        data={data}
        x="mode"
        y="timeSpent"
        colorScale={data.map(d => d.color)}
        labels={({ datum }) => `${datum.mode}: ${datum.formattedTime}`}
        labelComponent={
          <VictoryTooltip
            style={{ fontSize: 14 }}
          />
        }
        innerRadius={80}
        style={{
          data: {
            fill: ({ datum }) => datum.color,
          },
          labels: {
            fontSize: 24,
          },
        }}
        width={200}
        height={300}
      />
      <VictoryLegend
        data={data.map(d => ({
          name: `${d.mode}: ${d.formattedTime}`,
          symbol: { fill: d.color },
        }))}
        orientation="vertical"
        colorScale={data.map(d => d.color)}
        style={{
          labels: {
            fontSize: 34,
            fill: '#333',
          },
        }}
      />
    </div>
  );

  return (
    <div className="flex justify-between p-6 space-x-4 rounded-lg shadow-lg overflow-x-auto">
      <div className={`flex-none w-[350px] h-[450px] p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <TotalTimeSpentCard totalTimeSpent={totalTimeSpent} darkMode={darkMode} />
      </div>
      <div className={`flex-none w-[350px] h-[450px] p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <TimePerSubjectChapterChart
          subjectData={subjectsData}
          chapterData={chaptersData}
          onSliceClick={handleSliceClick}
          darkMode={darkMode}
        />
      </div>
      <div className={`flex-none w-[350px] h-[450px] p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <TimeOnPlatformPerModeCard
          timeSpentByMode={timeSpentByMode}
          timeByModes={timeByModes}
          darkMode={darkMode}
        />
      </div>
      <div className={`flex-none w-[350px] h-[450px] p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <MinutesSpentOnPlatformCard
          selectedPeriod={selectedPeriod}
          filteredChartData={filteredChartData}
          formattedTime={formattedTime}
          handlePeriodClick={handlePeriodClick}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};

export default TimeOnThePlatform;
