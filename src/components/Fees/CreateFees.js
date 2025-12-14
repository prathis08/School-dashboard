import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  GraduationCap,
  CheckCircle,
  ArrowLeft,
  Save,
  AlertCircle,
  Search,
  Eye,
  X,
} from "lucide-react";
import { useCreateFeeStructure } from "../../hooks/useApiHooks";

const CreateFees = () => {
  // Use TanStack Query hooks
  const createFeeStructure = useCreateFeeStructure();

  const loading = createFeeStructure.isPending;
  const error = createFeeStructure.error;

  const [feeStructures, setFeeStructures] = useState([]);
  const [filteredFeeStructures, setFilteredFeeStructures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [selectedFee, setSelectedFee] = useState(null);
  const [showFeeDetails, setShowFeeDetails] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    academicSession: "",
    applicableClass: "",
    description: "",
    allowInstallments: false,
    availableForDiscount: false,
    category: "Tuition",
    dueDate: "",
    isActive: true,
  });

  // Academic sessions and classes
  const academicSessions = ["2024-2025", "2025-2026", "2026-2027"];

  const classOptions = [
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "All Classes",
  ];

  const feeCategories = [
    "Tuition Fee",
    "Library Fee",
    "Lab Fee",
    "Sports Fee",
    "Transportation Fee",
    "Examination Fee",
    "Development Fee",
    "Activity Fee",
  ];

  // Fetch existing fee structures
  useEffect(() => {
    fetchFeeStructures();
  }, []);

  // Filter fee structures based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredFeeStructures(feeStructures);
    } else {
      const filtered = feeStructures.filter(
        (fee) =>
          fee.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fee.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fee.applicableClass
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          fee.academicSession.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFeeStructures(filtered);
    }
  }, [searchTerm, feeStructures]);

  const fetchFeeStructures = async () => {
    try {
      // This would be a real API call
      // const response = await get("/fees/fee-structures");
      // For now, using dummy data
      const dummyFeeStructures = [
        {
          id: 1,
          title: "Grade 12 Tuition Fee",
          amount: 5000,
          academicSession: "2024-2025",
          applicableClass: "Grade 12",
          category: "Tuition Fee",
          description: "Annual tuition fee for Grade 12 students",
          allowInstallments: true,
          availableForDiscount: true,
          dueDate: "2024-04-15",
          isActive: true,
          createdDate: "2024-01-15",
        },
        {
          id: 2,
          title: "Library Fee - All Classes",
          amount: 200,
          academicSession: "2024-2025",
          applicableClass: "All Classes",
          category: "Library Fee",
          description: "Annual library usage and maintenance fee",
          allowInstallments: false,
          availableForDiscount: false,
          dueDate: "2024-05-01",
          isActive: true,
          createdDate: "2024-01-10",
        },
        {
          id: 3,
          title: "Science Lab Fee",
          amount: 800,
          academicSession: "2024-2025",
          applicableClass: "Grade 11",
          category: "Lab Fee",
          description: "Science laboratory equipment and chemicals fee",
          allowInstallments: true,
          availableForDiscount: true,
          dueDate: "2024-04-30",
          isActive: true,
          createdDate: "2024-01-20",
        },
      ];
      setFeeStructures(dummyFeeStructures);
      setFilteredFeeStructures(dummyFeeStructures);
    } catch (err) {
      console.error("Error fetching fee structures:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingFee) {
        // Update existing fee structure
        const updatedFee = { ...editingFee, ...formData };
        setFeeStructures((prev) =>
          prev.map((fee) => (fee.id === editingFee.id ? updatedFee : fee))
        );
      } else {
        // Create new fee structure
        const newFee = {
          ...formData,
          id: Date.now(),
          createdDate: new Date().toISOString().split("T")[0],
        };
        setFeeStructures((prev) => [...prev, newFee]);
      }

      resetForm();
    } catch (err) {
      console.error("Error saving fee structure:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      amount: "",
      academicSession: "",
      applicableClass: "",
      description: "",
      allowInstallments: false,
      availableForDiscount: false,
      category: "Tuition",
      dueDate: "",
      isActive: true,
    });
    setShowCreateForm(false);
    setEditingFee(null);
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setFormData({
      title: fee.title,
      amount: fee.amount,
      academicSession: fee.academicSession,
      applicableClass: fee.applicableClass,
      description: fee.description,
      allowInstallments: fee.allowInstallments,
      availableForDiscount: fee.availableForDiscount,
      category: fee.category,
      dueDate: fee.dueDate,
      isActive: fee.isActive,
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (feeId) => {
    if (window.confirm("Are you sure you want to delete this fee structure?")) {
      setFeeStructures((prev) => prev.filter((fee) => fee.id !== feeId));
    }
  };

  const handleViewDetails = (fee) => {
    setSelectedFee(fee);
    setShowFeeDetails(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const FeeStructureCard = ({ fee }) => (
    <div
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleViewDetails(fee)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {fee.title}
            </h3>
            <p className="text-sm text-gray-600">{fee.category}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(fee.amount)}
          </p>
          <p className="text-sm text-gray-600">{fee.applicableClass}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Academic Session</p>
          <p className="text-sm text-gray-900">{fee.academicSession}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Due Date</p>
          <p className="text-sm text-gray-900">{formatDate(fee.dueDate)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {fee.allowInstallments && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Installments
            </span>
          )}
          {fee.availableForDiscount && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Discount
            </span>
          )}
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              fee.isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {fee.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleEdit(fee)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="Edit Fee"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(fee.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete Fee"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Fees</h1>
          <p className="text-gray-600 mt-1">
            Create and manage fee structures for the school
          </p>
        </div>
        {!showCreateForm && (
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Fee
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingFee ? "Edit Fee Structure" : "Create New Fee Structure"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Fee Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Grade 12 Tuition Fee"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Fee Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    {feeCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="academicSession"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Academic Session *
                  </label>
                  <select
                    id="academicSession"
                    name="academicSession"
                    value={formData.academicSession}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Select Academic Session</option>
                    {academicSessions.map((session) => (
                      <option key={session} value={session}>
                        {session}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="applicableClass"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Applicable Class *
                  </label>
                  <select
                    id="applicableClass"
                    name="applicableClass"
                    value={formData.applicableClass}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Select Class</option>
                    {classOptions.map((classOption) => (
                      <option key={classOption} value={classOption}>
                        {classOption}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Due Date *
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter fee description..."
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Additional Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowInstallments"
                      name="allowInstallments"
                      checked={formData.allowInstallments}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="allowInstallments"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Allow Installment Payments
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="availableForDiscount"
                      name="availableForDiscount"
                      checked={formData.availableForDiscount}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="availableForDiscount"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Available for Discount
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Active Fee Structure
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingFee ? "Update Fee" : "Create Fee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Existing Fee Structures */}
      {!showCreateForm && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Existing Fee Structures ({filteredFeeStructures.length})
            </h2>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search fees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {filteredFeeStructures.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredFeeStructures.map((fee) => (
                <FeeStructureCard key={fee.id} fee={fee} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm
                  ? "No matching fee structures found"
                  : "No fee structures found"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria or create a new fee structure."
                  : "Create your first fee structure to get started."}
              </p>
              {!searchTerm && (
                <button
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Fee
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Fee Details Modal */}
      {showFeeDetails && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Fee Structure Details
                </h2>
                <button
                  onClick={() => setShowFeeDetails(false)}
                  className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mr-6">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedFee.title}
                    </h3>
                    <p className="text-lg text-gray-600">
                      {selectedFee.category}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Amount
                      </h4>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedFee.amount)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Applicable Class
                      </h4>
                      <p className="text-lg text-gray-900">
                        {selectedFee.applicableClass}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Academic Session
                      </h4>
                      <p className="text-lg text-gray-900">
                        {selectedFee.academicSession}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Due Date
                      </h4>
                      <p className="text-lg text-gray-900">
                        {formatDate(selectedFee.dueDate)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Created Date
                      </h4>
                      <p className="text-lg text-gray-900">
                        {formatDate(selectedFee.createdDate)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Status
                      </h4>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedFee.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedFee.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedFee.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedFee.description}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">
                    Options
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedFee.allowInstallments && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Installments Available
                      </span>
                    )}
                    {selectedFee.availableForDiscount && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Discount Available
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowFeeDetails(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowFeeDetails(false);
                      handleEdit(selectedFee);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Fee
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading fee structures
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {error.message || error.toString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateFees;
