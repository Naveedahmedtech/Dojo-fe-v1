import React, {useEffect, useState} from 'react';
import renderLatex from '../utils/renderLatex';

interface Option {
  _id: string;
  latex_content: string;
  image_url?: string;
  is_correct: boolean;
}

interface Question {
  q_number: any;
  _id: string;
  q_latex_content: string;
  q_latex_explanation: string;
  q_latex_explanation_ChatGPT: string;
  q_answertype_options: Option[];
  q_answertype_options_has_multiple_good_answers: boolean;
  q_answertype_tofill: boolean;
  q_image_url?: string;
  answered_status: 'correct' | 'incorrect' | null;
  chapter_ref: string;
  question: string;
  correctAnswer: string;
  userInput: string;
  selectedOptions: string[];
  explanation: string;
}

interface ExamResultModalProps {
  questions: Question[];
  onClose: () => void;
  grade: () => number | null;
  time: string;
  userAnswers: string[];
  selectedOptions: string[][];
}

const ExamResultModal: React.FC<ExamResultModalProps> = ({ questions, onClose, grade, time, userAnswers, selectedOptions }) => {
  const renderExplanation = (question: Question) => {
    const { q_latex_explanation, q_latex_explanation_ChatGPT } = question;
    return (
      <>
        {renderLatex(q_latex_explanation || q_latex_explanation_ChatGPT)}
      </>
    );
  };

  if (grade() === null) {
    return null;
  }

  const [answeredStatus, setAnsweredStatus] = useState<Array<'correct' | 'incorrect' | null>>(Array(questions.length).fill(null));
  const [isAnswerMarked, setIsAnswerMarked] = useState<Array<boolean>>(Array(questions.length).fill(false));
  const [curGrade, setCurGrade] = useState<number>(0);
  useEffect(() => {
    setCurGrade(
        ((grade() || 0) / 100 * answeredStatus.length + answeredStatus.filter(answer => answer === 'correct').length) / answeredStatus.length * 100
    )
  }, [JSON.stringify(answeredStatus)]);

  const handleMarkAsCorrect = (index: number) => {
    if (questions[index].q_answertype_tofill && !isAnswerMarked[index]) {
      setAnsweredStatus((prevStatus) => {
        const newStatus = [...prevStatus];
        newStatus[index] = 'correct';
        return newStatus;
      });
      setIsAnswerMarked((prev) => {
        const newMarked = [...prev];
        newMarked[index] = true;
        return newMarked;
      });
    }
  };

  const handleMarkAsNotCorrect = (index: number) => {
    if (questions[index].q_answertype_tofill && !isAnswerMarked[index]) {
      setAnsweredStatus((prevStatus) => {
        const newStatus = [...prevStatus];
        newStatus[index] = 'incorrect';
        return newStatus;
      });
      setIsAnswerMarked((prev) => {
        const newMarked = [...prev];
        newMarked[index] = true;
        return newMarked;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-black bg-opacity-50 min-w-[360px] max-w-1/2">
      <div className="relative p-6 mx-auto my-12 bg-orange-100 border-4 border-customColor rounded-lg shadow-lg w-3/4">
        <div className="text-sm text-orange-800 mb-6 text-start rounded-lg border border-customColor px-2 py-4 bg-orange-50">
          <h2 className="text-lg text-orange-800 mb-1 text-start px-2 py-1">This exam session is over!</h2>
          <h2 className="text-lg text-orange-800 mb-1 text-start px-2 py-1">Your grade: {(curGrade).toFixed(0)}%</h2>
          <h2 className="text-lg text-orange-800 mb-1 text-start px-2 py-1">Time spent: {time}</h2>
          <div className="flex flex-row items-center">
            <h2 className="text-orange-800 mb-1 text-start px-2 py-1">Scroll down to check the corrections</h2>
            <img width="40" height="40" src="https://img.icons8.com/dotty/9A3412/double-down.png" alt="double-down" />
          </div>
        </div>
        <div className="overflow-y-auto max-h-96">
          <ul className="divide-y divide-customColor">
            {questions.map((question, index) => (
              <li key={index} className="py-4">
                {question.q_latex_content && (
                  <p className="text-base mt-2 font-serif bg-orange-200 px-4 py-2 rounded-lg border border-orange-400">
                    {question.q_number}. {renderLatex(question.q_latex_content)}
                    {question.q_image_url && (
                      <img
                        src={question.q_image_url}
                        className="w-28 h-auto rounded mr-2 mt-4 mb-2"
                        alt={`Question ${question.q_number} Image`}
                      />
                    )}
                  </p>
                )}
                <ul className="mt-2 space-y-2">
                  {question.q_answertype_options
                    .filter((option) => option.latex_content !== '')
                    .map((option) => (
                      <li key={option._id} className="flex items-center mb-2">
                        <div className="flex items-center">
                          {option.is_correct ? (
                            <>
                              <span className="text-base font-serif font-bold bg-teal-50 border border-teal-500 px-4 py-2 rounded-lg mr-2">
                                {renderLatex(option.latex_content)}
                                {option.image_url && (
                                  <img src={option.image_url} alt="Option Image" className="w-20 h-auto rounded" />
                                )}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-gray-300 font-serif line-through bg-rose-100 border border-rose-500 px-4 py-1 rounded-lg mr-2">
                                {renderLatex(option.latex_content)}
                                {option.image_url && (
                                  <img src={option.image_url} alt="Option Image" className="w-20 h-auto rounded opacity-50" />
                                )}
                              </span>
                            </>
                          )}
                          {selectedOptions[index] ? selectedOptions[index].includes(option._id) && (
                            <span className={`text-sm font-bold mr-2 ${option.is_correct ? 'text-teal-500' : 'text-rose-500'}`}>
                              {option.is_correct ? '✓ Your answer is correct' : '✗ Your answer is incorrect'}
                            </span>
                          ) : ""}
                        </div>
                      </li>
                    ))}
                </ul>
                <p className="text-base font-serif rounded-lg bg-white border border-orange-500 px-4 py-4 mt-2 mb-2">
                      {renderExplanation(question)}
                    </p>
                {question.q_answertype_tofill && (
                  <div className="mt-2">
                    <p className="text-base border border-gray-300 rounded px-4 py-2 mb-2">
                      <div className='text-sm'>Your answer: </div>
                      <div className='font-serif text-md'>{userAnswers[index]}</div>
                      <div className="text-sm text-gray-500 mt-2">
                        {answeredStatus[index] === 'correct' ? (
                          <span className="mt-2 font-bold text-md m-1 px-2 py-1 w-[100px] text-teal-500">✓ Your answer is correct</span>
                        ) : answeredStatus[index] === 'incorrect' ? (
                          <span className="mt-2 font-bold text-md m-1 px-2 py-1 w-[100px] text-rose-500">✗ Your answer is incorrect</span>
                        ) : (
                          <span className="mt-2 font-bold text-md py-1 w-[100px] text-gray-500"> not marked yet</span>
                        )}
                      </div>
                    </p> 
                    {!question.answered_status && (
                      <div className="flex justify-center">
                        <button
                          className={`mt-2 font-bold text-md m-1 px-2 py-1 w-[100px] text-teal-500 hover:border hover:border-teal-500 hover:rounded-lg ${answeredStatus[index] === 'correct' ? 'bg-teal-200' : ''}`}
                          onClick={() => handleMarkAsCorrect(index)}
                          disabled={isAnswerMarked[index]}
                        >
                          Correct
                        </button>
                        <div className="font-bold text-gray-400 px-4 p-2 mt-2">?</div>
                        <button
                          className={`mt-2 font-bold text-md m-1 px-2 py-2 w-[100px] text-rose-500 hover:border hover:border-rose-500 hover:rounded-lg ${answeredStatus[index] === 'incorrect' ? 'bg-rose-200' : ''}`}
                          onClick={() => handleMarkAsNotCorrect(index)}
                          disabled={isAnswerMarked[index]}
                        >
                          Incorrect
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="text-orange-800 hover:text-orange-600 font-bold py-2 px-4 border border-orange-800 hover:border-orange-600 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResultModal;