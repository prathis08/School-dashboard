import {
  getAuthToken,
  removeAuthToken,
  removeSession,
} from "../utils/cookies";
import { clearDashboardConfig } from "../utils/dashboardConfig";
import { getApiBaseUrl } from "../utils/apiConfig";
import { API_ENDPOINTS } from "./api";

export { getApiBaseUrl };

// Endpoints that must never trigger the refresh-on-401 flow.
const isAuthEndpoint = (endpoint) =>
  endpoint.startsWith("/auth/login") ||
  endpoint.startsWith("/auth/refresh") ||
  endpoint.startsWith("/auth/register") ||
  endpoint.startsWith("/auth/logout");

// Single-flight refresh: concurrent 401s share one refresh request.
let refreshPromise = null;
const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${getApiBaseUrl()}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Session refresh failed");
        return response;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const forceLogout = () => {
  removeAuthToken();
  removeSession();
  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  } catch (e) {
    // Ignore storage failures.
  }
  clearDashboardConfig();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// Enhanced API client for TanStack Query. Auth travels in httpOnly cookies
// (sent via credentials: "include"); an Authorization header is still attached
// for legacy sessions.
export const apiClient = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${getApiBaseUrl()}${endpoint}`;

  const token = getAuthToken();

  const requestOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };
  // Handle FormData (file uploads)
  if (options.body instanceof FormData) {
    delete requestOptions.headers["Content-Type"];
  }

  try {
    let response = await fetch(url, requestOptions);

    // Access token expired → try a single silent refresh, then retry once.
    if (response.status === 401 && !isAuthEndpoint(endpoint)) {
      try {
        await refreshSession();
        response = await fetch(url, requestOptions);
      } catch (refreshError) {
        // fall through to logout below
      }
      if (response.status === 401) {
        forceLogout();
        throw new Error("Unauthorized access");
      }
    }

    if (response.status === 403) {
      let payload = null;
      try {
        payload = await response.clone().json();
      } catch (e) {
        // Non-JSON forbidden response.
      }
      if (payload?.code === "PASSWORD_CHANGE_REQUIRED") {
        if (window.location.pathname !== "/change-password") {
          window.location.href = "/change-password";
        }
        throw new Error(payload.message || "Password change required");
      }
      if (payload?.code === "STUDENT_DASHBOARD_DISABLED") {
        forceLogout();
        throw new Error(payload.message || "Dashboard access is disabled");
      }
    }

    if (!response.ok) {
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

/**
 * @typedef {"admin"|"coordinator"|"accountant"|"teacher"|"student"} Role
 *
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} password
 *
 * @typedef {Object} RegisterPayload
 * @property {string} firstName  — 2-50 chars
 * @property {string} lastName   — 2-50 chars
 * @property {string} email
 * @property {Role}   role
 * @property {string} schoolId   — 1-50 chars, alphanumeric
 *
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} [message]
 * @property {any}    [data]
 * @property {Array<{path?:string,msg:string}>} [errors]
 */

/**
 * Auth endpoints — mirrors `backend-core` /api/auth/*.
 *
 * Required-field reference is documented per call; payloads not matching the
 * backend validators return HTTP 400 with `{ success:false, errors:[...] }`.
 */
export const authApi = {
  /** @param {LoginCredentials} credentials */
  login: (credentials) => api.post("/auth/login-user", credentials),
  /** @param {RegisterPayload} userData */
  register: (userData) => api.post("/auth/register-user", userData),
  logout: () => api.post("/auth/logout-user"),
  logoutAll: () => api.post("/auth/logout-all-devices"),
  getProfile: () => api.get("/auth/get-user-profile"),
  getActiveSessions: () => api.get("/auth/get-active-sessions"),
  /** @param {string} sessionId */
  revokeSession: (sessionId) => api.delete(`/auth/revoke-session/${sessionId}`),
};

/**
 * Dashboard endpoints — only `/dashboard/stats` is implemented on the backend.
 * The remaining methods are stubs that will 404 until the backend exposes them.
 */
export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
  /** @deprecated Backend has no `/dashboard/recent-activity` route. */
  getRecentActivity: () => api.get("/dashboard/recent-activity"),
  /** @deprecated Backend has no `/dashboard/attendance-overview` route. */
  getAttendanceOverview: () => api.get("/dashboard/attendance-overview"),
  /** @deprecated Backend has no `/dashboard/performance` route. */
  getPerformanceData: () => api.get("/dashboard/performance"),
  getConfig: () => api.get("/features/get-dashboard-config"),
};

/**
 * @typedef {Object} StudentPayload
 * @property {string} firstName    — REQUIRED, 2-50 chars
 * @property {string} lastName     — REQUIRED, 2-50 chars
 * @property {string} email        — REQUIRED, valid email
 * @property {Role}   role         — REQUIRED, must be "student"
 * @property {string} dateOfBirth  — REQUIRED, ISO8601
 * @property {"male"|"female"|"other"} gender — REQUIRED
 * @property {string} [schoolId]   — optional, 1-50 alphanumeric
 *
 * @typedef {Object} StudentListParams
 * @property {string} [gradeId]
 * @property {number} [page]
 * @property {number} [limit]
 */

/**
 * Student endpoints — `admission` module routes mounted at /api/students.
 */
export const studentsApi = {
  /** @param {StudentListParams} [params] */
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
  /** @param {string} id */
  getById: (id) => api.get(`/students/get-student-by-id/${id}`),
  /** @param {StudentPayload} data */
  create: (data) => api.post("/students/create-student", data),
  /** @param {string} id @param {Partial<StudentPayload>} data */
  update: (id, data) => api.put(`/students/update-student-by-id/${id}`, data),
  /** @param {string} id */
  delete: (id) => api.delete(`/students/delete-student-by-id/${id}`),
  /** @param {string} query — min 3 chars */
  search: (query) => api.get(`/students/search?q=${encodeURIComponent(query)}`),
  /** @deprecated Backend has no `/students/grades` route — use `classesApi.getGradesOptions()`. */
  getGrades: () => api.get("/students/grades"),
  getStatusOptions: () => api.get("/students/get-status-options"),
  /** @deprecated Backend has no `/students/:id/attendance` route. */
  getAttendance: (id) => api.get(`/students/${id}/attendance`),
  /** @deprecated Backend has no `/students/:id/performance` route. */
  getPerformance: (id) => api.get(`/students/${id}/performance`),
  startExport: ({ scope, classId, classLabel } = {}) =>
    api.post("/students/export", { scope, classId, classLabel }),
  getExportStatus: (jobId) => api.get(`/students/export/status/${jobId}`),
  getExportDownloadUrl: (jobId) =>
    `${getApiBaseUrl()}/students/export/download/${jobId}`,
};

/**
 * @typedef {Object} TeacherPayload
 * @property {string} firstName       — REQUIRED, 2-50 chars
 * @property {string} lastName        — REQUIRED, 2-50 chars
 * @property {string} email           — REQUIRED, valid email
 * @property {Role}   role            — REQUIRED, must be "teacher"
 * @property {string} department      — REQUIRED
 * @property {number} experience      — REQUIRED, int >= 0
 * @property {string} dateOfJoining   — REQUIRED, ISO8601
 * @property {string} [schoolId]
 * @property {string} [qualification]
 * @property {number} [salary]
 * @property {string} [phone]
 */

/**
 * Teacher endpoints — `admission` module routes mounted at /api/teachers.
 */
export const teachersApi = {
  getAll: () => api.get("/teachers/get-all-teachers"),
  getTeacherNames: () => api.get("/teachers/get-teacher-names"),
  /** @param {string} id */
  getById: (id) => api.get(`/teachers/get-teacher-by-id/${id}`),
  /** @param {TeacherPayload} data */
  create: (data) => api.post("/teachers/create-teacher", data),
  /** @param {string} id @param {Partial<TeacherPayload>} data */
  update: (id, data) => api.put(`/teachers/update-teacher-by-id/${id}`, data),
  /** @param {string} id */
  delete: (id) => api.delete(`/teachers/delete-teacher-by-id/${id}`),
  /** @param {string} id — resets the teacher's password to a temporary one */
  resetPassword: (id) => api.post(`/teachers/${id}/reset-password`),
  /** @deprecated Backend has no `/teachers/search` route — use getAll + client filter. */
  search: (query) => api.get(`/teachers/search?q=${encodeURIComponent(query)}`),
  /** @deprecated Backend has no `/teachers/departments` route. */
  getDepartments: () => api.get("/teachers/departments"),
};

/**
 * @typedef {Object} ClassPayload
 * @property {string} grade         — REQUIRED
 * @property {string} section       — REQUIRED
 * @property {string} [className]   — display name composed from grade + section
 * @property {string} [gradeId]     — optional, 1-50 chars
 * @property {number} [maxStudents] — optional, 1-100
 */

export const classesApi = {
  getAll: () => api.get("/classes/get-all-classes"),
  getGradesAndClasses: () => api.get("/classes/grades-and-classes"),
  getGradesOptions: () => api.get("/classes/get-grades-options"),
  /** @param {string} id */
  getById: (id) => api.get(`/classes/get-class-by-id/${id}`),
  /** @param {ClassPayload} data */
  create: (data) => api.post("/classes/create-new-class", data),
  /** @param {string} id @param {Partial<ClassPayload>} data */
  update: (id, data) => api.put(`/classes/update-class/${id}`, data),
  /** @param {string} id */
  delete: (id) => api.delete(`/classes/delete-class/${id}`),
  /** @param {string} classId @param {string} studentId */
  addStudent: (classId, studentId) =>
    api.post(`/classes/add-student-to-class/${classId}`, { studentId }),
};

/**
 * @typedef {Object} SubjectPayload
 * @property {string} subjectName  — REQUIRED, 2-100 chars
 * @property {string} subjectCode  — REQUIRED, 2-10 chars, /^[A-Z0-9]+$/
 * @property {string} department   — REQUIRED
 * @property {number} credits      — REQUIRED, int 1-10
 * @property {string} [description]
 * @property {string} [syllabus]
 */

export const subjectsApi = {
  getAll: () => api.get("/subjects/get-all-subjects"),
  /** @param {string} id */
  getById: (id) => api.get(`/subjects/get-subject-by-id/${id}`),
  /** @param {SubjectPayload} data */
  create: (data) => api.post("/subjects/create-subject", data),
  /** @param {string} id @param {Partial<SubjectPayload>} data */
  update: (id, data) => api.put(`/subjects/update-subject-by-id/${id}`, data),
  /** @param {string} id */
  delete: (id) => api.delete(`/subjects/delete-subject-by-id/${id}`),
  /** @param {string} subjectId @param {string} teacherId */
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

/**
 * @typedef {Object} ExamSubjectPayload
 * @property {string} subjectId        — REQUIRED
 * @property {string} examDate         — REQUIRED, ISO date (YYYY-MM-DD)
 * @property {number} maxMarks         — REQUIRED, > 0
 * @property {number} passingMarks     — REQUIRED, 0 ≤ passing ≤ maxMarks
 * @property {string} [startTime]      — HH:MM
 * @property {string} [endTime]        — HH:MM
 *
 * @typedef {Object} ExamPayload
 * @property {string} examName                   — REQUIRED, 2-150 chars
 * @property {"EXAM"|"REGULAR_ASSESSMENT"} examType — REQUIRED
 * @property {string} gradeId                    — REQUIRED
 * @property {string} academicYear               — REQUIRED
 * @property {string} [status]                   — DRAFT|SCHEDULED|ONGOING|COMPLETED|PUBLISHED
 * @property {string} [instructions]
 * @property {ExamSubjectPayload[]} subjects     — REQUIRED, ≥1 row
 *
 * @typedef {Object} MarksEntry
 * @property {string} studentId
 * @property {number|null} [marksObtained]
 * @property {"PASS"|"FAIL"|"ABSENT"} [status]
 * @property {string} [remarks]
 */

/**
 * Examination endpoints — `examination` module routes mounted at /api/exams.
 */
export const examinationsApi = {
  /** @param {{gradeId?:string, academicYear?:string, examType?:string, status?:string}} [filters] */
  list: (filters = {}) => {
    const qs = new URLSearchParams();
    if (filters.gradeId) qs.set("gradeId", filters.gradeId);
    if (filters.academicYear) qs.set("academicYear", filters.academicYear);
    if (filters.examType) qs.set("examType", filters.examType);
    if (filters.status) qs.set("status", filters.status);
    const q = qs.toString();
    return api.get(`/exams${q ? `?${q}` : ""}`);
  },
  /** @param {string} examId */
  getById: (examId) => api.get(`/exams/${examId}`),
  /** @param {ExamPayload} data */
  create: (data) => api.post("/exams", data),
  /** @param {string} examId @param {Partial<ExamPayload>} data */
  update: (examId, data) => api.put(`/exams/${examId}`, data),
  /** @param {string} examId */
  delete: (examId) => api.delete(`/exams/${examId}`),

  /** @param {string} examId */
  getStudents: (examId) => api.get(`/exams/${examId}/students`),
  /** @param {string} examId */
  getResults: (examId) => api.get(`/exams/${examId}/results`),

  /**
   * @param {string} examId
   * @param {string} examSubjectId
   * @param {MarksEntry[]} entries
   */
  submitMarks: (examId, examSubjectId, entries) =>
    api.post(`/exams/${examId}/subjects/${examSubjectId}/marks`, { entries }),

  /**
   * @param {string} studentId
   * @param {{academicYear?:string}} [filters]
   */
  getReportCard: (studentId, filters = {}) => {
    const qs = filters.academicYear
      ? `?academicYear=${encodeURIComponent(filters.academicYear)}`
      : "";
    return api.get(`/exams/students/${studentId}/report-card${qs}`);
  },
};

/**
 * @typedef {Object} AttendanceEntry
 * @property {string} studentId
 * @property {"PRESENT"|"ABSENT"|"LATE"|"EXCUSED"} status
 * @property {string} [remarks]
 */

/**
 * Attendance endpoints — `attendance` module routes mounted at /api/attendance.
 */
export const attendanceApi = {
  /**
   * @param {string} classId
   * @param {string} [date]   — YYYY-MM-DD (defaults to today on the backend)
   * @param {string} [period]
   */
  getClassRoster: (classId, date, period) => {
    const qs = new URLSearchParams();
    if (date) qs.set("date", date);
    if (period) qs.set("period", period);
    const q = qs.toString();
    return api.get(`/attendance/class/${classId}${q ? `?${q}` : ""}`);
  },

  /**
   * @param {{classId:string, date:string, period?:string, entries:AttendanceEntry[]}} payload
   */
  mark: (payload) => api.post("/attendance/mark", payload),

  /**
   * @param {string} studentId
   * @param {{from?:string, to?:string}} [filters]
   */
  getStudentHistory: (studentId, filters = {}) => {
    const qs = new URLSearchParams();
    if (filters.from) qs.set("from", filters.from);
    if (filters.to) qs.set("to", filters.to);
    const q = qs.toString();
    return api.get(`/attendance/student/${studentId}${q ? `?${q}` : ""}`);
  },

  /**
   * @param {{classId?:string, from?:string, to?:string}} [filters]
   */
  getSummary: (filters = {}) => {
    const qs = new URLSearchParams();
    if (filters.classId) qs.set("classId", filters.classId);
    if (filters.from) qs.set("from", filters.from);
    if (filters.to) qs.set("to", filters.to);
    const q = qs.toString();
    return api.get(`/attendance/summary${q ? `?${q}` : ""}`);
  },
};

/**
 * Academic endpoints — enrollment history + promotion.
 * Routes mounted at /api/academic.
 */
export const academicApi = {
  getEnrollments: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.academicYearId) qs.set("academicYearId", params.academicYearId);
    if (params.gradeId) qs.set("gradeId", params.gradeId);
    if (params.classId) qs.set("classId", params.classId);
    if (params.studentId) qs.set("studentId", params.studentId);
    const q = qs.toString();
    return api.get(`/academic/enrollments${q ? `?${q}` : ""}`);
  },
  getStudentEnrollments: (studentId) =>
    api.get(`/academic/enrollments/student/${studentId}`),
  createEnrollment: (data) => api.post("/academic/enrollments", data),

  getPromotionRule: () => api.get("/academic/promotion-rule"),
  savePromotionRule: (data) => api.put("/academic/promotion-rule", data),

  previewPromotions: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.academicYearId) qs.set("academicYearId", params.academicYearId);
    if (params.gradeId) qs.set("gradeId", params.gradeId);
    if (params.classId) qs.set("classId", params.classId);
    return api.get(`/academic/promotions/preview?${qs.toString()}`);
  },
  runPromotions: (data) => api.post("/academic/promotions/run", data),
};

export default api;

// Export for backward compatibility
export { API_ENDPOINTS };
