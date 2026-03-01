import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/login", form);

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("role", res.data.role);

      // 🔥 ROLE BASED REDIRECT
      if (res.data.role === "doctor") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/patient/dashboard");
      }

    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}