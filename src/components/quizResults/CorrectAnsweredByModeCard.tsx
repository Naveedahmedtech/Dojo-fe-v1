import React from 'react';
import LearnIcon from '../../styles/icons/learn.png';
import RandomIcon from '../../styles/icons/random.png';
import ExamIcon from '../../styles/icons/exam.png';

const CorrectAnsweredByModeCard = ({ modeTitle, totalAnswersByMode, totalAnswers, darkMode }: any) => {
  let iconPath: string;

  switch (modeTitle) {
    case 'Learn Mode':
      iconPath = LearnIcon;
      break;
    case 'Random Mode':
      iconPath = RandomIcon;
      break;
    case 'Exam Mode':
      iconPath = ExamIcon;
      break;
    default:
      iconPath = '';
      break;
  }


  let averageCorrectPercentage = totalAnswersByMode ? (totalAnswersByMode / totalAnswers) * 100 : 0;

  return (
    <div className={`shadow-md rounded-lg flex items-center justify-between p-4 mb-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <div className="flex gap-x-2 items-end">
        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
          {averageCorrectPercentage.toFixed(2)}%
        </p>
        <p className={`text-md font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {totalAnswersByMode}<span className="text-xs">/{totalAnswers}</span>
        </p>
      </div>
      <div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average grade using</p>
        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          {modeTitle.toUpperCase()}
        </p>
      </div>
    </div>
  );
};

export default CorrectAnsweredByModeCard;
