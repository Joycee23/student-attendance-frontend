import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    studentCode: "",
    lecturerCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const {
      fullName,
      email,
      password,
      confirmPassword,
      role,
      studentCode,
      lecturerCode,
    } = formData;

    // --- Validation ---
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (role === "student" && !studentCode) {
      setError("Student code is required for students");
      setLoading(false);
      return;
    }

    if (role === "lecturer" && !lecturerCode) {
      setError("Lecturer code is required for lecturers");
      setLoading(false);
      return;
    }

    // --- Process form data ---
    const registerData = {
      fullName,
      email,
      password,
      role,
      ...(role === "student" && { studentCode }),
      ...(role === "lecturer" && { lecturerCode }),
    };

    console.log("Submitting data:", registerData);
    const result = await register(registerData);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setError(result.message || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <main className="register-main">
      <div className="register-container">
        <div className="register-paper">
          <h1 className="register-title">Student Attendance System</h1>
          <h2 className="register-subtitle">Sign Up</h2>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role */}
            <div className="form-group">
              <label htmlFor="role" className="form-label">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="form-control select-input"
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
              </select>
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <div className="input-group">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  className="form-control"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-group">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="form-control"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Student / Lecturer fields */}
            {formData.role === "student" && (
              <div className="form-group">
                <label htmlFor="studentCode" className="form-label">Student Code</label>
                <div className="input-group">
                  <span className="input-icon">📛</span>
                  <input
                    type="text"
                    id="studentCode"
                    name="studentCode"
                    required
                    className="form-control"
                    placeholder="Student Code"
                    value={formData.studentCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {formData.role === "lecturer" && (
              <div className="form-group">
                <label htmlFor="lecturerCode" className="form-label">Lecturer Code</label>
                <div className="input-group">
                  <span className="input-icon">🎓</span>
                  <input
                    type="text"
                    id="lecturerCode"
                    name="lecturerCode"
                    required
                    className="form-control"
                    placeholder="Lecturer Code"
                    value={formData.lecturerCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  className="form-control"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="toggle password visibility"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  className="form-control"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="toggle confirm password visibility"
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <p className="register-footer">
              Already have an account?{" "}
              <Link to="/login" className="link-primary">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Register;
