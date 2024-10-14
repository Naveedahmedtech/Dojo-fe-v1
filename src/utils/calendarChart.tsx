interface TimeDataPoint {
  date: string;
  total_time_spent: number; 
}

export const generateTimeSpentCounts = (
  timeData: TimeDataPoint[],
  startDate: Date,
  endDate: Date,
  period: '1W' | '1M' | '3M'
): number[] => {
  if (period === '1W') {
    return generateWeekTimeSpent(timeData, startDate, endDate);
  } else if (period === '1M') {
    return generateMonthTimeSpent(timeData, startDate, endDate);
  } else if (period === '3M') {
    return generateThreeMonthTimeSpent(timeData, startDate, endDate);
  }
  return [];
};

export const generateWeekTimeSpent = (
  timeData: TimeDataPoint[], 
  startDate: Date,
  endDate: Date
): number[] => {
  const weekTimeSpent = Array(7).fill(0);

  timeData.forEach((time) => {
    const timeDate = new Date(time.date);
    if (timeDate >= startDate && timeDate <= endDate) {
      const dayOfWeek = timeDate.getDay(); 
      weekTimeSpent[dayOfWeek] += time.total_time_spent; 
    }
  });

  // console.log("ABC TIMES", { timeData, startDate, endDate, weekTimeSpent });

  return weekTimeSpent;
};

export const generateMonthTimeSpent = (
  timeData: TimeDataPoint[], 
  startDate: Date,
  endDate: Date
): number[] => {
  const monthTimeSpent = Array(Math.ceil((endDate.getDate() - startDate.getDate() + 1) / 7)).fill(0);
  timeData.forEach((time) => {
    const timeDate = new Date(time.date);
    if (timeDate >= startDate && timeDate <= endDate) {
      const weekIndex = Math.floor((timeDate.getDate() - 1) / 7);
      if (weekIndex >= 0 && weekIndex < monthTimeSpent.length) {
        monthTimeSpent[weekIndex] += time.total_time_spent; 
      }
    }
  });

  return monthTimeSpent;
};

export const generateThreeMonthTimeSpent = (
  timeData: TimeDataPoint[], 
  startDate: Date,
  endDate: Date
): number[] => {
  const threeMonthTimeSpent = Array(3).fill(0);

  timeData.forEach((time) => {
    const timeDate = new Date(time.date);
    if (timeDate >= startDate && timeDate <= endDate) {
      const startMonth = startDate.getMonth();
      const timeMonth = timeDate.getMonth();
      const monthIndex = timeMonth - startMonth;

      if (monthIndex >= 0 && monthIndex < 3) {
        threeMonthTimeSpent[monthIndex] += time.total_time_spent;  
      }
    }
  });

  return threeMonthTimeSpent;
};
