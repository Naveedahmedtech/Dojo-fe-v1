import React from 'react';
import LearnIcon from '../../styles/icons/learn.png';
import RandomIcon from '../../styles/icons/random.png';
import ExamIcon from '../../styles/icons/exam.png';

interface QuestionsDoneByModeCardProps {
  modeTitle: string;
  questionsByMode: number;
  totalQuestions: number;
  allModeQuestions: Record<string, number>;
  darkMode: boolean; // Changed to boolean
}

const QuestionsDoneByModeCard: React.FC<QuestionsDoneByModeCardProps> = ({
  modeTitle,
  questionsByMode,
  totalQuestions,
  allModeQuestions,
  darkMode
  
}) => {
  let iconPath;
  switch (modeTitle) {
    case 'Learn Mode':
      iconPath = `${LearnIcon}`;
      break;
    case 'Random Mode':
      iconPath = `${RandomIcon}`;
      break;
    case 'Exam Mode':
      iconPath = `${ExamIcon}`;
      break;
    default:
      iconPath = '';
      break;
  }

  return (
    <div className={`shadow-md rounded-lg flex items-center justify-between p-4 mb-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <div className="flex flex-col items-start">
        <p className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
          {questionsByMode}<span className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}></span>
        </p>
      </div>
      <div className="">
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Questions done with</p>
        <p className={`text-lg text-center font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{modeTitle.toUpperCase()}</p>
      </div>
    </div>
  );
};

export default QuestionsDoneByModeCard;
