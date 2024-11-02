import React, { useEffect, useState } from 'react';
import { SERVER_URL } from '../../api';

interface Feedback {
    _id: string;
    category: string;
    message: string;
    createdAt: string;
}

interface FeedbackListProps {
    defaultCategory?: string; // Optional default category
    darkMode: boolean;
}

const categories = [
    'Learn Mode',
    'Random Mode',
    'Exam Mode',
    'Stats Page',
    'General',
    'Other'
];

const FeedbackList: React.FC<FeedbackListProps> = ({ defaultCategory = categories[0], darkMode }) => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [category, setCategory] = useState<string>(defaultCategory);

    const textClass = darkMode ? 'text-white' : 'text-gray-800';
    const buttonClass = darkMode ? 'bg-[#FF9934] text-white' : 'bg-blue-500 text-white';
    const cardBgClass = darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white';
    const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';

    useEffect(() => {
        const fetchFeedback = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch(
                    `${SERVER_URL}/feedback/get/${category}?page=${page}&limit=5`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch feedback.');
                }

                const data = await response.json();
                setFeedbacks(data.feedbacks);
                setTotalPages(data.totalPages);
            } catch (error) {
                setError('An error occurred while fetching feedback.');
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();
    }, [category, page]);

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(event.target.value);
        setPage(1); // Reset to the first page on category change
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage((prevPage) => prevPage + 1);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage((prevPage) => prevPage - 1);
    };

    return (
        <div className={`p-6 max-w-3xl mx-auto ${textClass}`}>
            <h2 className="text-3xl font-bold mb-6 text-center">User Feedback</h2>

            {/* Category Selector */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <label htmlFor="category" className="text-lg font-semibold">Category: {category}</label>
                <select
                    id="category"
                    value={category}
                    onChange={handleCategoryChange}
                    className={`p-2 rounded-md border ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#FF9934]`}
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* Loading and Error Messages */}
            {loading && <p className="text-center text-lg font-medium animate-pulse">Loading feedback...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {/* Feedback List */}
            <ul className="space-y-6">
                {feedbacks.map((feedback) => (
                    <li key={feedback._id} className={`p-5 border rounded-lg shadow-sm transition-transform transform hover:scale-105 ${cardBgClass} ${borderClass}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                {new Date(feedback.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {feedback.category}
                            </span>
                        </div>
                        <p className="mt-3 text-base">{feedback.message}</p>
                    </li>
                ))}
            </ul>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-8">
                <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className={`px-5 py-2 rounded-full font-medium shadow-md ${buttonClass} ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Previous
                </button>
                <span className="text-sm font-semibold">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className={`px-5 py-2 rounded-full font-medium shadow-md ${buttonClass} ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default FeedbackList;
