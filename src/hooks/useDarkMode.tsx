import { useState, useEffect } from 'react';
import localforage from 'localforage';

const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const fetchDarkMode = async () => {
      try {
        const storedDarkMode = await localforage.getItem<boolean>('isDarkMode');
        if (storedDarkMode !== null && storedDarkMode !== undefined) {
          setIsDarkMode(storedDarkMode); 
        }
      } catch (error) {
        console.error('Error fetching dark mode preference:', error);
      }
    };

    fetchDarkMode();
  }, []); 

  const toggleDarkMode = (darkMode: boolean) => {
    setIsDarkMode(darkMode);
    localforage.setItem<boolean>('isDarkMode', darkMode); 
  };

  return [isDarkMode, toggleDarkMode];
};

export default useDarkMode;