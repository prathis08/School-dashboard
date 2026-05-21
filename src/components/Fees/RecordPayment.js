import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  IndianRupee,
  GraduationCap,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  CreditCard,
  FileText,
  Banknote,
  Smartphone,
  Building,
  Wallet,
  Receipt,
} from "lucide-react";
import {
  useStudentsWithFees,
  usePaymentMethods,
  useRecordEnhancedPayment,
  useAcademicSessions,
} from "../../hooks/useApiHooks";
import { useToast } from "../../context/UIProvider";

const RecordPayment = () => {
  const toast = useToast();
  const { studentId } = useParams();
  const navigate = useNavigate();

  // API Hooks
  const { data: academicSessionsResponse, isLoading: academicLoading } =
    useAcademicSessions();
  const { data: paymentMethodsResponse, isLoading: paymentMethodsLoading } =
    usePaymentMethods();
  const recordPaymentMutation = useRecordEnhancedPayment();

  // Get active academic year
  const activeAcademicYear = useMemo(() => {
    const sessions = academicSessionsResponse?.data || [];
    return sessions.find((s) => s.isActive) || sessions[0];
  }, [academicSessionsResponse]);

  // Fetch student data with studentId filter
  const { data: studentsResponse, isLoading: studentLoading } =
    useStudentsWithFees({ studentId }, !!studentId);

  // Extract student data
  const student = useMemo(() => {
    const students =
      studentsResponse?.data?.students || studentsResponse?.data || [];
    if (Array.isArray(students)) {
      return students.find((s) => s.studentId === studentId) || students[0];
    }
    return null;
  }, [studentsResponse, studentId]);

  const feeInfo = student?.feeInfo || {};

  // Payment form state
  const [paymentMode, setPaymentMode] = useState("installment"); // 'installment' | 'custom' | 'full'
  const [selectedInstallments, setSelectedInstallments] = useState([]);
  const [selectedIndividualFees, setSelectedIndividualFees] = useState([]);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment methods with icons
  const paymentMethodIcons = {
    CASH: Banknote,
    CHEQUE: FileText,
    BANK_TRANSFER: Building,
    CREDIT_CARD: CreditCard,
    DEBIT_CARD: CreditCard,
    UPI: Smartphone,
    ONLINE: Smartphone,
    WALLET: Wallet,
  };

  // Default payment methods - API returns objects with { key, value, label }
  const defaultPaymentMethods = [
    { key: "CASH", label: "Cash" },
    { key: "CHEQUE", label: "Cheque" },
    { key: "BANK_TRANSFER", label: "Bank Transfer" },
    { key: "CREDIT_CARD", label: "Credit Card" },
    { key: "DEBIT_CARD", label: "Debit Card" },
    { key: "UPI", label: "UPI" },
    { key: "ONLINE", label: "Online" },
    { key: "WALLET", label: "Wallet" },
  ];

  // Handle both object format from API and string format
  const paymentMethods = useMemo(() => {
    const data = paymentMethodsResponse?.data;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return defaultPaymentMethods;
    }
    // If API returns objects, use them; otherwise convert strings to objects
    if (typeof data[0] === "object") {
      return data;
    }
    return data.map((method) => ({
      key: method,
      label: method.replace(/_/g, " "),
    }));
  }, [paymentMethodsResponse]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate totals
  const pendingInstallments = (feeInfo.installments || []).filter(
    (inst) => inst.status !== "PAID" && inst.balanceAmount > 0,
  );

  const pendingIndividualFees = (feeInfo.individualFees || []).filter(
    (fee) => fee.status === "PENDING",
  );

  // Calculate selected amount
  const calculatedAmount = useMemo(() => {
    if (paymentMode === "full") {
      return feeInfo.outstandingAmount || 0;
    }
    if (paymentMode === "custom") {
      return parseFloat(customAmount) || 0;
    }
    // installment mode
    const installmentTotal = selectedInstallments.reduce((sum, instId) => {
      const inst = pendingInstallments.find((i) => i.installmentId === instId);
      return sum + (inst?.balanceAmount || 0);
    }, 0);
    const individualTotal = selectedIndividualFees.reduce((sum, feeId) => {
      const fee = pendingIndividualFees.find((f) => f.id === feeId);
      return sum + (parseFloat(fee?.amount) || 0);
    }, 0);
    return installmentTotal + individualTotal;
  }, [
    paymentMode,
    customAmount,
    selectedInstallments,
    selectedIndividualFees,
    pendingInstallments,
    pendingIndividualFees,
    feeInfo.outstandingAmount,
  ]);

  // Toggle installment selection
  const toggleInstallment = (installmentId) => {
    setSelectedInstallments((prev) =>
      prev.includes(installmentId)
        ? prev.filter((id) => id !== installmentId)
        : [...prev, installmentId],
    );
  };

  // Toggle individual fee selection
  const toggleIndividualFee = (feeId) => {
    setSelectedIndividualFees((prev) =>
      prev.includes(feeId)
        ? prev.filter((id) => id !== feeId)
        : [...prev, feeId],
    );
  };

  // Select all pending installments
  const selectAllInstallments = () => {
    if (selectedInstallments.length === pendingInstallments.length) {
      setSelectedInstallments([]);
    } else {
      setSelectedInstallments(pendingInstallments.map((i) => i.installmentId));
    }
  };

  // Handle payment submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (calculatedAmount <= 0) {
      toast.warning("Please select items to pay or enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build the list of installments to apply this payment to.
      let installmentIds = [];
      if (paymentMode === "installment") {
        installmentIds = selectedInstallments;
      } else if (paymentMode === "full") {
        installmentIds = pendingInstallments.map((i) => i.installmentId);
      } else if (paymentMode === "custom") {
        installmentIds = selectedInstallments;
      }

      // Discount granted (separate from cash). Server applies (cash + discount)
      // to installment balances; only `cash` lands in fee_payments.amount.
      const discount = Math.max(0, parseFloat(discountAmount) || 0);
      const cash = Math.max(0, calculatedAmount - discount);

      const noteParts = [];
      if (notes) noteParts.push(notes);
      if (discount > 0 && discountReason) {
        noteParts.push(`Discount reason: ${discountReason}`);
      }
      const composedNotes =
        noteParts.join(" | ") ||
        `Payment via ${paymentMethod}${transactionRef ? ` - Ref: ${transactionRef}` : ""}`;

      await recordPaymentMutation.mutateAsync({
        data: {
          studentId,
          assignmentId: feeInfo.assignmentId || undefined,
          installmentIds,
          amount: cash,
          discountApplied: discount,
          paymentMethod,
          paymentDate,
          paymentType:
            paymentMode === "full"
              ? "FULL"
              : paymentMode === "installment"
                ? "INSTALLMENT"
                : "PARTIAL",
          notes: composedNotes,
        },
      });

      toast.success("Payment recorded successfully!");
      navigate(`/fees/history/${studentId}`);
    } catch (error) {
      toast.error(`Error recording payment: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  const isLoading = studentLoading || academicLoading || paymentMethodsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
          <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/fees")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Fee Management
        </button>
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Student Not Found
          </h3>
          <p className="text-gray-600">
            Unable to load student fee information.
          </p>
        </div>
      </div>
    );
  }

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
              Record Payment
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Record fee payment for {student.firstName} {student.lastName}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Student Info & Fee Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {student.admissionNo &&
                    `Admission No: ${student.admissionNo} • `}
                  Grade {student.gradeId ? student.gradeId : "N/A"}
                </p>
                {student.staffRelation?.isStaffWard && (
                  <span className="inline-flex items-center mt-2 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Staff ward
                    {student.staffRelation.staffName
                      ? ` of ${student.staffRelation.staffName}`
                      : ""}
                    {student.staffRelation.relation
                      ? ` (${student.staffRelation.relation})`
                      : ""}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Outstanding</p>
                <p
                  className={`text-2xl font-bold ${feeInfo.outstandingAmount > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {formatCurrency(feeInfo.outstandingAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Fee Structure Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Fee Structure
            </h3>
            {feeInfo.feeStructure && feeInfo.feeStructure.length > 0 ? (
              <div className="space-y-2">
                {feeInfo.feeStructure.map((fee, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {fee.feeTypeName}
                      </span>
                      {fee.isMandatory && (
                        <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          Mandatory
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(fee.annualAmount)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-3 px-4 bg-blue-50 dark:bg-blue-900 rounded-lg border-2 border-blue-200">
                  <span className="font-bold text-blue-900 dark:text-blue-100">
                    Total Annual Fees
                  </span>
                  <span className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                    {formatCurrency(feeInfo.totalFees)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No fee structure assigned.</p>
            )}
          </div>

          {/* Payment Mode Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Select Payment Type
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMode("installment")}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  paymentMode === "installment"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  By Installment
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Select installments to pay
                </p>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("custom")}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  paymentMode === "custom"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <IndianRupee className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Custom Amount
                </span>
                <p className="text-xs text-gray-500 mt-1">Enter any amount</p>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("full")}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  paymentMode === "full"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Full Payment
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Pay all outstanding
                </p>
              </button>
            </div>

            {/* Installment Selection */}
            {paymentMode === "installment" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Select Installments
                  </h4>
                  <button
                    type="button"
                    onClick={selectAllInstallments}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedInstallments.length === pendingInstallments.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                {pendingInstallments.length > 0 ? (
                  <div className="space-y-2">
                    {pendingInstallments.map((inst) => {
                      const isSelected = selectedInstallments.includes(
                        inst.installmentId,
                      );
                      const isOverdue =
                        new Date(inst.dueDate) < new Date() &&
                        inst.status !== "PAID";

                      return (
                        <div
                          key={inst.installmentId}
                          onClick={() => toggleInstallment(inst.installmentId)}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-green-500 bg-green-50 dark:bg-green-900"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-5 h-5 text-green-600 rounded"
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {inst.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Due: {formatDate(inst.dueDate)}
                                {isOverdue && (
                                  <span className="ml-2 text-red-600 font-medium">
                                    (Overdue)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Balance</p>
                            <p
                              className={`font-bold ${isOverdue ? "text-red-600" : "text-gray-900 dark:text-white"}`}
                            >
                              {formatCurrency(inst.balanceAmount)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                    No pending installments
                  </p>
                )}

                {/* Individual Fees */}
                {pendingIndividualFees.length > 0 && (
                  <>
                    <h4 className="font-medium text-gray-900 dark:text-white mt-6">
                      Individual/Additional Fees
                    </h4>
                    <div className="space-y-2">
                      {pendingIndividualFees.map((fee) => {
                        const isSelected = selectedIndividualFees.includes(
                          fee.id,
                        );

                        return (
                          <div
                            key={fee.id}
                            onClick={() => toggleIndividualFee(fee.id)}
                            className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-5 h-5 text-yellow-600 rounded"
                              />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {fee.feeTypeName ||
                                    fee.description ||
                                    "Additional Fee"}
                                </p>
                                {fee.reason && (
                                  <p className="text-sm text-gray-500">
                                    {fee.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="font-bold text-yellow-700">
                              {formatCurrency(fee.amount)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Custom Amount Input */}
            {paymentMode === "custom" && (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enter Amount
                  </span>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="0"
                      min="1"
                      max={feeInfo.outstandingAmount}
                      className="w-full pl-8 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum: {formatCurrency(feeInfo.outstandingAmount)}
                  </p>
                </label>
              </div>
            )}

            {/* Full Payment Summary */}
            {paymentMode === "full" && (
              <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-purple-900 dark:text-purple-100">
                    Full Outstanding Amount
                  </span>
                  <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {formatCurrency(feeInfo.outstandingAmount)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Payment Form */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-blue-600" />
              Payment Summary
            </h3>

            {(() => {
              const discount = Math.max(0, parseFloat(discountAmount) || 0);
              const cash = Math.max(0, calculatedAmount - discount);
              return (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Total Fees</span>
                    <span>{formatCurrency(feeInfo.totalFees)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Already Paid</span>
                    <span className="text-green-600">
                      -{formatCurrency(feeInfo.totalPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Outstanding</span>
                    <span className="text-red-600">
                      {formatCurrency(feeInfo.outstandingAmount)}
                    </span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-gray-600">
                    <span>Selected for payment</span>
                    <span>{formatCurrency(calculatedAmount)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Discount applied</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">
                      Cash to Collect
                    </span>
                    <span className="text-blue-600">
                      {formatCurrency(cash)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Balance After Payment</span>
                    <span>
                      {formatCurrency(
                        Math.max(
                          0,
                          (feeInfo.outstandingAmount || 0) - calculatedAmount,
                        ),
                      )}
                    </span>
                  </div>
                </div>
              );
            })()}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((method) => {
                    const methodKey = method.key || method;
                    const methodLabel =
                      method.label || methodKey.replace(/_/g, " ");
                    const Icon = paymentMethodIcons[methodKey] || CreditCard;
                    return (
                      <button
                        key={methodKey}
                        type="button"
                        onClick={() => setPaymentMethod(methodKey)}
                        className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                          paymentMethod === methodKey
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">
                          {methodLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                />
              </div>

              {/* Transaction Reference (for non-cash payments) */}
              {paymentMethod !== "CASH" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction Reference
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Enter transaction/cheque number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  />
                </div>
              )}

              {/* Discount (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discount (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    max={calculatedAmount || undefined}
                    step="1"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Reduces the cash to collect; the installment closes for the full
                  selected amount.
                </p>
                {parseFloat(discountAmount) > 0 && (
                  <input
                    type="text"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    placeholder="Reason for discount (recorded in notes)"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-sm"
                  />
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={calculatedAmount <= 0 || isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center ${
                  calculatedAmount > 0 && !isSubmitting
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Record Payment of{" "}
                    {formatCurrency(
                      Math.max(
                        0,
                        calculatedAmount -
                          (Math.max(0, parseFloat(discountAmount) || 0)),
                      ),
                    )}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordPayment;
