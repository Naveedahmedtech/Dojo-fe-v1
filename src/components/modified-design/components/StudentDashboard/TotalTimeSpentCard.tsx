import React from 'react';
import clock from '../../../../styles/clock.png'; // Adjust the path to your clock image
import CommonHead from './CommonHead';
import CommonSubHead from './CommonSubHead';

const TotalTimeSpentCard: React.FC<{ totalTimeSpent: string, darkMode: string }> = ({ totalTimeSpent, darkMode }) => (
    <div className="flex flex-col h-full">
        <CommonHead text="Total time spent" darkMode={darkMode} />
        <CommonSubHead text="On Platform" />
        <br />
        <p className={`text-4xl font-bold text-center ${darkMode ? 'text-white' : 'text-black'}`}>{totalTimeSpent}</p>
            <div className="flex flex-col gap-y-5 items-center justify-center w-full h-full">
                <img src={clock} alt="clock" className="w-auto h-auto max-w-[120px] max-h-[120px]" />
            </div>
    </div>
);

export default TotalTimeSpentCard;
