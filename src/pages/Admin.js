import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  People,
  School,
  Settings,
  Assessment,
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Badge,
  Logout,
  AccountCircle,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { usersAPI, statisticsAPI, settingsAPI } from "../services/api";

const Admin = () => {
  const [activeTab, setActiveTab] = useState(0);
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
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { register, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 1) {
      fetchUsers();
    } else if (activeTab === 4) {
      fetchStats();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await statisticsAPI.getOverview();
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
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

    const result = await register(formData);

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

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await usersAPI.delete(userId);
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await usersAPI.toggleStatus(userId);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountCircle />
            <Typography variant="body1">
              Welcome, {user?.fullName}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Logout />}
            onClick={handleLogout}
            color="error"
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<Add />} label="Create User" />
          <Tab icon={<People />} label="Manage Users" />
          <Tab icon={<School />} label="Classes" />
          <Tab icon={<Settings />} label="Settings" />
          <Tab icon={<Assessment />} label="Statistics" />
        </Tabs>
      </Box>

      {/* Create User Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h5" gutterBottom>
                Create New User Account
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: "textSecondary" }}>
                Default admin account: admin@edu.vn (contact backend team to set up initial password)
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={formData.role}
                    label="Role"
                    onChange={handleChange}
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="lecturer">Lecturer</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="fullName"
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Student Code field */}
                {formData.role === "student" && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="studentCode"
                    label="Student Code"
                    name="studentCode"
                    value={formData.studentCode}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}

                {/* Lecturer Code field */}
                {formData.role === "lecturer" && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="lecturerCode"
                    label="Lecturer Code"
                    name="lecturerCode"
                    value={formData.lecturerCode}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <School />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Manage Users Tab */}
      {activeTab === 1 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            User Management
          </Typography>
          {loadingUsers ? (
            <Typography>Loading users...</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2 }}>
                            {user.fullName.charAt(0).toUpperCase()}
                          </Avatar>
                          {user.fullName}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          color={
                            user.role === "admin" ? "error" :
                            user.role === "lecturer" ? "primary" : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? "Active" : "Inactive"}
                          color={user.isActive ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditUser(user)} color="primary">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleToggleUserStatus(user.id)} color="warning">
                          {user.isActive ? <Cancel /> : <CheckCircle />}
                        </IconButton>
                        <IconButton onClick={() => handleDeleteUser(user.id)} color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Classes Tab */}
      {activeTab === 2 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Class Management
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Class management features will be implemented here.
          </Typography>
        </Paper>
      )}

      {/* Settings Tab */}
      {activeTab === 3 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            System Settings
          </Typography>
          <Typography variant="body1" color="textSecondary">
            System settings and configuration will be implemented here.
          </Typography>
        </Paper>
      )}

      {/* Statistics Tab */}
      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  Total Users
                </Typography>
                <Typography variant="h4">
                  {stats?.totalUsers || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="secondary">
                  Active Classes
                </Typography>
                <Typography variant="h4">
                  {stats?.totalClasses || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  Today's Attendance
                </Typography>
                <Typography variant="h4">
                  {stats?.todayAttendance || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  Attendance Rate
                </Typography>
                <Typography variant="h4">
                  {stats?.attendanceRate || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Admin;