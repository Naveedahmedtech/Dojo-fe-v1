import React, { createContext, useState, ReactNode, useContext } from 'react';

interface ExamContextType {
  timerDuration: number;
  setTimerDuration: React.Dispatch<React.SetStateAction<number>>;
  questionsPerChapter: { [chapterId: string]: number };
  setQuestionsPerChapter: React.Dispatch<React.SetStateAction<{ [chapterId: string]: number }>>;
  timePerSubject: { [subjectRef: string]: number };
  setTimePerSubject: React.Dispatch<React.SetStateAction<{ [subjectRef: string]: number }>>;
  totalTime: number;
  setTotalTime: React.Dispatch<React.SetStateAction<number>>;
  startExam: () => void;
  handleTotalTimeChange: (newTotalTime: number) => void;
  timerMode: 'per_subject' | 'global';
  setTimerMode: React.Dispatch<React.SetStateAction<'per_subject' | 'global'>>;
  examState: 'not_started' | 'in_progress' | 'completed';
  setExamState: React.Dispatch<React.SetStateAction<'not_started' | 'in_progress' | 'completed'>>;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timerDuration, setTimerDuration] = useState<number>(60);
  const [questionsPerChapter, setQuestionsPerChapter] = useState<{ [chapterId: string]: number }>({});
  const [timePerSubject, setTimePerSubject] = useState<{ [subjectRef: string]: number }>({});
  const [totalTime, setTotalTime] = useState<number>(0);
  const [timerMode, setTimerMode] = useState<'per_subject' | 'global'>('per_subject');
  const [examState, setExamState] = useState<'not_started' | 'in_progress' | 'completed'>('not_started');
  const startExam = () => {
    if (examState !== 'not_started') return;

    setExamState('in_progress');
    if (timerMode === 'per_subject') {
      Object.keys(timePerSubject).forEach(subjectRef => {
        const time = timePerSubject[subjectRef];
        console.log(`Starting timer for ${subjectRef}: ${time} minutes`);
      });
    } else {
      // console.log(`Starting global timer for ${totalTime} minutes`);
    }
  };

  const handleTotalTimeChange = (newTotalTime: number) => {
    setTotalTime(newTotalTime);
  };

  return (
    <ExamContext.Provider value={{ timerDuration, setTimerDuration, questionsPerChapter, setQuestionsPerChapter, timePerSubject, setTimePerSubject, totalTime, setTotalTime, startExam, handleTotalTimeChange, timerMode, setTimerMode, examState, setExamState }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExamContext = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExamContext must be used within an ExamProvider');
  }
  return context;
};
