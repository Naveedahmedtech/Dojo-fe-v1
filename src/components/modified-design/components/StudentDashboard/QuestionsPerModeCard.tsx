import React from 'react';
import QuestionsDoneByModeCard from '../../../quizResults/QuestionsDoneByModeCard';
import CommonHead from './CommonHead';
import CommonSubHead from './CommonSubHead';

const QuestionsPerModeCard: React.FC<{
    modeKeys: string[];
    modeTitles: Record<string, string>;
    questionsByMode: Record<string, number>;
    totalQuestions: number;
    darkMode: any,
}> = ({ modeKeys, modeTitles, questionsByMode, totalQuestions, darkMode }) => (
    <div>
        <CommonHead text="Questions done" darkMode={darkMode} />
        <CommonSubHead text="Per Mode" />
        {modeKeys.map((key) => (
            <QuestionsDoneByModeCard
                key={key}
                modeTitle={modeTitles[key]}
                questionsByMode={questionsByMode[key] || 0}
                totalQuestions={totalQuestions}
                allModeQuestions={questionsByMode}
                darkMode={darkMode}
            />
        ))}
    </div>
);

export default QuestionsPerModeCard;
