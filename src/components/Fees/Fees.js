import React, { useState } from "react";
import {
  Search,
  Plus,
  DollarSign,
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  AlertCircle,
  X,
  CloudFog,
  CloudLightning,
} from "lucide-react";
import {
  useFeeStructures,
  useFeeTypes,
  useGradesAndClasses,
  useStudentsWithFees,
} from "../../hooks/useApiHooks";

const Fees = () => {
  // Use TanStack Query hooks
  const {
    data: feesResponse = [],
    isLoading: loading,
    error,
  } = useFeeStructures();

  const {
    data: feeTypesData,
    isLoading: feeTypesLoading,
    error: feeTypesError,
  } = useFeeTypes();

  const {
    data: gradesAndClassesData,
    isLoading: gradesAndClassesLoading,
    error: gradesAndClassesError,
  } = useGradesAndClasses();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterFeeType, setFilterFeeType] = useState("All");
  const [filterGrade, setFilterGrade] = useState("All");
  const [filterSection, setFilterSection] = useState("All");

  // Build filters object for API call
  const apiFilters = {
    gradeId: filterGrade !== "All" ? filterGrade : null,
    feeType: filterFeeType !== "All" ? filterFeeType : null,
    name: searchTerm || null,
    section: filterSection !== "All" ? filterSection : null,
    status: filterStatus !== "All" ? filterStatus : null,
  };

  // Check if any filters are actively applied
  const hasActiveFilters =
    searchTerm ||
    filterStatus !== "All" ||
    filterFeeType !== "All" ||
    filterGrade !== "All" ||
    filterSection !== "All";

  // Use students with fees API when filters are applied
  const {
    data: studentsWithFeesResponse,
    isLoading: studentsWithFeesLoading,
    error: studentsWithFeesError,
  } = useStudentsWithFees(apiFilters, hasActiveFilters);

  // Use the API response when filters are applied, otherwise empty array
  const rawStudentData = hasActiveFilters
    ? Array.isArray(studentsWithFeesResponse?.data)
      ? studentsWithFeesResponse.data
      : studentsWithFeesResponse?.data?.students || []
    : [];

  const getGradeForStudent = (student) => {
    let gradeName;
    gradesAndClassesData.data?.grades.forEach((grade) => {
      if (student.gradeId === grade.gradeId) {
        gradeName = grade.grade;
      }
    });
    return gradeName;
  };

  const getSectionForStudent = (student) => {
    let sectionName;
    gradesAndClassesData.data?.grades.forEach((grade) => {
      if (student.gradeId === grade.gradeId) {
        grade.classes.forEach((cls) => {
          if (student.classId === cls.classId) {
            sectionName = cls.section;
          }
        });
      }
    });
    return sectionName;
  };

  // Transform the API response to match the expected fee structure
  const fees = rawStudentData.flatMap((student) => {
    const studentName = `${student.firstName || ""} ${
      student.lastName || ""
    }`.trim();
    const grade = getGradeForStudent(student) || "N/A";
    const className = "N/A";
    const section = getSectionForStudent(student) || "N/A";

    // Create fee records from payment history
    const paymentRecords = (student.feeInfo?.paymentHistory || []).map(
      (payment, index) => ({
        id: `${student.studentId}-payment-${index}`,
        studentId: student.studentId,
        studentName: studentName,
        grade: grade,
        class: className,
        section: section,
        feeType: payment.feeType || "Unknown",
        amount: payment.amount || 0,
        status: payment.status || "Pending",
        dueDate: payment.dueDate,
        paidDate: payment.paidDate,
        paymentMethod: payment.paymentMethod,
        discountApplied: payment.discountApplied || 0,
        installmentNumber: payment.installmentNumber || 1,
        totalInstallments: payment.totalInstallments || 1,
        remarks: payment.remarks || "",
        ...payment,
      }),
    );

    // If no payment history, create a summary record from feeInfo
    if (paymentRecords.length === 0 && student.feeInfo) {
      const { totalFees, totalPaid, outstandingAmount } = student.feeInfo;

      // Only create records if there are actual fees
      if (totalFees > 0 || outstandingAmount > 0) {
        paymentRecords.push({
          id: `${student.studentId}-summary`,
          studentId: student.studentId,
          studentName: studentName,
          grade: grade,
          class: className,
          section: section,
          feeType: "Total Fees",
          amount: totalFees || 0,
          status: outstandingAmount > 0 ? "Pending" : "Paid",
          dueDate: null,
          paidDate: totalPaid > 0 ? new Date().toISOString() : null,
          paymentMethod: null,
          discountApplied: 0,
          installmentNumber: 1,
          totalInstallments: 1,
          remarks:
            outstandingAmount > 0
              ? `Outstanding: ₹${outstandingAmount}`
              : "Fully paid",
          totalPaid: totalPaid,
          outstandingAmount: outstandingAmount,
        });
      }
    }

    return paymentRecords;
  });

  const statuses = ["All", "Paid", "Pending", "Overdue"];

  // Get fee types from API
  const feeTypesFromApi = feeTypesData?.data || [];
  const feeTypes = [
    "All",
    ...feeTypesFromApi.map((type) => type.label || type.value || type),
  ];

  // Process grades and classes data from API
  const gradesData = gradesAndClassesData?.data?.grades || [];

  // Create class mapping with display names and IDs
  const classMapping = {};
  const allGrades = gradesData
    .map((grade) => {
      const displayName = `Grade ${grade.grade}`;
      classMapping[grade.gradeId] = {
        displayName,
        gradeId: grade.gradeId,
        grade: grade.grade,
        classes: grade.classes || [],
      };
      return grade.gradeId;
    })
    .filter(Boolean);

  // Use API data only
  const grades = ["All", ...new Set(allGrades)];

  // Extract sections only for the selected grade
  const getClassSections = (selectedGradeId) => {
    if (!selectedGradeId || selectedGradeId === "All") {
      return [];
    }

    const gradeInfo = classMapping[selectedGradeId];
    if (!gradeInfo) {
      return [];
    }

    // Get all sections for the selected grade
    const sectionsForGrade = (gradeInfo.classes || [])
      .map((cls) => cls.section)
      .filter(Boolean);

    return sectionsForGrade;
  };

  const availableSections = getClassSections(filterGrade);
  const sections = ["All", ...new Set(availableSections)];

  // Handler for grade change - reset section when grade changes
  const handleGradeChange = (selectedGrade) => {
    setFilterGrade(selectedGrade);
    // Reset section to "All" when grade changes
    if (selectedGrade === "All" || selectedGrade !== filterGrade) {
      setFilterSection("All");
    }
  };

  // Since API handles filtering, we use fees directly as filteredFees
  const filteredFees = fees;

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

  // Calculate statistics - use filtered data when filters are applied, otherwise show zeros
  const statsData = hasActiveFilters ? filteredFees : [];
  const totalAmount = statsData.reduce(
    (sum, fee) => sum + (fee.amount || 0),
    0,
  );
  const paidAmount = statsData
    .filter((fee) => fee.status === "Paid")
    .reduce((sum, fee) => sum + (fee.amount || 0), 0);
  const pendingAmount = statsData
    .filter((fee) => fee.status === "Pending")
    .reduce((sum, fee) => sum + (fee.amount || 0), 0);
  const overdueAmount = statsData
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
                  Grade {fee.grade} • Section {fee.section}
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
                    fee.status,
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
                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (
    loading ||
    feeTypesLoading ||
    gradesAndClassesLoading ||
    studentsWithFeesLoading
  ) {
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
          <button className="btn-primary">
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
          count={statsData.length}
        />
        <StatsCard
          title="Paid Amount"
          amount={paidAmount}
          icon={CheckCircle}
          color="bg-green-500"
          count={statsData.filter((f) => f.status === "Paid").length}
        />
        <StatsCard
          title="Pending Amount"
          amount={pendingAmount}
          icon={Clock}
          color="bg-yellow-500"
          count={statsData.filter((f) => f.status === "Pending").length}
        />
        <StatsCard
          title="Overdue Amount"
          amount={overdueAmount}
          icon={AlertCircle}
          color="bg-red-500"
          count={statsData.filter((f) => f.status === "Overdue").length}
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
              Grade {gradesAndClassesLoading && "(Loading...)"}
            </label>
            <select
              value={filterGrade}
              onChange={(e) => handleGradeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={gradesAndClassesLoading}
            >
              {gradesAndClassesLoading ? (
                <option value="">Loading grades...</option>
              ) : (
                grades.map((grade) => {
                  const displayName =
                    grade === "All"
                      ? "All Grades"
                      : classMapping[grade]?.displayName || `Grade ${grade}`;
                  return (
                    <option key={grade} value={grade}>
                      {displayName}
                    </option>
                  );
                })
              )}
            </select>
            {!gradesAndClassesLoading && grades.length <= 1 && (
              <p className="text-xs text-orange-500 mt-1">
                No grades available from API
              </p>
            )}
            {gradesAndClassesError && (
              <p className="text-xs text-red-500 mt-1">
                Error loading grades: {gradesAndClassesError.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
              {filterGrade === "All" && " (Select a grade first)"}
              {gradesAndClassesLoading && " (Loading...)"}
            </label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={gradesAndClassesLoading || filterGrade === "All"}
            >
              {filterGrade === "All" ? (
                <option value="All">Select a grade first</option>
              ) : gradesAndClassesLoading ? (
                <option value="All">Loading sections...</option>
              ) : (
                sections.map((section) => (
                  <option key={section} value={section}>
                    {section === "All" ? "All Sections" : `Section ${section}`}
                  </option>
                ))
              )}
            </select>
            {filterGrade !== "All" &&
              !gradesAndClassesLoading &&
              availableSections.length === 0 && (
                <p className="text-xs text-orange-500 mt-1">
                  No sections found for{" "}
                  {classMapping[filterGrade]?.displayName || filterGrade}
                </p>
              )}
          </div>
        </div>

        {/* Filter Summary */}
        {(searchTerm ||
          filterStatus !== "All" ||
          filterFeeType !== "All" ||
          filterGrade !== "All" ||
          filterSection !== "All") && (
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
              {filterGrade !== "All" && (
                <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Grade: {classMapping[filterGrade]?.displayName || filterGrade}
                  <button
                    onClick={() => setFilterGrade("All")}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterSection !== "All" && (
                <span className="inline-flex items-center px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
                  Section: {filterSection}
                  <button
                    onClick={() => setFilterSection("All")}
                    className="ml-1 text-pink-600 hover:text-pink-800"
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
                  setFilterGrade("All");
                  setFilterSection("All");
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
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredFees.length} of {fees.length} fee records
          </span>
          {filteredFees.length !== fees.length && (
            <span className="text-blue-600">Filtered results</span>
          )}
        </div>
      )}

      {/* Fee Cards */}
      {hasActiveFilters ? (
        <div className="space-y-4">
          {filteredFees.map((fee) => (
            <FeeCard key={fee.id} fee={fee} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select Filters to View Fee Details
          </h3>
          <p className="text-gray-600 mb-4">
            Use the search bar or apply filters above to view fee records for
            specific students, classes, or fee types.
          </p>
          <div className="text-sm text-gray-500">
            <p>• Search by student name or ID</p>
            <p>• Filter by class, fee type, or payment status</p>
            <p>• Select an academic session</p>
          </div>
        </div>
      )}

      {/* Empty State for No Results */}
      {hasActiveFilters && filteredFees.length === 0 && (
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

      {feeTypesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading fee types
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {feeTypesError.message || feeTypesError.toString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {gradesAndClassesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading grades and classes
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {gradesAndClassesError.message ||
                  gradesAndClassesError.toString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {studentsWithFeesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading students with fees
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {studentsWithFeesError.message ||
                  studentsWithFeesError.toString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
