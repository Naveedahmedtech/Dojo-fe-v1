import React from 'react';

const SelectInputsForDashboard = ({
    selectedCourseId,
    handleCourseChange,
    selectedClassId,
    handleClassChange,
    courses,
    classes,
}:any) => (
    <div>
        <select value={selectedCourseId} onChange={handleCourseChange}>
            {courses.map((course:any) => (
                <option key={course.id} value={course.id}>{course.name}</option>
            ))}
        </select>
        <select value={selectedClassId} onChange={handleClassChange}>
            {classes.map((cls:any) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
        </select>
    </div>
);

export default SelectInputsForDashboard;
