import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { attendanceAPI, statisticsAPI } from "../services/api";
import "../styles/Dashboard.css";

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendanceHistory();
    fetchStats();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      const response = await attendanceAPI.getHistory({});
      const data = response.data?.data || [];
      setAttendanceHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      setAttendanceHistory([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await statisticsAPI.getStudentStats(user?.id || "");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await attendanceAPI.manualCheckIn({
        classId: user?.classes?.[0]?.id || "",
        location: { lat: 0, lng: 0 } // Would get from GPS
      });
      alert("Check-in successful!");
      fetchAttendanceHistory();
    } catch (error) {
      console.error("Check-in error:", error);
      alert("Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "status-present";
      case "late": return "status-late";
      case "absent": return "status-absent";
      default: return "";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "present": return "Present";
      case "late": return "Late";
      case "absent": return "Absent";
      default: return status;
    }
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
            <h6>Student Dashboard</h6>
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
                className={`menu-item ${activeTab === "profile" ? 'active' : ''}`}
                onClick={() => setActiveTab("profile")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                </svg>
                <span>Profile</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${activeTab === "attendance" ? 'active' : ''}`}
                onClick={() => setActiveTab("attendance")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zM21 9.375A.375.375 0 0020.625 9h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zM10.875 18.75a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5zM3.375 15h7.5a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375zm0-3.75h7.5a.375.375 0 00.375-.375v-1.5A.375.375 0 0010.875 9h-7.5A.375.375 0 003 9.375v1.5c0 .207.168.375.375.375z" clipRule="evenodd" />
                </svg>
                <span>Attendance</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${activeTab === "notifications" ? 'active' : ''}`}
                onClick={() => setActiveTab("notifications")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
                </svg>
                <span>Notifications</span>
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
            <button className="menu-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="menu-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
              </svg>
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
                    <p className="stat-label">Today's Money</p>
                    <h4 className="stat-value">$53k</h4>
                  </div>
                  <div className="stat-footer">
                    <span className="stat-change positive">+55%</span>
                    <span className="stat-text">than last week</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Today's Users</p>
                    <h4 className="stat-value">2,300</h4>
                  </div>
                  <div className="stat-footer">
                    <span className="stat-change positive">+3%</span>
                    <span className="stat-text">than last month</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">New Clients</p>
                    <h4 className="stat-value">3,462</h4>
                  </div>
                  <div className="stat-footer">
                    <span className="stat-change negative">-2%</span>
                    <span className="stat-text">than yesterday</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Sales</p>
                    <h4 className="stat-value">$103,430</h4>
                  </div>
                  <div className="stat-footer">
                    <span className="stat-change positive">+5%</span>
                    <span className="stat-text">than yesterday</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="actions-grid">
                  <button
                    className="action-btn check-in-btn"
                    onClick={handleCheckIn}
                    disabled={loading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                    </svg>
                    <span>{loading ? "Checking In..." : "Check In"}</span>
                  </button>
                  <button className="action-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
                    </svg>
                    <span>View Schedule</span>
                  </button>
                  <button className="action-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zM21 9.375A.375.375 0 0020.625 9h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zM10.875 18.75a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5zM3.375 15h7.5a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375zm0-3.75h7.5a.375.375 0 00.375-.375v-1.5A.375.375 0 0010.875 9h-7.5A.375.375 0 003 9.375v1.5c0 .207.168.375.375.375z" clipRule="evenodd" />
                    </svg>
                    <span>View Grades</span>
                  </button>
                </div>
              </div>

              {/* Attendance History Table */}
              <div className="table-card">
                <div className="table-header">
                  <h6 className="table-title">Recent Attendance</h6>
                  <p className="table-subtitle">30 done this month</p>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(attendanceHistory || []).slice(0, 6).map((record: any) => (
                        <tr key={record.id}>
                          <td>{record.subject || "Computer Science"}</td>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>{record.time || "09:00 AM"}</td>
                          <td>
                            <span className={`status-badge ${getStatusColor(record.status)}`}>
                              {getStatusText(record.status)}
                            </span>
                          </td>
                          <td>{record.room || "Room 101"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="profile-section">
              <div className="profile-card">
                <h3 className="section-title">Student Profile</h3>
                <div className="profile-info">
                  <div className="profile-avatar">
                    <span>{user?.fullName?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="profile-details">
                    <h4>{user?.fullName}</h4>
                    <p>{user?.email}</p>
                    <p>Student ID: {user?.studentCode || "N/A"}</p>
                    <p>Role: {user?.role}</p>
                    <p>Status: {user?.isActive ? "Active" : "Inactive"}</p>
                    <p>Last Login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === "attendance" && (
            <div className="attendance-section">
              <div className="attendance-card">
                <h3 className="section-title">Attendance History</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceHistory.map((record: any) => (
                        <tr key={record.id}>
                          <td>{record.subject || "Computer Science"}</td>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>{record.time || "09:00 AM"}</td>
                          <td>
                            <span className={`status-badge ${getStatusColor(record.status)}`}>
                              {getStatusText(record.status)}
                            </span>
                          </td>
                          <td>{record.room || "Room 101"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="notifications-section">
              <div className="notifications-card">
                <h3 className="section-title">Notifications</h3>
                <div className="notifications-list">
                  <div className="notification-item">
                    <div className="notification-icon">📅</div>
                    <div className="notification-content">
                      <p>Class session starts in 30 minutes</p>
                      <span className="notification-time">2 hours ago</span>
                    </div>
                  </div>
                  <div className="notification-item">
                    <div className="notification-icon">✅</div>
                    <div className="notification-content">
                      <p>Attendance marked successfully</p>
                      <span className="notification-time">1 day ago</span>
                    </div>
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

export default StudentDashboard;
