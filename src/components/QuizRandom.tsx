import React, { useState, useEffect, useCallback } from 'react';
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
import againIcon from '.././styles/icons8-again-30.png'
import againIconOrange from '.././styles/icons8-again-30 (1).png'

const cloudinary_cloud_name = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const complexOrangeIcon = `https://res.cloudinary.com/${cloudinary_cloud_name}/image/upload/v1721477767/question-5.png.png`;
const complexWhiteIcon = `https://res.cloudinary.com/${cloudinary_cloud_name}/image/upload/v1721477767/question-1.png.png`;
const gotitOrangeIcon = `https://res.cloudinary.com/${cloudinary_cloud_name}/image/upload/v1721477767/question-2.png.png`;
const gotitWhiteIcon = `https://res.cloudinary.com/${cloudinary_cloud_name}/image/upload/v1721477767/question-3.png.png`;
const againOrangeIcon = `https://res.cloudinary.com/${cloudinary_cloud_name}/image/upload/v1721477767/question-6.png.png`;
const againWhiteIcon = `https://res.cloudinary.com/${cloudinary_cloud_name}/image/upload/v1721477767/question-4.png.png`;


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
  nextAppearanceTime?: Date | null;
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

const QuizRandom = ({ darkMode }: any) => {
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
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0);
  const { userInfo } = useAuth();
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [answeredStatus, setAnsweredStatus] = useState<Array<'correct' | 'incorrect' | 'tofill' | null>>(Array(questions.length).fill(null));
  const [confirmedAnswer, setConfirmedAnswer] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [isAnswerMarked, setIsAnswerMarked] = useState<boolean>(false);
  const [activeButton, setActiveButton] = useState<'again' | 'complex' | 'gotit' | null>(null);
  const [hoveredButton, setHoveredButton] = useState<'again' | 'complex' | 'gotit' | null>(null);
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<TimeSpentPerQuestion[]>([]);
  const [savingResults, setSavingResults] = useState(false);
  const [toFillUserAnswers, setToFillUserAnswers] = useState<string[]>([]);
  let [totalQuestionDone, setTotalQuestionDone] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [isHandleConfirm, setIsHandleConfirm] = useState<boolean>(false);
  const [isConfirmedCompleted, setIsConfirmedCompleted] = useState<boolean>(false);
  const [isMarkStatus, setIsMarkStatus] = useState<boolean>(false)
  const [isMarkInStatus, setIsMarkInStatus] = useState<boolean>(false)
  const [isGPTShow, setIsGPTShow] = useState<boolean>(false);
  const [confirmSubjectId, setConfirmSubjectId] = useState<string>("");
  const [confirmChapterId, setConfirmChapterId] = useState<string>("");
  const navigate = useNavigate();

  const handleExpGPT = useCallback(() => {
    setIsGPTShow(prev => !prev);
  }, []);




  const chapterResults: ChapterResult[] = chapters.map((chapter: any) => ({
    chapterId: chapter._id,
    subjectId: chapter.subject_id,
    results_by_question: chapter.questions.map((question: any) => ({
      question_ref: question._id,
      is_completed: answeredQuestions[questions.indexOf(question)],
      is_correct: answeredStatus[questions.indexOf(question)] === 'correct',
      is_not_correct: answeredStatus[questions.indexOf(question)] === 'incorrect',
      to_fill_user_answer: toFillUserAnswers[questions.indexOf(question)] || '',
      time_spent_per_question: timeSpentPerQuestion.find(time => time.questionIndex === questions.indexOf(question))?.time || 0,
    })),
  }));
  const shuffleArray = (array: any) => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const fetchChaptersAndQuestions = async () => {
      try {
        if (chapterIds.length === 0) {
          return;
        }
        const response = await axios.get<Chapter[]>(
          `${SERVER_URL}/getspecific/chapters/${chapterIds.join(',')}/questions`
        );
        const data = response.data;
        const shuffledChapters = shuffleArray(data);
        const processedData = shuffledChapters.map((chapter: any) => ({
          ...chapter,
          results: {
            correctAnswers: 0,
            totalQuestions: chapter.questions.length,
          },
          questions: shuffleArray(chapter.questions).map((question: any) => ({
            ...question,
            answered_status: null,
            subject_id: chapter.subject_id,
          })),
        }));
        const allQuestions = shuffleArray(processedData.flatMap((chapter: { questions: any; }) => chapter.questions));
        setChapters(processedData);
        console.log("allQuestions", allQuestions)
        setQuestions(allQuestions);
        setAnsweredQuestions(new Array(allQuestions.length).fill(false));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchChaptersAndQuestions();
  }, [chapterIds]);


  useEffect(() => {
    if (chaptersParam) {
      const ids = chaptersParam.split(',');
      setChapterIds(ids);
    }
  }, [chaptersParam]);


  useEffect(() => {
    // Reset selected options whenever a new question is loaded
    setSelectedOptions([]);
    setConfirmedAnswer(false);
    setShowResult(null);
  }, [currentQuestionIndex]);

  const handleTimingButtonClick = (timingOption: 'again' | 'complex' | 'gotit') => {
    saveTimeForCurrentQuestion();
    setActiveButton(timingOption);
    const currentTime = new Date();
    let newNextAppearanceTime: Date | null = null;
    switch (timingOption) {
      case 'again':
        newNextAppearanceTime = new Date(currentTime.getTime() + 1 * 60 * 1000); // 1 minute
        break;
      case 'complex':
        newNextAppearanceTime = new Date(currentTime.getTime() + 5 * 60 * 1000); // 5 minutes
        break;
      case 'gotit':
        const randomMinutes = Math.floor(Math.random() * 23 + 8);
        newNextAppearanceTime = new Date(currentTime.getTime() + randomMinutes * 60 * 1000); // randomly, 8-30 minutes
        break;
      default:
        break;
    }
    if (currentQuestionIndex < questions.length) {
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex].nextAppearanceTime = newNextAppearanceTime;
      setQuestions(updatedQuestions);
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowResult(null);
      setConfirmedAnswer(false);
      setActiveButton(null);
    } else {
      const randomizedQuestions = [...questions].sort(() => Math.random() - 0.5);
      setQuestions(randomizedQuestions);
      setAnsweredQuestions(new Array(randomizedQuestions.length).fill(false));
      setCurrentQuestionIndex(0);
    }
  };

  useEffect(() => {
    if (chaptersParam) {
      const ids = chaptersParam.split(',');
      setChapterIds(ids);
    }
  }, [chaptersParam]);

  const handleStartTimer = () => {
    setTimerStarted(true);
    setTimerStartTime(new Date());
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


  const handleConfirm = async () => {
    console.log("GAREEB", { confirmedAnswer, isConfirmedCompleted, isMarkInStatus, isMarkStatus, savingResults });

    // setIsConfirmed(false);
    setIsHandleConfirm(true)
    if (questions[currentQuestionIndex].q_answertype_tofill) {
      console.log("DONT SAVE IT")
      setIsConfirmedCompleted(false);
    }
    console.log("SAVE IT")
    console.log("Confirm click to attempt on question")
    const selectedIds = selectedOptions.map((id) => id.toString());
    const userData: { total_question_done: string } = {
      total_question_done: "SOME_VALUE"
    }
    try {
      await axios.put(`${SERVER_URL}/user/${userInfo?._id}`, userData);
      await axios.post(`${SERVER_URL}/quiz/increment-questions`, {
        user_id: userInfo?._id,
        mode: "random"
      });
      setConfirmSubjectId(questions[currentQuestionIndex]?.subject_id)
      setConfirmSubjectId(questions[currentQuestionIndex]?.chapter_ref)
      await axios.post(`${SERVER_URL}/quiz/${userInfo?._id}/${questions[currentQuestionIndex]?.subject_id}/subject-progress`);
      await axios.post(`${SERVER_URL}/quiz/${userInfo?._id}/${questions[currentQuestionIndex]?.chapter_ref}/chapter-progress`, { mode: "random" });
      fetchUser();
    } catch (error) {
      console.log("error while updating user", error)
    }
    if (answeredQuestions[currentQuestionIndex]) {
      return;
    }
    const isToFillQuestion = questions[currentQuestionIndex].q_answertype_tofill;
    if (isToFillQuestion) {
      const answeredStatus = 'tofill';
      const userAnswer = userAnswers[currentQuestionIndex].trim();
      setUserAnswers((prevUserAnswers) => {
        const updatedUserAnswers = [...prevUserAnswers];
        updatedUserAnswers[currentQuestionIndex] = userAnswer;
        return updatedUserAnswers;
      });
      setConfirmedAnswer(true);
      setUserAnswers((prevUserAnswers) => {
        const updatedUserAnswers = [...prevUserAnswers];
        updatedUserAnswers[currentQuestionIndex] = userAnswer;
        return updatedUserAnswers;
      });
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
      // setShowResult(true);
      setIsAnswerMarked(false);
      return;
    }
    const correctIds = questions[currentQuestionIndex].q_answertype_options
      .filter((option:any) => option.is_correct)
      .map((option:any) => option._id.toString());
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
    setShowResult(true);
    setConfirmedAnswer(true);
    if (isCorrect) {
      try {
        await axios.post(`${SERVER_URL}/quiz/increment-questions/correct`, {
          user_id: userInfo?._id,
          mode: "random"
        })
      } catch (error) {
        console.error("Error saving the correct question count", error);
      }
      setCorrectAnswersCount((prevCount) => prevCount + 1);
    } else {
      setIncorrectAnswersCount((prevCount) => prevCount + 1);
    }
    setAnsweredQuestions((prev) => {
      const newAnsweredQuestions = [...prev];
      newAnsweredQuestions[currentQuestionIndex] = true;
      return newAnsweredQuestions;
    });
    // setIsConfirmed(true);
    setIsHandleConfirm(false)
    setIsConfirmedCompleted(true);
    // setIsHandleConfirm(false)

  };
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleConfirm();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleConfirm]);

  const handleMarkAsCorrect = () => {
    setIsMarkStatus(true);
    if (confirmedAnswer && !isAnswerMarked && questions[currentQuestionIndex].q_answertype_tofill) {
      setAnsweredStatus((prevStatus) => {
        const newStatus = [...prevStatus];
        newStatus[currentQuestionIndex] = 'correct';
        return newStatus;
      });
      setShowResult(true);

      // setIsConfirmedCompleted(false);
      // setIsAnswerMarked(true);
      // setCorrectAnswersCount((prevCount) => prevCount + 1);
      // setAnsweredQuestions((prev) => {
      //   const newAnsweredQuestions = [...prev];
      //   newAnsweredQuestions[currentQuestionIndex] = true;
      //   return newAnsweredQuestions;
      // });
    }
  };

  const handleMarkAsNotCorrect = () => {
    setIsMarkInStatus(true);
    if (confirmedAnswer && !isAnswerMarked && questions[currentQuestionIndex].q_answertype_tofill) {
      setAnsweredStatus((prevStatus) => {
        const newStatus = [...prevStatus];
        newStatus[currentQuestionIndex] = 'incorrect';
        return newStatus;
      });
      setShowResult(true);

      // setIsConfirmedCompleted(false);
      // setIsAnswerMarked(true);
      // setIncorrectAnswersCount((prevCount) => prevCount + 1);
      // setAnsweredQuestions((prev) => {
      //   const newAnsweredQuestions = [...prev];
      //   newAnsweredQuestions[currentQuestionIndex] = true;
      //   return newAnsweredQuestions;
      // });
    }
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
  // New function to update the correct count in the backend based on the quiz attempt
  const updateCorrectCount = async (userId: any, chapterId: any, correctAnswersCount: any, questionId: string) => {
    console.log("chapterIdchapterId", { userId, chapterId, correctAnswersCount });
    try {
      await axios.post(`${SERVER_URL}/quiz/increment-questions/correct`, {
        user_id: userId,
        mode: 'random',
        correct_answers_count: correctAnswersCount,
        chapter_id: chapterId,
        question_id: questionId, // Send question_id only for random mode
      });
    } catch (error) {
      console.error("Error updating the correct question count:", error);
    }
  };
  const saveQuizResults = async () => {
    setSavingResults(true);

    const totalTimeSpent = timeSpentPerQuestion.reduce((acc, time) => acc + time.time, 0);
    try {
      if (confirmSubjectId ) {
        await axios.post(`${SERVER_URL}/quiz/${userInfo?._id}/${confirmSubjectId}/subject-time-spent`, { time_spent: formatTime(totalSeconds), mode: "random" });
      }
      if (confirmChapterId) {
        await axios.post(`${SERVER_URL}/quiz/${userInfo?._id}/${confirmChapterId}/chapter-time-spent`, { time_spent: formatTime(totalSeconds), mode: "random" });
      }
      const formattedTotalTimeSpent = new Date(totalTimeSpent * 1000).toISOString().substr(11, 8);
      console.log("formattedTotalTimeSpent", formatTime(totalSeconds));
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
          done_by_mode: "random"
        })),
      }));
      if (resultsByChapter.length === 0) {
        console.log("No chapters results available")
        throw new Error('No chapter results available');
      }
      const chapterId = chapterResults[0]?.chapterId;
      const requestBody = {
        userId: userInfo?._id,
        chapterId,
        quiz_mode: 'random',
        // total_time_spent: formattedTotalTimeSpent,
        total_time_spent: formatTime(totalSeconds),
        results_by_chapter: resultsByChapter,
        correct_answers_count: correctAnswersCount,
        incorrect_answers_count: incorrectAnswersCount,
      };
      await axios.post(`${SERVER_URL}/quiz/${userInfo?._id}/${chapterId}/results`, requestBody);
      for (const chapterResult of resultsByChapter) {
        const chapterId = chapterResult.chapter_ref;
        for (const question of chapterResult.results_by_question) {
          if (question.is_correct) {
            const questionId = question.question_ref; // Extract the question ID
            const correctAnswersCountForQuestion = 1; // Since the question is correct
            await updateCorrectCount(userInfo?._id, chapterId, correctAnswersCountForQuestion, questionId);
          }
        }
      }
      setSavingResults(false);
      setShowQuitQuizModal(false);
      setAnsweredStatus([]);
    } catch (error) {
      // console.error('Failed to save quiz results:', error);
      setSavingResults(false);
      setIsMarkStatus(false);
      setIsMarkInStatus(false);
      setIsConfirmedCompleted(false);
    } finally {
      // setIsConfirmed(false);\
      setSavingResults(false);
      setIsMarkStatus(false);
      setIsMarkInStatus(false);
      setIsConfirmedCompleted(false);
    }
  };

  const c = async () => {
    await saveQuizResults();

  }
  const incrementCorrectCount = async () => {
    try {
      await axios.post(`${SERVER_URL}/quiz/increment-questions/correct`, {
        user_id: userInfo?._id,
        mode: "random"
      })
    } catch (error) {
      console.error("Error saving the correct question count", error);
    }
  }

  const close = async () => {
    // window.location.href = '/home';
    navigate('/home')
    // try {
    //  await axios.post(`${SERVER_URL}/quiz/${userInfo?._id}/${subjectId}/subject-time-spent`, { time_spent: formatTime(totalSeconds), mode: "random" });
    // } catch (error) {
    //   console.log("ERROR");
    // } finally {
    // }
  }
  useEffect(() => {
    if (isMarkStatus) {
      // setIsMarkStatus(true);
      // incrementCorrectCount();
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
      console.log("Coming to call the C()", { isMarkStatus })
      c();

      setIsHandleConfirm(false)
    }
  }, [isConfirmedCompleted, isMarkStatus, isMarkInStatus])



  const renderExplanation = () => {
    const question = questions[currentQuestionIndex];
    if (!confirmedAnswer) return null;
    const explanation = showResult && question.q_latex_explanation;
    return explanation ? renderLatex(explanation) : null;
  };

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



  const handleCloseErrorPopup = () => {
    setShowErrorPopup(false);
  };



  return (
    <div style={{ position: 'relative', marginBottom: "20px" }}>
      <div
        className={`bg-transparent rounded p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}
        style={{ maxWidth: '1200px', minWidth: "350px", margin: '0 auto', marginTop: '10px' }}
      >
        {timerStarted && questions.length > 0 && (
          <div className="flex flex-row justify-between mb-4 top-0 right-0">
            <div className="counters flex flex-row space-x-8 ml-6">
              <div className="counter flex items-center text-green-500 font-bold">
                <div className={`counter-value ${correctAnswersCount > 0 ? 'bg-teal-500' : 'border border-green-500'} rounded-full flex items-center justify-center w-6 h-6`}>
                  {correctAnswersCount > 0 && <span className="text-white font-bold">&#10003;</span>}
                </div>
                <span className="ml-2">{correctAnswersCount}</span>
              </div>
              <div className="counter flex items-center text-red-500 font-bold">
                <div className={`counter-value ${incorrectAnswersCount > 0 ? 'bg-rose-500' : 'border border-red-500'} rounded-full flex items-center justify-center w-6 h-6`}>
                  {incorrectAnswersCount > 0 && <span className="text-white font-bold">&#10007;</span>}
                </div>
                <span className="ml-2">{incorrectAnswersCount}</span>
              </div>
            </div>
            <Timer autoStart={timerStarted} totalSeconds={totalSeconds} setTotalSeconds={setTotalSeconds} />
            <button className="w-[24px] ml-10"
              onClick={() => setShowQuitQuizModal(true)}>
              <img width="24" height="24" src="https://img.icons8.com/external-tal-revivo-light-tal-revivo/24/FF9934/external-online-account-logout-with-arrow-direction-mark-login-light-tal-revivo.png" alt="Quit" />
            </button>
          </div>
        )}
        {!timerStarted && (
          <div className="flex items-start justify-center">
            <div className="w-1/2 min-w-[350px] shadow-lg h-1/2 bg-transparent dark:bg-gray-800 p-6 rounded-lg inline-block">
              <h1 className="text-2xl mb-2 text-customColor font-bold">Random</h1>
              <div className="bottom-full left-0 p-2 rounded border border-gray-500 z-50 mb-2 text-gray-500 mt-4">
                Questions appear randomly and reappear indefinitely.
                <br />
                <br />Choose when a question reappears:
                <br />- Again: after 1 minute
                <br />- Complex: after 5 minutes
                <br />- Got it: after more than 8 minutes
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
          <>

            <div key={questions[currentQuestionIndex]._id} className="bg-transparent dark:bg-gray-800 dark:text-gray-300 p-4 rounded-lg shadow-lg mt-4">

              <div className="border border-customColor rounded-lg overflow-hidden">
                {questions[currentQuestionIndex].q_image_url && (
                  <img
                    src={questions[currentQuestionIndex].q_image_url}
                    alt={`Question ${currentQuestionIndex + 1}`}
                    className="h-auto max-h-[300px] w-auto rounded ml-4 mt-4 md:order-last"
                  />

                )}
                <h2 className="text-md font-serif mb-4 p-4 rounded border-b border-customColor">
                  {renderLatex(questions[currentQuestionIndex].q_latex_content)}
                </h2>
                <div className="flex flex-col p-4">
                  {questions[currentQuestionIndex].q_answertype_tofill ? (
                    <>
                      <p className="p-2 resize-none text-base bg-transparent">Your answer:</p>
                      <textarea
                        className="answer-textarea text-black font-serif p-4"
                        onChange={handleUserAnswerChange}
                      ></textarea>
                      {confirmedAnswer && !isAnswerMarked && (
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
                      {
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {questions[currentQuestionIndex].q_answertype_options.map(
                            (option:any) =>
                              option.latex_content.trim() !== '' && (
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
                                    className="mr-3 mt-1 cursor-pointer"
                                  />
                                  <label
                                    htmlFor={option._id}
                                    className={`flex-1 text-base font-serif cursor-pointer ${answeredStatus[currentQuestionIndex] === 'correct' && option.is_correct
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
                                      {option.latex_content.trim() !== '' && renderLatex(option.latex_content)}
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

                      }
                      <div className="flex items-center justify-center mt-4 mb-2">
                        {showResult !== null && (
                          <p className={`font-bold text-${showResult ? 'teal' : 'rose'}-500 py-2 px-4`}>
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
                      <p className={`${darkMode ? "text-gray-200" : "text-gray-700"} text-sm`}>See AI generated explanation</p>
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
          </>
        )}
      </div>
      <div className="flex flex-row sm:space-x-6 space-x-2 justify-center items-center">
        {timerStarted && showResult == null && !answeredQuestions[currentQuestionIndex] && (
          <button className={`btn btn-orange ${isConfirmedCompleted ? "hidden" : "visible"}`} onClick={handleConfirm}
            disabled={isConfirmedCompleted}>
            {isConfirmedCompleted ? "Saving..." : "Confirm"}
          </button>
        )}
        {
          (isConfirmedCompleted || isMarkInStatus || isMarkStatus) && (
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-400"></div>
            </div>
          )
        }
        {confirmedAnswer && !isConfirmedCompleted && !isMarkInStatus && !isMarkStatus && !savingResults && !isHandleConfirm && (
          <>
            <button
              onMouseEnter={() => setHoveredButton('again')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleTimingButtonClick('again')}
              className={`px-2 py-1 rounded border flex flex-row items-center justify-center space-x-2 min-w-[100px] h-10 ${activeButton === 'again' ? 'bg-customColor text-white' : 'border-customColor text-customColor hover:bg-customColor hover:text-white'
                }`}
            >
              {/* Display White Icon on Hover, Orange Icon Otherwise */}
              {hoveredButton === 'again' ? (
                <img src={againIcon} alt="again" width={18} />
              ) : (
                <img src={againIconOrange} alt="again" width={18} />
              )}
              <span>Again</span>
            </button>

            <button
              onClick={() => handleTimingButtonClick('complex')}
              className={`px-2 py-1 rounded border flex flex-row items-center justify-center space-x-2 min-w-[120px] h-10 ${activeButton === 'complex' ? 'bg-customColor text-white' : 'border-customColor text-customColor hover:bg-customColor hover:text-white'
                }`}
            >
              {/* Improved Complex SVG Icon */}
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2l2 7h8l-6 4 2 7-6-4-6 4 2-7-6-4h8z" />
              </svg>
              <span>Complex</span>
            </button>

            <button
              onClick={() => handleTimingButtonClick('gotit')}
              className={`px-2 py-1 rounded border flex flex-row items-center justify-center space-x-2 min-w-[100px] h-10 ${activeButton === 'gotit' ? 'bg-customColor text-white' : 'border-customColor text-customColor hover:bg-customColor hover:text-white'
                }`}
            >
              {/* Improved Got it SVG Icon */}
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6l-11 11-5-5" />
              </svg>
              <span>Got it</span>
            </button>
          </>
        )}

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

export default QuizRandom;
