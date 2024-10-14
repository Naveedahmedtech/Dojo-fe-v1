import React, { useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const ChapterPieChart = ({ data, colorScale, handlePieClick }: any) => {
    useEffect(() => {
        console.log("Parent component data update:", data);
    }, [data]);

    // In ChapterPieChart component
    console.log("seuriyh before rendering:", data);

    // Prepare the data for Chart.js
    const chartData = {
        labels: data.map((item: any) => item.label),
        datasets: [
            {
                data: data.map((item: any) => item.y),
                backgroundColor: colorScale,
                borderColor: '#fff',
                borderWidth: 2,
            }
        ],
    };

    // Define the options for Chart.js
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                enabled: false,
            },
            legend: {
                display: false, // We will manage the legend manually
            },
            datalabels: {
                display: false,
            },
        },
        onClick: (event: any, elements: any) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const label = chartData.labels[index];
                handlePieClick(label);
            }
        },
    };


    return (
        <div className="flex flex-col items-center justify-center" style={{ width: '100%', maxWidth: '250px', height: "250px", margin: '0 auto' }}>
            <div style={{ height: '200px', width: '100%' }}>
                <Pie data={chartData} options={options} />
            </div>
            <div className="mt-4" style={{ maxHeight: '160px', overflowY: 'auto', width: '100%' }}>
                <ul className="space-y-2">
                    {data.map((item: any, index: number) => (
                        <li
                            key={index}
                            className="flex items-center cursor-pointer"
                            onClick={() => handlePieClick(item.label)}
                        >
                            <div
                                className="w-4 h-4 mr-2"
                                style={{ backgroundColor: colorScale[index % colorScale.length] }}
                            />
                            <span className="text-sm">{item.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ChapterPieChart;
