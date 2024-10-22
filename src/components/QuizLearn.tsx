import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SERVER_URL } from '../../api';
import Timer from './Timer';
import 'katex/dist/katex.min.css';
import useDarkMode from '../hooks/useDarkMode';
import renderLatex from '../utils/renderLatex';
import { useAuth } from '../context/AuthProvider';
import QuitQuizModal from './QuitQuizModal';
import Popup from './Popup';
import { formatTime } from '../utils/timer.util';
import CorrectAnswer from './quizResults/CorrectAnswer';

interface Chapter {
  _id: string;
  university_ref: string;
  course_ref: string;
  class_ref: string;
  subject_ref: string;
  chapter_name: string;
  questions: Question[];
  results?: {
    correctAnswers: number;
    totalQuestions: number;
  };
}

interface Question {
  q_number: any;
  _id: string;
  q_latex_content: string;
  q_latex_explanation: string;
  q_latex_explanation_ChatGPT: string;
  q_answertype_options: Option[];
  q_answertype_options_has_multiple_good_answers: boolean;
  q_answertype_tofill: boolean;
  q_image_url?: string;
  answered_status: 'correct' | 'incorrect' | null;
  chapter_ref: string;
}

interface Option {
  _id: string;
  latex_content: string;
  image_url?: string;
  is_correct: boolean;
}

interface TimeSpentPerQuestion {
  questionIndex: number;
  time: number;
}

interface ChapterResult {
  chapterId: string;
  subjectId: string;
  results_by_question: {
    question_ref: string;
    is_completed: boolean;
    is_correct: boolean;
    is_not_correct: boolean;
    time_spent_per_question: number | null;
  }[];
}

const QuizLearn = ({ darkMode }: any) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const chaptersParam = searchParams.get('chapters');
  const subjectIds = searchParams.get('subjects')?.split(",") || [];
  const initialChapterIds = chaptersParam ? chaptersParam.split(',') : [];
  const [chapterIds, setChapterIds] = useState<string[]>(initialChapterIds);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [isDarkMode] = useDarkMode();
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showQuitQuizModal, setShowQuitQuizModal] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showResult, setShowResult] = useState<boolean | null>(null);
  const [markResult, setMarkResult] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [, setCorrectAnswersCount] = useState<number>(0);
  const [, setIncorrectAnswersCount] = useState<number>(0);
  const { userInfo } = useAuth();
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [answeredStatus, setAnsweredStatus] = useState<Array<'correct' | 'incorrect' | 'tofill' | null>>(Array(questions.length).fill(null));
  const [confirmedAnswer, setConfirmedAnswer] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<TimeSpentPerQuestion[]>([]);
  const isQuizCompleted = answeredQuestions.every((answered) => answered);
  const [isAnswerMarked, setIsAnswerMarked] = useState<boolean>(false);
  const activeQuestionRef = useRef<HTMLDivElement | null>(null);
  const [savingResults, setSavingResults] = useState(false);
  const [toFillUserAnswers, setToFillUserAnswers] = useState<string[]>([]);
  let [totalQuestionDone, setTotalQuestionDone] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isHandleConfirm, setIsHandleConfirm] = useState<boolean>(false);
  const [isConfirmedCompleted, setIsConfirmedCompleted] = useState<boolean>(false);
  const [isMarkStatus, setIsMarkStatus] = useState<boolean>(false)
  const [isMarkInStatus, setIsMarkInStatus] = useState<boolean>(false)
  const [isGPTShow, setIsGPTShow] = useState<boolean>(false);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
  const [resultExplanation, setResultExplanation] = useState<any>();

  const navigate = useNavigate();

  console.log("sdfsdfsdf", subjectIds)


  const handleExpGPT = useCallback(() => {
    setIsGPTShow(prev => !prev);
  }, []);


  const chapterResults: ChapterResult[] = useMemo(() =>
    chapters.map((chapter:any) => ({
      chapterId: chapter._id,
      subjectId: chapter.subject_id,
      results_by_question: chapter.questions.map((question:any) => ({
        question_ref: question._id,
        is_completed: answeredQuestions[questions.indexOf(question)],
        is_correct: answeredStatus[questions.indexOf(question)] === 'correct',
        is_not_correct: answeredStatus[questions.indexOf(question)] === 'incorrect',
        to_fill_user_answer: toFillUserAnswers[questions.indexOf(question)] || '',
        time_spent_per_question: timeSpentPerQuestion.find(time => time.questionIndex === questions.indexOf(question))?.time || 0,
      })),
    })),
    [chapters, questions, answeredQuestions, answeredStatus, toFillUserAnswers, timeSpentPerQuestion]
  )

  const [, setTimer] = useState<number>(0);
  const timerInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (activeQuestionRef.current) {
      activeQuestionRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (timerStarted) {
      timerInterval.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [timerStarted]);

  const handleStartTimer = () => {
    setTimerStarted(true);
    setTimerStartTime(new Date());
    setTimer(0);
  };
  const fetchUser = async () => {
    try {
      const user = await axios.get(`${SERVER_URL}/user/user-name/${userInfo?._id}`);
      setTotalQuestionDone(user?.data?.total_question_done)
    } catch (error) {
      console.log("erorr fetching user", error);
    }


  }
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchChaptersAndQuestions = async () => {
    try {
      if (chapterIds.length === 0 || !userInfo?._id) {
        return;
      }
      const chaptersResponse = await axios.get<Chapter[]>(`${SERVER_URL}/getspecific/chapters/${chapterIds.join(',')}/questions`);
      const data = chaptersResponse.data;
      const allQuestions = data.flatMap((chapter:any) =>
        chapter.questions.map((question:any) => ({
          ...question,
          subject_id: chapter.subject_id,
        }))
      );
      console.log("allQuestions", allQuestions)
      setChapters(data.map(chapter => ({
        ...chapter,
        results: {
          correctAnswers: 0,
          totalQuestions: chapter.questions.length
        },
        questions: chapter.questions.sort((a, b) => a.q_number - b.q_number),
      })));
      setQuestions(allQuestions);
      setToFillUserAnswers(allQuestions.map(() => ''));
      const resultsResponse = await axios.get(`${SERVER_URL}/quiz/${userInfo._id}/getCurrentResults`, {
        params: { chapterIds: chapterIds.join(',') }
      });
      const resultsData = resultsResponse.data.results;

      console.log("resultsResponse.data.results", resultsResponse.data.results);

      await allQuestions.map((question) => {
        const result = resultsData.find((r: any) => r.question_ref.toString() === question._id.toString());
        return result ? result.to_fill_user_answer || '' : '';
      });
      const newToFillUserAnswers = allQuestions.map((question) => {
        const result = resultsData.find((r: any) => (r.question_ref.toString() === question._id.toString() && r.done_by_mode !== 'exam'));
        return result ? result.to_fill_user_answer || '' : '';
      });
      const resultExplanation = allQuestions.map((question) => {
        const result = resultsData.find((r: any) => r.question_ref.toString() === question._id.toString());
        return result
          ? {
            explanation: result.q_latex_explanation,
            done_by_mode: result?.done_by_mode || '',
            answer_by_learn_mode: result?.answer_by_learn_mode || ''
          }
          : '';

      });

      const newAnsweredStatus = allQuestions.map((question) => {
        const result = resultsData.find((r: any) => r.question_ref.toString() === question._id.toString());
        if (result && (result.done_by_mode === 'learn' || result.answer_by_learn_mode === 'learn')) {
          // if (result.is_correct) return 'correct';
          // if (result.is_not_correct) return 'incorrect';
          if (result.learn_correct_answers_count) return 'correct';
          if (result.learn_incorrect_answers_count) return 'incorrect';
          if (result.to_fill_user_answer) return 'tofill';
        }
        return null;
      });

      setChapters(data.map(chapter => ({
        ...chapter,
        results: {
          correctAnswers: 0,
          totalQuestions: chapter.questions.length
        },
        questions: chapter.questions.sort((a, b) => a.q_number - b.q_number),
      })));
      setQuestions(allQuestions);
      setToFillUserAnswers(newToFillUserAnswers);
      setUserAnswers(newToFillUserAnswers);
      setResultExplanation(resultExplanation)
      setAnsweredStatus(newAnsweredStatus);
      setAnsweredQuestions(newAnsweredStatus.map(status => status !== null));

    } catch (error) {
      // console.error('Error fetching chapters and questions or results data:', error);
    }
  };
  useEffect(() => {
    fetchChaptersAndQuestions();
  }, [chapterIds, userInfo?._id]);


  useEffect(() => {
    if (chaptersParam) {
      const ids = chaptersParam.split(',');
      setChapterIds(ids);
    }
  }, [chaptersParam]);

  useEffect(() => {
    setSelectedOptions([]);
    setConfirmedAnswer(false);
    setShowResult(null);
  }, [currentQuestionIndex]);


  const handleConfirm = useCallback(async () => {
    setIsHandleConfirm(true);

    if (questions[currentQuestionIndex].q_answertype_tofill) {
      setIsConfirmedCompleted(false);
    }

    const selectedIds = selectedOptions.map((id) => id.toString());
    const userData: { total_question_done: number | string } = {
      total_question_done: "SOME_VALUE",
    };

    try {
      await axios.put(`${SERVER_URL}/user/${userInfo?._id}`, userData);
      await axios.post(`${SERVER_URL}/quiz/increment-questions`, {
        user_id: userInfo?._id,
        mode: "learn"
      });
      await axios.post(`${SERVER_URL}/quiz/${userInfo?._id}/${questions[currentQuestionIndex]?.subject_id}/subject-progress`);
      await axios.post(`${SERVER_URL}/quiz/${userInfo?._id}/${questions[currentQuestionIndex]?.chapter_ref}/chapter-progress`, { mode: "learn" });
      fetchUser();

      if (answeredQuestions[currentQuestionIndex]) {
        return;
      }

      const isToFillQuestion = questions[currentQuestionIndex].q_answertype_tofill;
      if (isToFillQuestion) {
        const answeredStatus = 'tofill';
        const userAnswer = userAnswers[currentQuestionIndex] || '';

        // Update userAnswers only if necessary
        setUserAnswers((prevUserAnswers) => {
          const updatedUserAnswers = [...prevUserAnswers];
          if (updatedUserAnswers[currentQuestionIndex] !== userAnswer) {
            updatedUserAnswers[currentQuestionIndex] = userAnswer;
          }
          return updatedUserAnswers;
        });

        setConfirmedAnswer(true);

        // This redundancy should be removed as it serves no new purpose
        // setUserAnswers((prevUserAnswers) => {
        //   const updatedUserAnswers = [...prevUserAnswers];
        //   updatedUserAnswers[currentQuestionIndex] = userAnswer;
        //   return updatedUserAnswers;
        // });

        setToFillUserAnswers((prevToFillAnswers) => {
          const updatedToFillAnswers = [...prevToFillAnswers];
          updatedToFillAnswers[currentQuestionIndex] = userAnswer;
          return updatedToFillAnswers;
        });

        setAnsweredStatus((prevStatus) => {
          const newStatus = [...prevStatus];
          newStatus[currentQuestionIndex] = answeredStatus;
          return newStatus;
        });

        setShowResult(false);
        setIsAnswerMarked(false);

        setIsReadOnly(true);
        return;
      }

      const correctIds = questions[currentQuestionIndex].q_answertype_options
        .filter((option:any) => option.is_correct)
        .map((option: any) => option._id.toString());
      const allCorrectlySelected = correctIds.every((id: any) => selectedIds.includes(id));
      const isCorrect = allCorrectlySelected;
      const answeredStatus = isCorrect ? 'correct' : 'incorrect';

      setUserAnswers((prevUserAnswers) => {
        const updatedUserAnswers = [...prevUserAnswers];
        updatedUserAnswers[currentQuestionIndex] = selectedOptions.join(',');
        return updatedUserAnswers;
      });

      setAnsweredStatus((prevStatus) => {
        const newStatus = [...prevStatus];
        newStatus[currentQuestionIndex] = answeredStatus;
        return newStatus;
      });

      setShowResult(isCorrect);
      setConfirmedAnswer(true);

      if (isCorrect) {
        try {
          await axios.post(`${SERVER_URL}/quiz/increment-questions/correct`, {
            user_id: userInfo?._id,
            mode: "learn"
          })
        } catch (error) {
          console.error("Error saving the correct question count", error);
        }
        setIsMarkInStatus(true);
        setCorrectAnswersCount((prevCount) => prevCount + 1);
      } else {
        setIsMarkStatus(true);
        setIncorrectAnswersCount((prevCount) => prevCount + 1);
      }

      setAnsweredQuestions((prev) => {
        const newAnsweredQuestions = [...prev];
        newAnsweredQuestions[currentQuestionIndex] = true;
        return newAnsweredQuestions;
      });

      setIsHandleConfirm(false);
      setIsConfirmedCompleted(true);

      setIsReadOnly(true);
    } catch (error) {
      // Handle error appropriately
    } finally {
      setIsHandleConfirm(false);
    }
  }, [questions, currentQuestionIndex, selectedOptions, userInfo, subjectIds, totalQuestionDone, answeredQuestions, initialChapterIds, fetchUser]);


  const handleMarkAsCorrect = useCallback(() => {
    setIsMarkStatus(true);
    if (confirmedAnswer && !isAnswerMarked && questions[currentQuestionIndex].q_answertype_tofill) {
      setAnsweredStatus(prevStatus => {
        const newStatus = [...prevStatus];
        newStatus[currentQuestionIndex] = 'correct';
        return newStatus;
      });
    }
    setShowResult(true);

  }, [confirmedAnswer, isAnswerMarked, questions, currentQuestionIndex]);

  const handleMarkAsNotCorrect = () => {
    setIsMarkInStatus(true);
    if (confirmedAnswer && !isAnswerMarked && questions[currentQuestionIndex].q_answertype_tofill) {
      setAnsweredStatus((prevStatus) => {
        const newStatus = [...prevStatus];
        newStatus[currentQuestionIndex] = 'incorrect';
        return newStatus;
      });
    }
    setShowResult(true);
  };

  const saveTimeForCurrentQuestion = () => {
    if (timerStartTime) {
      const elapsedTime = (new Date().getTime() - timerStartTime.getTime()) / 1000;
      setTimeSpentPerQuestion(prev => {
        const existingTimeIndex = prev.findIndex(time => time.questionIndex === currentQuestionIndex);
        if (existingTimeIndex !== -1) {
          const updatedTimes = [...prev];
          updatedTimes[existingTimeIndex].time += elapsedTime;
          return updatedTimes;
        } else {
          return [...prev, { questionIndex: currentQuestionIndex, time: elapsedTime }];
        }
      });
    }
    setTimerStartTime(new Date());
  };

  const incrementCorrectCount = async () => {
    try {
      await axios.post(`${SERVER_URL}/quiz/increment-questions/correct`, {
        user_id: userInfo?._id,
        mode: "learn"
      })
    } catch (error) {
      console.error("Error saving the correct question count", error);
    }
  }

  // New function to update the correct count in the backend based on the quiz attempt
  const updateCorrectCount = async (userId: any, chapterId: any, correctAnswersCount: any) => {
    try {
      await axios.post(`${SERVER_URL}/quiz/increment-questions/correct`, {
        user_id: userId,
        mode: 'learn',
        correct_answers_count: correctAnswersCount,
        chapter_id: chapterId
      });
    } catch (error) {
      console.error("Error updating the correct question count:", error);
    }
  };

  const saveQuizResults = async () => {
    console.log("saveQuizResultas`")
    if (savingResults) {
      return; // Prevent further calls while saving
    }

    // setIsConfirmedCompleted(true);
    setSavingResults(true);

    const totalTimeSpent = timeSpentPerQuestion.reduce((acc, time) => acc + time.time, 0);
    // formatTime(totalSeconds)
    try {

      // save the format time for a chapter also
      await axios.post(`${SERVER_URL}/quiz/${userInfo?._id}/${chapterResults[0]?.chapterId}/chapter-time-spent`, { time_spent: formatTime(totalSeconds), mode: "learn" });
      // save the format time for a subject also
      await axios.post(`${SERVER_URL}/quiz/${userInfo?._id}/${chapterResults[0]?.subjectId}/subject-time-spent`, { time_spent: formatTime(totalSeconds), mode: "learn" });
      const formattedTotalTimeSpent = new Date(totalTimeSpent * 1000).toISOString().substr(11, 8);
      // console.log("formattedTotalTimeSpent", formatTime(totalSeconds));
      const correctAnswersCount = answeredStatus.filter(status => status === 'correct').length;
      const incorrectAnswersCount = answeredStatus.filter(status => status === 'incorrect').length;
      const resultsByChapter = chapterResults.map(chapterResult => ({
        chapter_ref: chapterResult.chapterId,
        results_by_question: chapterResult.results_by_question.map(result => ({
          question_ref: result.question_ref,
          is_correct: answeredStatus[questions.findIndex(q => q._id === result.question_ref)] === 'correct',
          is_not_correct: answeredStatus[questions.findIndex(q => q._id === result.question_ref)] === 'incorrect',
          to_fill_user_answer: toFillUserAnswers[questions.findIndex(q => q._id === result.question_ref)] || '',
          time_spent_per_question: timeSpentPerQuestion.find(time => time.questionIndex === questions.findIndex(q => q._id === result.question_ref))?.time || 0,
          done_by_mode: "learn"
        })),
      }));
      if (resultsByChapter.length === 0) {
        // console.log("No chapters results available")
        throw new Error('No chapter results available');
      }
      const chapterId = chapterResults[0]?.chapterId;
      const requestBody = {
        userId: userInfo?._id,
        chapterId,
        quiz_mode: 'learn',
        // total_time_spent: formattedTotalTimeSpent,
        to_fill_user_answer: userAnswers[currentQuestionIndex],
        total_time_spent: formatTime(totalSeconds),
        results_by_chapter: resultsByChapter,
        correct_answers_count: correctAnswersCount,
        incorrect_answers_count: incorrectAnswersCount,
        answer_by_learn_mode: "learn",
        learn_correct_answers_count: correctAnswersCount,
        learn_incorrect_answers_count: incorrectAnswersCount,
      };
      await axios.post(`${SERVER_URL}/quiz/${userInfo?._id}/${chapterId}/results`, requestBody);
      for (const chapterResult of resultsByChapter) {
        const chapterId = chapterResult.chapter_ref;
        const correctAnswersCountForChapter = chapterResult.results_by_question.filter(result => result.is_correct).length;
        await updateCorrectCount(userInfo?._id, chapterId, correctAnswersCountForChapter);
      }

      setSavingResults(false);
      setShowQuitQuizModal(false);
    } catch (error) {
      // console.error('Failed to save quiz results:', error);
      setSavingResults(false);
    } finally {
      // setIsConfirmed(false);\
      setIsMarkStatus(false);
      setIsMarkInStatus(false);
      setIsConfirmedCompleted(false);
      setIsHandleConfirm(false)
    }
  };

  const c = async () => {
    await saveQuizResults();
    setIsMarkInStatus(false);
    setIsMarkStatus(false);
  }

  const close = async () => {
    navigate('/home')
  }

  useEffect(() => {
    if (isMarkStatus) {
      // setIsMarkStatus(true);
      // incrementCorrectCount();
      setIsHandleConfirm(false)
      setIsAnswerMarked(true);
      setCorrectAnswersCount((prevCount) => prevCount + 1);
      setAnsweredQuestions((prev) => {
        const newAnsweredQuestions = [...prev];
        newAnsweredQuestions[currentQuestionIndex] = true;
        return newAnsweredQuestions;
      });
      // setIsMarkInStatus(false);
    }
    if (isMarkInStatus) {
      // setIsMarkInStatus(true);
      setIsHandleConfirm(false);
      setIsAnswerMarked(true);
      setIncorrectAnswersCount((prevCount) => prevCount + 1);
      setAnsweredQuestions((prev) => {
        const newAnsweredQuestions = [...prev];
        newAnsweredQuestions[currentQuestionIndex] = true;
        return newAnsweredQuestions;
      });
      // setIsMarkInStatus(false);
    }
  }, [isMarkStatus, isMarkInStatus])


  useEffect(() => {
    if (isConfirmedCompleted || isMarkStatus || isMarkInStatus) {
      // console.log("Coming to call the C()", { isMarkStatus })
      c();
      setIsHandleConfirm(false)
      setIsHandleConfirm(false)
    }
  }, [isConfirmedCompleted, isMarkStatus, isMarkInStatus])
  // console.log("isHandleConfirm",isHandleConfirm);

  // useEffect(() => {
  //   if (isConfirmedCompleted && isHandleConfirm) {
  //     setIsHandleConfirm(false);
  //   }
  // }, [isConfirmedCompleted, isHandleConfirm])

  const handleResetQuiz = async () => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const chaptersParam = searchParams.get('chapters');
      const chapterIdsToReset = chaptersParam ? chaptersParam.split(',') : [];
      if (chapterIdsToReset.length === 0) {
        throw new Error('No chapter IDs provided');
      }
      await axios.post(`${SERVER_URL}/quiz/${userInfo?._id}/resetResults`, { chapterIds: chapterIdsToReset });
      await axios.post(`${SERVER_URL}/quiz/correct-count/reset`, { chapterIds: chapterIdsToReset, userId: userInfo?._id, mode: "learn" });
      setCurrentQuestionIndex(0);
      setTimerStartTime(null);
      setShowQuitQuizModal(false);
      setSelectedOptions([]);
      setShowResult(null);
      setMarkResult(null);
      setShowExplanation(false);
      setToFillUserAnswers(Array(questions.length).fill(''));
      setCorrectAnswersCount(0);
      setUserAnswers(Array(questions.length).fill(''));
      setAnsweredStatus(Array(questions.length).fill(null));
      setConfirmedAnswer(false);
      setAnsweredQuestions(new Array(questions.length).fill(false));
      setTimeSpentPerQuestion([]);
      setIsReadOnly(false);
      fetchChaptersAndQuestions()
    } catch (error) {
      console.error('Error resetting quiz:', error);
    }
  };

  const handleQuestionClick = (questionId: string) => {
    // Save the time spent on the current question before switching
    saveTimeForCurrentQuestion();
    setIsReadOnly(false);

    // Find the new question index based on the provided questionId
    let newQuestionIndex = 0;
    let found = false;
    for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
      const chapter = chapters[chapterIndex];
      for (let qIndex = 0; qIndex < chapter.questions.length; qIndex++) {
        if (chapter.questions[qIndex]._id === questionId) {
          found = true;
          break;
        }
        newQuestionIndex++;
      }
      if (found) break;
    }

    // If switching to a different question, update the time spent and the question index
    if (currentQuestionIndex !== newQuestionIndex) {
      if (timerStartTime) {
        const endTime = new Date();
        const elapsedTime = Math.abs(endTime.getTime() - timerStartTime.getTime()) / 1000;

        // Update the time spent on the previous question
        setTimeSpentPerQuestion((prevTimes) => {
          const updatedTimes = [...prevTimes];
          const existingIndex = updatedTimes.findIndex((item) => item.questionIndex === currentQuestionIndex);

          if (existingIndex !== -1) {
            updatedTimes[existingIndex].time += elapsedTime;
          } else {
            updatedTimes.push({ questionIndex: currentQuestionIndex, time: elapsedTime });
          }

          return updatedTimes;
        });
      }

      // Set the new current question index and start the timer
      setCurrentQuestionIndex(newQuestionIndex);
      setTimerStartTime(new Date());

      // Reset states if the new question has not been answered yet
      if (!answeredQuestions[newQuestionIndex]) {
        setSelectedOptions([]);
        setShowResult(null);
        setConfirmedAnswer(false);
        setShowExplanation(false);
      }
    }
  };


  const goToPreviousQuestion = () => {
    if (!isConfirmedCompleted) {
      saveTimeForCurrentQuestion();
      if (currentQuestionIndex > 0) {
        if (timerStartTime) {
          const timeSpent = (new Date().getTime() - timerStartTime.getTime()) / 1000;
          setTimeSpentPerQuestion(prev => [
            ...prev.filter(time => time.questionIndex !== currentQuestionIndex),
            { questionIndex: currentQuestionIndex, time: timeSpent }
          ]);
        }

        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setShowResult(null);
        setConfirmedAnswer(false);
        setTimerStartTime(new Date());
      }
    }
  };

  const goToNextQuestion = () => {
    if (!isConfirmedCompleted) {
      setIsReadOnly(false);
      saveTimeForCurrentQuestion();
      if (currentQuestionIndex < questions.length - 1) {
        if (timerStartTime) {
          const timeSpent = (new Date().getTime() - timerStartTime.getTime()) / 1000;
          setTimeSpentPerQuestion(prev => [
            ...prev.filter(time => time.questionIndex !== currentQuestionIndex),
            { questionIndex: currentQuestionIndex, time: timeSpent }
          ]);
        }
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowResult(null);
        setConfirmedAnswer(false);
        setTimerStartTime(new Date());
        fetchChaptersAndQuestions();
      }
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleConfirm();
      } else if (event.key === 'ArrowLeft') {
        goToPreviousQuestion();
      } else if (event.key === 'ArrowRight') {
        goToNextQuestion();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleConfirm, goToPreviousQuestion, goToNextQuestion]);


  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const optionId = event.target.value;
    setSelectedOptions((prevOptions) => {
      if (!questions[currentQuestionIndex].q_answertype_tofill) {
        if (questions[currentQuestionIndex].q_answertype_options_has_multiple_good_answers) {
          return prevOptions.includes(optionId)
            ? prevOptions.filter((id) => id !== optionId)
            : [...prevOptions, optionId];
        } else {
          return [optionId];
        }
      } else {
        return [];
      }
    });
    setShowResult(null);
  };


  const handleUserAnswerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setUserAnswers((prevUserAnswers) => {
      const newUserAnswers = [...prevUserAnswers];
      newUserAnswers[currentQuestionIndex] = value;
      return newUserAnswers;
    });
  };

  const renderExplanation = () => {
    const question = questions[currentQuestionIndex];
    const result = resultExplanation?.[currentQuestionIndex];
    let explanation;
    if (!confirmedAnswer) {
      console.log("result", { result })
      if (result && result.explanation) {
        if ((result.done_by_mode !== 'exam' || result.done_by_mode !== 'random') && answeredStatus[currentQuestionIndex] !== null && (result.answer_by_learn_mode === "learn" || result.done_by_mode === "learn")) {
          explanation = result.explanation;
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
    if (confirmedAnswer) {
      explanation = showResult || !showResult && question?.q_latex_explanation as any;
    }
    return explanation ? renderLatex(question?.q_latex_explanation) : null;

  };

  const handleCloseErrorPopup = () => {
    setShowErrorPopup(false);
  };

  return (
    <div className="main-container-space" style={{ position: 'relative' }}>
      <div
        className={`bg-transparent rounded p-6   ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}
        style={{ maxWidth: '1200px', minWidth: "320px", margin: '0 auto' }}
      >
        {timerStarted && questions.length > 0 && (
          <div className="flex flex-row justify-end mb-4 top-0 right-0 mt-4">
            <>
              <button
                onClick={handleResetQuiz}
                className={`px-2 py-1 ml-10 rounded text-customColor border border-customColor hover:bg-customColor hover:text-white ${isQuizCompleted ? '' : 'hidden'}`}
              >
                Reset
              </button>
              <button className="w-[24px] ml-10"
                onClick={() => setShowQuitQuizModal(true)}>
                <img width="24" height="24" src="https://img.icons8.com/external-tal-revivo-light-tal-revivo/24/FF9934/external-online-account-logout-with-arrow-direction-mark-login-light-tal-revivo.png" alt="Quit" />
              </button>
            </>

            <Timer autoStart={timerStarted} totalSeconds={totalSeconds} setTotalSeconds={setTotalSeconds} />
          </div>
        )}
        {!timerStarted && (
          <div className="flex items-start justify-center">
            <div className="w-1/2 min-w-[350px] shadow-lg h-1/2 bg-transparent bg-white dark:bg-gray-800 p-6 rounded-lg inline-block">
              <h1 className="text-2xl mb-2 text-customColor font-bold">Learn</h1>
              <div className="bottom-full left-0 p-2 rounded border border-gray-500 z-50 mb-2 text-gray-500 mt-4 flex flex-row">
                Questions run in a specific order, without time limit
                <br />
              </div>
              <div className="p-4 pb-2 rounded border border-customColor mb-10 mt-10">
                <h1 className="mb-2 text-customColor font-bold">Chapters:</h1>
                <div className="mb-4">
                  {chapters.map(chapter => (
                    <div key={chapter._id}>
                      <h1 className="text-customColor">- {chapter.chapter_name}</h1>
                    </div>
                  ))}
                </div>
                <h1 className="mb-2 text-customColor font-bold">Total:</h1>
                <h1 className="mb-6 text-customColor">{questions.length} questions</h1>
              </div>
              <button
                onClick={handleStartTimer}
                className={`btn btn-orange text-white py-2 px-4 rounded mt-10 ${questions.length <= 0 ? 'bg-gray-300 cursor-not-allowed' : ''}`}
                disabled={questions.length <= 0}
              >
                Practice
              </button>
            </div>
          </div>
        )}
        {timerStarted && (
          <div className="text-start mb-4 pt-2 pb-1 items-center text-customColor overflow-x-auto whitespace-nowrap">
            <div className="text-sm ml-2 flex items-center flex-nowrap overflow-x-auto">
              {chapters.map((chapter) => (
                <div key={chapter._id} className="mb-4 mr-4 flex flex-col items-start flex-none">
                  <h2 className="text-lg font-bold inline-block mr-2 whitespace-nowrap">{chapter.chapter_name}:</h2>
                  <div className="flex flex-wrap w-full flex-nowrap overflow-x-auto pb-6">
                    {chapter.questions
                      .sort((a, b) => a.q_number - b.q_number)
                      .map((question) => {
                        const questionIndex = questions.findIndex((q) => q._id === question._id);
                        const isActive = currentQuestionIndex === questionIndex;

                        let statusClass = 'border border-customColor text-customColor';

                        if (isActive) {
                          // Active question
                          if (answeredStatus[questionIndex] === 'correct') {
                            statusClass = 'bg-teal-500 text-black border-b-4 border-customColor';
                          } else if (answeredStatus[questionIndex] === 'incorrect') {
                            statusClass = 'bg-rose-400 text-black border-b-4 border-customColor';
                          } else {
                            statusClass = 'bg-customColor text-white';
                          }
                        } else {
                          // Inactive questions but answered
                          if (answeredStatus[questionIndex] === 'correct') {
                            statusClass = 'bg-teal-500 text-black';
                          } else if (answeredStatus[questionIndex] === 'incorrect') {
                            statusClass = 'bg-rose-400 text-black';
                          } else {
                            statusClass = 'border border-customColor text-customColor';
                          }
                        }

                        return (
                          <span
                            key={question._id}
                            className={`mx-1 mt-2 p-2 rounded ${statusClass} px-3 py-1 cursor-pointer`}
                            ref={isActive ? activeQuestionRef : null}
                            style={{
                              minWidth: '40px',
                              textAlign: 'center',
                              flex: '0 0 auto'
                            }}
                            onClick={() => handleQuestionClick(question._id)}
                            aria-label={`Question ${question.q_number}, ${answeredStatus[questionIndex] === 'correct' ? 'answered correctly' : answeredStatus[questionIndex] === 'incorrect' ? 'answered incorrectly' : 'unanswered'}`}
                          >
                            {question.q_number}
                          </span>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {timerStarted && (
          <div key={questions[currentQuestionIndex]._id} className="w-full bg-transparent border-[1px] border-gray-500  dark:bg-gray-800 dark:text-gray-300 p-4 rounded-lg shadow-lg mt-4">
            <div className="border border-customColor rounded-lg overflow-hidden">
              {questions[currentQuestionIndex]?.q_image_url && (
                <img
                  src={questions[currentQuestionIndex]?.q_image_url}
                  alt={`Question ${currentQuestionIndex + 1}`}
                  className="h-auto max-h-[300px] w-fill rounded ml-4 mt-4 md:order-last"
                />
              )}
              <h2 className="text-md font-serif mb-4 p-4 rounded border-b border-customColor">
                {renderLatex(questions[currentQuestionIndex]?.q_latex_content)}
              </h2>
              <div className="flex flex-col p-4">

                {questions[currentQuestionIndex].q_answertype_tofill ? (
                  <>
                    <p className="p-2 resize-none text-base bg-transparent">Your answer:</p>
                    <textarea
                      className="answer-textarea text-black font-serif p-4"
                      value={userAnswers[currentQuestionIndex] ? userAnswers[currentQuestionIndex] : ""}
                      onChange={handleUserAnswerChange}
                      readOnly={answeredQuestions[currentQuestionIndex] || isReadOnly}
                    ></textarea>
                    {confirmedAnswer && !markResult && !isAnswerMarked && (
                      <div className="flex justify-center ">
                        <button
                          className={`mt-2 font-bold m-1 px-2 py-1 min-w-[180px] text-teal-500 hover:border hover:border-teal-500 hover:rounded-lg`}
                          onClick={handleMarkAsCorrect}
                        >
                          Correct
                        </button>
                        <div className='font-bold text-gray-400 px-4 p-2 mt-2'>?</div>
                        <button
                          className={`mt-2 font-bold m-1 px-2 py-2 min-w-[180px] text-rose-500 hover:border hover:border-rose-500 hover:rounded-lg`}
                          onClick={handleMarkAsNotCorrect}
                        >
                          Incorrect
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {questions[currentQuestionIndex].q_answertype_options.map(
                        (option: any) =>
                          (option?.latex_content || option?.image_url) && (option?.latex_content !== '' || option?.image_url) && (
                            <div
                              key={option._id}
                              className="flex items-start p-4 border border-gray-300 rounded-lg bg-white shadow-sm"
                            >
                              <input
                                type={
                                  questions[currentQuestionIndex]
                                    .q_answertype_options_has_multiple_good_answers
                                    ? 'checkbox'
                                    : 'radio'
                                }
                                id={option._id}
                                name="options"
                                value={option._id}
                                checked={selectedOptions.includes(option._id)}
                                onChange={handleOptionChange}
                                readOnly={answeredQuestions[currentQuestionIndex]}
                                disabled={answeredQuestions[currentQuestionIndex]}
                                className="mr-3 mt-1 cursor-pointer text-black"
                              />
                              <label
                                htmlFor={option._id}
                                className={`flex-1 text-base font-serif cursor-pointer text-black ${answeredStatus[currentQuestionIndex] === 'correct' && option.is_correct
                                  ? 'font-bold text-green-600'
                                  : answeredStatus[currentQuestionIndex] === 'correct' &&
                                    !option.is_correct
                                    ? 'line-through text-gray-400'
                                    : answeredStatus[currentQuestionIndex] === 'incorrect' &&
                                      option.is_correct
                                      ? 'font-bold text-green-600'
                                      : answeredStatus[currentQuestionIndex] === 'incorrect' &&
                                        !option.is_correct
                                        ? 'line-through text-gray-400'
                                        : ''
                                  }`}
                                style={{ pointerEvents: confirmedAnswer ? 'none' : 'auto' }}
                              >
                                <div className="mr-2">
                                  {option?.latex_content && option?.latex_content !== '' && renderLatex(option.latex_content)}
                                </div>
                                {option.image_url && (
                                  <div className="flex justify-center items-center mt-4 mb-4">
                                    <img
                                      src={option.image_url}
                                      alt="Option"
                                      className="rounded"
                                      style={{ maxWidth: '100px', maxHeight: '100px', width: 'auto', height: 'auto' }}
                                    />
                                  </div>
                                )}
                              </label>
                            </div>
                          )
                      )}
                    </div>


                    <div className="flex items-center justify-center mt-4 mb-2">
                      {showResult !== null && (
                        <p className={`text-${showResult ? 'teal' : 'rose'}-500 py-2 px-4 font-bold`}>
                          {showResult ? 'Correct' : 'Incorrect'}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
              {renderExplanation() && (
                <div className="mt-4 px-6 py-4 border border-gray-300 rounded-lg text-black bg-gray-50 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">University Explanation:</h3>
                  <p className="font-serif leading-relaxed">{renderExplanation()}</p>
                </div>
              )}
              {
                questions[currentQuestionIndex].q_latex_explanation_ChatGPT && showResult && (
                  <div className="text-center mt-4">
                    <p className={`${darkMode ? "text-gray-200" : "text-gray-700"} text-sm`}>See explanation generated by ChatGPT</p>
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ease-in-out transform ${isConfirmedCompleted ? "opacity-50 cursor-not-allowed" : "hover:scale-105"} ${isConfirmedCompleted ? "hidden" : "inline-block"}`}
                      onClick={handleExpGPT}
                      disabled={isConfirmedCompleted}
                    >
                      {isGPTShow ? "Hide Explanation" : "Show Explanation"}
                    </button>
                  </div>
                )
              }
              {isGPTShow && (
                <div className="mt-4 px-6 py-4 border border-gray-300 rounded-lg text-black bg-gray-50 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Explanation:</h3>
                  <p className="font-serif leading-relaxed">{questions[currentQuestionIndex].q_latex_explanation_ChatGPT}</p>
                </div>
              )}

            </div>
          </div>
        )}
        <div className="flex items-center justify-center mb-8">
          <div className="flex justify-center w-full px-6 items-center">
            {
              (isConfirmedCompleted || isMarkInStatus || isMarkStatus || isHandleConfirm) && (
                <div className="flex justify-center mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-400"></div>
                </div>
              )
            }
            {timerStarted && (!isConfirmedCompleted && !isMarkInStatus && !isMarkInStatus && !isHandleConfirm && !savingResults) && (
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 m-10 rounded text-orange-400 ${currentQuestionIndex === 0 ? 'cursor-not-allowed' : 'hover:border border-orange-400'}`}
                style={{ visibility: currentQuestionIndex === 0 ? 'hidden' : 'visible' }}
              >
                <img width="20" height="20" src="https://img.icons8.com/ios/20/FF9934/double-left.png" alt="Previous" />
              </button>
            )}
            {timerStarted && !showExplanation && showResult == null && !isHandleConfirm && !answeredQuestions[currentQuestionIndex] && (
              <button className={`btn btn-orange ${isConfirmedCompleted ? "hidden" : "visible"}`} onClick={handleConfirm}
                disabled={isConfirmedCompleted || isHandleConfirm}>
                {isConfirmedCompleted ? "Saving..." : "Confirm"}
              </button>
            )}
            {timerStarted && (!isConfirmedCompleted && !isMarkInStatus && !isMarkInStatus && !isHandleConfirm && !savingResults) && (
              <button
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className={`px-4 py-2 m-10 rounded text-orange-400 ${currentQuestionIndex === questions.length - 1 ? 'cursor-not-allowed' : 'hover:border border-orange-400'}`}
                style={{ visibility: currentQuestionIndex === questions.length - 1 ? 'hidden' : 'visible' }}
              >
                <img width="20" height="20" src="https://img.icons8.com/ios/20/FF9934/double-right.png" alt="Next" />
              </button>
            )}
          </div>
        </div>
      </div>

      {showErrorPopup && (
        <Popup type="red" message="Please, add your answer" onClose={handleCloseErrorPopup} />
      )}
      {showQuitQuizModal && (
        <QuitQuizModal
          onClose={() => setShowQuitQuizModal(false)}
          onQuit={() => close()}
        // savingResults={savingResults}
        />
      )}
    </div>
  );
};

export default React.memo(QuizLearn);
