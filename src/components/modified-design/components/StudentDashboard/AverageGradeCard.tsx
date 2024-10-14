import GaugeChart from '../../../quizResults/CorrectAnswersHalfPie';
import CommonHead from './CommonHead';

const AverageGradeCard = ({ correctAnswersCount, questionsAnswered, darkMode }: any) => (
    <div>
        <CommonHead text="Average Grade" darkMode={darkMode} />
        <div className="flex flex-row items-center mt-2 justify-center text-center">
            <div className={`text-4xl font-bold mr-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                {correctAnswersCount}
            </div>
            /
            <div className={`text-2xl ml-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                {questionsAnswered}
            </div>
        </div>
        <div className={`text font-medium mb-5 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            correctly answered
        </div>
        <div className="flex-grow flex items-center w-full h-full mt-10">
            <div className="w-full h-full">
                <GaugeChart value={(correctAnswersCount / questionsAnswered) * 100} />
            </div>
        </div>
    </div>
);

export default AverageGradeCard;
