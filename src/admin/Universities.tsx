import axios from "axios";
import { SERVER_URL } from "../../api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Universities = () => {
  const [universities, setUniversities] = useState<any[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    setFilteredUniversities(
      universities.filter((university) =>
        university.university_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, universities]);

  const fetchUniversities = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/admin/universities`);
      setUniversities(response?.data);
      setFilteredUniversities(response?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (<div className="flex justify-center items-center mt-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-400"></div>
    </div>);
  }

  const handleUniClick = (url:string) => {
    navigate(url)
    // location.href = url;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Universities</h1>
      <input
        type="text"
        placeholder="Search a university"
        className="block w-full max-w-lg mx-auto mb-6 p-2 border text-black border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredUniversities.map((university) => (
          <div
            key={university._id}
            className="bg-white shadow-md rounded-lg p-4 text-center cursor-pointer hover:shadow-lg transition duration-300"
            onClick={() => handleUniClick(`/main?universityId=${university?._id}`)}
          >
            <span className="text-lg font-semibold text-black">{university.university_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Universities;
