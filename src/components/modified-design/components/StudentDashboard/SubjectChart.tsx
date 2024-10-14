import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SubjectChartProps {
    subjectsData: any[];
    setSelectedSubject: (subject: any) => void;
    setChaptersData: (chapters: any[]) => void;
    setView: any;
    getYTickValues: (data: number[], interval: number) => number[];
    interval: number;
}

const SubjectChart: React.FC<SubjectChartProps> = ({
    subjectsData,
    setSelectedSubject,
    setChaptersData,
    setView,
}) => {
    const data = {
        labels: subjectsData.map(subject => subject.subjectName),
        datasets: [
            {
                label: 'Questions',
                data: subjectsData.map(subject => subject.totalQuestionCount),
                backgroundColor: '#176DAA', // Adjust color to match your design
                hoverBackgroundColor: '#60a5fa', // Darker shade for hover
                borderRadius: 10, // Rounded corners for the bars
                borderSkipped: false, // Ensures rounded corners on both ends
                barThickness: 40, // Adjust bar thickness as needed
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
        onClick: (elements: any) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const subjectName = data.labels[index];
                const subject = subjectsData.find(subj => subj.subjectName === subjectName) || null;
                setSelectedSubject(subject);
                setChaptersData(subject ? subject.chapters : []);
                setView('chapter');
            }
        },
    };

    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', height: "100%" }}>
            <Bar data={data} options={options} />
        </div>
    );
};

export default SubjectChart;
