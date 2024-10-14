import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { SERVER_URL } from '../../api';
import '../App.css';
import clock from '../styles/clocknew.png'
import ExamModeHeader from './exam/ExamModeHeader';
import QuestionsTable from './exam/QuestionsTable';
import TotalQuestions from './exam/TotalQuestions';
import StartExamButton from './exam/StartExamButton';


interface Question {
  _id: string;
  q_number: number;
}

export interface Chapter {
  _id: string;
  chapter_name: string;
  subject_ref: string;
  subject_name: string;
  number_of_questions: number;
  questions: Question[];
  totalQuestions: number;
  timeForChapter: number;
}

interface ExamSettingsProps {
  questionsPerChapter: { [chapterId: string]: number };
  setQuestionsPerChapter: React.Dispatch<React.SetStateAction<{ [chapterId: string]: number }>>;
  timePerSubject: { [subjectRef: string]: number };
  setTimePerSubject: React.Dispatch<React.SetStateAction<{ [subjectRef: string]: number }>>;
  totalTime: number;
  setTotalTime: React.Dispatch<React.SetStateAction<number>>;
  startExam: () => void;
  handleTotalTimeChange: (newTotalTime: number) => void;
  timerDuration: number;
  setTimerDuration: React.Dispatch<React.SetStateAction<number>>;
  darkMode: any;
  presentChapterIds: any
}

const ExamSettings: React.FC<ExamSettingsProps> = ({
  questionsPerChapter,
  setQuestionsPerChapter,
  timePerSubject,
  setTimePerSubject,
  totalTime,
  setTotalTime,
  startExam,
  handleTotalTimeChange,
  setTimerDuration,
  darkMode,
  presentChapterIds
}) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterIds, setChapterIds] = useState<string[]>([]);
  const [timeAllocationMode, setTimeAllocationMode] = useState<'global'>('global');
  const [loading, setLoading] = useState<boolean>(false);
  const location = useLocation();
  useEffect(() => {
    const fetchChaptersAndQuestions = async () => {
      setLoading(true);
      try {
        if (chapterIds.length === 0) {
          return;
        }
        let chpIds = chapterIds;
        if (chpIds.length === 0) {
          return;
        }
        if (presentChapterIds) {
          chpIds = chapterIds.filter(id => !presentChapterIds.includes(id));
        }

        // If there are no missing chapters, return early
        if (chpIds.length === 0) {
          return;
        }
        const response = await axios.get<Chapter[]>(
          `${SERVER_URL}/getspecific/chapters/${chpIds.join(',')}/questions`
        );
        const data = response.data;
        const sortedData = data.map((chapter) => ({
          ...chapter,
          questions: chapter.questions
            .sort((a, b) => a.q_number - b.q_number)
            .map((question) => ({
              ...question,
              answered_status: null,
            })),
          totalQuestions: chapter.questions.length,
          timeForChapter: 0,
        }));
        setChapters(sortedData);

        // Initialize questionsPerChapter with default number of questions per chapter
        const initialQuestionsPerChapter: { [chapterId: string]: number } = {};
        sortedData.forEach((chapter) => {
          initialQuestionsPerChapter[chapter._id] = chapter.totalQuestions;
        });
        setQuestionsPerChapter(initialQuestionsPerChapter);

        const initialTimePerSubject: { [subjectRef: string]: number } = {};
        sortedData.forEach(chapter => {
          if (!initialTimePerSubject[chapter.subject_ref]) {
            initialTimePerSubject[chapter.subject_ref] = 0;
          }
        });
        setTimePerSubject(initialTimePerSubject);
        const totalTime = Object.values(initialTimePerSubject).reduce((acc, time) => acc + time || 0, 0);
        setTotalTime(totalTime || 0);
        handleTotalTimeChange(totalTime);
        setTimerDuration(totalTime);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChaptersAndQuestions();
  }, [JSON.stringify(chapterIds)]);

  useEffect(() => {
    if (location.search) {
      const urlParams = new URLSearchParams(location.search);
      const chaptersParam = urlParams.get('chapters');
      if (chaptersParam) {
        const ids = chaptersParam.split(',');
        setChapterIds(ids);
      }
    }
  }, [location.search]);

  const handleQuestionsChange = (chapterId: string, value: number) => {
    const maxQuestions = chapters.find((chapter) => chapter._id === chapterId)?.totalQuestions || 0;
    const limitedValue = Math.min(value, maxQuestions);
    setQuestionsPerChapter((prevQuestionsPerChapter) => ({
      ...prevQuestionsPerChapter,
      [chapterId]: limitedValue,
    }));
  };


  const calculateTotalQuestions = (): number => {
    return Object.values(questionsPerChapter).reduce((acc, count) => acc + count, 0);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="shadow-lg bg-white dark:bg-gray-800 p-6 rounded-[30px] inline-block mt-4">
        <ExamModeHeader darkMode={darkMode} />
        <QuestionsTable
          chapters={chapters}
          questionsPerChapter={questionsPerChapter}
          handleQuestionsChange={handleQuestionsChange}
          timeAllocationMode={timeAllocationMode}
          loading={loading}
          darkMode={darkMode}
        />
        <TotalQuestions
          totalQuestions={calculateTotalQuestions()}
          totalTime={totalTime}
          handleTotalTimeChange={handleTotalTimeChange}
          clockIcon={clock}
          darkMode={darkMode}
        />
      </div>

      <StartExamButton
        startExam={startExam}
        disabled={totalTime <= 0}
      />
    </div>

  );
};

export default ExamSettings;
