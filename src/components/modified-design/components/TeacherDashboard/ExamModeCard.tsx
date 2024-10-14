import CommonHead from '../StudentDashboard/CommonHead';
import SeeDetailsButton from './SeeDetailsButton';

const ExamModeCard = ({ averageGrade, darkMode }: any) => (
    <div className={darkMode ? "bg-gray-800 text-white w-full  h-full p-4 rounded-lg" : "bg-white text-black p-4 h-full rounded-lg w-full"}>
        <CommonHead text="Exam Mode" darkMode={darkMode} />
        <div className='flex justify-between items-center'>
            <div className="flex flex-col items-center">
                <p className="font-semibold text-2xl">
                    {averageGrade}
                </p>
                <p className="text-sm font-thin -mt-3">correct</p>
            </div>
            <div>
                <SeeDetailsButton to="/exam-results" label="See Details" />
            </div>
        </div>
    </div>
);

export default ExamModeCard;
