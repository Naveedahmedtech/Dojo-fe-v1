import CustomCountdown from "./CustomCountdown";

const TimerControls = ({
    totalTime,
    handleFinish,
    secondsLeft,
    setSecondsLeft,
    savingResults
}: any) => {
    return (

        <div className="flex flex-col gap-3 top-0 right-0 mt-4">
            <CustomCountdown totalTime={totalTime} handleFinish={handleFinish}
                secondsLeft={secondsLeft}
                setSecondsLeft={setSecondsLeft}
            />
            <button className="bg-[#ff9a348d]  py-2 rounded-xl" disabled={savingResults} onClick={handleFinish}>
                {savingResults ? "saving..." : "I am done"}    
            </button>
        </div>
    )
}


export default TimerControls;
