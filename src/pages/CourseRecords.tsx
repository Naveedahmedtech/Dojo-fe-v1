import { useEffect, useState, useCallback } from 'react';
import { SERVER_URL } from '../../api';
import axios from 'axios';
import { useAuth } from '../context/AuthProvider';
import SelectInputsSection from '../components/modified-design/components/TeacherDashboard/averageGrades/SelectInputsSection';
import RecordsTable from '../components/modified-design/components/RecordsTable';

const CourseRecords = ({ darkMode }: any) => {
    const [courses, setCourses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [chapters, setChapters] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [records, setRecords] = useState<any[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [selectedChapterId, setSelectedChapterId] = useState<string>('');
    const [loadingRecords, setLoadingRecords] = useState<boolean>(false);

    const { userInfo, token } = useAuth();

    useEffect(() => {
        if (selectedCourseId) {
            fetchClasses(selectedCourseId);
        }
    }, [selectedCourseId]);

    useEffect(() => {
        fetchCourses();
    }, [userInfo]);

    useEffect(() => {
        if (selectedSubjectId) {
            fetchChapters();
        }
    }, [selectedSubjectId]);

    useEffect(() => {
        if (userInfo?._id && selectedCourseId && selectedSubjectId && selectedChapterId) {
            fetchCourseRecords();
        }
    }, [userInfo?._id, selectedCourseId, selectedSubjectId, selectedChapterId]);

    const fetchCourses = useCallback(async () => {
        try {
            const response: any = await axios.get<any[]>(`${SERVER_URL}/getspecific/courses/${userInfo?._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCourses(response?.data?.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    }, [userInfo?._id, token]);

    const fetchClasses = useCallback(async (courseId: string) => {
        try {
            const response = await axios.get<any[]>(`${SERVER_URL}/getspecific/courses/${courseId}/classes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setClasses(response.data);
        } catch (error) {
            setClasses([]);
            console.error('Error fetching classes:', error);
        }
    }, [token]);

    const fetchSubjects = useCallback(async (classId: string) => {
        try {
            const response = await axios.get(`${SERVER_URL}/getspecific/classes/${classId}/subjects`);
            setSubjects(response.data);
            setSelectedSubjectId('');
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    }, []);

    const fetchChapters = useCallback(async () => {
        try {
            const response = await axios.get(`${SERVER_URL}/getspecific/subjects/${selectedSubjectId}/chapters`);
            setChapters(response.data);
        } catch (error) {
            console.error('Error fetching chapters:', error);
        }
    }, [selectedSubjectId]);

    const fetchCourseRecords = useCallback(async () => {
        try {
            setLoadingRecords(true)
            const response = await axios.get(`${SERVER_URL}/teacher/get-course-data?userId=${userInfo?._id}&courseId=${selectedCourseId}&subjectId=${selectedSubjectId}&chapterId=${selectedChapterId}`);
            setRecords(response?.data?.result);
        } catch (error) {
            console.error('Error fetching course records:', error);
        } finally {
            setLoadingRecords(false)
        }
    }, [userInfo?._id, selectedCourseId, selectedSubjectId, selectedChapterId]);

    const handleCourseChange = useCallback((courseId: string) => {
        setSelectedCourseId(courseId);
    }, []);

    const handleClassChange = useCallback((classId: string) => {
        setSelectedClassId(classId);
        fetchSubjects(classId);
    }, [fetchSubjects]);

    const handleSubjectChange = useCallback((subjectId: string) => {
        setSelectedSubjectId(subjectId);
    }, []);

    const handleChapterChange = useCallback((chapterId: string) => {
        setSelectedChapterId(chapterId);
    }, []);


    return (
        <div className='main-container-space'>
            <div className="flex items-center justify-around flex-wrap gap-y-2">
                <div className="">
                    <SelectInputsSection
                        selectedCourseId={selectedCourseId}
                        selectedClassId={selectedClassId}
                        selectedSubjectId={selectedSubjectId}
                        courses={courses}
                        classes={classes}
                        subjects={subjects}
                        handleCourseChange={handleCourseChange}
                        handleClassChange={handleClassChange}
                        handleSubjectChange={handleSubjectChange}
                        darkMode={darkMode}
                        selectedChapterId={selectedChapterId}
                        chapters={chapters}
                        handleChapterChange={handleChapterChange}
                    />
                </div>
            </div>
            <div className="mt-4 px-10 lg:px-60">
                {
                    loadingRecords ? (
                        <div className="flex justify-center items-center mt-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-400"></div>
                        </div>
                    ) :
                        <RecordsTable records={records} darkMode={darkMode} />
                }
            </div>
        </div>
    )
}

export default CourseRecords;
