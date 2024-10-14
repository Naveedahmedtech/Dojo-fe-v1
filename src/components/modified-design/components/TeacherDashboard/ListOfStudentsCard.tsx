import React from 'react';
import SeeDetailsButton from './SeeDetailsButton';
import CommonHead from '../StudentDashboard/CommonHead';

const ListOfStudentsCard = ({ darkMode }: any) => (
    <div className={darkMode ? "bg-gray-800 text-white w-full  h-full p-4 rounded-lg" : "bg-white text-black p-4 h-full rounded-lg w-full"}>
        <CommonHead text="List of Students" darkMode={darkMode} />
        {/* <div className='flex flex-row space-x-4 justify-center items-center'>
            <img width="50" height="50" src="https://img.icons8.com/windows/50/conference-call.png" alt="students" className='' style={{ filter: darkMode ? 'invert(100%)' : 'none' }} />
        </div> */}
        <SeeDetailsButton to="/list-of-students" label="See Details" />
    </div>
);

export default ListOfStudentsCard;
