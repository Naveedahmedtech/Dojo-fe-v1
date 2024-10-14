const CommonHead = ({ text, darkMode }: { text: string, darkMode: any }) => {
    return (
        <h2 className={`text-center text-2xl font-bold mb-6 border-b-2 pb-2 ${darkMode ? 'text-white border-gray-600' : 'text-black border-gray-200'}`}>
            {text}
        </h2>
    )
}

export default CommonHead;
