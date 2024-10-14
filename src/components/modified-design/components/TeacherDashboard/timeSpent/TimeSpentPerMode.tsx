import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import CommonSubHead from '../../StudentDashboard/CommonSubHead';
import CommonHead from '../../StudentDashboard/CommonHead';

// Register necessary components with Chart.js
Chart.register(ArcElement, Tooltip, Legend);

const TimeSpentPerMode = ({ timeByMode, COLORS, darkMode }: any) => {
    const data = {
        labels: timeByMode.map((item: any) => item.doneByMode),
        datasets: [
            {
                data: timeByMode.map((item: any) => item.totalTimeSpentPercentage * 100), // Multiply by 100 for correct percentage
                backgroundColor: COLORS,
                borderWidth: 0,
                hoverOffset: 4,
                borderRadius: 8,
                spacing: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Allow custom sizing
        cutout: '70%', // Increase cutout size for a smaller inner circle
        rotation: -90, // Start from top
        circumference: 180, // Makes it a half-donut
        plugins: {
            legend: {
                display: false, // Hide default legend
            },
            datalabels: {
                display: true,
                color: 'white',
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem: any) => {
                        const index = tooltipItem.dataIndex;
                        const label = tooltipItem.label;
                        const value = data.datasets[0].data[index];
                        const time = timeByMode[index].formattedTotalTimeSpent;
                        return `${label}: ${value.toFixed(2)}% (${time})`;
                    },
                },
            },
        },
    };

    return (
        <div className={darkMode ? "bg-gray-800 text-white h-full p-4 rounded-lg" : "bg-white text-black p-4 h-full rounded-lg"}>
            <CommonHead text="Time Spent" darkMode={darkMode} />
            <CommonSubHead text="Per Mode" />
            <div style={{ width: '400px', height: '300px', margin: '0 auto' }}>
                <Doughnut data={data} options={options} />
            </div>
            <div className='grid place-items-center'>
                {timeByMode.map((item: any, index: number) => (
                    <div key={index} className='grid grid-cols-[30px_auto] w-full max-w-56'>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: COLORS[index], fontSize: "30px" }}>●</p>
                        </div>
                        <div className='flex justify-between items-center w-full'>
                            <p className='text-xl'>{item.doneByMode}</p>
                            <p className='font-bold'>{`${(item.totalTimeSpentPercentage * 100).toFixed(2)}%`}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimeSpentPerMode;
