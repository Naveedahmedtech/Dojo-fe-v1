import React, { useState, useEffect, useRef } from 'react';
import WelcomeImage from '../../src/styles/welcome_image.png';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import LoginForm from '../components/LoginForm';

const StartPage: React.FC = () => {
  const welcomeBlockRef = useRef<HTMLDivElement>(null);
  const [welcomeBlockHeight, setWelcomeBlockHeight] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (welcomeBlockRef.current) {
      setWelcomeBlockHeight(welcomeBlockRef.current.clientHeight);
    }
  }, [welcomeBlockRef.current?.clientHeight]);

  return (
    <div className="flex justify-center items-start h-screen py-16">
      <div className="flex flex-col lg:flex-row justify-center items-start">
        <div
          className="lg:w-1/2 overflow-hidden rounded-lg border border-gray-500 mb-10 lg:mb-0"
          style={{
            height: `${welcomeBlockHeight}px`,
            width: '400px',
            minWidth: '400px',
          }}
        >
          <img
            src={WelcomeImage}
            alt="Welcome"
            className="object-cover h-full w-full"
            style={{
              clipPath: 'inset(0)',
              borderRadius: 'inherit',
            }}
          />
        </div>
        <div
          ref={welcomeBlockRef}
          className="lg:w-1/2 ml-0 lg:ml-10 pt-2 pb-2 pl-6 pr-6 border rounded-lg border-gray-500 flex flex-col"
          style={{
            maxWidth: '400px',
            width: '400px',
            minWidth: '400px',
          }}
        >
          <div className="mb-6 text-center">
            <h2 className="text-2xl py-3">Welcome</h2>
          </div>
          <LoginForm />
          <div className="text-center">
            <button onClick={openModal} className="text-customColor text-sm mb-5">
              Forgot Password?
            </button>
            {isModalOpen && <ForgotPasswordModal onClose={closeModal} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartPage;
