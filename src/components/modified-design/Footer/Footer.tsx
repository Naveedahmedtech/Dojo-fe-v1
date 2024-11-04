import React, { useState } from 'react';
import { SERVER_URL } from '../../../../api';

interface FooterProps {
    darkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ darkMode }) => {
    const textClass = darkMode ? 'text-white' : 'text-gray-800';
    const subTextClass = darkMode ? 'text-gray-400' : 'text-gray-600';
    const bgClass = darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-blue-100';
    const inputBgClass = darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
    const buttonBgClass = 'bg-[#FF9934] hover:opacity-60 transition';

    const [feedback, setFeedback] = useState('');
    const [category, setCategory] = useState('');
    const [otherCategory, setOtherCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false); // State to control form visibility

    const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFeedback(e.target.value);
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value);
        if (e.target.value !== 'Other') {
            setOtherCategory('');
        }
    };

    const handleOtherCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtherCategory(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const selectedCategory = category === 'Other' ? otherCategory : category;
        const feedbackData = {
            userId: 'sampleUserId',
            category: selectedCategory,
            message: feedback
        };

        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await fetch(`${SERVER_URL}/feedback/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit feedback');
            }

            setFeedback('');
            setCategory('');
            setOtherCategory('');
            setSuccessMessage('Thank you for your feedback! We appreciate your input and will use it to improve our services.');

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setErrorMessage('An error occurred while submitting feedback. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className={`${bgClass} py-6 px-6`}>
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
                <div className="p-6 space-y-4 text-center">
                    <h2 className={`text-2xl font-extrabold ${textClass}`}>We Value Your Feedback</h2>
                    <p className={`${subTextClass} text-lg`}>Let us know how we can improve.</p>

                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsFormVisible(!isFormVisible)}
                        className={`w-full px-4 py-2 mt-4 rounded-full text-white font-semibold ${buttonBgClass} shadow-md`}
                    >
                        {isFormVisible ? 'Hide Feedback Form' : 'Share Your Feedback'}
                    </button>

                    {/* Feedback Form */}
                    {isFormVisible && (
                        <div className="space-y-6 mt-6">
                            {successMessage && (
                                <div className="flex justify-center items-center p-4 mb-4 text-green-700 bg-green-100 rounded-lg transition-opacity duration-500">
                                    <svg className="w-8 h-8 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 7.707 10.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" />
                                    </svg>
                                    {successMessage}
                                </div>
                            )}
                            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

                            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                                <select
                                    className={`w-full p-3 rounded-lg ${inputBgClass} border border-gray-300 focus:border-[#FF9934] focus:ring-2 focus:ring-[#FF9934] transition-shadow placeholder-gray-400 shadow-md`}
                                    value={category}
                                    onChange={handleCategoryChange}
                                    required
                                >
                                    <option value="" disabled>Select feedback category</option>
                                    <option value="Learn Mode">Learn Mode</option>
                                    <option value="Random Mode">Random Mode</option>
                                    <option value="Exam Mode">Exam Mode</option>
                                    <option value="Stats Page">Stats Page</option>
                                    <option value="General">General</option>
                                    <option value="Other">Other</option>
                                </select>

                                {category === 'Other' && (
                                    <input
                                        type="text"
                                        className={`w-full p-3 rounded-lg ${inputBgClass} border border-gray-300 focus:border-[#FF9934] focus:ring-2 focus:ring-[#FF9934] transition-shadow placeholder-gray-400 shadow-md`}
                                        placeholder="Please specify..."
                                        value={otherCategory}
                                        onChange={handleOtherCategoryChange}
                                        required
                                    />
                                )}

                                <textarea
                                    className={`w-full h-32 p-4 rounded-lg ${inputBgClass} border border-gray-300 focus:border-[#FF9934] focus:ring-2 focus:ring-[#FF9934] transition-shadow placeholder-gray-400 resize-none shadow-md`}
                                    placeholder="Share your thoughts here..."
                                    value={feedback}
                                    onChange={handleFeedbackChange}
                                    required
                                />
                                <button
                                    type="submit"
                                    className={`w-full md:w-auto px-8 py-3 rounded-full text-white font-semibold ${buttonBgClass} shadow-lg`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
            <div className="text-center mt-8 text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
