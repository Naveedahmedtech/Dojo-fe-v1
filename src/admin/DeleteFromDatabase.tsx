import React, { useState } from 'react';
import useFetchData from '../hooks/useFetchData';
import useDarkMode from '../hooks/useDarkMode';
import axios from 'axios';
import { SERVER_URL } from '../../api';
import ConfirmationModal from './ConfirmationModal';

const tabs = ['users', 'universities', 'courses', 'classes', 'subjects', 'chapters', 'questions'];

const DeleteFromDatabase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('users');
  const { data, headers, error, isLoading } = useFetchData(activeTab); 
  const isDarkMode = useDarkMode();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const handleTabClick = (tabName: string) => setActiveTab(tabName);

  const handleDelete = async () => {
    if (selectedId) {
      try {
        const endpoint = `/${activeTab}/${selectedId}`;
        await axios.delete(`${SERVER_URL}/delete/${endpoint}`);
        setSelectedId(null);
        setIsConfirmationModalOpen(false);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleDeleteConfirmation = (id: string) => {
    setSelectedId(id);
    setConfirmationMessage(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`);
    setIsConfirmationModalOpen(true);
  };

  const getClassNames = (tab: string) => `focus:outline-none ${activeTab === tab ? 'text-customColor border-b-2 border-customColor' : 'text-gray-400'}`;

  return (
    <div className={`w-full p-6 rounded-lg relative ${isDarkMode ? 'dark' : ''}`}>
      <h2 className="font-bold text-center mb-5">CURRENT DATABASE</h2>
      <div className="flex justify-around mb-4">
        {tabs.map((tab) => (
          <button key={tab} className={getClassNames(tab)} onClick={() => handleTabClick(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div>
        {isLoading ? ( 
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <p className="mt-10 text-center">Error fetching data: {error.message}</p>
        ) : (
          <table className={`w-full px-4 border-collapse ${isDarkMode ? 'table-bordered dark' : 'table-bordered'}`}>
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className={`border ${isDarkMode ? 'border-gray-200' : 'border-black'} border-solid px-4 py-2 ${isDarkMode ? 'text-gray' : 'text-black'} text-left`}>{header}</th>
                ))}
                <th className={`border ${isDarkMode ? 'border-gray-200' : 'border-black'} border-solid px-4 py-2 ${isDarkMode ? 'text-gray' : 'text-black'} text-left`}>DELETE</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={headers.length + 1} className={`border ${isDarkMode ? 'border-gray-200' : 'border-black'} px-4 py-2 text-center`}>
                    No data available
                  </td>
                </tr>
              ) : (
                data.map((item: any, index: number) => (
                  <tr key={index}>
                    {headers.map((header, headerIndex) => (
                      <td key={headerIndex} className={`border ${isDarkMode ? 'border-gray-200' : 'border-black'} px-4 py-2`} style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                        {typeof item[header] === 'object' && item[header] !== null ? JSON.stringify(item[header]) : String(item[header])}
                      </td>
                    ))}
                    <td className={`border ${isDarkMode ? 'border-gray-200' : 'border-black'} px-4 py-2`} style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                      <span className="px-2"></span>
                      <button onClick={() => handleDeleteConfirmation(item._id)}>
                        <img width="24" height="24" src="https://img.icons8.com/wired/24/FF9934/filled-trash.png" alt="delete" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        message={confirmationMessage}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmationModalOpen(false)}
      />
    </div>
  );
};

export default DeleteFromDatabase;