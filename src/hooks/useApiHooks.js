import { useApiQuery, useApiMutation, QUERY_KEYS } from "./useApi";
import {
  authApi,
  dashboardApi,
  studentsApi,
  teachersApi,
  classesApi,
  subjectsApi,
  feesApi,
  featuresApi,
  systemApi,
  profileApi,
} from "../services/apiClient";
import { data } from "autoprefixer";

// Authentication hooks
export const useLogin = () => {
  return useApiMutation({
    mutationFn: ({ data }) => authApi.login(data),
  });
};

export const useLogout = () => {
  return useApiMutation({
    mutationFn: () => authApi.logout(),
    invalidateQueries: [QUERY_KEYS.PROFILE, QUERY_KEYS.ACTIVE_SESSIONS],
  });
};

export const useProfile = () => {
  return useApiQuery(QUERY_KEYS.PROFILE, null, {
    queryFn: () => authApi.getProfile(),
  });
};

export const useActiveSessions = () => {
  return useApiQuery(QUERY_KEYS.ACTIVE_SESSIONS, null, {
    queryFn: () => authApi.getActiveSessions(),
  });
};

// Dashboard hooks
export const useDashboardStats = () => {
  return useApiQuery(QUERY_KEYS.DASHBOARD_STATS, null, {
    queryFn: () => dashboardApi.getStats(),
  });
};

export const useRecentActivity = () => {
  return useApiQuery(QUERY_KEYS.RECENT_ACTIVITY, null, {
    queryFn: () => dashboardApi.getRecentActivity(),
  });
};

export const useAttendanceOverview = () => {
  return useApiQuery(QUERY_KEYS.ATTENDANCE_OVERVIEW, null, {
    queryFn: () => dashboardApi.getAttendanceOverview(),
  });
};

export const usePerformanceData = () => {
  return useApiQuery(QUERY_KEYS.PERFORMANCE_DATA, null, {
    queryFn: () => dashboardApi.getPerformanceData(),
  });
};

export const useDashboardConfig = () => {
  return useApiQuery(QUERY_KEYS.DASHBOARD_CONFIG, null, {
    queryFn: () => dashboardApi.getConfig(),
  });
};

// Teachers hooks
export const useTeachers = () => {
  return useApiQuery(QUERY_KEYS.TEACHERS, null, {
    queryFn: () => teachersApi.getAll(),
  });
};

export const useTeacherNames = () => {
  return useApiQuery(QUERY_KEYS.TEACHER_NAMES, null, {
    queryFn: () => teachersApi.getTeacherNames(),
  });
};

export const useTeacher = (id) => {
  return useApiQuery([QUERY_KEYS.TEACHER_DETAIL, id], null, {
    queryFn: () => teachersApi.getById(id),
    enabled: !!id, // Only run query if id exists
  });
};

export const useTeacherDepartments = () => {
  return useApiQuery(QUERY_KEYS.TEACHER_DEPARTMENTS, null, {
    queryFn: () => teachersApi.getDepartments(),
  });
};

export const useCreateTeacher = () => {
  return useApiMutation({
    mutationFn: ({ data }) => teachersApi.create(data),
    invalidateQueries: [QUERY_KEYS.TEACHERS, QUERY_KEYS.TEACHER_DEPARTMENTS],
  });
};

export const useUpdateTeacher = () => {
  return useApiMutation({
    mutationFn: ({ id, data }) => teachersApi.update(id, data),
    invalidateQueries: [QUERY_KEYS.TEACHERS, QUERY_KEYS.TEACHER_DETAIL],
  });
};

export const useDeleteTeacher = () => {
  return useApiMutation({
    mutationFn: ({ id }) => teachersApi.delete(id),
    invalidateQueries: [QUERY_KEYS.TEACHERS],
  });
};

// Students hooks
export const useStudents = () => {
  return useApiQuery(QUERY_KEYS.STUDENTS, null, {
    queryFn: () => studentsApi.getAll(),
  });
};

export const useStudent = (id) => {
  return useApiQuery([QUERY_KEYS.STUDENT_DETAIL, id], null, {
    queryFn: () => studentsApi.getById(id),
    enabled: !!id,
  });
};

export const useStudentGrades = () => {
  return useApiQuery(QUERY_KEYS.STUDENT_GRADES, null, {
    queryFn: () => studentsApi.getGrades(),
  });
};

export const useStudentAttendance = (id) => {
  return useApiQuery([QUERY_KEYS.STUDENT_ATTENDANCE, id], null, {
    queryFn: () => studentsApi.getAttendance(id),
    enabled: !!id,
  });
};

export const useStudentPerformance = (id) => {
  return useApiQuery([QUERY_KEYS.STUDENT_PERFORMANCE, id], null, {
    queryFn: () => studentsApi.getPerformance(id),
    enabled: !!id,
  });
};

export const useCreateStudent = () => {
  return useApiMutation({
    mutationFn: ({ data }) => studentsApi.create(data),
    invalidateQueries: [QUERY_KEYS.STUDENTS],
  });
};

export const useUpdateStudent = () => {
  return useApiMutation({
    mutationFn: ({ id, data }) => studentsApi.update(id, data),
    invalidateQueries: [QUERY_KEYS.STUDENTS, QUERY_KEYS.STUDENT_DETAIL],
  });
};

export const useDeleteStudent = () => {
  return useApiMutation({
    mutationFn: ({ id }) => studentsApi.delete(id),
    invalidateQueries: [QUERY_KEYS.STUDENTS],
  });
};

// Classes hooks
export const useClasses = () => {
  return useApiQuery(QUERY_KEYS.CLASSES, null, {
    queryFn: () => classesApi.getAll(),
  });
};

export const useGradesAndClasses = () => {
  return useApiQuery(QUERY_KEYS.GRADES_AND_CLASSES, null, {
    queryFn: () => classesApi.getGradesAndClasses(),
  });
};

export const useGradesOptions = () => {
  return useApiQuery(QUERY_KEYS.GRADES_OPTIONS, null, {
    queryFn: () => classesApi.getGradesOptions(),
  });
};

export const useClass = (id) => {
  return useApiQuery([QUERY_KEYS.CLASS_DETAIL, id], null, {
    queryFn: () => classesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateClass = () => {
  return useApiMutation({
    mutationFn: ({ data }) => classesApi.create(data),
    invalidateQueries: [QUERY_KEYS.CLASSES],
  });
};

export const useUpdateClass = () => {
  return useApiMutation({
    mutationFn: ({ id, data }) => classesApi.update(id, data),
    invalidateQueries: [QUERY_KEYS.CLASSES, QUERY_KEYS.CLASS_DETAIL],
  });
};

export const useDeleteClass = () => {
  return useApiMutation({
    mutationFn: ({ id }) => classesApi.delete(id),
    invalidateQueries: [QUERY_KEYS.CLASSES],
  });
};

export const useAddStudentToClass = () => {
  return useApiMutation({
    mutationFn: ({ classId, studentId }) =>
      classesApi.addStudent(classId, studentId),
    invalidateQueries: [
      QUERY_KEYS.CLASSES,
      QUERY_KEYS.CLASS_DETAIL,
      QUERY_KEYS.STUDENTS,
    ],
  });
};

// Subjects hooks
export const useSubjects = () => {
  return useApiQuery(QUERY_KEYS.SUBJECTS, null, {
    queryFn: () => subjectsApi.getAll(),
  });
};

export const useSubject = (id) => {
  return useApiQuery([QUERY_KEYS.SUBJECT_DETAIL, id], null, {
    queryFn: () => subjectsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateSubject = () => {
  return useApiMutation({
    mutationFn: ({ data }) => subjectsApi.create(data),
    invalidateQueries: [QUERY_KEYS.SUBJECTS],
  });
};

export const useUpdateSubject = () => {
  return useApiMutation({
    mutationFn: ({ id, data }) => subjectsApi.update(id, data),
    invalidateQueries: [QUERY_KEYS.SUBJECTS, QUERY_KEYS.SUBJECT_DETAIL],
  });
};

export const useDeleteSubject = () => {
  return useApiMutation({
    mutationFn: ({ id }) => subjectsApi.delete(id),
    invalidateQueries: [QUERY_KEYS.SUBJECTS],
  });
};

export const useAssignTeacherToSubject = () => {
  return useApiMutation({
    mutationFn: ({ subjectId, teacherId }) =>
      subjectsApi.assignTeacher(subjectId, teacherId),
    invalidateQueries: [
      QUERY_KEYS.SUBJECTS,
      QUERY_KEYS.SUBJECT_DETAIL,
      QUERY_KEYS.TEACHERS,
    ],
  });
};

// Fees hooks
export const useFeeStructures = () => {
  return useApiQuery(QUERY_KEYS.FEE_STRUCTURES, null, {
    queryFn: () => feesApi.getStructures(),
  });
};

export const usePaymentHistory = (studentId) => {
  return useApiQuery([QUERY_KEYS.PAYMENT_HISTORY, studentId], null, {
    queryFn: () => feesApi.getPaymentHistory(studentId),
    enabled: !!studentId,
  });
};

export const useFeeReport = () => {
  return useApiQuery(QUERY_KEYS.FEE_REPORT, null, {
    queryFn: () => feesApi.generateReport(),
  });
};

export const useCreateFeeStructure = () => {
  return useApiMutation({
    mutationFn: ({ data }) => feesApi.createStructure(data),
    invalidateQueries: [QUERY_KEYS.FEE_STRUCTURES],
  });
};

export const useUpdateFeeStructure = () => {
  return useApiMutation({
    mutationFn: ({ id, data }) => feesApi.updateStructure(id, data),
    invalidateQueries: [QUERY_KEYS.FEE_STRUCTURES],
  });
};

export const useDeleteFeeStructure = () => {
  return useApiMutation({
    mutationFn: ({ id }) => feesApi.deleteStructure(id),
    invalidateQueries: [QUERY_KEYS.FEE_STRUCTURES],
  });
};

export const useRecordPayment = () => {
  return useApiMutation({
    mutationFn: ({ data }) => feesApi.recordPayment(data),
    invalidateQueries: [QUERY_KEYS.PAYMENT_HISTORY, QUERY_KEYS.FEE_REPORT],
  });
};

// Features hooks
export const useFeatures = () => {
  return useApiQuery(QUERY_KEYS.FEATURES, null, {
    queryFn: () => featuresApi.getFeatures(),
  });
};

export const useSchoolFeatures = (schoolId) => {
  return useApiQuery([QUERY_KEYS.SCHOOL_FEATURES, schoolId], null, {
    queryFn: () => featuresApi.getSchoolFeatures(schoolId),
    enabled: !!schoolId,
  });
};

export const useAllSchools = () => {
  return useApiQuery(QUERY_KEYS.ALL_SCHOOLS, null, {
    queryFn: () => featuresApi.getAllSchools(),
  });
};

export const useUpdateSchoolFeatures = () => {
  return useApiMutation({
    mutationFn: ({ schoolId, enabledFeatures }) =>
      featuresApi.updateSchoolFeatures(schoolId, enabledFeatures),
    invalidateQueries: [QUERY_KEYS.SCHOOL_FEATURES],
  });
};

export const useReloadConfig = () => {
  return useApiMutation({
    mutationFn: () => featuresApi.reloadConfig(),
    invalidateQueries: [QUERY_KEYS.DASHBOARD_CONFIG, QUERY_KEYS.FEATURES],
  });
};

// System hooks
export const useSystemHealth = () => {
  return useApiQuery(QUERY_KEYS.SYSTEM_HEALTH, null, {
    queryFn: () => systemApi.healthCheck(),
  });
};

// Profile hooks
export const useUpdateProfile = () => {
  return useApiMutation({
    mutationFn: ({ data }) => profileApi.update(data),
    invalidateQueries: [QUERY_KEYS.PROFILE],
  });
};

export const useChangePassword = () => {
  return useApiMutation({
    mutationFn: ({ data }) => profileApi.changePassword(data),
  });
};

export const useUploadAvatar = () => {
  return useApiMutation({
    mutationFn: ({ file }) => profileApi.uploadAvatar(file),
    invalidateQueries: [QUERY_KEYS.PROFILE],
  });
};
