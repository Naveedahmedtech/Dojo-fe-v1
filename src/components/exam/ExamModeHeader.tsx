const ExamModeHeader = ({ darkMode }: any) => {
    // Conditional styles based on darkMode
    const textClass = darkMode ? 'text-white' : 'text-gray-800';
    const subTextClass = darkMode ? 'text-gray-400' : 'text-gray-500';
    const hrClass = darkMode ? 'border-gray-600' : '';
    // const containerClass = darkMode ? 'bg-gray-900' : 'bg-white';

    return (
        <>
            <div className={`text-center  p-4`}>
                <h1 className={`text-2xl font-bold ${textClass}`}>Exam Mode</h1>
                <p className={`${subTextClass}`}>Rules</p>
                <hr className={hrClass} />
            </div>
            <div className={`p-2 rounded mb-4 w-full `}>
                <p className={`text-xl font-medium ${textClass}`}>
                    Questions are presented by subject, across mixed subjects with a time limit.
                </p>
                <p className={`text-xl font-medium ${textClass}`}>
                    You can jump from one question to another.
                </p>
                <br />
                <p className={`text-xl font-medium ${textClass}`}>
                    - Choose the number of questions for each subject.
                </p>
                <p className={`text-xl font-medium ${textClass}`}>
                    - Choose the total time for the entire exam.
                </p>
            </div>
        </>
    );
};

export default ExamModeHeader;
