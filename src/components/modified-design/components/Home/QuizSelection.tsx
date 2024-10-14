import React from 'react';
import { Link } from 'react-router-dom';

const QuizSelection: React.FC<{
    isButtonDisabled: boolean;
    selectedChapterIds: string[];
    selectedSubjectIds: string[];
    handleQuizTypeSelection: (type: string) => void;
    activeTooltip: string | null;
    setActiveTooltip: (tooltip: string | null) => void;
    darkMode: boolean; // Specify darkMode as a boolean
}> = ({
    isButtonDisabled,
    selectedChapterIds,
    selectedSubjectIds,
    handleQuizTypeSelection,
    activeTooltip,
    setActiveTooltip,
    darkMode,
}) => {
        return (
            <div className="text-center">
                <h2 className={`font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Choose your mode</h2>
                <div className="flex flex-wrap justify-center items-center space-x-4 space-y-1">
                    {['learn', 'random', 'exam'].map((type) => (
                        <div key={type} className="relative">
                            <Link
                                to={isButtonDisabled ? '#' : `/quiz/${type}?chapters=${selectedChapterIds.join(',')}&subjects=${selectedSubjectIds.join(',')}`}
                            >
                                <button
                                    onClick={() => !isButtonDisabled && handleQuizTypeSelection(type)}
                                    className={`w-32 h-10 rounded-md text-lg font-medium transition-all duration-300 ease-in-out ${isButtonDisabled
                                        ? 'bg-[#ff9a3476] text-gray-400 cursor-not-allowed'
                                        : darkMode
                                            ? 'bg-[#FF9934] text-white hover:bg-[#c27e3b] hover:shadow-md'
                                            : 'bg-orange-300 text-black hover:bg-orange-400 hover:shadow-md'
                                        }`}
                                    onMouseEnter={() => setActiveTooltip(type)}
                                    onMouseLeave={() => setActiveTooltip(null)}
                                    disabled={isButtonDisabled}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                                {activeTooltip === type && (
                                    <div
                                        className={`absolute w-64 max-h-28 overflow-y-auto text-xs top-full left-0 p-2 rounded shadow-lg z-50 mt-2 ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}
                                    >
                                        <span>
                                            {type === 'learn' &&
                                                'The simplest mode. Questions run in a specific order, without time. We advise you to start with this mode for initial practice on the topic questions.'}
                                            {type === 'random' &&
                                                'Questions are running in an unpredictable order, without time limit. We recommend you to use this mode for a second review following the learn mode.'}
                                            {type === 'exam' &&
                                                'The most complex. You can select the number of questions per chapter and the time allotted per subject or for the entire exam. Questions will be chosen randomly, and only at the end of the exam will you get the corrections with your grade.'}
                                        </span>
                                    </div>
                                )}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

export default QuizSelection;
