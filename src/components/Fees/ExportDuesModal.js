import React, { useEffect, useMemo, useState } from "react";
import Icons from "../../utils/icons";
import {
  useClasses,
  useStartDuesExport,
  useDuesExportStatus,
} from "../../hooks/useApiHooks";
import { enhancedFeesApi } from "../../services/apiClient";
import { getAuthToken } from "../../utils/cookies";

const unwrap = (resp) => {
  if (!resp) return null;
  if (resp.data && typeof resp.data === "object") return resp.data;
  return resp;
};

const ExportDuesModal = ({ isOpen, onClose }) => {
  const [scope, setScope] = useState("all");
  const [classId, setClassId] = useState("");
  const [jobId, setJobId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const { data: classesResponse, isLoading: classesLoading } = useClasses();
  const startExport = useStartDuesExport();
  const { data: statusResponse } = useDuesExportStatus(jobId, {
    enabled: Boolean(jobId),
  });

  const classes = useMemo(() => {
    const raw = classesResponse?.data ?? classesResponse;
    return Array.isArray(raw) ? raw : [];
  }, [classesResponse]);

  const job = unwrap(statusResponse);
  const status = job?.status || (jobId ? "pending" : null);
  const progress = job?.progress ?? 0;
  const message = job?.message || "";

  useEffect(() => {
    if (!isOpen) {
      setScope("all");
      setClassId("");
      setJobId(null);
      setErrorMessage("");
      startExport.reset?.();
    }
    // startExport is intentionally excluded — it's a new reference each render
    // and including it causes an infinite reset/re-render loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const isPreparing = status === "pending" || status === "processing";
  const isReady = status === "ready";
  const isFailed = status === "failed" || Boolean(errorMessage);

  const selectedClass = classes.find((c) => c.classId === classId);

  const handleStart = async () => {
    setErrorMessage("");
    try {
      const payload =
        scope === "class"
          ? {
              scope: "class",
              classId,
              classLabel:
                selectedClass?.className || selectedClass?.grade || classId,
            }
          : { scope: "all" };
      const resp = await startExport.mutateAsync(payload);
      const newJob = unwrap(resp);
      if (newJob?.jobId) setJobId(newJob.jobId);
      else setErrorMessage("Could not start export. Please try again.");
    } catch (err) {
      setErrorMessage(err.message || "Could not start export.");
    }
  };

  const handleDownload = async () => {
    if (!jobId) return;
    try {
      const url = enhancedFeesApi.duesExport.getDownloadUrl(jobId);
      const token = getAuthToken();
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error(`Download failed (${response.status})`);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = job?.filename || "dues_export.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setErrorMessage(err.message || "Download failed.");
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const renderContent = () => {
    if (!jobId) {
      return (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose what dues to export. Includes every outstanding installment
            (overdue, partial, or pending) with a non-zero balance.
          </p>

          <div className="space-y-3 mb-4">
            <label className="flex items-start cursor-pointer p-3 border rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40">
              <input
                type="radio"
                name="dues-scope"
                value="all"
                checked={scope === "all"}
                onChange={() => setScope("all")}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Entire school
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Combined sheet plus a sheet per class with class-wise totals.
                </div>
              </div>
            </label>

            <label className="flex items-start cursor-pointer p-3 border rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40">
              <input
                type="radio"
                name="dues-scope"
                value="class"
                checked={scope === "class"}
                onChange={() => setScope("class")}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  Specific class
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Dues for students assigned to one class only.
                </div>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  disabled={scope !== "class" || classesLoading}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                >
                  <option value="">
                    {classesLoading ? "Loading classes..." : "Select a class"}
                  </option>
                  {classes.map((c) => (
                    <option key={c.classId} value={c.classId}>
                      {c.className}
                      {c.section ? ` - ${c.section}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </div>
          )}
        </>
      );
    }

    return (
      <div className="py-2">
        {isPreparing && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mb-3"></div>
            <div className="font-medium text-gray-900 dark:text-white">
              Preparing dues export...
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {message || "The server is gathering dues data."}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progress, 10)}%` }}
              />
            </div>
          </div>
        )}

        {isReady && (
          <div className="text-center py-4">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Icons.Download className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              Your dues report is ready
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {job?.recordCount != null
                ? `${job.recordCount} due record${job.recordCount === 1 ? "" : "s"} included.`
                : "File is ready to download."}
            </div>
          </div>
        )}

        {isFailed && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {errorMessage || message || "Export failed. Please try again."}
          </div>
        )}
      </div>
    );
  };

  const renderActions = () => {
    if (!jobId) {
      const canStart =
        scope === "all" || (scope === "class" && Boolean(classId));
      return (
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStart}
            disabled={!canStart || startExport.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {startExport.isPending && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            Start Export
          </button>
        </>
      );
    }

    if (isReady) {
      return (
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Icons.Download className="w-4 h-4 mr-2" />
            Download Excel
          </button>
        </>
      );
    }

    if (isFailed) {
      return (
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              setJobId(null);
              setErrorMessage("");
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </>
      );
    }

    return (
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        Run in background
      </button>
    );
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
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
            <Icons.FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Export Dues List
          </h3>
        </div>

        {renderContent()}

        <div className="flex justify-end space-x-3 mt-2">{renderActions()}</div>
      </div>
    </div>
  );
};

export default ExportDuesModal;
