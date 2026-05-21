import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  CheckCircle,
  AlertCircle,
  IndianRupee,
} from "lucide-react";
import {
  useEnhancedActiveYear,
  useEnhancedFeeTypes,
  useGradesAndClasses,
  useEnhancedClassFees,
  useCreateClassFees,
} from "../../../hooks/useApiHooks";

const ClassFeeStructure = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFees, setSelectedFees] = useState({});

  const { data: activeYear } = useEnhancedActiveYear();
  const { data: feeTypes } = useEnhancedFeeTypes();
  const { data: gradesAndClasses } = useGradesAndClasses();
  const createMutation = useCreateClassFees();

  const activeYearId = activeYear?.data?.academicYearId;
  const types = feeTypes?.data || [];
  const classes = gradesAndClasses?.data?.grades || [];

  const { data: classFees, isLoading } = useEnhancedClassFees(
    activeYearId,
    selectedClass,
  );

  const handleFeeToggle = (feeTypeId, annualAmount, isMandatory) => {
    setSelectedFees((prev) => {
      if (prev[feeTypeId]) {
        const newFees = { ...prev };
        delete newFees[feeTypeId];
        return newFees;
      }
      return {
        ...prev,
        [feeTypeId]: { annualAmount, isMandatory },
      };
    });
  };

  const handleAmountChange = (feeTypeId, amount) => {
    setSelectedFees((prev) => ({
      ...prev,
      [feeTypeId]: {
        ...prev[feeTypeId],
        annualAmount: parseFloat(amount) || 0,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const feeStructure = Object.entries(selectedFees).map(
        ([feeTypeId, data]) => ({
          feeTypeId,
          annualAmount: data.annualAmount,
          isMandatory: data.isMandatory,
        }),
      );

      await createMutation.mutateAsync({
        data: {
          academicYearId: activeYearId,
          classId: selectedClass,
          feeStructure,
        },
      });

      setShowCreateModal(false);
      setSelectedFees({});
    } catch (error) {
      console.error("Error creating class fee structure:", error);
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
          Please create and activate an academic year before setting up class
          fees.
        </p>
      </div>
    );
  }

  const allClasses = classes.flatMap((grade) =>
    grade.classes.map((cls) => ({
      ...cls,
      gradeName: grade.grade,
    })),
  );

  const existingStructure = classFees?.data?.feeStructure || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Class Fee Structure
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Assign fee types and amounts to classes for {activeYear.data.name}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={!selectedClass}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Setup Fee Structure
          </button>
        </div>
      </div>

      {/* Class Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Class
        </label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Choose a class...</option>
          {allClasses.map((cls) => (
            <option key={cls.classId} value={cls.classId}>
              {cls.gradeName} - Section {cls.section}
            </option>
          ))}
        </select>
      </div>

      {/* Existing Fee Structure */}
      {selectedClass && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Fee Structure
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : existingStructure.length > 0 ? (
            <div className="space-y-3">
              {existingStructure.map((fee) => (
                <div
                  key={fee.feeTypeId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <IndianRupee className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {fee.name}
                      </p>
                      {fee.isMandatory && (
                        <span className="text-xs text-red-600">Mandatory</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{fee.annualAmount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      Annual
                    </p>
                  </div>
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Annual Fee:
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    ₹
                    {existingStructure
                      .reduce((sum, fee) => sum + (fee.annualAmount || 0), 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                No fee structure defined for this class yet
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Setup Fee Structure
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Setup Fee Structure
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Select fee types and set annual amounts for the selected class
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-3 mb-6">
                {types.map((feeType) => {
                  const isSelected = !!selectedFees[feeType.feeTypeId];
                  return (
                    <div
                      key={feeType.feeTypeId}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start flex-1">
                          <input
                            type="checkbox"
                            id={`fee-${feeType.feeTypeId}`}
                            checked={isSelected}
                            onChange={() =>
                              handleFeeToggle(
                                feeType.feeTypeId,
                                feeType.annualAmount,
                                feeType.isMandatory,
                              )
                            }
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`fee-${feeType.feeTypeId}`}
                            className="ml-3 flex-1 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {feeType.name}
                                </p>
                                {feeType.description && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                    {feeType.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  {feeType.isMandatory && (
                                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                                      Mandatory
                                    </span>
                                  )}
                                  {feeType.isOneTime && (
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                      One-Time
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </label>
                        </div>

                        {isSelected && (
                          <div className="ml-4">
                            <input
                              type="number"
                              value={
                                selectedFees[feeType.feeTypeId]?.annualAmount ||
                                ""
                              }
                              onChange={(e) =>
                                handleAmountChange(
                                  feeType.feeTypeId,
                                  e.target.value,
                                )
                              }
                              placeholder="Amount"
                              className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-right"
                              min="0"
                              step="100"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                    {Object.keys(selectedFees).length} fee types selected
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    Total: ₹
                    {Object.values(selectedFees)
                      .reduce((sum, fee) => sum + (fee.annualAmount || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedFees({});
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createMutation.isPending ||
                      Object.keys(selectedFees).length === 0
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createMutation.isPending ? "Saving..." : "Save Structure"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassFeeStructure;
