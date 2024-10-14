import React from 'react';
import CommonHead from './CommonHead';
import CommonSubHead from './CommonSubHead';

// interface TimeOnPlatformPerModeCardProps {
//     timeSpentByMode: {
//         learn: number;
//         random: number;
//         exam: number;
//     };
//     darkMode: boolean;
// }

const TimeOnPlatformPerModeCard: React.FC<any> = ({ timeSpentByMode, darkMode }) => {
    console.log("timeSpentByMode", { timeSpentByMode })
    const modes = [
        { title: 'Learn Mode', time: timeSpentByMode.learn },
        { title: 'Random Mode', time: timeSpentByMode.random },
        { title: 'Exam Mode', time: timeSpentByMode.exam },
    ];

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="">
            <CommonHead text="Total Time Spent" darkMode={darkMode} />
            <CommonSubHead text="Per Mode" />
            {modes.map((mode, index) => (
                <div
                    key={index}
                    className={`rounded-lg flex items-center justify-between p-4 mb-4 shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
                        }`}
                >
                    <div className="flex flex-col items-start">
                        <p className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>{formatTime(mode.time)}</p>
                    </div>
                    <div className="">
                        <p className={`text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Time in</p>
                        <p className={`text-lg text-center font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{mode.title.toUpperCase()}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TimeOnPlatformPerModeCard;
