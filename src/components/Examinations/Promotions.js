import React, { useEffect, useMemo, useState } from "react";
import Icons from "../../utils/icons";
import {
  useEnhancedAcademicYears,
  useGradesOptions,
  useClasses,
  usePromotionPreview,
  useRunPromotion,
} from "../../hooks/useApiHooks";
import { useToast, useConfirm } from "../../context/UIProvider";
import { LoadingState, ErrorState, EmptyState } from "../Common";

const asList = (resp) => {
  const raw = resp?.data ?? resp ?? [];
  return Array.isArray(raw) ? raw : [];
};

const DECISION_BADGE = {
  PROMOTE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  RETAIN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  GRADUATE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  NO_RESULTS: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

const Promotions = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const { data: yearsResp, isLoading: yearsLoading } = useEnhancedAcademicYears();
  const { data: gradesResp, isLoading: gradesLoading } = useGradesOptions();
  const { data: classesResp, isLoading: classesLoading } = useClasses();

  const years = useMemo(() => asList(yearsResp), [yearsResp]);
  const grades = useMemo(() => asList(gradesResp), [gradesResp]);
  const classes = useMemo(() => asList(classesResp), [classesResp]);

  const [academicYearId, setAcademicYearId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [classId, setClassId] = useState("");
  const [targetAcademicYearId, setTargetAcademicYearId] = useState("");
  const [includeNoResults, setIncludeNoResults] = useState(false);

  useEffect(() => {
    if (!academicYearId && years.length) {
      const active = years.find((y) => y.isActive) || years[0];
      setAcademicYearId(active.academicYearId);
    }
  }, [years, academicYearId]);

  useEffect(() => {
    if (gradeId || grades.length === 0 || classesLoading) return;
    // Prefer a grade that actually has classes so the preview has data.
    const classWithGrade = classes.find((cls) => cls.gradeId || cls.grade_id);
    const preferred = classWithGrade?.gradeId || classWithGrade?.grade_id;
    setGradeId(
      preferred || grades[0].gradeId || grades[0].id || grades[0].grade,
    );
  }, [grades, classes, classesLoading, gradeId]);

  const filteredClasses = useMemo(
    () =>
      classes.filter(
        (c) => !gradeId || (c.gradeId || c.grade_id) === gradeId,
      ),
    [classes, gradeId],
  );

  const {
    data: previewResp,
    isLoading: previewLoading,
    error: previewError,
    refetch: refetchPreview,
  } = usePromotionPreview({ academicYearId, gradeId, classId: classId || undefined });

  const runPromotion = useRunPromotion();

  const preview = previewResp?.data;
  const students = preview?.students || [];
  const counts = preview?.counts;

  const gradeLabel = useMemo(() => {
    if (!preview) return "";
    const raw = preview.grade;
    if (raw && !String(raw).startsWith("GRADE_")) return raw;
    const match = grades.find(
      (g) => (g.gradeId || g.id || g.grade) === preview.gradeId,
    );
    return match?.grade || raw || preview.gradeId || "";
  }, [preview, grades]);

  const suggestedTarget =
    preview?.suggestedTargetYear?.academicYearId || "";

  const handleRun = async () => {
    const ok = await confirm({
      title: "Run promotion?",
      message: `This will process ${students.length} student(s) in ${gradeLabel} for ${preview?.academicYear?.name || ""}. This writes next-year enrollments and moves students' current class.`,
      confirmLabel: "Run promotion",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const result = await runPromotion.mutateAsync({
        data: {
          academicYearId,
          gradeId,
          classId: classId || undefined,
          targetAcademicYearId: targetAcademicYearId || undefined,
          includeNoResults,
        },
      });
      const c = result?.data?.counts;
      toast.success(
        c
          ? `Done — ${c.promote} promoted, ${c.retain} retained, ${c.graduate} graduated`
          : "Promotion completed",
      );
      refetchPreview();
    } catch (err) {
      toast.error(err?.message || "Failed to run promotion");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Promotions
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Preview outcomes and promote students to the next grade based on exam
          scores, attendance and the rules in Exam Settings.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Academic Year
          </label>
          <select
            value={academicYearId}
            onChange={(e) => setAcademicYearId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">
              {yearsLoading ? "Loading..." : "Select year"}
            </option>
            {years.map((y) => (
              <option key={y.academicYearId} value={y.academicYearId}>
                {y.name}
                {y.isActive ? " (active)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Grade
          </label>
          <select
            value={gradeId}
            onChange={(e) => {
              setGradeId(e.target.value);
              setClassId("");
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">
              {gradesLoading ? "Loading..." : "Select grade"}
            </option>
            {grades.map((g) => (
              <option key={g.gradeId || g.grade} value={g.gradeId || g.grade}>
                {g.grade || g.gradeId}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Class (optional)
          </label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">All classes</option>
            {filteredClasses.map((c) => (
              <option key={c.classId} value={c.classId}>
                {c.className}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Promote into
          </label>
          <select
            value={targetAcademicYearId}
            onChange={(e) => setTargetAcademicYearId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">
              {suggestedTarget
                ? `Auto — next year (${preview?.suggestedTargetYear?.name})`
                : "Auto — create next year"}
            </option>
            {years
              .filter((y) => y.academicYearId !== academicYearId)
              .map((y) => (
                <option key={y.academicYearId} value={y.academicYearId}>
                  {y.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {!academicYearId || !gradeId ? (
        <EmptyState
          icon={Icons.ClipboardCheck}
          title="Select an academic year and grade"
          description="Choose a year and grade to preview promotion outcomes."
        />
      ) : previewLoading ? (
        <LoadingState message="Building promotion preview..." size="lg" />
      ) : previewError ? (
        <ErrorState
          error={previewError}
          title="Error building preview"
          onRetry={refetchPreview}
        />
      ) : preview ? (
        <>
          {/* Context banner */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-white">
                {gradeLabel}
              </span>{" "}
              · {preview.academicYear?.name}
              {preview.isTopGrade ? (
                <span className="ml-2 text-amber-600 dark:text-amber-400">
                  Top grade — passing students graduate
                </span>
              ) : (
                <span className="ml-2">
                  → next: {preview.nextGrade?.grade || "—"}
                  {preview.nextClass ? ` · ${preview.nextClass.className}` : ""}
                </span>
              )}
            </div>
            <label className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={includeNoResults}
                onChange={(e) => setIncludeNoResults(e.target.checked)}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              Include students with no results
            </label>
          </div>

          {/* Counts */}
          {counts && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Total", value: counts.total },
                { label: "Promote", value: counts.promote },
                { label: "Retain", value: counts.retain },
                { label: "Graduate", value: counts.graduate },
                { label: "No results", value: counts.noResults },
              ].map((c) => (
                <div
                  key={c.label}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {c.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {c.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={handleRun}
              disabled={runPromotion.isPending || students.length === 0}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              <Icons.Check className="w-4 h-4 mr-2" />
              {runPromotion.isPending ? "Running..." : "Run Promotion"}
            </button>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {[
                      "Roll",
                      "Student",
                      "Score",
                      "Failed",
                      "Attendance",
                      "Next",
                      "Outcome",
                      "Notes",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {students.map((s) => (
                    <tr key={s.studentId}>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {s.rollNumber || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {s.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                        {s.hasResults ? `${s.percentage}% (${s.grade})` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                        {s.failedSubjects}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                        {s.attendancePercentage}%
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                        {s.decision === "GRADUATE"
                          ? "Graduates"
                          : s.nextClassName || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            DECISION_BADGE[s.decision] || ""
                          }`}
                        >
                          {s.decision}
                          {s.conditional ? " (conditional)" : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                        {s.reasons?.length ? s.reasons.join("; ") : "Meets criteria"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {students.length === 0 && (
              <div className="p-6">
                <EmptyState
                  icon={Icons.Users}
                  title="No students found"
                  description="No students are enrolled in this grade for the selected year."
                />
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Promotions;
