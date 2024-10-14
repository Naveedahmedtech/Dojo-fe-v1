import SubjectProgressBar from './SubjectProgressBar';
import Scale from './Scale';
import CommonSubHead from '../StudentDashboard/CommonSubHead';

const SubjectProgressList = ({ data }: any) => {
    return (
        <div className="w-full max-h-96 overflow-y-auto">
            <CommonSubHead text='Per Subject' />
            <div>
                <div className="relative">
                    {data.map((subject: any) => (
                        <SubjectProgressBar key={subject.subjectId} subject={subject} />
                    ))}
                    <Scale />
                </div>
            </div>
        </div>
    );
};

export default SubjectProgressList;
