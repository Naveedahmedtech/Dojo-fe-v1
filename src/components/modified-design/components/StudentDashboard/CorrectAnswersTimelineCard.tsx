import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import CustomDropdown from '../../../teacherDashboard/CustomDropdown';
import CommonHead from './CommonHead';
import CommonSubHead from './CommonSubHead';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CorrectAnswersTimelineCard: React.FC<{
    selectedPeriod: '1W' | '1M' | '3M';
    chartData: { x: string; y: number }[];
    handlePeriodClick: (period: '1W' | '1M' | '3M') => void;
    darkMode: string | boolean
}> = ({ selectedPeriod, chartData, handlePeriodClick, darkMode }) => {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (chartData && chartData.length > 0) {
            const preparedData = {
                labels: chartData.map(item => item.x),
                datasets: [
                    {
                        label: 'Correct Answers',
                        data: chartData.map(item => item.y),
                        backgroundColor: '#176DAA',
                        hoverBackgroundColor: '#60a5fa',
                        barThickness: selectedPeriod === '1W' ? 30 : 30,
                        borderRadius: 10,
                    },
                ],
            };
            setData(preparedData);
        } else {
            setData(null);
        }
    }, [chartData, selectedPeriod]);

    const options: any = {
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#176DAA',
                    font: {
                        size: 14,
                        family: "'Arial', sans-serif",
                    },
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    borderDash: [200, 100],
                    color: '#d3d3d3',
                },
                ticks: {
                    color: '#176DAA',
                    font: {
                        size: 16,
                        family: "'Arial', sans-serif",
                    },
                    stepSize: 2,
                    callback: function (value: number) {
                        return value.toString();
                    },
                },
            },
        },
        plugins: {
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function (context: any) {
                        return ` ${context.raw}`;
                    },
                },
            },
            legend: {
                display: false,
            },
            datalabels: {
                display: true,
                color: 'white',
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
        <div className="h-[250px]">
            <CommonHead text="Correct answers" darkMode={darkMode} />
            <CommonSubHead text="Timeline" />
            <div className="flex justify-center mb-5">
                <CustomDropdown
                    options={periodOptions}
                    selectedOption={selectedOption}
                    onOptionSelect={(option: any) => handlePeriodClick(option.value)}
                    placeholder="Select period"
                    color="blue"
                />
            </div>
            {data ? (
                <div style={{ width: '100%', height: "100%" }}>
                    <Bar data={data} options={options} />
                </div>
            ) : (
                <p className="text-center text-gray-500">No data available for this period.</p>
            )}
        </div>
    );
};

export default CorrectAnswersTimelineCard;
