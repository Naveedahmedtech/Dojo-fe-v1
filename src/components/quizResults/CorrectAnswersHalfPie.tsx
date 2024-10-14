import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

interface GaugeChartProps {
  value: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ value }) => {
  const remainingValue = 100 - value;
  const partValue = remainingValue / 3;

  const segmentColors = ['#FF718B', '#FCB5C3', '#FFEB3A', '#7FE47E'];

  const data = {
    labels: [],
    datasets: [
      {
        data: [value.toFixed(2), partValue.toFixed(2), partValue.toFixed(2), partValue.toFixed(2)],
        backgroundColor: segmentColors,
        borderColor: 'transparent',
        borderWidth: 5,
        borderRadius: 50,
        spacing: 10,
      }
    ],
  };

  const options = {
    rotation: -90,
    circumference: 180,
    cutout: '85%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: false,
      },
      legend: {
        display: false,
      },
      datalabels: {
        display: false,
      },
      afterDraw: (chart: any) => {
        const { ctx, chartArea: { width, height } } = chart;
        const angle = (Math.PI * (value / 100)) - Math.PI / 2;
        const radius = Math.min(width, height) / 2.5;
        const xPos = width / 2 + Math.cos(angle) * radius;
        const yPos = height - Math.sin(angle) * radius;

        // Draw indicator dot
        ctx.save();
        ctx.beginPath();
        ctx.arc(xPos, yPos, 8, 0, 2 * Math.PI);
        ctx.fillStyle = segmentColors[0]; // Use the color of the first segment (corresponding to the percentage value)
        ctx.shadowBlur = 10;
        ctx.shadowColor = segmentColors[0];
        ctx.fill();
        ctx.restore();
      }
    },
  };

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Doughnut data={data} options={options} />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: segmentColors[0], // Set text color to match the color of the first segment
          }}
        >
          {isNaN(value) ? 0 : value.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

export default GaugeChart;
