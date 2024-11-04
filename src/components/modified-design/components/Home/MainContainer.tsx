import React from 'react';
import Background from './Background';
import ClassInfo from './ClassInfo';
import QuizSelection from './QuizSelection';
import SearchBarHome from '../../../SearchBarHome';
import Popup from '../../../Popup';

const MainContainer: React.FC<{
    userInfo: any;
    backgroundImage: string;
    currentClassIndex: number;
    toggleClass: () => void;
    toggleVisibility: (subject: any) => void;
    getSubjectProgress: (subjectName: string) => string;
    handleChapterCheckboxChange: (subjectId: string, subjectName: string, chapterIndex: number) => void;
    chapters: any;
    BookImage: string;
    isButtonDisabled: boolean;
    selectedChapterIds: string[];
    selectedSubjectIds: string[];
    // subjectId: string;
    handleQuizTypeSelection: (type: string) => void;
    activeTooltip: any;
    setActiveTooltip: any;
    popupMessage: string | null;
    popupType: any;
    handleClosePopup: () => void;
    setSearchResults: any;
    darkMode: any;
    getQuizDetails: any;
}> = ({
    userInfo,
    backgroundImage,
    currentClassIndex,
    toggleClass,
    toggleVisibility,
    getSubjectProgress,
    handleChapterCheckboxChange,
    chapters,
    BookImage,
    isButtonDisabled,
    selectedChapterIds,
    selectedSubjectIds,
    // subjectId,
    handleQuizTypeSelection,
    activeTooltip,
    setActiveTooltip,
    popupMessage,
    popupType,
    handleClosePopup,
    setSearchResults,
    darkMode,
    getQuizDetails
}) => {
        return (
            <div className='mb-28 hidden md:block'>
                <Background backgroundImage={backgroundImage} />
                <div className="relative z-10 mx-auto mt-0 max-w-screen-xl main-container-space">
                    <div className="flex flex-col items-center">
                        <div className="w-full px-4">
                            {userInfo && (
                                <div className="space-y-1">
                                    {userInfo.class_info.map((classInfo: any, index: number) => (
                                        <ClassInfo
                                            key={index}
                                            classInfo={classInfo}
                                            currentClassIndex={currentClassIndex}
                                            index={index}
                                            toggleClass={toggleClass}
                                            toggleVisibility={toggleVisibility}
                                            getSubjectProgress={getSubjectProgress}
                                            handleChapterCheckboxChange={handleChapterCheckboxChange}
                                            chapters={chapters}
                                            BookImage={BookImage}
                                            userInfo={userInfo}
                                            setSearchResults={setSearchResults}
                                            darkMode={darkMode}
                                            getQuizDetails={getQuizDetails}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="w-full mt-4 flex justify-center">
                            {userInfo && (
                                <QuizSelection
                                    isButtonDisabled={isButtonDisabled}
                                    selectedChapterIds={selectedChapterIds}
                                    selectedSubjectIds={selectedSubjectIds}
                                    // subjectId={subjectId}
                                    handleQuizTypeSelection={handleQuizTypeSelection}
                                    activeTooltip={activeTooltip}
                                    setActiveTooltip={setActiveTooltip}
                                    darkMode={darkMode}
                                />
                            )}
                        </div>
                        {popupMessage && (
                            <Popup message={popupMessage} type={popupType} onClose={handleClosePopup} />
                        )}
                    </div>
                </div>
            </div>
        );
    };

export default MainContainer;
