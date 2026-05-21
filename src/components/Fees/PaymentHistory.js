import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Receipt,
  IndianRupee,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  GraduationCap,
} from "lucide-react";
import { useStudentPaymentHistory } from "../../hooks/useApiHooks";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const STATUS_STYLES = {
  COMPLETED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  FAILED: "bg-red-100 text-red-700",
  REFUND: "bg-purple-100 text-purple-700",
  CANCELLED: "bg-gray-200 text-gray-700",
};

const METHOD_LABELS = {
  CASH: "Cash",
  CHEQUE: "Cheque",
  BANK_TRANSFER: "Bank Transfer",
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
  UPI: "UPI",
  ONLINE: "Online",
  WALLET: "Wallet",
};

const PaymentHistory = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useStudentPaymentHistory(studentId);

  const result = response?.data || null;
  const student = result?.student;
  const payments = result?.payments || [];
  const summary = result?.summary || { count: 0, totalPaid: 0, totalRefunded: 0 };

  const sortedPayments = useMemo(
    () =>
      [...payments].sort(
        (a, b) =>
          new Date(b.paymentDate || b.createdAt) -
          new Date(a.paymentDate || a.createdAt),
      ),
    [payments],
  );

  const studentName = student
    ? `${student.firstName || ""} ${student.lastName || ""}`.trim()
    : "Student";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/fees")}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payment History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              All recorded payments for {studentName}
            </p>
          </div>
        </div>
        {student && (
          <button
            onClick={() => navigate(`/fees/payment/${studentId}`)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Record Payment
          </button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>
          <div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <p className="font-medium text-red-700 dark:text-red-300">
              Could not load payment history
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              {error.message}
            </p>
          </div>
        </div>
      )}

      {!isLoading && !error && student && (
        <>
          {/* Student card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {studentName}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {student.rollNumber && `Roll: ${student.rollNumber} • `}
                  {student.class?.className || "No class"}
                  {student.class?.section ? ` (${student.class.section})` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Payments Recorded</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {summary.count}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(summary.totalPaid)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <IndianRupee className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Refunded</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {formatCurrency(summary.totalRefunded)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <RotateCcw className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment list */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Payments
              </h3>
            </div>

            {sortedPayments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No payments have been recorded for this student yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/40">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Installment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedPayments.map((p) => {
                      const statusKey = p.isRefunded
                        ? "REFUND"
                        : (p.status || "COMPLETED").toUpperCase();
                      const statusClass =
                        STATUS_STYLES[statusKey] ||
                        "bg-gray-100 text-gray-700";
                      return (
                        <tr
                          key={p.paymentId || p.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {p.receiptNumber || "—"}
                            </div>
                            {p.transactionId && (
                              <div className="text-xs text-gray-500">
                                Txn: {p.transactionId}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                              {formatDate(p.paymentDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {p.installment ? (
                              <div>
                                <div className="text-gray-900 dark:text-white">
                                  {p.installment.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Due {formatDate(p.installment.dueDate)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">
                                Advance / Multi-installment
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {METHOD_LABELS[p.paymentMethod] || p.paymentMethod}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {p.paymentType || "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(p.amount)}
                            </div>
                            {parseFloat(p.lateFeeAmount) > 0 && (
                              <div className="text-xs text-orange-600">
                                +Late {formatCurrency(p.lateFeeAmount)}
                              </div>
                            )}
                            {parseFloat(p.discountApplied) > 0 && (
                              <div className="text-xs text-blue-600">
                                −Disc {formatCurrency(p.discountApplied)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
                            >
                              {statusKey === "COMPLETED" && (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              {statusKey}
                            </span>
                            {p.notes && (
                              <div
                                className="text-xs text-gray-500 mt-1 truncate max-w-xs"
                                title={p.notes}
                              >
                                {p.notes}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!isLoading && !error && !student && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Student not found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Could not locate this student in the system.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
