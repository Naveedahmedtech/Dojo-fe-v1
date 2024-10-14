import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import axios from 'axios';
import { SERVER_URL } from '../../api';
import ExcelJS from 'exceljs';
import Popup from '../components/Popup';
import renderLatex from '../utils/renderLatex';

interface University {
  _id: string;
  university_name: string;
}

interface Course {
  _id: string;
  course_name: string;
}

interface Class {
  _id: string;
  class_name: string;
}

interface Subject {
  _id: string;
  subject_name: string;
}

interface Chapter {
  _id: string;
  chapter_name: string;
}

interface QuestionPayload {
  chapter_ref: string;
  parsedData: Question[];
}

interface Question {
  q_number: number;
  q_latex_content: string;
  book_author: string;
  book_name: string;
  q_image_url: string;
  q_latex_explanation: string;
  q_latex_explanation_ChatGPT: string;
  q_answertype_tofill: boolean;
  q_answertype_options: {
    latex_content: string;
    image_url: string;
    is_correct: boolean;
  }[];
  q_answertype_options_has_multiple_good_answers: boolean;
}

interface SectionAddQuestionProps {}

const SectionAddQuestion: React.FC<SectionAddQuestionProps> = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<boolean>(false);
  const [isLoadingChapters, setIsLoadingChapters] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(''); 
  const [showErrorPopup, setShowErrorPopup] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showAllRows, setShowAllRows] = useState<boolean>(false);
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (parsedQuestions.length > 0) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  }, [parsedQuestions]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/getall/universities`);
        setUniversities(response.data);
      } catch (error) {
        console.error('Error fetching universities:', error);
      }
    };

    fetchUniversities();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!selectedUniversityId) {
          setCourses([]);
          return;
        }
        const response = await axios.get(`${SERVER_URL}/getspecific/universities/${selectedUniversityId}/courses`);
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [selectedUniversityId]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if (!selectedCourseId) {
          setClasses([]);
          return;
        }
        const response = await axios.get(`${SERVER_URL}/getspecific/courses/${selectedCourseId}/classes`);
        setClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, [selectedCourseId]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClassId) {
        setSubjects([]);
        return;
      }
      setIsLoadingSubjects(true);
      try {
        const response = await axios.get(`${SERVER_URL}/getspecific/classes/${selectedClassId}/subjects`);
        setSubjects(response.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [selectedClassId]);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!selectedSubjectId) {
        setChapters([]);
        return;
      }
      setIsLoadingChapters(true);
      try {
        const response = await axios.get(`${SERVER_URL}/getspecific/subjects/${selectedSubjectId}/chapters`);
        setChapters(response.data);
      } catch (error) {
        console.error('Error fetching chapters:', error);
      } finally {
        setIsLoadingChapters(false);
      }
    };
    fetchChapters();
  }, [selectedSubjectId]);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const workbook = new ExcelJS.Workbook();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      if (!data) return;
      const arrayBuffer = data as ArrayBuffer;
      await workbook.xlsx.load(arrayBuffer);
      const sheet = workbook.getWorksheet(1);
      if (!sheet) {
        return;
      }
      const parsedData: Question[] = [];
      const imageUrls: string[] = [];
      await sheet.eachRow(async (row, rowNumber) => {
        if (rowNumber === 1) return; 
        const parsedQuestion: Question = {
          q_number: row.getCell(1).value as number,
          q_latex_content: (row.getCell(2).value || '') as string,
          book_author: (row.getCell(3).value || '') as string,
          book_name: (row.getCell(4).value || '') as string,
          q_image_url: '',
          q_latex_explanation: (row.getCell(6).value || '') as string,
          q_latex_explanation_ChatGPT: (row.getCell(7).value || '') as string,
          q_answertype_tofill: !!row.getCell(8).value,
          q_answertype_options: [],
          q_answertype_options_has_multiple_good_answers: !!row.getCell(10).value,
        };
        let imageUrl = row.getCell(5).value as string | ExcelJS.Cell;
        if (typeof imageUrl === 'object' && imageUrl !== null && 'text' in imageUrl) {
          imageUrl = imageUrl.text;
        }
        if (typeof imageUrl === 'string' && imageUrl.trim()) {
          imageUrls.push(imageUrl);
          parsedQuestion.q_image_url = imageUrl;
        } 
        const hasOptions = !!row.getCell(9).value;
        if (hasOptions) {
          for (let i = 11; i <= 38; i += 3) {
            let optionImageUrl = row.getCell(i + 1).value as string | ExcelJS.Cell;
            if (typeof optionImageUrl === 'object' && optionImageUrl !== null && 'text' in optionImageUrl) {
              optionImageUrl = optionImageUrl.text;
            }
            if (typeof optionImageUrl === 'string' && optionImageUrl.trim()) {
              imageUrls.push(optionImageUrl);
              parsedQuestion.q_answertype_options.push({
                latex_content: (row.getCell(i).value || '') as string,
                image_url: optionImageUrl,
                is_correct: !!row.getCell(i + 2).value,
              });
            } else {
              parsedQuestion.q_answertype_options.push({
                latex_content: (row.getCell(i).value || '') as string,
                image_url: '',
                is_correct: !!row.getCell(i + 2).value,
              });
            }
          }
        }
        parsedData.push(parsedQuestion);
      });
      parsedData.sort((a, b) => a.q_number - b.q_number);
      setParsedQuestions(parsedData);
      for (const url of imageUrls) {
        if (url.trim()) {  
          try {
            // console.log('Uploading image URL:', url);
            await axios.post(`${SERVER_URL}/upload-image-url`, { imageUrl: url }, {
              headers: {
                'Content-Type': 'application/json',
              },
            });
          } catch (error: any) {
          }
        } 
      }
      setShowPreview(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAddQuestion = async () => {
    try {
      setIsLoading(true);
      if (!selectedChapterId) {
        setErrorMessage('Please select a chapter before adding questions.');
        setShowErrorPopup(true);
        return;
      }
      const payload: QuestionPayload = {
        parsedData: parsedQuestions,
        chapter_ref: selectedChapterId,
      };
      await sendParsedQuestions(payload);
      setParsedQuestions([]);
      setIsLoading(false);
      setShowSuccessPopup(true);
      setSelectedChapterId('');
      handleFileRemoval();
    } catch (error) {
      console.error('Error adding questions:', error);
      setErrorMessage('Error adding questions. Please try again.');
      setShowErrorPopup(true);
      setIsLoading(false);
    }
  };


  const sendParsedQuestions = async (payload: QuestionPayload) => {
    try {
      axios.post(`${SERVER_URL}/add/questions`, payload);
    } catch (error) {
      throw error;
    }
  };

  const handleFileRemoval = () => {
    setUniversities([]);
    setCourses([]);
    setClasses([]);
    setSubjects([]);
    setChapters([]);
    setSelectedUniversityId('');
    setSelectedCourseId('');
    setSelectedClassId('');
    setSelectedSubjectId('');
    setSelectedChapterId('');
    setIsLoadingSubjects(false);
    setIsLoadingChapters(false);
    setParsedQuestions([]);
    setErrorMessage('');
    setShowPreview(false); 
  
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-center mb-4">
        <select
          value={selectedUniversityId}
          onChange={(e) => {
            setSelectedUniversityId(e.target.value);
            setSelectedCourseId('');
            setSelectedClassId('');
            setSelectedSubjectId('');
          }}
          className="input-field mb-2 mr-2"
        >
          <option value="">Select University</option>
          {universities.map((university) => (
            <option key={university._id} value={university._id}>{university.university_name}</option>
          ))}
        </select>
        {selectedUniversityId && (
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setSelectedClassId('');
              setSelectedSubjectId('');
            }}
            className="input-field mb-2 mr-2"
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>{course.course_name}</option>
            ))}
          </select>
        )}
        {selectedCourseId && (
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setSelectedSubjectId('');
            }}
            className="input-field mb-2 mr-2"
          >
            <option value="">Select Class</option>
            {classes.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>{classItem.class_name}</option>
            ))}
          </select>
        )}
        {selectedClassId && (
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="input-field mb-2 mr-2"
          >
            <option value="">Select Subject</option>
            {isLoadingSubjects ? (
              <option>Loading...</option>
            ) : (
              subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.subject_name}</option>
              ))
            )}
          </select>
        )}
        {selectedSubjectId && (
          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="input-field mb-2 mr-2"
          >
            <option value="">Select Chapter</option>
            {isLoadingChapters ? (
              <option>Loading...</option>
            ) : (
              chapters.map((chapter) => (
                <option key={chapter._id} value={chapter._id}>{chapter.chapter_name}</option>
              ))
            )}
          </select>
        )}
      </div>
      <div className="mb-4">
        <div className="flex flex-row mb-8 space-x-10">
      <input
          type="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileUpload}
          ref={fileInputRef}
        />
        {parsedQuestions.length > 0 && (
          <>
          <div className="flex items-center mt-2 border border-customColor rounded text-customColor btn">
            <button onClick={handleFileRemoval}>
              Delete
            </button>
          </div>
           <button
           className="flex items-center mt-2 border border-customColor rounded text-customColor btn"
           onClick={() => setShowAllRows(!showAllRows)}
         >
           {showAllRows ? 'Show Less' : 'Show All Rows'}
         </button>
         </>
        )}
       <button onClick={handleAddQuestion} className="btn btn-orange mt-2 ml-20" style={{ width: '200px' }}>
      {isLoading ? (
      <div className="flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
      ) : (
        'Add Questions'
      )}
    </button>
        </div>
        {parsedQuestions.length > 0 && showPreview && (
            <table className="w-full border-collapse border border-black text-xs mt-2">
              <thead>
                <tr>
                  <th className="border border-black px-4 py-2">Question</th>
                  <th className="border border-black px-4 py-2">Question Number</th>
                  <th className="border border-black px-4 py-2">Book Author</th>
                  <th className="border border-black px-4 py-2">Book Name</th>
                  <th className="border border-black px-4 py-2">Question Latex Content</th>
                  <th className="border border-black px-4 py-2">Question Image URL</th>
                  <th className="border border-black px-4 py-2">Question Latex Explanation</th>
                  <th className="border border-black px-4 py-2">Question Latex Explanation (ChatGPT)</th>
                  <th className="border border-black px-4 py-2">Question Answer Type to Fill</th>
                  <th className="border border-black px-4 py-2">Answer Options</th>
                  <th className="border border-black px-4 py-2">Options Has Multiple Good Answers</th>
                </tr>
              </thead>
              <tbody>
              {parsedQuestions.slice(0, showAllRows ? parsedQuestions.length : 1).map((question, questionIndex) => (
                 <tr key={`question-${question.q_number}`} className="border border-black">
                 <td className="border border-black px-4 py-2">Question {question.q_number}</td>
                 <td className="border border-black px-4 py-2">{question.q_number}</td>
                    <td className="border border-black px-4 py-2">{question.book_author}</td>
                    <td className="border border-black px-4 py-2">{question.book_name}</td>
                    <td className="border border-black px-4 py-2">{renderLatex(question.q_latex_content)}</td>
                    <td className="border border-black px-4 py-2">
                      {question.q_image_url && (
                        <a href={question.q_image_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', maxWidth: '100%' }}>
                          <img src={question.q_image_url} alt={`Encoded Image of Question ${questionIndex + 1}`} style={{ maxWidth: '100%', height: 'auto' }} />
                        </a>
                      )}
                    </td>
                    <td className="border border-black px-4 py-2">{renderLatex(question.q_latex_explanation)}</td>
                    <td className="border border-black px-4 py-2">{renderLatex(question.q_latex_explanation_ChatGPT)}</td>
                    <td className="border border-black px-4 py-2">{question.q_answertype_tofill ? 'Yes' : 'No'}</td>
                    <td className="border border-black px-4 py-2">
                      <ul>
                        {question.q_answertype_options.map((option, optionIndex) => (
                          <li key={`option-${questionIndex}-${optionIndex}`} className="border border-black px-4 py-2">
                            <strong>Option {optionIndex + 1}:</strong><br />
                            <strong>Latex Content:</strong> {renderLatex(option.latex_content)}<br />
                            {option.image_url && (
                              <>
                                <strong>Image Preview:</strong><br />
                                <img src={option.image_url} alt={`Encoded Image of Option ${optionIndex + 1}`} style={{ maxWidth: '100%', height: 'auto' }} />
                              </>
                            )}
                            <strong>Is Correct:</strong> {option.is_correct ? 'Yes' : 'No'}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="border border-black px-4 py-2">{question.q_answertype_options_has_multiple_good_answers ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
      {showSuccessPopup && (
        <Popup type="green" message="Questions added successfully!" onClose={() => setShowSuccessPopup(false)} />
      )}
      {showErrorPopup && (
        <Popup type="red" message={errorMessage} onClose={() => setShowErrorPopup(false)} />
      )}
    </div>
  );
};

export default SectionAddQuestion;
