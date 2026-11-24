import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icons from "../../utils/icons";
import {
  useTeacher,
  useUpdateTeacher,
  useResetTeacherPassword,
  useSubjects,
  useClasses,
} from "../../hooks/useApiHooks";
import { useToast, useConfirm } from "../../context/UIProvider";
import { LoadingState, ErrorState } from "../Common";
import { extractList } from "../../utils/apiResponse";

const INPUT_CLASS =
  "w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const toDateInput = (value) => {
  if (!value) return "";
  const str = String(value);
  return str.length >= 10 ? str.slice(0, 10) : str;
};

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  required,
  placeholder,
  min,
  step,
  colSpan,
}) => (
  <div className={colSpan === 2 ? "md:col-span-2" : ""}>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      step={step}
      className={`${INPUT_CLASS} ${
        error ? "border-red-400" : "border-gray-300 dark:border-gray-600"
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const EditTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const confirm = useConfirm();
  const { data: teacherResp, isLoading, error } = useTeacher(id);
  const { data: subjectsResp } = useSubjects();
  const { data: classesResp } = useClasses();
  const updateTeacher = useUpdateTeacher();
  const resetTeacherPassword = useResetTeacherPassword();
  const [tempPassword, setTempPassword] = useState("");

  const subjectOptions = useMemo(() => extractList(subjectsResp), [subjectsResp]);
  const classOptions = useMemo(() => extractList(classesResp), [classesResp]);

  const [subjectIds, setSubjectIds] = useState([]);
  const [classIds, setClassIds] = useState([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    qualification: "",
    experience: "",
    dateOfJoining: "",
    phone: "",
    address: "",
    salary: "",
  });
  const [errors, setErrors] = useState({});

  const teacher = useMemo(() => teacherResp?.data, [teacherResp]);

  useEffect(() => {
    if (!teacher) return;
    const personal = teacher.personalInfo || {};
    const professional = teacher.professionalInfo || {};
    setForm({
      firstName: personal.firstName || "",
      lastName: personal.lastName || "",
      email: personal.email || "",
      department: professional.department || "",
      qualification: professional.qualification || "",
      experience:
        professional.experience === 0 || professional.experience
          ? String(professional.experience)
          : "",
      dateOfJoining: toDateInput(professional.dateOfJoining),
      phone: personal.phone || "",
      address: personal.address || "",
      salary:
        professional.salary === 0 || professional.salary
          ? String(professional.salary)
          : "",
    });

    setSubjectIds(
      (teacher.assignments?.subjects || [])
        .map((subject) => subject.subjectId)
        .filter(Boolean),
    );
    setClassIds(
      (teacher.assignments?.managedClasses || [])
        .map((cls) => cls.classId)
        .filter(Boolean),
    );
  }, [teacher]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const toggleSubject = (subjectId) =>
    setSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((value) => value !== subjectId)
        : [...prev, subjectId],
    );

  const toggleClass = (classId) =>
    setClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((value) => value !== classId)
        : [...prev, classId],
    );

  const validate = () => {
    const next = {};
    if (!form.firstName.trim() || form.firstName.trim().length < 2)
      next.firstName = "First name must be at least 2 characters";
    if (!form.lastName.trim() || form.lastName.trim().length < 2)
      next.lastName = "Last name must be at least 2 characters";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim()))
      next.email = "Enter a valid email";
    if (!form.department.trim()) next.department = "Department is required";
    if (
      form.experience === "" ||
      Number.isNaN(Number(form.experience)) ||
      Number(form.experience) < 0
    )
      next.experience = "Experience must be a non-negative number";
    if (!form.dateOfJoining)
      next.dateOfJoining = "Date of joining is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      department: form.department.trim(),
      qualification: form.qualification.trim(),
      experience: Number(form.experience),
      dateOfJoining: form.dateOfJoining,
      phone: form.phone.trim(),
      address: form.address.trim(),
      subjectIds,
      classIds,
    };
    if (form.salary !== "") payload.salary = Number(form.salary);

    try {
      await updateTeacher.mutateAsync({ id, data: payload });
      toast.success("Teacher updated");
      navigate(`/teachers/${id}`);
    } catch (err) {
      toast.error(err?.message || "Failed to update teacher");
    }
  };

  const handleResetPassword = async () => {
    const ok = await confirm({
      title: "Reset teacher password?",
      message:
        "A new temporary password will be generated. The teacher must change it after their next login.",
      confirmLabel: "Reset password",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const result = await resetTeacherPassword.mutateAsync({ id });
      setTempPassword(result?.data?.temporaryPassword || "");
      toast.success("Password reset");
    } catch (err) {
      toast.error(err?.message || "Failed to reset password");
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading teacher..." size="lg" />;
  }

  if (error || !teacher) {
    return (
      <ErrorState
        error={error || "Teacher not found"}
        title="Unable to load teacher"
        onRetry={() => navigate("/teachers")}
      />
    );
  }

  const fieldProps = (key, extra = {}) => ({
    name: key,
    value: form[key],
    onChange: (value) => update(key, value),
    error: errors[key],
    ...extra,
  });

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/teachers/${id}`)}
            className="mr-4 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Icons.ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Teacher
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Update profile and professional details
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleResetPassword}
          disabled={resetTeacherPassword.isPending}
          className="btn-secondary inline-flex items-center disabled:opacity-60"
        >
          <Icons.Key className="w-4 h-4 mr-2" />
          {resetTeacherPassword.isPending ? "Resetting..." : "Reset Password"}
        </button>
      </div>

      {tempPassword && (
        <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            New temporary password (shown once — share it securely):
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-sm break-all text-gray-900 dark:text-gray-100">
              {tempPassword}
            </code>
            <button
              type="button"
              onClick={() => {
                if (navigator.clipboard) navigator.clipboard.writeText(tempPassword);
              }}
              className="btn-secondary inline-flex items-center"
            >
              <Icons.Copy className="w-4 h-4 mr-1" />
              Copy
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Field label="First Name" required {...fieldProps("firstName")} />
            <Field label="Last Name" required {...fieldProps("lastName")} />
            <Field label="Email" type="email" required {...fieldProps("email")} />
            <Field
              label="Phone"
              placeholder="Contact number"
              {...fieldProps("phone")}
            />
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Professional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Field label="Department" required {...fieldProps("department")} />
            <Field
              label="Qualification"
              placeholder="e.g. M.Sc, B.Ed"
              {...fieldProps("qualification")}
            />
            <Field
              label="Experience (years)"
              type="number"
              min="0"
              step="1"
              required
              {...fieldProps("experience")}
            />
            <Field
              label="Date of Joining"
              type="date"
              required
              {...fieldProps("dateOfJoining")}
            />
            <Field
              label="Salary (INR)"
              type="number"
              min="0"
              step="1"
              placeholder="Optional"
              {...fieldProps("salary")}
            />
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Address
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <Field
              label="Address"
              placeholder="Street, city, state, postal code"
              colSpan={2}
              {...fieldProps("address")}
            />
          </div>
        </div>

        {/* Subject assignments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Subject Assignments
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {subjectIds.length} selected
            </span>
          </div>
          {subjectOptions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No subjects available. Create subjects first.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {subjectOptions.map((subject) => {
                const sid = subject.subjectId || subject.id;
                const checked = subjectIds.includes(sid);
                return (
                  <label
                    key={sid}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checked
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSubject(sid)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
                        {subject.subjectName || subject.name || sid}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                        {subject.subjectCode || subject.code || ""}
                        {subject.department ? ` · ${subject.department}` : ""}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Class assignments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Class Assignments
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {classIds.length} selected
            </span>
          </div>
          {classOptions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No classes available. Create classes first.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {classOptions.map((cls) => {
                const cid = cls.classId || cls.id;
                const checked = classIds.includes(cid);
                return (
                  <label
                    key={cid}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checked
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleClass(cid)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
                        {cls.className ||
                          `${cls.grade || ""}${cls.section ? `-${cls.section}` : ""}` ||
                          cid}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                        {[cls.grade, cls.section ? `Section ${cls.section}` : null, cls.room]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/teachers/${id}`)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateTeacher.isPending}
            className="btn-primary inline-flex items-center disabled:opacity-60"
          >
            <Icons.Save className="w-4 h-4 mr-2" />
            {updateTeacher.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTeacher;
