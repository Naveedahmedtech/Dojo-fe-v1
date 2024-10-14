import React from 'react';
import CorrectAnsweredByModeCard from '../../../quizResults/CorrectAnsweredByModeCard';
import CommonHead from './CommonHead';
import CommonSubHead from './CommonSubHead';

const AverageGradePerModeCard = ({ modeTitles, questionsByMode, darkMode }:any) => (
    <div className="">
        <CommonHead text="Average Grade" darkMode={darkMode} />
        <CommonSubHead text="Per Mode" />

        {Object.keys(questionsByMode).map((key) => (
            <CorrectAnsweredByModeCard
                key={key}
                modeTitle={modeTitles[key]}
                // totalAnswersByMode={questionsByMode[key].correctAnswersByMode + questionsByMode[key].incorrectAnswersByMode || 0}
                totalAnswersByMode={questionsByMode[key].correctAnswersByMode|| 0}
                totalAnswers={questionsByMode[key].totalAnswers}
                darkMode={darkMode}
            />
        ))}
    </div>
);

export default AverageGradePerModeCard;
