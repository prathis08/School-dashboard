import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Icons from "../../utils/icons";
import { useSubject, useDeleteSubject } from "../../hooks/useApiHooks";
import { useToast } from "../../context/UIProvider";

const SubjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const deleteSubject = useDeleteSubject();
  const toast = useToast();

  // Get subject from location state if available (when navigating from subjects list)
  const subjectFromState = location.state?.subject;

  // Only fetch from API if we don't have subject data from navigation state
  const {
    data: subjectData,
    isLoading: loading,
    error,
  } = useSubject(id, {
    enabled: !subjectFromState, // Only fetch if we don't have data from state
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Use subject from state first, otherwise use fetched data
  const subject = subjectFromState || subjectData?.data || subjectData;

  if (!subjectFromState && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if ((!subjectFromState && error) || !subject) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-4">
          <Icons.AlertTriangle className="w-8 h-8 mx-auto" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {error ? "Error loading subject details" : "Subject not found"}
        </p>
        <button
          onClick={() => navigate("/subjects")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Subjects
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteSubject.mutateAsync({
        id: subject.subjectId || subject.subject_id,
      });
      navigate("/subjects");
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Error deleting subject. Please try again.");
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Icons.Info className="w-5 h-5" />
            <span className="ml-2">Subject Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject Name
              </label>
              <p className="text-gray-900 dark:text-white">
                {subject.subjectName || subject.subject_name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject Code
              </label>
              <p className="text-gray-900 dark:text-white">
                {subject.subjectCode || subject.subject_code}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <p className="text-gray-900 dark:text-white">
                {subject.department}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Credits
              </label>
              <p className="text-gray-900 dark:text-white">{subject.credits}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  subject.isActive || subject.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {subject.isActive || subject.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Created
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(subject.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {subject.description && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <p className="text-gray-900 dark:text-white">
                {subject.description}
              </p>
            </div>
          )}
          {subject.syllabus && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Syllabus
              </label>
              <p className="text-gray-900 dark:text-white">
                {subject.syllabus}
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Icons.Users className="w-5 h-5" />
            <span className="ml-2">Assigned Teachers</span>
          </h3>
          {subject.teachers && subject.teachers.length > 0 ? (
            <div className="space-y-3">
              {subject.teachers.map((teacher, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 border rounded-lg"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">
                      {(
                        teacher.user?.firstName || teacher.user?.first_name
                      )?.charAt(0)}
                      {(
                        teacher.user?.lastName || teacher.user?.last_name
                      )?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {teacher.user?.firstName || teacher.user?.first_name}{" "}
                      {teacher.user?.lastName || teacher.user?.last_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {teacher.user?.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No teachers assigned
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderTeachers = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <Icons.Users className="w-5 h-5" />
          <span className="ml-2">Assigned Teachers</span>
        </h3>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
          {subject.teachers?.length || 0} Teachers
        </span>
      </div>

      {subject.teachers && subject.teachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subject.teachers.map((teacher, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">
                    {(
                      teacher.user?.firstName || teacher.user?.first_name
                    )?.charAt(0)}
                    {(
                      teacher.user?.lastName || teacher.user?.last_name
                    )?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {teacher.user?.firstName || teacher.user?.first_name}{" "}
                    {teacher.user?.lastName || teacher.user?.last_name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Teacher ID: {teacher.teacherId || teacher.teacher_id}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Email:</span>{" "}
                  {teacher.user?.email}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Assigned:</span>{" "}
                  {new Date(
                    teacher.teacher_subject?.createdAt,
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-5xl mb-4">
            <Icons.Users className="w-20 h-20" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            No teachers assigned to this subject
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/subjects")}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Icons.ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {subject.subjectName || subject.subject_name}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subject.isActive || subject.is_active
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {subject.isActive || subject.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {subject.subjectCode || subject.subject_code} •{" "}
              {subject.department}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/subjects/${id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Icons.Edit className="w-4 h-4" />
            <span className="ml-2">Edit</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            <Icons.Trash2 className="w-4 h-4" />
            <span className="ml-2">Delete</span>
          </button>
        </div>
      </div>

      {/* Subject Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Icons.BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Credits
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {subject.credits}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Icons.Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Teachers
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {subject.teachers?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Icons.Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Department
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {subject.department}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div
              className={`p-3 rounded-lg ${
                subject.isActive || subject.is_active
                  ? "bg-green-100"
                  : "bg-red-100"
              }`}
            >
              {subject.isActive || subject.is_active ? (
                <Icons.Check className="w-6 h-6 text-green-600" />
              ) : (
                <Icons.X className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Status
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {subject.isActive || subject.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:border-gray-600"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("teachers")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "teachers"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:border-gray-600"
              }`}
            >
              Teachers ({subject.teachers?.length || 0})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && renderOverview()}
        {activeTab === "teachers" && renderTeachers()}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-full mr-4">
                <Icons.AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Subject
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{subject.subject_name}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteSubject.isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteSubject.isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectDetail;
