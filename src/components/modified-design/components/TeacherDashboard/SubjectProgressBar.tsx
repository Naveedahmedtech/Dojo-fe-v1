import React from 'react';

const SubjectProgressBar = ({ subject }: any) => {
    const progressPercentage = parseFloat(subject.overallAverageGrade.replace('%', ''));

    return (
        <div key={subject.subjectId} className="mb-4 relative">
            <div className="flex items-center">
                <h3
                    className="text-sm mr-4 text-gray-500 truncate max-w-xs sm:max-w-sm lg:max-w-[60px]"
                    title={subject.subjectName} // Tooltip for full subject name
                >
                    {subject.subjectName}
                </h3>
                <div className="flex-grow flex items-center relative">
                    {/* "Done" part of the progress */}
                    <div
                        className="h-2 bg-gradient-to-tr from-[#6D3AFF] to-[#4A3AFF] rounded-full"
                        style={{ width: `${progressPercentage}%`, marginLeft: '-0.375rem' }} // Adjusting for circle overlap
                    ></div>

                    {/* "Not done" part of the progress */}
                    <div
                        className="h-2 bg-gray-200 rounded-full"
                        style={{ width: `${100 - progressPercentage}%`, marginLeft: '0.125rem' }} // Slight gap between done and not done
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default SubjectProgressBar;
