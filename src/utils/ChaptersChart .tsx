import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const getYTickValues = (maxValue:any, interval:any) => {
//     const tickValues = [];
//     for (let i = 0; i <= maxValue; i += interval) {
//         tickValues.push(i);
//     }
//     return tickValues;
// };

const determineInterval = (maxValue:any) => {
    return Math.ceil(maxValue / 5);
};

const ChaptersChart = ({ subjectsData, chaptersData, setSelectedSubject, setChaptersData, setView }:any) => {
    const maxQuestions = Math.max(...chaptersData?.map((chapter:any) => chapter.questionCount));
    const interval = determineInterval(maxQuestions);
    // const yTickValues = getYTickValues(Math.ceil(maxQuestions / interval) * interval, interval);

    const data = {
        labels: chaptersData.map((chapter:any) => chapter.chapterName),
        datasets: [
            {
                label: 'Questions',
                data: chaptersData.map((chapter:any) => chapter.questionCount),
                backgroundColor: '#176DAA',
                hoverBackgroundColor: '#60a5fa',
                borderRadius: 5,
                barThickness: 30,
            },
        ],
    };

    const options:any = {
        maintainAspectRatio: false,
        indexAxis: 'x' as const,  // Vertical bars
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
                        return `${context.dataset.label}: ${context.raw}`;
                    },
                },
            },
            legend: {
                display: false, // Hide the legend
            },
            datalabels: {
                display: true,
                color: 'white',
            },
        },
        onClick: (event: any, elements: any) => {
            const e = event.target;
            console.log(e)
            if (elements.length > 0) {
                setView('subject');
                const firstSubject = subjectsData[0] || null;
                setSelectedSubject(firstSubject);
                setChaptersData(firstSubject ? firstSubject.chapters : []);
            }
        },
    };

    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', height: '100%' }}>
            <Bar data={data} options={options} />
        </div>
    );
};

export default ChaptersChart;
