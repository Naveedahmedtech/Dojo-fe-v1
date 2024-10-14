import React from 'react';
import MinutesSpentChart from './MinutesSpentChart';

const MinutesSpentOnPlatformCard: React.FC<{
    selectedPeriod: '1W' | '1M' | '3M',
    filteredChartData: any[],
    formattedTime: string,
    handlePeriodClick: (period: '1W' | '1M' | '3M') => void,
    darkMode: any
}> = ({
    selectedPeriod,
    filteredChartData,
    formattedTime,
    handlePeriodClick,
    darkMode
}) => (
        <div className="">
            <MinutesSpentChart selectedPeriod={selectedPeriod} chartData={filteredChartData} formattedTime={formattedTime} handlePeriodClick={handlePeriodClick} darkMode={darkMode} />
        </div>
    );

export default MinutesSpentOnPlatformCard;
