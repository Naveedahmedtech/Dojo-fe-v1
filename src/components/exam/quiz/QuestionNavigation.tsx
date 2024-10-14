const QuestionNavigation = ({
    chapters,
    questions,
    currentQuestionIndex,
    answeredStatus,
    setCurrentQuestionIndex,
    setConfirmedAnswer
}: any) => {

    // Group questions by subject
    const subjects = chapters.reduce((acc: any, chapter: any) => {
        if (!acc[chapter.subject_name]) {
            acc[chapter.subject_name] = [];
        }
        acc[chapter.subject_name] = acc[chapter.subject_name].concat(chapter.questions);
        return acc;
    }, {});

    return (
        <div className="p-4 space-y-4 max-h-[150px] overflow-auto">
            {Object.entries(subjects).map(([subjectName, subjectQuestions]: [string, any]) => (
                <div key={subjectName} className="flex items-start gap-4">
                    {/* Subject Name */}
                    <div className="flex-shrink-0">
                        <h2 className="text-lg font-bold text-customColor whitespace-nowrap">{subjectName}:</h2>
                    </div>

                    {/* Question Numbers */}
                    <div className="flex flex-wrap gap-2">
                        {subjectQuestions
                            // .sort((a: any, b: any) => a.q_number - b.q_number)
                            .map((question: any, index: any) => {
                                const questionIndex = questions.findIndex((q: any) => q._id === question._id);
                                const isActive = currentQuestionIndex === questionIndex;
                                const hasBeenAnswered = answeredStatus[questionIndex] !== undefined && answeredStatus[questionIndex] !== '';

                                let statusClass = 'border border-customColor text-customColor';

                                if (isActive) {
                                    statusClass = 'bg-customColor text-white';
                                } else if (hasBeenAnswered) {
                                    statusClass = 'bg-[#FFCC9A] text-black'; // Change this to your desired color for answered questions
                                }

                                return (
                                    <span
                                        key={question._id}
                                        className={`flex items-center justify-center w-8 h-8 rounded-lg ${statusClass}`}
                                        style={{
                                            minWidth: '30px',
                                            textAlign: 'center',
                                            cursor: 'pointer' // Add cursor style
                                        }}
                                        onClick={() => {
                                            setConfirmedAnswer(false)
                                            setCurrentQuestionIndex(questionIndex)
                                        }} // Set current question index
                                    >
                                        {index + 1}
                                    </span>
                                );
                            })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuestionNavigation;
