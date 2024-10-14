import  { useEffect, useState } from 'react';
import CustomDropdown from './CustomDropdown';

const SelectSubject = ({
    selectedCourseId,
    selectedClassId,
    selectedSubjectId,
    subjects,
    handleSubjectChange,
    setSelectedCourseId
}: any) => {
    const [selectedSubject, setSelectedSubject] = useState<{ value: string; label: string } | null>(null);

    const handleSubjectSelect = (selectedOption: { value: string; label: string }) => {
        setSelectedSubject(selectedOption);
        handleSubjectChange(selectedOption.value);
        setSelectedCourseId('');
    };

    const subjectOptions = subjects.map((subject: any) => ({
        value: subject._id,
        label: subject.subject_name,
    }));

    useEffect(() => {
        const initialSelectedSubject = subjectOptions.find((option:any) => option.value === selectedSubjectId) || null;
        setSelectedSubject(initialSelectedSubject);
    }, [selectedSubjectId, subjects]);

    useEffect(() => {
        if (!selectedSubjectId && subjects.length > 0) {
            handleSubjectChange(subjects[0]._id);
        }
    }, [selectedSubjectId, subjects, handleSubjectChange]);

    return (
        <div className="">
            {selectedCourseId && selectedClassId && (
                <CustomDropdown
                    options={subjectOptions}
                    selectedOption={selectedSubject}
                    onOptionSelect={handleSubjectSelect}
                    placeholder="All subjects"
                />
            )}
        </div>
    );
};

export default SelectSubject;
