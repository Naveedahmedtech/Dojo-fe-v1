import { useState } from 'react';
import CustomDropdown from './CustomDropdown'; // Make sure to import the CustomDropdown component

interface SortDropdownProps {
    onSortChange: (sortOption: string) => void;
}

const SortDropdown = ({ onSortChange }: SortDropdownProps) => {
    const [sortOption, setSortOption] = useState({ value: 'Alphabetically', label: 'Alphabetically (A-Z)' });

    const options = [
        { value: 'Alphabetically', label: 'Alphabetically (A-Z)' },
        { value: 'ReverseAlphabetically', label: 'Alphabetically (Z-A)' },
    ];

    const handleSortChange = (selectedOption: { value: string, label: string }) => {
        setSortOption(selectedOption);
        onSortChange(selectedOption.value); // Correctly triggers the parent's handler
    };

    return (
        <div className="flex justify-center items-center mb-4">
            <h3 className="mr-2 text-sm font-medium">Sort by:</h3>
            <div className="w-[200px] px-2 mb-4 mr-8">
                <CustomDropdown
                    options={options}
                    selectedOption={sortOption}
                    onOptionSelect={handleSortChange}
                    placeholder="Select an option"
                />
            </div>
        </div>
    );
};

export default SortDropdown;
