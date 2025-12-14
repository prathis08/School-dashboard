import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../utils/icons";
import {
  useSubjects,
  useTeachers,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from "../../hooks/useApiHooks";

const Subjects = () => {
  const navigate = useNavigate();

  // Use TanStack Query hooks
  const {
    data: subjectsData = [],
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useSubjects();
  const { data: teachersResponse = [], isLoading: teachersLoading } =
    useTeachers();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const loading = subjectsLoading || teachersLoading;
  const error = subjectsError;

  // Safely extract data from responses - updated for new API structure
  const subjects = Array.isArray(subjectsData?.data)
    ? subjectsData.data
    : Array.isArray(subjectsData)
    ? subjectsData
    : [];

  const availableTeachers = Array.isArray(teachersResponse)
    ? teachersResponse
    : Array.isArray(teachersResponse?.data)
    ? teachersResponse.data
    : [];

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const departments = [
    "All",
    "Mathematics",
    "Science",
    "English",
    "History",
    "Art",
    "Music",
    "Physical Education",
  ];

  const [formData, setFormData] = useState({
    subject_name: "",
    subject_code: "",
    department: "",
    description: "",
    credits: 3,
    syllabus: "",
    teachers: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTeacherSelect = (teacherId) => {
    const teacher = availableTeachers.find((t) => t.id === parseInt(teacherId));
    if (teacher && !formData.teachers.find((t) => t.id === teacher.id)) {
      setFormData((prev) => ({
        ...prev,
        teachers: [...prev.teachers, teacher],
      }));
    }
  };

  const removeTeacher = (teacherId) => {
    setFormData((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t.id !== teacherId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that at least one teacher is selected
    if (formData.teachers.length === 0) {
      alert("Please select at least one teacher for this subject.");
      return;
    }

    try {
      if (editingSubject) {
        await updateSubject.mutateAsync({
          id: editingSubject.id,
          data: formData,
        });
      } else {
        // Add new subject
        await createSubject.mutateAsync({
          data: {
            ...formData,
            students: 0, // New subject starts with 0 students
          },
        });
      }
      setIsModalOpen(false);
      setEditingSubject(null);
      setFormData({
        name: "",
        code: "",
        grade: "",
        teachers: [],
        description: "",
      });
    } catch (error) {
      console.error("Error saving subject:", error);
      alert("Failed to save subject. Please try again.");
    }
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      (subject.subject_name &&
        subject.subject_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (subject.subject_code &&
        subject.subject_code
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (subject.teachers &&
        subject.teachers.some(
          (teacher) =>
            teacher?.user?.firstName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            teacher?.user?.lastName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            teacher?.user?.email
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        ));
    const matchesDepartment =
      filterDepartment === "All" || subject.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getSubjectColor = (name) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
    ];
    return colors[(name || "").length % colors.length];
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      subject_name: subject.subject_name || "",
      subject_code: subject.subject_code || "",
      department: subject.department || "",
      description: subject.description || "",
      credits: subject.credits || 3,
      syllabus: subject.syllabus || "",
      teachers: subject.teachers || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (subjectId) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await deleteSubject.mutateAsync({ id: subjectId });
      } catch (error) {
        console.error("Error deleting subject:", error);
        alert("Error deleting subject. Please try again.");
      }
    }
  };

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({
      subject_name: "",
      subject_code: "",
      department: "",
      description: "",
      credits: 3,
      syllabus: "",
      teachers: [],
    });
    setIsModalOpen(true);
  };

  // SubjectCard Component
  const SubjectCard = ({ subject }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${getSubjectColor(
                subject.subject_name
              )}`}
            >
              {subject.subject_code}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                subject.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {subject.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <h3
            className="text-lg font-semibold text-gray-900 mb-1 cursor-pointer hover:text-blue-600"
            onClick={() => navigate(`/subjects/${subject.subject_id}`)}
          >
            {subject.subject_name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{subject.department}</p>
          {subject.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {subject.description}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(subject)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            <Icons.Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(subject.subject_id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <Icons.Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Icons.Users className="w-4 h-4 text-gray-500" />
            <span className="ml-1">
              Teachers: {subject.teachers ? subject.teachers.length : 0}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Icons.BookOpen className="w-4 h-4 text-gray-500" />
            <span className="ml-1">Credits: {subject.credits}</span>
          </div>
        </div>

        {subject.teachers && subject.teachers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {subject.teachers.slice(0, 2).map((teacher, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {teacher.user.firstName} {teacher.user.lastName}
              </span>
            ))}
            {subject.teachers.length > 2 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{subject.teachers.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Created: {new Date(subject.createdAt).toLocaleDateString()}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/subjects/${subject.subject_id}`)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const Modal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {editingSubject ? "Edit Subject" : "Add New Subject"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Name
            </label>
            <input
              type="text"
              name="subject_name"
              value={formData.subject_name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter subject name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Code
            </label>
            <input
              type="text"
              name="subject_code"
              value={formData.subject_code}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter subject code"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Department</option>
              {departments.slice(1).map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credits
            </label>
            <input
              type="number"
              name="credits"
              value={formData.credits}
              onChange={handleInputChange}
              min="1"
              max="6"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Teachers
            </label>

            <select
              onChange={(e) => handleTeacherSelect(e.target.value)}
              value=""
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a teacher to add</option>
              {availableTeachers
                .filter(
                  (teacher) =>
                    !formData.teachers.find(
                      (t) => t.teacherId === teacher.teacherId
                    )
                )
                .map((teacher) => (
                  <option key={teacher.teacherId} value={teacher.teacherId}>
                    {teacher.personalInfo?.firstName}{" "}
                    {teacher.personalInfo?.lastName} -{" "}
                    {teacher.personalInfo?.email}
                  </option>
                ))}
            </select>
            {formData.teachers.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.teachers.map((teacher) => (
                  <div
                    key={teacher.teacherId}
                    className="flex items-center justify-between bg-blue-50 p-2 rounded"
                  >
                    <span className="text-sm">
                      {teacher.personalInfo?.firstName}{" "}
                      {teacher.personalInfo?.lastName}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTeacher(teacher.teacherId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Icons.X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter subject description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Syllabus
            </label>
            <textarea
              name="syllabus"
              value={formData.syllabus}
              onChange={handleInputChange}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter syllabus details"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSubject.isLoading || updateSubject.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createSubject.isLoading || updateSubject.isLoading
                ? "Saving..."
                : editingSubject
                ? "Update Subject"
                : "Create Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div className={`p-3 ${color} rounded-lg text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-4">
          <Icons.AlertTriangle className="w-8 h-8" />
        </div>
        <p className="text-gray-600">Error loading subjects data</p>
      </div>
    );
  }

  // Get unique departments from subjects for stats
  const uniqueDepartments = new Set(
    subjects.map((subject) => subject.department).filter(Boolean)
  ).size;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600">
            Manage school subjects and assignments
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Icons.Plus className="w-4 h-4" />
          <span className="ml-2">Add Subject</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Subjects"
          value={subjects.length}
          icon={Icons.BookOpen}
          color="bg-blue-500"
        />
        <StatsCard
          title="Active Subjects"
          value={subjects.filter((s) => s.is_active).length}
          icon={Icons.Check}
          color="bg-green-500"
        />
        <StatsCard
          title="Total Teachers"
          value={subjects.reduce(
            (sum, subject) => sum + (subject.teachers?.length || 0),
            0
          )}
          icon={Icons.Users}
          color="bg-orange-500"
        />
        <StatsCard
          title="Departments"
          value={uniqueDepartments}
          icon={Icons.Building2}
          color="bg-purple-500"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4">
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
                placeholder="Search subjects, codes, or teachers..."
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Icons.Filter className="w-4 h-4 mr-2" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <SubjectCard key={subject.subject_id} subject={subject} />
        ))}
      </div>

      {/* Empty State */}
      {filteredSubjects.length === 0 && (
        <div className="text-center py-12">
          {Icons.BookOpen}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No subjects found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && <Modal />}
    </div>
  );
};

export default Subjects;
