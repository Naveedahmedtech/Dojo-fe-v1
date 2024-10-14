import renderLatex from "../../../utils/renderLatex";

const QuestionDisplay = ({
    questions,
    currentQuestionIndex,
    userAnswers,
    handleUserAnswerChange,
    confirmedAnswer,
    handleConfirm,
    goToNextQuestion,
    handleFinish,
    selectedOptions,
    handleOptionChange,
    savingResults,
    darkMode,
    isConfriming
}: any) => {
    console.log("questions", { questions })
    return (
        <div
            key={questions[currentQuestionIndex]._id}
            className="w-full bg-transparent dark:bg-gray-800 dark:text-gray-300 p-4 rounded-lg shadow-lg mt-4"
        >
            <div className="border border-customColor rounded-lg overflow-hidden">
                {questions[currentQuestionIndex].q_image_url && (
                    <img
                        src={questions[currentQuestionIndex].q_image_url}
                        alt={`Question ${currentQuestionIndex + 1}`}
                        className="h-auto max-h-[300px] w-fill rounded ml-4 mt-4 md:order-last"
                    />
                )}
                <h2 className="text-md font-serif mb-4 p-4 rounded border-b border-customColor">
                    {renderLatex(questions[currentQuestionIndex].q_latex_content)}
                </h2>
                <div className="flex flex-col p-4">
                    {questions[currentQuestionIndex].q_answertype_tofill ? (
                        <>
                            <p className="p-2 resize-none text-base bg-transparent">
                                Your answer:
                            </p>
                            <textarea
                                className="answer-textarea text-black font-serif p-4"
                                value={userAnswers[currentQuestionIndex] || ""}
                                onChange={handleUserAnswerChange}
                            ></textarea>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {questions[currentQuestionIndex].q_answertype_options.map(
                                    (option: any) =>
                                        option.latex_content.trim() !== "" && (
                                            <div
                                                key={option._id}
                                                className={`flex items-start p-4 border border-gray-300 rounded-lg ${darkMode ? "bg-gray-700" : "bg-white"} shadow-sm`}
                                            >
                                                <input
                                                    type={
                                                        questions[currentQuestionIndex]
                                                            .q_answertype_options_has_multiple_good_answers
                                                            ? "checkbox"
                                                            : "radio"
                                                    }
                                                    id={option._id}
                                                    name={`options-${currentQuestionIndex}`}
                                                    value={option._id}
                                                    checked={
                                                        selectedOptions[currentQuestionIndex]?.includes(
                                                            option._id
                                                        ) || false
                                                    }
                                                    onChange={handleOptionChange}
                                                    className="mr-2 cursor-pointer"
                                                />
                                                <label
                                                    htmlFor={option._id}
                                                    className="flex-1 flex items-center text-base font-serif cursor-pointer"
                                                >
                                                    {renderLatex(option.latex_content)}
                                                    {option.image_url && (
                                                        <img
                                                            src={option.image_url}
                                                            alt="Option"
                                                            className="h-auto max-h-[300px] w-fill rounded ml-4 mt-4 md:order-last"
                                                        />
                                                    )}
                                                </label>
                                            </div>
                                        )
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="flex justify-center w-full px-6 mt-4 items-center">
                {
                    (savingResults || isConfriming) && <div className="flex justify-center mt-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-400"></div>
                    </div>
                }
                {!savingResults && currentQuestionIndex === questions.length - 1 && confirmedAnswer ? (
                    <button className="btn btn-orange" onClick={handleFinish}>
                        Submit Exam
                    </button>
                ) : (
                    !savingResults && !isConfriming && !confirmedAnswer && ( // Only show Confirm button if the question is not confirmed
                        <button
                            className="btn btn-orange"
                                onClick={() => handleConfirm(questions[currentQuestionIndex]?.subject_id)}
                        >
                            Confirm
                        </button>
                    )
                )}
                {
                    !savingResults &&
                    <button
                        onClick={goToNextQuestion}
                        disabled={currentQuestionIndex === questions.length - 1 || isConfriming}
                            className={`px-2 py-1 ml-4 rounded text-orange-400 ${currentQuestionIndex === questions.length - 1 || isConfriming
                            ? "cursor-not-allowed"
                            : "hover:border border-orange-400"
                            }`}
                        style={{
                            visibility:
                                currentQuestionIndex === questions.length - 1 ? "hidden" : "visible"
                        }}
                    >
                        <img
                            width="20"
                            height="20"
                            src="https://img.icons8.com/ios/20/FF9934/double-right.png"
                            alt="Next"
                        />
                    </button>
                }
            </div>
        </div>
    );
};

export default QuestionDisplay;
