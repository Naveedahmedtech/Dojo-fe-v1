import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getRandomColor } from '../../../../../utils/colorGenerate';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AverageGradeChartSectionProps {
    selectedCourseId: string;
    darkMode: any;
    chapters?: { chapterName: string; averageGrade: number }[];
    availableSubjects?: any;
    selectedSubjectId?: string;
    selectedClassId?: string;
}

// Utility function to generate random colors


const AverageGradeChartSection: React.FC<AverageGradeChartSectionProps> = ({
    selectedCourseId,
    darkMode,
    chapters = [],
    availableSubjects = [],
    selectedSubjectId,
    selectedClassId
}) => {

    let labels: string[] = [];
    let data: number[] = [];

    if (selectedSubjectId) {
        labels = chapters.map(chapter => chapter.chapterName);
        data = chapters.map(chapter => chapter.averageGrade);
    } else if (selectedClassId || selectedCourseId) {
        labels = availableSubjects.map((subject: any) => subject.subjectName);
        data = availableSubjects.map((subject: any) => subject.averageGrade);
    }

    // Generate random colors for each bar
    const backgroundColors = data.map(() => getRandomColor());
    const borderColors = backgroundColors.map(color => color);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Average Grade (%)',
                data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                barThickness: 25, // Adjusted the bar thickness
                borderRadius: 20
            }
        ]
    };

    const options = {
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 10,
                        color: darkMode ? '#ffffff' : '#000000'
                    }
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 20,
                    callback: (value: any) => `${value}%`,
                    font: {
                        size: 10,
                        color: darkMode ? '#ffffff' : '#000000'
                    }
                },
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
            },
            datalabels: {
                display: true,
                color: 'white',
            },
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    return (
        <div className={darkMode ? "bg-gray-800 text-white h-full p-4 rounded-lg" : "bg-white text-black p-4 h-full rounded-lg"}>
            <h2>PER SUBJECTS</h2>
            <p className='text-2xl font-bold'>Average Grade</p>
            {selectedCourseId && (
                <div style={{ width: '100%', margin: '0 auto' }}>
                    <Bar data={chartData} options={options} height={300} />
                </div>
            )}
        </div>
    );
};

export default AverageGradeChartSection;
