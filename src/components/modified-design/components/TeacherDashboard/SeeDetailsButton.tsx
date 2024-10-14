import React from 'react';
import { Link } from 'react-router-dom';

interface SeeDetailsButtonProps {
    to: string;
    label: string;
}

const SeeDetailsButton: React.FC<SeeDetailsButtonProps> = ({ to, label }) => {
    return (
        <div>
            <Link to={to}>
                <button
                    className="text-sm px-4 py-2 text-black rounded-lg bg-[#a1c6e07b] hover:bg-violet-200 flex items-center justify-center mx-auto"
                >
                    {label}
                    <img
                        width="10"
                        height="10"
                        className="ml-2"
                        src="https://img.icons8.com/ios-filled/10/forward--v1.png"
                        alt="Arrow Icon"
                    />
                </button>
            </Link>
        </div>
    );
};

export default SeeDetailsButton;
