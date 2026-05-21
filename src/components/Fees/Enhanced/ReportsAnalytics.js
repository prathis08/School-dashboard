import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Download,
  IndianRupee,
  Users,
  Calendar,
  CheckCircle,
} from "lucide-react";
import {
  useEnhancedActiveYear,
  useEnhancedDashboardStats,
  useEnhancedOverdueReport,
  useEnhancedCollectionReport,
} from "../../../hooks/useApiHooks";

const ReportsAnalytics = ({ isDashboard = false }) => {
  const [reportType, setReportType] = useState("dashboard");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const { data: activeYear } = useEnhancedActiveYear();
  const activeYearId = activeYear?.data?.academicYearId;

  const { data: dashboardStats, isLoading: statsLoading } =
    useEnhancedDashboardStats(activeYearId);

  const { data: overdueReport, isLoading: overdueLoading } =
    useEnhancedOverdueReport(activeYearId, {}, reportType === "overdue");

  const { data: collectionReport, isLoading: collectionLoading } =
    useEnhancedCollectionReport(
      dateRange.startDate,
      dateRange.endDate,
      {},
      reportType === "collection",
    );

  if (!activeYear?.data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <AlertCircle className="w-6 h-6 text-yellow-600 mb-2" />
        <h3 className="text-lg font-semibold text-yellow-900 mb-1">
          No Active Academic Year
        </h3>
        <p className="text-yellow-800">
          Please create and activate an academic year to view reports.
        </p>
      </div>
    );
  }

  const stats = dashboardStats?.data || {};
  const overdueData = overdueReport?.data || [];
  const collectionData = collectionReport?.data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isDashboard ? "Fee Dashboard" : "Reports & Analytics"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Overview for {activeYear.data.name}
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <IndianRupee className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5 opacity-60" />
          </div>
          <p className="text-blue-100 text-sm mb-1">Total Fee Amount</p>
          <p className="text-3xl font-bold">
            ₹{(stats.totalFeeAmount || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5 opacity-60" />
          </div>
          <p className="text-green-100 text-sm mb-1">Total Collected</p>
          <p className="text-3xl font-bold">
            ₹{(stats.totalCollected || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5 opacity-60" />
          </div>
          <p className="text-red-100 text-sm mb-1">Total Outstanding</p>
          <p className="text-3xl font-bold">
            ₹{(stats.totalOutstanding || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5 opacity-60" />
          </div>
          <p className="text-purple-100 text-sm mb-1">Students Enrolled</p>
          <p className="text-3xl font-bold">{stats.totalStudents || 0}</p>
        </div>
      </div>

      {/* Collection Rate */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Collection Rate
        </h3>
        <div className="relative pt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Overall Collection Progress
            </span>
            <span className="text-sm font-bold text-blue-600">
              {stats.collectionPercentage || 0}%
            </span>
          </div>
          <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-200">
            <div
              style={{ width: `${stats.collectionPercentage || 0}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Report Type Selector */}
      {!isDashboard && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => setReportType("overdue")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reportType === "overdue"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Overdue Report
            </button>
            <button
              onClick={() => setReportType("collection")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reportType === "collection"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Collection Report
            </button>
          </div>

          {/* Date Range for Collection Report */}
          {reportType === "collection" && (
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overdue Report */}
      {!isDashboard && reportType === "overdue" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Overdue Installments
          </h3>

          {overdueLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : overdueData.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                No overdue installments!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Installment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Days Overdue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700">
                  {overdueData.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:bg-gray-700"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {item.studentName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                        {item.installmentName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-red-600">
                        ₹{item.balanceAmount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        {item.daysOverdue} days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Collection Report */}
      {!isDashboard && reportType === "collection" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Collection Summary
          </h3>

          {collectionLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Total Collected</p>
                <p className="text-2xl font-bold text-blue-900">
                  ₹{(collectionData.totalCollected || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Transactions</p>
                <p className="text-2xl font-bold text-green-900">
                  {collectionData.totalTransactions || 0}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 mb-1">Average Payment</p>
                <p className="text-2xl font-bold text-purple-900">
                  ₹{(collectionData.averagePayment || 0).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Payment recorded for John Doe
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                2 hours ago • ₹25,000
              </p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                New quarterly schedule created
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                5 hours ago • Class 10A
              </p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Installment overdue reminder sent
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                1 day ago • 15 students
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
