import { VictoryChart, VictoryLine, VictoryScatter, VictoryAxis, VictoryTheme } from 'victory';
import CommonSubHead from '../../StudentDashboard/CommonSubHead';
import CommonHead from '../../StudentDashboard/CommonHead';
import PeriodSelect from '../averageGrades/PeriodSelect';

const TimeSpentPerDate = ({ calendarData, handlePeriodClick, selectedPeriod, darkMode }:any) => (
    <div className={darkMode ? "bg-gray-800 text-white p-4 rounded-lg" : "bg-white text-black p-4 rounded-lg"}>
        <CommonHead text="Time Spent" darkMode={darkMode} />
        <CommonSubHead text="Per Date" />
        <div className="flex justify-end mt-4">
            <PeriodSelect
                periods={['1W', '1M', '6M']}
                selectedPeriod={selectedPeriod}
                handlePeriodClick={handlePeriodClick}
            />
        </div>
        <VictoryChart theme={VictoryTheme.material} height={200}>
            <VictoryAxis
                tickFormat={(x) => x}
                style={{
                    axis: { stroke: 'gray' },
                    tickLabels: { fontSize: 8, padding: 3 },
                }}
            />
            <VictoryAxis
                dependentAxis
                tickFormat={(y) => `${y} min`}
                style={{
                    axis: { stroke: 'gray' },
                    tickLabels: { fontSize: 8, padding: 2 },
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
    </div>
);

export default TimeSpentPerDate;
