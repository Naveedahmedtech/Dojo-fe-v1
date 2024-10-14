import React from 'react';
import SubjectChart from './SubjectChart';
import CommonHead from './CommonHead';
import CommonSubHead from './CommonSubHead';
import ChaptersChart from '../../../../utils/ChaptersChart ';

const QuestionsPerSubjectCard: React.FC<{
    view: string;
    subjectsData: any[];
    setSelectedSubject: (subject: any) => void;
    setChaptersData: (chapters: any[]) => void;
    setView: any;
    getYTickValues: (data: number[], interval: number) => number[];
    interval: number;
    chaptersData: any;
    darkMode: boolean; // Adjusted to boolean
}> = ({
    view,
    subjectsData,
    setSelectedSubject,
    setChaptersData,
    setView,
    getYTickValues,
    interval,
    chaptersData,
    darkMode
}) => {
    // console.log("DsubjectsData", subjectsData);
        return (
                <div className={`h-[270px]`}>
                    <CommonHead text={view === 'subject' ? 'Questions done' : 'Questions done'} darkMode={darkMode} />
                    <div className="flex flex-col text-xs mb-5">
                        <div className="flex flex-row justify-center">
                            <CommonSubHead text={view === 'subject' ? 'Per Subject' : 'Per Chapter'} />
                        </div>
                        {view === 'subject' &&
                            <p className={`text-sm italic text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Click on each subject to see the details by chapter.
                            </p>
                        }
                        {view === 'chapter' && (
                            <p
                                className={`text-sm italic text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'} cursor-pointer`}
                                onClick={() => {
                                    setView('subject');
                                    const firstSubject = subjectsData[0] || null;
                                    setSelectedSubject(firstSubject);
                                    setChaptersData(firstSubject ? firstSubject.chapters : []);
                                }}
                            >
                                Back to subject details
                            </p>
                        )}
                    </div>
                    {view === 'subject' ? (
                        <SubjectChart
                            subjectsData={subjectsData}
                            setSelectedSubject={setSelectedSubject}
                            setChaptersData={setChaptersData}
                            setView={setView}
                            getYTickValues={getYTickValues}
                            interval={interval}
                        />
                    ) : (
                        <ChaptersChart
                            subjectsData={subjectsData}
                            chaptersData={chaptersData}
                            setSelectedSubject={setSelectedSubject}
                            setChaptersData={setChaptersData}
                            setView={setView}
                        />
                    )}
                </div>
        );
    };

export default QuestionsPerSubjectCard;
