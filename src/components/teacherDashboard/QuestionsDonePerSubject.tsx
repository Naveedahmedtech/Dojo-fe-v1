import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SERVER_URL } from '../../../api';
import 'react-circular-progressbar/dist/styles.css';
import SeeDetailsButton from './SeeDetailsButton';
import { useAuth } from '../../context/AuthProvider';
import CommonSubHead from '../modified-design/components/StudentDashboard/CommonSubHead';
import OverallProgress from '../modified-design/components/TeacherDashboard/OverallProgress';
import SubjectProgressList from '../modified-design/components/TeacherDashboard/SubjectProgressList';

interface Chapter {
  chapterId: string;
  chapterName: string;
  correctAnswers: number;
  incorrectAnswers: number;
  notAnsweredYet: number;
  totalQuestions: number;
  correctPercentage: string;
  incorrectPercentage: string;
  notAnsweredYetPercentage: string;
  averageGrade: string;
}

interface Subject {
  subjectId: string;
  subjectName: string;
  totalCorrect: number;
  totalIncorrect: number;
  totalNotAnsweredYet: number;
  totalQuestions: number;
  overallCorrectPercentage: string;
  overallIncorrectPercentage: string;
  overallNotAnsweredYetPercentage: string;
  overallAverageGrade: string;
  chapters: Chapter[];
}

interface QuestionStatsResponse {
  subjects: Subject[];
}

const QuestionsDonePerSubject: React.FC<any> = ({ selectedCourseId, selectedClassId, darkMode }) => {
  const [data, setData] = useState<Subject[]>([]);
  const token = useAuth().token;
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [totalQuestionDone, setTotalQuestionDone] = useState<number>(0);
  const [studentCount, setStudentCount] = useState<number>();
  const { userInfo } = useAuth();

  useEffect(() => {
    if (!selectedCourseId && !selectedClassId) return;

    const fetchQuestionStats = async () => {
      try {
        const url = selectedClassId
          ? `${SERVER_URL}/teacher/class/${selectedClassId}/grades`
          : `${SERVER_URL}/teacher/course/${selectedCourseId}/grades`;

        const response = await axios.get<QuestionStatsResponse>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const totalQuestionsResponse = await axios.get(`${SERVER_URL}/quiz/${userInfo?._id}/total_questions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const totalQuestionsResponseI = await axios.get(`${SERVER_URL}/teacher/course/${selectedCourseId}/total-questions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // setTotalQuestions(totalQuestionsResponseI.data.totalQuestionsMultipliedByUsers);
        setTotalQuestions(totalQuestionsResponse.data.totalQuestions);
        setStudentCount(totalQuestionsResponseI.data.userCount);
        console.log("OVERALL", { data: response.data, url, totalQuestionsResponse });

        const subjects = response.data.subjects;

        console.log("00", totalQuestionsResponseI);


        let sumTotalQuestions = 0;
        let sumTotalCorrect = 0;
        let sumTotalIncorrect = 0;

        subjects.forEach((subject:any) => {
          sumTotalQuestions += subject.totalQuestionsDoneSum;
          sumTotalCorrect += subject.totalCorrect;
          sumTotalIncorrect += subject.totalIncorrect;
        });

        console.log("OVVV", { subjects, sumTotalCorrect, sumTotalIncorrect, sumTotalQuestions, url});
        setTotalQuestionDone(sumTotalQuestions)
        // setTotalQuestionDone(((sumTotalCorrect + sumTotalIncorrect) / sumTotalQuestions) * 100)
        setData(subjects);
      } catch (error) {
        console.error('Error fetching question stats:', error);
      }
    };

    fetchQuestionStats();
  }, [selectedCourseId, selectedClassId, token]);


  const totalCorrectIncorrect = data.reduce(
    (acc, subject) => acc + subject.totalCorrect + subject.totalIncorrect,
    0
  );

  // const averageGrade = data.length > 0
  //   ? data.reduce((acc, subject) => acc + parseFloat(subject.overallAverageGrade.replace('%', '')), 0) / data.length
  //   : 0;

  return (
    <div>
      <CommonSubHead text="Overall" />
      <OverallProgress
        totalCorrectIncorrect={totalCorrectIncorrect}
        totalQuestions={totalQuestions}
        totalQuestionDone={totalQuestionDone}
        studentCount={studentCount}
        darkMode={darkMode}
      />
      <SubjectProgressList data={data} />
      <SeeDetailsButton to="/questions-done" label="See Details" />
    </div>
  );
};

export default QuestionsDonePerSubject;
