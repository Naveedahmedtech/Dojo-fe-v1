import GaugeComponent from "react-gauge-component";
import CommonHead from "../StudentDashboard/CommonHead";
import CommonSubHead from "../StudentDashboard/CommonSubHead";

const AverageScoreSection = ({ averageScore, darkMode }: any) => (
    <div className={darkMode ? "bg-gray-800 text-white p-4 h-full rounded-lg" : "bg-white text-black p-4 h-full rounded-lg"}>
        <div className="flex flex-col items-center">
            <CommonHead text="Average Score" darkMode={darkMode} />
            <CommonSubHead text="On Program" />

            <div className="flex justify-center items-center w-full">
                <GaugeComponent
                    type="semicircle"
                    arc={{
                        colorArray: ['#f87171', '#f9a8d4', '#fde047', '#84cc16'],
                        padding: 0.02,
                        subArcs: [
                            { limit: 50 },
                            { limit: 65 },
                            { limit: 80 },
                            {}
                        ]
                    }}
                    pointer={{ type: 'blob', animationDelay: 0 }}
                    value={averageScore}
                    labels={{
                        valueLabel: {
                            style: {
                                fontSize: "30px",
                                fill: darkMode ? "#fff" : "#000",  // Set text color based on dark mode
                                fontWeight: "bold",
                            },
                            formatTextValue: (value) => `${value}%`,
                            hide: false,
                        },
                    }}
                    style={{ width: '100%', height: '200px' }}  // Adjust the size of the gauge to fit the container
                />
            </div>
        </div>
    </div>
);

export default AverageScoreSection;
