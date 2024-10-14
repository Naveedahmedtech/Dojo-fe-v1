import { Chapter } from "../ExamSettings";

const QuestionsTable = ({
    chapters,
    questionsPerChapter,
    handleQuestionsChange,
    loading,
    darkMode
}: any) => {

    const renderChaptersBySubject = () => {
        const renderedChapters: JSX.Element[] = [];
        const subjectsMap: { [subjectName: string]: Chapter[] } = {};

        chapters.forEach((chapter: any) => {
            if (!subjectsMap[chapter.subject_name]) {
                subjectsMap[chapter.subject_name] = [];
            }
            subjectsMap[chapter.subject_name].push(chapter);
        });

        Object.entries(subjectsMap).forEach(([subjectName, subjectChapters]) => {
            renderedChapters.push(
                <div key={`subject_${subjectName}`} className="grid grid-cols-3 gap-4 py-2 mt-5 px-2 text-center items-center">
                    {/* Subject Name */}
                    <div className={`col-span-1 text-left text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{subjectName}</div>

                    {/* First Chapter Name and Inputs */}
                    <div className={`col-span-1 text-left text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{subjectChapters[0].chapter_name}</div>
                    <div className="col-span-1 flex justify-center">
                        <input
                            type="number"
                            min={1}
                            max={subjectChapters[0].totalQuestions}
                            value={questionsPerChapter[subjectChapters[0]._id] || ''}
                            onChange={(e) => handleQuestionsChange(subjectChapters[0]._id, parseInt(e.target.value))}
                            placeholder={subjectChapters[0].totalQuestions.toString()}
                            className={`mt-2 w-14 px-2 py-1 border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-customColor bg-white text-gray-800'} rounded focus:outline-none focus:border-gray-500`}
                        />
                    </div>
                </div>
            );

            // Render the remaining rows with chapters and inputs only
            for (let i = 1; i < subjectChapters.length; i++) {
                renderedChapters.push(
                    <div key={subjectChapters[i]._id} className="grid grid-cols-3 gap-4 py-2 px-2 text-center items-center">
                        {/* Empty div for Subject Name */}
                        <div className="col-span-1"></div>

                        {/* Chapter Name and Inputs */}
                        <div className={`col-span-1 text-left text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{subjectChapters[i].chapter_name}</div>
                        <div className="col-span-1 flex justify-center">
                            <input
                                type="number"
                                min={1}
                                max={subjectChapters[i].totalQuestions}
                                value={questionsPerChapter[subjectChapters[i]._id] || ''}
                                onChange={(e) => handleQuestionsChange(subjectChapters[i]._id, parseInt(e.target.value))}
                                placeholder={subjectChapters[i].totalQuestions.toString()}
                                className={`w-14 px-2 py-1 border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-customColor bg-white text-gray-800'} rounded focus:outline-none focus:border-gray-500`}
                            />
                        </div>
                    </div>
                );
            }
        });

        return renderedChapters;
    };


    return (
        <div className="pb-1 rounded mt-6 w-full">
            {
                loading ? (
                    <div className="flex justify-center mt-4">
                        <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${darkMode ? 'border-gray-400' : 'border-orange-400'}`}></div>
                    </div>
                ) : (
                    <>
                        <div className={`grid grid-cols-3 gap-4 py-2 border rounded-xl ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-transparent border-customColor'}`}>
                            <div className={`col-span-1 px-2 py-1 text-left text-base font-bold uppercase tracking-wider text-customColor`}>
                                SUBJECT
                            </div>
                            <div className={`col-span-1 px-2 py-1 text-left text-base font-bold uppercase tracking-wider text-customColor`}>
                                CHAPTER
                            </div>
                            <div className={`col-span-1 px-2 py-1 text-left text-base font-bold uppercase tracking-wider text-customColor`}>
                                NUMBER OF QUESTIONS
                            </div>
                        </div>
                        <div className={`border rounded-xl mt-5 ${darkMode ? 'border-gray-600' : 'border-customColor'}`}>{renderChaptersBySubject()}</div>
                    </>
                )
            }
        </div>
    );
};

export default QuestionsTable;
