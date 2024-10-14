import React, { useEffect, useState } from 'react';
import BookImage from '../../styles/icons/book.png';
import CustomDropdown from './CustomDropdown';

interface SelectInputsForDashboardProps {
  selectedCourseId: string;
  handleCourseChange: (courseId: string) => void;
  selectedClassId: string;
  handleClassChange: (classId: string) => void;
  courses: Course[];
  classes: Class[];
}

interface Course {
  _id: string;
  course_name: string;
  years: number[];
}

interface Class {
  _id: string;
  class_name: string;
  year_of_beginning: number;
}

const SelectInputsForDashboard: React.FC<SelectInputsForDashboardProps> = ({
  selectedCourseId,
  handleCourseChange,
  selectedClassId,
  handleClassChange,
  courses,
  classes,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      const firstCourse = courses[0];
      setSelectedCourse({ value: firstCourse._id, label: firstCourse.course_name });
      handleCourseChange(firstCourse._id);
    }
  }, [courses, selectedCourseId, handleCourseChange]);

  useEffect(() => {
    if (selectedCourseId && classes.length > 0 && !selectedClassId) {
      const firstClass = classes[0];
      setSelectedClass({ value: firstClass._id, label: `${firstClass.year_of_beginning} - ${firstClass.class_name}` });
      handleClassChange(firstClass._id);
    }
  }, [classes, selectedClassId, selectedCourseId, handleClassChange]);

  return (
    <div className="flex flex-col md:flex-row items-center">
      <div className="flex items-center mb-4">
        <img src={BookImage} alt="Book" className="mb-4 mr-2" />
        <div className="w-[260px] px-2 mb-4 mr-10">
          <CustomDropdown
            options={courses?.map(course => ({ value: course._id, label: course.course_name }))}
            selectedOption={selectedCourse}
            onOptionSelect={(option:any) => {
              setSelectedCourse(option);
              handleCourseChange(option.value);
            }}
            placeholder="Select Course"
          />
        </div>
      </div>
      {selectedCourseId && (
        <div className="flex items-center mb-4">
          <div className="w-[260px] px-2 mb-4 mr-8">
            <CustomDropdown
              options={classes?.map(classItem => ({
                value: classItem._id,
                label: `${classItem.year_of_beginning} - ${classItem.class_name}`,
              }))}
              selectedOption={selectedClass}
              onOptionSelect={(option:any) => {
                setSelectedClass(option);
                handleClassChange(option.value);
              }}
              placeholder="All classes"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectInputsForDashboard;
