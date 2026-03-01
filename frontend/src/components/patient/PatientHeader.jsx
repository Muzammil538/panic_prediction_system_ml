import { useNavigate } from "react-router-dom";

export default function PatientHeader() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-semibold text-gray-800">
        Welcome, {name}
      </h1>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}