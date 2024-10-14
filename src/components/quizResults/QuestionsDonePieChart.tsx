import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface QuestionsDonePieChartProps {
  correct: number;
  incorrect: number;
  notAnswered: number;
  darkMode: any
}

const QuestionsDonePieChart: React.FC<QuestionsDonePieChartProps> = ({ correct, incorrect, notAnswered, darkMode }) => {
  const totalQuestions = correct + incorrect + notAnswered;
  const answeredPercentage = ((correct + incorrect) / totalQuestions * 100).toFixed(2);

  const data = {
    labels: ['Correct', 'Incorrect', 'Not Answered'],
    datasets: [
      {
        data: [correct, incorrect, notAnswered],
        backgroundColor: ['#00C30A', '#E53935', '#e5e7eb'],
        hoverBackgroundColor: ['#02ab0a', '#c42521', '#cbd5e1'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options:any = {
    plugins: {
      datalabels: {
        display: true,
        formatter: (value: number, context: any) => `${value === 0 ? "" : value}`,
        color: '#ffffff',
        font: {
          size: 13,
          weight: '600',
        },
      },
      tooltip: {
        enabled: true,
        // backgroundColor: '#176DAA',
        titleFont: {
          size: 13,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        displayColors: false,
        position: 'nearest',  // Default is 'average'. 'nearest' moves it closer to the hovered point.
        yAlign: 'center',  // Can be 'top', 'bottom', 'center'
        xAlign: 'center',
      },
      legend: {
        display: false,
      },
    },
    cutout: '75%',
  };


  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '180px', margin: '0 auto' }}>
      <Pie data={data} options={options} />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: '700',
          color: '#333',
        }}
      >
        <p className={`${darkMode ? "text-white" : "text-black"}`}>{answeredPercentage === "NaN" ? 0 : answeredPercentage}%</p>
        <div style={{ fontSize: '15px', color: '#757575' }}>answered</div>
      </div>
    </div>
  );
};

export default QuestionsDonePieChart;
