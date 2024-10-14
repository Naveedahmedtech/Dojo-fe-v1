import { useState, useEffect } from 'react';
import clock from '../../../styles/clocknew.png';

const CustomCountdown = ({
    totalTime,
    handleFinish,
    // secondsLeft,
    // setSecondsLeft
}: any) => {
    const [timerFinished, setTimerFinished] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(totalTime * 60);

    useEffect(() => {
        // Exit early if the timer has finished to avoid setting up a new interval
        if (timerFinished) {
            return;
        }

        if (secondsLeft === 0) {
            handleFinish();
            setTimerFinished(true);
            return; // Prevent further execution of this useEffect
        }

        const timer = setInterval(() => {
            setSecondsLeft((prevSeconds) => {
                if (prevSeconds > 0) {
                    return prevSeconds - 1;
                } else {
                    clearInterval(timer);
                    return 0;
                }
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsLeft, handleFinish, timerFinished]); // Add timerFinished to the dependency array

    // Calculate hours, minutes, and seconds for display
    const hours = Math.floor(secondsLeft / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;

    return (
        <div className="flex items-center justify-center border-2 border-customColor rounded-lg p-2 bg-transparent">
            <img src={clock} alt="Clock Icon" className="w-6 h-6 mr-4" />
            <div className="text-lg font-bold text-customColor">
                {/* Display hours if there are any */}
                {hours > 0 && <span>{hours.toString().padStart(2, '0')}:</span>}
                <span>{minutes.toString().padStart(2, '0')}:</span>
                <span>{seconds.toString().padStart(2, '0')}</span>
            </div>
        </div>
    );
};

export default CustomCountdown;
