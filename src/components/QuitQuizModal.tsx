import React from 'react';

interface QuitQuizModalProps {
  onClose: () => void;
  onQuit: () => void;
  // savingResults: boolean;
}

const QuitQuizModal: React.FC<any> = ({ onClose, onQuit }) => {

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`p-6 rounded-lg relative text-black bg-orange-100 w-96`}>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <p className='mt-4 text-center'>'Are you sure you want to leave this page?</p>
        <div className="flex justify-center mt-4">
          <button onClick={onQuit} className="btn btn-orange mr-4 ml-4">
            yes
          </button>
        </div>
        {/* {savingResults ? (
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="flex justify-center mt-4">
            <button onClick={onQuit} className="btn btn-orange mr-4 ml-4">
              Quit
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default QuitQuizModal;
