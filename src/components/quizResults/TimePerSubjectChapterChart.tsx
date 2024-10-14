import React from 'react';
import { VictoryPie, VictoryLegend, VictoryLabel } from 'victory';
import ChapterLegend from '../modified-design/components/StudentDashboard/ChapterLegend';
import ChapterPieChart from '../modified-design/components/StudentDashboard/ChapterPieChart';
import SubjectLegend from '../modified-design/components/StudentDashboard/SubjectLegend';
import SubjectPieChart from '../modified-design/components/StudentDashboard/SubjectPieChart';
import CommonHead from '../modified-design/components/StudentDashboard/CommonHead';
import CommonSubHead from '../modified-design/components/StudentDashboard/CommonSubHead';

interface TimePerSubjectChapterChartProps {
  subjectData: { x: string; y: number; label: string }[];
  chapterData: { x: string; y: number; label: string }[];
  onSliceClick: (name: string) => void;
  darkMode: any
}

const TimePerSubjectChapterChart: React.FC<TimePerSubjectChapterChartProps> = ({
  subjectData,
  chapterData,
  onSliceClick,
  darkMode
}) => {
  const [view, setView] = React.useState<'subject' | 'chapter'>('subject');
  const [selectedSubject, setSelectedSubject] = React.useState<string | null>(null);

  const colorScale = [
    "#FF5733", "#FFC300", "#C70039", "#900C3F", "#581845",
    "#2C3E50", "#F39C12", "#E74C3C", "#9B59B6", "#3498DB"
  ];

  const handlePieClick = (name: string) => {
    if (view === 'subject') {
      setSelectedSubject(name);
      onSliceClick(name);
      setView('chapter');
    } else {
      setSelectedSubject(null);
      onSliceClick('');
      setView('subject');
    }
  };

  const handleLegendClick = (name: string) => {
    handlePieClick(name.split('\n')[0]);
  };

  React.useEffect(() => {
    if (selectedSubject) {
      setView('chapter');
    } else {
      setView('subject');
    }
  }, [selectedSubject]);


  return (
    <div >
      <div className="flex flex-col h-full" >
        {view === 'subject' ? (
          <>
            <CommonHead text="Time spent" darkMode={darkMode} />
            <CommonSubHead text="Per Subject" />
            <div className="flex-grow flex items-center">
              <div className="w-full h-full">
                <SubjectPieChart
                  data={subjectData}
                  colorScale={colorScale}
                  handlePieClick={handleLegendClick}
                  setView={setView}
                />
              </div>
            </div>
          </>
        ) : (
          <>
              <CommonHead text="Time spent" darkMode={darkMode} />
            <CommonSubHead text="Per Chapter" />
            <div className="flex-grow flex items-center">
              <div className="w-full h-full">
                <ChapterPieChart
                  data={chapterData}
                  colorScale={colorScale}
                  handlePieClick={handleLegendClick}
                  setView={setView}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TimePerSubjectChapterChart;
