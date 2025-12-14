import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Users,
  AlertCircle,
  School,
  Upload,
  Paperclip,
} from "lucide-react";
import { useCreateStudent, useGradesAndClasses } from "../../hooks/useApiHooks";
import { API_ENDPOINTS } from "../../services/api";
import { getSchoolId } from "../../utils/dashboardConfig";

const AddStudent = () => {
  const navigate = useNavigate();
  const createStudent = useCreateStudent();
  const {
    data: gradesAndClassesData,
    isLoading: classesLoading,
    error: classesError,
  } = useGradesAndClasses();

  const loading = createStudent.isPending;
  const error = createStudent.error;
  const clearError = () => createStudent.reset();

  // State for processed grades and classes from API
  const [gradeOptions, setGradeOptions] = useState([]);
  const [classOptions, setClassOptions] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    grade: "",
    class: "",
    rollNumber: "",
    dateOfBirth: "",
    address: "",
    admissionDate: new Date().toISOString().split("T")[0], // Current date as default
    status: "Active",
    subjects: "",
    // Previous school information
    previousSchoolName: "",
    previousSchoolLastGrade: "",
    previousSchoolAddress: "",
    previousSchoolBoard: "",
    reasonForLeaving: "",
    // Parent/Guardian information
    fatherName: "",
    fatherPhone: "",
    fatherEmail: "",
    fatherOccupation: "",
    motherName: "",
    motherPhone: "",
    motherEmail: "",
    motherOccupation: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianRelation: "",
    guardianAddress: "",
    // File attachments
    photo: null,
    birthCertificate: null,
    previousSchoolCertificate: null,
    transferCertificate: null,
    medicalCertificate: null,
    otherDocuments: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Process grades and classes data from API
  useEffect(() => {
    console.log("Grades and classes data received:", gradesAndClassesData);
    console.log("Classes loading:", classesLoading);
    console.log("Classes error:", classesError);

    if (gradesAndClassesData && gradesAndClassesData.success) {
      const grades = [];
      const classMap = {};

      // Handle the new API response format
      const gradesData = gradesAndClassesData.data.grades;

      console.log("Processing grades data:", gradesData);

      if (Array.isArray(gradesData)) {
        gradesData.forEach((gradeItem) => {
          console.log("Processing grade item:", gradeItem);

          const grade = `${gradeItem.grade}`;
          grades.push(grade);

          // Process classes for this grade
          if (gradeItem.classes && Array.isArray(gradeItem.classes)) {
            classMap[grade] = gradeItem.classes.map((classItem) => {
              return (
                classItem.class_name ||
                `${grade} - Section ${classItem.section}`
              );
            });
          } else {
            classMap[grade] = [];
          }
        });

        console.log("Final grades:", grades);
        console.log("Final class map:", classMap);

        setGradeOptions(grades.sort());
        setClassOptions(classMap);
      } else {
        console.warn(
          "Grades data is not an array:",
          typeof gradesData,
          gradesData
        );
      }
    } else if (classesError) {
      console.log("Using fallback data due to error");
      // Fallback data if API fails
      const fallbackGrades = [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
        "Grade 7",
        "Grade 8",
        "Grade 9",
        "Grade 10",
        "Grade 11",
        "Grade 12",
      ];
      const fallbackClassMap = {};
      fallbackGrades.forEach((grade, index) => {
        fallbackClassMap[grade] = [`${index + 1}-A`, `${index + 1}-B`];
      });

      setGradeOptions(fallbackGrades);
      setClassOptions(fallbackClassMap);
    }
  }, [gradesAndClassesData, classesError, classesLoading]);

  const boardOptions = [
    "CBSE",
    "ICSE",
    "State Board",
    "IB",
    "Cambridge",
    "Other",
  ];

  const relationOptions = [
    "Uncle",
    "Aunt",
    "Grandparent",
    "Elder Sibling",
    "Family Friend",
    "Other",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Reset class when grade changes
    if (name === "grade") {
      setFormData((prev) => ({
        ...prev,
        class: "",
      }));
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (fieldName === "otherDocuments") {
      setFormData((prev) => ({
        ...prev,
        otherDocuments: [...prev.otherDocuments, file],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
    }
  };

  const removeFile = (fieldName, index = null) => {
    if (fieldName === "otherDocuments" && index !== null) {
      setFormData((prev) => ({
        ...prev,
        otherDocuments: prev.otherDocuments.filter((_, i) => i !== index),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.grade) newErrors.grade = "Grade is required";
    if (!formData.class) newErrors.class = "Class is required";
    if (!formData.rollNumber.trim())
      newErrors.rollNumber = "Roll number is required";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.admissionDate)
      newErrors.admissionDate = "Admission date is required";

    // Parent information validation (at least one parent required)
    const hasFatherInfo = formData.fatherName.trim();
    const hasMotherInfo = formData.motherName.trim();

    if (!hasFatherInfo && !hasMotherInfo) {
      newErrors.parentInfo = "At least one parent's information is required";
    }

    // Guardian information validation (required if no parents)
    if (!hasFatherInfo && !hasMotherInfo && !formData.guardianName.trim()) {
      newErrors.guardianName =
        "Guardian name is required when no parent information is provided";
    }

    // Email validation (if provided)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.fatherEmail && !emailRegex.test(formData.fatherEmail)) {
      newErrors.fatherEmail = "Please enter a valid email address";
    }
    if (formData.motherEmail && !emailRegex.test(formData.motherEmail)) {
      newErrors.motherEmail = "Please enter a valid email address";
    }
    if (formData.guardianEmail && !emailRegex.test(formData.guardianEmail)) {
      newErrors.guardianEmail = "Please enter a valid email address";
    }

    // Phone validation (if provided)
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (formData.fatherPhone && !phoneRegex.test(formData.fatherPhone)) {
      newErrors.fatherPhone = "Please enter a valid phone number";
    }
    if (formData.motherPhone && !phoneRegex.test(formData.motherPhone)) {
      newErrors.motherPhone = "Please enter a valid phone number";
    }
    if (formData.guardianPhone && !phoneRegex.test(formData.guardianPhone)) {
      newErrors.guardianPhone = "Please enter a valid phone number";
    }

    // Subjects validation
    if (
      formData.subjects &&
      (isNaN(formData.subjects) ||
        formData.subjects < 1 ||
        formData.subjects > 20)
    ) {
      newErrors.subjects = "Number of subjects must be between 1 and 20";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare student data for API
      const studentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: "student123", // Default password - should be configurable
        studentId: formData.rollNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        phone: formData.phone,
        grade: formData.grade,
        classId: formData.class,
        admissionDate: formData.admissionDate,
        status: formData.status,
        role: "student",
        schoolId: getSchoolId() || "1", // Use utility function to get schoolId
        // Parent information
        fatherName: formData.fatherName,
        fatherPhone: formData.fatherPhone,
        fatherEmail: formData.fatherEmail,
        fatherOccupation: formData.fatherOccupation,
        motherName: formData.motherName,
        motherPhone: formData.motherPhone,
        motherEmail: formData.motherEmail,
        motherOccupation: formData.motherOccupation,
        // Guardian information (if different from parents)
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        guardianEmail: formData.guardianEmail,
        guardianRelation: formData.guardianRelation,
        guardianAddress: formData.guardianAddress,
        // Previous school information
        previousSchoolName: formData.previousSchoolName,
        previousSchoolLastGrade: formData.previousSchoolLastGrade,
        previousSchoolAddress: formData.previousSchoolAddress,
        previousSchoolBoard: formData.previousSchoolBoard,
        reasonForLeaving: formData.reasonForLeaving,
        // Additional fields
        subjects: formData.subjects,
      };

      console.log(
        "Sending student data:",
        JSON.stringify(studentData, null, 2)
      );

      // Call API to create student
      await createStudent.mutateAsync({ data: studentData });

      // Navigate back to students page with success message
      navigate("/students", {
        state: {
          message: `Student ${formData.firstName} ${formData.lastName} has been added successfully!`,
        },
      });
    } catch (err) {
      console.error("Error creating student:", err);
      // Error is handled by the hook and displayed in the component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/students");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Add New Student
            </h1>
          </div>
        </div>

        {/* Classes API Error */}
        {classesError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700">
                Error loading classes: {classesError.message}. Using fallback
                data.
              </p>
            </div>
          </div>
        )}

        {/* Classes Loading State */}
        {classesLoading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-blue-700">Loading classes...</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Personal Information */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.gender}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="student@email.com (optional)"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="+1 234 567 8900 (optional)"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter student's address"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Previous School Information */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <School className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Previous School Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous School Name
                  </label>
                  <input
                    type="text"
                    name="previousSchoolName"
                    value={formData.previousSchoolName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter previous school name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Attended Grade
                  </label>
                  <select
                    name="previousSchoolLastGrade"
                    value={formData.previousSchoolLastGrade}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select Grade</option>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Board/Curriculum
                  </label>
                  <select
                    name="previousSchoolBoard"
                    value={formData.previousSchoolBoard}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select Board</option>
                    {boardOptions.map((board) => (
                      <option key={board} value={board}>
                        {board}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Leaving
                  </label>
                  <input
                    type="text"
                    name="reasonForLeaving"
                    value={formData.reasonForLeaving}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Relocation, Better opportunities"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous School Address
                  </label>
                  <textarea
                    name="previousSchoolAddress"
                    value={formData.previousSchoolAddress}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Enter previous school address"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Academic Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade *
                  </label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    disabled={classesLoading}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.grade ? "border-red-500" : "border-gray-300"
                    } ${
                      classesLoading ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">
                      {classesLoading ? "Loading grades..." : "Select Grade"}
                    </option>
                    {gradeOptions.length === 0 && !classesLoading && (
                      <option disabled>No grades available</option>
                    )}
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                  {/* Debug info */}
                  {process.env.NODE_ENV === "development" && (
                    <div className="mt-1 text-xs text-gray-500">
                      Debug: {gradeOptions.length} grades loaded
                    </div>
                  )}
                  {errors.grade && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.grade}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class *
                  </label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    disabled={!formData.grade || classesLoading}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.class ? "border-red-500" : "border-gray-300"
                    } ${
                      !formData.grade || classesLoading
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <option value="">
                      {classesLoading ? "Loading classes..." : "Select Class"}
                    </option>
                    {formData.grade && !classOptions[formData.grade] && (
                      <option disabled>
                        No classes available for {formData.grade}
                      </option>
                    )}
                    {formData.grade &&
                      classOptions[formData.grade]?.map((className) => (
                        <option key={className} value={className}>
                          {className}
                        </option>
                      ))}
                  </select>
                  {/* Debug info */}
                  {process.env.NODE_ENV === "development" && formData.grade && (
                    <div className="mt-1 text-xs text-gray-500">
                      Debug: {classOptions[formData.grade]?.length || 0} classes
                      for {formData.grade}
                    </div>
                  )}
                  {errors.class && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.class}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.rollNumber ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="2024001"
                  />
                  {errors.rollNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.rollNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admission Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="admissionDate"
                      value={formData.admissionDate}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.admissionDate
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.admissionDate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.admissionDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Subjects
                  </label>
                  <input
                    type="number"
                    name="subjects"
                    value={formData.subjects}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.subjects ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="6"
                  />
                  {errors.subjects && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.subjects}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Father's Information */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Father's Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter father's name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="fatherPhone"
                      value={formData.fatherPhone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.fatherPhone
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  {errors.fatherPhone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.fatherPhone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="fatherEmail"
                      value={formData.fatherEmail}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.fatherEmail
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="father@email.com"
                    />
                  </div>
                  {errors.fatherEmail && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.fatherEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Occupation
                  </label>
                  <input
                    type="text"
                    name="fatherOccupation"
                    value={formData.fatherOccupation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter father's occupation"
                  />
                </div>
              </div>
            </div>

            {/* Mother's Information */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-pink-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Mother's Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter mother's name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="motherPhone"
                      value={formData.motherPhone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.motherPhone
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  {errors.motherPhone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.motherPhone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="motherEmail"
                      value={formData.motherEmail}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.motherEmail
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="mother@email.com"
                    />
                  </div>
                  {errors.motherEmail && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.motherEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's Occupation
                  </label>
                  <input
                    type="text"
                    name="motherOccupation"
                    value={formData.motherOccupation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter mother's occupation"
                  />
                </div>
              </div>
              {errors.parentInfo && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.parentInfo}
                </p>
              )}
            </div>

            {/* Guardian Information */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Guardian Information (if different from parents)
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.guardianName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter guardian's name"
                  />
                  {errors.guardianName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.guardianName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guardian Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="guardianPhone"
                      value={formData.guardianPhone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.guardianPhone
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  {errors.guardianPhone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.guardianPhone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guardian Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="guardianEmail"
                      value={formData.guardianEmail}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.guardianEmail
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="guardian@email.com"
                    />
                  </div>
                  {errors.guardianEmail && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.guardianEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship to Student
                  </label>
                  <select
                    name="guardianRelation"
                    value={formData.guardianRelation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select Relationship</option>
                    {relationOptions.map((relation) => (
                      <option key={relation} value={relation}>
                        {relation}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guardian Address (if different from student)
                  </label>
                  <textarea
                    name="guardianAddress"
                    value={formData.guardianAddress}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Enter guardian's address"
                  />
                </div>
              </div>
            </div>

            {/* File Attachments */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Paperclip className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  File Attachments
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Photo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "photo")}
                      className="hidden"
                      id="photo"
                    />
                    <label
                      htmlFor="photo"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload photo
                      </span>
                      <span className="text-xs text-gray-400">
                        PNG, JPG up to 5MB
                      </span>
                    </label>
                    {formData.photo && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-green-600">
                          {formData.photo.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile("photo")}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birth Certificate
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "birthCertificate")}
                      className="hidden"
                      id="birthCertificate"
                    />
                    <label
                      htmlFor="birthCertificate"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload certificate
                      </span>
                      <span className="text-xs text-gray-400">
                        PDF, PNG, JPG up to 10MB
                      </span>
                    </label>
                    {formData.birthCertificate && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-green-600">
                          {formData.birthCertificate.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile("birthCertificate")}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous School Certificate
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileChange(e, "previousSchoolCertificate")
                      }
                      className="hidden"
                      id="previousSchoolCertificate"
                    />
                    <label
                      htmlFor="previousSchoolCertificate"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload certificate
                      </span>
                      <span className="text-xs text-gray-400">
                        PDF, PNG, JPG up to 10MB
                      </span>
                    </label>
                    {formData.previousSchoolCertificate && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-green-600">
                          {formData.previousSchoolCertificate.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            removeFile("previousSchoolCertificate")
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transfer Certificate
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileChange(e, "transferCertificate")
                      }
                      className="hidden"
                      id="transferCertificate"
                    />
                    <label
                      htmlFor="transferCertificate"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload certificate
                      </span>
                      <span className="text-xs text-gray-400">
                        PDF, PNG, JPG up to 10MB
                      </span>
                    </label>
                    {formData.transferCertificate && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-green-600">
                          {formData.transferCertificate.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile("transferCertificate")}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Certificate
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileChange(e, "medicalCertificate")
                      }
                      className="hidden"
                      id="medicalCertificate"
                    />
                    <label
                      htmlFor="medicalCertificate"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload certificate
                      </span>
                      <span className="text-xs text-gray-400">
                        PDF, PNG, JPG up to 10MB
                      </span>
                    </label>
                    {formData.medicalCertificate && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-green-600">
                          {formData.medicalCertificate.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile("medicalCertificate")}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "otherDocuments")}
                      className="hidden"
                      id="otherDocuments"
                    />
                    <label
                      htmlFor="otherDocuments"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload documents
                      </span>
                      <span className="text-xs text-gray-400">
                        PDF, PNG, JPG up to 10MB
                      </span>
                    </label>
                    {formData.otherDocuments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {formData.otherDocuments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-green-600">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                removeFile("otherDocuments", index)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{isSubmitting ? "Adding Student..." : "Add Student"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
