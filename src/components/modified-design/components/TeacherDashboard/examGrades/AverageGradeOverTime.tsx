import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import PeriodSelect from '../averageGrades/PeriodSelect';

// Register the required components for Chart.js
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AverageGradeOverTime = ({ calendarData, selectedPeriod, handlePeriodClick, darkMode }: any) => {
    const chartData = {
        labels: calendarData.map((item:any) => item.x),
        datasets: [
            {
                label: 'Average Grade',
                data: calendarData.map((item:any) => item.y),
                backgroundColor: '#0284c7',
                borderColor: '#0284c7',
                fill: false,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#0284c7',
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
            },
        ],
    };

    const options:any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context:any) {
                        return `${context.raw}%`;
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: darkMode ? '#ffffff' : '#000000',
                    font: {
                        size: 10,
                    },
                },
            },
            y: {
                ticks: {
                    color: darkMode ? '#ffffff' : '#000000',
                    font: {
                        size: 10,
                    },
                    beginAtZero: true,
                    max: 100,
                    callback: function (value:any) {
                        return `${value}%`;
                    },
                },
                grid: {
                    color: darkMode ? '#444444' : '#dddddd',
                },
            },
        },
    };

    return (
        <div className={darkMode ? "bg-gray-800 text-white p-4 rounded-lg" : "bg-white text-black p-4 rounded-lg w-full"}>
            <h2 className="text-md mb-4 text-center font-bold">Average grade</h2>
            <div className="flex justify-end mt-4">
                <PeriodSelect
                    periods={['1W', '1M', '6M']}
                    selectedPeriod={selectedPeriod}
                    handlePeriodClick={handlePeriodClick}
                />
            </div>
            {selectedPeriod && (
                <div style={{ height: '400px' }}>
                    <Line data={chartData} options={options} />
                </div>
            )}
        </div>
    );
};

export default AverageGradeOverTime;
