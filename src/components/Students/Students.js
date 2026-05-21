import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Icons from "../../utils/icons";
import {
  useStudents,
  useDeleteStudent,
  useGradesOptions,
  useStudentStatusOptions,
} from "../../hooks/useApiHooks";
import { useToast, useConfirm } from "../../context/UIProvider";
import ExportStudentsModal from "./ExportStudentsModal";

const Students = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const confirm = useConfirm();

  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState(
    location.state?.filterGrade || "All",
  );
  const [filterStatus, setFilterStatus] = useState("All");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [shouldLoadData, setShouldLoadData] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const deleteStudent = useDeleteStudent();

  // Fetch grades and statuses from backend
  const { data: gradesResponse = [] } = useGradesOptions();
  const { data: statusesResponse = [] } = useStudentStatusOptions();

  // Build grade name -> gradeId map from the grades-options API
  const gradesOptionsList = Array.isArray(gradesResponse)
    ? gradesResponse
    : Array.isArray(gradesResponse?.data)
      ? gradesResponse.data
      : [];

  const gradeNameToId = gradesOptionsList.reduce((acc, item) => {
    if (item && typeof item === "object" && item.grade && item.gradeId) {
      acc[item.grade] = item.gradeId;
    }
    return acc;
  }, {});

  const selectedGradeId =
    filterGrade === "All" ? undefined : gradeNameToId[filterGrade];

  // Use TanStack Query hooks - only load when user clicks search
  const {
    data: studentsResponse = [],
    isLoading: loading,
    error,
  } = useStudents({ enabled: shouldLoadData, gradeId: selectedGradeId });

  // Safely extract students data from response
  const students = Array.isArray(studentsResponse?.data?.students)
    ? studentsResponse.data.students
    : Array.isArray(studentsResponse?.students)
      ? studentsResponse.students
      : Array.isArray(studentsResponse)
        ? studentsResponse
        : [];

  // Handle success message and filters from location state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }

    // Apply class filter if provided
    if (location.state?.filterClass) {
      setSearchTerm(location.state.filterClass);
    }

    // Apply grade filter if provided
    if (location.state?.filterGrade) {
      setFilterGrade(location.state.filterGrade);
    }
  }, [location.state]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest(".relative")) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  // Handle student deletion using TanStack Query mutation
  const handleDeleteStudent = async (studentId) => {
    const ok = await confirm({
      title: "Delete student?",
      message: "Are you sure you want to delete this student?",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await deleteStudent.mutateAsync({ id: studentId });
      toast.success("Student deleted successfully");
    } catch (err) {
      console.error("Error deleting student:", err);
      toast.error("Failed to delete student. Please try again.");
    }
  };

  const handleLoadStudents = () => {
    setShouldLoadData(true);
  };

  const gradeStrings = gradesOptionsList.map((g) =>
    typeof g === "object" && g.grade ? g.grade : g,
  );

  const grades =
    gradeStrings.length > 0
      ? ["All", ...gradeStrings]
      : ["All", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

  // Extract statuses from API response
  const apiStatuses = Array.isArray(statusesResponse)
    ? statusesResponse
    : Array.isArray(statusesResponse?.data)
      ? statusesResponse.data
      : [];

  const statuses =
    apiStatuses.length > 0
      ? ["All", ...apiStatuses]
      : ["All", "Active", "Inactive", "Graduated"];

  const filteredStudents = Array.isArray(students)
    ? students.filter((student) => {
        const matchesSearch =
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.rollNumber || "").includes(searchTerm) ||
          (student.class?.className || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus =
          filterStatus === "All" || student.status === filterStatus;

        return matchesSearch && matchesStatus;
      })
    : [];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      case "Graduated":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800 dark:text-gray-300";
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "Grade 9":
        return "bg-purple-100 text-purple-800";
      case "Grade 10":
        return "bg-blue-100 text-blue-800";
      case "Grade 11":
        return "bg-orange-100 text-orange-800";
      case "Grade 12":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800 dark:text-gray-300";
    }
  };

  const getGPAColor = (gpa) => {
    if (gpa >= 3.7) return "text-green-600";
    if (gpa >= 3.0) return "text-yellow-600";
    return "text-red-600";
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const StudentCard = ({ student }) => (
    <div
      className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => navigate(`/students/${student.studentId}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {getInitials(student.name)}
            </span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {student.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Roll: {student.rollNumber || "Not assigned"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              student.status,
            )}`}
          >
            {student.status}
          </span>
          <div className="relative">
            <button
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(
                  openMenuId === student.studentId ? null : student.studentId,
                );
              }}
            >
              <Icons.MoreHorizontal className="w-5 h-5" />
            </button>
            {openMenuId === student.studentId && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(null);
                      navigate(`/students/edit/${student.studentId}`);
                    }}
                  >
                    <Icons.Edit className="w-4 h-4 mr-2" />
                    Edit Student
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(null);
                      handleDeleteStudent(student.studentId);
                    }}
                  >
                    <Icons.Trash2 className="w-4 h-4 mr-2" />
                    Delete Student
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
          <Icons.GraduationCap className="w-4 h-4 mr-2" />
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(
              student.grade || student.class?.grade,
            )}`}
          >
            {student.class?.className || "N/A"}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
          <Icons.Users className="w-4 h-4 mr-2" />
          Father's Name:{" "}
          {student.parentDetails?.father?.name || student.fatherName || "N/A"}
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
          <Icons.Phone className="w-4 h-4 mr-2" />
          Father's Mobile: {student.parentDetails?.father?.phone || "N/A"}
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
          <Icons.Calendar className="w-4 h-4 mr-2" />
          Admitted {new Date(student.admissionDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );

  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>Error loading students: {error.message}</span>
          <button
            onClick={() => window.location.reload()}
            className="text-red-700 hover:text-red-900 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-green-700 hover:text-green-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Students
          </h1>
          <p className="text-gray-600 mt-1">
            Manage student information and performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Icons.Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
          <button
            onClick={() => navigate("/students/add")}
            className="btn-primary flex items-center"
          >
            <Icons.Plus className="w-4 h-4 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      <ExportStudentsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Stats Cards - Only show when data is loaded */}
      {shouldLoadData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard
            title="Total Students"
            value={Array.isArray(students) ? students.length : 0}
            icon={Icons.Users}
            color="bg-blue-500"
          />
          <StatsCard
            title="Active Students"
            value={
              Array.isArray(students)
                ? students.filter((s) => s.status === "Active").length
                : 0
            }
            icon={Icons.GraduationCap}
            color="bg-green-500"
          />
        </div>
      )}

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icons.Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Search students..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLoadStudents();
                    }
                  }}
                />
              </div>
            </div>

            {/* Grade Filter */}
            <div className="flex items-center space-x-2">
              <Icons.Filter className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleLoadStudents}
              className="btn-primary flex items-center justify-center px-6"
            >
              <Icons.Search className="w-4 h-4 mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      {!shouldLoadData ? (
        <div className="card text-center py-12">
          <Icons.Users className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Ready to search students
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Apply your desired filters above and click the Search button to load
            student data.
          </p>
          <button
            onClick={handleLoadStudents}
            className="btn-primary inline-flex items-center"
          >
            <Icons.Search className="w-4 h-4 mr-2" />
            Load All Students
          </button>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Loading students...
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we fetch the student data
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <StudentCard key={student.studentId} student={student} />
          ))}
        </div>
      )}

      {/* Empty State - Only show when data has been loaded */}
      {shouldLoadData && !loading && filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Icons.GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {Array.isArray(students) && students.length === 0
              ? "No students found in the system"
              : "No students match your search criteria"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {Array.isArray(students) && students.length === 0
              ? "Add students to get started or check if the API is working properly"
              : "Try adjusting your search or filter criteria"}
          </p>
          {Array.isArray(students) && students.length === 0 && (
            <button
              onClick={() => navigate("/students/add")}
              className="mt-4 btn-primary inline-flex items-center"
            >
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add First Student
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Students;
