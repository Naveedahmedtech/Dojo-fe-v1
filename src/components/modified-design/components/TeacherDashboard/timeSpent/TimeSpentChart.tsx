import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import CommonHead from '../../StudentDashboard/CommonHead';
import CommonSubHead from '../../StudentDashboard/CommonSubHead';

// Register necessary components with Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TimeSpentChart = ({ selectedCourseId, selectedClassId, selectedSubjectId, dataFormatted, darkMode }: any) => {
    // Prepare data for Chart.js
    const labels = selectedCourseId || selectedClassId
        ? dataFormatted.map((item: any) => item.subjectName || '')
        : dataFormatted.map((item: any) => item.chapterName || '');

    const learnData = dataFormatted.map((item: any) => item.learn?.toFixed(1));
    const randomData = dataFormatted.map((item: any) => item.random?.toFixed(1));
    const examData = dataFormatted.map((item: any) => item.exam?.toFixed(1) );

    const data = {
        labels,
        datasets: [
            {
                label: 'Learn Mode',
                data: learnData,
                backgroundColor: '#A368F0',
                borderRadius: 5, // Make bars rounded
                barThickness: 60, // Control the thickness of the bars
            },
            {
                label: 'Random Mode',
                data: randomData,
                backgroundColor: '#3976EC',
                borderRadius: 5, // Make bars rounded
                barThickness: 60, // Control the thickness of the bars
            },
            {
                label: 'Exam Mode',
                data: examData,
                backgroundColor: '#A6D3F3',
                borderRadius: 5, // Make bars rounded
                barThickness: 40, // Control the thickness of the bars
            },
        ],
    };

    const options:any = {
        responsive: true,
        maintainAspectRatio: false, // Allow custom height
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        size: 14, // Increase font size for legend labels
                        weight: 'bold',
                    },
                    color: darkMode ? '#ffffff' : '#000000',
                },
            },
            title: {
                display: false,
            },
            datalabels: {
                display: true,
                color: 'white',
            },
        },
        scales: {
            x: {
                stacked: true,  // Enable stacking on the x-axis
                ticks: {
                    color: darkMode ? '#ffffff' : '#000000',
                    font: {
                        size: 14, // Increase font size for x-axis labels
                    },
                },
                grid: {
                    color: darkMode ? '#444444' : '#dddddd',
                },
            },
            y: {
                stacked: true,  // Enable stacking on the y-axis
                ticks: {
                    color: darkMode ? '#ffffff' : '#000000',
                    font: {
                        size: 14, // Increase font size for y-axis labels
                    },
                    callback: (value:any) => `${value} min`,
                },
                grid: {
                    color: darkMode ? '#444444' : '#dddddd',
                },
            },
        },
    };

    return (
        <div className={darkMode ? "bg-gray-800 text-white p-4 rounded-lg" : "bg-white text-black p-4 rounded-lg w-full"} style={{ maxHeight: '600px' }}>
            <CommonHead text="Time Spent" darkMode={darkMode} />
            <CommonSubHead text="Per Subject & Per Chapter" />
            <div style={{ height: '400px', width: "100%" }}>
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

export default TimeSpentChart;
