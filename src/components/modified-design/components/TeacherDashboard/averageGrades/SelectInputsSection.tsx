import React from 'react';
import SelectInputsForDashboard from '../../../../teacherDashboard/SelectInputsForDashboard';
import SelectSubject from '../../../../teacherDashboard/SelectSubject';
import SelectChapter from '../../../../teacherDashboard/SelectChapter';


interface SelectInputsSectionProps {
    selectedCourseId: string;
    selectedClassId: string;
    selectedSubjectId: string;
    courses: any[];
    classes: any[];
    subjects: any[];
    handleCourseChange: (id: string) => void;
    handleClassChange: (id: string) => void;
    handleSubjectChange: (id: string) => void;
    darkMode: string | boolean;
    selectedChapterId?: any;
    chapters?: any[];
    handleChapterChange?: any;
}

const SelectInputsSection: React.FC<SelectInputsSectionProps> = ({
    selectedCourseId,
    selectedClassId,
    selectedSubjectId,
    courses,
    classes,
    subjects,
    handleCourseChange,
    handleClassChange,
    handleSubjectChange,
    selectedChapterId,
    chapters,
    handleChapterChange,
}) => (
    <div className="flex justify-around flex-wrap">
        <SelectInputsForDashboard
            selectedCourseId={selectedCourseId}
            handleCourseChange={handleCourseChange}
            selectedClassId={selectedClassId}
            handleClassChange={handleClassChange}
            courses={courses}
            classes={classes}
        />
        <div className='flex gap-5 flex-wrap  justify-center'>
            <SelectSubject
                selectedCourseId={selectedCourseId}
                selectedClassId={selectedClassId}
                selectedSubjectId={selectedSubjectId}
                subjects={subjects}
                handleSubjectChange={handleSubjectChange}
            />
            {
                chapters &&
                <SelectChapter
                    selectedCourseId={selectedCourseId}
                    selectedClassId={selectedClassId}
                    selectedSubjectId={selectedSubjectId}
                    selectedChapterId={selectedChapterId}
                    chapters={chapters}
                    handleChapterChange={handleChapterChange}
                />
            }
        </div>
    </div>
);

export default SelectInputsSection;
