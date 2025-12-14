// API Endpoints - kept for backward compatibility during migration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login-user",
    REGISTER: "/auth/register-user",
    LOGOUT: "/auth/logout-user",
    LOGOUT_ALL: "/auth/logout-all-devices",
    PROFILE: "/auth/get-user-profile",
    ACTIVE_SESSIONS: "/auth/get-active-sessions",
    REVOKE_SESSION: (sessionId) => `/auth/revoke-session/${sessionId}`,
  },

  // Dashboard & Features
  DASHBOARD: {
    STATS: "/dashboard/stats",
    RECENT_ACTIVITY: "/dashboard/recent-activity",
    ATTENDANCE_OVERVIEW: "/dashboard/attendance-overview",
    PERFORMANCE_DATA: "/dashboard/performance",
    CONFIG: "/features/get-dashboard-config",
  },

  // Feature Management
  FEATURES: {
    LIST: "/features/features",
    CHECK: (feature) => `/features/check/${feature}`,
    SCHOOL_FEATURES: (schoolId) => `/features/school/${schoolId}`,
    UPDATE_SCHOOL_FEATURES: (schoolId) => `/features/school/${schoolId}`,
    ALL_SCHOOLS: "/features/schools/all",
    RELOAD_CONFIG: "/features/reload-config",
  },

  // Teachers
  TEACHERS: {
    LIST: "/teachers/get-all-teachers",
    CREATE: "/teachers/create-teacher",
    GET_BY_ID: (id) => `/teachers/get-teacher-by-id/${id}`,
    UPDATE: (id) => `/teachers/update-teacher-by-id/${id}`,
    DELETE: (id) => `/teachers/delete-teacher-by-id/${id}`,
    SEARCH: "/teachers/search",
    DEPARTMENTS: "/teachers/departments",
  },

  // Students
  STUDENTS: {
    LIST: "/students/get-all-students",
    CREATE: "/students/create-student",
    GET_BY_ID: (id) => `/students/get-student-by-id/${id}`,
    UPDATE: (id) => `/students/update-student-by-id/${id}`,
    DELETE: (id) => `/students/delete-student-by-id/${id}`,
    SEARCH: "/students/search",
    GRADES: "/students/grades",
    ATTENDANCE: (id) => `/students/${id}/attendance`,
    PERFORMANCE: (id) => `/students/${id}/performance`,
  },

  // Classes
  CLASSES: {
    LIST: "/classes/get-all-classes",
    CREATE: "/classes/create-new-class",
    GET_BY_ID: (id) => `/classes/get-class-by-id/${id}`,
    UPDATE: (id) => `/classes/update-class/${id}`,
    DELETE: (id) => `/classes/delete-class/${id}`,
    ADD_STUDENT: (id) => `/classes/add-student-to-class/${id}`,
  },

  // Subjects
  SUBJECTS: {
    LIST: "/subjects/get-all-subjects",
    CREATE: "/subjects/create-subject",
    GET_BY_ID: (id) => `/subjects/get-subject-by-id/${id}`,
    UPDATE: (id) => `/subjects/update-subject-by-id/${id}`,
    DELETE: (id) => `/subjects/delete-subject-by-id/${id}`,
    ASSIGN_TEACHER: (id) => `/subjects/assign-teacher-to-subject/${id}`,
  },

  // Fees
  FEES: {
    CREATE_STRUCTURE: "/fees/create-fee-structure",
    GET_STRUCTURES: "/fees/get-fee-structures",
    UPDATE_STRUCTURE: (id) => `/fees/update-fee-structure/${id}`,
    DELETE_STRUCTURE: (id) => `/fees/delete-fee-structure/${id}`,
    RECORD_PAYMENT: "/fees/record-payment",
    PAYMENT_HISTORY: (studentId) => `/fees/get-payment-history/${studentId}`,
    GENERATE_REPORT: "/fees/generate-fee-report",
  },

  // System Health
  HEALTH: "/health",

  // User Profile
  PROFILE: {
    GET: "/auth/get-user-profile",
    UPDATE: "/profile",
    CHANGE_PASSWORD: "/profile/change-password",
    UPLOAD_AVATAR: "/profile/avatar",
  },

  // Settings
  SETTINGS: {
    GENERAL: "/settings/general",
    NOTIFICATIONS: "/settings/notifications",
    SYSTEM: "/settings/system",
    BACKUP: "/settings/backup",
  },

  // Reports
  REPORTS: {
    STUDENT_PERFORMANCE: "/reports/student-performance",
    ATTENDANCE_REPORT: "/reports/attendance",
    FINANCIAL_REPORT: "/reports/financial",
    TEACHER_PERFORMANCE: "/reports/teacher-performance",
  },
};

// For backward compatibility during migration
const apiConfig = {
  API_ENDPOINTS,
};

export default apiConfig;
