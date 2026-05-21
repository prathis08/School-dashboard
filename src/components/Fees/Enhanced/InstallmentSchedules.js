import React, { useState } from "react";
import {
  FileText,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  useEnhancedActiveYear,
  useGradesAndClasses,
  useCreateQuarterlyScheduleForGrade,
  useCreateMonthlyScheduleForGrade,
} from "../../../hooks/useApiHooks";
import { useToast } from "../../../context/UIProvider";

const InstallmentSchedules = () => {
  const toast = useToast();
  const [selectedGrade, setSelectedGrade] = useState("");
  const [scheduleType, setScheduleType] = useState("quarterly");

  const { data: activeYear } = useEnhancedActiveYear();
  const { data: gradesAndClasses } = useGradesAndClasses();
  const createQuarterlyMutation = useCreateQuarterlyScheduleForGrade();
  const createMonthlyMutation = useCreateMonthlyScheduleForGrade();

  const activeYearId = activeYear?.data?.academicYearId;
  const grades = gradesAndClasses?.data?.grades || [];

  const handleCreateSchedule = async () => {
    try {
      if (scheduleType === "quarterly") {
        await createQuarterlyMutation.mutateAsync({
          academicYearId: activeYearId,
          gradeId: selectedGrade,
        });
        toast.success("Quarterly schedule created successfully for the grade!");
      } else if (scheduleType === "monthly") {
        await createMonthlyMutation.mutateAsync({
          academicYearId: activeYearId,
          gradeId: selectedGrade,
        });
        toast.success("Monthly schedule created successfully for the grade!");
      }
      setSelectedGrade("");
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast.error("Failed to create schedule. Please try again.");
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

  const isCreating =
    createQuarterlyMutation.isPending || createMonthlyMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Create Installment Schedules
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Create quarterly or monthly installment schedules for grades in{" "}
          {activeYear.data.name}
        </p>
      </div>

      {/* Quick Create */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create Schedule for Grade
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Grade
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Choose a grade...</option>
              {grades.map((grade) => (
                <option key={grade.gradeId} value={grade.gradeId}>
                  {grade.grade}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Schedule will apply to all classes/sections in this grade
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Schedule Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="scheduleType"
                  value="quarterly"
                  checked={scheduleType === "quarterly"}
                  onChange={(e) => setScheduleType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Quarterly Schedule
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    4 installments per year (recommended)
                  </p>
                </div>
              </label>

              <label className="flex items-center p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="scheduleType"
                  value="monthly"
                  checked={scheduleType === "monthly"}
                  onChange={(e) => setScheduleType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Monthly Schedule
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    12 installments per year
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleCreateSchedule}
              disabled={!selectedGrade || isCreating}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5 mr-2" />
              {isCreating
                ? "Creating Schedule..."
                : `Create ${scheduleType === "quarterly" ? "Quarterly" : "Monthly"} Schedule`}
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              This will create a default {scheduleType} schedule with{" "}
              {scheduleType === "quarterly" ? "4" : "12"} installments
            </p>
          </div>
        </div>
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quarterly Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start">
            <FileText className="w-6 h-6 text-blue-600 mr-3 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Quarterly Schedule
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                Distributes fees across 4 installments:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>
                  • <strong>Q1 (July):</strong> One-time fees + 25% recurring
                </li>
                <li>
                  • <strong>Q2 (October):</strong> 25% of fees
                </li>
                <li>
                  • <strong>Q3 (January):</strong> 25% of fees
                </li>
                <li>
                  • <strong>Q4 (March):</strong> 25% of fees
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Monthly Info */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-start">
            <Calendar className="w-6 h-6 text-green-600 mr-3 mt-1" />
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Monthly Schedule
              </h4>
              <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                Distributes fees across 12 monthly installments:
              </p>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>
                  • <strong>April - March:</strong> 12 equal installments
                </li>
                <li>• One-time fees charged in first month</li>
                <li>• Easier for parents to manage payments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallmentSchedules;
