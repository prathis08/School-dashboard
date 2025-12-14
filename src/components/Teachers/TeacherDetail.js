import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icons } from "../../utils/icons";
import { useTeacher } from "../../hooks/useApiHooks";

const TeacherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Use TanStack Query hook
  const { data: teacherData, isLoading: loading, error } = useTeacher(id);

  // Debug logging
  console.log("TeacherDetail Debug:", {
    id,
    teacherData,
    loading,
    error,
  });

  const [activeTab, setActiveTab] = useState("overview");

  // Transform the teacher data if available
  const teacher = teacherData?.data
    ? {
        id: teacherData.data.teacherId || teacherData.data.id,
        teacherId: teacherData.data.teacherId || teacherData.data.id,
        name:
          `${teacherData.data.personalInfo?.firstName || ""} ${
            teacherData.data.personalInfo?.lastName || ""
          }`.trim() || "Unknown",
        email: teacherData.data.personalInfo?.email || "",
        phone: teacherData.data.personalInfo?.phone || "",
        department: teacherData.data.professionalInfo?.department || "",
        qualification: teacherData.data.professionalInfo?.qualification || "",
        experience: teacherData.data.professionalInfo?.experience || 0,
        joiningDate: teacherData.data.professionalInfo?.dateOfJoining || "",
        salary: teacherData.data.professionalInfo?.salary || "",
        subjects: teacherData.data.assignments?.subjects || [],
        managedClasses: teacherData.data.assignments?.managedClasses || [],
        status: teacherData.data.status?.isActive ? "Active" : "Inactive",
        address: "123 Main St, City, State 12345",
        emergencyContact: "+1 234 567 8999",
        bio: "Experienced educator passionate about teaching and student development.",
      }
    : null;

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

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Icons.User },
    { id: "subjects", label: "Subjects", icon: Icons.BookOpen },
    { id: "classes", label: "Classes", icon: Icons.Users },
    { id: "performance", label: "Performance", icon: Icons.TrendingUp },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="text-center py-12">
        <Icons.AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Teacher not found
        </h3>
        <p className="text-gray-600 mb-4">
          The teacher you're looking for doesn't exist or has been removed.
        </p>
        <button onClick={() => navigate("/teachers")} className="btn-primary">
          Back to Teachers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/teachers")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icons.ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{teacher.name}</h1>
            <p className="text-gray-600 mt-1">
              {teacher.department} Department
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center">
            <Icons.Mail className="w-4 h-4 mr-2" />
            Send Email
          </button>
          <button className="btn-primary flex items-center">
            <Icons.Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-medium">
              {getInitials(teacher.name)}
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {teacher.name}
                </h2>
                <p className="text-gray-600">{teacher.qualification}</p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                  teacher.status
                )}`}
              >
                {teacher.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center text-gray-600">
                <Icons.Mail className="w-5 h-5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{teacher.email}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <Icons.Phone className="w-5 h-5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{teacher.phone}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <Icons.Calendar className="w-5 h-5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">
                    {teacher.joiningDate
                      ? new Date(teacher.joiningDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <Icons.Award className="w-5 h-5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">{teacher.experience} years</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card text-center">
                <div className="p-6">
                  <Icons.BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {teacher.subjects.length}
                  </p>
                  <p className="text-sm text-gray-600">Subjects</p>
                </div>
              </div>
              <div className="card text-center">
                <div className="p-6">
                  <Icons.Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {teacher.managedClasses.length}
                  </p>
                  <p className="text-sm text-gray-600">Classes</p>
                </div>
              </div>
              <div className="card text-center">
                <div className="p-6">
                  <Icons.DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(teacher.salary)}
                  </p>
                  <p className="text-sm text-gray-600">Salary</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Biography
              </h3>
              <p className="text-gray-600">{teacher.bio}</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Department
                  </label>
                  <p className="text-gray-900">{teacher.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Qualification
                  </label>
                  <p className="text-gray-900">{teacher.qualification}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Address
                  </label>
                  <p className="text-gray-900">{teacher.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Emergency Contact
                  </label>
                  <p className="text-gray-900">{teacher.emergencyContact}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "subjects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teacher.subjects.map((subject, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {subject.subjectName}
                </h3>
                <span className="text-sm text-gray-500">
                  {subject.subjectCode}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {subject.department} Department
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Icons.Clock className="w-4 h-4 mr-2" />
                Active Course
              </div>
            </div>
          ))}
          {teacher.subjects.length === 0 && (
            <div className="col-span-full text-center py-8">
              <Icons.BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No subjects assigned</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "classes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teacher.managedClasses.map((classItem, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {classItem.className}
                </h3>
                <span className="text-sm text-gray-500">{classItem.room}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {classItem.grade} - Section {classItem.section}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Icons.MapPin className="w-4 h-4 mr-2" />
                {classItem.room}
              </div>
            </div>
          ))}
          {teacher.managedClasses.length === 0 && (
            <div className="col-span-full text-center py-8">
              <Icons.Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No classes assigned</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "performance" && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Performance Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icons.TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">95%</p>
              <p className="text-sm text-gray-600">Student Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icons.Award className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">4.8</p>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icons.Target className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">89%</p>
              <p className="text-sm text-gray-600">Goal Achievement</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icons.Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">98%</p>
              <p className="text-sm text-gray-600">Attendance</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDetail;
