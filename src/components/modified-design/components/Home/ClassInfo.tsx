import React, { useState } from 'react';
import SearchBarHome from '../../../SearchBarHome';
import defaultImage from '../../../../styles/online-learning.png'

const ClassInfo: React.FC<{
    classInfo: any;
    currentClassIndex: number;
    index: number;
    toggleClass: () => void;
    toggleVisibility: (subject: any) => void;
    getSubjectProgress: (subjectName: string) => string;
    handleChapterCheckboxChange: (subjectId: string, subjectName: string, chapterIndex: number) => void;
    chapters: any;
    BookImage: string;
    userInfo: any;
    setSearchResults: any;
    darkMode: boolean;
    getQuizDetails: any
}> = ({
    classInfo,
    currentClassIndex,
    index,
    toggleClass,
    toggleVisibility,
    getSubjectProgress,
    handleChapterCheckboxChange,
    chapters,
    BookImage,
    userInfo,
    setSearchResults,
    darkMode,
    getQuizDetails
}) => {

    const navigateToChapter = (className: string, subjectName: string, chapterName: string) => {
        const subject = classInfo.subjects.find((subj: any) => subj.subject_name === subjectName);

        if (subject) {
            // Check if the currently visible subject is different from the clicked one
            if (!chapters[subjectName].visible) {
                // If it's a different subject, toggle visibility to show the new one
                toggleVisibility(subject);
            }

            const chapter = chapters[subjectName].chapters.find((chap: any) => chap.chapter_name === chapterName);
            if (chapter) {
                // Smooth scroll to the chapter element
                const chapterElement = document.getElementById(`chapter-${subjectName}-${chapterName}`);
                if (chapterElement) {
                    chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

                    // Highlight the chapter element
                    chapterElement.classList.add('highlight');

                    // Remove the highlight after a short delay
                    setTimeout(() => {
                        chapterElement.classList.remove('highlight');
                    }, 1000);
                }
            }
        }
    };



        return (
            <div
                key={classInfo.class_name}
                className={`mb-4 min-w-[350px] p-5 rounded-lg border-[1px] transition-all duration-300 ${darkMode ? 'border-gray-600  text-white' : 'border-gray-500  text-black'
                    }`}
            >
                {index === currentClassIndex && (
                    <div>
                        <div className="flex flex-wrap items-center justify-between">
                            <div className="flex items-center">
                                {/* <img src={BookImage} alt="Book" className="w-8 h-auto mr-2" /> */}
                                <h2 className=" font-semibold text-2xl">
                                    {classInfo?.course_name} - {classInfo?.class_name} - Class of {classInfo?.year_of_beginning}
                                </h2>
                            </div>
                            {userInfo.class_info.length > 1 && (
                                <button
                                    onClick={toggleClass}
                                    className="text-sm text-[#FF9934] hover:text-black focus:outline-none"
                                >
                                    <img
                                        className="ml-2"
                                        width="18"
                                        height="18"
                                        src="https://img.icons8.com/ios/18/synchronize.png"
                                        alt="change class"
                                    />
                                </button>
                            )}
                            {userInfo && <SearchBarHome onSearch={setSearchResults} darkMode={darkMode} navigateToChapter={navigateToChapter} />}
                        </div>
                        <div className="mt-4">
                            {classInfo.subjects.map((subject: any) => {
                                const progress = getSubjectProgress(subject?.subject_name);
                                const quiz_question_answer = getQuizDetails(subject?.subject_name);
                                return (
                                    <div key={subject.subject_name} className="mt-2">
                                        <div
                                            className={`flex items-center justify-between border rounded-md p-3 cursor-pointer transition duration-200 ${darkMode
                                                ? 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                                                }`}
                                            onClick={() => toggleVisibility(subject)}
                                        >
                                            <div className="flex items-center">
                                                <img
                                                    src={subject.subject_icon_url ? subject.subject_icon_url : defaultImage}
                                                    alt={defaultImage}
                                                    className="w-6 h-auto mr-5"
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = defaultImage;
                                                    }}
                                                />
                                                <p
                                                    className={`text-xl font-bold ${darkMode ? 'text-[#FF9934]' : 'text-[#FF9934]'
                                                        }`}
                                                >
                                                    {subject.subject_name}
                                                </p>
                                                <div className="relative w-[120px] h-8 ml-10 bg-gray-200 rounded-lg overflow-hidden">
                                                    {parseInt(progress) > 0 ? (
                                                        <div
                                                            className="absolute inset-0 rounded-lg bg-orange-100"
                                                            style={{
                                                                width: `${Math.max(parseInt(progress), 20)}%`,
                                                            }}
                                                        >
                                                            <div className="absolute inset-0 bg-[#ff9a342c] flex items-center justify-center rounded-lg">
                                                                <span className="text-[#FF9934] text-lg font-semibold">
                                                                    {progress}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#FF9934] text-lg font-semibold">
                                                            {progress}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className='ml-10'>
                                                    <p className='text-gray-400 font-normal'>{quiz_question_answer} answered</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <img
                                                    className={`transition-transform ${chapters[subject.subject_name] &&
                                                        chapters[subject.subject_name].visible
                                                        ? 'transform rotate-180'
                                                        : ''
                                                        }`}
                                                    width="20"
                                                    height="20"
                                                    src="https://img.icons8.com/ios/20/expand-arrow--v2.png"
                                                    alt="toggle"
                                                />
                                            </div>
                                        </div>
                                        {chapters[subject.subject_name] && chapters[subject.subject_name].visible && (
                                            <div
                                                className={`mt-2  ${darkMode ? 'bg-gray-700' : 'bg-white'
                                                    }`}
                                            >
                                                {chapters[subject.subject_name].chapters.length === 0 ? (
                                                    <p
                                                        className={`text-sm `}
                                                    >
                                                        No chapters available for this subject
                                                    </p>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2">
                                                        {chapters[subject.subject_name].chapters.map(
                                                            (chapter: any, chapterIndex: number) => (
                                                                <div
                                                                    key={chapterIndex}
                                                                    id={`chapter-${subject.subject_name}-${chapter.chapter_name}`} 
                                                                    className={`flex items-center space-x-3 p-2 rounded-md transition duration-200 ${darkMode
                                                                        ? ' hover:bg-gray-500 border-gray-500 text-white'
                                                                        : ' hover:bg-gray-100 border-gray-200 text-black'
                                                                        }`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={chapter.isChecked}
                                                                        onChange={() =>
                                                                            handleChapterCheckboxChange(
                                                                                subject.subject_id,
                                                                                subject.subject_name,
                                                                                chapterIndex
                                                                            )
                                                                        }
                                                                        className="cursor-pointer h-4 w-4 accent-[#FF9934] text-white"
                                                                    />
                                                                    <label
                                                                        className="flex-grow cursor-pointer"
                                                                        onClick={() =>
                                                                            handleChapterCheckboxChange(
                                                                                subject.subject_id,
                                                                                subject.subject_name,
                                                                                chapterIndex
                                                                            )
                                                                        }
                                                                    >
                                                                        <div className="flex justify-between items-center">
                                                                            <span
                                                                                className={`font-medium ${darkMode
                                                                                    ? 'text-white'
                                                                                    : 'text-gray-700'
                                                                                    }`}
                                                                            >
                                                                                {chapter.chapter_name}
                                                                            </span>
                                                                            <span
                                                                                className={`ml-2 text-xs ${darkMode
                                                                                    ? 'text-gray-300'
                                                                                    : 'text-gray-400'
                                                                                    }`}
                                                                            >
                                                                                {chapter.questions_done}
                                                                            </span>
                                                                        </div>
                                                                        <div className="relative w-full h-[8px] bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                                            <div
                                                                                className="bg-[#FF9934] h-full rounded-full"
                                                                                style={{
                                                                                    width: chapter.questions_done,
                                                                                }}
                                                                            ></div>
                                                                        </div>
                                                                    </label>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

export default ClassInfo;
