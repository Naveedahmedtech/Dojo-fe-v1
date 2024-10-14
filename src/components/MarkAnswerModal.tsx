import React from 'react';

interface Props {
  onClose: (correct: boolean) => void;
  onMarkCorrect: () => void;
  onMarkNotCorrect: () => void;
}

const MarkAnswerModal: React.FC<Props> = ({ onClose, onMarkCorrect, onMarkNotCorrect }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
        <h2 className="text-lg font-bold mb-4">Mark your answer as:</h2>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              onMarkCorrect();
              onClose(true);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Correct
          </button>
          <button
            onClick={() => {
              onMarkNotCorrect();
              onClose(false);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Not Correct
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkAnswerModal;