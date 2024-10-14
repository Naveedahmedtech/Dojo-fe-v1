import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { SERVER_URL } from '../../api';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface SearchBarDashboardProps {
  onSearch: (query: string) => void;
}

interface User {
  _id: string;
  first_name: string;
  last_name: string;
}

const SearchBarDashboard: React.FC<SearchBarDashboardProps> = ({ }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [noResults, setNoResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleUserClick = (userId: string) => {
    navigate(`/results/${userId}`);
    setSearchTerm('');
    setSuggestions([]);
  };

  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      setNoResults(false);
      return;
    }
    try {
      const url = `${SERVER_URL}/search/users?name=${encodeURIComponent(query)}`;
      const response = await axios.get<User[]>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuggestions(response.data);
      setNoResults(response.data.length === 0);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
    }
  };

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), [token]);

  useEffect(() => {
    debouncedFetchSuggestions(searchTerm);
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [searchTerm, debouncedFetchSuggestions]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const clearSearchTerm = () => {
    setSearchTerm('');
    setSuggestions([]);
    setNoResults(false);
  };

  const handleResultClick = (user: User) => {
    handleUserClick(user._id);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      resultContainerRef.current &&
      !resultContainerRef.current.contains(event.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(event.target as Node)
    ) {
      setSuggestions([]);
      setNoResults(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-[310px] mb-4 relative -mt-8">
      <div className="relative">
        <input
          ref={inputRef}
          className="w-full h-10 pl-12 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#FF9934] text-black shadow-lg"
          type="text"
          placeholder="Search students by name"
          value={searchTerm}
          onChange={handleInputChange}
        />
        <img
          className="absolute left-4 top-1/2 transform -translate-y-1/2"
          width="20"
          height="20"
          src="https://img.icons8.com/ios/20/FF9934/search--v1.png"
          alt="search"
        />
        {searchTerm && (
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 focus:outline-none"
            onClick={clearSearchTerm}
          >
            <img
              width="20"
              height="20"
              src="https://img.icons8.com/fluency-systems-regular/20/FF9934/delete-sign--v1.png"
              alt="clear"
            />
          </button>
        )}
      </div>
      {(suggestions.length > 0 || noResults) && (
        <div
          ref={resultContainerRef}
          className="absolute z-1 w-full max-h-60 mt-2 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg"
        >
          {suggestions.map((user) => (
            <div
              key={user._id}
              className="px-4 py-2 text-gray-800 hover:bg-orange-200 cursor-pointer rounded-lg"
              onClick={() => handleResultClick(user)}
            >
              {user.first_name} {user.last_name}
            </div>
          ))}
          {noResults && (
            <div className="px-4 py-2 text-gray-800 rounded-lg">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBarDashboard;
