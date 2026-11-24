import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icons from "../../utils/icons";
import { useChangePassword } from "../../hooks/useApiHooks";
import { useToast } from "../../context/UIProvider";

const INPUT_CLASS =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const ChangePassword = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const changePassword = useChangePassword();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.currentPassword)
      next.currentPassword = "Current password is required";
    if (!form.newPassword || form.newPassword.length < 6)
      next.newPassword = "New password must be at least 6 characters";
    if (form.newPassword === form.currentPassword)
      next.newPassword = "New password must differ from the current one";
    if (form.newPassword !== form.confirmPassword)
      next.confirmPassword = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      await changePassword.mutateAsync({
        data: {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
      });
      toast.success("Password changed");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.message || "Failed to change password");
    }
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Change your password
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          You are using a temporary password. Set a new password to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current password
          </label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) => update("currentPassword", e.target.value)}
            className={INPUT_CLASS}
            autoComplete="current-password"
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            New password
          </label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => update("newPassword", e.target.value)}
            className={INPUT_CLASS}
            autoComplete="new-password"
          />
          {errors.newPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm new password
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            className={INPUT_CLASS}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="btn-primary inline-flex items-center disabled:opacity-60"
          >
            <Icons.Lock className="w-4 h-4 mr-2" />
            {changePassword.isPending ? "Saving..." : "Change password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
