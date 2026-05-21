import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Plus,
  IndianRupee,
  GraduationCap,
  CheckCircle,
  Clock,
  Download,
  AlertCircle,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Calendar,
  CreditCard,
  FileText,
  History,
  Percent,
} from "lucide-react";
import {
  useFeeStructures,
  useFeeTypes,
  useGradesAndClasses,
  useStudentsWithFees,
} from "../../hooks/useApiHooks";
import ExportDuesModal from "./ExportDuesModal";
import EditDiscountModal from "./EditDiscountModal";

// Custom hook for debouncing values
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

const Fees = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Use TanStack Query hooks
  const {
    data: feesResponse = [],
    isLoading: loading,
    error,
  } = useFeeStructures();

  const {
    data: feeTypesData,
    isLoading: feeTypesLoading,
    error: feeTypesError,
  } = useFeeTypes();

  const {
    data: gradesAndClassesData,
    isLoading: gradesAndClassesLoading,
    error: gradesAndClassesError,
  } = useGradesAndClasses();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterGrade, setFilterGrade] = useState("All");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isDuesExportModalOpen, setIsDuesExportModalOpen] = useState(false);
  const [discountStudent, setDiscountStudent] = useState(null);

  // Handle prefilled student from navigation state
  useEffect(() => {
    if (location.state?.prefilledStudent) {
      const { name, studentId } = location.state.prefilledStudent;
      // Set the search term to the student's name
      setSearchTerm(name || studentId);
      // Clear the location state to prevent re-triggering on component updates
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Debounced values for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const debouncedFilterStatus = useDebounce(filterStatus, 300);
  const debouncedFilterGrade = useDebounce(filterGrade, 300);

  // Build filters object for API call
  const apiFilters = useMemo(
    () => ({
      gradeId: debouncedFilterGrade !== "All" ? debouncedFilterGrade : null,
      name: debouncedSearchTerm || null,
      status: debouncedFilterStatus !== "All" ? debouncedFilterStatus : null,
    }),
    [debouncedSearchTerm, debouncedFilterStatus, debouncedFilterGrade],
  );

  const hasActiveFilters =
    debouncedSearchTerm ||
    debouncedFilterStatus !== "All" ||
    debouncedFilterGrade !== "All";

  const hasInputFilters =
    searchTerm || filterStatus !== "All" || filterGrade !== "All";

  // Use students with fees API
  const {
    data: studentsWithFeesResponse,
    isLoading: studentsWithFeesLoading,
    error: studentsWithFeesError,
  } = useStudentsWithFees(apiFilters, hasActiveFilters);

  // Process student data
  const students = hasActiveFilters
    ? Array.isArray(studentsWithFeesResponse?.data)
      ? studentsWithFeesResponse.data
      : studentsWithFeesResponse?.data?.students || []
    : [];

  const getGradeForStudent = (student) => {
    let gradeName;
    gradesAndClassesData?.data?.grades?.forEach((grade) => {
      if (student.gradeId === grade.gradeId) {
        gradeName = grade.grade;
      }
    });
    return gradeName;
  };

  const getSectionForStudent = (student) => {
    let sectionName;
    gradesAndClassesData?.data?.grades?.forEach((grade) => {
      if (student.gradeId === grade.gradeId) {
        grade.classes?.forEach((cls) => {
          if (student.classId === cls.classId) {
            sectionName = cls.section;
          }
        });
      }
    });
    return sectionName;
  };

  // Process grades data
  const gradesData = gradesAndClassesData?.data?.grades || [];
  const classMapping = {};
  const allGrades = gradesData
    .map((grade) => {
      classMapping[grade.gradeId] = {
        displayName: grade.grade,
        gradeId: grade.gradeId,
        grade: grade.grade,
      };
      return grade.gradeId;
    })
    .filter(Boolean);

  const grades = ["All", ...new Set(allGrades)];
  const statuses = ["All", "Paid", "Partial", "Pending", "Overdue"];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusInfo = (student) => {
    const feeInfo = student.feeInfo || {};
    if (feeInfo.outstandingAmount <= 0 && feeInfo.totalFees > 0) {
      return {
        status: "Paid",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      };
    }
    if (feeInfo.totalPaid > 0) {
      return {
        status: "Partial",
        color: "bg-orange-100 text-orange-800",
        icon: Sparkles,
      };
    }
    return {
      status: "Pending",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    };
  };

  // Calculate statistics
  const statsData = students.map((s) => s.feeInfo || {});
  const totalFees = statsData.reduce((sum, f) => sum + (f.totalFees || 0), 0);
  const totalPaid = statsData.reduce((sum, f) => sum + (f.totalPaid || 0), 0);
  const totalOutstanding = statsData.reduce(
    (sum, f) => sum + (f.outstandingAmount || 0),
    0,
  );

  const isInitialLoading =
    loading || feeTypesLoading || gradesAndClassesLoading;
  const isFilterLoading = studentsWithFeesLoading && hasActiveFilters;

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 rounded-lg h-24"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fee Management
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage student fee payments
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsDuesExportModalOpen(true)}
            className="btn-secondary inline-flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Dues
          </button>
          <button
            onClick={() => navigate("/fees/create")}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Fee Structure
          </button>
        </div>
      </div>

      <ExportDuesModal
        isOpen={isDuesExportModalOpen}
        onClose={() => setIsDuesExportModalOpen(false)}
      />

      <EditDiscountModal
        isOpen={Boolean(discountStudent)}
        onClose={() => setDiscountStudent(null)}
        student={discountStudent}
      />

      {/* Statistics Cards */}
      {hasActiveFilters && students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalFees)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500">
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(totalOutstanding)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-500">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Search & Filter
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Student
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Grade Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade
            </label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            >
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade === "All"
                    ? "All Grades"
                    : classMapping[grade]?.displayName || grade}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All Statuses" : status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasInputFilters && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                "{searchTerm}"
                <button onClick={() => setSearchTerm("")} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterGrade !== "All" && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {classMapping[filterGrade]?.displayName}
                <button onClick={() => setFilterGrade("All")} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterStatus !== "All" && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {filterStatus}
                <button onClick={() => setFilterStatus("All")} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterGrade("All");
                setFilterStatus("All");
              }}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Student List */}
      {hasActiveFilters ? (
        <div className="space-y-3">
          {isFilterLoading && (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading students...</p>
            </div>
          )}

          {!isFilterLoading && students.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200">
              <IndianRupee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No students found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}

          {!isFilterLoading &&
            students.map((student) => {
              const statusInfo = getStatusInfo(student);
              const feeInfo = student.feeInfo || {};
              const isExpanded = selectedStudentId === student.studentId;
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={student.studentId}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 overflow-hidden"
                >
                  {/* Student Row - Clickable */}
                  <div
                    onClick={() =>
                      setSelectedStudentId(
                        isExpanded ? null : student.studentId,
                      )
                    }
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {student.firstName} {student.lastName}
                            </h3>
                            {student.staffRelation?.isStaffWard && (
                              <span
                                className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800"
                                title={`Ward of ${student.staffRelation.staffName || "staff"}${student.staffRelation.relation ? ` (${student.staffRelation.relation})` : ""}`}
                              >
                                Staff ward
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getGradeForStudent(student) || "N/A"} •
                            Section {getSectionForStudent(student) || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        {/* Total Fees */}
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Total Fees</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(feeInfo.totalFees)}
                          </p>
                        </div>

                        {/* Outstanding */}
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Outstanding</p>
                          <p
                            className={`text-lg font-bold ${feeInfo.outstandingAmount > 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            {formatCurrency(feeInfo.outstandingAmount)}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                        >
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusInfo.status}
                        </span>

                        {/* Expand/Collapse Icon */}
                        <div className="text-gray-400">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Section */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 dark:bg-gray-900 p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Fee Structure Breakdown */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Fee Structure Breakdown
                          </h4>
                          {feeInfo.feeStructure &&
                          feeInfo.feeStructure.length > 0 ? (
                            <div className="space-y-2">
                              {feeInfo.feeStructure.map((fee, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-lg"
                                >
                                  <div>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {fee.feeTypeName}
                                    </span>
                                    {fee.isMandatory && (
                                      <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                        Mandatory
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(fee.annualAmount)}
                                  </span>
                                </div>
                              ))}
                              <div className="flex justify-between items-center py-2 px-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200">
                                <span className="font-semibold text-blue-900 dark:text-blue-100">
                                  Total
                                </span>
                                <span className="font-bold text-blue-900 dark:text-blue-100">
                                  {formatCurrency(feeInfo.totalFees)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm italic">
                              No fee structure assigned yet.
                            </p>
                          )}
                        </div>

                        {/* Payment Summary */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Payment Summary
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-lg">
                              <span className="text-gray-600">Total Fees</span>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(feeInfo.totalFees)}
                              </span>
                            </div>
                            {feeInfo.discountAmount > 0 && (
                              <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg">
                                <span className="text-green-700">
                                  Discount ({feeInfo.discountPercentage}%)
                                </span>
                                <span className="font-semibold text-green-700">
                                  -{formatCurrency(feeInfo.discountAmount)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-lg">
                              <span className="text-gray-600">Paid Amount</span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(feeInfo.totalPaid)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded-lg border border-red-200">
                              <span className="text-red-700 font-medium">
                                Outstanding
                              </span>
                              <span className="font-bold text-red-700">
                                {formatCurrency(feeInfo.outstandingAmount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Installments */}
                        {feeInfo.installments &&
                          feeInfo.installments.length > 0 && (
                            <div className="lg:col-span-2">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Installment Schedule (
                                {feeInfo.scheduleType || "Custom"})
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                      <th className="text-left py-2 px-3 font-medium text-gray-700">
                                        Installment
                                      </th>
                                      <th className="text-left py-2 px-3 font-medium text-gray-700">
                                        Due Date
                                      </th>
                                      <th className="text-right py-2 px-3 font-medium text-gray-700">
                                        Amount Due
                                      </th>
                                      <th className="text-right py-2 px-3 font-medium text-gray-700">
                                        Paid
                                      </th>
                                      <th className="text-right py-2 px-3 font-medium text-gray-700">
                                        Balance
                                      </th>
                                      <th className="text-center py-2 px-3 font-medium text-gray-700">
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {feeInfo.installments.map((inst, index) => (
                                      <tr
                                        key={index}
                                        className="border-b border-gray-100 dark:border-gray-700"
                                      >
                                        <td className="py-2 px-3 text-gray-900 dark:text-white">
                                          {inst.name}
                                        </td>
                                        <td className="py-2 px-3 text-gray-600">
                                          {formatDate(inst.dueDate)}
                                        </td>
                                        <td className="py-2 px-3 text-right text-gray-900">
                                          {formatCurrency(inst.dueAmount)}
                                        </td>
                                        <td className="py-2 px-3 text-right text-green-600">
                                          {formatCurrency(inst.paidAmount)}
                                        </td>
                                        <td className="py-2 px-3 text-right text-red-600">
                                          {formatCurrency(inst.balanceAmount)}
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                          <span
                                            className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                                              inst.status === "PAID"
                                                ? "bg-green-100 text-green-800"
                                                : inst.status === "PARTIAL"
                                                  ? "bg-orange-100 text-orange-800"
                                                  : "bg-yellow-100 text-yellow-800"
                                            }`}
                                          >
                                            {inst.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                        {/* Individual/Additional Fees */}
                        {feeInfo.individualFees &&
                          feeInfo.individualFees.length > 0 && (
                            <div className="lg:col-span-2">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Additional/Individual Fees
                              </h4>
                              <div className="space-y-2">
                                {feeInfo.individualFees.map((fee, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center py-2 px-3 bg-yellow-50 rounded-lg border border-yellow-200"
                                  >
                                    <div>
                                      <span className="font-medium text-yellow-900">
                                        {fee.feeTypeName || fee.description}
                                      </span>
                                      {fee.reason && (
                                        <span className="text-xs text-yellow-700 ml-2">
                                          ({fee.reason})
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <span className="font-semibold text-yellow-900">
                                        {formatCurrency(fee.amount)}
                                      </span>
                                      <span
                                        className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                                          fee.status === "PAID"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        {fee.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Actions */}
                        <div className="lg:col-span-2 flex justify-end space-x-3 pt-4 border-t border-gray-200">
                          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Download className="w-4 h-4 inline mr-2" />
                            Download Receipt
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDiscountStudent(student);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            <Percent className="w-4 h-4 inline mr-2" />
                            Edit Discount
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/fees/history/${student.studentId}`);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            <History className="w-4 h-4 inline mr-2" />
                            Payment History
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/fees/payment/${student.studentId}`);
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                          >
                            <CreditCard className="w-4 h-4 inline mr-2" />
                            Record Payment
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200">
          <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Search for Students
          </h3>
          <p className="text-gray-600 mb-4">
            Use the search bar or filters above to find student fee records.
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>• Search by student name</p>
            <p>• Filter by grade</p>
            <p>• Filter by payment status</p>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {(error ||
        feeTypesError ||
        gradesAndClassesError ||
        studentsWithFeesError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading data
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {error?.message ||
                  feeTypesError?.message ||
                  gradesAndClassesError?.message ||
                  studentsWithFeesError?.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
