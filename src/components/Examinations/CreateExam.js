import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icons from "../../utils/icons";
import {
  useCreateExam,
  useGradesOptions,
  useSubjects,
  useClasses,
  useEnhancedAcademicYears,
} from "../../hooks/useApiHooks";
import { useToast } from "../../context/UIProvider";
import { LoadingState } from "../Common";
import { extractList } from "../../utils/apiResponse";

const EXAM_TYPES = [
  { value: "EXAM", label: "Exam" },
  { value: "REGULAR_ASSESSMENT", label: "Regular Assessment" },
];

const STATUS_OPTIONS = [
  { value: "SCHEDULED", label: "Scheduled (visible to students)" },
  { value: "DRAFT", label: "Draft (hidden, still being prepared)" },
];

const emptySubjectRow = () => ({
  subjectId: "",
  examDate: "",
  startTime: "",
  endTime: "",
  maxMarks: 100,
  passingMarks: 35,
});

const CreateExam = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    examName: "",
    examType: "EXAM",
    gradeId: "",
    grade: "",
    classId: "",
    className: "",
    academicYear: new Date().getFullYear().toString(),
    academicYearId: "",
    instructions: "",
    status: "SCHEDULED",
    subjects: [emptySubjectRow()],
  });
  const [errors, setErrors] = useState({});

  const { data: gradesResp, isLoading: gradesLoading } = useGradesOptions();
  const { data: classesResp, isLoading: classesLoading } = useClasses();
  const { data: subjectsResp, isLoading: subjectsLoading } = useSubjects();
  const { data: yearsResp } = useEnhancedAcademicYears();
  const createExam = useCreateExam();

  const grades = useMemo(() => extractList(gradesResp), [gradesResp]);
  const classes = useMemo(() => extractList(classesResp), [classesResp]);
  const subjects = useMemo(() => extractList(subjectsResp), [subjectsResp]);
  const academicYears = useMemo(() => extractList(yearsResp), [yearsResp]);

  // Default to the active academic year as soon as the list loads.
  useEffect(() => {
    if (academicYears.length === 0) return;
    setForm((prev) => {
      if (prev.academicYearId) return prev;
      const active = academicYears.find((y) => y.isActive) || academicYears[0];
      return {
        ...prev,
        academicYearId: active.academicYearId,
        academicYear: active.name || prev.academicYear,
      };
    });
  }, [academicYears]);

  // Classes filtered down to the picked grade — only show after a grade is selected.
  const classesForGrade = useMemo(
    () =>
      form.gradeId
        ? classes.filter(
            (c) => (c.gradeId || c.grade_id) === form.gradeId,
          )
        : [],
    [classes, form.gradeId],
  );

  const updateField = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  const updateSubjectRow = (idx, patch) =>
    setForm((f) => ({
      ...f,
      subjects: f.subjects.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    }));

  const addRow = () =>
    setForm((f) => ({ ...f, subjects: [...f.subjects, emptySubjectRow()] }));

  const removeRow = (idx) =>
    setForm((f) => ({
      ...f,
      subjects: f.subjects.filter((_, i) => i !== idx),
    }));

  const validate = () => {
    const next = {};
    if (!form.examName.trim()) next.examName = "Exam name is required";
    if (!form.gradeId) next.gradeId = "Grade is required";
    if (!form.academicYear.trim())
      next.academicYear = "Academic year is required";
    if (form.subjects.length === 0)
      next.subjects = "At least one subject is required";
    form.subjects.forEach((row, i) => {
      if (!row.subjectId) next[`subjects.${i}.subjectId`] = "Pick a subject";
      if (!row.examDate) next[`subjects.${i}.examDate`] = "Pick a date";
      if (Number(row.maxMarks) <= 0)
        next[`subjects.${i}.maxMarks`] = "Max marks must be > 0";
      if (Number(row.passingMarks) < 0)
        next[`subjects.${i}.passingMarks`] = "Passing marks must be ≥ 0";
      if (Number(row.passingMarks) > Number(row.maxMarks))
        next[`subjects.${i}.passingMarks`] = "Passing marks cannot exceed max";
    });
    const duplicateSubject =
      new Set(form.subjects.map((s) => s.subjectId).filter(Boolean)).size !==
      form.subjects.filter((s) => s.subjectId).length;
    if (duplicateSubject) next.subjects = "Each subject can be added only once";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const payload = {
        ...form,
        subjects: form.subjects.map((s) => ({
          ...s,
          maxMarks: Number(s.maxMarks),
          passingMarks: Number(s.passingMarks),
          startTime: s.startTime || undefined,
          endTime: s.endTime || undefined,
        })),
      };
      const res = await createExam.mutateAsync({ data: payload });
      const created = res?.data ?? res;
      toast.success("Exam created");
      navigate(`/examinations/${created.examId}`);
    } catch (err) {
      toast.error(err?.message || "Failed to create exam");
    }
  };

  if (gradesLoading || subjectsLoading || classesLoading) {
    return <LoadingState message="Loading form..." size="lg" />;
  }

  return (
    <div className="p-6 w-full">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/examinations")}
          className="mr-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Back"
        >
          <Icons.ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          New Exam
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Exam Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.examName}
              onChange={(e) => updateField("examName", e.target.value)}
              required
              placeholder="e.g. Mid-term Examination"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
            {errors.examName && (
              <p className="text-red-500 text-xs mt-1">{errors.examName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.examType}
              onChange={(e) => updateField("examType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              {EXAM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Grade <span className="text-red-500">*</span>
            </label>
            <select
              value={form.gradeId}
              onChange={(e) => {
                const id = e.target.value;
                const picked = grades.find(
                  (g) => (g.gradeId || g.id) === id,
                );
                setForm((f) => ({
                  ...f,
                  gradeId: id,
                  grade: picked?.grade || picked?.name || "",
                  // Reset class selection when grade changes
                  classId: "",
                  className: "",
                }));
              }}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="">Select grade</option>
              {grades.map((g) => (
                <option key={g.gradeId || g.id} value={g.gradeId || g.id}>
                  {g.grade || g.name}
                </option>
              ))}
            </select>
            {errors.gradeId && (
              <p className="text-red-500 text-xs mt-1">{errors.gradeId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Class <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <select
              value={form.classId}
              onChange={(e) => {
                const id = e.target.value;
                const picked = classesForGrade.find(
                  (c) => (c.classId || c.class_id) === id,
                );
                setForm((f) => ({
                  ...f,
                  classId: id,
                  className: picked?.className || picked?.class_name || "",
                }));
              }}
              disabled={!form.gradeId}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:opacity-50"
            >
              <option value="">
                {form.gradeId
                  ? "All classes in this grade"
                  : "Select grade first"}
              </option>
              {classesForGrade.map((c) => (
                <option
                  key={c.classId || c.class_id}
                  value={c.classId || c.class_id}
                >
                  {c.className || c.class_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Academic Year <span className="text-red-500">*</span>
            </label>
            {academicYears.length > 0 ? (
              <select
                value={form.academicYearId}
                onChange={(e) => {
                  const id = e.target.value;
                  const year = academicYears.find(
                    (y) => y.academicYearId === id,
                  );
                  setForm((prev) => ({
                    ...prev,
                    academicYearId: id,
                    academicYear: year?.name || prev.academicYear,
                  }));
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select academic year</option>
                {academicYears.map((y) => (
                  <option key={y.academicYearId} value={y.academicYearId}>
                    {y.name}
                    {y.isActive ? " (active)" : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={form.academicYear}
                onChange={(e) => updateField("academicYear", e.target.value)}
                required
                placeholder="2025-2026"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            )}
            {errors.academicYear && (
              <p className="text-red-500 text-xs mt-1">{errors.academicYear}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Instructions (optional)
          </label>
          <textarea
            value={form.instructions}
            onChange={(e) => updateField("instructions", e.target.value)}
            rows={3}
            placeholder="General instructions shown alongside the exam..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Subjects &amp; Schedule
            </h2>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
            >
              <Icons.Plus className="w-4 h-4 mr-1" /> Add subject
            </button>
          </div>

          {errors.subjects && (
            <p className="text-red-500 text-xs mb-2">{errors.subjects}</p>
          )}

          <div className="space-y-3">
            {form.subjects.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="md:col-span-3">
                  <label className="text-xs text-gray-500">Subject</label>
                  <select
                    value={row.subjectId}
                    onChange={(e) =>
                      updateSubjectRow(idx, { subjectId: e.target.value })
                    }
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                  >
                    <option value="">Select...</option>
                    {subjects.map((s) => (
                      <option
                        key={s.subjectId || s.subject_id}
                        value={s.subjectId || s.subject_id}
                      >
                        {s.subjectName || s.subject_name}
                      </option>
                    ))}
                  </select>
                  {errors[`subjects.${idx}.subjectId`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`subjects.${idx}.subjectId`]}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500">Date</label>
                  <input
                    type="date"
                    value={row.examDate}
                    onChange={(e) =>
                      updateSubjectRow(idx, { examDate: e.target.value })
                    }
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                  />
                  {errors[`subjects.${idx}.examDate`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`subjects.${idx}.examDate`]}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500">Start</label>
                  <input
                    type="time"
                    value={row.startTime}
                    onChange={(e) =>
                      updateSubjectRow(idx, { startTime: e.target.value })
                    }
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500">End</label>
                  <input
                    type="time"
                    value={row.endTime}
                    onChange={(e) =>
                      updateSubjectRow(idx, { endTime: e.target.value })
                    }
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs text-gray-500">Max</label>
                  <input
                    type="number"
                    min="1"
                    value={row.maxMarks}
                    onChange={(e) =>
                      updateSubjectRow(idx, { maxMarks: e.target.value })
                    }
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs text-gray-500">Pass</label>
                  <input
                    type="number"
                    min="0"
                    value={row.passingMarks}
                    onChange={(e) =>
                      updateSubjectRow(idx, { passingMarks: e.target.value })
                    }
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                  />
                  {errors[`subjects.${idx}.passingMarks`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`subjects.${idx}.passingMarks`]}
                    </p>
                  )}
                </div>

                <div className="md:col-span-1 flex items-end justify-end h-full">
                  {form.subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                      aria-label="Remove row"
                    >
                      <Icons.Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate("/examinations")}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createExam.isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {createExam.isLoading ? "Creating..." : "Create Exam"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExam;
