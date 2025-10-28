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
  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),
  register: (userData: any) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data: any) => api.put("/auth/update-profile", data),
  changePassword: (data: any) => api.put("/auth/change-password", data),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    api.put(`/auth/reset-password/${token}`, { newPassword: password }),
  refreshToken: (refreshToken: string) =>
    api.post("/auth/refresh-token", { refreshToken }),
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
  resendVerification: () => api.post("/auth/resend-verification"),
};

// Classes API
export const classesAPI = {
  getAll: (params: any = {}) => api.get("/classes", { params }),
  getById: (id: string) => api.get(`/classes/${id}`),
  create: (classData: any) => api.post("/classes", classData),
  update: (id: string, classData: any) => api.put(`/classes/${id}`, classData),
  delete: (id: string) => api.delete(`/classes/${id}`),
  getStatistics: () => api.get("/classes/statistics"),
  getByLecturer: (lecturerId: string) =>
    api.get(`/classes/lecturer/${lecturerId}`),
  getByCourseYear: (courseYear: string) =>
    api.get(`/classes/course-year/${courseYear}`),
  getStudents: (id: string) => api.get(`/classes/${id}/students`),
  addStudents: (id: string, studentIds: any) =>
    api.post(`/classes/${id}/students`, { studentIds }),
  removeStudent: (id: string, studentId: string) =>
    api.delete(`/classes/${id}/students/${studentId}`),
  addCourse: (id: string, courseId: string) =>
    api.post(`/classes/${id}/courses`, { courseId }),
  removeCourse: (id: string, courseId: string) =>
    api.delete(`/classes/${id}/courses/${courseId}`),
};

// Attendance API
export const attendanceAPI = {
  // Sessions
  getSessions: (params: any) => api.get("/attendance/sessions", { params }),
  getSessionById: (id: string) => api.get(`/attendance/sessions/${id}`),
  createSession: (sessionData: any) => api.post("/attendance/sessions", sessionData),
  updateSession: (id: string, sessionData: any) =>
    api.put(`/attendance/sessions/${id}`, sessionData),
  closeSession: (id: string) => api.patch(`/attendance/sessions/${id}/close`),
  cancelSession: (id: string) => api.patch(`/attendance/sessions/${id}/cancel`),
  generateQR: (id: string) => api.post(`/attendance/sessions/${id}/qr-code`),

  // Check-ins
  manualCheckIn: (data: any) => api.post("/attendance/check-in/manual", data),
  qrCheckIn: (data: any) => api.post("/attendance/check-in/qr", data),
  faceCheckIn: (data: any) => api.post("/attendance/check-in/face", data),
  gpsCheckIn: (data: any) => api.post("/attendance/check-in/gps", data),

  // History and Statistics
  getHistory: (params: any) => api.get("/attendance/history", { params }),
  getStudentStats: (studentId: string) =>
    api.get(`/attendance/statistics/student/${studentId}`),
  getSessionStats: (sessionId: string) =>
    api.get(`/attendance/statistics/session/${sessionId}`),
};

// Users API
export const usersAPI = {
  getAll: (params: any) => api.get("/users", { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (userData: any) => api.post("/users", userData),
  update: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  delete: (id: string) => api.delete(`/users/${id}`),
  getStatistics: () => api.get("/users/statistics"),
  getStudentsByClass: (classId: string) => api.get(`/users/students/class/${classId}`),
  toggleStatus: (id: string) => api.patch(`/users/${id}/toggle-status`),
  resetPassword: (id: string) => api.put(`/users/${id}/reset-password`, {}),
  bulkCreate: (users: any) => api.post("/users/bulk", { users }),
};

// Face Encodings API
export const faceEncodingsAPI = {
  getAll: (params: any) => api.get("/face-encodings", { params }),
  getById: (id: string) => api.get(`/face-encodings/${id}`),
  create: (data: any) => api.post("/face-encodings", data),
  update: (id: string, data: any) => api.put(`/face-encodings/${id}`, data),
  delete: (id: string) => api.delete(`/face-encodings/${id}`),
  getStatistics: () => api.get("/face-encodings/statistics"),
  getByUser: (userId: string) => api.get(`/face-encodings/user/${userId}`),
  verify: (id: string) => api.patch(`/face-encodings/${id}/verify`),
  deactivate: (id: string, reason: any) =>
    api.patch(`/face-encodings/${id}/deactivate`, { reason }),
  reactivate: (id: string) => api.patch(`/face-encodings/${id}/reactivate`),
  addImage: (id: string, imageData: any) =>
    api.post(`/face-encodings/${id}/images`, imageData),
  removeImage: (id: string, imageUrl: string) =>
    api.delete(`/face-encodings/${id}/images/${imageUrl}`),
};

// Statistics API
export const statisticsAPI = {
  getOverview: () => api.get("/statistics/overview"),
  getClassStats: (classId: string) => api.get(`/statistics/class/${classId}`),
  getStudentStats: (studentId: string) => api.get(`/statistics/student/${studentId}`),
  getLecturerStats: (lecturerId: string) =>
    api.get(`/statistics/lecturer/${lecturerId}`),
  getTrends: (params: any) => api.get("/statistics/trends", { params }),
};

// Settings API
export const settingsAPI = {
  getPublic: () => api.get("/settings/public"),
  getAll: () => api.get("/settings"),
  update: (settings: any) => api.put("/settings", settings),
  updateAttendance: (settings: any) => api.put("/settings/attendance", settings),
  updateAI: (settings: any) => api.put("/settings/ai", settings),
  updateStorage: (settings: any) => api.put("/settings/storage", settings),
  updateNotifications: (settings: any) =>
    api.put("/settings/notifications", settings),
  updateSecurity: (settings: any) => api.put("/settings/security", settings),
  updateFeatures: (settings: any) => api.put("/settings/features", settings),
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
  generateClassReport: (data: any) => api.post("/reports/class-attendance", data),
  generateStudentReport: (data: any) =>
    api.post("/reports/student-attendance", data),
  generateCourseReport: (data: any) => api.post("/reports/course-attendance", data),
  generateSummaryReport: (data: any) =>
    api.post("/reports/attendance-summary", data),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params: any) => api.get("/notifications", { params }),
  create: (notification: any) => api.post("/notifications", notification),
  getUnreadCount: () => api.get("/notifications/unread/count"),
  getStatistics: () => api.get("/notifications/statistics"),
  broadcast: (data: any) => api.post("/notifications/broadcast", data),
  markAllRead: () => api.patch("/notifications/read-all"),
  getById: (id: string) => api.get(`/notifications/${id}`),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
};

// Utility functions
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const setRefreshToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("refreshToken", token);
  } else {
    localStorage.removeItem("refreshToken");
  }
};

export const getAuthToken = () => localStorage.getItem("token");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

export default api;
