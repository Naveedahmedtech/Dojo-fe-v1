import { useState, useEffect, useMemo } from 'react';
import CustomDropdown from './CustomDropdown';

const SelectChapter = ({
    selectedCourseId,
    selectedClassId,
    selectedSubjectId,
    selectedChapterId,
    chapters,
    handleChapterChange,
}: any) => {
    const [selectedChapter, setSelectedChapter] = useState<{ value: string; label: string } | null>(null);

    const chapterOptions = useMemo(() => {
        return chapters.map((chapter: any) => ({
            value: chapter._id,
            label: chapter.chapter_name,
        }));
    }, [chapters]);

    useEffect(() => {
        if (chapterOptions.length > 0 && selectedChapterId) {
            const initialSelectedChapter = chapterOptions.find((option:any) => option.value === selectedChapterId) || null;
            setSelectedChapter(initialSelectedChapter);
        }
    }, [selectedChapterId, chapterOptions]);

    useEffect(() => {
        if (!selectedChapter && chapterOptions.length > 0) {
            const defaultChapter = chapterOptions[0];
            setSelectedChapter(defaultChapter); // Set the first chapter as default if none is selected
            handleChapterChange(defaultChapter.value);
        }
    }, [selectedChapter, chapterOptions, handleChapterChange]);

    const handleChapterSelect = (selectedOption: { value: string; label: string }) => {
        setSelectedChapter(selectedOption);
        handleChapterChange(selectedOption.value);
    };

    return (
        <div className="">
            {selectedCourseId && selectedClassId && selectedSubjectId && (
                <CustomDropdown
                    options={chapterOptions}
                    selectedOption={selectedChapter}
                    onOptionSelect={handleChapterSelect}
                    placeholder="All chapters"
                />
            )}
        </div>
    );
};

export default SelectChapter;
