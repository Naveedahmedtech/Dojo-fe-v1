import React from 'react';
import { Link } from 'react-router-dom';

interface QuizSelectModalProps {
  isOpen: boolean;
  chapterId: string | null;
  chapterName: string;
  onClose: () => void;
}

const QuizSelectModal: React.FC<QuizSelectModalProps> = ({ isOpen, chapterId, chapterName, onClose }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <>
      {isOpen && chapterId && ( 
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md text-center relative">
            <button onClick={handleClose} className="absolute top-2 right-2 px-2 py-1 text-black rounded-md cursor-pointer">x</button>
            <p className="text-xl mb-4 font-bold mt-6">{chapterName}</p> 
            <h2 className="mb-2">Choose quiz mode:</h2>
            <div className="flex justify-center">
              <Link to={`/quizlearn/${chapterId}`} className="px-4 py-2 btn-orange text-white rounded-md m-6">Learn</Link>
              <Link to={`/quizrandom/${chapterId}`} className="px-4 py-2 btn-orange text-white rounded-md m-6">Random</Link>
              <Link to={`/quizexam/${chapterId}`} className="px-4 py-2 btn-orange text-white rounded-md m-6">Exam</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuizSelectModal;
