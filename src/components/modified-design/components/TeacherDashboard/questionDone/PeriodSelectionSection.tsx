import { VictoryChart, VictoryAxis, VictoryLine, VictoryScatter, VictoryTheme } from 'victory';

const PeriodSelectionSection = ({ selectedPeriod, handlePeriodClick, calendarData }:any) => (
    <div className="bg-gradient-to-b from-amber-50 to-sky-50 text-black p-8 rounded-lg shadow-md w-[500px] h-[380px] py-4">
        <h2 className="text-md mb-4 text-center font-bold">Questions done</h2>
        <div className="flex text-sm space-x-2 justify-end mt-4">
            {['1W', '1M', '6M'].map((period) => (
                <button
                    key={period}
                    onClick={() => handlePeriodClick(period)}
                    className={`btn bg-gray-200 ${selectedPeriod === period ? 'bg-gray-900 text-white' : ''}`}
                >
                    {period}
                </button>
            ))}
        </div>
        <div className="flex flex-col gap-4">
            {selectedPeriod && (
                <VictoryChart theme={VictoryTheme.material} height={240}>
                    <VictoryAxis
                        tickFormat={(x) => x}
                        style={{
                            axis: { stroke: 'gray' },
                            tickLabels: { fontSize: 8, padding: 5 },
                        }}
                    />
                    <VictoryAxis
                        dependentAxis
                        tickFormat={(y) => `${y}`}
                        style={{
                            axis: { stroke: 'gray' },
                            tickLabels: { fontSize: 8, padding: 5 },
                        }}
                    />
                    <VictoryLine
                        data={calendarData}
                        x="x"
                        y="y"
                        style={{ data: { stroke: '#0284c7', strokeWidth: 2 } }}
                    />
                    <VictoryScatter
                        data={calendarData}
                        x="x"
                        y="y"
                        style={{ data: { fill: '#fff', stroke: '#0284c7', strokeWidth: 2 } }}
                        size={5}
                    />
                </VictoryChart>
            )}
        </div>
    </div>
);

export default PeriodSelectionSection;
