import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import CommonHead from '../../StudentDashboard/CommonHead';
import { getRandomColor } from '../../../../../utils/colorGenerate';

// Register the necessary components with Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const QuestionsDoneChart = ({ data, darkMode }: any) => {

    const backgroundColors = data.map(() => getRandomColor());
    const borderColors = backgroundColors.map((color:any) => color);
    // Prepare the data and options for Chart.js
    const chartData = {
        labels: data.map((item: any) => item.subjectName),
        datasets: [
            {
                label: 'Questions Done',
                data: data.map((item: any) => item.totalAnswered),
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                borderRadius: 5,
                barThickness: 20,
                hoverBackgroundColor: data.map((item: any) => item.hoverColor || item.fillColor),
            },
        ],
    };

    const options = {
        indexAxis: 'y' as const, // Horizontal bar chart
        maintainAspectRatio: false, // Allows you to control the aspect ratio
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    display: false,
                },
                ticks: {
                    color: darkMode ? '#176DAA' : '#176DAA',
                },
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: darkMode ? '#176DAA' : '#176DAA',
                },
            },
        },
        plugins: {
            legend: {
                display: false, // Hide the legend
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.raw}`, // Tooltip text for the values
                },
            },
            datalabels: {
                display: true,
                color: 'white',
            },
        },
    };

    return (
        <div className={darkMode ? "bg-gray-800 text-white p-4 rounded-lg " : "bg-white text-black p-4 rounded-lg"}>
            <CommonHead text='Question Done' darkMode={darkMode} />
            <div style={{ width: '100%', height: '400px', margin: '0 auto' }}>
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default QuestionsDoneChart;
