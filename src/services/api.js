import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "https://attendacestystem.duckdns.org/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/update-profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.put(`/auth/reset-password/${token}`, { newPassword: password }),
  refreshToken: (refreshToken) =>
    api.post("/auth/refresh-token", { refreshToken }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: () => api.post("/auth/resend-verification"),
};

// Classes API
export const classesAPI = {
  getAll: (params) => api.get("/classes", { params }),
  getById: (id) => api.get(`/classes/${id}`),
  create: (classData) => api.post("/classes", classData),
  update: (id, classData) => api.put(`/classes/${id}`, classData),
  delete: (id) => api.delete(`/classes/${id}`),
  getStatistics: () => api.get("/classes/statistics"),
  getByLecturer: (lecturerId) => api.get(`/classes/lecturer/${lecturerId}`),
  getByCourseYear: (courseYear) =>
    api.get(`/classes/course-year/${courseYear}`),
  getStudents: (id) => api.get(`/classes/${id}/students`),
  addStudents: (id, studentIds) =>
    api.post(`/classes/${id}/students`, { studentIds }),
  removeStudent: (id, studentId) =>
    api.delete(`/classes/${id}/students/${studentId}`),
  addCourse: (id, courseId) => api.post(`/classes/${id}/courses`, { courseId }),
  removeCourse: (id, courseId) =>
    api.delete(`/classes/${id}/courses/${courseId}`),
};

// Attendance API
export const attendanceAPI = {
  // Sessions
  getSessions: (params) => api.get("/attendance/sessions", { params }),
  getSessionById: (id) => api.get(`/attendance/sessions/${id}`),
  createSession: (sessionData) => api.post("/attendance/sessions", sessionData),
  updateSession: (id, sessionData) =>
    api.put(`/attendance/sessions/${id}`, sessionData),
  closeSession: (id) => api.patch(`/attendance/sessions/${id}/close`),
  cancelSession: (id) => api.patch(`/attendance/sessions/${id}/cancel`),
  generateQR: (id) => api.post(`/attendance/sessions/${id}/qr-code`),

  // Check-ins
  manualCheckIn: (data) => api.post("/attendance/check-in/manual", data),
  qrCheckIn: (data) => api.post("/attendance/check-in/qr", data),
  faceCheckIn: (data) => api.post("/attendance/check-in/face", data),
  gpsCheckIn: (data) => api.post("/attendance/check-in/gps", data),

  // History and Statistics
  getHistory: (params) => api.get("/attendance/history", { params }),
  getStudentStats: (studentId) =>
    api.get(`/attendance/statistics/student/${studentId}`),
  getSessionStats: (sessionId) =>
    api.get(`/attendance/statistics/session/${sessionId}`),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post("/users", userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  getStatistics: () => api.get("/users/statistics"),
  getStudentsByClass: (classId) => api.get(`/users/students/class/${classId}`),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
  resetPassword: (id) => api.put(`/users/${id}/reset-password`, {}),
  bulkCreate: (users) => api.post("/users/bulk", { users }),
};

// Face Encodings API
export const faceEncodingsAPI = {
  getAll: (params) => api.get("/face-encodings", { params }),
  getById: (id) => api.get(`/face-encodings/${id}`),
  create: (data) => api.post("/face-encodings", data),
  update: (id, data) => api.put(`/face-encodings/${id}`, data),
  delete: (id) => api.delete(`/face-encodings/${id}`),
  getStatistics: () => api.get("/face-encodings/statistics"),
  getByUser: (userId) => api.get(`/face-encodings/user/${userId}`),
  verify: (id) => api.patch(`/face-encodings/${id}/verify`),
  deactivate: (id, reason) =>
    api.patch(`/face-encodings/${id}/deactivate`, { reason }),
  reactivate: (id) => api.patch(`/face-encodings/${id}/reactivate`),
  addImage: (id, imageData) =>
    api.post(`/face-encodings/${id}/images`, imageData),
  removeImage: (id, imageUrl) =>
    api.delete(`/face-encodings/${id}/images/${imageUrl}`),
};

// Statistics API
export const statisticsAPI = {
  getOverview: () => api.get("/statistics/overview"),
  getClassStats: (classId) => api.get(`/statistics/class/${classId}`),
  getStudentStats: (studentId) => api.get(`/statistics/student/${studentId}`),
  getLecturerStats: (lecturerId) =>
    api.get(`/statistics/lecturer/${lecturerId}`),
  getTrends: (params) => api.get("/statistics/trends", { params }),
};

// Settings API
export const settingsAPI = {
  getPublic: () => api.get("/settings/public"),
  getAll: () => api.get("/settings"),
  update: (settings) => api.put("/settings", settings),
  updateAttendance: (settings) => api.put("/settings/attendance", settings),
  updateAI: (settings) => api.put("/settings/ai", settings),
  updateStorage: (settings) => api.put("/settings/storage", settings),
  updateNotifications: (settings) =>
    api.put("/settings/notifications", settings),
  updateSecurity: (settings) => api.put("/settings/security", settings),
  updateFeatures: (settings) => api.put("/settings/features", settings),
  toggleMaintenance: () => api.patch("/settings/maintenance"),
  validateAI: () => api.get("/settings/validate/ai-service"),
  validateStorage: () => api.get("/settings/validate/storage"),
  validateEmail: () => api.get("/settings/validate/email"),
  validateAll: () => api.get("/settings/validate/all"),
  reset: () => api.post("/settings/reset"),
  getHistory: () => api.get("/settings/history"),
};

// Reports API
export const reportsAPI = {
  generateClassReport: (data) => api.post("/reports/class-attendance", data),
  generateStudentReport: (data) =>
    api.post("/reports/student-attendance", data),
  generateCourseReport: (data) => api.post("/reports/course-attendance", data),
  generateSummaryReport: (data) =>
    api.post("/reports/attendance-summary", data),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get("/notifications", { params }),
  create: (notification) => api.post("/notifications", notification),
  getUnreadCount: () => api.get("/notifications/unread/count"),
  getStatistics: () => api.get("/notifications/statistics"),
  broadcast: (data) => api.post("/notifications/broadcast", data),
  markAllRead: () => api.patch("/notifications/read-all"),
  getById: (id) => api.get(`/notifications/${id}`),
  delete: (id) => api.delete(`/notifications/${id}`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
};

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem("refreshToken", token);
  } else {
    localStorage.removeItem("refreshToken");
  }
};

export const getAuthToken = () => localStorage.getItem("token");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

export default api;
