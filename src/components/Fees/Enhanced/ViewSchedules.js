import React, { useState } from "react";
import {
  Calendar,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  useEnhancedActiveYear,
  useGradesAndClasses,
  useGetSchedulesByGrade,
} from "../../../hooks/useApiHooks";

const ViewSchedules = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [expandedSchedule, setExpandedSchedule] = useState(null);

  const { data: activeYear } = useEnhancedActiveYear();
  const { data: gradesAndClasses } = useGradesAndClasses();

  const activeYearId = activeYear?.data?.academicYearId;
  const grades = gradesAndClasses?.data?.grades || [];

  // Fetch schedules only when a grade is selected
  const {
    data: schedulesData,
    isLoading: schedulesLoading,
    error: schedulesError,
  } = useGetSchedulesByGrade(
    activeYearId,
    selectedGrade,
    !!selectedGrade && !!activeYearId,
  );

  const schedules = schedulesData?.data || [];

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

  const toggleSchedule = (scheduleId) => {
    setExpandedSchedule(expandedSchedule === scheduleId ? null : scheduleId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          View Installment Schedules
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          View created installment schedules for {activeYear.data.name}
        </p>
      </div>

      {/* Grade Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Grade
        </label>
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Choose a grade...</option>
          {grades.map((grade) => (
            <option key={grade.gradeId} value={grade.gradeId}>
              {grade.grade}
            </option>
          ))}
        </select>
      </div>

      {/* Schedules List */}
      {selectedGrade && (
        <div className="space-y-4">
          {schedulesLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : schedulesError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">
                  Error loading schedules: {schedulesError.message}
                </p>
              </div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Schedules Found
              </h3>
              <p className="text-gray-600">
                No installment schedules have been created for this grade yet.
              </p>
            </div>
          ) : (
            schedules.map((schedule) => (
              <div
                key={schedule.scheduleId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Schedule Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSchedule(schedule.scheduleId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Calendar className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {schedule.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {schedule.scheduleType} • {schedule.totalInstallments}{" "}
                          Installments
                        </p>
                      </div>
                    </div>
                    {expandedSchedule === schedule.scheduleId ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Schedule Details */}
                {expandedSchedule === schedule.scheduleId && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                      Installments
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {schedule.installments?.map((installment) => (
                        <div
                          key={installment.installmentId}
                          className="bg-white rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-medium text-gray-900">
                                {installment.name}
                              </h5>
                              <p className="text-sm text-gray-500 mt-1">
                                Installment #{installment.installmentNumber}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p className="mb-2">
                              <span className="font-medium">Due Date:</span>{" "}
                              {new Date(
                                installment.dueDate,
                              ).toLocaleDateString()}
                            </p>
                            {installment.feeMappings &&
                              installment.feeMappings.length > 0 && (
                                <div>
                                  <p className="font-medium mb-1">Fee Types:</p>
                                  <ul className="space-y-1">
                                    {installment.feeMappings.map((mapping) => (
                                      <li
                                        key={mapping.mappingId}
                                        className="text-xs"
                                      >
                                        • {mapping.feeType?.name} (
                                        {mapping.fixedAmount
                                          ? `₹${mapping.fixedAmount}`
                                          : `${mapping.percentage}%`}
                                        )
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ViewSchedules;
