import QuestionsDonePerSubject from '../../../teacherDashboard/QuestionsDonePerSubject';
import CommonHead from '../StudentDashboard/CommonHead';

const QuestionsDoneSection = ({ selectedCourseId, selectedClassId, darkMode }:any) => (
    <div className={darkMode ? "bg-gray-800 text-white  h-full p-4 rounded-lg" : "bg-white text-black p-4 h-full rounded-lg"}>
        <CommonHead text="Question Done" darkMode={darkMode} />
        <QuestionsDonePerSubject selectedCourseId={selectedCourseId} selectedClassId={selectedClassId} darkMode={darkMode} />
    </div>
);

export default QuestionsDoneSection;
