import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icons } from "../../utils/icons";
import { useStudents, useDeleteStudent } from "../../hooks/useApiHooks";

const Students = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Use TanStack Query hooks instead of useFetch
  const {
    data: studentsResponse = [],
    isLoading: loading,
    error,
  } = useStudents();
  const deleteStudent = useDeleteStudent();

  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Safely extract students data from response
  const students = Array.isArray(studentsResponse?.data?.students)
    ? studentsResponse.data.students
    : Array.isArray(studentsResponse?.students)
    ? studentsResponse.students
    : Array.isArray(studentsResponse)
    ? studentsResponse
    : [];

  // Handle success message from AddStudent page
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Handle student deletion using TanStack Query mutation
  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent.mutateAsync({ id: studentId });
        setSuccessMessage("Student deleted successfully");
        setTimeout(() => setSuccessMessage(""), 5000);
      } catch (err) {
        console.error("Error deleting student:", err);
        alert("Failed to delete student. Please try again.");
      }
    }
  };

  const grades = ["All", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const statuses = ["All", "Active", "Inactive", "Graduated"];

  const filteredStudents = Array.isArray(students)
    ? students.filter((student) => {
        const matchesSearch =
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.rollNumber || "").includes(searchTerm) ||
          (student.classId || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesGrade =
          filterGrade === "All" || student.grade === filterGrade;
        const matchesStatus =
          filterStatus === "All" || student.status === filterStatus;

        return matchesSearch && matchesGrade && matchesStatus;
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
        return "bg-gray-100 text-gray-800";
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
        return "bg-gray-100 text-gray-800";
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
            <h3 className="text-lg font-semibold text-gray-900">
              {student.name}
            </h3>
            <p className="text-sm text-gray-600">
              Roll: {student.rollNumber || "Not assigned"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              student.status
            )}`}
          >
            {student.status}
          </span>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              // Add more options logic here
            }}
          >
            <Icons.MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Icons.GraduationCap className="w-4 h-4 mr-2" />
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(
              student.grade
            )}`}
          >
            {student.grade} - {student.classId || "N/A"}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Icons.Users className="w-4 h-4 mr-2" />
          Father's Name:{" "}
          {student.parentDetails?.father?.name || student.fatherName || "N/A"}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Icons.Phone className="w-4 h-4 mr-2" />
          Father's Mobile: {student.parentDetails?.father?.phone || "N/A"}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Icons.Calendar className="w-4 h-4 mr-2" />
          Admitted {new Date(student.admissionDate).toLocaleDateString()}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">
                {student.grades?.length > 0 ? "A+" : "N/A"}
              </p>
              <p className="text-xs text-gray-600">Grade</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">
                {student.attendance?.length > 0 ? "95" : "0"}%
              </p>
              <p className="text-xs text-gray-600">Attendance</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                // Add edit functionality here
                console.log("Edit student:", student.id);
              }}
            >
              <Icons.Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">
            Manage student information and performance
          </p>
        </div>
        <button
          onClick={() => navigate("/students/add")}
          className="btn-primary flex items-center"
        >
          <Icons.Plus className="w-4 h-4 mr-2" />
          Add Student
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <StatsCard
          title="Average Attendance"
          value={
            Array.isArray(students) && students.length > 0
              ? `${Math.round(
                  students.reduce(
                    (sum, s) => sum + (s.attendance?.length > 0 ? 95 : 0),
                    0
                  ) / students.length
                )}%`
              : "0%"
          }
          icon={Icons.Target}
          color="bg-orange-500"
        />
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icons.Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search students..."
              />
            </div>
          </div>

          {/* Grade Filter */}
          <div className="flex items-center space-x-2">
            <Icons.Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Loading students...
          </h3>
          <p className="text-gray-600">
            Please wait while we fetch the student data
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Icons.GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {Array.isArray(students) && students.length === 0
              ? "No students found in the system"
              : "No students match your search criteria"}
          </h3>
          <p className="text-gray-600">
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
