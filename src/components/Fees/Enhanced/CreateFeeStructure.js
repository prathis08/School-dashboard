import React, { useState, useEffect } from "react";
import {
  Plus,
  Layers,
  IndianRupee,
  Calendar,
  Check,
  ChevronRight,
  AlertCircle,
  Trash2,
  X,
} from "lucide-react";
import {
  useEnhancedFeeTypes,
  useCreateFeeType,
  useCreateGradeFeeStructure,
  useGetSchedulesByGrade,
  useEnhancedActiveYear,
  useGradesOptions,
  useCreateQuarterlyScheduleForGrade,
  useCreateMonthlyScheduleForGrade,
  useDeleteGradeFeeStructure,
} from "../../../hooks/useApiHooks";
import { useToast } from "../../../context/UIProvider";

const CreateFeeStructure = ({ editData, onEditComplete }) => {
  const toast = useToast();
  const isEditMode = !!editData;
  const [currentStep, setCurrentStep] = useState(isEditMode ? 2 : 1);
  const [selectedFeeTypes, setSelectedFeeTypes] = useState([]);
  const [gradeId, setGradeId] = useState("");
  const [feeAmounts, setFeeAmounts] = useState({});
  const [scheduleType, setScheduleType] = useState("quarterly");
  const [showFeeTypeModal, setShowFeeTypeModal] = useState(false);
  const [newFeeType, setNewFeeType] = useState({
    name: "",
    description: "",
    isMandatory: true,
    isOneTime: false,
  });

  const { data: feeTypesData, isLoading: loadingFeeTypes } =
    useEnhancedFeeTypes();
  const { data: activeYearData } = useEnhancedActiveYear();
  const { data: gradesData, isLoading: loadingGrades } = useGradesOptions();
  const { data: schedulesData, isLoading: loadingSchedules } =
    useGetSchedulesByGrade(activeYearData?.data?.academicYearId, gradeId, {
      enabled: !!activeYearData?.data?.academicYearId && !!gradeId,
    });
  const createFeeType = useCreateFeeType();
  const createGradeFeeStructure = useCreateGradeFeeStructure();
  const createQuarterlyMutation = useCreateQuarterlyScheduleForGrade();
  const createMonthlyMutation = useCreateMonthlyScheduleForGrade();
  const deleteGradeFeeStructure = useDeleteGradeFeeStructure();

  const feeTypes = feeTypesData?.data || [];
  const activeYear = activeYearData?.data;
  const schedules = schedulesData?.data || [];
  const grades = gradesData?.data || [];

  // Initialize form when editing
  useEffect(() => {
    if (editData && feeTypes.length > 0) {
      setGradeId(editData.gradeId);

      // Extract fee type IDs and amounts from existing structure
      const existingFeeTypeIds = editData.feeStructure.map(
        (fee) => fee.feeTypeId,
      );
      setSelectedFeeTypes(existingFeeTypeIds);

      const amounts = {};
      editData.feeStructure.forEach((fee) => {
        amounts[fee.feeTypeId] = parseFloat(fee.annualAmount) || 0;
      });
      setFeeAmounts(amounts);

      // Set step to 2 (Fee Structure) for editing
      setCurrentStep(2);
    }
  }, [editData, feeTypes.length]);

  const PREDEFINED_FEE_TYPES = [
    {
      name: "Tuition Fee",
      description: "Regular tuition charges",
      isMandatory: true,
      isOneTime: false,
    },
    {
      name: "Admission Fee",
      description: "One-time admission charges",
      isMandatory: true,
      isOneTime: true,
    },
    {
      name: "Examination Fee",
      description: "Charges for examinations",
      isMandatory: true,
      isOneTime: false,
    },
    {
      name: "Library Fee",
      description: "Library access and maintenance",
      isMandatory: false,
      isOneTime: false,
    },
    {
      name: "Sports Fee",
      description: "Sports facilities and activities",
      isMandatory: false,
      isOneTime: false,
    },
    {
      name: "Laboratory Fee",
      description: "Lab equipment and materials",
      isMandatory: false,
      isOneTime: false,
    },
    {
      name: "Transport Fee",
      description: "School transportation",
      isMandatory: false,
      isOneTime: false,
    },
    {
      name: "Uniform Fee",
      description: "School uniform charges",
      isMandatory: false,
      isOneTime: true,
    },
    {
      name: "Activity Fee",
      description: "Extra-curricular activities",
      isMandatory: false,
      isOneTime: false,
    },
    {
      name: "Computer Fee",
      description: "Computer lab and IT infrastructure",
      isMandatory: false,
      isOneTime: false,
    },
    {
      name: "Annual Charges",
      description: "Annual miscellaneous charges",
      isMandatory: true,
      isOneTime: true,
    },
    {
      name: "Development Fee",
      description: "Infrastructure development",
      isMandatory: false,
      isOneTime: true,
    },
    {
      name: "Hostel Fee",
      description: "Hostel accommodation",
      isMandatory: false,
      isOneTime: false,
    },
    {
      name: "Medical Fee",
      description: "Medical facilities and checkups",
      isMandatory: false,
      isOneTime: false,
    },
    {
      name: "Caution Deposit",
      description: "Refundable security deposit",
      isMandatory: false,
      isOneTime: true,
    },
  ];

  const handleCreateFeeType = async (feeTypeData) => {
    try {
      await createFeeType.mutateAsync({ data: feeTypeData });
      setShowFeeTypeModal(false);
      setNewFeeType({
        name: "",
        description: "",
        isMandatory: true,
        isOneTime: false,
      });
    } catch (error) {
      console.error("Error creating fee type:", error);
    }
  };

  const handleQuickCreateFeeType = async (predefinedType) => {
    await handleCreateFeeType(predefinedType);
  };

  const handleFeeTypeToggle = (feeTypeId) => {
    setSelectedFeeTypes((prev) =>
      prev.includes(feeTypeId)
        ? prev.filter((id) => id !== feeTypeId)
        : [...prev, feeTypeId],
    );
  };

  const handleAmountChange = (feeTypeId, amount) => {
    setFeeAmounts((prev) => ({
      ...prev,
      [feeTypeId]: parseFloat(amount) || 0,
    }));
  };

  const getTotalAmount = () => {
    return Object.values(feeAmounts).reduce((sum, amount) => sum + amount, 0);
  };

  const handleCreateStructure = async () => {
    if (!activeYear || !gradeId || selectedFeeTypes.length === 0) {
      toast.warning("Please fill all required fields");
      return;
    }

    try {
      // If editing, delete the old structure first
      if (isEditMode && editData) {
        await deleteGradeFeeStructure.mutateAsync({
          academicYearId: editData.academicYearId,
          gradeId: editData.gradeId,
        });
      }

      // Create grade fee structure
      const feeStructures = selectedFeeTypes.map((feeTypeId) => ({
        feeTypeId,
        amount: feeAmounts[feeTypeId] || 0,
      }));

      await createGradeFeeStructure.mutateAsync({
        data: {
          academicYearId: activeYear.academicYearId,
          gradeId,
          feeStructure: feeStructures,
        },
      });

      // Create installment schedule only if not editing (or if no schedules exist)
      const hasExistingSchedules =
        isEditMode && editData?.schedules?.length > 0;
      if (!hasExistingSchedules) {
        if (scheduleType === "quarterly") {
          await createQuarterlyMutation.mutateAsync({
            academicYearId: activeYear.academicYearId,
            gradeId,
          });
        } else {
          await createMonthlyMutation.mutateAsync({
            academicYearId: activeYear.academicYearId,
            gradeId,
          });
        }
      }

      toast.success(
        isEditMode
          ? "Fee structure updated successfully!"
          : "Fee structure and installment schedule created successfully!",
      );

      // Reset form
      setCurrentStep(1);
      setSelectedFeeTypes([]);
      setGradeId("");
      setFeeAmounts({});
      setScheduleType("quarterly");

      // Call onEditComplete callback if in edit mode
      if (isEditMode && onEditComplete) {
        onEditComplete();
      }
    } catch (error) {
      console.error("Error creating/updating fee structure:", error);
      toast.error(
        isEditMode
          ? "Error updating fee structure. Please try again."
          : "Error creating fee structure. Please try again.",
      );
    }
  };

  const steps = [
    {
      number: 1,
      title: "Fee Types",
      description: "Select or create fee types",
    },
    { number: 2, title: "Fee Structure", description: "Assign fees to grade" },
    {
      number: 3,
      title: "Installments",
      description: "Create payment schedule",
    },
    { number: 4, title: "Review", description: "Review and create" },
  ];

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.number
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{step.title}</div>
                  <div className="text-sm text-gray-500">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0 mx-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Select or Create Fee Types
            </h3>
            <button
              onClick={() => setShowFeeTypeModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Custom Fee Type</span>
            </button>
          </div>

          {/* Quick Create Templates */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Quick Create Templates
            </h4>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_FEE_TYPES.map((type) => (
                <button
                  key={type.name}
                  onClick={() => handleQuickCreateFeeType(type)}
                  disabled={
                    createFeeType.isPending ||
                    feeTypes.some((ft) => ft.name === type.name)
                  }
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Existing Fee Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Available Fee Types
            </h4>
            {loadingFeeTypes ? (
              <div className="text-center py-8 text-gray-500">
                Loading fee types...
              </div>
            ) : feeTypes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No fee types available. Create one to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feeTypes.map((feeType) => (
                  <div
                    key={feeType.feeTypeId}
                    onClick={() => handleFeeTypeToggle(feeType.feeTypeId)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedFeeTypes.includes(feeType.feeTypeId)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Layers className="w-5 h-5 text-blue-600" />
                        <h5 className="font-semibold text-gray-900">
                          {feeType.name}
                        </h5>
                      </div>
                      {selectedFeeTypes.includes(feeType.feeTypeId) && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {feeType.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {feeType.isMandatory && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Mandatory
                        </span>
                      )}
                      {feeType.isOneTime && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          One-Time
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={selectedFeeTypes.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Fee Structure
            </button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {isEditMode
              ? "Edit Fee Structure"
              : "Assign Fee Structure to Grade"}
          </h3>

          <div className="space-y-6">
            {/* Grade Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Grade <span className="text-red-500">*</span>
              </label>
              {loadingGrades ? (
                <div className="text-sm text-gray-500">Loading grades...</div>
              ) : (
                <select
                  value={gradeId}
                  onChange={(e) => setGradeId(e.target.value)}
                  disabled={isEditMode}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                  <option value="">Choose a grade</option>
                  {grades.map((grade) => (
                    <option key={grade.gradeId} value={grade.gradeId}>
                      {grade.grade}
                    </option>
                  ))}
                </select>
              )}
              {isEditMode && (
                <p className="text-sm text-gray-500 mt-1">
                  Grade cannot be changed when editing. Delete and create a new
                  structure for a different grade.
                </p>
              )}
            </div>

            {/* Fee Types Selection - Available in Edit Mode */}
            {gradeId && isEditMode && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add/Remove Fee Types
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-3">
                    Click on fee types below to add them to the structure
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {feeTypes
                      .filter((ft) => !selectedFeeTypes.includes(ft.feeTypeId))
                      .map((feeType) => (
                        <button
                          key={feeType.feeTypeId}
                          onClick={() => handleFeeTypeToggle(feeType.feeTypeId)}
                          className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">
                            {feeType.name}
                          </span>
                        </button>
                      ))}
                    {feeTypes.filter(
                      (ft) => !selectedFeeTypes.includes(ft.feeTypeId),
                    ).length === 0 && (
                      <p className="text-sm text-gray-500 italic">
                        All fee types are already added
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Fee Amounts */}
            {gradeId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {isEditMode
                    ? "Selected Fee Types & Amounts"
                    : "Set Fee Amounts"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                {selectedFeeTypes.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      No fee types selected. Add fee types from above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedFeeTypes.map((feeTypeId) => {
                      const feeType = feeTypes.find(
                        (ft) => ft.feeTypeId === feeTypeId,
                      );
                      if (!feeType) return null;

                      return (
                        <div
                          key={feeTypeId}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {feeType.name}
                              </span>
                              {feeType.isMandatory && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  Mandatory
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {feeType.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3 ml-4">
                            <div className="flex items-center space-x-2">
                              <IndianRupee className="w-4 h-4 text-gray-400" />
                              <input
                                type="number"
                                value={feeAmounts[feeTypeId] || ""}
                                onChange={(e) =>
                                  handleAmountChange(feeTypeId, e.target.value)
                                }
                                placeholder="0.00"
                                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            {isEditMode && (
                              <button
                                onClick={() => handleFeeTypeToggle(feeTypeId)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove fee type"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Total Amount */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      Total Fee Amount
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{getTotalAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
            {isEditMode ? (
              <button
                onClick={() => {
                  if (onEditComplete) onEditComplete();
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel Edit
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Back
              </button>
            )}
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!gradeId || getTotalAmount() === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Create Schedule
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Create Installment Schedule */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Create Installment Schedule
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Choose how fees will be split into installments for{" "}
            {grades.find((g) => g.gradeId === gradeId)?.grade ||
              "selected grade"}
          </p>

          <div className="space-y-4">
            {/* Schedule Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Schedule Type <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="scheduleType"
                    value="quarterly"
                    checked={scheduleType === "quarterly"}
                    onChange={(e) => setScheduleType(e.target.value)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">
                      Quarterly Schedule
                    </p>
                    <p className="text-sm text-gray-500">
                      4 installments per year - Q1 (Jul-Sep), Q2 (Oct-Dec), Q3
                      (Jan-Mar), Q4 (Apr-Jun)
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      Each installment: ₹{(getTotalAmount() / 4).toFixed(2)}
                    </p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="scheduleType"
                    value="monthly"
                    checked={scheduleType === "monthly"}
                    onChange={(e) => setScheduleType(e.target.value)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">
                      Monthly Schedule
                    </p>
                    <p className="text-sm text-gray-500">
                      12 installments per year - One payment due each month
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      Each installment: ₹{(getTotalAmount() / 12).toFixed(2)}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Schedule Summary */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">
                    {scheduleType === "quarterly" ? "Quarterly" : "Monthly"}{" "}
                    Payment Plan
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Total: ₹{getTotalAmount().toFixed(2)} split into{" "}
                    {scheduleType === "quarterly"
                      ? "4 quarterly"
                      : "12 monthly"}{" "}
                    payments
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next: Review
            </button>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Review Fee Structure
          </h3>

          <div className="space-y-6">
            {/* Academic Year */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Academic Year</div>
              <div className="font-semibold text-gray-900">
                {activeYear?.name}
              </div>
            </div>

            {/* Grade */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Grade</div>
              <div className="font-semibold text-gray-900">
                {(
                  grades.find((g) => g.gradeId === gradeId)?.grade || "Unknown"
                ).replace(/^Grade\s+/i, "")}
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-3">Fee Breakdown</div>
              <div className="space-y-2">
                {selectedFeeTypes.map((feeTypeId) => {
                  const feeType = feeTypes.find(
                    (ft) => ft.feeTypeId === feeTypeId,
                  );
                  if (!feeType) return null;

                  return (
                    <div
                      key={feeTypeId}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-900">{feeType.name}</span>
                      <span className="font-medium text-gray-900">
                        ₹{feeAmounts[feeTypeId]?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-gray-300 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-blue-600">
                    ₹{getTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Installment Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900 mb-1">
                    Installment Schedule
                  </div>
                  <div className="text-sm text-blue-700">
                    • {scheduleType === "quarterly" ? "Quarterly" : "Monthly"}{" "}
                    Schedule with {scheduleType === "quarterly" ? "4" : "12"}{" "}
                    installments
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    • Each installment: ₹
                    {(
                      getTotalAmount() / (scheduleType === "quarterly" ? 4 : 12)
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Back
            </button>
            <button
              onClick={handleCreateStructure}
              disabled={
                createGradeFeeStructure.isPending ||
                createQuarterlyMutation.isPending ||
                createMonthlyMutation.isPending ||
                deleteGradeFeeStructure.isPending
              }
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {createGradeFeeStructure.isPending ||
              createQuarterlyMutation.isPending ||
              createMonthlyMutation.isPending ||
              deleteGradeFeeStructure.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isEditMode ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>
                    {isEditMode
                      ? "Update Fee Structure"
                      : "Create Fee Structure"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Custom Fee Type Modal */}
      {showFeeTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create Custom Fee Type
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFeeType.name}
                  onChange={(e) =>
                    setNewFeeType({ ...newFeeType, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Field Trip Fee"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newFeeType.description}
                  onChange={(e) =>
                    setNewFeeType({
                      ...newFeeType,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe this fee type..."
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newFeeType.isMandatory}
                    onChange={(e) =>
                      setNewFeeType({
                        ...newFeeType,
                        isMandatory: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Mandatory</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newFeeType.isOneTime}
                    onChange={(e) =>
                      setNewFeeType({
                        ...newFeeType,
                        isOneTime: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">One-Time</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowFeeTypeModal(false);
                  setNewFeeType({
                    name: "",
                    description: "",
                    isMandatory: true,
                    isOneTime: false,
                  });
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateFeeType(newFeeType)}
                disabled={!newFeeType.name || createFeeType.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createFeeType.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateFeeStructure;
