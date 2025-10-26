import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
} from "@mui/material";
import {
  People,
  School,
  CheckCircle,
  Schedule,
  TrendingUp,
  Notifications,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { statisticsAPI, notificationsAPI } from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user.role === "admin") {
          const [statsResponse, notificationsResponse] = await Promise.all([
            statisticsAPI.getOverview(),
            notificationsAPI.getUnreadCount(),
          ]);
          setStats(statsResponse.data.data);
          setUnreadNotifications(notificationsResponse.data.data.unreadCount);
        } else if (user.role === "lecturer") {
          // Lecturer-specific stats
          const notificationsResponse = await notificationsAPI.getUnreadCount();
          setUnreadNotifications(notificationsResponse.data.data.unreadCount);
        } else if (user.role === "student") {
          // Student-specific stats
          const notificationsResponse = await notificationsAPI.getUnreadCount();
          setUnreadNotifications(notificationsResponse.data.data.unreadCount);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.role]);

  const getDashboardCards = () => {
    switch (user.role) {
      case "admin":
        return [
          {
            title: "Total Users",
            value: stats?.totalUsers || 0,
            icon: <People color="primary" />,
            color: "#1976d2",
          },
          {
            title: "Active Classes",
            value: stats?.totalClasses || 0,
            icon: <School color="secondary" />,
            color: "#dc004e",
          },
          {
            title: "Today's Attendance",
            value: stats?.todayAttendance || 0,
            icon: <CheckCircle color="success" />,
            color: "#2e7d32",
          },
          {
            title: "Active Sessions",
            value: stats?.activeSessions || 0,
            icon: <Schedule color="warning" />,
            color: "#ed6c02",
          },
          {
            title: "Attendance Rate",
            value: `${stats?.attendanceRate || 0}%`,
            icon: <TrendingUp color="info" />,
            color: "#0288d1",
          },
          {
            title: "Notifications",
            value: unreadNotifications,
            icon: <Notifications color="error" />,
            color: "#d32f2f",
          },
        ];
      case "lecturer":
        return [
          {
            title: "My Classes",
            value: user.classes?.length || 0,
            icon: <School color="primary" />,
            color: "#1976d2",
          },
          {
            title: "Today's Sessions",
            value: stats?.todaySessions || 0,
            icon: <Schedule color="secondary" />,
            color: "#dc004e",
          },
          {
            title: "Active Session",
            value: stats?.activeSession ? "1" : "0",
            icon: <CheckCircle color="success" />,
            color: "#2e7d32",
          },
          {
            title: "Notifications",
            value: unreadNotifications,
            icon: <Notifications color="error" />,
            color: "#d32f2f",
          },
        ];
      case "student":
        return [
          {
            title: "My Classes",
            value: user.classes?.length || 0,
            icon: <School color="primary" />,
            color: "#1976d2",
          },
          {
            title: "Today's Attendance",
            value: stats?.todayAttendance || "Not checked",
            icon: <CheckCircle color="success" />,
            color: "#2e7d32",
          },
          {
            title: "Attendance Rate",
            value: `${stats?.attendanceRate || 0}%`,
            icon: <TrendingUp color="info" />,
            color: "#0288d1",
          },
          {
            title: "Notifications",
            value: unreadNotifications,
            icon: <Notifications color="error" />,
            color: "#d32f2f",
          },
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user.fullName}!
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            {user.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6">{user.fullName}</Typography>
            <Chip
              label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              color={
                user.role === "admin"
                  ? "error"
                  : user.role === "lecturer"
                  ? "primary"
                  : "default"
              }
              size="small"
            />
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {getDashboardCards().map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  {card.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {card.title}
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", color: card.color }}
                >
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {user.role === "admin" && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="outlined" fullWidth startIcon={<People />}>
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="outlined" fullWidth startIcon={<School />}>
                  Manage Classes
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="outlined" fullWidth startIcon={<TrendingUp />}>
                  View Reports
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="outlined" fullWidth startIcon={<Schedule />}>
                  Schedule Sessions
                </Button>
              </Grid>
            </>
          )}

          {user.role === "lecturer" && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Button variant="outlined" fullWidth startIcon={<Schedule />}>
                  Create Session
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CheckCircle />}
                >
                  Mark Attendance
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button variant="outlined" fullWidth startIcon={<TrendingUp />}>
                  View Statistics
                </Button>
              </Grid>
            </>
          )}

          {user.role === "student" && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CheckCircle />}
                >
                  Check In
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button variant="outlined" fullWidth startIcon={<Schedule />}>
                  View Schedule
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button variant="outlined" fullWidth startIcon={<TrendingUp />}>
                  My Attendance
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
