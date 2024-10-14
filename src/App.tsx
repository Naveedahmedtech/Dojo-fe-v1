import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { BrowserRouter as Router, Route, Routes, useLocation, } from 'react-router-dom';
import { AuthProvider, useAuth, } from './context/AuthProvider';
import { Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ResultsPage from './pages/ResultsPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AddToDatabase from "./admin/AddToDatabase"
import DeleteFromDatabase from './admin/DeleteFromDatabase';
import QuizLearn from './components/QuizLearn';
import QuizRandom from './components/QuizRandom';
import QuizExam from './components/QuizExam';
import './App.css';
import RedirectToHomeIfLoggedIn from './utils/redirectToHomeIfLoggedIn';
import ProtectedRoute from './utils/protectedRoute';
import ResetPassword from './components/ResetPassword';
import ListOfStudents from './components/teacherDashboard/ListOfStudents';
import AverageGradeDetails from './components/teacherDashboard/AverageGradeDetails';
import ExamResults from './components/teacherDashboard/ExamResults';
import QuestionsDoneDetails from './components/teacherDashboard/QuestionsDoneDetails';
import TimeSpentDetails from './components/teacherDashboard/TimeSpentDetails';
import { ExamProvider } from './context/ExamProvider';
import PageViewTracker from './utils/PageViewTracker';
import HeaderM from './components/modified-design/Header';
import localforage from 'localforage';
import AppLoader from './components/loading/AppLoader';
import CourseRecords from './pages/CourseRecords';
import AdminHome from './pages/AdminHome';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = React.useState(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    return storedDarkMode ? JSON.parse(storedDarkMode) : false;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevDarkMode: boolean) => !prevDarkMode);
  };



  return (
    <ErrorBoundary>
      <AuthProvider>
        <ExamProvider>
          <Router>
            <PageViewTracker />
            {/* <div className={``}> */}
            {/* <HeaderWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode} /> */}
            {/* <div
              >
                <Routes>
                  <Route path="/" element={<RedirectToHomeIfLoggedIn />} />
                  <Route path="/home" element={
                    <ProtectedRoute allowedRoles={['admin', 'student']}>
                      <HomePage darkMode={darkMode} />
                    </ProtectedRoute>} />
                  <Route
                    path="/profile/:id"
                    element={
                      <ProtectedRoute>
                        <ProfilePage onSave={() => { }} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/quiz/learn"
                    element={
                      <ProtectedRoute>
                        <QuizLearn />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/quiz/random"
                    element={
                      <ProtectedRoute>
                        <QuizRandom />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/quiz/exam"
                    element={
                      <ProtectedRoute>
                        <QuizExam />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/results/:id"
                    element={
                      <ProtectedRoute>
                        <ProtectedRoute>
                          <ResultsPage darkMode={darkMode} />
                        </ProtectedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/main"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                        <DashboardPage darkMode={darkMode} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/average-grade"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                        <AverageGradeDetails darkMode={darkMode} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/exam-results"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                        <ExamResults darkMode={darkMode} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/list-of-students"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                        <ListOfStudents darkMode={darkMode} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/questions-done"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                        <QuestionsDoneDetails darkMode={darkMode} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/time-stats"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                        <TimeSpentDetails darkMode={darkMode} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/addtodatabase"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AddToDatabase />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/deletefromdatabase"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <DeleteFromDatabase />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/auth/reset-password/:userId/:token"
                    element={<ResetPassword />}
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div> */}
            {/* <div className='text-xs text-gray-400 flex justify-end fixed bottom-0 right-0 mr-2 mb-2'>
                Icons by&nbsp;<Link to="https://icons8.com">Icons8</Link>
              </div>
            </div> */}

            <AppContent darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </Router>
        </ExamProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};


const AppContent: React.FC<{ darkMode: boolean, toggleDarkMode: () => void }> = ({ darkMode, toggleDarkMode }) => {
  const location = useLocation();
  const { token, isLoading } = useAuth();
  const [isAppLoading, setIsAppLoading] = React.useState(true);
  const [, setAuthenticated] = React.useState(false);
  const pathsWithoutHeader = ['/', '/auth/reset-password'];


  React.useEffect(() => {
    const checkToken = async () => {
      const token = await localforage.getItem('authToken');
      if (token) {
        setAuthenticated(true);  // Set the user as authenticated if token is found
      }
      setIsAppLoading(false);  // Set loading to false after checking token
    };

    checkToken();
  }, [setAuthenticated]);

  if (isAppLoading || isLoading) {
    return <AppLoader />;  // Show loading state while checking token
  }


  // Redirect to login page if not authenticated
  if (!token && location.pathname === '/') {
    return <RedirectToHomeIfLoggedIn />;
  }

  return (
    <>
      {!pathsWithoutHeader.includes(location.pathname) && (
        <HeaderM darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      )}
      <Routes>
        <Route path="/" element={<RedirectToHomeIfLoggedIn />} />
        <Route path="/home" element={
          <ProtectedRoute allowedRoles={['admin', 'student']}>
            <HomePage darkMode={darkMode} />
          </ProtectedRoute>} />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProfilePage onSave={() => { }} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/learn"
          element={
            <ProtectedRoute>
              <QuizLearn darkMode={darkMode} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home"
          element={
            <ProtectedRoute>
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/random"
          element={
            <ProtectedRoute>
              <QuizRandom darkMode={darkMode} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/exam"
          element={
            <ProtectedRoute>
              <QuizExam darkMode={darkMode} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results/:id"
          element={
            <ProtectedRoute>
              <ProtectedRoute>
                <ResultsPage darkMode={darkMode} />
              </ProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/main"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <DashboardPage darkMode={darkMode} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/average-grade"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <AverageGradeDetails darkMode={darkMode} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-results"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <ExamResults darkMode={darkMode} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course-results"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <CourseRecords darkMode={darkMode} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/list-of-students"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <ListOfStudents darkMode={darkMode} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questions-done"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <QuestionsDoneDetails darkMode={darkMode} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/time-stats"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <TimeSpentDetails darkMode={darkMode} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addtodatabase"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddToDatabase />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/deletefromdatabase"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DeleteFromDatabase />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth/reset-password/:userId/:token"
          element={<ResetPassword />}
        />
        {/* Add other routes here */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <div className='text-xs text-gray-400 flex justify-end fixed bottom-0 right-0 mr-2 mb-2'>
        Icons by&nbsp;<Link to="https://icons8.com">Icons8</Link>
      </div>
    </>
  );
};



export default App;
