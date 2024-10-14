import { useEffect } from 'react';
import CustomDropdown from './CustomDropdown'; // Ensure you import the CustomDropdown component

const SelectSubjectQuestionDone = ({
    selectedCourseId,
    selectedClassId,
    selectedSubjectId,
    subjects,
    handleSubjectChange,
    selectedSubject,
    setSelectedSubject
}: any) => {

    useEffect(() => {
        if (selectedSubjectId) {
            const subject = subjects.find((subject: any) => subject._id === selectedSubjectId);
            if (subject) {
                setSelectedSubject({ value: subject._id, label: subject.subject_name });
            }
        } else {
            setSelectedSubject(null);
        }
    }, [selectedSubjectId, subjects]);

    const handleSubjectSelect = (selectedOption: { value: string; label: string }) => {
        setSelectedSubject(selectedOption);
        handleSubjectChange(selectedOption.value); // Trigger the parent's handler
    };

    const subjectOptions = subjects.map((subject: any) => ({
        value: subject._id,
        label: subject.subject_name,
    }));

    return (
        <div className="flex items-start">
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

export default SelectSubjectQuestionDone;
