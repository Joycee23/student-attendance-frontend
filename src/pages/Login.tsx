import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Admin users will be redirected to admin page by App.js routing
      navigate("/dashboard");
    } else {
      console.log("Login failed:", result);
      setError(result.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="login-screen">
      {/* Left Section - Image */}
      <div className="login-image-section">
        <div className="image-overlay"></div>
        <div className="image-content">
          <h1 className="image-title">Student Attendance System</h1>
          <div className="image-button-container">
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="login-form-section">
        <div className="login-form-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <h1 className="form-title">Hello Again!</h1>
            <p className="form-subtitle">Welcome Back</p>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <div className="input-with-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="input-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <input
                  id="email"
                  className="form-input"
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-with-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="input-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <input
                  className="form-input"
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Login"}
            </button>

            <div className="form-footer">
              <span className="forgot-link">Forgot Password?</span>
              <Link to="/register" className="register-link">
                Don't have an account yet?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
