import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { SERVER_URL } from '../../api';
import { useAuth } from '../context/AuthProvider';
import '../App.css';

interface SearchBarHomeProps {
  onSearch: (results: any[]) => void;
  darkMode: boolean; // Add darkMode prop
  navigateToChapter: any
}

const SearchBarHome: React.FC<SearchBarHomeProps> = ({ onSearch, darkMode, navigateToChapter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [noResults, setNoResults] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [selectedChapterInfo, setSelectedChapterInfo] = useState<{ className: string; subjectName: string; chapter_name: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const { userInfo } = useAuth();
  const messageRef = useRef<HTMLDivElement>(null);

  // Close suggestions on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultContainerRef.current && !resultContainerRef.current.contains(event.target as Node) && !inputRef.current?.contains(event.target as Node)) {
        clearSearch();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch search suggestions
  const fetchSuggestions = async (query: string) => {
    if (query) {
      try {
        const response = await axios.get<any[]>(`${SERVER_URL}/search/chapters?query=${query}`);
        const filteredResults = filterUserResults(response.data);
        setSuggestions(filteredResults);
        setNoResults(filteredResults.length === 0);
        onSearch(filteredResults);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    } else {
      clearSearch();
    }
  };

  const filterUserResults = (results: any[]) => {
    if (!userInfo) return [];
    return results.filter(chapter =>
      userInfo.class_info.some(classInfo =>
        classInfo.subjects.some(subject =>
          subject.chapters.some(c => c._id === chapter._id)
        )
      )
    );
  };

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), [userInfo]);

  useEffect(() => {
    debouncedFetchSuggestions(searchTerm);
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [searchTerm, debouncedFetchSuggestions]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setNoResults(false);
    onSearch([]);
  };

  const handleResultClick = (chapter: any) => {
    if (!userInfo) return;
    let chapterFound = false;
    userInfo.class_info.forEach(classInfo => {
      classInfo.subjects.forEach(subject => {
        const foundChapter = subject.chapters.find(c => c._id === chapter._id);
        if (foundChapter) {
          setSelectedChapterInfo({ className: classInfo.class_name, subjectName: subject.subject_name, chapter_name: foundChapter.chapter_name });
          setShowMessage(true);
          chapterFound = true;
           navigateToChapter(classInfo.class_name, subject.subject_name, foundChapter.chapter_name);
        }
      });
    });
    if (!chapterFound) {
      setSelectedChapterInfo(null);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        className={`w-full min-w-[330px] h-12 pl-12 pr-12 rounded-lg  focus:outline-none text-black shadow-sm transition duration-200 ease-in-out ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-black'
          }`}
        style={{ borderRadius: '8px' }}
        type="text"
        placeholder="Search chapters by name"
        value={searchTerm}
        onChange={handleInputChange}
      />
      <img
        className="absolute left-4 top-3.5"
        width="20"
        height="20"
        src="https://img.icons8.com/ios/20/FF9934/search--v1.png"
        alt="search"
      />
      {searchTerm && (
        <button className="absolute right-4 top-3.5 focus:outline-none" onClick={clearSearch}>
          <img
            width="20"
            height="20"
            src="https://img.icons8.com/fluency-systems-regular/20/FF9934/delete-sign--v1.png"
            alt="clear"
            className="hover:opacity-80 transition-opacity duration-150"
          />
        </button>
      )}
      {suggestions.length > 0 && (
        <div ref={resultContainerRef} className={`absolute z-50 mt-2 w-full rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'}`}>
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id || index}
              className={`relative px-4 py-2 cursor-pointer transition duration-200 ease-in-out ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-orange-200'
                }`}
              onClick={() => handleResultClick(suggestion)}
            >
              {suggestion.chapter_name}
              {showMessage && selectedChapterInfo && selectedChapterInfo.chapter_name === suggestion.chapter_name && (
                <div ref={messageRef} className={`absolute top-0 right-0 mt-[-4px] mr-[-4px] p-2 rounded-md shadow-md ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <div className={`text-orange-500`}>
                    {selectedChapterInfo.subjectName}, {selectedChapterInfo.className}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {noResults && suggestions.length === 0 && (
        <div ref={resultContainerRef} className={`absolute z-50 mt-2 w-full rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'}`}>
          <div className="px-4 py-2">No results found</div>
        </div>
      )}
    </div>
  );
};

export default SearchBarHome;
