const StartExamButton = ({ startExam, disabled }: any) => (
    <button
        onClick={startExam}
        className={`mt-10 py-2 px-14 rounded-md font-medium ${disabled ? "bg-[#FF99347D]" : "bg-customColor text-white"}`}
        disabled={disabled}
    >
        Start
    </button>
);


export default StartExamButton;
