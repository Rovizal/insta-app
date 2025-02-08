import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Swal from "sweetalert2";

const RegisterForm = () => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    //  Validasi password secara real-time
    if (name === "confirmPassword") {
      if (value !== form.password) {
        setPasswordError("Passwords tidak sama!");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords tidak sama!");
      Swal.fire({
        icon: "error",
        title: "Registrasi Gagal",
        text: "Password tidak sama!",
      });
      return;
    }

    try {
      const response = await API.post("/register", {
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
      });

      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Registrasi Berhasil",
          text: "Mengalihkan...",
          timer: 2000,
          showConfirmButton: false,
        });

        setTimeout(() => navigate("/"), 2000);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Something went wrong",
          text: "Unexpected response from the server!",
        });
      }
    } catch (error) {
      console.error("Registration Error:", error.response);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        let errorMessages = Object.values(errors).flat().join("\n");

        Swal.fire({
          icon: "error",
          title: "Registrasi Gagal",
          text: errorMessages || "Validation failed, please check your inputs!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Registrasi Gagal",
          text: error.response?.data?.message || "Something went wrong!",
        });
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${passwordError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
              onChange={handleChange}
              required
            />
            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
          </div>

          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition duration-300">
            Register
          </button>
        </form>

        <p className="text-gray-600 text-sm text-center mt-4">
          Already have an account?{" "}
          <span className="text-blue-500 hover:underline cursor-pointer" onClick={() => navigate("/")}>
            Please Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
