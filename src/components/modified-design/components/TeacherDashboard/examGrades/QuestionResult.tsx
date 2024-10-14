import axios from 'axios';
import { useEffect, useState } from 'react';
import { SERVER_URL } from '../../../../../../api';

const QuestionResult = ({ result, fetchResults, darkMode, updateCorrectCount, userId }: any) => {
    const [isSaving, setIsSaving] = useState(false);
    const [savingResults, setSavingResults] = useState<Record<string, boolean>>({});
    let [initialCounts, setInitialCounts] = useState(0);
    const {
        question_id,
        result_id,
        is_correct,
        is_not_correct,
        not_answered_yet,
        to_fill_user_answer,
        q_answertype_options,
        q_answertype_options_has_multiple_good_answers,
        q_latex_content,
        q_latex_explanation,
        q_latex_explanation_ChatGPT,
        q_answertype_tofill,
        chapterId
    } = result;


    const fetchCorrectAnswerCount = async () => {
        try {
            const response = await axios.get(`${SERVER_URL}/quiz/increment-questions/correct/get/${userId}/${chapterId}/exam`)
            console.log("responseC", response)
            setInitialCounts(response?.data?.result?.counts);
        } catch (error) {
            console.error("ERROR CORRECTAnswerCount", error)
        }
    }
    useEffect(() => {
        if (userId) {
            fetchCorrectAnswerCount()
        }
    }, [userId, chapterId])
    const handleFillMark = async (result_id: string, data: { is_exam_correct_answers: boolean; is_exam_incorrect_answers: boolean }) => {
        if (savingResults[result_id]) return; // Prevent multiple requests for the same question

        setSavingResults((prev) => ({ ...prev, [result_id]: true }));
        setIsSaving(true);

        try {
            const response = await axios.put(`${SERVER_URL}/quiz/${result_id}/update-exam-results`, data);
            if (data.is_exam_correct_answers) {
                setInitialCounts((prevCount) => prevCount + 1);
                console.log("initialCounts", initialCounts, initialCounts + 1)
                await updateCorrectCount(userId, chapterId, initialCounts + 1);
            } else {
                // setInitialCounts((prevCount) => prevCount - 1);
                // await updateCorrectCount(userId, chapterId, initialCounts);
            }
            fetchResults();
        } catch (error) {
            console.error('Error marking as correct:', error);
        } finally {
            setSavingResults((prev) => ({ ...prev, [result_id]: false }));
            setIsSaving(false);
        }
    };


    // Determine status text and style
    let statusText = 'Not Answered';
    let statusClass = 'text-gray-500';

    if (is_correct) {
        statusText = 'Correct';
        statusClass = 'text-green-500';
    } else if (is_not_correct) {
        statusText = 'Incorrect';
        statusClass = 'text-red-500';
    }

    // Conditional styles based on darkMode
    const containerClass = darkMode ? 'bg-gray-800 text-white' : 'bg-[#f1f7f9] text-gray-800';
    const buttonClass = 'border-gray-400 text-gray-300';
    const correctButtonClass = 'text-green-500';
    const incorrectButtonClass = 'text-red-500';
    const optionStyleBase = darkMode ? 'text-gray-300' : 'text-gray-500';

    return (
        <div className={`p-4 border rounded-lg shadow-md mb-4 ${containerClass}`}>
            <h4 className="text-lg font-semibold mb-4">{`Question: ${q_latex_content}`}</h4>

            {/* Render options or input field based on question type */}
            {q_answertype_tofill ? (
                <>
                    <textarea
                        className={`w-full p-2 border rounded mt-2 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                        placeholder="Your answer"
                        value={to_fill_user_answer || ''}  // Display the user's answer if available
                        disabled
                    />
                    {/* Correct/Incorrect Options */}
                    <div className="flex justify-center mt-4">
                        {
                            isSaving ? "Saving..." : statusText === "Not Answered" ? <>
                                <button
                                    className={`mt-2 font-bold m-1 px-4 py-2 min-w-[180px] border ${buttonClass} rounded-lg ${correctButtonClass}`}
                                    disabled={isSaving}
                                    onClick={() => handleFillMark(result_id, { is_exam_correct_answers: true, is_exam_incorrect_answers: false })}
                                >
                                    Correct
                                </button>
                                <div className='font-bold text-gray-400 px-4 py-2 mt-2'>?</div>
                                <button
                                    className={`mt-2 font-bold m-1 px-4 py-2 min-w-[180px] border ${buttonClass} rounded-lg ${incorrectButtonClass}`}
                                    disabled={isSaving}
                                    onClick={() => handleFillMark(result_id, { is_exam_correct_answers: false, is_exam_incorrect_answers: true })}
                                >
                                    Incorrect
                                </button>
                            </> : <></>
                        }
                    </div>
                </>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {q_answertype_options.map((option: any) => {
                        // Determine the style for each option
                        let optionStyle = optionStyleBase;
                        if (option.is_correct) {
                            optionStyle += " text-green-500 font-bold"; // Correct answer highlighted
                        } else {
                            optionStyle += " line-through"; // Incorrect answer styled
                        }

                        return (
                            <div key={option._id} className={`flex gap-2 items-center p-4 border rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm`}>
                                <input
                                    type={q_answertype_options_has_multiple_good_answers ? 'checkbox' : 'radio'}
                                    name={`options-${question_id}`}
                                    id={`option-${option._id}`}
                                    disabled
                                />
                                <label htmlFor={`option-${option._id}`} className={optionStyle}>{option.latex_content}</label>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Display status text */}
            <p className={`mt-4 text-center font-medium text-lg ${statusClass}`}>{statusText !== "Not Answered" && statusText}</p>

            {/* Explanations */}
            {q_latex_explanation && (
                <div className="mt-4">
                    <h5 className="font-semibold">University Explanation:</h5>
                    <p className="">{q_latex_explanation}</p>
                </div>
            )}

            {q_latex_explanation_ChatGPT && (
                <div className="mt-4">
                    <button className="underline">Show AI-generated explanation</button>
                </div>
            )}
        </div>
    );
};

export default QuestionResult;
