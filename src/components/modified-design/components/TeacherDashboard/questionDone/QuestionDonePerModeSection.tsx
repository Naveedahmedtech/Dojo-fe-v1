import QuestionDonePerModeCard from '../../../../teacherDashboard/QuestionDonePerModeCard';
import CommonHead from '../../StudentDashboard/CommonHead';
import CommonSubHead from '../../StudentDashboard/CommonSubHead';

const QuestionDonePerModeSection = ({ percentageByMode, darkMode }: any) => (
    <div className={darkMode ? "bg-gray-800 text-white  h-full p-4 rounded-lg" : "bg-white text-black p-4 h-full rounded-lg"}>
        <CommonHead text='Average Grade' darkMode={darkMode} />
        <CommonSubHead text='Per Mode' />
        <QuestionDonePerModeCard
            modeTitle="Learn Mode"
            averageGrade={percentageByMode?.learn || '0'}
            darkMode={darkMode}
        />
        <QuestionDonePerModeCard
            modeTitle="Random Mode"
            averageGrade={percentageByMode?.random || '0'}
            darkMode={darkMode}

        />
        <QuestionDonePerModeCard
            modeTitle="Exam Mode"
            averageGrade={percentageByMode?.exam || '0'}
            darkMode={darkMode}

        />
    </div>
);

export default QuestionDonePerModeSection;
