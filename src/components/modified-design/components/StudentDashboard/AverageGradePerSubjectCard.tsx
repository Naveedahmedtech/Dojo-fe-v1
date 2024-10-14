import ChapterGradeChart from './ChapterGradeChart';
import SubjectGradeChart from './SubjectGradeChart';
import CommonHead from './CommonHead';
import CommonSubHead from './CommonSubHead';

const AverageGradePerSubjectCard = ({
    view,
    subjectsData,
    chaptersData,
    setSelectedSubject,
    setChaptersData,
    setView,
    subjectPercentageData,
    chapterPercentageData,
    totalQuestionsA,
    maxPercentage,
    interval,
    getYTickValues,
    darkMode,
}: any) => (
    <div className={`h-[250px] ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        {view === 'subject' ? (
            <>
                <CommonHead text="Average Grade" darkMode={darkMode} />
                <CommonSubHead text="Per Subject" darkMode={darkMode} />
                <div className="text-center">
                    <p className={`text-sm italic mb-5 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                        Click on each subject bar to see the details by chapter
                    </p>
                </div>
                <div className="h-full">
                        <SubjectGradeChart
                            subjectsData={subjectsData}
                            setSelectedSubject={setSelectedSubject}
                            setChaptersData={setChaptersData}
                            setView={setView}
                            subjectPercentageData={subjectPercentageData}
                            totalQuestionsA={totalQuestionsA}
                            maxPercentage={maxPercentage}
                            interval={interval}
                            getYTickValues={getYTickValues}
                        />
                </div>
            </>
        ) : (
            <>
                <CommonHead text="Average Grade" darkMode={darkMode} />
                <CommonSubHead text="Per Chapter" darkMode={darkMode} />
                <p
                    className={`text-sm text-center italic mb-5 cursor-pointer ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}
                    onClick={() => {
                        setView('subject');
                        const firstSubject = subjectsData[0] || null;
                        setSelectedSubject(firstSubject);
                        setChaptersData(firstSubject ? firstSubject.chapters : []);
                    }}
                >
                    Back to subjects
                </p>
                    <div className="w-full h-full">
                        <ChapterGradeChart
                            subjectsData={subjectsData}
                            chaptersData={chaptersData}
                            setSelectedSubject={setSelectedSubject}
                            setChaptersData={setChaptersData}
                            setView={setView}
                            chapterPercentageData={chapterPercentageData}
                            interval={interval}
                            getYTickValues={getYTickValues}
                        />
                </div>
            </>
        )}
    </div>
);

export default AverageGradePerSubjectCard;
