import React, { useState, useCallback, useMemo } from "react";
import { Icons } from "../../utils/icons";
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
  useTeacherNames,
  useGradesOptions,
} from "../../hooks/useApiHooks";
import { stringify } from "postcss";
import DeleteConfirmationModal from "../Common/DeleteConfirmationModal";

// Modal component moved outside to prevent re-rendering
const Modal = ({
  isOpen,
  editingClass,
  formData,
  formErrors,
  grades,
  availableTeachers,
  onInputChange,
  onSubmit,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {editingClass ? "Edit Class" : "Add New Class"}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade
            </label>
            <select
              name="grade"
              value={formData.grade}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Grade</option>
              {grades.slice(1).map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              placeholder="e.g., 10-A, 9-B"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.name ? "border-red-300" : "border-gray-300"
              }`}
              required
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {!editingClass ? "Select grade first to auto-populate. " : ""}Only
              letters, numbers, and dash allowed.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Teacher
            </label>
            <select
              name="teacher"
              value={formData.teacher}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a teacher</option>
              {availableTeachers.map((teacher) => (
                <option key={teacher.teacherId} value={teacher.teacherId}>
                  {teacher.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Students (Optional)
            </label>
            <input
              type="number"
              name="maxStudents"
              value={formData.maxStudents}
              onChange={onInputChange}
              placeholder="e.g., 30"
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-gray-500 text-xs mt-1">
              Leave empty if no limit
            </p>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingClass ? "Update" : "Add"} Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Classes = () => {
  // Use TanStack Query hooks
  const {
    data: classesResponse = [],
    isLoading: loading,
    error,
  } = useClasses();
  const { data: teachersResponse = [] } = useTeacherNames();
  const { data: gradesResponse = [] } = useGradesOptions();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    classId: null,
    className: "",
  });

  // Safely extract data from responses
  const classes = Array.isArray(classesResponse)
    ? classesResponse
    : Array.isArray(classesResponse?.data)
    ? classesResponse.data
    : [];

  const availableTeachers = Array.isArray(teachersResponse)
    ? teachersResponse
    : Array.isArray(teachersResponse?.data)
    ? teachersResponse.data
    : Array.isArray(teachersResponse?.data?.teachers)
    ? teachersResponse.data.teachers
    : [];

  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    teacher: "",
    maxStudents: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Extract grades from API response, with fallback to default grades
  const apiGrades = Array.isArray(gradesResponse)
    ? gradesResponse
    : Array.isArray(gradesResponse?.data)
    ? gradesResponse.data
    : [];

  const grades =
    apiGrades.length > 0
      ? ["All", ...apiGrades]
      : ["All", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

  const getGradeNumber = useCallback((gradeString) => {
    // Extract number from grade string (e.g., "Grade 9" -> "9", "Grade 10" -> "10")
    const match = gradeString.match(/\d+/);
    return match ? match[0] : gradeString;
  }, []);

  const extractSectionFromClassName = useCallback((className) => {
    // Extract section from class name (e.g., "10-A" -> "A", "Grade9-B" -> "B")
    const parts = className.split("-");
    return parts.length > 1 ? parts[parts.length - 1] : "";
  }, []);

  const validateClassName = useCallback(
    (name) => {
      // Check if name follows SOMETHING-SOMETHING format
      const dashRegex = /^[A-Za-z0-9]+(-[A-Za-z0-9]+)+$/;
      if (!dashRegex.test(name)) {
        return "Class name must be in format SOMETHING-SOMETHING (e.g., 10-A, Grade9-B)";
      }

      // Check if class name already exists (case-insensitive)
      const existingClass = classes.find(
        (cls) => cls.className?.toLowerCase() === name.toLowerCase()
      );

      // If editing, exclude the current class from duplicate check
      if (
        existingClass &&
        (!editingClass || existingClass.id !== editingClass.id)
      ) {
        return "A class with this name already exists";
      }

      return null;
    },
    [classes, editingClass]
  );

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      let processedValue = value;

      // Handle class name formatting
      if (name === "name") {
        // Allow only letters, numbers, and dashes
        processedValue = value.replace(/[^A-Za-z0-9-]/g, "");

        // Auto-capitalize letter after dash
        processedValue = processedValue.replace(
          /-([a-z])/g,
          (match, letter) => {
            return "-" + letter.toUpperCase();
          }
        );
      }

      // Handle grade selection - auto-populate class name
      if (name === "grade" && value && !editingClass) {
        const gradeNumber = getGradeNumber(value);
        const newClassName = `${gradeNumber}-`;

        setFormData((prev) => ({
          ...prev,
          [name]: value,
          name: newClassName,
        }));

        // Clear any previous errors
        setFormErrors({});
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: processedValue,
        }));
      }

      // Clear previous error for this field
      if (formErrors[name]) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }

      // Validate class name in real-time
      if (name === "name" && processedValue.trim()) {
        const error = validateClassName(processedValue.trim());
        if (error) {
          setFormErrors((prev) => ({
            ...prev,
            name: error,
          }));
        }
      }
    },
    [formErrors, validateClassName, getGradeNumber, editingClass]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate class name before submission
      const nameError = validateClassName(formData.name.trim());
      if (nameError) {
        setFormErrors((prev) => ({
          ...prev,
          name: nameError,
        }));
        return;
      }

      try {
        const gradeNumber = getGradeNumber(formData.grade);
        const section = extractSectionFromClassName(formData.name.trim());

        const requestData = {
          className: formData.name.trim(),
          grade: gradeNumber,
          section: section,
          classTeacher: formData.teacher,
        };

        // Only add maxStudents if it's provided
        if (formData.maxStudents && formData.maxStudents.trim() !== "") {
          requestData.maxStudents = parseInt(formData.maxStudents, 10);
        }

        if (editingClass) {
          // Update existing class
          await updateClass.mutateAsync({
            id: editingClass.id,
            data: requestData,
          });
        } else {
          // Add new class
          await createClass.mutateAsync({
            data: requestData,
          });
        }
        setIsModalOpen(false);
        setEditingClass(null);
        setFormData({ name: "", grade: "", teacher: "", maxStudents: "" });
        setFormErrors({});
      } catch (err) {
        console.error("Error submitting class:", err);
      }
    },
    [editingClass, formData, updateClass, createClass, validateClassName]
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setFormErrors({});
  }, []);

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.className || "",
      grade: classItem.grade || "",
      teacher: classItem.classTeacherId || "",
      maxStudents: classItem.maxStudents
        ? classItem.maxStudents.toString()
        : "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (classItem) => {
    setDeleteModal({
      isOpen: true,
      classId: classItem.id,
      className: classItem.className || "Unnamed Class",
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteClass.mutateAsync({ id: deleteModal.classId });
      setDeleteModal({ isOpen: false, classId: null, className: "" });
    } catch (err) {
      console.error("Error deleting class:", err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, classId: null, className: "" });
  };

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({ name: "", grade: "", teacher: "", maxStudents: "" });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const filteredClasses = Array.isArray(classes)
    ? classes.filter((cls) => {
        const matchesSearch =
          (cls.className &&
            cls.className.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (cls.classTeacher?.user?.first_name &&
            cls.classTeacher.user.first_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (cls.classTeacher?.user?.last_name &&
            cls.classTeacher.user.last_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()));
        const matchesGrade = filterGrade === "All" || cls.grade === filterGrade;
        return matchesSearch && matchesGrade;
      })
    : [];

  const ClassCard = ({ classItem }) => {
    const teacherName = classItem.classTeacher?.user
      ? `${classItem.classTeacher.user.first_name} ${classItem.classTeacher.user.last_name}`
      : "No Teacher Assigned";

    const studentCount = classItem.students ? classItem.students.length : 0;
    const enrollmentPercentage = classItem.maxStudents
      ? Math.round((studentCount / classItem.maxStudents) * 100)
      : 0;

    return (
      <div className="card hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {classItem.className || "Unnamed Class"}
            </h3>
            <p className="text-gray-600">{classItem.grade || "No Grade"}</p>
            <p className="text-sm text-gray-500">
              {classItem.room || "No Room"}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(classItem)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <Icons.Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteClick(classItem)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <Icons.Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Icons.User className="w-4 h-4 mr-2" />
            Teacher: {teacherName}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Icons.Users className="w-4 h-4 mr-2" />
            Students: {studentCount} / {classItem.maxStudents || 0}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Icons.MapPin className="w-4 h-4 mr-2" />
            Room: {classItem.room || "Not Assigned"}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Enrollment</span>
            <span className="text-sm font-medium text-gray-900">
              {enrollmentPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                enrollmentPercentage >= 90
                  ? "bg-red-500"
                  : enrollmentPercentage >= 75
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${enrollmentPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">
                {studentCount}
              </p>
              <p className="text-xs text-gray-600">Enrolled</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">
                View Students
              </button>
              <button className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200">
                Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              classItem.is_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {classItem.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    );
  };

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
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>
            Error loading classes: {error.message || error.toString()}
          </span>
          <button
            onClick={() => window.location.reload()}
            className="text-red-700 hover:text-red-900 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600 mt-1">
            Manage school classes and sections
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center"
        >
          <Icons.Plus className="w-4 h-4 mr-2" />
          Add Class
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Classes"
          value={Array.isArray(classes) ? classes.length : 0}
          icon={Icons.School}
          color="bg-blue-500"
        />
        <StatsCard
          title="Total Students"
          value={
            Array.isArray(classes)
              ? classes.reduce(
                  (sum, cls) => sum + (cls.students?.length || 0),
                  0
                )
              : 0
          }
          icon={Icons.Users}
          color="bg-green-500"
        />
        <StatsCard
          title="Average Class Size"
          value={
            Array.isArray(classes) && classes.length > 0
              ? Math.round(
                  classes.reduce(
                    (sum, cls) => sum + (cls.students?.length || 0),
                    0
                  ) / classes.length
                )
              : 0
          }
          icon={Icons.BarChart}
          color="bg-orange-500"
        />
        <StatsCard
          title="Grades"
          value={
            Array.isArray(classes)
              ? new Set(classes.map((cls) => cls.grade).filter(Boolean)).size
              : 0
          }
          icon={Icons.GraduationCap}
          color="bg-purple-500"
        />
      </div>

      {/* Filters and Search */}
      <div className="card">
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
                placeholder="Search classes or teachers..."
              />
            </div>
          </div>
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
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Loading classes...
          </h3>
          <p className="text-gray-600">
            Please wait while we fetch the classes data
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <ClassCard key={classItem.id} classItem={classItem} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <Icons.School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {Array.isArray(classes) && classes.length === 0
              ? "No classes found in the system"
              : "No classes match your search criteria"}
          </h3>
          <p className="text-gray-600">
            {Array.isArray(classes) && classes.length === 0
              ? "Add classes to get started or check if the API is working properly"
              : "Try adjusting your search or filter criteria"}
          </p>
          {Array.isArray(classes) && classes.length === 0 && (
            <button
              onClick={openAddModal}
              className="mt-4 btn-primary inline-flex items-center"
            >
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add First Class
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        editingClass={editingClass}
        formData={formData}
        formErrors={formErrors}
        grades={grades}
        availableTeachers={availableTeachers}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Class"
        message="Are you sure you want to delete this class?"
        itemName={deleteModal.className}
        confirmText="Delete Class"
        isLoading={deleteClass.isPending}
      />
    </div>
  );
};

export default Classes;
