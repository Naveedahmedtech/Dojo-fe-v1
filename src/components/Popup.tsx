import React, { useState, useEffect } from 'react';

interface PopupProps {
  type: '' | 'green' | 'red'; 
  message: string;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ type, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const backgroundColor = type === 'red' ? '#fdecea' : '#e6ffed';
  const borderColor = type === 'red' ? '#f5c6cb' : '#c3e6cb';
  const textColor = type === 'red' ? '#721c24' : '#155724';

  return (
    isVisible && (
      <div className="fixed bottom-5 left-5 flex justify-start items-center z-100">
        <div
          className="relative px-2 pb-6 rounded shadow-md w-[300px] text-center"
          style={{
            backgroundColor,
            border: `1px solid ${borderColor}`,
            color: textColor,
          }}
        >
          <div className="flex justify-end">
            <button
              className="scale-button"
              onClick={handleClose}
              style={{ color: textColor }}
            >
              &times;
            </button>
          </div>
          <span className="block sm:inline mt-1">{message}</span>
        </div>
      </div>
    )
  );
};

export default Popup;
