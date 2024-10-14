import QuestionResult from './QuestionResult'; // Assuming you have this component for each question

const SubjectsResults = ({ data, fetchResults, darkMode, updateCorrectCount, userId }: any) => {
    
    return (
        <div>
            {data && data.map((subject: any) => (
                <div key={subject.id} className="subject mb-6">
                    {/* Subject Name */}
                    <h2 className="text-2xl font-bold mb-4 text-orange-600">{subject.name}</h2>

                    {subject.chapters.map((chapter: any) => (
                        <div key={chapter.id} className="chapter my-4 mt-10">
                            {/* Chapter Name */}
                            <h3 className="text-xl font-semibold mb-2">Chapter: {chapter.name}</h3>

                            {chapter.results.map((result: any) => (
                                <div key={result.question_id} className="question mb-4">
                                    <QuestionResult
                                        result={result}
                                        fetchResults={fetchResults}
                                        darkMode={darkMode}
                                        updateCorrectCount={updateCorrectCount}
                                        userId={userId}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default SubjectsResults;
