
// Define a component to render individual question results as tiles
const QuestionTile = ({ question, index }: any) => {
    const tileStyle = question.is_correct
        ? 'bg-green-500'
        : question.is_not_correct
            ? 'bg-red-500'
            : 'bg-gray-300';

    return (
        <div
            className={`w-8 h-8 flex items-center justify-center font-bold text-white rounded-md ${tileStyle}`}
        >
            {index + 1}
        </div>
    );
};

// Define the main SubjectsGrid component
const SubjectsGrid = ({ subjects }: any) => (
    <div className="p-4">
        {subjects.map((subject: any, subjectIndex: number) => (
            <div key={subjectIndex} className="mb-8">
                {/* Subject Header */}
                <h2 className="text-2xl font-bold mb-4 text-orange-500">{subject.name}</h2>

                {/* Questions */}
                <div className="flex flex-wrap gap-2">
                    {subject.chapters.reduce((acc: any, chapter: any) => {
                        chapter.results.forEach((question: any, questionIndex: number) => {
                            acc.push(
                                <QuestionTile
                                    key={question.question_id}
                                    question={question}
                                    index={acc.length}
                                />
                            );
                        });
                        return acc;
                    }, [])}
                </div>
            </div>
        ))}
    </div>
);

export default SubjectsGrid;
