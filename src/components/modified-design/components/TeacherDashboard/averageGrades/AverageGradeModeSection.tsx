import React from 'react';
import AverageGradeModeCard from '../../../../teacherDashboard/AverageGradeModeCard';
import CommonHead from '../../StudentDashboard/CommonHead';
import CommonSubHead from '../../StudentDashboard/CommonSubHead';

interface AverageGradeModeSectionProps {
    percentageByMode: {
        learn: number;
        random: number;
        exam: number;
    };
    darkMode:string
}

const AverageGradeModeSection: React.FC<any> = ({ percentageByMode, darkMode }) => (
    <div
        className={darkMode ? "bg-gray-800 text-white  h-full p-4 rounded-lg" : "bg-white text-black p-4 h-full rounded-lg"}
        // className="flex flex-col flex-wrap justify-start space-y-2"
    >
        <CommonHead text='Average Grade' darkMode={darkMode} />
        <CommonSubHead text='Per Mode' />
        <AverageGradeModeCard modeTitle="Learn Mode" averageGrade={percentageByMode.learn} darkMode={darkMode} />
        <AverageGradeModeCard modeTitle="Random Mode" averageGrade={percentageByMode.random} darkMode={darkMode} />
        <AverageGradeModeCard modeTitle="Exam Mode" averageGrade={percentageByMode.exam} darkMode={darkMode} />
    </div>
);

export default AverageGradeModeSection;
