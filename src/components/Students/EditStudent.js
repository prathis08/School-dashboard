import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  FileText,
  AlertCircle,
  School,
  Upload,
  Paperclip,
} from "lucide-react";
import { useStudent, useUpdateStudent } from "../../hooks/useApiHooks";

const EditStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Use TanStack Query hooks for API operations
  const { data: studentResponse, isLoading: loading, error } = useStudent(id);
  const updateStudent = useUpdateStudent();

  // Safely extract student data from response
  const studentToEdit =
    studentResponse?.data?.student ||
    studentResponse?.student ||
    studentResponse;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    grade: "",
    class: "",
    rollNumber: "",
    dateOfBirth: "",
    address: "",
    admissionDate: "",
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

  // Prefill form data when component mounts or student data changes
  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        firstName: studentToEdit.firstName || "",
        lastName: studentToEdit.lastName || "",
        email: studentToEdit.email || "",
        phone: studentToEdit.phone || "",
        grade: studentToEdit.grade || "",
        class: studentToEdit.class || "",
        rollNumber: studentToEdit.rollNumber || "",
        dateOfBirth: studentToEdit.dateOfBirth || "",
        address: studentToEdit.address
          ? `${studentToEdit.address.street}, ${studentToEdit.address.city}, ${studentToEdit.address.state} ${studentToEdit.address.zipCode}`
          : "",
        admissionDate: studentToEdit.admissionDate || "",
        status: studentToEdit.status || "Active",
        subjects: studentToEdit.subjects?.toString() || "",
        // Previous school information
        previousSchoolName: studentToEdit.previousSchool?.name || "",
        previousSchoolLastGrade: studentToEdit.previousSchool?.lastGrade || "",
        previousSchoolAddress: studentToEdit.previousSchool?.address || "",
        previousSchoolBoard: studentToEdit.previousSchool?.board || "",
        reasonForLeaving: studentToEdit.previousSchool?.reasonForLeaving || "",
        // Parent/Guardian information
        fatherName: studentToEdit.parentDetails?.fatherName || "",
        fatherPhone: studentToEdit.parentDetails?.fatherPhone || "",
        fatherEmail: studentToEdit.parentDetails?.fatherEmail || "",
        fatherOccupation: studentToEdit.parentDetails?.fathersOccupation || "",
        motherName: studentToEdit.parentDetails?.motherName || "",
        motherPhone: studentToEdit.parentDetails?.motherPhone || "",
        motherEmail: studentToEdit.parentDetails?.motherEmail || "",
        motherOccupation: studentToEdit.parentDetails?.mothersOccupation || "",
        guardianName: studentToEdit.guardianName || "",
        guardianPhone: studentToEdit.guardianPhone || "",
        guardianEmail: studentToEdit.guardianEmail || "",
        guardianRelation: studentToEdit.guardianRelation || "",
        guardianAddress: studentToEdit.guardianAddress || "",
        // File attachments - these would be handled differently in a real app
        photo: null,
        birthCertificate: null,
        previousSchoolCertificate: null,
        transferCertificate: null,
        medicalCertificate: null,
        otherDocuments: [],
      });
    }
  }, [studentToEdit]);

  const gradeOptions = [
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

  const classOptions = {
    "Grade 1": ["1-A", "1-B"],
    "Grade 2": ["2-A", "2-B"],
    "Grade 3": ["3-A", "3-B"],
    "Grade 4": ["4-A", "4-B"],
    "Grade 5": ["5-A", "5-B"],
    "Grade 6": ["6-A", "6-B"],
    "Grade 7": ["7-A", "7-B"],
    "Grade 8": ["8-A", "8-B"],
    "Grade 9": ["9-A", "9-B"],
    "Grade 10": ["10-A", "10-B"],
    "Grade 11": ["11-A", "11-B"],
    "Grade 12": ["12-A", "12-B"],
  };

  const boardOptions = [
    "CBSE",
    "ICSE",
    "State Board",
    "International Baccalaureate",
    "Other",
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !studentToEdit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error ? "Error Loading Student" : "Student Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {error
              ? error.message || "Failed to load student details."
              : "The student you're trying to edit doesn't exist."}
          </p>
          <button onClick={() => navigate("/students")} className="btn-primary">
            Back to Students
          </button>
        </div>
      </div>
    );
  }

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

    // Required field validation
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.grade) newErrors.grade = "Grade is required";
    if (!formData.class) newErrors.class = "Class is required";
    if (!formData.rollNumber.trim())
      newErrors.rollNumber = "Roll number is required";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.admissionDate)
      newErrors.admissionDate = "Admission date is required";

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone format validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Parent information validation
    if (!formData.fatherName.trim())
      newErrors.fatherName = "Father's name is required";
    if (!formData.fatherPhone.trim())
      newErrors.fatherPhone = "Father's phone is required";

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
      // Parse address back to structured format
      const addressParts = formData.address.split(", ");
      const updatedStudentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        grade: formData.grade,
        class: formData.class,
        rollNumber: formData.rollNumber,
        dateOfBirth: formData.dateOfBirth,
        admissionDate: formData.admissionDate,
        status: formData.status,
        subjects: formData.subjects ? parseInt(formData.subjects) : 0,
        address: {
          street: addressParts[0] || "",
          city: addressParts[1] || "",
          state: addressParts[2]?.split(" ")[0] || "",
          zipCode: addressParts[2]?.split(" ")[1] || "",
          country: "USA", // Default
        },
        parentDetails: {
          fatherName: formData.fatherName,
          fatherPhone: formData.fatherPhone,
          fatherEmail: formData.fatherEmail,
          fathersOccupation: formData.fatherOccupation,
          motherName: formData.motherName,
          motherPhone: formData.motherPhone,
          motherEmail: formData.motherEmail,
          mothersOccupation: formData.motherOccupation,
        },
        previousSchool: {
          name: formData.previousSchoolName,
          lastGrade: formData.previousSchoolLastGrade,
          address: formData.previousSchoolAddress,
          board: formData.previousSchoolBoard,
          reasonForLeaving: formData.reasonForLeaving,
        },
        guardianName: formData.guardianName || formData.fatherName,
        guardianPhone: formData.guardianPhone || formData.fatherPhone,
        guardianEmail: formData.guardianEmail,
        guardianRelation: formData.guardianRelation,
        guardianAddress: formData.guardianAddress,
      };

      // Use TanStack Query mutation
      await updateStudent.mutateAsync({
        id: id,
        data: updatedStudentData,
      });

      // Navigate back to student detail page with success message
      navigate(`/students/${id}`, {
        state: {
          message: "Student updated successfully!",
        },
      });
    } catch (error) {
      console.error("Error updating student:", error);
      setErrors({
        submit: error.message || "Failed to update student. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormSection = ({ title, icon: Icon, children }) => (
    <div className="card">
      <div className="flex items-center mb-6">
        <Icon className="w-5 h-5 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );

  const InputField = ({
    label,
    name,
    type = "text",
    required = false,
    placeholder,
    value,
    onChange,
    error,
    options,
    disabled = false,
  }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? "border-red-500" : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        >
          <option value="">Select {label}</option>
          {options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? "border-red-500" : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? "border-red-500" : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />
      )}
      {error && (
        <p className="text-sm text-red-600">
          {error.message || error.toString()}
        </p>
      )}
    </div>
  );

  const FileUpload = ({ label, name, accept, onChange, file, onRemove }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        {file ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{file.name}</span>
            <button
              type="button"
              onClick={onRemove}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        ) : (
          <div>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <input
              type="file"
              accept={accept}
              onChange={(e) => onChange(e, name)}
              className="hidden"
              id={name}
            />
            <label
              htmlFor={name}
              className="mt-2 inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100"
            >
              Choose File
            </label>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/students/${id}`)}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
            <p className="text-gray-600 mt-1">
              Update information for{" "}
              {studentToEdit?.name ||
                `${formData.firstName} ${formData.lastName}`.trim() ||
                "student"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <FormSection title="Basic Information" icon={User}>
          <InputField
            label="First Name"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleInputChange}
            error={errors.firstName}
            placeholder="Enter first name"
          />
          <InputField
            label="Last Name"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleInputChange}
            error={errors.lastName}
            placeholder="Enter last name"
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            placeholder="Enter email address"
          />
          <InputField
            label="Phone"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleInputChange}
            error={errors.phone}
            placeholder="Enter phone number"
          />
          <InputField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            error={errors.dateOfBirth}
          />
          <InputField
            label="Status"
            name="status"
            type="select"
            required
            value={formData.status}
            onChange={handleInputChange}
            error={errors.status}
            options={["Active", "Inactive", "Graduated"]}
          />
        </FormSection>

        {/* Academic Information */}
        <FormSection title="Academic Information" icon={GraduationCap}>
          <InputField
            label="Grade"
            name="grade"
            type="select"
            required
            value={formData.grade}
            onChange={handleInputChange}
            error={errors.grade}
            options={gradeOptions}
          />
          <InputField
            label="Class"
            name="class"
            type="select"
            required
            value={formData.class}
            onChange={handleInputChange}
            error={errors.class}
            options={formData.grade ? classOptions[formData.grade] : []}
          />
          <InputField
            label="Roll Number"
            name="rollNumber"
            required
            value={formData.rollNumber}
            onChange={handleInputChange}
            error={errors.rollNumber}
            placeholder="Enter roll number"
          />
          <InputField
            label="Number of Subjects"
            name="subjects"
            type="number"
            value={formData.subjects}
            onChange={handleInputChange}
            error={errors.subjects}
            placeholder="Enter number of subjects"
          />
          <InputField
            label="Admission Date"
            name="admissionDate"
            type="date"
            required
            value={formData.admissionDate}
            onChange={handleInputChange}
            error={errors.admissionDate}
          />
        </FormSection>

        {/* Contact Information */}
        <FormSection title="Contact Information" icon={MapPin}>
          <div className="md:col-span-2">
            <InputField
              label="Address"
              name="address"
              type="textarea"
              required
              value={formData.address}
              onChange={handleInputChange}
              error={errors.address}
              placeholder="Enter complete address"
            />
          </div>
        </FormSection>

        {/* Parent/Guardian Information */}
        <FormSection title="Parent/Guardian Information" icon={Users}>
          <InputField
            label="Father's Name"
            name="fatherName"
            required
            value={formData.fatherName}
            onChange={handleInputChange}
            error={errors.fatherName}
            placeholder="Enter father's name"
          />
          <InputField
            label="Father's Phone"
            name="fatherPhone"
            type="tel"
            required
            value={formData.fatherPhone}
            onChange={handleInputChange}
            error={errors.fatherPhone}
            placeholder="Enter father's phone"
          />
          <InputField
            label="Father's Email"
            name="fatherEmail"
            type="email"
            value={formData.fatherEmail}
            onChange={handleInputChange}
            error={errors.fatherEmail}
            placeholder="Enter father's email"
          />
          <InputField
            label="Father's Occupation"
            name="fatherOccupation"
            value={formData.fatherOccupation}
            onChange={handleInputChange}
            error={errors.fatherOccupation}
            placeholder="Enter father's occupation"
          />
          <InputField
            label="Mother's Name"
            name="motherName"
            value={formData.motherName}
            onChange={handleInputChange}
            error={errors.motherName}
            placeholder="Enter mother's name"
          />
          <InputField
            label="Mother's Phone"
            name="motherPhone"
            type="tel"
            value={formData.motherPhone}
            onChange={handleInputChange}
            error={errors.motherPhone}
            placeholder="Enter mother's phone"
          />
          <InputField
            label="Mother's Email"
            name="motherEmail"
            type="email"
            value={formData.motherEmail}
            onChange={handleInputChange}
            error={errors.motherEmail}
            placeholder="Enter mother's email"
          />
          <InputField
            label="Mother's Occupation"
            name="motherOccupation"
            value={formData.motherOccupation}
            onChange={handleInputChange}
            error={errors.motherOccupation}
            placeholder="Enter mother's occupation"
          />
        </FormSection>

        {/* Previous School Information */}
        <FormSection title="Previous School Information" icon={School}>
          <InputField
            label="School Name"
            name="previousSchoolName"
            value={formData.previousSchoolName}
            onChange={handleInputChange}
            error={errors.previousSchoolName}
            placeholder="Enter previous school name"
          />
          <InputField
            label="Last Grade Attended"
            name="previousSchoolLastGrade"
            value={formData.previousSchoolLastGrade}
            onChange={handleInputChange}
            error={errors.previousSchoolLastGrade}
            placeholder="Enter last grade"
          />
          <InputField
            label="Board"
            name="previousSchoolBoard"
            type="select"
            value={formData.previousSchoolBoard}
            onChange={handleInputChange}
            error={errors.previousSchoolBoard}
            options={boardOptions}
          />
          <InputField
            label="Reason for Leaving"
            name="reasonForLeaving"
            value={formData.reasonForLeaving}
            onChange={handleInputChange}
            error={errors.reasonForLeaving}
            placeholder="Enter reason for leaving"
          />
          <div className="md:col-span-2">
            <InputField
              label="School Address"
              name="previousSchoolAddress"
              type="textarea"
              value={formData.previousSchoolAddress}
              onChange={handleInputChange}
              error={errors.previousSchoolAddress}
              placeholder="Enter previous school address"
            />
          </div>
        </FormSection>

        {/* File Attachments */}
        <div className="card">
          <div className="flex items-center mb-6">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload
              label="Student Photo"
              name="photo"
              accept="image/*"
              file={formData.photo}
              onChange={handleFileChange}
              onRemove={() => removeFile("photo")}
            />
            <FileUpload
              label="Birth Certificate"
              name="birthCertificate"
              accept=".pdf,.jpg,.jpeg,.png"
              file={formData.birthCertificate}
              onChange={handleFileChange}
              onRemove={() => removeFile("birthCertificate")}
            />
            <FileUpload
              label="Previous School Certificate"
              name="previousSchoolCertificate"
              accept=".pdf,.jpg,.jpeg,.png"
              file={formData.previousSchoolCertificate}
              onChange={handleFileChange}
              onRemove={() => removeFile("previousSchoolCertificate")}
            />
            <FileUpload
              label="Transfer Certificate"
              name="transferCertificate"
              accept=".pdf,.jpg,.jpeg,.png"
              file={formData.transferCertificate}
              onChange={handleFileChange}
              onRemove={() => removeFile("transferCertificate")}
            />
            <FileUpload
              label="Medical Certificate"
              name="medicalCertificate"
              accept=".pdf,.jpg,.jpeg,.png"
              file={formData.medicalCertificate}
              onChange={handleFileChange}
              onRemove={() => removeFile("medicalCertificate")}
            />
          </div>

          {/* Other Documents */}
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">
              Other Documents
            </h3>
            <div className="space-y-4">
              {formData.otherDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-600">{doc.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile("otherDocuments", index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <FileUpload
                label="Add Additional Document"
                name="otherDocuments"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`/students/${id}`)}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Student
              </>
            )}
          </button>
        </div>

        {/* Display submit error if any */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EditStudent;
