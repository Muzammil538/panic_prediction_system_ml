import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient"   // default role
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/register", form);
      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md border border-gray-200">

        <h2 className="text-2xl font-semibold text-center mb-6 text-blue-700">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            id="name"
            name="name"
            placeholder="Full Name"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          {/* ✅ ROLE SELECTION */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Register As
            </label>

            <select
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Register
          </button>

        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}