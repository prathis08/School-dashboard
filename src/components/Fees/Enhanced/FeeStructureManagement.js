import React, { useState } from "react";
import {
  Calendar,
  Plus,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  AlertCircle,
  Check,
  Settings,
  User,
} from "lucide-react";
import {
  useEnhancedAcademicYears,
  useCreateAcademicYear,
  useUpdateAcademicYear,
  useDeleteAcademicYear,
  useSetActiveAcademicYear,
  useEnhancedActiveYear,
} from "../../../hooks/useApiHooks";
import CreateFeeStructure from "./CreateFeeStructure";
import ViewFeeStructure from "./ViewFeeStructure";
import StudentIndividualFees from "./StudentIndividualFees";
import { useToast, useConfirm } from "../../../context/UIProvider";

const FeeStructureManagement = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState("view");
  const [showAcademicYearModal, setShowAcademicYearModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [editFeeStructure, setEditFeeStructure] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isActive: false,
  });

  // Academic Year hooks
  const { data: academicYears, isLoading: loadingYears } =
    useEnhancedAcademicYears();
  const { data: activeYearData } = useEnhancedActiveYear();
  const createMutation = useCreateAcademicYear();
  const updateMutation = useUpdateAcademicYear();
  const deleteMutation = useDeleteAcademicYear();
  const setActiveMutation = useSetActiveAcademicYear();

  const activeYear = activeYearData?.data;
  const years = academicYears?.data || [];

  const tabs = [
    {
      id: "view",
      name: "View Fee Structure",
      icon: Eye,
    },
    {
      id: "create",
      name: "Create Fee Structure",
      icon: Plus,
    },
    {
      id: "student-fees",
      name: "Student Individual Fees",
      icon: User,
    },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({ data: formData });
      setShowCreateForm(false);
      setFormData({ name: "", startDate: "", endDate: "", isActive: false });
    } catch (error) {
      console.error("Error creating academic year:", error);
    }
  };

  const handleEdit = (year) => {
    setEditingYear(year);
    setFormData({
      name: year.name,
      startDate: year.startDate.split("T")[0],
      endDate: year.endDate.split("T")[0],
      isActive: year.isActive,
    });
    setShowEditForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        academicYearId: editingYear.academicYearId,
        data: formData,
      });
      setShowEditForm(false);
      setEditingYear(null);
      setFormData({ name: "", startDate: "", endDate: "", isActive: false });
    } catch (error) {
      console.error("Error updating academic year:", error);
    }
  };

  const handleDelete = async (academicYearId) => {
    const ok = await confirm({
      title: "Delete academic year?",
      message: "Are you sure you want to delete this academic year?",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await deleteMutation.mutateAsync(academicYearId);
      toast.success("Academic year deleted");
    } catch (error) {
      console.error("Error deleting academic year:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete academic year",
      );
    }
  };

  const handleSetActive = async (academicYearId) => {
    try {
      await setActiveMutation.mutateAsync(academicYearId);
    } catch (error) {
      console.error("Error setting active academic year:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Academic Year Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fee Structure Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and view fee structures for grades
          </p>
        </div>
        <button
          onClick={() => setShowAcademicYearModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Settings className="w-4 h-4 mr-2" />
          Manage Academic Years
        </button>
      </div>

      {/* Active Academic Year Banner */}
      {activeYear && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">
                Active Academic Year: {activeYear.name}
              </span>
            </div>
            <span className="text-sm text-green-700">
              {new Date(activeYear.startDate).toLocaleDateString()} -{" "}
              {new Date(activeYear.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-0 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-gray-400 dark:hover:text-white"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "create" && (
          <CreateFeeStructure
            editData={editFeeStructure}
            onEditComplete={() => {
              setEditFeeStructure(null);
              setActiveTab("view");
            }}
          />
        )}
        {activeTab === "view" && (
          <ViewFeeStructure
            onEdit={(data) => {
              setEditFeeStructure(data);
              setActiveTab("create");
            }}
          />
        )}
        {activeTab === "student-fees" && <StudentIndividualFees />}
      </div>

      {/* Academic Year Modal */}
      {showAcademicYearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Academic Year Management
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Create and manage academic years for fee planning
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAcademicYearModal(false);
                  setShowCreateForm(false);
                  setShowEditForm(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Create Form */}
              {showCreateForm && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Create New Academic Year
                  </h4>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Academic Year Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., 2026-2027"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        id="isActiveCreate"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="isActiveCreate"
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        Set as active academic year
                      </label>
                    </div>
                    <div className="flex items-center justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setFormData({
                            name: "",
                            startDate: "",
                            endDate: "",
                            isActive: false,
                          });
                        }}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {createMutation.isPending ? "Creating..." : "Create"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Edit Form */}
              {showEditForm && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Edit Academic Year
                  </h4>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Academic Year Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditForm(false);
                          setEditingYear(null);
                          setFormData({
                            name: "",
                            startDate: "",
                            endDate: "",
                            isActive: false,
                          });
                        }}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {updateMutation.isPending ? "Updating..." : "Update"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Create Button */}
              {!showCreateForm && !showEditForm && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Academic Year
                  </button>
                </div>
              )}

              {/* Academic Years List */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Academic Years ({years.length})
                </h4>

                {loadingYears ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : years.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No academic years created yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {years.map((year) => (
                      <div
                        key={year.academicYearId}
                        className={`p-4 rounded-lg border ${
                          year.isActive
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                            : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Calendar
                              className={`w-5 h-5 ${
                                year.isActive
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {year.name}
                                </span>
                                {year.isActive && (
                                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs font-medium rounded-full">
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(year.startDate).toLocaleDateString()}{" "}
                                - {new Date(year.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {!year.isActive && (
                              <button
                                onClick={() =>
                                  handleSetActive(year.academicYearId)
                                }
                                disabled={setActiveMutation.isPending}
                                className="flex items-center text-sm text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Set Active
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(year)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {!year.isActive && (
                              <button
                                onClick={() =>
                                  handleDelete(year.academicYearId)
                                }
                                disabled={deleteMutation.isPending}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={() => {
                  setShowAcademicYearModal(false);
                  setShowCreateForm(false);
                  setShowEditForm(false);
                }}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeStructureManagement;
