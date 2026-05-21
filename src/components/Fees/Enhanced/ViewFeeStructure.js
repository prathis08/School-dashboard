import React, { useState, useMemo } from "react";
import {
  IndianRupee,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
} from "lucide-react";
import {
  useGetGradeFeeStructure,
  useDeleteGradeFeeStructure,
  useEnhancedActiveYear,
  useGetSchedulesByGrade,
  useGradesOptions,
  useEnhancedFeeTypes,
} from "../../../hooks/useApiHooks";
import { useToast, useConfirm } from "../../../context/UIProvider";

const ViewFeeStructure = ({ onEdit }) => {
  const toast = useToast();
  const confirm = useConfirm();
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [expandedSchedule, setExpandedSchedule] = useState(null);

  const { data: activeYearData } = useEnhancedActiveYear();
  const { data: gradesData, isLoading: loadingGrades } = useGradesOptions();
  const { data: feeTypesData } = useEnhancedFeeTypes();
  const { data: gradeFeeData, isLoading } = useGetGradeFeeStructure(
    activeYearData?.data?.academicYearId,
    selectedGradeId,
    { enabled: !!activeYearData?.data?.academicYearId && !!selectedGradeId },
  );
  const { data: schedulesData } = useGetSchedulesByGrade(
    activeYearData?.data?.academicYearId,
    selectedGradeId,
    { enabled: !!activeYearData?.data?.academicYearId && !!selectedGradeId },
  );
  const deleteGradeFeeStructure = useDeleteGradeFeeStructure();

  const activeYear = activeYearData?.data;
  const gradeFees = gradeFeeData?.data;
  const schedules = schedulesData?.data || [];
  const grades = gradesData?.data || [];
  const feeTypes = feeTypesData?.data || [];

  // Helper to get fee type name by ID (supports both UUID id and custom feeTypeId)
  const getFeeTypeName = useMemo(() => {
    const feeTypeMap = new Map();
    feeTypes.forEach((ft) => {
      if (ft.id) feeTypeMap.set(ft.id, ft);
      if (ft.feeTypeId) feeTypeMap.set(ft.feeTypeId, ft);
    });
    return (feeTypeId) => feeTypeMap.get(feeTypeId);
  }, [feeTypes]);

  // Helper to get grade name by gradeId
  const getGradeName = useMemo(() => {
    const gradeMap = new Map();
    grades.forEach((g) => {
      if (g.gradeId) gradeMap.set(g.gradeId, g.grade);
    });
    return (gradeId) => gradeMap.get(gradeId) || gradeId;
  }, [grades]);

  // Helper to format schedule name with actual grade name
  const formatScheduleName = (scheduleName) => {
    // Replace "Grade GRADE123..." patterns with actual grade name
    const gradeIdMatch = scheduleName?.match(/Grade[_ ]?(GRADE[_\d]+)/);
    if (gradeIdMatch) {
      const gradeId = gradeIdMatch[1];
      const gradeName = getGradeName(gradeId);
      return scheduleName.replace(gradeIdMatch[0], gradeName);
    }
    return scheduleName;
  };

  const getTotalFee = (feeStructures) => {
    if (!feeStructures || feeStructures.length === 0) return 0;
    return feeStructures.reduce(
      (sum, fee) => sum + (parseFloat(fee.annualAmount) || 0),
      0,
    );
  };

  const handleDeleteStructure = async () => {
    const ok = await confirm({
      title: "Delete fee structure?",
      message:
        "Are you sure you want to delete this fee structure? This will affect all classes in the grade.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;

    try {
      await deleteGradeFeeStructure.mutateAsync({
        academicYearId: activeYear.academicYearId,
        gradeId: selectedGradeId,
      });
      toast.success("Fee structure deleted successfully");
    } catch (error) {
      console.error("Error deleting fee structure:", error);
      toast.error("Error deleting fee structure. Please try again.");
    }
  };

  const handleEditStructure = () => {
    if (onEdit && gradeFees && activeYear) {
      onEdit({
        gradeId: selectedGradeId,
        academicYearId: activeYear.academicYearId,
        feeStructure: gradeFees,
        schedules: schedules,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Grade Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Grade to View Fee Structure
        </label>
        {loadingGrades ? (
          <div className="text-sm text-gray-500">Loading grades...</div>
        ) : (
          <select
            value={selectedGradeId}
            onChange={(e) => setSelectedGradeId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a grade</option>
            {grades.map((grade) => (
              <option key={grade.gradeId} value={grade.gradeId}>
                {grade.grade}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Fee Structure Display */}
      {selectedGradeId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-4">Loading fee structure...</p>
            </div>
          ) : !gradeFees || gradeFees.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                No fee structure found
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Create a fee structure for this grade to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header with Edit and Delete Buttons */}
              <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {grades.find((g) => g.gradeId === selectedGradeId)?.grade ||
                      "Unknown Grade"}{" "}
                    Fee Structure
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Academic Year: {activeYear?.name}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleEditStructure}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Structure</span>
                  </button>
                  <button
                    onClick={handleDeleteStructure}
                    disabled={deleteGradeFeeStructure.isPending}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteGradeFeeStructure.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Structure</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Total Fee Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Total Annual Fee
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      ₹{getTotalFee(gradeFees).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {gradeFees.length} fee types included
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">
                  Fee Breakdown
                </h4>
                <div className="space-y-3">
                  {gradeFees.map((fee, feeIndex) => {
                    const feeTypeInfo =
                      fee.feeType || getFeeTypeName(fee.feeTypeId);
                    return (
                      <div
                        key={feeIndex}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <IndianRupee className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {feeTypeInfo?.name || "Unknown Fee"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {feeTypeInfo?.description}
                            </div>
                            <div className="flex space-x-2 mt-1">
                              {feeTypeInfo?.isMandatory && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  Mandatory
                                </span>
                              )}
                              {feeTypeInfo?.isOneTime && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                  One-Time
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ₹{parseFloat(fee.annualAmount || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Installment Schedules */}
              {schedules.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Installment Schedules ({schedules.length})
                  </h4>
                  <div className="space-y-4">
                    {schedules.map((schedule, idx) => {
                      const isExpanded = expandedSchedule === idx;
                      return (
                        <div
                          key={idx}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          {/* Schedule Header */}
                          <div
                            className="bg-blue-50 p-4 cursor-pointer flex items-center justify-between"
                            onClick={() =>
                              setExpandedSchedule(isExpanded ? null : idx)
                            }
                          >
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {formatScheduleName(schedule.name)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {schedule.installments?.length} installments
                                </div>
                              </div>
                            </div>
                            <div>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Schedule Details */}
                          {isExpanded && (
                            <div className="p-4 bg-white">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {schedule.installments?.map((installment) => (
                                  <div
                                    key={installment.id}
                                    className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                                  >
                                    <div className="font-medium text-gray-900 mb-2">
                                      {installment.name}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-3">
                                      Due:{" "}
                                      {new Date(
                                        installment.dueDate,
                                      ).toLocaleDateString()}
                                    </div>
                                    {installment.feeMappings &&
                                      installment.feeMappings.length > 0 && (
                                        <div className="space-y-1">
                                          <div className="text-xs font-medium text-gray-700 mb-1">
                                            Fee Distribution:
                                          </div>
                                          {installment.feeMappings.map(
                                            (mapping, mapIdx) => {
                                              const mappingFeeType =
                                                mapping.feeType ||
                                                getFeeTypeName(
                                                  mapping.feeTypeId,
                                                );
                                              return (
                                                <div
                                                  key={mapIdx}
                                                  className="text-xs text-gray-600 flex justify-between"
                                                >
                                                  <span>
                                                    {mappingFeeType?.name ||
                                                      "Unknown"}
                                                  </span>
                                                  <span className="font-medium">
                                                    {mapping.percentage}%
                                                  </span>
                                                </div>
                                              );
                                            },
                                          )}
                                        </div>
                                      )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!selectedGradeId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Grade
          </h3>
          <p className="text-gray-600">
            Choose a grade from the dropdown to view its fee structure
          </p>
        </div>
      )}
    </div>
  );
};

export default ViewFeeStructure;
