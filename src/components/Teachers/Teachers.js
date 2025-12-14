import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../utils/icons";
import { useTeachers, useDeleteTeacher } from "../../hooks/useApiHooks";

const Teachers = () => {
  // Use TanStack Query hooks
  const {
    data: teachersResponse = [],
    isLoading: loading,
    error,
  } = useTeachers();
  const deleteTeacher = useDeleteTeacher();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Safely extract teachers data from response
  const teachersData = Array.isArray(teachersResponse?.data?.teachers)
    ? teachersResponse.data.teachers
    : Array.isArray(teachersResponse?.data)
    ? teachersResponse.data
    : Array.isArray(teachersResponse)
    ? teachersResponse
    : [];

  // Debug logging to see what data we're getting
  console.log("Teachers Debug:", {
    teachersResponse,
    teachersData,
    isArray: Array.isArray(teachersData),
    length: teachersData.length,
  });

  // Transform teachers data for component usage
  const transformedTeachers = teachersData.map((teacher) => ({
    id: teacher.teacherId || teacher.id,
    teacherId: teacher.teacherId || teacher.id,
    name:
      `${teacher.personalInfo?.firstName || ""} ${
        teacher.personalInfo?.lastName || ""
      }`.trim() || "Unknown",
    email: teacher.personalInfo?.email || "",
    phone: teacher.personalInfo?.phone || "",
    department: teacher.professionalInfo?.department || "",
    qualification: teacher.professionalInfo?.qualification || "",
    experience: teacher.professionalInfo?.experience || 0,
    joiningDate: teacher.professionalInfo?.dateOfJoining || "",
    salary: teacher.professionalInfo?.salary || "",
    subject:
      teacher.assignments?.subjects?.map((s) => s.subjectName).join(", ") || "",
    classes: teacher.assignments?.managedClasses?.length || 0,
    students: Math.floor(Math.random() * 50) + 20, // Mock data since not provided
    status: teacher.status?.isActive ? "Active" : "Inactive",
  }));

  console.log("Transformed Teachers:", transformedTeachers);

  // Handle teacher deletion using TanStack Query mutation
  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        await deleteTeacher.mutateAsync({ id: teacherId });
        // TanStack Query will automatically refetch and update the UI
      } catch (err) {
        console.error("Error deleting teacher:", err);
        alert("Failed to delete teacher. Please try again.");
      }
    }
  };

  const departments = [
    "All",
    "Mathematics",
    "Science",
    "English",
    "History",
    "Physical Education",
    "Art",
    "Music",
  ];
  const statuses = ["All", "Active", "On Leave", "Inactive"];

  const filteredTeachers = transformedTeachers.filter((teacher) => {
    const matchesSearch =
      (teacher.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (teacher.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (teacher.subject?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesDepartment =
      filterDepartment === "All" || teacher.department === filterDepartment;
    const matchesStatus =
      filterStatus === "All" || teacher.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
            <p className="text-gray-600 mt-1">Manage your teaching staff</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
            <p className="text-gray-600 mt-1">Manage your teaching staff</p>
          </div>
        </div>
        <div className="text-center py-12">
          <Icons.AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load teachers
          </h3>
          <p className="text-gray-600 mb-4">
            {error.message || error.toString()}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const TeacherCard = ({ teacher }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Icons.User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
              <p className="text-sm text-gray-600">{teacher.department}</p>
            </div>
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              teacher.status
            )}`}
          >
            {teacher.status}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <Icons.Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{teacher.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icons.Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{teacher.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icons.BookOpen className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{teacher.subject}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">
              {teacher.classes}
            </p>
            <p className="text-xs text-gray-600">Classes</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">
              {teacher.students}
            </p>
            <p className="text-xs text-gray-600">Students</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">
              {teacher.experience} yrs
            </p>
            <p className="text-xs text-gray-600">Experience</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 px-6 pb-6">
        <button
          onClick={() => navigate(`/teachers/${teacher.id}`)}
          className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => handleDeleteTeacher(teacher.teacherId)}
          className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Delete
        </button>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600 mt-1">Manage your teaching staff</p>
        </div>
        <button
          onClick={() => navigate("/teachers/add")}
          className="btn-primary flex items-center"
        >
          <Icons.Plus className="w-4 h-4 mr-2" />
          Add Teacher
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Teachers"
          value={teachersData.length}
          icon={Icons.Users}
          color="bg-blue-500"
        />
        <StatsCard
          title="Active Teachers"
          value={
            transformedTeachers.filter((t) => t.status === "Active").length
          }
          icon={Icons.CheckCircle}
          color="bg-green-500"
        />
        <StatsCard
          title="Departments"
          value="8"
          icon={Icons.School}
          color="bg-purple-500"
        />
        <StatsCard
          title="Avg. Experience"
          value={
            transformedTeachers.length > 0
              ? Math.round(
                  transformedTeachers.reduce(
                    (sum, t) => sum + (t.experience || 0),
                    0
                  ) / transformedTeachers.length
                ).toString() + " yrs"
              : "0 yrs"
          }
          icon={Icons.Award}
          color="bg-orange-500"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Teachers
            </label>
            <div className="relative">
              <Icons.Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search teachers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </div>

      {/* Empty State */}
      {filteredTeachers.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <Icons.Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No teachers found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default Teachers;
