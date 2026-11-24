import React, { useEffect, useState } from "react";
import Icons from "../../utils/icons";
import { usePromotionRule, useSavePromotionRule } from "../../hooks/useApiHooks";
import { useToast } from "../../context/UIProvider";
import { LoadingState } from "../Common";

const DEFAULTS = {
  minOverallPercentage: 40,
  mustPassAllSubjects: true,
  maxFailedSubjects: 0,
  minAttendancePercentage: 0,
  outcomeOnFail: "RETAIN",
};

const extract = (resp) => resp?.data ?? resp ?? null;

const ExamSettings = () => {
  const toast = useToast();
  const { data: ruleResp, isLoading, refetch } = usePromotionRule();
  const saveRule = useSavePromotionRule();

  const [form, setForm] = useState(DEFAULTS);

  useEffect(() => {
    const rule = extract(ruleResp);
    if (rule) {
      setForm({
        minOverallPercentage: Number(rule.minOverallPercentage ?? 40),
        mustPassAllSubjects: Boolean(rule.mustPassAllSubjects ?? true),
        maxFailedSubjects: Number(rule.maxFailedSubjects ?? 0),
        minAttendancePercentage: Number(rule.minAttendancePercentage ?? 0),
        outcomeOnFail: rule.outcomeOnFail || "RETAIN",
      });
    }
  }, [ruleResp]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await saveRule.mutateAsync({ data: form });
      toast.success("Promotion settings saved");
      refetch();
    } catch (err) {
      toast.error(err?.message || "Failed to save settings");
    }
  };

  if (isLoading) return <LoadingState message="Loading settings..." size="lg" />;

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Exam &amp; Promotion Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Rules used to decide whether a student is promoted to the next grade
          at the end of an academic year.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minimum overall percentage
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.minOverallPercentage}
              onChange={(e) =>
                update("minOverallPercentage", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Aggregate across all exam results in the academic year.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minimum attendance %
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.minAttendancePercentage}
              onChange={(e) =>
                update("minAttendancePercentage", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              0 disables the attendance requirement.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <input
            id="mustPassAll"
            type="checkbox"
            checked={form.mustPassAllSubjects}
            onChange={(e) =>
              update("mustPassAllSubjects", e.target.checked)
            }
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <label
              htmlFor="mustPassAll"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Must pass all subjects
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              When enabled, any failed subject blocks promotion.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max failed subjects allowed
            </label>
            <input
              type="number"
              min="0"
              value={form.maxFailedSubjects}
              disabled={form.mustPassAllSubjects}
              onChange={(e) => update("maxFailedSubjects", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Only used when "Must pass all subjects" is off.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              If a student fails
            </label>
            <select
              value={form.outcomeOnFail}
              onChange={(e) => update("outcomeOnFail", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="RETAIN">Retain in same grade</option>
              <option value="CONDITIONAL">Conditional promotion</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saveRule.isPending}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            <Icons.Save className="w-4 h-4 mr-2" />
            {saveRule.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamSettings;
