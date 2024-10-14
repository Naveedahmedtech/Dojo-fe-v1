import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center">
            <svg
                width="30px"
                height="30px"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
            >
                <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="#fff"
                    stroke-width="4"
                    stroke-dasharray="164.93361431346415 56.97787143782138"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        repeatCount="indefinite"
                        dur="1s"
                        keyTimes="0;1"
                        values="0 50 50;360 50 50"
                    />
                </circle>
            </svg>
        </div>
    );
};

export default LoadingSpinner;