import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChapterGradeChart = ({
    chaptersData,
    chapterPercentageData,
    interval,
    getYTickValues
}: any) => {

    console.log("chaptersData", chaptersData);

    // Prepare the data for Chart.js
    const data = {
        labels: chapterPercentageData.map((item: any) => item.x),
        datasets: [
            {
                label: 'Average Grade',
                data: chapterPercentageData.map((item: any) => {
                    const chapter: any = chaptersData.find((chap: any) => chap.chapterName === item.x);
                    const totalAnswerCount = chapter.correctAnswerCount || 0;
                    const totalQuestionDone = chapter.totalQuestionsDone || 0;
                    return chapter && totalQuestionDone > 0 && totalAnswerCount > 0
                        ? ((totalAnswerCount / totalQuestionDone) * 100).toFixed(0)
                        : 0;
                }),
                backgroundColor: '#176DAA', // Adjust color to match your design
                hoverBackgroundColor: '#60a5fa', // Darker shade for hover
                borderRadius: 10, // Rounded corners for the bars
                borderSkipped: false, // Ensures rounded corners on both ends
                barThickness: 30, // Adjust bar thickness as needed
            },
        ],
    };

    // Define the options for Chart.js
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
                    },
                },
            },
            y: {
                beginAtZero: true,
                min: 0,
                max: 100,
                ticks: {
                    color: '#176DAA',
                    font: {
                        size: 14,
                    },
                    // stepSize: interval,
                    stepSize: 20, 
                    callback: function (value: number) {
                        return `${value}%`; // Format y-axis labels as percentages
                    },
                },
                grid: {
                    color: '#d3d3d3',
                },
            },
        },
        plugins: {
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function (context: any) {
                        return `${context.raw}%`;
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

    return (
        <div style={{ width: '100%', height: "100%" }}>
            <Bar data={data} options={options} />
        </div>
    );
};

export default ChapterGradeChart;
