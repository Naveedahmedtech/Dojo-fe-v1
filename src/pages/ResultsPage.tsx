import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { SERVER_URL } from '../../api';
import { useAuth } from '../context/AuthProvider';
import QuestionsDone from '../components/quizResults/QuestionsDone';
import CorrectAnswer from '../components/quizResults/CorrectAnswer';
import TimeOnThePlatform from '../components/quizResults/TimeOnThePlatform';

const ResultsPage = ({ darkMode }:any) => {
  const { id } = useParams<{ id: string }>(); 
  const { role } = useAuth(); 
  const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; role: string } | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/user/user-name/${id}`);
        setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    if (id) {
      fetchUserInfo();
    }
  }, [id]);

  return (
    <div className='p-4 pt-0'>
      {role === 'admin' || role === 'teacher' ? (
        <div className='flex flex-row'>
        <div className="mb-4">
          <p className="text-xl text-customColor font-bold text-center">{userInfo ? `${userInfo.lastName} ${userInfo.firstName}'s results` : ''}</p>
        </div>
        </div>
      ) : null}
      {/* <h3 className="text-2xl text-start font-bold mb-2 ml-10 mt-5">Questions</h3> */}
      <div className="overflow-x-auto overflow-y-hidden">
        <QuestionsDone darkMode={darkMode} />
      </div>
      {/* <h3 className="text-2xl text-start font-bold mb-2 ml-10 mt-5">Answers</h3> */}
      <div className="overflow-x-auto overflow-y-hidden">
        <CorrectAnswer darkMode={darkMode} />
      </div>
      {/* <h3 className="text-2xl text-start font-bold mb-2 ml-10 mt-5">Time</h3> */}
      <div className="overflow-x-auto overflow-y-hidden ">
        <TimeOnThePlatform darkMode={darkMode} />
      </div>
    </div>
  );
};

export default ResultsPage;
