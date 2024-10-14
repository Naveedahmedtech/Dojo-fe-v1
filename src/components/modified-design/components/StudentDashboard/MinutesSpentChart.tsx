import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import CustomDropdown from '../../../teacherDashboard/CustomDropdown';
import CommonHead from './CommonHead';
import CommonSubHead from './CommonSubHead';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MinutesSpentOnPlatformCard: React.FC<{
    selectedPeriod: '1W' | '1M' | '3M';
    chartData: { x: string; y: string }[];
    formattedTime: string;
    handlePeriodClick: (period: '1W' | '1M' | '3M') => void;
    darkMode: any;
}> = ({ selectedPeriod, chartData, formattedTime, handlePeriodClick, darkMode }) => {
    const [data, setData] = useState<any>(null);

    const parseTimeToMinutes = (timeString: string) => {
        const timeParts = timeString.split(' ');
        let totalSeconds = 0;

        timeParts.forEach(part => {
            const value = parseInt(part.slice(0, -1));
            if (part.endsWith('h')) {
                totalSeconds += value * 3600;
            } else if (part.endsWith('m')) {
                totalSeconds += value * 60;
            } else if (part.endsWith('s')) {
                totalSeconds += value;
            }
        });

        return totalSeconds / 60; // Convert to minutes
    };

    const formatTooltipTime = (rawValue: number) => {
        const totalSeconds = rawValue * 60; // Convert minutes back to seconds for detailed display
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    useEffect(() => {
        if (chartData && chartData.length > 0) {
            const preparedData = {
                labels: chartData.map(item => item.x),
                datasets: [
                    {
                        label: 'Minutes Spent',
                        data: chartData.map(item => parseTimeToMinutes(item.y)),
                        backgroundColor: darkMode ? '#60a5fa' : '#176DAA',
                        hoverBackgroundColor: '#60a5fa',
                        barThickness: 40,
                        borderRadius: 10,
                    },
                ],
            };
            setData(preparedData);
        } else {
            setData(null);
        }
    }, [chartData, selectedPeriod, darkMode]);

    const options: any = {
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    display: false,
                },
                ticks: {
                    color: darkMode ? '#ffffff' : '#176DAA',
                    font: {
                        size: 14,
                        family: "'Arial', sans-serif",
                    },
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    borderDash: [5, 5],
                    color: darkMode ? '#333' : '#d3d3d3',
                },
                ticks: {
                    color: darkMode ? '#ffffff' : '#176DAA',
                    font: {
                        size: 16,
                        family: "'Arial', sans-serif",
                    },
                    stepSize: 3,
                    callback: function (value: number) {
                        return `${value.toFixed(0)} min`;
                    },
                },
            },
        },
        plugins: {
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function (context: any) {
                        const rawValue = context.raw;
                        const formattedTime = formatTooltipTime(rawValue);
                        return `${formattedTime} (${rawValue.toFixed(0)} min)`;
                    },
                },
                backgroundColor: darkMode ? '#333' : '#ffffff',
                titleColor: darkMode ? '#ffffff' : '#333',
                bodyColor: darkMode ? '#ffffff' : '#333',
                borderColor: darkMode ? '#ffffff' : '#333',
                borderWidth: 1,
            },
            legend: {
                display: false,
            },
            datalabels: {
                display: true,
                color: 'white',
                formatter: function (value: number) {
                    return `${value.toFixed(0)} min`;
                },
            },
        },
    };

    const periodOptions = [
        { value: '1W', label: 'Weekly' },
        { value: '1M', label: 'Monthly' },
        { value: '3M', label: '3 Months' },
    ];

    const selectedOption = periodOptions.find(option => option.value === selectedPeriod);

    return (
        <div className="h-[300px] p-4">
            <CommonHead text="Minutes Spent on Platform" darkMode={darkMode} />
            <CommonSubHead text="Over Selected Period" />
            <div className="flex justify-center mb-5">
                <CustomDropdown
                    options={periodOptions}
                    selectedOption={selectedOption}
                    onOptionSelect={(option: any) => handlePeriodClick(option.value)}
                    placeholder="Select period"
                    color={darkMode ? 'white' : 'blue'}
                />
            </div>
            {data ? (
                <div style={{ width: '100%', height: '100%' }}>
                    <Bar data={data} options={options} />
                </div>
            ) : (
                <p className="text-center text-gray-500">No data available for this period.</p>
            )}
        </div>
    );
};

export default MinutesSpentOnPlatformCard;
