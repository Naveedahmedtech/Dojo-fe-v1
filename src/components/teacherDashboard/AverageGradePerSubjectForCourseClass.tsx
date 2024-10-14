import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SERVER_URL } from '../../../api';
import { useAuth } from '../../context/AuthProvider';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import SeeDetailsButton from './SeeDetailsButton';
import CommonHead from '../modified-design/components/StudentDashboard/CommonHead';
import CommonSubHead from '../modified-design/components/StudentDashboard/CommonSubHead';
import { getRandomColor } from '../../utils/colorGenerate';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Subject {
  subjectId: string;
  subjectName: string;
  overallAverageGrade: string;
}

interface FetchGradesResponse {
  subjects: Subject[];
}

interface AverageGradePerSubjectForCourseClassProps {
  courseId?: string;
  classId?: string;
  darkMode: any
}

const AverageGradePerSubjectForCourseClass: React.FC<AverageGradePerSubjectForCourseClassProps> = ({ courseId, classId, darkMode }) => {
  const [subjectData, setSubjectData] = useState<{ subjectName: string, averageGrade: number }[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        if (courseId || classId) {
          const url = classId
            ? `${SERVER_URL}/teacher/class/${classId}/grades`
            : `${SERVER_URL}/teacher/course/${courseId}/grades`;

          const response = await axios.get<FetchGradesResponse>(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const formattedData = response.data.subjects
            .map((subject) => {
              const averageGrade = parseFloat(subject.overallAverageGrade.replace('%', ''));
              if (isNaN(averageGrade)) {
                console.error(`Invalid average grade for subject ${subject.subjectName}: ${subject.overallAverageGrade}`);
                return null;
              }
              return {
                subjectName: subject.subjectName,
                averageGrade,
              };
            })
            .filter((data) => data !== null) as { subjectName: string; averageGrade: number }[];
          setSubjectData(formattedData);
        } else {
          console.error('Neither courseId nor classId provided.');
        }
      } catch (error) {
        console.error('Error fetching average grade per subject:', error);
      }
    };

    fetchSubjectData();
  }, [courseId, classId, token]);

  const backgroundColors = subjectData.map(() => getRandomColor());
  const borderColors = backgroundColors.map((color: any) => color);
  const chartData = {
    labels: subjectData.map((data) => data.subjectName),
    datasets: [
      {
        label: 'Average Grade (%)',
        data: subjectData.map((data) => data.averageGrade),
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 0,
        barThickness: 25, // Adjusted the bar thickness
        borderRadius: 20
      },
    ],
  };

  const options: any = {
    indexAxis: 'y' as const,  // Horizontal bar chart
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: any) => `${value}%`,
          color: '#176DAA',
        },
        grid: {
          borderDash: [200, 100], // Dashed grid lines
          color: '#d3d3d3',
        },
      },
      y: {

        ticks: {
          color: '#176DAA',
          font: {
            // weight: 'bold',
            color: '#176DAA',
          },
        },
        grid: {
          display: false
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.raw}%`,
        },
      },
      datalabels: {
        display: true,
        align: 'center',
        color: '#fff',
        font: {
          // weight: 'bold',
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };


  return (
    <div className={darkMode ? "bg-gray-800 text-white p-4 h-full rounded-lg" : "bg-white text-black p-4 h-full rounded-lg"}>
      <CommonHead text="Average grade " darkMode={darkMode} />
      <CommonSubHead text="Per Subject" />
      <div className="relative shadow-md rounded-lg" style={{ height: '300px', width: '100%', maxWidth: "700px" }}>
        <Bar data={chartData} options={options} />
      </div>
      <SeeDetailsButton to="/average-grade" label="See Details" />
    </div>
  );
};

export default AverageGradePerSubjectForCourseClass;
