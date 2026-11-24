import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icons from "../../utils/icons";
import {
  useExam,
  useExamStudents,
  useExamResults,
  useSubmitMarks,
  useUpdateExam,
} from "../../hooks/useApiHooks";
import { useToast } from "../../context/UIProvider";
import { LoadingState, ErrorState, EmptyState } from "../Common";

const STATUS_OPTIONS = [
  { value: "PASS", label: "Pass" },
  { value: "FAIL", label: "Fail" },
  { value: "ABSENT", label: "Absent" },
];

const EXAM_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PUBLISHED", label: "Published" },
];

const EXAM_STATUS_BADGE = {
  DRAFT: "bg-gray-100 text-gray-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  ONGOING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  PUBLISHED: "bg-purple-100 text-purple-800",
};

const ExamDetail = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: examResp, isLoading: examLoading, error: examError } = useExam(
    examId,
  );
  const { data: studentsResp, isLoading: studentsLoading } = useExamStudents(
    examId,
  );
  const { data: resultsResp, refetch: refetchResults } = useExamResults(examId);
  const submitMarks = useSubmitMarks();
  const updateExam = useUpdateExam();

  const exam = examResp?.data ?? examResp;
  const students = useMemo(() => {
    const raw = studentsResp?.data?.students ?? studentsResp?.data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [studentsResp]);
  const results = useMemo(() => {
    const raw = resultsResp?.data ?? resultsResp ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [resultsResp]);

  const subjects = useMemo(() => exam?.examSubjects ?? [], [exam]);
  const [activeSubjectId, setActiveSubjectId] = useState("");

  useEffect(() => {
    if (!activeSubjectId && subjects.length > 0) {
      setActiveSubjectId(subjects[0].examSubjectId);
    }
  }, [subjects, activeSubjectId]);

  const activeSubject = subjects.find(
    (s) => s.examSubjectId === activeSubjectId,
  );

  // Map studentId → entry for the active subject
  const [entries, setEntries] = useState({});

  useEffect(() => {
    if (!activeSubject) return;
    const seeded = {};
    students.forEach((stu) => {
      const existing = results.find(
        (r) =>
          r.studentId === stu.studentId &&
          r.examSubjectId === activeSubject.examSubjectId,
      );
      seeded[stu.studentId] = existing
        ? {
            marksObtained: existing.marksObtained ?? "",
            status: existing.status,
            remarks: existing.remarks ?? "",
          }
        : { marksObtained: "", status: "PASS", remarks: "" };
    });
    setEntries(seeded);
  }, [activeSubject, students, results]);

  const updateEntry = (studentId, patch) =>
    setEntries((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], ...patch },
    }));

  const handleSaveMarks = async () => {
    if (!activeSubject) return;
    const payload = students.map((stu) => {
      const e = entries[stu.studentId] || {};
      const isAbsent = e.status === "ABSENT";
      return {
        studentId: stu.studentId,
        marksObtained:
          isAbsent || e.marksObtained === ""
            ? null
            : Number(e.marksObtained),
        status: isAbsent ? "ABSENT" : undefined,
        remarks: e.remarks || undefined,
      };
    });

    try {
      await submitMarks.mutateAsync({
        examId,
        examSubjectId: activeSubject.examSubjectId,
        entries: payload.filter(
          (p) => p.marksObtained != null || p.status === "ABSENT",
        ),
      });
      toast.success("Marks saved");
      refetchResults();
    } catch (err) {
      toast.error(err?.message || "Failed to save marks");
    }
  };

  if (examLoading) return <LoadingState message="Loading exam..." size="lg" />;
  if (examError) return <ErrorState error={examError} />;
  if (!exam)
    return <EmptyState icon={Icons.AlertCircle} title="Exam not found" />;

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/examinations")}
            className="mr-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Back"
          >
            <Icons.ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {exam.examName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {exam.examType === "EXAM" ? "Exam" : "Regular Assessment"} ·{" "}
              {exam.academicYear} · {exam.grade || exam.gradeId}
              {exam.className ? ` · ${exam.className}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              EXAM_STATUS_BADGE[exam.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {exam.status}
          </span>
          <select
            value={exam.status}
            disabled={updateExam.isLoading}
            onChange={async (e) => {
              const next = e.target.value;
              if (next === exam.status) return;
              try {
                await updateExam.mutateAsync({
                  id: examId,
                  data: { status: next },
                });
                toast.success(`Status updated to ${next}`);
              } catch (err) {
                toast.error(err?.message || "Failed to update status");
              }
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:opacity-50"
            aria-label="Change exam status"
          >
            {EXAM_STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                Mark as {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          icon={Icons.BookOpen}
          title="No subjects on this exam"
          description="Edit the exam to add subjects before recording marks."
        />
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              <nav className="flex gap-1 p-2" aria-label="Exam subjects">
                {subjects.map((s) => (
                  <button
                    key={s.examSubjectId}
                    onClick={() => setActiveSubjectId(s.examSubjectId)}
                    className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                      activeSubjectId === s.examSubjectId
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {s.subject?.subjectName || s.subjectId}
                    <span className="ml-2 text-xs opacity-75">
                      {s.examDate}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {activeSubject && (
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {activeSubject.subject?.subjectName || "Subject"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Max {activeSubject.maxMarks} · Pass{" "}
                      {activeSubject.passingMarks} ·{" "}
                      {activeSubject.examDate}
                      {activeSubject.startTime
                        ? ` · ${activeSubject.startTime}`
                        : ""}
                    </p>
                  </div>
                  <button
                    onClick={handleSaveMarks}
                    disabled={submitMarks.isLoading || students.length === 0}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Icons.Save className="w-4 h-4 mr-2" />
                    {submitMarks.isLoading ? "Saving..." : "Save marks"}
                  </button>
                </div>

                {studentsLoading ? (
                  <LoadingState message="Loading students..." />
                ) : students.length === 0 ? (
                  <EmptyState
                    icon={Icons.GraduationCap}
                    title="No students in this grade"
                    description="Add students to this grade to record marks."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700 text-left text-xs uppercase text-gray-500 dark:text-gray-300">
                        <tr>
                          <th className="px-3 py-2">Roll</th>
                          <th className="px-3 py-2">Student</th>
                          <th className="px-3 py-2 w-32">Marks</th>
                          <th className="px-3 py-2 w-32">Status</th>
                          <th className="px-3 py-2">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {students.map((stu) => {
                          const e = entries[stu.studentId] || {};
                          const isAbsent = e.status === "ABSENT";
                          return (
                            <tr key={stu.studentId}>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                                {stu.rollNumber || "-"}
                              </td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white">
                                {stu.firstName} {stu.lastName}
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  min="0"
                                  max={activeSubject.maxMarks}
                                  value={isAbsent ? "" : e.marksObtained}
                                  disabled={isAbsent}
                                  onChange={(ev) =>
                                    updateEntry(stu.studentId, {
                                      marksObtained: ev.target.value,
                                    })
                                  }
                                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 disabled:opacity-50"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <select
                                  value={e.status || "PASS"}
                                  onChange={(ev) =>
                                    updateEntry(stu.studentId, {
                                      status: ev.target.value,
                                    })
                                  }
                                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                                >
                                  {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={e.remarks || ""}
                                  onChange={(ev) =>
                                    updateEntry(stu.studentId, {
                                      remarks: ev.target.value,
                                    })
                                  }
                                  placeholder="Optional note"
                                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ExamDetail;
