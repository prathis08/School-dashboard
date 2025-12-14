import { getAuthToken, removeAuthToken } from "../utils/cookies";
import { clearDashboardConfig } from "../utils/dashboardConfig";
import { getApiBaseUrl } from "../utils/apiConfig";
// API Endpoints (imported from api.js for backward compatibility)
import { API_ENDPOINTS } from "./api";

// Enhanced API client for TanStack Query
export const apiClient = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${getApiBaseUrl()}${endpoint}`;

  // Get token from cookies instead of localStorage
  const token = getAuthToken();

  // Debug logging to verify token is available
  console.log("API Client Debug:", {
    endpoint,
    hasToken: !!token,
    tokenStart: token ? token.substring(0, 20) + "..." : "No token",
  });

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };
  // Handle FormData (file uploads)
  if (options.body instanceof FormData) {
    delete defaultOptions.headers["Content-Type"];
  }

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized access
        removeAuthToken();
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        clearDashboardConfig();
        window.location.href = "/login";
        throw new Error("Unauthorized access");
      }

      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse error response, use default message
      }

      throw new Error(errorMessage);
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    } else {
      return response.text();
    }
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Specific API functions that can be used directly with TanStack Query
export const api = {
  // GET request
  get: (endpoint) => apiClient(endpoint, { method: "GET" }),

  // POST request
  post: (endpoint, data) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiClient(endpoint, {
      method: "POST",
      body,
    });
  },

  // PUT request
  put: (endpoint, data) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiClient(endpoint, {
      method: "PUT",
      body,
    });
  },

  // PATCH request
  patch: (endpoint, data) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiClient(endpoint, {
      method: "PATCH",
      body,
    });
  },

  // DELETE request
  delete: (endpoint) => apiClient(endpoint, { method: "DELETE" }),
};

// Authentication API functions
export const authApi = {
  login: (credentials) => api.post("/auth/login-user", credentials),
  register: (userData) => api.post("/auth/register-user", userData),
  logout: () => api.post("/auth/logout-user"),
  logoutAll: () => api.post("/auth/logout-all-devices"),
  getProfile: () => api.get("/auth/get-user-profile"),
  getActiveSessions: () => api.get("/auth/get-active-sessions"),
  revokeSession: (sessionId) => api.delete(`/auth/revoke-session/${sessionId}`),
};

// Dashboard API functions
export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
  getRecentActivity: () => api.get("/dashboard/recent-activity"),
  getAttendanceOverview: () => api.get("/dashboard/attendance-overview"),
  getPerformanceData: () => api.get("/dashboard/performance"),
  getConfig: () => api.get("/features/get-dashboard-config"),
};

// Student API functions
export const studentsApi = {
  getAll: () => api.get("/students/get-all-students"),
  getById: (id) => api.get(`/students/get-student-by-id/${id}`),
  create: (data) => api.post("/students/create-student", data),
  update: (id, data) => api.put(`/students/update-student-by-id/${id}`, data),
  delete: (id) => api.delete(`/students/delete-student-by-id/${id}`),
  search: (query) => api.get(`/students/search?q=${encodeURIComponent(query)}`),
  getGrades: () => api.get("/students/grades"),
  getAttendance: (id) => api.get(`/students/${id}/attendance`),
  getPerformance: (id) => api.get(`/students/${id}/performance`),
};

// Teacher API functions
export const teachersApi = {
  getAll: () => api.get("/teachers/get-all-teachers"),
  getTeacherNames: () => api.get("/teachers/get-teacher-names"),
  getById: (id) => api.get(`/teachers/get-teacher-by-id/${id}`),
  create: (data) => api.post("/teachers/create-teacher", data),
  update: (id, data) => api.put(`/teachers/update-teacher-by-id/${id}`, data),
  delete: (id) => api.delete(`/teachers/delete-teacher-by-id/${id}`),
  search: (query) => api.get(`/teachers/search?q=${encodeURIComponent(query)}`),
  getDepartments: () => api.get("/teachers/departments"),
};

// Class API functions
export const classesApi = {
  getAll: () => api.get("/classes/get-all-classes"),
  getGradesAndClasses: () => api.get("/classes/grades-and-classes"),
  getGradesOptions: () => api.get("/classes/get-grades-options"),
  getById: (id) => api.get(`/classes/get-class-by-id/${id}`),
  create: (data) => {
    api.post("/classes/create-new-class", data);
  },
  update: (id, data) => {
    return api.put(`/classes/update-class/${id}`, data);
  },
  delete: (id) => api.delete(`/classes/delete-class/${id}`),
  addStudent: (classId, studentId) =>
    api.post(`/classes/add-student-to-class/${classId}`, { studentId }),
};

// Subject API functions
export const subjectsApi = {
  getAll: () => api.get("/subjects/get-all-subjects"),
  getById: (id) => api.get(`/subjects/get-subject-by-id/${id}`),
  create: (data) => api.post("/subjects/create-subject", data),
  update: (id, data) => api.put(`/subjects/update-subject-by-id/${id}`, data),
  delete: (id) => api.delete(`/subjects/delete-subject-by-id/${id}`),
  assignTeacher: (subjectId, teacherId) =>
    api.post(`/subjects/assign-teacher-to-subject/${subjectId}`, { teacherId }),
};

// Fees API functions
export const feesApi = {
  createStructure: (data) => api.post("/fees/create-fee-structure", data),
  getStructures: () => api.get("/fees/get-fee-structures"),
  updateStructure: (id, data) =>
    api.put(`/fees/update-fee-structure/${id}`, data),
  deleteStructure: (id) => api.delete(`/fees/delete-fee-structure/${id}`),
  recordPayment: (data) => api.post("/fees/record-payment", data),
  getPaymentHistory: (studentId) =>
    api.get(`/fees/get-payment-history/${studentId}`),
  generateReport: () => api.get("/fees/generate-fee-report"),
};

// Features API functions
export const featuresApi = {
  getFeatures: () => api.get("/features/features"),
  checkFeature: (feature) => api.get(`/features/check/${feature}`),
  getSchoolFeatures: (schoolId) => api.get(`/features/school/${schoolId}`),
  updateSchoolFeatures: (schoolId, enabledFeatures) =>
    api.put(`/features/school/${schoolId}`, { enabledFeatures }),
  getAllSchools: () => api.get("/features/schools/all"),
  reloadConfig: () => api.post("/features/reload-config"),
};

// System API functions
export const systemApi = {
  healthCheck: () => api.get("/health"),
};

// Profile API functions
export const profileApi = {
  get: () => api.get("/auth/get-user-profile"),
  update: (data) => api.put("/profile", data),
  changePassword: (data) => api.post("/profile/change-password", data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post("/profile/avatar", formData);
  },
};

export default api;

// Export for backward compatibility
export { API_ENDPOINTS };
