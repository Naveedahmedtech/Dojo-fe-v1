const TotalQuestions = ({
    totalQuestions,
    totalTime,
    handleTotalTimeChange,
    clockIcon,
    darkMode
}: any) => (
    <>
        <p className={`text-center text-xl mt-5 font-medium text-customColor`}>
            Total number of questions: {totalQuestions}
        </p>
        <div className="flex justify-center items-center">
            <div className={`flex items-center justify-center border gap-3 rounded-lg px-4 py-2 mt-4 ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-customColor bg-white'}`}>
                <img
                    src={clockIcon}
                    alt="clock"
                    className="w-8 h-8 mr-2"
                />
                <span className={`text-lg font-medium mr-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>TIME</span>
                <input
                    type="number"
                    min={1}
                    max={60}
                    value={totalTime}
                    onChange={(e) => handleTotalTimeChange(parseInt(e.target.value))}
                    className={`w-16 text-center border rounded mx-2 px-2 py-1 focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-customColor bg-white text-gray-800'}`}
                />
                <span className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Minutes</span>
            </div>
        </div>
    </>
);

export default TotalQuestions;
