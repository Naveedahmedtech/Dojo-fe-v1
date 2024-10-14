import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the required components for Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AverageGradeChart = ({ data, title, xKey, yKey, per, darkMode }: any) => {
    const chartData = {
        labels: data.map((item: any) => item[xKey]),
        datasets: [
            {
                label: title,
                data: data.map((item: any) => Number(item[yKey])),
                backgroundColor: '#0284c7',
                borderRadius: 4,
                barThickness: 8,
            },
        ],
    };

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,  // Allow chart to take the height of its container
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `${context.raw}%`;
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        size: 10,
                    },
                    align: 'start',
                    color: darkMode ? '#ffffff' : '#000000',
                },
            },
            y: {
                ticks: {
                    font: {
                        size: 10,
                    },
                    color: darkMode ? '#ffffff' : '#000000',
                    callback: function (value: any) {
                        return `${value}%`;
                    },
                    beginAtZero: true,
                    max: 100,  // Assuming percentage values
                },
                grid: {
                    color: darkMode ? '#444444' : '#dddddd',
                },
            },
        },
    };

    return (
        <div className={darkMode ? "bg-gray-800 text-white p-4 rounded-lg" : "bg-white text-black p-4 rounded-lg w-full"}>
            <h2 className='text-lg font-normal'>{per}</h2>
            <h2 className='text-2xl font-bold border-b-2 border-b-gray-200 mb-10 pb-3'>{title}</h2>
            <div style={{ height: '400px' }}> {/* Set the height of the container */}
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default AverageGradeChart;
