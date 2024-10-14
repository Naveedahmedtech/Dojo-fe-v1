import  { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import backgroundImage from '../styles/background.png';
import BookImage from '../styles/icons/book.png';
import axios from 'axios';
import { SERVER_URL } from '../../api';
import debounce from 'lodash/debounce';
import MainContainer from '../components/modified-design/components/Home/MainContainer';

interface Chapter {
  _id: string;
  chapter_name: string;
  questions: string[];
  isChecked: boolean;
  questions_done: string;
}

interface ChapterMap {
  [subjectName: string]: {
    visible: boolean;
    chapters: Chapter[];
  };
}

interface SearchResult {
  id: string;
  title: string;
  url: string;
}

interface SubjectProgress {
  totalQuestions: number;
  totalCorrectCount: number;
  totalIncorrectCount: number;
  totalNotAnsweredYet: number;
  subjectId: string;
  subjectName: string;
  percentageQuestionsDone: number;
}

const HomePage = ({ darkMode }: any) => {
  const { userInfo } = useAuth();
  const [, setSearchResults] = useState<SearchResult[]>([]);
  const [chapters, setChapters] = useState<ChapterMap>({});
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [, setSelectedQuizType] = useState<string | null>(null);
  const [currentClassIndex, setCurrentClassIndex] = useState<number>(0);
  const [activeTooltip, setActiveTooltip] = useState<'learn' | 'random' | 'exam' | null>(null);
  const [popupMessage, setPopupMessage] = useState<string>('');
  const [popupType, setPopupType] = useState<'' | 'green' | 'red'>('');
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [, setSubjectId] = useState<string>('');

  useEffect(() => {
    if (userInfo) {
      const initialChapters: ChapterMap = {};
      userInfo.class_info.forEach((classInfo) => {
        classInfo.subjects.forEach((subject) => {
          initialChapters[subject.subject_name] = {
            visible: false,
            chapters: subject.chapters.map((chapter) => ({
              _id: chapter._id,
              chapter_name: chapter.chapter_name,
              questions: chapter.questions,
              isChecked: false,
              questions_done: '0%',
            })),
          };
        });
      });
      setChapters(initialChapters);
    }
  }, [userInfo?._id]);

  useEffect(() => {
    const fetchSubjectProgress = async () => {
      try {
        const response = await axios.get<SubjectProgress[]>(
          `${SERVER_URL}/quiz/${userInfo?._id}/questions-done-percentage`
        );
        const data = response.data;
        setSubjectProgress(data);
      } catch (error) {
        console.error('Error fetching subject progress:', error);
      }
    };

    if (userInfo) {
      fetchSubjectProgress();
    }
  }, [userInfo?._id]);

  const getSubjectProgress = (subjectName: string) => {
    const progress = subjectProgress.find((sp) => sp.subjectName === subjectName);
    return progress ? `${progress.percentageQuestionsDone}%` : '0%';
  };

  const getQuizDetails = (subjectName: string) => {
    const progress: any = subjectProgress.find((sp) => sp.subjectName === subjectName);
    return progress
      ? `${progress.totalCorrectQuestions + progress.totalIncorrectQuestions} / ${progress.totalQuestions}`
      : '0%';
  };

  useEffect(() => {
    const fetchQuestionsDone = async (chapterId: string) => {
      try {
        const response = await axios.get(
          `${SERVER_URL}/quiz/questions-by-chapter/${userInfo?._id}/${chapterId}`
        );
        const data = response.data;
        if (data && data.questions_done !== undefined) {
          setChapters((prevChapters) => {
            const updatedChapters = { ...prevChapters };
            for (const subjectName in updatedChapters) {
              const subjectChapters = updatedChapters[subjectName].chapters;
              const chapterIndex = subjectChapters.findIndex((ch) => ch._id === chapterId);
              if (chapterIndex !== -1) {
                subjectChapters[chapterIndex].questions_done = data.questions_done;
                break;
              }
            }
            return updatedChapters;
          });
        }
      } catch (error) {
        console.error('Error fetching questions done:', error);
      }
    };
    const debouncedFetchAllQuestionsDone = debounce(async () => {
      for (const subject of Object.values(chapters)) {
        for (const chapter of subject.chapters) {
          await fetchQuestionsDone(chapter._id);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    }, 300);
    debouncedFetchAllQuestionsDone();
    return () => {
      debouncedFetchAllQuestionsDone.cancel();
    };
  }, [JSON.stringify(chapters)]);

  const toggleChaptersVisibility = (subjectName: string) => {
    setChapters((prevChapters) => ({
      ...prevChapters,
      [subjectName]: {
        ...prevChapters[subjectName],
        visible: !prevChapters[subjectName].visible,
      },
    }));
  };

  const toggleClass = () => {
    if (userInfo) {
      setCurrentClassIndex((prevIndex) => (prevIndex + 1) % userInfo.class_info.length);
    }
  };

  const handleChapterCheckboxChange = (subjectId: string, subjectName: string, chapterIndex: number) => {
    const selectedChapter = chapters[subjectName].chapters[chapterIndex];
    const newSelectedChapterIds = [...selectedChapterIds];
    const subjectIdsSet = new Set(selectedSubjectIds); // Create a set from the existing subject ids

    if (selectedChapter.isChecked) {
      const index = newSelectedChapterIds.indexOf(selectedChapter._id);
      if (index !== -1) {
        newSelectedChapterIds.splice(index, 1);
      }

      // Remove subjectId from the set if no chapters are checked for this subject
      const subjectHasCheckedChapters = chapters[subjectName].chapters.some(chap => chap.isChecked && chap._id !== selectedChapter._id);
      if (!subjectHasCheckedChapters) {
        subjectIdsSet.delete(subjectId);
      }
    } else {
      newSelectedChapterIds.push(selectedChapter._id);
      subjectIdsSet.add(subjectId); // Add subjectId to the set if the chapter is checked
    }

    setSelectedChapterIds(newSelectedChapterIds);
    setSelectedSubjectIds(Array.from(subjectIdsSet));

    setChapters((prevChapters) => ({
      ...prevChapters,
      [subjectName]: {
        ...prevChapters[subjectName],
        chapters: prevChapters[subjectName].chapters.map((chapter, index) =>
          index === chapterIndex ? { ...chapter, isChecked: !chapter.isChecked } : chapter
        ),
      },
    }));
  };

  const handleQuizTypeSelection = (quizType: string) => {
    const totalQuestions = selectedChapterIds.reduce((total, chapterId) => {
      const chapter = chapters[chapterId]?.chapters.find((chapter) => chapter._id === chapterId);
      const chapterQuestions = chapter?.questions.length ?? 0;
      return total + chapterQuestions;
    }, 0);
    if (totalQuestions < 1) {
      setPopupMessage('Please select chapters with at least one question');
      setPopupType('red');
    } else {
      setSelectedQuizType(quizType);
      setPopupMessage('');
      setPopupType('');
    }
  };

  const isButtonDisabled = selectedChapterIds.length === 0;

  const handleClosePopup = () => {
    setPopupMessage('');
    setPopupType('');
  };

  const toggleVisibility = (subject: any) => {
    setSubjectId(subject.subject_id);
    toggleChaptersVisibility(subject.subject_name);
  };

  return (
    <MainContainer
      userInfo={userInfo}
      backgroundImage={backgroundImage}
      currentClassIndex={currentClassIndex}
      toggleClass={toggleClass}
      toggleVisibility={toggleVisibility}
      getSubjectProgress={getSubjectProgress}
      handleChapterCheckboxChange={handleChapterCheckboxChange}
      chapters={chapters}
      BookImage={BookImage}
      isButtonDisabled={isButtonDisabled}
      selectedChapterIds={selectedChapterIds}
      selectedSubjectIds={selectedSubjectIds}
      // subjectId={subjectId}
      handleQuizTypeSelection={handleQuizTypeSelection}
      activeTooltip={activeTooltip}
      setActiveTooltip={setActiveTooltip}
      popupMessage={popupMessage}
      popupType={popupType}
      handleClosePopup={handleClosePopup}
      setSearchResults={setSearchResults}
      darkMode={darkMode}
      getQuizDetails={getQuizDetails}
    />
  );
};

export default HomePage;
