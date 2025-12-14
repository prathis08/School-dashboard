import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../utils/icons";
import { useCreateTeacher } from "../../hooks/useApiHooks";

const AddTeacher = () => {
  const navigate = useNavigate();
  const createTeacher = useCreateTeacher();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    qualification: "",
    experience: "",
    dateOfJoining: "",
    salary: "",
    phone: "",
    address: "",
    subjects: [],
    classes: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState([]);

  const departments = [
    "Mathematics",
    "Science",
    "English",
    "History",
    "Physical Education",
    "Art",
    "Music",
    "Computer Science",
    "Geography",
    "Chemistry",
    "Physics",
    "Biology",
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
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          documents: `${file.name} is too large. Maximum size is 5MB.`,
        }));
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          documents: `${file.name} is not a supported file type.`,
        }));
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setDocuments((prev) => [...prev, ...validFiles]);
      setErrors((prev) => ({ ...prev, documents: "" }));
    }
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = "Qualification is required";
    }

    if (!formData.experience) {
      newErrors.experience = "Experience is required";
    } else if (isNaN(formData.experience) || formData.experience < 0) {
      newErrors.experience = "Experience must be a valid number";
    }

    if (!formData.dateOfJoining) {
      newErrors.dateOfJoining = "Date of joining is required";
    }

    if (!formData.salary) {
      newErrors.salary = "Salary is required";
    } else if (isNaN(formData.salary) || formData.salary <= 0) {
      newErrors.salary = "Salary must be a valid positive number";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[\d\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
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
      // Prepare data for API
      const teacherData = {
        ...formData,
        experience: parseInt(formData.experience),
        salary: parseFloat(formData.salary),
      };

      // Create FormData if documents are uploaded
      let submitData;
      if (documents.length > 0) {
        submitData = new FormData();
        Object.keys(teacherData).forEach((key) => {
          submitData.append(key, teacherData[key]);
        });
        documents.forEach((file, index) => {
          submitData.append(`documents`, file);
        });
      } else {
        submitData = teacherData;
      }

      await createTeacher.mutateAsync({ data: submitData });

      // Success - redirect to teachers list
      navigate("/teachers", {
        state: { message: "Teacher created successfully!" },
      });
    } catch (error) {
      console.error("Error creating teacher:", error);

      // Handle validation errors from backend
      if (error.message.includes("Validation failed")) {
        setErrors({ submit: "Please check your input and try again." });
      } else if (error.message.includes("email already exists")) {
        setErrors({ email: "A user with this email already exists" });
      } else {
        setErrors({
          submit:
            error.message || "Failed to create teacher. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (
    label,
    name,
    type = "text",
    required = true,
    options = null
  ) => (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "select" ? (
        <select
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors[name] ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          rows="3"
          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors[name] ? "border-red-500" : "border-gray-300"
          }`}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors[name] ? "border-red-500" : "border-gray-300"
          }`}
          placeholder={
            type === "password"
              ? "Enter password"
              : `Enter ${label.toLowerCase()}`
          }
        />
      )}
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
      )}
    </div>
  );

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
            <h1 className="text-2xl font-bold text-gray-900">
              Add New Teacher
            </h1>
            <p className="text-gray-600 mt-1">Create a new teacher profile</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Icons.User className="w-5 h-5 mr-2" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderFormField("First Name", "firstName")}
              {renderFormField("Last Name", "lastName")}
              {renderFormField("Email Address", "email", "email")}
              {renderFormField("Phone Number", "phone", "tel")}
              <div className="md:col-span-2">
                {renderFormField("Address", "address", "textarea")}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Icons.Briefcase className="w-5 h-5 mr-2" />
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderFormField(
                "Department",
                "department",
                "select",
                true,
                departments
              )}
              {renderFormField("Qualification", "qualification")}
              {renderFormField("Experience (Years)", "experience", "number")}
              {renderFormField("Date of Joining", "dateOfJoining", "date")}
              <div className="md:col-span-2">
                {renderFormField("Salary", "salary", "number")}
              </div>
            </div>
          </div>

          {/* Supporting Documents */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Icons.FileText className="w-5 h-5 mr-2" />
              Supporting Documents
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="documents"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Upload Documents (Optional)
                </label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="documents"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="documents"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Icons.Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </label>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB each)
                </p>
                {errors.documents && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.documents}
                  </p>
                )}
              </div>

              {/* Document List */}
              {documents.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Uploaded Documents:
                  </h3>
                  {documents.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <Icons.FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Icons.X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Errors */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <Icons.AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/teachers")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Icons.Plus className="w-4 h-4 mr-2" />
                  Create Teacher
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeacher;
