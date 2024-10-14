import { useState, useEffect } from 'react';
import axios from 'axios';
import { SERVER_URL } from '../../api';

interface FetchDataResult {
  data: any[];
  headers: string[];
  error: Error | null;
  isLoading: boolean;
}

const useFetchData = (activeTab: string): FetchDataResult => {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const endpoint = `/admin/${activeTab}`;
        const response = await axios.get(`${SERVER_URL}${endpoint}`);
        setData(response.data);
        if (response.data.length > 0) {
          const columnNames = Object.keys(response.data[0]);
          setHeaders(columnNames);
        }
        setError(null);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  return { data, headers, error, isLoading };
};

export default useFetchData;