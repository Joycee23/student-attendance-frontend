import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { usersAPI, statisticsAPI, settingsAPI, classesAPI } from "../services/api";
import ClassManagement from "./ClassManagement";
import "../styles/Admin.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
    studentCode: "",
    lecturerCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // User management states
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Class management states
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    role: "student",
    studentCode: "",
    lecturerCode: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  const { register, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('dark');
    setIsDark(savedTheme ? JSON.parse(savedTheme) : false);

    if (activeTab === 1) {
      fetchUsers();
    } else if (activeTab === 2) {
      fetchClasses();
    } else if (activeTab === 4) {
      fetchStats();
    }
  }, [activeTab]);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem('dark', JSON.stringify(!isDark));
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      console.log("Fetching users for management...");
      const response = await usersAPI.getAll({});
      console.log("Users API response:", response.data);

      // Use the same extractData helper function for consistency
      const extractData = (response: any) => {
        console.log("Users response data structure:", response.data);
        if (response.data?.data?.users) return response.data.data.users;
        if (response.data?.users) return response.data.users;
        if (response.data?.data && Array.isArray(response.data.data)) return response.data.data;
        if (Array.isArray(response.data)) return response.data;
        return [];
      };

      const usersData = extractData(response);
      console.log("Extracted users data:", usersData);
      console.log("Users count:", Array.isArray(usersData) ? usersData.length : 0);

      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      console.log("Fetching classes for management...");
      const response = await classesAPI.getAll({});
      console.log("Classes API response:", response.data);

      // Use the same extractData helper function for consistency
      const extractData = (response: any) => {
        console.log("Classes response data structure:", response.data);
        if (response.data?.data?.classes) return response.data.data.classes;
        if (response.data?.classes) return response.data.classes;
        if (response.data?.data && Array.isArray(response.data.data)) return response.data.data;
        if (Array.isArray(response.data)) return response.data;
        return [];
      };

      const classesData = extractData(response);
      console.log("Extracted classes data:", classesData);
      console.log("Classes count:", Array.isArray(classesData) ? classesData.length : 0);

      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log("Fetching stats...");

      // Helper function to extract data from various response structures
      const extractData = (response: any) => {
        console.log("Response data structure:", response.data);
        if (response.data?.data?.users) return response.data.data.users;
        if (response.data?.data?.classes) return response.data.data.classes;
        if (response.data?.users) return response.data.users;
        if (response.data?.classes) return response.data.classes;
        if (response.data?.data && Array.isArray(response.data.data)) return response.data.data;
        if (Array.isArray(response.data)) return response.data;
        return [];
      };

      // Fetch total users
      const usersResponse = await usersAPI.getAll({});
      console.log("Users API response:", usersResponse);
      const usersData = extractData(usersResponse);
      const totalUsers = Array.isArray(usersData) ? usersData.length : 0;
      const activeUsers = Array.isArray(usersData) ?
        usersData.filter((user: any) => user.isActive !== false).length : 0;
      console.log("Total users:", totalUsers, "Active users:", activeUsers);

      // Fetch total classes
      const classesResponse = await classesAPI.getAll({});
      console.log("Classes API response:", classesResponse);
      const classesData = extractData(classesResponse);
      const totalClasses = Array.isArray(classesData) ? classesData.length : 0;
      const activeClasses = Array.isArray(classesData) ?
        classesData.filter((cls: any) => cls.isActive !== false).length : 0;
      console.log("Total classes:", totalClasses, "Active classes:", activeClasses);

      // Fetch other stats
      const overviewResponse = await statisticsAPI.getOverview();
      const overviewData = overviewResponse.data?.data || {};
      console.log("Overview data:", overviewData);

      const statsData = {
        ...overviewData,
        totalUsers,
        activeUsers,
        totalClasses,
        activeClasses,
      };
      console.log("Final stats:", statsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalClasses: 0,
        activeClasses: 0,
        todayAttendance: 0,
        attendanceRate: 0,
      });
    }
  };

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
  };

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

    const { fullName, email, password, role, studentCode, lecturerCode } = formData;

    if (!fullName || !email || !password) {
      setError("Please fill in all required fields");
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

    const registerData = {
      fullName,
      email,
      password,
      role,
      ...(role === "student" && { studentCode }),
      ...(role === "lecturer" && { lecturerCode }),
    };

    console.log("Admin creating user:", registerData);
    const result = await register(registerData);

    if (result.success) {
      setSuccess(result.message);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: "student",
        studentCode: "",
        lecturerCode: "",
      });
      if (activeTab === 1) fetchUsers(); // Refresh user list
    } else {
      setError(result.message || "Registration failed");
    }

    setLoading(false);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      role: user.role || "student",
      studentCode: user.studentCode || "",
      lecturerCode: user.lecturerCode || "",
    });
    setEditDialogOpen(true);
  };

  const handleDeleteUser = async (userId: any) => {
    const confirmMessage = "Are you sure you want to delete this user?\n\nNote: This action cannot be undone.";
    if (window.confirm(confirmMessage)) {
      try {
        console.log("Deleting user with ID:", userId);
        const response = await usersAPI.delete(userId);
        console.log("Delete response:", response);
        fetchUsers(); // Refresh the list
        alert("User deleted successfully!");
      } catch (error: any) {
        console.error("Error deleting user:", error);
        const errorMessage = error.response?.data?.message || "Failed to delete user";
        alert(`Failed to delete user: ${errorMessage}`);
      }
    }
  };

  const handleToggleUserStatus = async (userId: any) => {
    try {
      await usersAPI.toggleStatus(userId);
      fetchUsers(); // Refresh the list
      alert("User status updated successfully!");
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Failed to update user status");
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);

    const { fullName, email, role, studentCode, lecturerCode } = editFormData;

    if (!fullName || !email) {
      alert("Please fill in all required fields");
      setEditLoading(false);
      return;
    }

    if (role === "student" && !studentCode) {
      alert("Student code is required for students");
      setEditLoading(false);
      return;
    }

    if (role === "lecturer" && !lecturerCode) {
      alert("Lecturer code is required for lecturers");
      setEditLoading(false);
      return;
    }

    const updateData = {
      fullName,
      email,
      role,
      ...(role === "student" && { studentCode }),
      ...(role === "lecturer" && { lecturerCode }),
    };

    try {
      await usersAPI.update(editingUser._id || editingUser.id, updateData);
      setEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers(); // Refresh the list
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditClass = (cls: any) => {
    // TODO: Implement class edit functionality
    alert("Class edit functionality will be implemented soon");
  };

  const handleDeleteClass = async (classId: any) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await classesAPI.delete(classId);
        fetchClasses(); // Refresh the list
        alert("Class deleted successfully!");
      } catch (error) {
        console.error("Error deleting class:", error);
        alert("Failed to delete class");
      }
    }
  };

  const handleToggleClassStatus = async (classId: any) => {
    // TODO: Implement class status toggle if API supports it
    alert("Class status toggle functionality will be implemented soon");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={`admin-dashboard ${isDark ? 'dark' : ''}`}>
      {/* Header */}
      <div className="admin-header">
        <div className="header-left">
          <div className="logo-section">
            <img className="admin-logo" src="https://img.lovepik.com/png/20231002/Hand-drawn-vector-line-cartoon-company-administrator-quirky-phone-accessories_66289_wh860.png" alt="Admin" />
            <span className="admin-text">ADMIN</span>
          </div>
        </div>
        <div className="header-right">
          <div className="search-box">
            <button className="search-icon">
              <svg className="w-5 text-gray-600 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
            <input type="search" placeholder="Search" className="search-input" />
          </div>
          <div className="header-actions">
            <button onClick={toggleTheme} className="theme-toggle">
              {isDark ? (
                <svg width="24" height="24" className="fill-current text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ) : (
                <svg width="24" height="24" className="fill-current text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <div className="divider"></div>
            <button className="menu-btn logout-btn" onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 011.5 1.5v2.25a.75.75 0 01-1.5 0V6a.75.75 0 00-.75-.75h-7.5a.75.75 0 00-.75.75v13.5c0 .414.336.75.75.75h7.5a.75.75 0 00.75-.75v-1.5a.75.75 0 01.75-.75H18a1.5 1.5 0 011.5 1.5v1.5A3 3 0 0116.5 21h-7.5a3 3 0 01-3-3V4.5a3 3 0 013-3h7.5zM22.5 9a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 0022.5 9z" clipRule="evenodd" />
                <path d="M16.5 12a.75.75 0 01.75-.75H21a.75.75 0 010 1.5h-3.75A.75.75 0 0116.5 12z" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-content">
          <ul className="sidebar-menu">
            <li className="menu-section">
              <div className="menu-label">Main</div>
            </li>
            <li>
              <button
                className={`menu-item ${activeTab === 4 ? 'active' : ''}`}
                onClick={() => handleTabChange(4)}
              >
                <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0H9"></path>
                </svg>
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${activeTab === 1 ? 'active' : ''}`}
                onClick={() => handleTabChange(1)}
              >
                <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <span>Manage Users</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${activeTab === 2 ? 'active' : ''}`}
                onClick={() => handleTabChange(2)}
              >
                <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                </svg>
                <span>Classes</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${activeTab === 5 ? 'active' : ''}`}
                onClick={() => handleTabChange(5)}
              >
                <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>Class Management</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${activeTab === 0 ? 'active' : ''}`}
                onClick={() => handleTabChange(0)}
              >
                <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>Create User</span>
              </button>
            </li>
            <li className="menu-section">
              <div className="menu-label">Settings</div>
            </li>
            <li>
              <button
                className={`menu-item ${activeTab === 3 ? 'active' : ''}`}
                onClick={() => handleTabChange(3)}
              >
                <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Dashboard Overview */}
        {activeTab === 4 && (
          <>
            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3 className="stat-title">Total Users</h3>
                    <p className="stat-value">{stats?.totalUsers || 0}</p>
                    <p className="stat-subtitle">Active: {stats?.activeUsers || 0}</p>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-icon">🎓</div>
                  <div className="stat-info">
                    <h3 className="stat-title">Total Classes</h3>
                    <p className="stat-value">{stats?.totalClasses || 0}</p>
                    <p className="stat-subtitle">Active: {stats?.activeClasses || 0}</p>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <h3 className="stat-title">Today's Attendance</h3>
                    <p className="stat-value">{stats?.todayAttendance || 0}</p>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <h3 className="stat-title">Attendance Rate</h3>
                    <p className="stat-value">{stats?.attendanceRate || 0}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Dashboard Sections */}
            <div className="dashboard-sections">
              {/* Recent Activities */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Recent Activities</h3>
                  <button className="card-action">See all</button>
                </div>
                <div className="card-content">
                  <div className="activity-section">
                    <div className="section-label">Today</div>
                    <div className="activity-list">
                      <div className="activity-item">
                        <div className="activity-avatar">N</div>
                        <div className="activity-content">
                          <p>New user registered: <span className="activity-highlight">John Doe</span></p>
                          <span className="activity-time">2 hours ago</span>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-avatar"></div>
                        <div className="activity-content">
                          <p>Class session completed: <span className="activity-highlight">CS101</span></p>
                          <span className="activity-time">4 hours ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Quick Actions</h3>
                </div>
                <div className="card-content">
                  <div className="quick-actions">
                    <button className="quick-action-btn" onClick={() => handleTabChange(0)}>
                      <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      <span>Add User</span>
                    </button>
                    <button className="quick-action-btn" onClick={() => handleTabChange(2)}>
                      <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                      </svg>
                      <span>Manage Classes</span>
                    </button>
                    <button className="quick-action-btn" onClick={() => handleTabChange(3)}>
                      <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span>Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Create User Tab */}
        {activeTab === 0 && (
          <div className="content-section">
            <div className="content-card">
              <h2 className="section-title">Create New User Account</h2>
              <p className="section-subtitle">
                Default admin account: admin@edu.vn (contact backend team to set up initial password)
              </p>

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

              <form onSubmit={handleSubmit} className="user-form">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="form-input"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="form-input"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {formData.role === "student" && (
                  <div className="form-group">
                    <label className="form-label">Student Code</label>
                    <input
                      type="text"
                      name="studentCode"
                      required
                      className="form-input"
                      placeholder="Student Code"
                      value={formData.studentCode}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {formData.role === "lecturer" && (
                  <div className="form-group">
                    <label className="form-label">Lecturer Code</label>
                    <input
                      type="text"
                      name="lecturerCode"
                      required
                      className="form-input"
                      placeholder="Lecturer Code"
                      value={formData.lecturerCode}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="password-input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      className="form-input"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Manage Users Tab */}
        {activeTab === 1 && (
          <div className="content-section">
            <div className="content-card">
              <h2 className="section-title">User Management</h2>
              {loadingUsers ? (
                <div className="loading-container">
                  <div className="loading">
                    <div className="cube">
                      <div className="face front"></div>
                      <div className="face back"></div>
                      <div className="face right"></div>
                      <div className="face left"></div>
                      <div className="face top"></div>
                      <div className="face bottom"></div>
                    </div>
                  </div>
                  <p>Loading users...</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user: any) => (
                        <tr key={user._id || user.id}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">
                                {user.fullName.charAt(0).toUpperCase()}
                              </div>
                              {user.fullName}
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-chip role-${user.role}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td>
                            <span className={`status-chip ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-icon btn-edit"
                                onClick={() => handleEditUser(user)}
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-icon"
                                onClick={() => handleToggleUserStatus(user._id || user.id)}
                                title={user.isActive ? "Deactivate" : "Activate"}
                              >
                                {user.isActive ? "🚫" : "✅"}
                              </button>
                              <button
                                className="btn-icon btn-delete"
                                onClick={() => handleDeleteUser(user._id || user.id)}
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 2 && (
          <div className="content-section">
            <div className="content-card">
              <h2 className="section-title">Class Management</h2>
              {loadingClasses ? (
                <div className="loading-container">
                  <div className="loading">
                    <div className="cube">
                      <div className="face front"></div>
                      <div className="face back"></div>
                      <div className="face right"></div>
                      <div className="face left"></div>
                      <div className="face top"></div>
                      <div className="face bottom"></div>
                    </div>
                  </div>
                  <p>Loading classes...</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Class Name</th>
                        <th>Course Code</th>
                        <th>Lecturer</th>
                        <th>Status</th>
                        <th>Students</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map((cls: any) => (
                        <tr key={cls._id || cls.id}>
                          <td>{cls.name || 'Unnamed Class'}</td>
                          <td>{cls.code || cls.courseCode || 'N/A'}</td>
                          <td>{cls.lecturerName || cls.lecturer?.fullName || 'N/A'}</td>
                          <td>
                            <span className={`status-chip ${cls.isActive !== false ? 'status-active' : 'status-inactive'}`}>
                              {cls.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>{cls.studentIds?.length || cls.students?.length || 0}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-icon btn-edit"
                                onClick={() => handleEditClass(cls)}
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-icon"
                                onClick={() => handleToggleClassStatus(cls._id || cls.id)}
                                title={cls.isActive !== false ? "Deactivate" : "Activate"}
                              >
                                {cls.isActive !== false ? "🚫" : "✅"}
                              </button>
                              <button
                                className="btn-icon btn-delete"
                                onClick={() => handleDeleteClass(cls._id || cls.id)}
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Class Management Tab */}
        {activeTab === 5 && (
          <ClassManagement />
        )}

        {/* Settings Tab */}
        {activeTab === 3 && (
          <div className="content-section">
            <div className="content-card">
              <h2 className="section-title">System Settings</h2>
              <p className="section-subtitle">
                System settings and configuration will be implemented here.
              </p>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editDialogOpen && editingUser && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Edit User</h3>
                <button
                  className="modal-close"
                  onClick={() => setEditDialogOpen(false)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdateUser} className="modal-body">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditFormChange}
                    required
                    className="form-select"
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="form-input"
                    placeholder="Full Name"
                    value={editFormData.fullName}
                    onChange={handleEditFormChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="form-input"
                    placeholder="Email Address"
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                  />
                </div>

                {editFormData.role === "student" && (
                  <div className="form-group">
                    <label className="form-label">Student Code</label>
                    <input
                      type="text"
                      name="studentCode"
                      required
                      className="form-input"
                      placeholder="Student Code"
                      value={editFormData.studentCode}
                      onChange={handleEditFormChange}
                    />
                  </div>
                )}

                {editFormData.role === "lecturer" && (
                  <div className="form-group">
                    <label className="form-label">Lecturer Code</label>
                    <input
                      type="text"
                      name="lecturerCode"
                      required
                      className="form-input"
                      placeholder="Lecturer Code"
                      value={editFormData.lecturerCode}
                      onChange={handleEditFormChange}
                    />
                  </div>
                )}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setEditDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={editLoading}
                  >
                    {editLoading ? "Updating..." : "Update User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;