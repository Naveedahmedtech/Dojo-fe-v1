import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import CustomDropdown from '../../../teacherDashboard/CustomDropdown';
import CommonHead from './CommonHead';
import CommonSubHead from './CommonSubHead';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const QuestionsTimelineCard: React.FC<{
    selectedPeriod: '1W' | '1M' | '3M';
    chartData: { x: string; y: number }[];
    handlePeriodClick: (period: '1W' | '1M' | '3M') => void;
    darkMode: any
}> = ({ selectedPeriod, chartData, handlePeriodClick, darkMode }) => {
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        // Check if chartData is valid and contains data
        if (chartData && chartData.length > 0) {
            const preparedData = {
                labels: chartData.map(item => item.x),
                datasets: [
                    {
                        label: 'Questions Done',
                        data: chartData.map(item => item.y.toFixed(0)),
                        backgroundColor: '#176DAA',
                        hoverBackgroundColor: '#60a5fa',
                        borderRadius: 5,
                        barThickness: 30 ,
                    },
                ],
            };
            setData(preparedData);
        } else {
            setData(null); // Set data to null if no valid data is found
        }
    }, [chartData, selectedPeriod]);

    const options: any = {
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    display: false, // Hide vertical grid lines
                },
                ticks: {
                    color: '#176DAA', // X-axis label color
                    font: {
                        size: 14, // X-axis label font size
                        family: "'Arial', sans-serif",
                    },
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    borderDash: [200, 100], // Dashed grid lines
                    color: '#d3d3d3',
                },
                ticks: {
                    color: '#176DAA', // Y-axis tick color
                    font: {
                        size: 16, // Y-axis tick font size
                        family: "'Arial', sans-serif",
                    },
                    callback: function (value: number) {
                        return value.toString(); // Format y-axis labels as string
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
            <CommonHead text="Questions done" darkMode={darkMode} />
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
            <div style={{ width: '100%', height: "100%" }}>
                {data ? (
                    <Bar data={data} options={options} />
                ) : (
                    <p className="text-center text-gray-500">No data available for this period.</p>
                )}
            </div>
        </div>
    );
};

export default QuestionsTimelineCard;
