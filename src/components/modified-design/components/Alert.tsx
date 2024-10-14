import React, { useEffect, useState } from 'react';

interface AlertProps {
    message: string;
    type?: 'error' | 'success' | 'warning' | 'info';
    onClose: () => void;
    duration?: number; // Optional duration before auto-dismiss
}

const Alert: React.FC<AlertProps> = ({ message, type = 'error', onClose, duration = 3000 }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);

        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 500); // Wait for animation to finish before closing
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    let bgColor, textColor, borderColor, iconColor;

    switch (type) {
        case 'success':
            bgColor = 'bg-green-50';
            textColor = 'text-green-800';
            borderColor = 'border-green-500';
            iconColor = 'text-green-500';
            break;
        case 'warning':
            bgColor = 'bg-yellow-50';
            textColor = 'text-yellow-800';
            borderColor = 'border-yellow-500';
            iconColor = 'text-yellow-500';
            break;
        case 'info':
            bgColor = 'bg-blue-50';
            textColor = 'text-blue-800';
            borderColor = 'border-blue-500';
            iconColor = 'text-blue-500';
            break;
        case 'error':
        default:
            bgColor = 'bg-red-50';
            textColor = 'text-red-800';
            borderColor = 'border-red-500';
            iconColor = 'text-red-500';
            break;
    }

    return (
        <div
            className={`fixed top-4 left-1/1  max-w-xs w-full z-50 ${bgColor} ${borderColor} border-l-4 p-4 rounded-md shadow-lg flex items-center transition-all duration-500 ease-in-out ${visible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'
                }`}
        >
            <div className="flex-grow">
                <span className={`block ${textColor} font-medium`}>{message}</span>
            </div>
            <button
                onClick={() => {
                    setVisible(false);
                    setTimeout(onClose, 500); // Wait for animation to finish before closing
                }}
                className={`ml-4 ${iconColor} hover:text-opacity-80 transition-opacity`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
    );
};

export default Alert;
