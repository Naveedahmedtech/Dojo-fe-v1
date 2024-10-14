import React, { useState, useEffect } from 'react';

interface CountdownProps {
  durationInSeconds: number;
  autoStart: boolean;
  onFinish: () => void;
  setTime: React.Dispatch<React.SetStateAction<number>>; 
  onUpdate?: (time: number) => void; 
  style?: React.CSSProperties;
}

const Countdown: React.FC<CountdownProps> = ({
  durationInSeconds,
  autoStart,
  onFinish,
  setTime,
  style,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(durationInSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  const [deadline, setDeadline] = useState<number>(0);


  useEffect(() => {
    setTimeLeft(durationInSeconds);
    setIsRunning(autoStart);
    if (isRunning) {
      setDeadline((new Date()).getTime() + durationInSeconds * 1000);
    }
  }, [durationInSeconds, autoStart]);


  useEffect(() => {
    if (isRunning && deadline) {
      const interval = setInterval(() => {
        // if (onUpdate) {
        //   onUpdate(timeLeft);
        // }
        if (deadline <= (new Date()).getTime()) {
          // console.log('Thats all')
          onFinish();
        }
        setTimeLeft(
            Math.floor((deadline - (new Date()).getTime()) / 1000)
        )
        setTime(
            Math.floor((deadline - (new Date()).getTime()) / 1000)
        )
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [deadline]);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const timerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#FF9934',
    ...style,
  };

  return (
    <div style={timerStyle}>
      <h1>{formatTime(timeLeft)}</h1>
    </div>
  );
};

export default Countdown;
