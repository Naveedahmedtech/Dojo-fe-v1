import { useState, useEffect } from 'react';
import axios from 'axios';
import { SERVER_URL } from '../../api';
import Popup from '../components/Popup';

interface University {
  _id: string;
  university_name: string;
}

interface SectionAddUniversityProps {
  universities: University[];
  fetchUniversities: () => void;
}

const SectionAddUniversity: React.FC<SectionAddUniversityProps> = ({ fetchUniversities }) => {
  const [universityName, setUniversityName] = useState('');
  const [popupMessages, setPopupMessages] = useState<{ type: 'success' | 'error'; message: string }[]>([]);

  useEffect(() => {
    setPopupMessages([]);
  }, []);

  const handleAddUniversity = async () => {
    try {
      await axios.post(`${SERVER_URL}/add/universities`, { university_name: universityName });
      await fetchUniversities();
      setUniversityName('');
      setPopupMessages(prevMessages => [...prevMessages, { type: 'success', message: 'University added successfully.' }]);
    } catch (error) {
      console.error('Error adding university:', error);
      setPopupMessages(prevMessages => [...prevMessages, { type: 'error', message: 'Error adding university. Please try again.' }]);
    }
  };

  const handleClosePopup = (index: number) => {
    setPopupMessages(prevMessages => prevMessages.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-10">
      <h2 className="text-lg text-customColor mb-4">UNIVERSITY</h2>
      <div className="flex flex-col">
        <input type="text" placeholder="University Name" value={universityName} onChange={(e) => setUniversityName(e.target.value)} className="input-field mb-4" style={{ width: '300px' }}/>
        <button onClick={handleAddUniversity} className="btn btn-orange" style={{ width: '200px' }}>Add University</button>
      </div>
      {popupMessages.map((popup, index) => (
        <Popup key={index} type={popup.type === 'success' ? 'green' : 'red'} message={popup.message} onClose={() => handleClosePopup(index)} />
      ))}
    </div>
  );
};

export default SectionAddUniversity;