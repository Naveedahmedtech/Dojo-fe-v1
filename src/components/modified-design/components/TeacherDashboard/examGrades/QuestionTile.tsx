
// Define a component to render individual question results as tiles
const QuestionTile = ({ question, index, onClick }: any) => {
    const tileStyle = question.is_correct
        ? 'bg-green-500'
        : question.is_not_correct
            ? 'bg-red-500'
            : 'bg-gray-300';

    return (
        <div
            className={`w-8 h-8 flex items-center justify-center font-bold text-white rounded-md cursor-pointer ${tileStyle}`}
            onClick={() => onClick(question.question_id)}
        >
            {index + 1}
        </div>
    );
};

export default QuestionTile;
