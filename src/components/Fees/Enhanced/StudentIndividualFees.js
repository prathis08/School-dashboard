import React, { useState, useEffect } from "react";
import {
  User,
  IndianRupee,
  Calendar,
  Search,
  Plus,
  AlertCircle,
  Check,
  X,
  Trash2,
  Edit2,
  Filter,
  Loader2,
} from "lucide-react";
import {
  useIndividualFees,
  useCreateIndividualFee,
  useUpdateIndividualFee,
  useDeleteIndividualFee,
  useEnhancedActiveYear,
  useEnhancedFeeTypes,
  useGradesOptions,
  useSearchStudents,
} from "../../../hooks/useApiHooks";
import { useToast, useConfirm } from "../../../context/UIProvider";

const StudentIndividualFees = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: "",
    feeTypeId: "",
    amount: "",
    description: "",
    dueDate: "",
  });

  // Debounce search query - only update after 300ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3) {
        setDebouncedQuery(searchQuery);
      } else {
        setDebouncedQuery("");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: activeYearData } = useEnhancedActiveYear();
  const { data: feeTypesData } = useEnhancedFeeTypes();
  const { data: gradesData } = useGradesOptions();
  const { data: searchResults, isLoading: isSearching } =
    useSearchStudents(debouncedQuery);
  const { data: individualFeesData, isLoading } = useIndividualFees({
    academicYearId: activeYearData?.data?.academicYearId,
    status: filterStatus || undefined,
    gradeId: filterGrade || undefined,
  });

  const createMutation = useCreateIndividualFee();
  const updateMutation = useUpdateIndividualFee();
  const deleteMutation = useDeleteIndividualFee();

  const activeYear = activeYearData?.data;
  const feeTypes = feeTypesData?.data || [];
  const grades = gradesData?.data || [];
  const filteredStudents = Array.isArray(searchResults?.data)
    ? searchResults.data.slice(0, 10)
    : searchResults?.data?.data?.slice(0, 10) || [];
  const individualFees = individualFeesData?.data || [];

  // Get fee type name helper
  const getFeeTypeName = (feeTypeId) => {
    const ft = feeTypes.find((f) => f.feeTypeId === feeTypeId);
    return ft?.name || "Unknown";
  };

  // Status badge colors
  const getStatusBadge = (status) => {
    const badges = {
      PENDING: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
      PAID: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
      WAIVED: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
      CANCELLED: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100",
    };
    return badges[status] || badges.PENDING;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (
      !selectedStudent ||
      !formData.feeTypeId ||
      !formData.amount ||
      !formData.dueDate
    ) {
      toast.warning("Please fill all required fields");
      return;
    }

    try {
      await createMutation.mutateAsync({
        studentId: selectedStudent.studentId,
        academicYearId: activeYear.academicYearId,
        feeTypeId: formData.feeTypeId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        dueDate: formData.dueDate,
      });
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error("Error creating fee:", error);
      toast.error("Error creating fee. Please try again.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        individualFeeId: editingFee.individualFeeId,
        data: {
          amount: parseFloat(formData.amount),
          description: formData.description,
          dueDate: formData.dueDate,
        },
      });
      setEditingFee(null);
      resetForm();
    } catch (error) {
      console.error("Error updating fee:", error);
      toast.error("Error updating fee. Please try again.");
    }
  };

  const handleStatusChange = async (fee, newStatus, waiverReason = null) => {
    try {
      await updateMutation.mutateAsync({
        individualFeeId: fee.individualFeeId,
        data: { status: newStatus, waiverReason },
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status. Please try again.");
    }
  };

  const handleDelete = async (fee) => {
    const ok = await confirm({
      title: "Delete fee?",
      message: "Are you sure you want to cancel/delete this fee?",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await deleteMutation.mutateAsync(fee.individualFeeId);
      toast.success("Fee deleted");
    } catch (error) {
      console.error("Error deleting fee:", error);
      toast.error("Error deleting fee. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: "",
      feeTypeId: "",
      amount: "",
      description: "",
      dueDate: "",
    });
    setSelectedStudent(null);
    setSearchQuery("");
  };

  const openEditModal = (fee) => {
    setEditingFee(fee);
    setFormData({
      feeTypeId: fee.feeTypeId,
      amount: fee.amount,
      description: fee.description || "",
      dueDate: fee.dueDate,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Individual Student Fees
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Assign fines, punishment fees, or special charges to individual
            students
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Individual Fee</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Filters:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="WAIVED">Waived</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="">All Grades</option>
            {grades.map((grade) => (
              <option key={grade.gradeId} value={grade.gradeId}>
                {grade.grade}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fees List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Loading fees...</p>
          </div>
        ) : individualFees.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              No individual fees found
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Add a fee to a student to see it here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Fee Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {individualFees.map((fee) => (
                  <tr key={fee.individualFeeId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {fee.student?.firstName} {fee.student?.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {fee.student?.class?.className ||
                              fee.student?.gradeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {fee.feeType?.name || getFeeTypeName(fee.feeTypeId)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      ₹{parseFloat(fee.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                          fee.status,
                        )}`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {fee.description || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-2">
                        {fee.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(fee, "PAID")}
                              className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                              title="Mark as Paid"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("Enter waiver reason:");
                                if (reason)
                                  handleStatusChange(fee, "WAIVED", reason);
                              }}
                              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                              title="Waive Fee"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(fee)}
                              className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(fee)}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingFee) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingFee ? "Edit Individual Fee" : "Add Individual Fee"}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingFee(null);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingFee ? handleUpdate : handleCreate}>
              <div className="space-y-4">
                {/* Student Selection (only for create) */}
                {!editingFee && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Select Student <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                        {isSearching ? (
                          <Loader2 className="w-4 h-4 text-blue-500 dark:text-blue-400 ml-3 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-3" />
                        )}
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedStudent(null);
                          }}
                          placeholder="Search by name or ID (min 3 chars)..."
                          className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                        />
                      </div>
                      {/* Search Results Dropdown */}
                      {searchQuery && !selectedStudent && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {searchQuery.length < 3 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                              Type at least 3 characters to search
                            </div>
                          ) : isSearching ? (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center flex items-center justify-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Searching...</span>
                            </div>
                          ) : filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                              <button
                                key={student.studentId}
                                type="button"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setSearchQuery(
                                    `${student.firstName} ${student.lastName}`,
                                  );
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3"
                              >
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {student.admissionNumber ||
                                      student.studentId}{" "}
                                    •{" "}
                                    {student.class?.className ||
                                      `Grade ${student.gradeId}`}
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                              No students found for "{searchQuery}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {selectedStudent && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {selectedStudent.firstName}{" "}
                              {selectedStudent.lastName}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                              {selectedStudent.class?.className ||
                                `Grade ${selectedStudent.gradeId}`}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudent(null);
                            setSearchQuery("");
                          }}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Fee Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Fee Type <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <select
                    value={formData.feeTypeId}
                    onChange={(e) =>
                      setFormData({ ...formData, feeTypeId: e.target.value })
                    }
                    disabled={!!editingFee}
                    className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg ${
                      editingFee ? "bg-gray-100 dark:bg-gray-800" : ""
                    }`}
                    required
                  >
                    <option value="">Select fee type</option>
                    {feeTypes.map((ft) => (
                      <option key={ft.feeTypeId} value={ft.feeTypeId}>
                        {ft.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Amount <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <IndianRupee className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-3" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Due Date <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-3" />
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Description / Reason
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="e.g., Late library book return, Disciplinary fine..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingFee(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{editingFee ? "Update Fee" : "Create Fee"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentIndividualFees;
