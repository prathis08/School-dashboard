import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icons from "../../utils/icons";
import { useStudentReportCard } from "../../hooks/useApiHooks";
import { LoadingState, ErrorState, EmptyState } from "../Common";

const STATUS_BADGE = {
  PASS: "bg-emerald-100 text-emerald-800",
  FAIL: "bg-red-100 text-red-800",
  ABSENT: "bg-gray-200 text-gray-700",
};

const ReportCard = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [academicYear, setAcademicYear] = useState("");

  const { data, isLoading, error } = useStudentReportCard(
    studentId,
    academicYear ? { academicYear } : {},
  );

  const card = data?.data ?? data;
  const student = card?.student;
  const exams = useMemo(() => card?.exams ?? [], [card]);

  const academicYearOptions = useMemo(() => {
    const ys = new Set(exams.map((e) => e.exam?.academicYear).filter(Boolean));
    return Array.from(ys).sort().reverse();
  }, [exams]);

  if (isLoading) return <LoadingState message="Building report card..." size="lg" />;
  if (error) return <ErrorState error={error} title="Error loading report card" />;
  if (!student)
    return (
      <EmptyState
        icon={Icons.AlertCircle}
        title="Student not found"
        description="The student record could not be located."
      />
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Back"
          >
            <Icons.ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Report Card
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {student.firstName} {student.lastName} · Roll{" "}
              {student.rollNumber || "-"} · {student.studentId}
            </p>
          </div>
        </div>

        {academicYearOptions.length > 0 && (
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="">All academic years</option>
            {academicYearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={() => window.print()}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 print:hidden"
        >
          <Icons.FileText className="w-4 h-4 mr-2" /> Print
        </button>
      </div>

      {exams.length === 0 ? (
        <EmptyState
          icon={Icons.ClipboardList}
          title="No exam results yet"
          description="Once marks are entered and published, they will appear here."
        />
      ) : (
        exams.map(({ exam, subjects, totals }) => (
          <div
            key={exam.examId}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {exam.examName}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {exam.examType === "EXAM" ? "Exam" : "Regular Assessment"} ·{" "}
                  {exam.academicYear}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  STATUS_BADGE[totals.overallStatus] ||
                  "bg-gray-100 text-gray-700"
                }`}
              >
                {totals.overallStatus}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 text-left text-xs uppercase text-gray-500 dark:text-gray-300">
                  <tr>
                    <th className="px-3 py-2">Subject</th>
                    <th className="px-3 py-2 text-right">Marks</th>
                    <th className="px-3 py-2 text-right">Max</th>
                    <th className="px-3 py-2 text-right">%</th>
                    <th className="px-3 py-2">Grade</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {subjects.map((s) => (
                    <tr key={s.resultId}>
                      <td className="px-3 py-2 text-gray-900 dark:text-white">
                        {s.examSubject?.subject?.subjectName || "-"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {s.status === "ABSENT" ? "-" : s.marksObtained ?? "-"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {s.examSubject?.maxMarks ?? "-"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {s.percentage != null ? `${s.percentage}%` : "-"}
                      </td>
                      <td className="px-3 py-2 font-medium">{s.grade ?? "-"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            STATUS_BADGE[s.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                        {s.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700 font-semibold">
                  <tr>
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {totals.obtained}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {totals.max}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {totals.percentage}%
                    </td>
                    <td className="px-3 py-2">{totals.grade}</td>
                    <td className="px-3 py-2" colSpan={2}>
                      {totals.overallStatus}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReportCard;
