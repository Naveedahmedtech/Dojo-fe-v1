import React from 'react';

const QuestionDonePerModeCard = ({ modeTitle, averageGrade }:any) => (
    <div className="bg-gradient-to-b from-blue-50 to-indigo-50 text-black p-4 rounded-lg shadow-md w-[300px] h-[120px]">
        <h3 className="text-md mb-2 text-center font-bold">{modeTitle}</h3>
        <div className="flex justify-center items-center h-full">
            <span className="text-2xl font-bold">{averageGrade}%</span>
        </div>
    </div>
);

export default QuestionDonePerModeCard;
