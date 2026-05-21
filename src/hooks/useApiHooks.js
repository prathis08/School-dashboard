import { useApiQuery, useApiMutation, QUERY_KEYS } from "./useApi";
import { useQueryClient } from "@tanstack/react-query";
import {
  authApi,
  dashboardApi,
  studentsApi,
  studentsWithFeesApi,
  teachersApi,
  classesApi,
  subjectsApi,
  feesApi,
  enhancedFeesApi,
  featuresApi,
  systemApi,
  profileApi,
  settingsApi,
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
    queryFn: () => profileApi.get(),
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
export const useStudents = (optionsOrEnabled = {}) => {
  const options =
    typeof optionsOrEnabled === "boolean"
      ? { enabled: optionsOrEnabled }
      : optionsOrEnabled || {};
  const { enabled = true, gradeId } = options;
  const filters = gradeId ? { gradeId } : {};

  return useApiQuery([QUERY_KEYS.STUDENTS, filters], null, {
    queryFn: () => studentsApi.getAll(filters),
    enabled,
  });
};

export const useSearchStudents = (query) => {
  return useApiQuery(["searchStudents", query], null, {
    queryFn: () => studentsApi.search(query),
    enabled: Boolean(query && query.length >= 3),
    staleTime: 30000, // Cache for 30 seconds
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

export const useStudentStatusOptions = () => {
  return useApiQuery(QUERY_KEYS.STUDENT_STATUS_OPTIONS, null, {
    queryFn: () => studentsApi.getStatusOptions(),
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
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({ id, data }) => studentsApi.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate all students queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENTS] });
      // Invalidate all student detail queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_DETAIL] });
      // Specifically invalidate the student that was just updated
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.STUDENT_DETAIL, variables.id],
        });
      }
    },
  });
};

export const useDeleteStudent = () => {
  return useApiMutation({
    mutationFn: ({ id }) => studentsApi.delete(id),
    invalidateQueries: [QUERY_KEYS.STUDENTS],
  });
};

export const useStartStudentExport = () => {
  return useApiMutation({
    mutationFn: ({ scope, classId, classLabel }) =>
      studentsApi.startExport({ scope, classId, classLabel }),
  });
};

export const useStudentExportStatus = (jobId, { enabled = true } = {}) => {
  return useApiQuery(["studentExportStatus", jobId], null, {
    queryFn: () => studentsApi.getExportStatus(jobId),
    enabled: Boolean(jobId) && enabled,
    refetchInterval: (query) => {
      const status = query?.state?.data?.data?.status;
      if (status === "ready" || status === "failed") return false;
      return 1500;
    },
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
};

export const useStartDuesExport = () => {
  return useApiMutation({
    mutationFn: ({ scope, classId, classLabel }) =>
      enhancedFeesApi.duesExport.start({ scope, classId, classLabel }),
  });
};

export const useDuesExportStatus = (jobId, { enabled = true } = {}) => {
  return useApiQuery(["duesExportStatus", jobId], null, {
    queryFn: () => enhancedFeesApi.duesExport.getStatus(jobId),
    enabled: Boolean(jobId) && enabled,
    refetchInterval: (query) => {
      const status = query?.state?.data?.data?.status;
      if (status === "ready" || status === "failed") return false;
      return 1500;
    },
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
};

// Students with fees hook
export const useStudentsWithFees = (filters = {}, enabled = false) => {
  return useApiQuery([QUERY_KEYS.STUDENTS_WITH_FEES, filters], filters, {
    queryFn: () => studentsWithFeesApi.getStudentsWithFees(filters),
    enabled: enabled, // Only run when enabled
    keepPreviousData: true, // Keep previous data while loading new data
    staleTime: 30000, // Cache for 30 seconds
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

export const useSubject = (id, options = {}) => {
  return useApiQuery([QUERY_KEYS.SUBJECT_DETAIL, id], null, {
    queryFn: () => subjectsApi.getById(id),
    enabled: !!id,
    ...options,
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

export const useFeeTypes = () => {
  return useApiQuery(QUERY_KEYS.FEE_TYPES, null, {
    queryFn: () => feesApi.getFeeTypes(),
  });
};

export const useAcademicSessions = () => {
  return useApiQuery(QUERY_KEYS.ACADEMIC_SESSIONS, null, {
    queryFn: () => feesApi.getAcademicSessions(),
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
    mutationFn: ({ feeStructureId }) => feesApi.deleteStructure(feeStructureId),
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

// Settings hooks
export const useSchoolSettings = () => {
  return useApiQuery(QUERY_KEYS.SETTINGS_SCHOOL, null, {
    queryFn: () => settingsApi.getSchool(),
  });
};

export const useUpdateSchoolSettings = () => {
  return useApiMutation({
    mutationFn: ({ data }) => settingsApi.updateSchool(data),
    invalidateQueries: [QUERY_KEYS.SETTINGS_SCHOOL],
  });
};

export const useAppearanceSettings = () => {
  return useApiQuery(QUERY_KEYS.SETTINGS_PREFERENCES, null, {
    queryFn: () => settingsApi.getPreferences(),
  });
};

export const useUpdateAppearanceSettings = () => {
  return useApiMutation({
    mutationFn: ({ data }) => settingsApi.updatePreferences(data),
    invalidateQueries: [QUERY_KEYS.SETTINGS_PREFERENCES],
  });
};

// ==================== Enhanced Fees Hooks ====================

// Academic Year Hooks
export const useEnhancedAcademicYears = () => {
  return useApiQuery(QUERY_KEYS.ENHANCED_ACADEMIC_YEARS, null, {
    queryFn: () => enhancedFeesApi.academicYears.getAll(),
  });
};

export const useEnhancedActiveYear = () => {
  return useApiQuery(QUERY_KEYS.ENHANCED_ACTIVE_YEAR, null, {
    queryFn: () => enhancedFeesApi.academicYears.getActive(),
  });
};

export const useCreateAcademicYear = () => {
  return useApiMutation({
    mutationFn: ({ data }) => enhancedFeesApi.academicYears.create(data),
    invalidateQueries: [
      QUERY_KEYS.ENHANCED_ACADEMIC_YEARS,
      QUERY_KEYS.ENHANCED_ACTIVE_YEAR,
    ],
  });
};

export const useUpdateAcademicYear = () => {
  return useApiMutation({
    mutationFn: ({ academicYearId, data }) =>
      enhancedFeesApi.academicYears.update(academicYearId, data),
    invalidateQueries: [
      QUERY_KEYS.ENHANCED_ACADEMIC_YEARS,
      QUERY_KEYS.ENHANCED_ACTIVE_YEAR,
    ],
  });
};

export const useDeleteAcademicYear = () => {
  return useApiMutation({
    mutationFn: (academicYearId) =>
      enhancedFeesApi.academicYears.delete(academicYearId),
    invalidateQueries: [
      QUERY_KEYS.ENHANCED_ACADEMIC_YEARS,
      QUERY_KEYS.ENHANCED_ACTIVE_YEAR,
    ],
  });
};

export const useSetActiveAcademicYear = () => {
  return useApiMutation({
    mutationFn: (academicYearId) =>
      enhancedFeesApi.academicYears.setActive(academicYearId),
    invalidateQueries: [
      QUERY_KEYS.ENHANCED_ACADEMIC_YEARS,
      QUERY_KEYS.ENHANCED_ACTIVE_YEAR,
    ],
  });
};

// Enhanced Fee Type Hooks
export const useEnhancedFeeTypes = () => {
  return useApiQuery(QUERY_KEYS.ENHANCED_FEE_TYPES, null, {
    queryFn: () => enhancedFeesApi.feeTypes.getAll(),
  });
};

export const useCreateFeeType = () => {
  return useApiMutation({
    mutationFn: ({ data }) => enhancedFeesApi.feeTypes.create(data),
    invalidateQueries: [QUERY_KEYS.ENHANCED_FEE_TYPES],
  });
};

export const useUpdateFeeType = () => {
  return useApiMutation({
    mutationFn: ({ feeTypeId, data }) =>
      enhancedFeesApi.feeTypes.update(feeTypeId, data),
    invalidateQueries: [QUERY_KEYS.ENHANCED_FEE_TYPES],
  });
};

export const useDeleteFeeType = () => {
  return useApiMutation({
    mutationFn: (feeTypeId) => enhancedFeesApi.feeTypes.delete(feeTypeId),
    invalidateQueries: [QUERY_KEYS.ENHANCED_FEE_TYPES],
  });
};

// Class Fee Structure Hooks
export const useEnhancedClassFees = (academicYearId, classId) => {
  return useApiQuery(
    [QUERY_KEYS.ENHANCED_CLASS_FEES, academicYearId, classId],
    null,
    {
      queryFn: () => enhancedFeesApi.classFees.get(academicYearId, classId),
      enabled: !!academicYearId && !!classId,
    },
  );
};

export const useCreateClassFees = () => {
  return useApiMutation({
    mutationFn: ({ data }) => enhancedFeesApi.classFees.create(data),
    invalidateQueries: [QUERY_KEYS.ENHANCED_CLASS_FEES],
  });
};

// Installment Schedule Hooks
export const useCreateSchedule = () => {
  return useApiMutation({
    mutationFn: ({ data }) => enhancedFeesApi.schedules.create(data),
    invalidateQueries: [QUERY_KEYS.ENHANCED_SCHEDULES],
  });
};

export const useCreateQuarterlySchedule = () => {
  return useApiMutation({
    mutationFn: ({ academicYearId, classId }) =>
      enhancedFeesApi.schedules.createQuarterly(academicYearId, classId),
    invalidateQueries: [QUERY_KEYS.ENHANCED_SCHEDULES],
  });
};

export const useCreateQuarterlyScheduleForGrade = () => {
  return useApiMutation({
    mutationFn: ({ academicYearId, gradeId }) =>
      enhancedFeesApi.schedules.createQuarterlyForGrade(
        academicYearId,
        gradeId,
      ),
    invalidateQueries: [QUERY_KEYS.ENHANCED_SCHEDULES],
  });
};

export const useCreateMonthlyScheduleForGrade = () => {
  return useApiMutation({
    mutationFn: ({ academicYearId, gradeId }) =>
      enhancedFeesApi.schedules.createMonthlyForGrade(academicYearId, gradeId),
    invalidateQueries: [QUERY_KEYS.ENHANCED_SCHEDULES],
  });
};

export const useGetSchedulesByGrade = (
  academicYearId,
  gradeId,
  enabled = true,
) => {
  return useApiQuery(
    [QUERY_KEYS.ENHANCED_SCHEDULES, academicYearId, gradeId],
    null,
    {
      queryFn: () =>
        enhancedFeesApi.schedules.getByGrade(academicYearId, gradeId),
      enabled: enabled && !!academicYearId && !!gradeId,
    },
  );
};

// Grade Fee Structure Hooks
export const useCreateGradeFeeStructure = () => {
  return useApiMutation({
    mutationFn: ({ data }) => enhancedFeesApi.gradeFees.create(data),
    invalidateQueries: [
      QUERY_KEYS.ENHANCED_GRADE_FEES,
      QUERY_KEYS.ENHANCED_SCHEDULES,
    ],
  });
};

export const useGetGradeFeeStructure = (academicYearId, gradeId) => {
  return useApiQuery(
    [QUERY_KEYS.ENHANCED_GRADE_FEES, academicYearId, gradeId],
    null,
    {
      queryFn: () => enhancedFeesApi.gradeFees.get(academicYearId, gradeId),
      enabled: !!academicYearId && !!gradeId,
    },
  );
};

export const useDeleteGradeFeeStructure = () => {
  return useApiMutation({
    mutationFn: ({ academicYearId, gradeId }) =>
      enhancedFeesApi.gradeFees.delete(academicYearId, gradeId),
    invalidateQueries: [
      QUERY_KEYS.ENHANCED_GRADE_FEES,
      QUERY_KEYS.ENHANCED_SCHEDULES,
    ],
  });
};

// Student Fee Assignment Hooks
export const useEnhancedStudentAssignment = (studentId, academicYearId) => {
  return useApiQuery(
    [QUERY_KEYS.ENHANCED_STUDENT_ASSIGNMENT, studentId, academicYearId],
    null,
    {
      queryFn: () =>
        enhancedFeesApi.studentFees.getAssignment(studentId, academicYearId),
      enabled: !!studentId && !!academicYearId,
    },
  );
};

export const useEnhancedStudentSummary = (studentId, academicYearId) => {
  return useApiQuery(
    [QUERY_KEYS.ENHANCED_STUDENT_SUMMARY, studentId, academicYearId],
    null,
    {
      queryFn: () =>
        enhancedFeesApi.studentFees.getSummary(studentId, academicYearId),
      enabled: !!studentId && !!academicYearId,
    },
  );
};

export const useEnhancedStudentInstallments = (studentId, academicYearId) => {
  return useApiQuery(
    [QUERY_KEYS.ENHANCED_STUDENT_INSTALLMENTS, studentId, academicYearId],
    null,
    {
      queryFn: () =>
        enhancedFeesApi.studentFees.getInstallments(studentId, academicYearId),
      enabled: !!studentId && !!academicYearId,
    },
  );
};

export const useAssignFeeSchedule = () => {
  return useApiMutation({
    mutationFn: ({ data }) => enhancedFeesApi.studentFees.assign(data),
    invalidateQueries: [
      QUERY_KEYS.ENHANCED_STUDENT_ASSIGNMENT,
      QUERY_KEYS.ENHANCED_STUDENT_SUMMARY,
      QUERY_KEYS.ENHANCED_STUDENT_INSTALLMENTS,
    ],
  });
};

export const useUpdateFeeAssignment = () => {
  return useApiMutation({
    mutationFn: ({ assignmentId, data }) =>
      enhancedFeesApi.studentFees.update(assignmentId, data),
    invalidateQueries: [
      QUERY_KEYS.STUDENTS_WITH_FEES,
      QUERY_KEYS.ENHANCED_STUDENT_ASSIGNMENT,
      QUERY_KEYS.ENHANCED_STUDENT_SUMMARY,
      QUERY_KEYS.ENHANCED_STUDENT_INSTALLMENTS,
    ],
  });
};

export const useStudentPaymentHistory = (studentId) => {
  return useApiQuery(["studentPaymentHistory", studentId], null, {
    queryFn: () => enhancedFeesApi.payments.getHistory(studentId),
    enabled: Boolean(studentId),
    staleTime: 0,
  });
};

// Payment Hooks
export const useRecordEnhancedPayment = () => {
  return useApiMutation({
    mutationFn: ({ data }) => enhancedFeesApi.payments.record(data),
    invalidateQueries: [
      QUERY_KEYS.STUDENTS_WITH_FEES,
      QUERY_KEYS.ENHANCED_STUDENT_SUMMARY,
      QUERY_KEYS.ENHANCED_STUDENT_INSTALLMENTS,
      QUERY_KEYS.ENHANCED_COLLECTION_REPORT,
      QUERY_KEYS.ENHANCED_DASHBOARD_STATS,
      QUERY_KEYS.ENHANCED_OVERDUE_REPORT,
      "studentPaymentHistory",
    ],
  });
};

// Reports & Analytics Hooks
export const useEnhancedOverdueReport = (academicYearId, params = {}) => {
  return useApiQuery(
    [QUERY_KEYS.ENHANCED_OVERDUE_REPORT, academicYearId, params],
    null,
    {
      queryFn: () => enhancedFeesApi.reports.getOverdue(academicYearId, params),
      enabled: !!academicYearId,
    },
  );
};

export const useEnhancedCollectionReport = (
  startDate,
  endDate,
  params = {},
) => {
  return useApiQuery(
    [QUERY_KEYS.ENHANCED_COLLECTION_REPORT, startDate, endDate, params],
    null,
    {
      queryFn: () =>
        enhancedFeesApi.reports.getCollection(startDate, endDate, params),
      enabled: !!startDate && !!endDate,
    },
  );
};

export const useEnhancedDashboardStats = (academicYearId) => {
  return useApiQuery(
    [QUERY_KEYS.ENHANCED_DASHBOARD_STATS, academicYearId],
    null,
    {
      queryFn: () => enhancedFeesApi.reports.getDashboardStats(academicYearId),
    },
  );
};

// Constants Hooks
export const usePaymentMethods = () => {
  return useApiQuery(QUERY_KEYS.PAYMENT_METHODS, null, {
    queryFn: () => enhancedFeesApi.constants.getPaymentMethods(),
  });
};

export const useScheduleTypes = () => {
  return useApiQuery(QUERY_KEYS.SCHEDULE_TYPES, null, {
    queryFn: () => enhancedFeesApi.constants.getScheduleTypes(),
  });
};

export const useInstallmentStatuses = () => {
  return useApiQuery(QUERY_KEYS.INSTALLMENT_STATUSES, null, {
    queryFn: () => enhancedFeesApi.constants.getInstallmentStatuses(),
  });
};

// ============= INDIVIDUAL STUDENT FEES HOOKS =============

// Get all individual fees (with optional filters)
export const useIndividualFees = (params = {}) => {
  return useApiQuery([QUERY_KEYS.INDIVIDUAL_FEES, params], null, {
    queryFn: () => enhancedFeesApi.individualFees.getAll(params),
  });
};

// Get individual fees for a specific student
export const useStudentIndividualFees = (studentId, params = {}) => {
  return useApiQuery(
    [QUERY_KEYS.STUDENT_INDIVIDUAL_FEES, studentId, params],
    null,
    {
      queryFn: () =>
        enhancedFeesApi.individualFees.getByStudent(studentId, params),
      enabled: !!studentId,
    },
  );
};

// Create individual fee
export const useCreateIndividualFee = () => {
  return useApiMutation({
    mutationFn: (data) => enhancedFeesApi.individualFees.create(data),
    invalidateQueries: [
      QUERY_KEYS.INDIVIDUAL_FEES,
      QUERY_KEYS.STUDENT_INDIVIDUAL_FEES,
    ],
  });
};

// Update individual fee
export const useUpdateIndividualFee = () => {
  return useApiMutation({
    mutationFn: ({ individualFeeId, data }) =>
      enhancedFeesApi.individualFees.update(individualFeeId, data),
    invalidateQueries: [
      QUERY_KEYS.INDIVIDUAL_FEES,
      QUERY_KEYS.STUDENT_INDIVIDUAL_FEES,
    ],
  });
};

// Delete individual fee
export const useDeleteIndividualFee = () => {
  return useApiMutation({
    mutationFn: (individualFeeId) =>
      enhancedFeesApi.individualFees.delete(individualFeeId),
    invalidateQueries: [
      QUERY_KEYS.INDIVIDUAL_FEES,
      QUERY_KEYS.STUDENT_INDIVIDUAL_FEES,
    ],
  });
};
