import { useState, useEffect } from 'react';
import axios from 'axios';
import SectionAddUniversity from './SectionAddUniversity';
import SectionAddCourse from './SectionAddCourse';
import SectionAddClass from './SectionAddClass';
import SectionAddChapter from './SectionAddChapter';
import SectionAddUser from './SectionAddUser';
import SectionAddQuestion from './SectionAddQuestion';
import SectionAddSubject from './SectionAddSubject';
import { SERVER_URL } from '../../api';
import { Dispatch, SetStateAction } from 'react';

const AdminAddNewDataPage = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [universities, setUniversities] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [, setSubjects] = useState<any[]>([]);
  const [, setChapters] = useState<any[]>([]);

  useEffect(() => {
    fetchData('universities', setUniversities);
    fetchData('courses', setCourses);
    fetchData('classes', setClasses);
    fetchData('subjects', setSubjects);
    fetchData('chapters', setChapters);
  }, []);

  const fetchData = async (endpoint: string, setter: Dispatch<SetStateAction<any[]>>) => {
    try {
      const response = await axios.get(`${SERVER_URL}/getall/${endpoint}`);
      setter(response.data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'classes':
        return (
          <>
            <SectionAddUniversity 
            universities={universities} 
            fetchUniversities={() => fetchData('universities', setUniversities)} />
            <SectionAddCourse 
            fetchCourses={() => fetchData('courses', setCourses)} 
            updateUniversities={setUniversities} 
            universities={universities} />
            <SectionAddClass 
            updateUniversities={setUniversities} 
            universities={universities} 
            courses={courses} />
            <SectionAddSubject 
            universities={universities} 
            courses={courses}
            classes={classes} 
            fetchSubjects={() => fetchData('subjects', setSubjects)} />
            <SectionAddChapter
            universities={universities}
            updateUniversities={setUniversities} 
            courses={courses}
            classes={classes}
            fetchChapters={() => fetchData('chapters', setChapters)}
          />
          </>
        );
      case 'questions':
        return  <SectionAddQuestion />
      case 'users':
        return <SectionAddUser/>;
      default:
        return null;
    }
  };

  return (
    <div className="w-screen-lg mx-auto p-6 rounded-lg">
      <h2 className="font-bold text-center mb-5">ADD NEW DATA</h2>
      <div className="tabs flex justify-around mb-4">
        <button onClick={() => handleTabChange('classes')} className={`tab ${activeTab === 'classes' ? 'active-tab' : ''}`}>Classes</button>
        <button onClick={() => handleTabChange('users')} className={`tab ${activeTab === 'users' ? 'active-tab' : ''}`}>Users</button>
        <button onClick={() => handleTabChange('questions')} className={`tab ${activeTab === 'questions' ? 'active-tab' : ''}`}>Questions</button>
      </div>
      {renderTabContent()}
    </div>
  );
};

export default AdminAddNewDataPage;
