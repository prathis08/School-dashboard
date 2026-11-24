import React, { useEffect, useMemo, useState } from "react";
import Icons from "../../utils/icons";
import { useClasses, useAttendanceRoster, useMarkAttendance } from "../../hooks/useApiHooks";
import { useToast } from "../../context/UIProvider";
import { LoadingState, ErrorState, EmptyState } from "../Common";

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present", short: "P" },
  { value: "ABSENT", label: "Absent", short: "A" },
  { value: "LATE", label: "Late", short: "L" },
  { value: "EXCUSED", label: "Excused", short: "E" },
];

const STATUS_BTN = {
  PRESENT: "bg-emerald-600 text-white border-emerald-600",
  ABSENT: "bg-red-600 text-white border-red-600",
  LATE: "bg-amber-500 text-white border-amber-500",
  EXCUSED: "bg-slate-500 text-white border-slate-500",
};

const STATUS_BADGE = {
  PRESENT: "bg-emerald-100 text-emerald-800",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-amber-100 text-amber-800",
  EXCUSED: "bg-slate-100 text-slate-700",
  UNMARKED: "bg-gray-100 text-gray-600",
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const extractList = (resp) => {
  const raw = resp?.data ?? resp ?? [];
  return Array.isArray(raw) ? raw : [];
};

const Attendance = () => {
  const toast = useToast();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [date, setDate] = useState(todayStr());
  const [entries, setEntries] = useState([]);
  const [dirty, setDirty] = useState(false);

  const { data: classesResp, isLoading: classesLoading } = useClasses();
  const classes = useMemo(() => extractList(classesResp), [classesResp]);

  const {
    data: rosterResp,
    isLoading: rosterLoading,
    error,
    refetch,
  } = useAttendanceRoster(selectedClassId, date);

  const saveAttendance = useMarkAttendance();

  const students = useMemo(
    () => rosterResp?.data?.students ?? [],
    [rosterResp],
  );

  // Hydrate local editable state whenever the roster loads/changes.
  useEffect(() => {
    setEntries(
      students.map((s) => ({
        studentId: s.studentId,
        name:
          s.name ||
          `${s.firstName || ""} ${s.lastName || ""}`.trim() ||
          s.studentId,
        rollNumber: s.rollNumber || "-",
        status: s.status || "UNMARKED",
        remarks: s.remarks || "",
      })),
    );
    setDirty(false);
  }, [students]);

  const summary = useMemo(() => {
    const counts = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0,
      UNMARKED: 0,
    };
    entries.forEach((e) => {
      const key = e.status && counts[e.status] !== undefined ? e.status : "UNMARKED";
      counts[key] += 1;
    });
    const total = entries.length;
    const marked = total - counts.UNMARKED;
    const attended = counts.PRESENT + counts.LATE;
    return {
      ...counts,
      total,
      marked,
      percentage: marked ? Math.round((attended / marked) * 100) : 0,
    };
  }, [entries]);

  const setStatus = (studentId, status) => {
    setEntries((prev) =>
      prev.map((e) => (e.studentId === studentId ? { ...e, status } : e)),
    );
    setDirty(true);
  };

  const setRemarks = (studentId, remarks) => {
    setEntries((prev) =>
      prev.map((e) => (e.studentId === studentId ? { ...e, remarks } : e)),
    );
    setDirty(true);
  };

  const markAll = (status) => {
    setEntries((prev) => prev.map((e) => ({ ...e, status })));
    setDirty(true);
  };

  const handleSave = async () => {
    const markedEntries = entries.filter(
      (entry) => entry.status && entry.status !== "UNMARKED",
    );

    if (markedEntries.length === 0) {
      toast.error("Mark at least one student before saving");
      return;
    }

    try {
      await saveAttendance.mutateAsync({
        data: {
          classId: selectedClassId,
          date,
          entries: markedEntries.map((entry) => ({
            studentId: entry.studentId,
            status: entry.status,
            remarks: entry.remarks || undefined,
          })),
        },
      });
      const skipped = entries.length - markedEntries.length;
      toast.success(
        skipped
          ? `Attendance saved (${skipped} unmarked skipped)`
          : "Attendance saved",
      );
      setDirty(false);
    } catch (err) {
      toast.error(err?.message || "Failed to save attendance");
    }
  };

  const selectedClass = classes.find((c) => c.classId === selectedClassId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Attendance
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Mark daily attendance for a class and review the summary.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">
              {classesLoading ? "Loading classes..." : "Select a class"}
            </option>
            {classes.map((c) => (
              <option key={c.classId} value={c.classId}>
                {c.className || `${c.grade || ""} ${c.section || ""}`.trim()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {!selectedClassId && (
        <EmptyState
          icon={Icons.ClipboardCheck}
          title="Select a class to take attendance"
          description="Choose a class and date above to load the student roster."
        />
      )}

      {selectedClassId && rosterLoading && (
        <LoadingState message="Loading roster..." size="lg" />
      )}

      {selectedClassId && !rosterLoading && error && (
        <ErrorState
          error={error}
          title="Error loading roster"
          onRetry={refetch}
        />
      )}

      {selectedClassId && !rosterLoading && !error && entries.length === 0 && (
        <EmptyState
          icon={Icons.Users}
          title="No students in this class"
          description="Add students to this class to start marking attendance."
        />
      )}

      {selectedClassId && !rosterLoading && !error && entries.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { key: "total", label: "Total", value: summary.total },
              { key: "PRESENT", label: "Present", value: summary.PRESENT },
              { key: "ABSENT", label: "Absent", value: summary.ABSENT },
              { key: "LATE", label: "Late", value: summary.LATE },
              {
                key: "UNMARKED",
                label: "Unmarked",
                value: summary.UNMARKED,
              },
              {
                key: "percentage",
                label: "Attendance %",
                value: `${summary.percentage}%`,
              },
            ].map((card) => (
              <div
                key={card.key}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Mark all as:
              </span>
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => markAll(opt.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={saveAttendance.isPending}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              <Icons.Save className="w-4 h-4 mr-2" />
              {saveAttendance.isPending ? "Saving..." : "Save Attendance"}
            </button>
          </div>

          {/* Roster */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {selectedClass?.className || "Class"} · {date}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {entries.length} student(s)
                  {dirty && " · unsaved changes"}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                      Roll
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                      Student
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {entries.map((entry) => (
                    <tr key={entry.studentId}>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {entry.rollNumber}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {entry.name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {STATUS_OPTIONS.map((opt) => {
                            const active = entry.status === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() =>
                                  setStatus(entry.studentId, opt.value)
                                }
                                title={opt.label}
                                className={`w-8 h-8 rounded-md text-xs font-semibold border transition-colors ${
                                  active
                                    ? STATUS_BTN[opt.value]
                                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                              >
                                {opt.short}
                              </button>
                            );
                          })}
                          <span
                            className={`ml-1 self-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              STATUS_BADGE[entry.status] || ""
                            }`}
                          >
                            {entry.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={entry.remarks}
                          onChange={(e) =>
                            setRemarks(entry.studentId, e.target.value)
                          }
                          placeholder="Optional note"
                          className="w-full min-w-[140px] px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;
