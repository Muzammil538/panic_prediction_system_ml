import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg font-bold">
            MH
          </div>
          <span className="text-xl font-semibold text-gray-800">
            Panic attack detection
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-6 text-gray-600">
          <a href="#about" className="hover:text-blue-600 transition">About</a>
          <a href="#symptoms" className="hover:text-blue-600 transition">Symptoms</a>
          <a href="#treatment" className="hover:text-blue-600 transition">Treatment</a>
          <a href="#faq" className="hover:text-blue-600 transition">FAQ</a>
        </div>

        {/* Login Button */}
        <Link
          to="/login"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}