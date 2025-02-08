import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Swal from "sweetalert2";

const LoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //  Validasi jika email atau password kosong
    if (!form.email.trim() || !form.password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Silakan isi email dan password terlebih dahulu",
      });
      return;
    }

    setLoading(true); // Set loading ke true saat request dimulai

    try {
      const response = await API.post("/login", form);

      //  Simpan token & user di sessionStorage
      sessionStorage.setItem("authToken", response.data.token);
      sessionStorage.setItem("loggedInUser", JSON.stringify(response.data.user));

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.response?.data?.message || "Invalid email or password!",
      });
    } finally {
      setLoading(false); // Set loading ke false setelah request selesai
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md mx-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border rounded" />
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded transition duration-300 flex justify-center items-center" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-gray-600 text-sm text-center mt-4">
          {`Don't have an account?`}{" "}
          <span className="text-blue-500 hover:underline cursor-pointer" onClick={() => navigate("/register")}>
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
