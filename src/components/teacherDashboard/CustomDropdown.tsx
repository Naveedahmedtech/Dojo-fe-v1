import React, { useState, useEffect, useRef } from 'react';

const CustomDropdown = ({ options, selectedOption, onOptionSelect, placeholder, color }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleOptionClick = (option: any) => {
        onOptionSelect(option);
        setIsOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={`${color === "blue" ? "custom-dropdown-blue" : "custom-dropdown"}`} ref={dropdownRef}>
            <div
                className={`${color === "blue" ? "custom-select-blue" : "custom-select"}  ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedOption ? selectedOption.label : placeholder}
                <span className="arrow"></span>
            </div>
            {isOpen && (
                <div className={`${color === "blue" ? "custom-options-blue" : "custom-options"}`}>
                    {options.map((option: any) => (
                        <div
                            key={option.value}
                            className={`${color === "blue" ? "custom-option-blue" : "custom-option"}`}
                            onClick={() => handleOptionClick(option)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
