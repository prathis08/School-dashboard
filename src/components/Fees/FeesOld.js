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
} from "lucide-react";
import { API_ENDPOINTS } from "../../services/api";

const Fees = () => {
  const [fees, setFees] = useState([
    {
      id: 1,
      studentName: "Alice Johnson",
      studentId: "STU001",
      grade: "Grade 12",
      class: "12-A",
      feeType: "Tuition Fee",
      amount: 2500,
      dueDate: "2024-04-15",
      paidDate: "2024-04-10",
      status: "Paid",
      paymentMethod: "Bank Transfer",
      semester: "Spring 2024",
    },
    {
      id: 2,
      studentName: "Bob Chen",
      studentId: "STU002",
      grade: "Grade 11",
      class: "11-B",
      feeType: "Tuition Fee",
      amount: 2300,
      dueDate: "2024-04-15",
      paidDate: null,
      status: "Pending",
      paymentMethod: null,
      semester: "Spring 2024",
    },
    {
      id: 3,
      studentName: "Carol Smith",
      studentId: "STU003",
      grade: "Grade 10",
      class: "10-A",
      feeType: "Lab Fee",
      amount: 500,
      dueDate: "2024-04-20",
      paidDate: "2024-04-18",
      status: "Paid",
      paymentMethod: "Credit Card",
      semester: "Spring 2024",
    },
    {
      id: 4,
      studentName: "David Wilson",
      studentId: "STU004",
      grade: "Grade 12",
      class: "12-B",
      feeType: "Library Fee",
      amount: 200,
      dueDate: "2024-04-05",
      paidDate: null,
      status: "Overdue",
      paymentMethod: null,
      semester: "Spring 2024",
    },
    {
      id: 5,
      studentName: "Eva Brown",
      studentId: "STU005",
      grade: "Grade 11",
      class: "11-A",
      feeType: "Sports Fee",
      amount: 800,
      dueDate: "2024-04-25",
      paidDate: null,
      status: "Pending",
      paymentMethod: null,
      semester: "Spring 2024",
    },
    {
      id: 6,
      studentName: "Frank Davis",
      studentId: "STU006",
      grade: "Grade 9",
      class: "9-C",
      feeType: "Tuition Fee",
      amount: 2100,
      dueDate: "2024-04-15",
      paidDate: "2024-04-12",
      status: "Paid",
      paymentMethod: "Cash",
      semester: "Spring 2024",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterFeeType, setFilterFeeType] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  const statuses = ["All", "Paid", "Pending", "Overdue"];
  const feeTypes = [
    "All",
    "Tuition Fee",
    "Lab Fee",
    "Library Fee",
    "Sports Fee",
    "Transport Fee",
  ];

  const filteredFees = fees.filter((fee) => {
    const matchesSearch =
      fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || fee.status === filterStatus;
    const matchesFeeType =
      filterFeeType === "All" || fee.feeType === filterFeeType;

    return matchesSearch && matchesStatus && matchesFeeType;
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
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "Overdue":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const isOverdue = (dueDate, status) => {
    if (status === "Paid") return false;
    return new Date(dueDate) < new Date();
  };

  const FeeCard = ({ fee }) => (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {fee.studentName}
            </h3>
            <p className="text-sm text-gray-600">
              {fee.studentId} • {fee.class}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${getStatusColor(
              fee.status
            )}`}
          >
            {getStatusIcon(fee.status)}
            <span className="ml-1">{fee.status}</span>
          </span>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Fee Type:</span>
          <span className="text-sm font-medium text-gray-900">
            {fee.feeType}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Amount:</span>
          <span className="text-lg font-bold text-gray-900">
            ${fee.amount.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Due Date:</span>
          <span
            className={`text-sm font-medium ${
              isOverdue(fee.dueDate, fee.status)
                ? "text-red-600"
                : "text-gray-900"
            }`}
          >
            {new Date(fee.dueDate).toLocaleDateString()}
          </span>
        </div>

        {fee.paidDate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Paid Date:</span>
            <span className="text-sm font-medium text-green-600">
              {new Date(fee.paidDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {fee.paymentMethod && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Payment Method:</span>
            <span className="text-sm font-medium text-gray-900">
              {fee.paymentMethod}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Semester:</span>
          <span className="text-sm font-medium text-gray-900">
            {fee.semester}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {fee.status === "Paid" && (
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                <Download className="w-4 h-4" />
              </button>
            )}
            {fee.status !== "Paid" && (
              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                <CreditCard className="w-4 h-4" />
              </button>
            )}
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          {fee.status !== "Paid" && (
            <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Pay Now
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const StatsCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const totalRevenue = fees
    .filter((f) => f.status === "Paid")
    .reduce((sum, f) => sum + f.amount, 0);
  const pendingAmount = fees
    .filter((f) => f.status === "Pending")
    .reduce((sum, f) => sum + f.amount, 0);
  const overdueAmount = fees
    .filter((f) => f.status === "Overdue")
    .reduce((sum, f) => sum + f.amount, 0);
  const totalFees = fees.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fees Management</h1>
          <p className="text-gray-600 mt-1">
            Track and manage student fee payments
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Fee Record
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-500"
          description="From paid fees"
        />
        <StatsCard
          title="Pending Amount"
          value={`$${pendingAmount.toLocaleString()}`}
          icon={Clock}
          color="bg-yellow-500"
          description="Awaiting payment"
        />
        <StatsCard
          title="Overdue Amount"
          value={`$${overdueAmount.toLocaleString()}`}
          icon={AlertCircle}
          color="bg-red-500"
          description="Past due date"
        />
        <StatsCard
          title="Total Records"
          value={totalFees}
          icon={GraduationCap}
          color="bg-blue-500"
          description="All fee records"
        />
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by student name, ID, or class..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Fee Type Filter */}
          <div>
            <select
              value={filterFeeType}
              onChange={(e) => setFilterFeeType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {feeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default Fees;
