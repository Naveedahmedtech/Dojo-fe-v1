import SeeDetailsButton from './SeeDetailsButton'
import CommonHead from '../StudentDashboard/CommonHead'

const AverageTimeSpent = ({ averageTimeSpent, darkMode }:any) => {
  return (
      <div className={darkMode ? "bg-gray-800 text-white  h-full p-4 rounded-lg" : "bg-white text-black p-4 h-full rounded-lg"}>
          <CommonHead text="Average time spent" darkMode={darkMode} />
          {/* <CommonSubHead text="On platform"  /> */}
          <div className='flex flex-row justify-center items-center space-x-4'>
              <img width="48" height="48" src="https://img.icons8.com/color/48/clock--v4.png" alt="clock" />
              <div className="text-[22px] font-semibold">{averageTimeSpent}</div>
          </div>
          <SeeDetailsButton to="/time-stats" label="See Details" />
      </div>
  )
}

export default AverageTimeSpent
