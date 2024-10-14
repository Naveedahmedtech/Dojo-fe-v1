import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, message, onConfirm, onClose, onCancel }) => {
  const handleConfirm = async () => {
    await onConfirm(); 
    onClose(); 
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white text-black rounded-lg p-8">
            <div className="flex justify-end">
              <button onClick={onCancel}>
              <svg
                className="w-4 h-4 mb-4 text-gray-500 hover:text-gray-700 cursor-pointer rounded-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                />
                </svg>
              </button>
            </div>
            <p className="text-lg text-center mb-4">{message}</p>
            <p className='text-base text-center text-xs mb-5'>(to see changes after deleting - toggle the tab)</p>
            <div className="flex justify-center">
              <button onClick={onCancel} className="bg-transparent border rounded-lg border-customColor text-customColor px-3 py-1 rounded-lg mr-4 hover:bg-customColor hover:text-white">
               Cancel
              </button>
              <button onClick={handleConfirm} className="bg-transparent border rounded-lg border-rose-500 text-rose-500 px-3 py-1 rounded-lg mr-4 hover:bg-rose-500 hover:text-white">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmationModal;