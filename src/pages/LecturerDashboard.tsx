import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { attendanceAPI, statisticsAPI } from "../services/api";
import "../styles/Dashboard.css";

const LecturerDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await attendanceAPI.getSessions({ lecturerId: user?.id });
      const data = response.data?.data || [];
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await statisticsAPI.getLecturerStats(user?.id || "");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCreateSession = async () => {
    setLoading(true);
    try {
      const sessionData = {
        lecturerId: user?.id,
        classId: user?.classes?.[0]?.id || "",
        subject: "Computer Science",
        room: "Room 101",
        startTime: new Date(),
        duration: 60,
      };
      await attendanceAPI.createSession(sessionData);
      alert("Session created successfully!");
      fetchSessions();
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <h6>Lecturer Dashboard</h6>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="sidebar-content">
          <ul className="sidebar-menu">
            <li>
              <button
                className={`menu-item ${activeTab === "dashboard" ? 'active' : ''}`}
                onClick={() => setActiveTab("dashboard")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                </svg>
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${activeTab === "sessions" ? 'active' : ''}`}
                onClick={() => setActiveTab("sessions")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                </svg>
                <span>My Sessions</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${activeTab === "profile" ? 'active' : ''}`}
                onClick={() => setActiveTab("profile")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                </svg>
                <span>Profile</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Navbar */}
        <nav className="dashboard-navbar">
          <div className="navbar-left">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 013-5.25z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="breadcrumb">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb-list">
                  <li className="breadcrumb-item">
                    <span>Dashboard</span>
                  </li>
                  <li className="breadcrumb-item active">
                    <span>Home</span>
                  </li>
                </ol>
              </nav>
              <h6 className="page-title">Home</h6>
            </div>
          </div>

          <div className="navbar-right">
            <div className="search-box">
              <input
                type="text"
                placeholder="Type here"
                className="search-input"
              />
            </div>
            <button className="menu-btn logout-btn" onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 011.5 1.5v2.25a.75.75 0 01-1.5 0V6a.75.75 0 00-.75-.75h-7.5a.75.75 0 00-.75.75v13.5c0 .414.336.75.75.75h7.5a.75.75 0 00.75-.75v-1.5a.75.75 0 01.75-.75H18a1.5 1.5 0 011.5 1.5v1.5A3 3 0 0116.5 21h-7.5a3 3 0 01-3-3V4.5a3 3 0 013-3h7.5zM22.5 9a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 0022.5 9z" clipRule="evenodd" />
                <path d="M16.5 12a.75.75 0 01.75-.75H21a.75.75 0 010 1.5h-3.75A.75.75 0 0116.5 12z" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* Content */}
        <div className="dashboard-content">
          {/* Dashboard Overview */}
          {activeTab === "dashboard" && (
            <>
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                      <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
                      <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Sessions Created</p>
                    <h4 className="stat-value">{stats?.totalSessions || 0}</h4>
                  </div>
                  <div className="stat-footer">
                    <span className="stat-change positive">+{stats?.sessionsThisWeek || 0}</span>
                    <span className="stat-text">this week</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Students Attended</p>
                    <h4 className="stat-value">{stats?.totalStudents || 0}</h4>
                  </div>
                  <div className="stat-footer">
                    <span className="stat-change positive">+{stats?.studentsThisWeek || 0}</span>
                    <span className="stat-text">this week</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Attendance Rate</p>
                    <h4 className="stat-value">{stats?.attendanceRate || 0}%</h4>
                  </div>
                  <div className="stat-footer">
                    <span className="stat-change positive">+{stats?.rateChange || 0}%</span>
                    <span className="stat-text">vs last month</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Active Sessions</p>
                    <h4 className="stat-value">{stats?.activeSessions || 0}</h4>
                  </div>
                  <div className="stat-footer">
                    <span className="stat-change positive">+{stats?.activeThisWeek || 0}</span>
                    <span className="stat-text">currently active</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="actions-grid">
                  <button
                    className="action-btn session-btn"
                    onClick={handleCreateSession}
                    disabled={loading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                    </svg>
                    <span>{loading ? "Creating..." : "Create Session"}</span>
                  </button>
                  <button className="action-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zM21 9.375A.375.375 0 0020.625 9h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zM10.875 18.75a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5zM3.375 15h7.5a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375zm0-3.75h7.5a.375.375 0 00.375-.375v-1.5A.375.375 0 0010.875 9h-7.5A.375.375 0 003 9.375v1.5c0 .207.168.375.375.375z" clipRule="evenodd" />
                    </svg>
                    <span>View Reports</span>
                  </button>
                </div>
              </div>

              {/* Sessions Table */}
              <div className="table-card">
                <div className="table-header">
                  <h6 className="table-title">Recent Sessions</h6>
                  <p className="table-subtitle">{sessions.length} sessions total</p>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Room</th>
                        <th>Status</th>
                        <th>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.slice(0, 6).map((session: any) => (
                        <tr key={session.id}>
                          <td>{session.subject || "Computer Science"}</td>
                          <td>{new Date(session.startTime).toLocaleDateString()}</td>
                          <td>{new Date(session.startTime).toLocaleTimeString()}</td>
                          <td>{session.room || "Room 101"}</td>
                          <td>
                            <span className={`status-badge ${session.status === 'active' ? 'status-present' : 'status-absent'}`}>
                              {session.status || "Ended"}
                            </span>
                          </td>
                          <td>{session.attendanceCount || 0}/{session.expectedStudents || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <div className="sessions-section">
              <div className="sessions-card">
                <h3 className="section-title">My Sessions</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Room</th>
                        <th>Status</th>
                        <th>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session: any) => (
                        <tr key={session.id}>
                          <td>{session.subject || "Computer Science"}</td>
                          <td>{new Date(session.startTime).toLocaleDateString()}</td>
                          <td>{new Date(session.startTime).toLocaleTimeString()}</td>
                          <td>{session.room || "Room 101"}</td>
                          <td>
                            <span className={`status-badge ${session.status === 'active' ? 'status-present' : 'status-absent'}`}>
                              {session.status || "Ended"}
                            </span>
                          </td>
                          <td>{session.attendanceCount || 0}/{session.expectedStudents || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="profile-section">
              <div className="profile-card">
                <h3 className="section-title">Lecturer Profile</h3>
                <div className="profile-info">
                  <div className="profile-avatar">
                    <span>{user?.fullName?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="profile-details">
                    <h4>{user?.fullName}</h4>
                    <p>{user?.email}</p>
                    <p>Lecturer ID: {user?.lecturerCode || "N/A"}</p>
                    <p>Role: {user?.role}</p>
                    <p>Status: {user?.isActive ? "Active" : "Inactive"}</p>
                    <p>Last Login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-links">
              <a href="#">About Us</a>
              <a href="#">Blog</a>
              <a href="#">License</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default LecturerDashboard;