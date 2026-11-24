import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icons from "../../utils/icons";
import {
  useExams,
  useDeleteExam,
  useGradesOptions,
} from "../../hooks/useApiHooks";
import { useToast, useConfirm } from "../../context/UIProvider";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  SearchFilterBar,
} from "../Common";

const EXAM_TYPE_LABEL = {
  EXAM: "Exam",
  REGULAR_ASSESSMENT: "Regular Assessment",
};

const STATUS_BADGE = {
  DRAFT: "bg-gray-100 text-gray-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  ONGOING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  PUBLISHED: "bg-purple-100 text-purple-800",
};

const Examinations = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  const [filters, setFilters] = useState({ gradeId: "", examType: "" });
  const [search, setSearch] = useState("");

  const { data: examsResp, isLoading, error, refetch } = useExams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
  );
  const { data: gradesResp } = useGradesOptions();
  const deleteExam = useDeleteExam();

  const exams = useMemo(() => {
    const raw = examsResp?.data ?? examsResp ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [examsResp]);

  const gradeOptions = useMemo(() => {
    const raw = gradesResp?.data ?? gradesResp ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return [
      { value: "", label: "All grades" },
      ...list.map((g) => ({
        value: g.gradeId || g.id || g.grade,
        label: g.grade || g.name || g.label,
      })),
    ];
  }, [gradesResp]);

  const filteredExams = useMemo(() => {
    if (!search.trim()) return exams;
    const q = search.toLowerCase();
    return exams.filter((e) => (e.examName || "").toLowerCase().includes(q));
  }, [exams, search]);

  const handleDelete = async (exam) => {
    const ok = await confirm({
      title: "Delete exam?",
      message: `This will remove "${exam.examName}" and its subjects. Recorded marks are preserved but hidden.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await deleteExam.mutateAsync({ id: exam.examId });
      toast.success("Exam deleted");
    } catch (err) {
      toast.error(err?.message || "Failed to delete exam");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Examinations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Schedule exams &amp; regular assessments, record marks, publish report cards.
          </p>
        </div>
        <button
          onClick={() => navigate("/examinations/new")}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Icons.Plus className="w-4 h-4 mr-2" />
          New Exam
        </button>
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by exam name..."
        filters={[
          {
            value: filters.gradeId,
            onChange: (v) => setFilters((f) => ({ ...f, gradeId: v })),
            ariaLabel: "Grade",
            options: gradeOptions,
          },
          {
            value: filters.examType,
            onChange: (v) => setFilters((f) => ({ ...f, examType: v })),
            ariaLabel: "Type",
            options: [
              { value: "", label: "All types" },
              { value: "EXAM", label: "Exam" },
              { value: "REGULAR_ASSESSMENT", label: "Regular Assessment" },
            ],
          },
        ]}
      />

      {isLoading && <LoadingState message="Loading exams..." size="lg" />}

      {!isLoading && error && (
        <ErrorState error={error} title="Error loading exams" onRetry={refetch} />
      )}

      {!isLoading && !error && filteredExams.length === 0 && (
        <EmptyState
          icon={Icons.ClipboardList}
          title="No exams yet"
          description="Create your first exam to schedule subjects and enter marks."
          action={
            <button
              onClick={() => navigate("/examinations/new")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Icons.Plus className="w-4 h-4 mr-2" />
              Create Exam
            </button>
          }
        />
      )}

      {!isLoading && !error && filteredExams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => (
            <div
              key={exam.examId}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {exam.examName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {EXAM_TYPE_LABEL[exam.examType] || exam.examType} ·{" "}
                    {exam.academicYear}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_BADGE[exam.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {exam.status}
                </span>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                <div className="flex items-center">
                  <Icons.BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                  {exam.examSubjects?.length || 0} subject(s)
                </div>
                <div className="flex items-center">
                  <Icons.School className="w-4 h-4 mr-2 text-gray-400" />
                  {exam.grade || exam.gradeId}
                  {exam.className ? ` · ${exam.className}` : ""}
                </div>
              </div>

              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => navigate(`/examinations/${exam.examId}`)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Icons.Eye className="w-4 h-4 mr-1" />
                  Open
                </button>
                <button
                  onClick={() => handleDelete(exam)}
                  className="inline-flex items-center justify-center px-3 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  aria-label="Delete exam"
                >
                  <Icons.Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Examinations;
