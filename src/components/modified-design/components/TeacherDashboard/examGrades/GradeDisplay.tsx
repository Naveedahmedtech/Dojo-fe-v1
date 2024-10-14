interface Question {
    question_id: string;
    is_correct: boolean;
    is_not_correct: boolean;
    not_answered_yet: boolean;
    to_fill_user_answer: string;
}

interface Chapter {
    id: string;
    name: string;
    results: Question[];
}

interface Subject {
    id: string;
    name: string;
    chapters: Chapter[];
}

const GradeDisplay = ({ results, darkMode }: { results: Subject[], darkMode: any }) => {
    // Ensure results is defined and is an array
    if (!results || !Array.isArray(results)) {
        return <div className="text-red-500">Invalid results data</div>;
    }

    // Calculate total questions and correct answers across all subjects and chapters
    const totalQuestions = results.reduce((subjectAcc, subject) => {
        return subjectAcc + subject.chapters.reduce((chapterAcc, chapter) => chapterAcc + chapter.results.length, 0);
    }, 0);

    const correctAnswers = results.reduce((subjectAcc, subject) => {
        return subjectAcc + subject.chapters.reduce((chapterAcc, chapter) => {
            return chapterAcc + chapter.results.filter((question) => question.is_correct).length;
        }, 0);
    }, 0);

    // Calculate percentage
    const percentage = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(0) : '0';

    return (
        <div className="flex items-center justify-center space-x-4 p-4">
            <div className="text-xl font-semibold ">Grade:</div>

            <div>
                <div className="text-5xl font-bold ">
                    {correctAnswers}/{totalQuestions}
                </div>
                <div className="text-lg font-semibold">{percentage}%</div>
            </div>
        </div>
    );
};

export default GradeDisplay;
