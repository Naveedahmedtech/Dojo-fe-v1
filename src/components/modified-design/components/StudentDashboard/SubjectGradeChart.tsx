import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);



const SubjectGradeChart = ({
    subjectsData,
    setSelectedSubject,
    setChaptersData,
    setView,
    subjectPercentageData,
    totalQuestionsA,
    maxPercentage,
    interval,
    getYTickValues
}: any) => {
    console.log(totalQuestionsA, interval, getYTickValues)
    const sumOfQuestionDone = () => {
        return subjectsData.map((subject:any) => {
            const totalQuestionsDoneInChapters = subject.chapters.reduce((sum: any, chapter: any) => sum + chapter.totalQuestionsDone, 0);
            return {
                subjectName: subject.subjectName,
                totalQuestionsDone: totalQuestionsDoneInChapters
            };
        });
    };

    // Prepare the data for Chart.js
    const data = {
        labels: subjectPercentageData.map((item: any) => item.x),
        datasets: [
            {
                label: 'Average Grade',
                data: subjectPercentageData.map((item: any) => {
                    const subject = subjectsData.find((subj: any) => subj.subjectName === item.x);
                    console.log("HEUKA", subjectsData);
                    return subject && subject.totalAnsweredCount >= 0 && subject.totalQuestionsDone > 0
                        ? Math.round(
                            (subject.chapters.reduce((acc: any, chapter: any) => acc + chapter.correctAnswerCount, 0) /
                                subject.chapters.reduce((acc: any, chapter: any) => acc + chapter.totalQuestionsDone, 0)) * 100
                        )
                        : 0;  // Default to 0 if totalQuestionsDone is 0 or data is missing
                }),
                backgroundColor: '#176DAA',
                hoverBackgroundColor: '#60a5fa',
                borderRadius: 10,
                borderSkipped: false,
                barThickness: 40,
            },
        ],
    };


    // Define the options for Chart.js
    const options:any = {
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
                padding: 50, 
            },
            y: {
                beginAtZero: true,
                min: 0,
                max: maxPercentage,
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
                    color: '#9ca3af',
                },
                padding: 50,
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

        onClick: (event: any, elements: any) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const subjectName = data.labels[index];
                const subject = subjectsData.find((subj: any) => subj.subjectName === subjectName) || null;
                setSelectedSubject(subject);
                setChaptersData(subject ? subject.chapters : []);
                setView('chapter');
            }
        },
    };

    return (
        <div className=' h-full' style={{ width: '100%', height: "100%", }}>
            <Bar data={data} options={options} />
        </div>
    );
};

export default SubjectGradeChart;
