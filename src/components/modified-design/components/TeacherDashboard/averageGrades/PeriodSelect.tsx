import React from 'react';

interface PeriodSelectProps {
    periods: string[];
    selectedPeriod: string;
    handlePeriodClick: (period: string) => void;
}

const PeriodSelect: React.FC<PeriodSelectProps> = ({ periods, selectedPeriod, handlePeriodClick }) => {
    return (
        <div className="flex space-x-2 p-1 bg-gray-100 rounded-xl">
            {periods.map((period) => (
                <button
                    key={period}
                    onClick={() => handlePeriodClick(period)}
                    className={`py-2 px-4 rounded-xl transition-all duration-200 ${selectedPeriod === period ? 'bg-[#21123D] text-white' : 'bg-transparent text-gray-500'
                        }`}
                >
                    {period}
                </button>
            ))}
        </div>
    );
};

export default PeriodSelect;
