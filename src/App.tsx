import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/Admin";
import StudentDashboard from "./pages/Dashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import CheckIn from "./pages/CheckIn";
import "./App.css";

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Admin Route component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return user?.role === "admin" ? <>{children}</> : <Navigate to="/dashboard" />;
};

// App Routes component
const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            user?.role === "admin" ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/dashboard" />
            )
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              {user?.role === "lecturer" ? <LecturerDashboard /> : <StudentDashboard />}
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/check-in"
        element={
          <ProtectedRoute>
            <Layout>
              <CheckIn />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Placeholder routes - will be expanded */}
      <Route
        path="/"
        element={
          <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} />
        }
      />
      <Route
        path="*"
        element={
          <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} />
        }
      />
    </Routes>
  );
};

// Main App component
function App() {
  return (
    <div className="app">
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
