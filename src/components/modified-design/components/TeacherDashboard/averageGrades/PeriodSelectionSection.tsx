import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import PeriodSelect from './PeriodSelect'; // Import the new component

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// interface PeriodSelectionSectionProps {
//     selectedPeriod: string;
//     handlePeriodClick: (period: string) => void;
//     calendarData: { x: string, y: number }[];
//     darkMode: any;
// }

const PeriodSelectionSection: React.FC<any> = ({
    selectedPeriod,
    handlePeriodClick,
    calendarData,
    darkMode
}) => {
    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        if (calendarData && calendarData.length > 0) {
            const data = {
                labels: calendarData.map((dataPoint:any) => dataPoint.x),
                datasets: [
                    {
                        label: 'Average Grade (%)',
                        data: calendarData.map((dataPoint:any) => dataPoint.y.toFixed(2)),
                        borderColor: '#0284c7',
                        backgroundColor: '#0284c7',
                        fill: false,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#0284c7',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        borderWidth: 2,
                    },
                ],
            };
            setChartData(data);
        }
    }, [calendarData]);

    const options:any = {
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 10,
                    },
                },
            },
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20,
                    callback: (value: any) => `${value}%`,
                    font: {
                        size: 10,
                    },
                },
                grid: {
                    borderDash: [5, 5],
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            datalabels: {
                display: true,
                align: "bottom"
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.raw}%`,
                },
            },
        },
    };

    return (
        <div className={darkMode ? "bg-gray-800 text-white h-full p-4 rounded-lg" : "bg-white text-black p-4 h-full rounded-lg"}>
            <div className="flex justify-between items-center">
                <div className="">
                    <p>Last {selectedPeriod === "1W" ? "Week" : selectedPeriod === "1M" ? "Month" : "6th Months"}</p>
                    <p className='text-2xl font-bold'>Average Grade</p>
                </div>
                <div className="flex justify-end mt-4">
                    <PeriodSelect
                        periods={['1W', '1M', '6M']}
                        selectedPeriod={selectedPeriod}
                        handlePeriodClick={handlePeriodClick}
                    />
                </div>
            </div>
            <div style={{ width: '100%',  margin: '0 auto' }}>
                {selectedPeriod && chartData && (
                    <Line data={chartData} options={options} />
                )}
            </div>
        </div>
    );
};

export default PeriodSelectionSection;
