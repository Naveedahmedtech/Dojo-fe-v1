import React from 'react';

const AppLoader: React.FC = () => {
    return (
        <div className="app-loader flex items-center justify-center h-screen">
            <div className="loader">
                <svg
                    className="spinner"
                    width="50px"
                    height="50px"
                    viewBox="0 0 66 66"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle
                        className="path"
                        fill="none"
                        strokeWidth="6"
                        strokeLinecap="round"
                        cx="33"
                        cy="33"
                        r="30"
                    ></circle>
                </svg>
            </div>
        </div>
    );
};

export default AppLoader;
