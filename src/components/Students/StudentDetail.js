import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icons from "../../utils/icons";
import { useStudent } from "../../hooks/useApiHooks";

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: studentResponse, isLoading: loading, error } = useStudent(id);

  // Extract student data from response
  const student = studentResponse?.data || studentResponse;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Student Details...
          </h2>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Please wait while we fetch the student information.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icons.AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Student
          </h2>
          <p className="text-gray-600 mb-6">
            {error.message || "Failed to load student details."}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/students")}
              className="btn-secondary"
            >
              Back to Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icons.AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Student Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The student you're looking for doesn't exist.
          </p>
          <button onClick={() => navigate("/students")} className="btn-primary">
            Back to Students
          </button>
        </div>
      </div>
    );
  }

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

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const InfoCard = ({ title, children, icon: Icon }) => (
    <div className="card">
      <div className="flex items-center mb-4">
        <Icon className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );

  const InfoItem = ({ label, value, icon: Icon }) => (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center mb-1">
        {Icon && <Icon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />}
        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">
          {label}
        </dt>
      </div>
      <dd className="text-sm font-semibold text-gray-900 break-words ml-6">
        {value || "Not provided"}
      </dd>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/students")}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <Icons.ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Student Details
            </h1>
            <p className="text-gray-600 mt-1">
              Complete information about {student.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/students/${id}/edit`)}
            className="btn-secondary flex items-center"
          >
            <Icons.Edit className="w-4 h-4 mr-2" />
            Edit Student
          </button>
          <button className="btn-primary flex items-center">
            <Icons.Printer className="w-4 h-4 mr-2" />
            Print Details
          </button>
        </div>
      </div>

      {/* Student Profile Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {getInitials(student.name)}
              </span>
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {student.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Student ID: {student.studentId}
              </p>
              <div className="flex items-center mt-2 space-x-3 flex-wrap gap-y-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                    student.status,
                  )}`}
                >
                  {student.status}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getGradeColor(
                    student.grade,
                  )}`}
                >
                  {student.class?.className || "N/A"}
                </span>
                {student.staffRelation?.isStaffWard && (
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-800"
                    title={`${student.staffRelation.relation || "Relation"}: ${student.staffRelation.staffName || student.staffRelation.staffId || ""}`}
                  >
                    Staff ward
                    {student.staffRelation.staffName
                      ? ` of ${student.staffRelation.staffName}`
                      : ""}
                    {student.staffRelation.relation
                      ? ` (${student.staffRelation.relation})`
                      : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
              Admitted on
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDate(student.admissionDate)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <InfoCard title="Personal Information" icon={Icons.User}>
          <InfoItem
            label="Full Name"
            value={`${student.firstName} ${student.lastName}`}
            icon={Icons.User}
          />
          <InfoItem
            label="Date of Birth"
            value={formatDate(student.dateOfBirth)}
            icon={Icons.Calendar}
          />
          <InfoItem label="Gender" value={student.gender} icon={Icons.User} />
          <InfoItem label="Email" value={student.email} icon={Icons.Mail} />
          <InfoItem label="Phone" value={student.phone} icon={Icons.Phone} />
          <div className="md:col-span-2">
            <InfoItem
              label="Address"
              value={student.address?.street || "N/A"}
              icon={Icons.MapPin}
            />
          </div>
        </InfoCard>

        {/* Academic Information */}
        <InfoCard title="Academic Information" icon={Icons.GraduationCap}>
          <InfoItem
            label="Grade"
            value={student.grade}
            icon={Icons.GraduationCap}
          />
          <InfoItem
            label="Class"
            value={student.class?.className || "N/A"}
            icon={Icons.School}
          />
          <InfoItem
            label="Roll Number"
            value={student.rollNumber || "Not assigned"}
            icon={Icons.Hash}
          />
          <InfoItem
            label="Section"
            value={student.class?.section || "N/A"}
            icon={Icons.BookOpen}
          />
          <InfoItem
            label="Admission Date"
            value={formatDate(student.admissionDate)}
            icon={Icons.Calendar}
          />
          <InfoItem
            label="Enrollment Date"
            value={formatDate(student.enrollmentDate)}
            icon={Icons.Calendar}
          />
          {student.grades && student.grades.length > 0 && (
            <>
              <InfoItem
                label="Current Performance"
                value="Excellent"
                icon={Icons.Target}
              />
              <InfoItem label="Class Rank" value="N/A" icon={Icons.Award} />
            </>
          )}
        </InfoCard>

        {/* Parent/Guardian Information */}
        <InfoCard title="Parent/Guardian Information" icon={Icons.Users}>
          <InfoItem
            label="Father's Name"
            value={
              student.parentDetails?.father?.name || student.fatherName || "N/A"
            }
            icon={Icons.User}
          />
          <InfoItem
            label="Father's Phone"
            value={student.parentDetails?.father?.phone || "N/A"}
            icon={Icons.Phone}
          />
          <InfoItem
            label="Father's Email"
            value={student.parentDetails?.father?.email || "N/A"}
            icon={Icons.Mail}
          />
          <InfoItem
            label="Father's Occupation"
            value={student.parentDetails?.father?.occupation || "N/A"}
            icon={Icons.Briefcase}
          />
          <InfoItem
            label="Mother's Name"
            value={student.parentDetails?.mother?.name || "N/A"}
            icon={Icons.User}
          />
          <InfoItem
            label="Mother's Phone"
            value={student.parentDetails?.mother?.phone || "N/A"}
            icon={Icons.Phone}
          />
          <InfoItem
            label="Mother's Email"
            value={student.parentDetails?.mother?.email || "N/A"}
            icon={Icons.Mail}
          />
          <InfoItem
            label="Mother's Occupation"
            value={student.parentDetails?.mother?.occupation || "N/A"}
            icon={Icons.Briefcase}
          />
        </InfoCard>

        {/* Guardian & Emergency Contact */}
        <InfoCard title="Guardian & Emergency Contact" icon={Icons.Phone}>
          <InfoItem
            label="Guardian Name"
            value={student.guardianDetails?.name || "N/A"}
            icon={Icons.User}
          />
          <InfoItem
            label="Guardian Phone"
            value={student.guardianDetails?.phone || "N/A"}
            icon={Icons.Phone}
          />
          <InfoItem
            label="Guardian Email"
            value={student.guardianDetails?.email || "N/A"}
            icon={Icons.Mail}
          />
          <InfoItem
            label="Guardian Relation"
            value={student.guardianDetails?.relation || "N/A"}
            icon={Icons.Users}
          />
          <InfoItem
            label="Primary Emergency Contact"
            value={student.emergencyContact?.primary?.name || "N/A"}
            icon={Icons.User}
          />
          <InfoItem
            label="Primary Contact Phone"
            value={student.emergencyContact?.primary?.phone || "N/A"}
            icon={Icons.Phone}
          />
          <InfoItem
            label="Secondary Emergency Contact"
            value={student.emergencyContact?.secondary?.name || "N/A"}
            icon={Icons.User}
          />
          <InfoItem
            label="Secondary Contact Phone"
            value={student.emergencyContact?.secondary?.phone || "N/A"}
            icon={Icons.Phone}
          />
        </InfoCard>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Details */}
        {/* {student.attendance && student.attendance.length >= 0 && (
          <InfoCard title="Attendance Details" icon={Icons.Calendar}>
            <InfoItem
              label="Attendance Percentage"
              value={student.attendance.length > 0 ? "95%" : "0%"}
              icon={Icons.Target}
            />
            <InfoItem
              label="Present Days"
              value={student.attendance.length > 0 ? "95" : "0"}
              icon={Icons.CheckCircle}
            />
            <InfoItem label="Total Days" value="100" icon={Icons.Calendar} />
          </InfoCard>
        )} */}

        {/* Academic Performance */}
        {/* {student.grades && student.grades.length >= 0 && (
          <InfoCard title="Academic Performance" icon={Icons.Award}>
            <InfoItem
              label="Current Performance"
              value={student.grades.length > 0 ? "Excellent" : "No grades yet"}
              icon={Icons.Target}
            />
            <InfoItem
              label="Previous Year Performance"
              value="Good"
              icon={Icons.TrendingUp}
            />
            <InfoItem label="Class Rank" value="N/A" icon={Icons.Award} />
          </InfoCard>
        )} */}

        {/* Previous School Details */}
        {student.previousSchoolDetails && (
          <InfoCard title="Previous School Details" icon={Icons.School}>
            <InfoItem
              label="School Name"
              value={student.previousSchoolDetails.name || "N/A"}
              icon={Icons.School}
            />
            <InfoItem
              label="Board"
              value={student.previousSchoolDetails.board || "N/A"}
              icon={Icons.BookOpen}
            />
            <div className="md:col-span-2">
              <InfoItem
                label="Address"
                value={student.previousSchoolDetails.address || "N/A"}
                icon={Icons.MapPin}
              />
            </div>
            <InfoItem
              label="Last Grade"
              value={student.previousSchoolDetails.lastGrade || "N/A"}
              icon={Icons.GraduationCap}
            />
            <InfoItem
              label="Reason for Leaving"
              value={student.previousSchoolDetails.reasonForLeaving || "N/A"}
              icon={Icons.AlertCircle}
            />
          </InfoCard>
        )}

        {/* Selected Subjects */}
        {/* {student.subjects && (
          <InfoCard title="Selected Subjects" icon={Icons.BookOpen}>
            <div className="md:col-span-2">
              <InfoItem
                label="Subjects"
                value={student.subjects.selectedSubjects || "Not specified"}
                icon={Icons.BookOpen}
              />
            </div>
          </InfoCard>
        )} */}

        {/* Uploaded Documents */}
        <InfoCard title="Uploaded Documents" icon={Icons.FileText}>
          {student.photo && (
            <InfoItem
              label="Student Photo"
              value={
                <a
                  href={student.photo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Photo
                </a>
              }
              icon={Icons.Image}
            />
          )}
          {student.birthCertificate && (
            <InfoItem
              label="Birth Certificate"
              value={
                <a
                  href={student.birthCertificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Document
                </a>
              }
              icon={Icons.FileText}
            />
          )}
          {student.previousSchoolCertificate && (
            <InfoItem
              label="Previous School Certificate"
              value={
                <a
                  href={student.previousSchoolCertificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Document
                </a>
              }
              icon={Icons.FileText}
            />
          )}
          {student.transferCertificate && (
            <InfoItem
              label="Transfer Certificate"
              value={
                <a
                  href={student.transferCertificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Document
                </a>
              }
              icon={Icons.FileText}
            />
          )}
          {student.medicalCertificate && (
            <InfoItem
              label="Medical Certificate"
              value={
                <a
                  href={student.medicalCertificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Document
                </a>
              }
              icon={Icons.FileText}
            />
          )}
          {student.otherDocuments && student.otherDocuments.length > 0 && (
            <div className="md:col-span-2">
              <InfoItem
                label="Other Documents"
                value={
                  <div className="space-y-1">
                    {student.otherDocuments.map((doc, index) => (
                      <div key={index}>
                        <a
                          href={doc.url || doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {doc.name || `Document ${index + 1}`}
                        </a>
                      </div>
                    ))}
                  </div>
                }
                icon={Icons.FileText}
              />
            </div>
          )}
          {!student.photo &&
            !student.birthCertificate &&
            !student.previousSchoolCertificate &&
            !student.transferCertificate &&
            !student.medicalCertificate &&
            (!student.otherDocuments ||
              student.otherDocuments.length === 0) && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">No documents uploaded</p>
              </div>
            )}
        </InfoCard>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Icons.Zap className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate(`/students/${id}/edit`)}
            className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
          >
            <Icons.Edit className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-600">
              Edit Details
            </span>
          </button>
          <button
            onClick={() =>
              navigate("/fees", {
                state: {
                  prefilledStudent: {
                    studentId: student.studentId,
                    name: student.name,
                  },
                },
              })
            }
            className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
          >
            <Icons.IndianRupee className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-600">
              View Fees
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
