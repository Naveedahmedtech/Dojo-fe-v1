import React from 'react';
import QuestionsDonePieChart from '../../../quizResults/QuestionsDonePieChart';
import CommonHead from './CommonHead';

const QuestionsDoneCard: React.FC<{
    totalQuestionDone: number;
    questionsAnswered: number;
    totalQuestions: number;
    correctAnswersCount: number;
    incorrectAnswersCount: number;
    unansweredQuestionsCount: number;
    percentageCorrect: number;
    percentageIncorrect: number;
    percentageUnanswered: number;
    darkMode: any;
}> = ({
    totalQuestionDone,
    questionsAnswered,
    totalQuestions,
    correctAnswersCount,
    incorrectAnswersCount,
    unansweredQuestionsCount,
    percentageCorrect,
    percentageIncorrect,
    percentageUnanswered,
    darkMode
}) => (
        <div className={darkMode ? "bg-gray-800 text-white  " : "bg-white text-black p-4 "}>
            <CommonHead text="Questions done" darkMode={darkMode} />
            <div className="flex items-center justify-between">
                {/* Pie Chart */}
                <div className="flex-shrink-0">
                    <QuestionsDonePieChart
                        correct={correctAnswersCount}
                        incorrect={incorrectAnswersCount}
                    notAnswered={unansweredQuestionsCount}
                    darkMode={darkMode}
                    />
                </div>

                {/* Total and Completed Questions */}
                <div className="flex flex-col items-start text-left ml-6">
                    <div className="flex flex-col mb-4">
                        <div className="text-3xl font-bold text-center">{totalQuestionDone}</div>
                        <div className="text-sm text-gray-500">Total questions done</div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full text-center">
                        <div className="text-2xl font-bold text-center">{questionsAnswered}/{totalQuestions}</div>
                        <div className="text-sm text-gray-500 text-center">answered</div>
                    </div>
                </div>
            </div>

            {/* Progress Bars */}
            <div className="mt-6 space-y-4">
                {[
                    { label: 'Correct', count: correctAnswersCount, percentage: percentageCorrect, color: 'bg-green-500' },
                    { label: 'Incorrect', count: incorrectAnswersCount, percentage: percentageIncorrect, color: 'bg-red-500' },
                    { label: 'Not answered yet', count: unansweredQuestionsCount, percentage: percentageUnanswered, color: 'bg-gray-400' },
                ].map(({ label, count, percentage, color }) => (
                    <div key={label}>
                        <div className="flex justify-between text-sm" style={{ color: darkMode ? 'white' : '#4B5563' }}>
                            <span>{label.toUpperCase()}</span>
                            <span>{count}/{totalQuestions}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-1">
                            <div className={`${color} h-full rounded-full`} style={{ width: `${percentage}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

export default QuestionsDoneCard;
