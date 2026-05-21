import React, { useState } from "react";
import {
  CreditCard,
  Search,
  IndianRupee,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  useEnhancedActiveYear,
  useStudents,
  useEnhancedStudentInstallments,
  useRecordEnhancedPayment,
} from "../../../hooks/useApiHooks";
import { useToast } from "../../../context/UIProvider";

const PaymentRecording = () => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "CASH",
    paymentDate: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  const { data: activeYear } = useEnhancedActiveYear();
  const { data: studentsData } = useStudents();
  const recordPaymentMutation = useRecordEnhancedPayment();

  const activeYearId = activeYear?.data?.academicYearId;
  const students = Array.isArray(studentsData?.data) ? studentsData.data : [];

  const { data: installmentsData } = useEnhancedStudentInstallments(
    selectedStudent?.studentId,
    activeYearId,
  );

  const filteredStudents = students.filter(
    (student) =>
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await recordPaymentMutation.mutateAsync({
        data: {
          studentId: selectedStudent.studentId,
          assignmentId: selectedInstallment.assignmentId,
          installmentId: selectedInstallment.installmentId,
          amount: parseFloat(paymentData.amount),
          paymentMethod: paymentData.paymentMethod,
          paymentDate: paymentData.paymentDate,
          paymentType: "INSTALLMENT",
          remarks: paymentData.remarks || undefined,
        },
      });
      setShowPaymentModal(false);
      setPaymentData({
        amount: "",
        paymentMethod: "CASH",
        paymentDate: new Date().toISOString().split("T")[0],
        remarks: "",
      });
      toast.success("Payment recorded successfully!");
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment. Please try again.");
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
          Please create and activate an academic year first.
        </p>
      </div>
    );
  }

  const installments = installmentsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Payment Recording
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Record fee payments for {activeYear.data.name}
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search students by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Students List */}
      {!selectedStudent && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.studentId}
              onClick={() => setSelectedStudent(student)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    {student.studentId}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                {student.gradeName} - Section {student.section}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Installments List */}
      {selectedStudent && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedStudent.firstName} {selectedStudent.lastName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                {selectedStudent.studentId}
              </p>
            </div>
            <button
              onClick={() => setSelectedStudent(null)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Back to Students
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Installments
            </h4>

            {installments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  No installments found for this student
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {installments.map((installment) => {
                  const isPaid = installment.status === "PAID";
                  const isOverdue =
                    installment.status === "PENDING" &&
                    new Date(installment.dueDate) < new Date();

                  return (
                    <div
                      key={installment.installmentId}
                      className={`p-4 rounded-lg border-2 ${
                        isPaid
                          ? "bg-green-50 border-green-200"
                          : isOverdue
                            ? "bg-red-50 border-red-200"
                            : "bg-white border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold text-gray-900 dark:text-white">
                              {installment.installmentName}
                            </h5>
                            {isPaid && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            {isOverdue && (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                              Due:{" "}
                              {new Date(
                                installment.dueDate,
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                              Amount: ₹{installment.amount?.toLocaleString()}
                            </p>
                            {installment.paidAmount > 0 && (
                              <p className="text-green-600">
                                Paid: ₹
                                {installment.paidAmount?.toLocaleString()}
                              </p>
                            )}
                            {installment.balanceAmount > 0 && (
                              <p className="text-red-600">
                                Balance: ₹
                                {installment.balanceAmount?.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {!isPaid && (
                          <button
                            onClick={() => {
                              setSelectedInstallment(installment);
                              setPaymentData((prev) => ({
                                ...prev,
                                amount:
                                  installment.balanceAmount?.toString() || "",
                              }));
                              setShowPaymentModal(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Record Payment
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInstallment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Record Payment
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedInstallment.installmentName}
              </p>
            </div>

            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="NEFT">NEFT/RTGS</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      paymentDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={paymentData.remarks}
                  onChange={(e) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      remarks: e.target.value,
                    }))
                  }
                  placeholder="Optional payment notes"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentData({
                      amount: "",
                      paymentMethod: "CASH",
                      paymentDate: new Date().toISOString().split("T")[0],
                      remarks: "",
                    });
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordPaymentMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {recordPaymentMutation.isPending
                    ? "Recording..."
                    : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentRecording;
