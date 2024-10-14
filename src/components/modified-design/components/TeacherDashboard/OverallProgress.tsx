import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const OverallProgress = ({
    totalCorrectIncorrect,
    totalQuestions,
    totalQuestionDone,
    studentCount,
    darkMode
}: any) => {
    console.log("JJJ", studentCount, totalQuestionDone, (totalQuestionDone / studentCount));
    console.log("JJJ", studentCount, totalCorrectIncorrect, (totalCorrectIncorrect / studentCount));

    const avgDone = (totalQuestionDone / studentCount) as any;
    // const avgAns = (totalCorrectIncorrect / studentCount) as any;
    // const percentage = (avgDone.toFixed(2) / avgAns.toFixed(2)).toFixed(2);
    const percentage:any = (((totalCorrectIncorrect / studentCount) / totalQuestions) * 100).toFixed(0);

    const data = {
        datasets: [
            {
                data: [percentage, 100 - percentage],
                backgroundColor: [
                    '#176DAA', // Primary color for both modes
                    darkMode ? 'rgba(45, 55, 72, 1)' : 'rgba(224, 224, 224, 1)', // Trail color based on mode
                ],
                hoverBackgroundColor: [
                    '#176DAA', // Hover color for both modes
                    darkMode ? 'rgba(26, 32, 44, 1)' : 'rgba(229, 231, 235, 1)', // Hover trail color based on mode
                ],
                borderWidth: 0,
                borderRadius: 50,
            },
        ],
    };

    const options = {
        cutout: '75%',
        plugins: {
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
        <div className="flex flex-col items-center">
            <div className="text-center flex flex-row items-center">
                <div className="relative w-40 h-40 mb-4">
                    <Doughnut data={data} options={options} />
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-[18px] font-bold" style={{ color: darkMode ? '#ffffff' : '#1f2937' }}>
                            {percentage}%
                        </span>
                        <p className="text-xs" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>Questions answered</p>
                    </div>
                </div>
                <div className='flex flex-col ml-6'>
                    <p className="text-3xl font-semibold" style={{ color: darkMode ? '#ffffff' : '#1f2937' }}>{avgDone.toFixed(0)}</p>
                    <p className="text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>Questions done on average</p>
                    <p className="text-3xl font-semibold" style={{ color: darkMode ? '#ffffff' : '#1f2937' }}>{totalCorrectIncorrect / studentCount} / {totalQuestions}</p>
                    <p className="text-sm font-medium" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>Questions answered on average</p>
                </div>
            </div>
        </div>
    );
};

export default OverallProgress;
