import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  CreditCard,
  AlertCircle,
  X,
} from "lucide-react";
import {
  useFeeStructures,
  useCreateFeeStructure,
  useUpdateFeeStructure,
  useDeleteFeeStructure,
} from "../../hooks/useApiHooks";
import { API_ENDPOINTS } from "../../services/api";
import feesData from "../../dummy-data/fees.json";
import studentsData from "../../dummy-data/students.json";

const Fees = () => {
  // Use TanStack Query hooks
  const {
    data: feesResponse = [],
    isLoading: loading,
    error,
  } = useFeeStructures();
  const createFeeStructure = useCreateFeeStructure();
  const updateFeeStructure = useUpdateFeeStructure();
  const deleteFeeStructure = useDeleteFeeStructure();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterFeeType, setFilterFeeType] = useState("All");
  const [filterClass, setFilterClass] = useState("All");
  const [filterAcademicSession, setFilterAcademicSession] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // Safely extract data from response
  const fees = Array.isArray(feesResponse)
    ? feesResponse
    : Array.isArray(feesResponse?.data)
    ? feesResponse.data
    : [];

  // Use dummy data for now
  const [students] = useState(studentsData || []);

  const statuses = ["All", "Paid", "Pending", "Overdue"];
  const feeTypes = [
    "All",
    "Tuition Fee",
    "Library Fee",
    "Lab Fee",
    "Sports Fee",
    "Transportation Fee",
    "Examination Fee",
    "Development Fee",
    "Activity Fee",
  ];

  const classes = ["All", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const academicSessions = ["All", "2024-2025", "2025-2026", "2026-2027"];

  // Filter fees based on search and filters
  const filteredFees = fees.filter((fee) => {
    const matchesSearch =
      fee.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.feeType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.class?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || fee.status === filterStatus;
    const matchesFeeType =
      filterFeeType === "All" || fee.feeType === filterFeeType;
    const matchesClass = filterClass === "All" || fee.grade === filterClass;
    const matchesSession =
      filterAcademicSession === "All" ||
      fee.academicSession === filterAcademicSession;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesFeeType &&
      matchesClass &&
      matchesSession
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Paid":
        return CheckCircle;
      case "Pending":
        return Clock;
      case "Overdue":
        return AlertCircle;
      default:
        return XCircle;
    }
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

  // Calculate statistics
  const totalAmount = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
  const paidAmount = fees
    .filter((fee) => fee.status === "Paid")
    .reduce((sum, fee) => sum + (fee.amount || 0), 0);
  const pendingAmount = fees
    .filter((fee) => fee.status === "Pending")
    .reduce((sum, fee) => sum + (fee.amount || 0), 0);
  const overdueAmount = fees
    .filter((fee) => fee.status === "Overdue")
    .reduce((sum, fee) => sum + (fee.amount || 0), 0);

  const StatsCard = ({ title, amount, icon: Icon, color, count }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(amount)}
          </p>
          {count !== undefined && (
            <p className="text-xs text-gray-500 mt-1">{count} transactions</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const FeeCard = ({ fee }) => {
    const StatusIcon = getStatusIcon(fee.status);

    return (
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {fee.studentName}
                </h3>
                <p className="text-sm text-gray-600">
                  {fee.studentId} • {fee.grade} • {fee.class}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Fee Type</p>
                <p className="text-sm font-medium text-gray-900">
                  {fee.feeType}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Amount</p>
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(fee.amount)}
                  </p>
                  {fee.discountApplied > 0 && (
                    <p className="text-xs text-green-600">
                      -{formatCurrency(fee.discountApplied)} discount
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Due Date</p>
                <p className="text-sm text-gray-900">
                  {formatDate(fee.dueDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Payment Date</p>
                <p className="text-sm text-gray-900">
                  {formatDate(fee.paidDate)}
                </p>
              </div>
            </div>

            {fee.totalInstallments > 1 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">
                  Installment Progress
                </p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (fee.installmentNumber / fee.totalInstallments) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {fee.installmentNumber}/{fee.totalInstallments}
                  </span>
                </div>
              </div>
            )}

            {fee.remarks && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Remarks</p>
                <p className="text-sm text-gray-700">{fee.remarks}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    fee.status
                  )}`}
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {fee.status}
                </span>
                {fee.paymentMethod && (
                  <span className="text-xs text-gray-500">
                    via {fee.paymentMethod}
                  </span>
                )}
              </div>
              <div className="flex space-x-1">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 rounded-lg h-24"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage student fee payments across the school
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Amount"
          amount={totalAmount}
          icon={DollarSign}
          color="bg-blue-500"
          count={fees.length}
        />
        <StatsCard
          title="Paid Amount"
          amount={paidAmount}
          icon={CheckCircle}
          color="bg-green-500"
          count={fees.filter((f) => f.status === "Paid").length}
        />
        <StatsCard
          title="Pending Amount"
          amount={pendingAmount}
          icon={Clock}
          color="bg-yellow-500"
          count={fees.filter((f) => f.status === "Pending").length}
        />
        <StatsCard
          title="Overdue Amount"
          amount={overdueAmount}
          icon={AlertCircle}
          color="bg-red-500"
          count={fees.filter((f) => f.status === "Overdue").length}
        />
      </div>

      {/* Advanced Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Search & Filter
        </h3>

        {/* Main Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by student name, ID, fee type, class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All Statuses" : status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee Type
            </label>
            <select
              value={filterFeeType}
              onChange={(e) => setFilterFeeType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {feeTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "All" ? "All Fee Types" : type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls === "All" ? "All Classes" : cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Session
            </label>
            <select
              value={filterAcademicSession}
              onChange={(e) => setFilterAcademicSession(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {academicSessions.map((session) => (
                <option key={session} value={session}>
                  {session === "All" ? "All Sessions" : session}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        {(searchTerm ||
          filterStatus !== "All" ||
          filterFeeType !== "All" ||
          filterClass !== "All" ||
          filterAcademicSession !== "All") && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterStatus !== "All" && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Status: {filterStatus}
                  <button
                    onClick={() => setFilterStatus("All")}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterFeeType !== "All" && (
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Type: {filterFeeType}
                  <button
                    onClick={() => setFilterFeeType("All")}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterClass !== "All" && (
                <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Class: {filterClass}
                  <button
                    onClick={() => setFilterClass("All")}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterAcademicSession !== "All" && (
                <span className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                  Session: {filterAcademicSession}
                  <button
                    onClick={() => setFilterAcademicSession("All")}
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("All");
                  setFilterFeeType("All");
                  setFilterClass("All");
                  setFilterAcademicSession("All");
                }}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredFees.length} of {fees.length} fee records
        </span>
        {filteredFees.length !== fees.length && (
          <span className="text-blue-600">Filtered results</span>
        )}
      </div>

      {/* Fee Cards */}
      <div className="space-y-4">
        {filteredFees.map((fee) => (
          <FeeCard key={fee.id} fee={fee} />
        ))}
      </div>

      {/* Empty State */}
      {filteredFees.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No fee records found
          </h3>
          <p className="text-gray-600">
            {fees.length === 0
              ? "Get started by recording your first fee payment."
              : "Try adjusting your search or filter criteria."}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading fees
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

export default Fees;
