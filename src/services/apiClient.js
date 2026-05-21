import { getAuthToken, removeAuthToken } from "../utils/cookies";
import { clearDashboardConfig } from "../utils/dashboardConfig";
import { getApiBaseUrl } from "../utils/apiConfig";
export { getApiBaseUrl };
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
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.gradeId) query.set("gradeId", params.gradeId);
    if (params.page) query.set("page", params.page);
    if (params.limit) query.set("limit", params.limit);
    const qs = query.toString();
    return api.get(
      `/students/get-all-students${qs ? `?${qs}` : ""}`,
    );
  },
  getById: (id) => api.get(`/students/get-student-by-id/${id}`),
  create: (data) => api.post("/students/create-student", data),
  update: (id, data) => api.put(`/students/update-student-by-id/${id}`, data),
  delete: (id) => api.delete(`/students/delete-student-by-id/${id}`),
  search: (query) => api.get(`/students/search?q=${encodeURIComponent(query)}`),
  getGrades: () => api.get("/students/grades"),
  getStatusOptions: () => api.get("/students/get-status-options"),
  getAttendance: (id) => api.get(`/students/${id}/attendance`),
  getPerformance: (id) => api.get(`/students/${id}/performance`),
  startExport: ({ scope, classId, classLabel } = {}) =>
    api.post("/students/export", { scope, classId, classLabel }),
  getExportStatus: (jobId) => api.get(`/students/export/status/${jobId}`),
  getExportDownloadUrl: (jobId) =>
    `${getApiBaseUrl()}/students/export/download/${jobId}`,
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
  create: (data) => api.post("/classes/create-new-class", data),
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

// Fees API functions (Legacy)
export const feesApi = {
  createStructure: (data) => api.post("/fees/create-fee-structure", data),
  getStructures: () => api.get("/fees/get-fee-structures"),
  updateStructure: (id, data) =>
    api.put(`/fees/update-fee-structure/${id}`, data),
  deleteStructure: (feeStructureId) =>
    api.delete(`/fees/delete-fee-structure/${feeStructureId}`),
  recordPayment: (data) => api.post("/fees/record-payment", data),
  getPaymentHistory: (studentId) =>
    api.get(`/fees/get-payment-history/${studentId}`),
  generateReport: () => api.get("/fees/generate-fee-report"),
  getFeeTypes: () => api.get("/fees/fee-types"),
  getAcademicSessions: () => api.get("/academic-sessions"),
};

// Enhanced Fees API functions - Unified under /fees/ base path
export const enhancedFeesApi = {
  // Academic Year Management
  academicYears: {
    create: (data) => api.post("/fees/academic-years", data),
    getAll: () => api.get("/fees/academic-years"),
    getActive: () => api.get("/fees/academic-years/active"),
    update: (academicYearId, data) =>
      api.put(`/fees/academic-years/${academicYearId}`, data),
    delete: (academicYearId) =>
      api.delete(`/fees/academic-years/${academicYearId}`),
    setActive: (academicYearId) =>
      api.put(`/fees/academic-years/${academicYearId}/set-active`, {}),
  },

  // Fee Type Management
  feeTypes: {
    create: (data) => api.post("/fees/fee-types", data),
    getAll: () => api.get("/fees/fee-types"),
    update: (feeTypeId, data) => api.put(`/fees/fee-types/${feeTypeId}`, data),
    delete: (feeTypeId) => api.delete(`/fees/fee-types/${feeTypeId}`),
  },

  // Class Fee Structure
  classFees: {
    create: (data) => api.post("/fees/class-fees", data),
    get: (academicYearId, classId) =>
      api.get(`/fees/class-fees/${academicYearId}/${classId}`),
  },

  // Grade Fee Structure
  gradeFees: {
    create: (data) => api.post("/fees/grade-fees", data),
    get: (academicYearId, gradeId) =>
      api.get(`/fees/grade-fees/${academicYearId}/${gradeId}`),
    delete: (academicYearId, gradeId) =>
      api.delete(`/fees/grade-fees/${academicYearId}/${gradeId}`),
  },

  // Installment Schedules
  schedules: {
    create: (data) => api.post("/fees/installment-schedules", data),
    createQuarterly: (academicYearId, classId) =>
      api.post(
        `/fees/installment-schedules/default-quarterly/${academicYearId}/${classId}`,
      ),
    createQuarterlyForGrade: (academicYearId, gradeId) =>
      api.post(
        `/fees/installment-schedules/default-quarterly/${academicYearId}/${gradeId}?type=grade`,
      ),
    createMonthlyForGrade: (academicYearId, gradeId) =>
      api.post(
        `/fees/installment-schedules/default-monthly/${academicYearId}/${gradeId}`,
      ),
    getByGrade: (academicYearId, gradeId) =>
      api.get(`/fees/installment-schedules/${academicYearId}/${gradeId}`),
  },

  // Student Fee Management
  studentFees: {
    assign: (data) => api.post("/fees/student-assignments", data),
    getAssignment: (studentId, academicYearId) =>
      api.get(`/fees/student-assignments/${studentId}/${academicYearId}`),
    update: (assignmentId, data) =>
      api.put(`/fees/student-assignments/${assignmentId}`, data),
    getSummary: (studentId, academicYearId) =>
      api.get(`/fees/students/${studentId}/${academicYearId}/summary`),
    getInstallments: (studentId, academicYearId) =>
      api.get(`/fees/students/${studentId}/${academicYearId}/installments`),
  },

  // Individual Student Fees (fines, punishment fees, etc.)
  individualFees: {
    create: (data) => api.post("/fees/individual-fees", data),
    getAll: (params = {}) => {
      const queryParams = new URLSearchParams();
      if (params.academicYearId)
        queryParams.append("academicYearId", params.academicYearId);
      if (params.status) queryParams.append("status", params.status);
      if (params.classId) queryParams.append("classId", params.classId);
      if (params.gradeId) queryParams.append("gradeId", params.gradeId);
      const queryString = queryParams.toString();
      return api.get(
        `/fees/individual-fees${queryString ? `?${queryString}` : ""}`,
      );
    },
    getByStudent: (studentId, params = {}) => {
      const queryParams = new URLSearchParams();
      if (params.academicYearId)
        queryParams.append("academicYearId", params.academicYearId);
      if (params.status) queryParams.append("status", params.status);
      const queryString = queryParams.toString();
      return api.get(
        `/fees/individual-fees/student/${studentId}${queryString ? `?${queryString}` : ""}`,
      );
    },
    update: (individualFeeId, data) =>
      api.put(`/fees/individual-fees/${individualFeeId}`, data),
    delete: (individualFeeId) =>
      api.delete(`/fees/individual-fees/${individualFeeId}`),
  },

  // Payment Processing
  payments: {
    record: (data) => api.post("/fees/payments", data),
    getHistory: (studentId) => api.get(`/fees/payment-history/${studentId}`),
  },

  // Reports & Analytics
  reports: {
    getOverdue: (academicYearId, params = {}) => {
      const queryParams = new URLSearchParams();
      if (academicYearId) queryParams.append("academicYearId", academicYearId);
      if (params.classId) queryParams.append("classId", params.classId);
      if (params.studentId) queryParams.append("studentId", params.studentId);
      const queryString = queryParams.toString();
      return api.get(
        `/fees/reports/overdue${queryString ? `?${queryString}` : ""}`,
      );
    },
    getCollection: (startDate, endDate, params = {}) => {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (params.classId) queryParams.append("classId", params.classId);
      if (params.paymentMethod)
        queryParams.append("paymentMethod", params.paymentMethod);
      const queryString = queryParams.toString();
      return api.get(
        `/fees/reports/collection${queryString ? `?${queryString}` : ""}`,
      );
    },
    getDashboardStats: (academicYearId) => {
      const queryParams = academicYearId
        ? `?academicYearId=${academicYearId}`
        : "";
      return api.get(`/fees/dashboard/stats${queryParams}`);
    },
  },

  // Constants
  constants: {
    getPaymentMethods: () => api.get("/fees/payment-methods"),
    getScheduleTypes: () => api.get("/fees/constants/schedule-types"),
    getInstallmentStatuses: () =>
      api.get("/fees/constants/installment-statuses"),
  },

  // Dues export (entire school or single class)
  duesExport: {
    start: ({ scope, classId, classLabel } = {}) =>
      api.post("/fees/export/dues", { scope, classId, classLabel }),
    getStatus: (jobId) => api.get(`/fees/export/dues/status/${jobId}`),
    getDownloadUrl: (jobId) =>
      `${getApiBaseUrl()}/fees/export/dues/download/${jobId}`,
  },
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

// Add students with fees endpoint to existing studentsApi
export const studentsWithFeesApi = {
  getStudentsWithFees: (params = {}) => {
    const queryParams = new URLSearchParams();

    // Add query parameters if they exist and are not "All"
    if (params.gradeId && params.gradeId !== "All") {
      queryParams.append("gradeId", params.gradeId);
    }
    if (params.feeType && params.feeType !== "All") {
      queryParams.append("feeType", params.feeType);
    }
    if (params.name && params.name.trim()) {
      queryParams.append("name", params.name.trim());
    }
    if (params.section && params.section !== "All") {
      queryParams.append("section", params.section);
    }
    if (params.status && params.status !== "All") {
      queryParams.append("status", params.status);
    }
    if (params.academicSession && params.academicSession !== "All") {
      queryParams.append("academicSession", params.academicSession);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/fees/get-students-with-fees?${queryString}`
      : "/fees/get-students-with-fees";

    return api.get(endpoint);
  },
};

// Profile API functions
export const profileApi = {
  get: () => api.get("/profile"),
  update: (data) => api.put("/profile", data),
  changePassword: (data) => api.put("/profile/password", data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post("/profile/avatar", formData);
  },
};

// Settings API functions
export const settingsApi = {
  getSchool: () => api.get("/settings/school"),
  updateSchool: (data) => api.put("/settings/school", data),
  getPreferences: () => api.get("/settings/preferences"),
  updatePreferences: (data) => api.put("/settings/preferences", data),
};

export default api;

// Export for backward compatibility
export { API_ENDPOINTS };
