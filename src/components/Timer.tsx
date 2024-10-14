import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { formatTime } from '../utils/timer.util';

interface TimerProps {
  autoStart?: boolean;
  totalSeconds: any;
  setTotalSeconds: any;
  style?: React.CSSProperties;
  onComplete?: () => void; 
}

const Timer = forwardRef(({ autoStart = false, style, onComplete, totalSeconds, setTotalSeconds }: TimerProps, ref) => {
  const [isActive, setIsActive] = useState(autoStart);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive) {
      interval = window.setInterval(() => {
        setTotalSeconds((prevSeconds:any) => prevSeconds + 1);
      }, 1000);
    } else {
      if (onComplete) {
        onComplete(); 
      }
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [isActive, onComplete]);

  useEffect(() => {
    if (autoStart) {
      setIsActive(true);
    }
  }, [autoStart]);

  useImperativeHandle(ref, () => ({
    start: () => setIsActive(true),
    stop: () => setIsActive(false),
    reset: () => {
      setTotalSeconds(0);
      setIsActive(false);
    },
  }), []);

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
      <div>{formatTime(totalSeconds)}</div>
    </div>
  );
});

export default Timer;
