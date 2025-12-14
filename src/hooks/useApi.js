import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken, removeAuthToken } from "../utils/cookies";
import { getApiBaseUrl } from "../utils/apiConfig";

// Base API client function
const apiClient = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${getApiBaseUrl()}${endpoint}`;

  // Get token from cookies
  const token = getAuthToken();

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

  const response = await fetch(url, defaultOptions);

  if (!response.ok) {
    if (response.status === 401) {
      // Clear cookies and localStorage on unauthorized access
      removeAuthToken();
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("dashboardConfig");
      window.location.href = "/login";
      throw new Error("Unauthorized access");
    }

    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If we can't parse error response, use default message
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

// Custom hook for GET requests (queries)
export const useApiQuery = (key, endpoint, options = {}) => {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: () => apiClient(endpoint, { method: "GET" }),
    ...options,
  });
};

// Custom hook for POST/PUT/PATCH/DELETE requests (mutations)
export const useApiMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ endpoint, data, method = "POST" }) => {
      const requestOptions = { method };

      if (data) {
        if (data instanceof FormData) {
          requestOptions.body = data;
        } else {
          requestOptions.body = JSON.stringify(data);
        }
      }

      return apiClient(endpoint, requestOptions);
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries after successful mutation
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
    },
    ...options,
  });
};

// Convenience hooks for specific HTTP methods
export const useApiPost = (options = {}) => {
  return useApiMutation({
    ...options,
    mutationFn: ({ endpoint, data }) =>
      apiClient(endpoint, {
        method: "POST",
        body: data instanceof FormData ? data : JSON.stringify(data),
      }),
  });
};

export const useApiPut = (options = {}) => {
  return useApiMutation({
    ...options,
    mutationFn: ({ endpoint, data }) =>
      apiClient(endpoint, {
        method: "PUT",
        body: data instanceof FormData ? data : JSON.stringify(data),
      }),
  });
};

export const useApiPatch = (options = {}) => {
  return useApiMutation({
    ...options,
    mutationFn: ({ endpoint, data }) =>
      apiClient(endpoint, {
        method: "PATCH",
        body: data instanceof FormData ? data : JSON.stringify(data),
      }),
  });
};

export const useApiDelete = (options = {}) => {
  return useApiMutation({
    ...options,
    mutationFn: ({ endpoint }) => apiClient(endpoint, { method: "DELETE" }),
  });
};

// Export the base API client for direct use if needed
export { apiClient };

// Query keys for consistent cache management
export const QUERY_KEYS = {
  // Authentication
  PROFILE: "profile",
  ACTIVE_SESSIONS: "activeSessions",

  // Dashboard
  DASHBOARD_STATS: "dashboardStats",
  RECENT_ACTIVITY: "recentActivity",
  ATTENDANCE_OVERVIEW: "attendanceOverview",
  PERFORMANCE_DATA: "performanceData",
  DASHBOARD_CONFIG: "dashboardConfig",

  // Features
  FEATURES: "features",
  SCHOOL_FEATURES: "schoolFeatures",
  ALL_SCHOOLS: "allSchools",

  // Teachers
  TEACHERS: "teachers",
  TEACHER_NAMES: "teacherNames",
  TEACHER_DETAIL: "teacherDetail",
  TEACHER_DEPARTMENTS: "teacherDepartments",

  // Students
  STUDENTS: "students",
  STUDENT_DETAIL: "studentDetail",
  STUDENT_GRADES: "studentGrades",
  STUDENT_ATTENDANCE: "studentAttendance",
  STUDENT_PERFORMANCE: "studentPerformance",

  // Classes
  CLASSES: "classes",
  GRADES_AND_CLASSES: "gradesAndClasses",
  GRADES_OPTIONS: "gradesOptions",
  CLASS_DETAIL: "classDetail",

  // Subjects
  SUBJECTS: "subjects",
  SUBJECT_DETAIL: "subjectDetail",

  // Fees
  FEE_STRUCTURES: "feeStructures",
  PAYMENT_HISTORY: "paymentHistory",
  FEE_REPORT: "feeReport",

  // System
  SYSTEM_HEALTH: "systemHealth",

  // Settings
  GENERAL_SETTINGS: "generalSettings",
  NOTIFICATION_SETTINGS: "notificationSettings",
  SYSTEM_SETTINGS: "systemSettings",
};
