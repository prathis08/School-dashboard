import React, { useState } from "react";
import {
  Users,
  Search,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react";
import {
  useEnhancedActiveYear,
  useStudents,
  useEnhancedStudentSummary,
  useAssignFeeSchedule,
} from "../../../hooks/useApiHooks";

const StudentFeeAssignment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    scheduleId: "",
    discountPercentage: 0,
    discountAmount: 0,
  });

  const { data: activeYear } = useEnhancedActiveYear();
  const { data: studentsData } = useStudents();
  const assignMutation = useAssignFeeSchedule();

  const activeYearId = activeYear?.data?.academicYearId;
  const students = Array.isArray(studentsData?.data) ? studentsData.data : [];

  const { data: studentSummary } = useEnhancedStudentSummary(
    selectedStudent?.studentId,
    activeYearId,
  );

  const filteredStudents = students.filter(
    (student) =>
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await assignMutation.mutateAsync({
        data: {
          studentId: selectedStudent.studentId,
          academicYearId: activeYearId,
          scheduleId: assignmentData.scheduleId,
          discountPercentage: parseFloat(assignmentData.discountPercentage),
          discountAmount: parseFloat(assignmentData.discountAmount),
        },
      });
      setShowAssignModal(false);
      setAssignmentData({
        scheduleId: "",
        discountPercentage: 0,
        discountAmount: 0,
      });
    } catch (error) {
      console.error("Error assigning fee schedule:", error);
    }
  };

  if (!activeYear?.data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <AlertCircle className="w-6 h-6 text-yellow-600 mb-2" />
        <h3 className="text-lg font-semibold text-yellow-900 mb-1">
          No Active Academic Year
        </h3>
        <p className="text-yellow-800">
          Please create and activate an academic year first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Student Fee Assignment
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Assign fee schedules to students for {activeYear.data.name}
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search students by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <div
            key={student.studentId}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedStudent(student)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    {student.studentId}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Grade:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {student.gradeName || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Section:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {student.section || "N/A"}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStudent(student);
                  setShowAssignModal(true);
                }}
                className="w-full flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Assign Fee Schedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Student Summary Panel */}
      {selectedStudent && studentSummary && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Fee Summary: {selectedStudent.firstName} {selectedStudent.lastName}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">Total Fee</p>
              <p className="text-2xl font-bold text-blue-900">
                ₹{studentSummary.data?.totalAmount?.toLocaleString() || "0"}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 mb-1">Paid</p>
              <p className="text-2xl font-bold text-green-900">
                ₹{studentSummary.data?.paidAmount?.toLocaleString() || "0"}
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 mb-1">Balance</p>
              <p className="text-2xl font-bold text-red-900">
                ₹{studentSummary.data?.balanceAmount?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Assign Fee Schedule
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedStudent.firstName} {selectedStudent.lastName}
              </p>
            </div>

            <form onSubmit={handleAssign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={assignmentData.scheduleId}
                  onChange={(e) =>
                    setAssignmentData((prev) => ({
                      ...prev,
                      scheduleId: e.target.value,
                    }))
                  }
                  placeholder="Enter schedule ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get this from the Installments tab
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  value={assignmentData.discountPercentage}
                  onChange={(e) =>
                    setAssignmentData((prev) => ({
                      ...prev,
                      discountPercentage: e.target.value,
                    }))
                  }
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Amount (₹)
                </label>
                <input
                  type="number"
                  value={assignmentData.discountAmount}
                  onChange={(e) =>
                    setAssignmentData((prev) => ({
                      ...prev,
                      discountAmount: e.target.value,
                    }))
                  }
                  placeholder="0"
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setAssignmentData({
                      scheduleId: "",
                      discountPercentage: 0,
                      discountAmount: 0,
                    });
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    assignMutation.isPending || !assignmentData.scheduleId
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assignMutation.isPending
                    ? "Assigning..."
                    : "Assign Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeeAssignment;
