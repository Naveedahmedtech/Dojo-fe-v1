import React from 'react';

interface Result {
    user: string;
    result: {
        is_correct: boolean;
        is_not_correct: boolean;
        not_answered_yet: boolean;
        to_fill_user_answer: string;
    };
}

interface Record {
    q_number: number;
    book_author: string;
    book_name: string;
    results: Result[];
}

interface RecordsTableProps {
    records: Record[];
    darkMode: string | boolean;
}

const RecordsTable: React.FC<RecordsTableProps> = ({ records, darkMode }) => {
    return (
        <div className={`overflow-x-auto ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-md rounded-lg`}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className={`${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b">Question Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b">Student Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b">Book Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b">Book Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b">Result</th>
                    </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                    {records.map((record) => (
                        record.results
                            .filter(userResult => userResult.result.is_correct || userResult.result.is_not_correct)
                            .map((userResult, index) => (
                                <tr key={`${record.q_number}-${index}`} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap border-b">{record.q_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap border-b">{userResult.user}</td>
                                    <td className="px-6 py-4 whitespace-nowrap border-b">{record.book_author}</td>
                                    <td className="px-6 py-4 whitespace-nowrap border-b">{record.book_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap border-b">
                                        <span
                                            className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${userResult.result.is_not_correct
                                                ? 'bg-red-800 text-white'
                                                : userResult.result.is_correct
                                                    ? 'bg-green-800 text-white'
                                                    : '' // No "Not Answered" will be displayed
                                                }`}
                                        >
                                            {userResult.result.is_not_correct
                                                ? 'Wrong'
                                                : userResult.result.is_correct
                                                    ? 'Correct'
                                                    : ''}
                                        </span>
                                    </td>
                                </tr>
                            ))
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecordsTable;
