import React, { useEffect, useMemo, useState } from "react";
import { Percent, IndianRupee, AlertCircle, BadgeCheck } from "lucide-react";
import { useUpdateFeeAssignment } from "../../hooks/useApiHooks";
import { useToast } from "../../context/UIProvider";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const EditDiscountModal = ({ isOpen, onClose, student }) => {
  const toast = useToast();
  const update = useUpdateFeeAssignment();
  const feeInfo = student?.feeInfo || {};

  const [percentage, setPercentage] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPercentage(
        feeInfo.discountPercentage > 0 ? String(feeInfo.discountPercentage) : "",
      );
      setAmount(
        feeInfo.discountAmount > 0 ? String(feeInfo.discountAmount) : "",
      );
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, student?.studentId]);

  const totalAnnualFromStructure = useMemo(() => {
    return (feeInfo.feeStructure || []).reduce(
      (sum, fee) => sum + parseFloat(fee.annualAmount || 0),
      0,
    );
  }, [feeInfo.feeStructure]);

  const baseTotal = totalAnnualFromStructure || feeInfo.totalFees || 0;
  const numericPercentage = Math.max(
    0,
    Math.min(100, parseFloat(percentage) || 0),
  );
  const numericAmount = Math.max(0, parseFloat(amount) || 0);
  const previewFinal = Math.max(
    0,
    baseTotal - numericAmount - (baseTotal * numericPercentage) / 100,
  );

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!feeInfo.assignmentId) {
      setError(
        "This student doesn't have a fee assignment yet. Record any payment once to create one, then come back to set a discount.",
      );
      return;
    }

    try {
      await update.mutateAsync({
        assignmentId: feeInfo.assignmentId,
        data: {
          discountPercentage: numericPercentage,
          discountAmount: numericAmount,
        },
      });
      toast.success("Discount updated");
      onClose();
    } catch (err) {
      setError(err.message || "Could not update discount");
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <Percent className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Discount
            </h3>
            <p className="text-sm text-gray-500">
              {student?.firstName} {student?.lastName}
            </p>
          </div>
        </div>

        {student?.staffRelation?.isStaffWard && (
          <div className="mb-4 flex items-start p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <BadgeCheck className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-amber-900">
                Staff ward
                {student.staffRelation.staffName
                  ? ` of ${student.staffRelation.staffName}`
                  : ""}
                {student.staffRelation.relation
                  ? ` (${student.staffRelation.relation})`
                  : ""}
              </div>
              <div className="text-amber-700">
                This student is the ward of a staff member — staff-discount
                eligibility may apply.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Discount Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="0"
                className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                %
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Flat Discount Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Both fields apply: final = total − flat − (total × percentage).
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Total annual</span>
              <span>{formatCurrency(baseTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>− Flat discount</span>
              <span>{formatCurrency(numericAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>− Percentage ({numericPercentage}%)</span>
              <span>
                {formatCurrency((baseTotal * numericPercentage) / 100)}
              </span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
              <span>Final annual</span>
              <span className="text-blue-600">
                {formatCurrency(previewFinal)}
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={update.isPending}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={update.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {update.isPending && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              <IndianRupee className="w-4 h-4 mr-2" />
              Save Discount
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDiscountModal;
