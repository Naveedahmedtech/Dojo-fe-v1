import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { SERVER_URL } from '../../api';
import Countdown from './Countdown';
import 'katex/dist/katex.min.css';
import renderLatex from '../utils/renderLatex';
import QuitQuizModal from './QuitQuizModal';
import Popup from './Popup';
import useDarkMode from '../hooks/useDarkMode';
import ExamSettings from './ExamSettings';
import ExamResultModal from './ExamResultModal';
import { useAuth } from '../context/AuthProvider';
import { useExamContext } from '../context/ExamProvider';
import TimerControls from './exam/quiz/TimerControls';
import QuestionNavigation from './exam/quiz/QuestionNavigation';
import QuestionDisplay from './exam/quiz/QuestionDisplay';
import QuestionResult from './modified-design/components/TeacherDashboard/examGrades/QuestionResult';
import SubjectsResults from './modified-design/components/TeacherDashboard/examGrades/SubjectsResults';
import SubjectsGrid from './modified-design/components/TeacherDashboard/examGrades/SubjectsGrid';
import GradeDisplay from './modified-design/components/TeacherDashboard/examGrades/GradeDisplay';
import { string } from 'prop-types';


interface Chapter {
  time: number;
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
  subjectName: string;
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
  question: string;
  correctAnswer: string;
  userInput: string;
  selectedOptions: string[];
  explanation: string;
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
  results_by_question: {
    question_ref: string;
    is_completed: boolean;
    is_correct: boolean;
    is_not_correct: boolean;
    time_spent_per_question: number | null;
  }[];
}

const QuizExam = ({ darkMode }: any) => {
  const { userInfo } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const chaptersParam = searchParams.get('chapters');
  const initialChapterIds = chaptersParam ? chaptersParam.split(',') : [];
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [, _setTotalTimeSpent] = useState<number>(0);
  const [answeredStatus, setAnsweredStatus] = useState<Array<'correct' | 'incorrect' | 'tofill' | null>>(Array(questions.length).fill(null));
  const [selectedOptions, setSelectedOptions] = useState<string[][]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [confirmedAnswer, setConfirmedAnswer] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeQuestionRef = useRef<HTMLDivElement | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [isDarkMode] = useDarkMode();
  const [showQuitQuizModal, setShowQuitQuizModal] = useState(false);
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [, setIncorrectAnswersCount] = useState<number>(0);
  const [savingResults, setSavingResults] = useState(false);
  const [timeSpentPerQuestion,] = useState<TimeSpentPerQuestion[]>([]);
  const [showQuizResultModal, setShowQuizResultModal] = useState(false);
  const { timerDuration, setTimerDuration, questionsPerChapter, setQuestionsPerChapter, timePerSubject, setTimePerSubject } = useExamContext();
  const [totalTime, setTotalTime] = useState(0);
  const [timerKey,] = useState<number>(Date.now());
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(timerDuration);
  const [toFillUserAnswers, setToFillUserAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const chapterResults: ChapterResult[] = chapters.map(chapter => ({
    chapterId: chapter._id,
    results_by_question: chapter.questions.map(question => ({
      question_ref: question._id,
      is_completed: answeredQuestions[questions.indexOf(question)],
      is_correct: answeredStatus[questions.indexOf(question)] === 'correct',
      is_not_correct: answeredStatus[questions.indexOf(question)] === 'incorrect',
      to_fill_user_answer: toFillUserAnswers[questions.indexOf(question)] || '',
      time_spent_per_question: timeSpentPerQuestion.find(time => time.questionIndex === questions.indexOf(question))?.time || 0,
    })),
  }));
  const subjectsResultsRef = useRef<any>();
  const [modalData, setModalData] = useState<{ selected_options: string[]; }>({ selected_options: [] });
  const [, setSubjectTimers] = useState<{ [subjectId: string]: number }>({});
  const [finishQuiz, setFinishQuiz] = useState(false);
  const [isFetchingResults, setFetchingResults] = useState(false);
  const [isConfriming, setIsConfirming] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(totalTime * 60);
  const [presentChapterIds, setPresentChapterIds] = useState<string[]>([]);
  const [dataLengths, setDataLengths] = useState<{ chapterQuestionsCount: string[], subjectQuestionsCount: string[] }>({ chapterQuestionsCount: [], subjectQuestionsCount: [] })


  useEffect(() => {
    scrollToActiveQuestion();
  }, [currentQuestionIndex]);

  const scrollToActiveQuestion = () => {
    if (scrollContainerRef.current) {
      const activeQuestionElement = scrollContainerRef.current.querySelector('.active-question');
      if (activeQuestionElement) {
        const containerRect = scrollContainerRef.current.getBoundingClientRect();
        const elementRect = activeQuestionElement.getBoundingClientRect();
        const scrollLeft = elementRect.left - containerRect.left - (containerRect.width - elementRect.width) / 2;
        scrollContainerRef.current.scrollBy({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  };

  const fetchResults = async () => {
    setFetchingResults(true);
    try {
      const response = await axios(`${SERVER_URL}/quiz/${userInfo?._id}/exam-results/${initialChapterIds.join(',')}`);
      console.log("RESULT", { response: response?.data, initialChapterIds });

      // Flatten the chapters from all subjects into a single array
      const allChapters = response?.data?.flatMap((subject: any) => subject.chapters || []);

      // Find all chapter IDs that are present in the response
      const presentIds = initialChapterIds.filter(id =>
        allChapters.some((chapter: any) => chapter.id === id)
      );

      // Check if all initialChapterIds are present in the flattened chapters array
      const allChapterIdsPresent = initialChapterIds.every(id =>
        allChapters.some((chapter: any) => chapter.id === id)
      );

      if (allChapterIdsPresent) {
        setResults(response?.data);
      } else {
        console.log("Not all initialChapterIds are present in the response");
      }

      // Save the IDs that are present in the response to state
      setPresentChapterIds(presentIds);
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setFinishQuiz(false);
      setFetchingResults(false);
    }
  };


  // useEffect(() => {
  //   if (userInfo?._id) {
  //     fetchResults()
  //   }
  // }, [userInfo?._id]);

  useEffect(() => {
    if (showQuizResultModal) {
      setIsTimerRunning(false);
    }
  }, [showQuizResultModal]);


  const handleTimerUpdate = (time: number) => {
    setTimeLeft(time);
  };

  useEffect(() => {
    if (activeQuestionRef.current) {
      activeQuestionRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    setSubjectTimers(Object.keys(timePerSubject).reduce((acc, subjectId) => {
      acc[subjectId] = timePerSubject[subjectId];
      return acc;
    }, {} as { [subjectId: string]: number }));
  }, [timePerSubject]);

  useEffect(() => {
    const fetchChaptersAndQuestions = async () => {
      if (!isFetchingResults) {
        try {
          let chpIds = initialChapterIds;
          if (chpIds.length === 0) {
            return;
          }
          if (presentChapterIds) {
            chpIds = initialChapterIds.filter(id => !presentChapterIds.includes(id));
          }

          // If there are no missing chapters, return early
          if (chpIds.length === 0) {
            return;
          }

          const response = await axios.get<Chapter[]>(`${SERVER_URL}/getspecific/chapters/${chpIds.join(',')}/questions/exam`);
          const data = response.data;

          // Create a mapping of subject and chapter question counts
          const subjectQuestionsCount: any = {};

          data.forEach((chapter: any) => {
            // Count questions per subject
            if (subjectQuestionsCount[chapter.subject_id]) {
              subjectQuestionsCount[chapter.subject_id] += chapter.questions.length;
            } else {
              subjectQuestionsCount[chapter.subject_id] = chapter.questions.length;
            }
          });

          // console.log("subjectQuestionsCount", subjectQuestionsCount)


          // Sort subjects by the number of questions (ascending order)
          const sortedSubjectIds = Object.keys(subjectQuestionsCount).sort((a, b) => {
            return subjectQuestionsCount[a] - subjectQuestionsCount[b];
          });




          // ***
          const chapterQuestionsCount: any = [];
          const subjectQuestionsCounts: any = [];

          // Loop through the data to get chapter and subject IDs
          data.forEach((subjectData: any) => {
            const subjectId = subjectData.subject_id;
            const subjectQuestions = subjectData.questions.length;

            // Add subject ID based on the number of questions
            subjectQuestionsCounts[subjectId] = subjectQuestions;

            // Add chapter IDs and count questions for each chapter
            const chapters = new Set();
            subjectData.questions.forEach((question: any) => {
              const chapterId: any = question.chapter_ref;
              chapters.add(chapterId);

              // Update the chapter count if it doesn't exist or increment if it does
              if (!chapterQuestionsCount[chapterId]) {
                chapterQuestionsCount[chapterId] = 1; // Start counting from 1
              } else {
                chapterQuestionsCount[chapterId] += 1; // Increment the count
              }
            });
          });

          // Set the state with the arrays of chapter and subject question counts
          setDataLengths({
            chapterQuestionsCount,
            subjectQuestionsCount: subjectQuestionsCounts
          });

          // Reorganize the data based on sorted subjects
          const filteredData = sortedSubjectIds.flatMap(subjectId => {
            return data
              .filter((chapter: any) => chapter.subject_id === subjectId)
              .map((chapter: any) => ({
                ...chapter,
                questions: chapter.questions.slice(0, questionsPerChapter[chapter._id] || chapter.questions.length)
                  .map((question: any) => ({
                    ...question,
                    subject_id: chapter.subject_id
                  }))
              }));
          });

          console.log("filteredData", { filteredData })


          const allQuestions = filteredData.flatMap(chapter => chapter.questions);
          setChapters(filteredData);
          setQuestions(allQuestions);
          setAnsweredQuestions(new Array(allQuestions.length).fill(false));

          const subjects = filteredData.reduce<{ [subjectId: string]: { subjectName: string, chapters: Chapter[] } }>((acc, chapter) => {
            const subjectId = chapter.subject_ref;
            if (!acc[subjectId]) {
              acc[subjectId] = {
                subjectName: chapter.subjectName,
                chapters: []
              };
            }
            acc[subjectId].chapters.push(chapter);
            return acc;
          }, {});

          const timePerSubject = Object.keys(subjects).reduce<{ [subjectId: string]: number }>((acc, subjectId) => {
            const totalTimeForSubject = subjects[subjectId].chapters.reduce((totalTime, chapter) => {
              return totalTime + (chapter.time || 0);
            }, 0);
            acc[subjectId] = totalTimeForSubject;
            return acc;
          }, {});

          setTimePerSubject(timePerSubject);

        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };


    fetchChaptersAndQuestions();
  }, [JSON.stringify(initialChapterIds), JSON.stringify(questionsPerChapter), presentChapterIds, isFetchingResults]);
  function formatSecondsToHHMMSS(seconds: any) {
    // Calculate hours, minutes, and remaining seconds
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    // Format the time components to ensure two digits
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  let countConfirmClick = 0;
  const handleConfirm = async (subject_id: string) => {
    console.log("subject_id", subject_id)
    countConfirmClick += 1;
    const hasMultipleCorrectAnswers = questions[currentQuestionIndex].q_answertype_options_has_multiple_good_answers;

    // const userData: { total_question_done: number | string } = {
    //   total_question_done: "SOME_VALUE",
    // };
    const isToFillQuestion = questions[currentQuestionIndex].q_answertype_tofill;
    const time_spent = calculateTimeDifference(totalTime, secondsLeft)
    let isCorrect: any;

    if (isToFillQuestion) {
      const userAnswer = userAnswers[currentQuestionIndex]?.trim() || '';
      const answeredStatus = 'tofill';

      setUserAnswers((prevUserAnswers) => {
        const updatedUserAnswers = [...prevUserAnswers];
        updatedUserAnswers[currentQuestionIndex] = userAnswer; // Update the existing answer
        return updatedUserAnswers;
      });

      setToFillUserAnswers((prevToFillAnswers) => {
        const updatedToFillAnswers = [...prevToFillAnswers];
        updatedToFillAnswers[currentQuestionIndex] = userAnswer; // Update the existing answer
        return updatedToFillAnswers;
      });

      setAnsweredStatus((prevStatus) => {
        const newStatus = [...prevStatus];
        newStatus[currentQuestionIndex] = answeredStatus; // Update the status
        return newStatus;
      });

      setConfirmedAnswer(true);
    } else {
      if (hasMultipleCorrectAnswers) {
        const selectedIds = selectedOptions.filter(Boolean).map(id => id.toString().split(',')).flat();

        const correctIds = questions[currentQuestionIndex].q_answertype_options
          .filter((option: any) => option.is_correct)
          .map((option: any) => option._id.toString());

        const allCorrectlySelected = correctIds.every((id: any) => selectedIds.includes(id));

        isCorrect = allCorrectlySelected;

        console.log("MULTIPLE", { correctIds, selectedIds, isCorrect })
      } else {
        // Handle the case where only one correct answer is possible
        const selectedIds = selectedOptions
          .filter(Boolean) // Filter out any falsy values like null, undefined, etc.
          .map(id => id.toString()); // Convert each selected option to a string

        console.log({ selectedIds });

        const correctIds = questions[currentQuestionIndex].q_answertype_options
          .filter((option:any) => option.is_correct) // Filter to get the correct option
          .map((option: any) => option._id.toString()); // Map the correct option to its ID as a string

        // Check if the selected option matches the correct answer
        const allCorrectlySelected = correctIds.every((id: any) => selectedIds.includes(id));

        // Set isCorrect based on whether the correct answer is selected
        isCorrect = allCorrectlySelected;

        console.log("sdfsdf", { correctIds, selectedIds, isCorrect, allCorrectlySelected });
      }


      const answeredStatus = isCorrect ? 'correct' : 'incorrect';

      setUserAnswers((prevUserAnswers) => {
        const updatedUserAnswers = [...prevUserAnswers];
        updatedUserAnswers[currentQuestionIndex] = selectedOptions.join(','); // Update the existing answer
        return updatedUserAnswers;
      });

      setAnsweredStatus((prevStatus) => {
        const newStatus = [...prevStatus];
        newStatus[currentQuestionIndex] = answeredStatus; // Update the status
        return newStatus;
      });

      setConfirmedAnswer(true);

      // Update correct or incorrect answer counts
      if (isCorrect) {
        setCorrectAnswersCount((prevCount) => prevCount + 1);
      } else {
        setIncorrectAnswersCount((prevCount) => prevCount + 1);
      }
    }

    setAnsweredQuestions((prev) => {
      const newAnsweredQuestions = [...prev];
      newAnsweredQuestions[currentQuestionIndex] = true; // Mark question as answered
      return newAnsweredQuestions;
    });

    // console.log({ countConfirmClick, userAnswers });

    setModalData((prevModalData) => ({
      ...prevModalData,
      selected_options: selectedOptions.flat(),
    }));
  };


  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log(event.target.value)
    const optionId = event.target.value;
    setSelectedOptions((prevOptions) => {
      const updatedOptions = [...prevOptions];

      if (!questions[currentQuestionIndex].q_answertype_tofill) {
        if (questions[currentQuestionIndex].q_answertype_options_has_multiple_good_answers) {
          const questionIndex = currentQuestionIndex;

          if (updatedOptions[questionIndex]?.includes(optionId)) {
            updatedOptions[questionIndex] = updatedOptions[questionIndex].filter(id => id !== optionId);
          } else {
            updatedOptions[questionIndex] = [...(updatedOptions[questionIndex] || []), optionId];
          }
        } else {
          updatedOptions[currentQuestionIndex] = [optionId];
        }

        return updatedOptions;
      }

      return prevOptions;
    });
  };

  const handleUserAnswerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setUserAnswers((prevUserAnswers) => {
      const newUserAnswers = [...prevUserAnswers];
      newUserAnswers[currentQuestionIndex] = value;
      return newUserAnswers;
    });
  };
  function calculateTimeDifference(totalTimeMinutes: any, durationSeconds: any) {
    // Convert total time from minutes to seconds
    const totalTimeSeconds = totalTimeMinutes * 60;

    // Calculate the difference in seconds
    const differenceInSeconds = totalTimeSeconds - durationSeconds;

    // Ensure the difference is not negative
    const nonNegativeDifference = Math.max(0, differenceInSeconds);

    // Convert the difference back to HH:MM:SS format
    return formatSecondsToHHMMSS(nonNegativeDifference);
  }


  const incrementCorrectCount = async () => {
    try {
      await axios.post(`${SERVER_URL}/quiz/increment-questions/correct`, {
        user_id: userInfo?._id,
        mode: "exam"
      })
    } catch (error) {
      console.error("Error saving the correct question count", error);
    }
  }

  const saveProgress = async (timeSpent: any) => {
    try {
      // Save progress for each chapter
      for (const chapterId in dataLengths?.chapterQuestionsCount) {
        const questionsDone = Number(dataLengths?.chapterQuestionsCount[chapterId]);

        // Call the chapter API as many times as the number of questions done for that chapter
        for (let i = 0; i < questionsDone; i++) {
          await axios.post(`${SERVER_URL}/quiz/${userInfo?._id}/${chapterId}/chapter-progress`, {
            mode: "exam",
          });
          console.log(`Chapter progress saved for chapter ${chapterId}, call ${i + 1}`);
        }
      }

      // Save progress for each subject
      for (const subjectId in dataLengths?.subjectQuestionsCount) {
        const questionsDone = Number(dataLengths?.subjectQuestionsCount[subjectId]);

        // Call the subject API as many times as the number of questions done for that subject
        for (let i = 0; i < questionsDone; i++) {
          await axios.post(`${SERVER_URL}/quiz/${userInfo?._id}/${subjectId}/subject-progress`);
          console.log(`Subject progress and time spent saved for subject ${subjectId}, call ${i + 1}`);
        }
      }

      console.log("All progress saved for chapters and subjects.");
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };


  // New function to update the correct count in the backend based on the quiz attempt
  const updateCorrectCount = async (userId: any, chapterId: any, correctAnswersCount: any) => {
    try {
      await axios.post(`${SERVER_URL}/quiz/increment-questions/correct`, {
        user_id: userId,
        mode: 'exam',
        correct_answers_count: correctAnswersCount,
        chapter_id: chapterId
      });
    } catch (error) {
      console.error("Error updating the correct question count:", error);
    }
  };


  const saveQuizResults = async () => {
    const time_spent = calculateTimeDifference(totalTime, secondsLeft)
    setSavingResults(true);

    try {
      // Mark unanswered questions as incorrect
      const updatedAnsweredStatus = [...answeredStatus];
      const updatedUserAnswers = [...userAnswers];
      const updatedToFillUserAnswers = [...toFillUserAnswers];

      answeredQuestions.forEach((answered, index) => {
        if (!answered) {
          // Mark unanswered question as incorrect
          updatedAnsweredStatus[index] = 'incorrect';
          updatedUserAnswers[index] = ''; // Assuming no answer for unanswered questions
          updatedToFillUserAnswers[index] = ''; // Assuming no answer for unanswered questions
        }
      });
      // Update any undefined statuses to 'incorrect'
      updatedAnsweredStatus.forEach((status, index) => {
        if (status === undefined) {
          updatedAnsweredStatus[index] = 'incorrect';
        }
      });

      saveProgress(time_spent);
      try {
        // Loop through the chapters
        for (const chapter of chapterResults) {
          // Loop through the questions in the results_by_question array
          for (const question of chapter.results_by_question) {
            const userData: { total_question_done: number | string } = {
              total_question_done: "SOME_VALUE",  // Adjust as per your logic
            };

            // Call the API for each question
            await axios.put(`${SERVER_URL}/user/${userInfo?._id}`, userData);
            await axios.post(`${SERVER_URL}/quiz/increment-questions`, {
              user_id: userInfo?._id,
              mode: "exam"
            });

            console.log(`Updated question ${question.question_ref}`);
          }
        }
      } catch (error) {
        console.error("Error updating user questions:", error);
      }
      setAnsweredStatus(updatedAnsweredStatus);
      setUserAnswers(updatedUserAnswers);
      setToFillUserAnswers(updatedToFillUserAnswers);

      const totalTimeSpent = timeSpentPerQuestion.reduce((acc, time) => acc + time.time, 0);
      const formattedTotalTimeSpent = new Date(totalTimeSpent * 1000).toISOString().substr(11, 8);
      const correctAnswersCount = updatedAnsweredStatus.filter(status => status === 'correct').length;
      const incorrectAnswersCount = updatedAnsweredStatus.filter(status => status === 'incorrect').length;


      const resultsByChapter = chapterResults.map(chapterResult => ({
        chapter_ref: chapterResult.chapterId,
        results_by_question: chapterResult.results_by_question.map(result => ({
          question_ref: result.question_ref,
          is_exam_correct_answers: updatedAnsweredStatus[questions.findIndex(q => q._id === result.question_ref)] === 'correct',
          is_exam_incorrect_answers: updatedAnsweredStatus[questions.findIndex(q => q._id === result.question_ref)] === 'incorrect',
          exam_fill_user_answer: updatedToFillUserAnswers[questions.findIndex(q => q._id === result.question_ref)] || '',
          time_spent_per_question: timeSpentPerQuestion.find(time => time.questionIndex === questions.findIndex(q => q._id === result.question_ref))?.time || 0,
        })),
      }));

      if (resultsByChapter.length === 0) {
        throw new Error('No chapter results available');
      }

      const chapterId = chapterResults[0]?.chapterId;
      const requestBody = {
        userId: userInfo?._id,
        chapterId,
        quiz_mode: 'exam',
        total_time_spent: time_spent,
        results_by_chapter: resultsByChapter,
        exam_correct_answers_count: correctAnswersCount,
        exam_incorrect_answers_count: incorrectAnswersCount,
        answer_by_exam_mode: 'exam',
      };

      const response = await axios.post(`${SERVER_URL}/quiz/${userInfo?._id}/${chapterId}/results`, requestBody);
      setSavingResults(false);
      setShowQuitQuizModal(false);
      setFinishQuiz(true);
      if (userInfo?._id) {
        fetchResults()
      }
      for (const chapterResult of resultsByChapter) {
        const chapterId = chapterResult.chapter_ref;
        const correctAnswersCountForChapter = chapterResult.results_by_question.filter(result => result.is_exam_correct_answers).length;
        await updateCorrectCount(userInfo?._id, chapterId, correctAnswersCountForChapter);
      }
    } catch (error) {
      setSavingResults(false);
    }
  };


  const goToNextQuestion = () => {
    if (questions.length > 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setConfirmedAnswer(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        // handleConfirm();
      } else if (event.key === 'ArrowRight') {
        goToNextQuestion();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleConfirm, goToNextQuestion]);

  const startExam = () => {
    setExamStarted(true);
    setIsTimerRunning(true);
  };

  const handleTotalTimeChange = (newTotalTime: number) => {
    setTotalTime(newTotalTime);
  };


  const handleCloseErrorPopup = () => {
    setShowErrorPopup(false);
  };

  const handleFinish = () => {
    setShowQuizResultModal(true);
  };

  // const handleCloseResultModal = () => {
  //   setShowQuizResultModal(false);
  //   window.location.href = '/home';
  // };

  const calculateGrade = (): number => {
    const totalQuestions = chapters.flatMap(chapter => chapter.questions).length;
    const percentage = totalQuestions ? ((correctAnswersCount) / totalQuestions) * 100 : 0;
    return percentage;
  };



  return (
    <div style={{ position: 'relative' }}>
      {
        isFetchingResults ? (<>
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-400"></div>
          </div>
        </>) : results?.length === 0 ? (

          <div className={`bg-transparent rounded p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`} style={{ maxWidth: '1200px', minWidth: "320px", margin: '0 auto', marginTop: '10px' }}>
            <div className={`bg-transparent rounded p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`} style={{ minWidth: "400px", margin: '0 auto', marginTop: '10px' }}>
              <div className={`quiz-exam ${isDarkMode ? 'dark' : ''}`}>
                {!examStarted && (
                  <ExamSettings
                    questionsPerChapter={questionsPerChapter}
                    setQuestionsPerChapter={setQuestionsPerChapter}
                    timePerSubject={timePerSubject}
                    setTimePerSubject={setTimePerSubject}
                    totalTime={totalTime}
                    setTotalTime={setTotalTime}
                    startExam={startExam}
                    handleTotalTimeChange={handleTotalTimeChange}
                    timerDuration={timerDuration}
                    setTimerDuration={setTimerDuration}
                    darkMode={darkMode}
                    presentChapterIds={presentChapterIds}
                  />
                )}
                {!finishQuiz && examStarted && (
                  <>
                    <div className="flex flex-wrap justify-between items-center">
                      <QuestionNavigation
                        chapters={chapters}
                        questions={questions}
                        currentQuestionIndex={currentQuestionIndex}
                        answeredStatus={answeredStatus}
                        setCurrentQuestionIndex={setCurrentQuestionIndex}
                        setConfirmedAnswer={setConfirmedAnswer}
                      />
                      <TimerControls
                        totalTime={totalTime}
                        handleFinish={saveQuizResults}
                        darkMode={darkMode}
                        secondsLeft={secondsLeft}
                        setSecondsLeft={setSecondsLeft}
                        savingResults={savingResults}
                      />
                    </div>
                    <QuestionDisplay
                      questions={questions}
                      currentQuestionIndex={currentQuestionIndex}
                      userAnswers={userAnswers}
                      handleUserAnswerChange={handleUserAnswerChange}
                      confirmedAnswer={confirmedAnswer}
                      handleConfirm={handleConfirm}
                      goToNextQuestion={goToNextQuestion}
                      // handleFinish={handleFinish}
                      handleFinish={saveQuizResults}
                      answeredQuestions={answeredQuestions}
                      selectedOptions={selectedOptions}
                      handleOptionChange={handleOptionChange}
                      savingResults={savingResults}
                      darkMode={darkMode}
                      isConfriming={isConfriming}
                    />
                  </>
                )}
                {showErrorPopup && (
                  <Popup type="red" message="Please, add your answer" onClose={handleCloseErrorPopup} />
                )}
                {showQuitQuizModal && (
                  <QuitQuizModal
                    onClose={() => setShowQuitQuizModal(false)}
                    onQuit={saveQuizResults}
                    savingResults={savingResults}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '1200px', minWidth: "320px", margin: '0 auto', marginTop: '10px' }}>
            <div className="flex justify-between items-center">
              <SubjectsGrid
                subjects={results}
                darkMode={darkMode}
              />
              <GradeDisplay
                results={results}
                darkMode={darkMode}
              />
            </div>
            <p className='text-center text-lg font-medium mb-10'>You need to select if you got Correct or Incorrect for the questions to fill</p>
            <h1 className='text-center text-3xl font-semibold'>Your results & explanations</h1>
            <SubjectsResults
              data={results}
              fetchResults={fetchResults}
              darkMode={darkMode}
              updateCorrectCount={updateCorrectCount}
              userId={userInfo?._id}
            />
          </div>
        )
      }
    </div>
  );
}

export default QuizExam;
