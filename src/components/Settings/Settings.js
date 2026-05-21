import React, { useEffect, useState } from "react";
import {
  School,
  Bell,
  Shield,
  Database,
  Palette,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  useSchoolSettings,
  useUpdateSchoolSettings,
  useAppearanceSettings,
  useUpdateAppearanceSettings,
} from "../../hooks/useApiHooks";
import AcademicYearManagement from "../Fees/Enhanced/AcademicYearManagement";

const flattenAddress = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  if (address.street) return address.street;
  return "";
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [statusMessage, setStatusMessage] = useState(null);

  // General (school info)
  const { data: schoolResponse, isLoading: schoolLoading } =
    useSchoolSettings();
  const updateSchool = useUpdateSchoolSettings();
  const [schoolForm, setSchoolForm] = useState({
    schoolName: "",
    phone: "",
    email: "",
    website: "",
    address: "",
  });

  useEffect(() => {
    const school = schoolResponse?.data;
    if (school) {
      setSchoolForm({
        schoolName: school.schoolName || "",
        phone: school.phone || "",
        email: school.email || "",
        website: school.website || "",
        address: flattenAddress(school.address),
      });
    }
  }, [schoolResponse]);

  const handleSchoolChange = (field, value) => {
    setSchoolForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSchool = async () => {
    try {
      await updateSchool.mutateAsync({
        data: {
          schoolName: schoolForm.schoolName,
          phone: schoolForm.phone || undefined,
          email: schoolForm.email || undefined,
          website: schoolForm.website || undefined,
          address: { street: schoolForm.address },
        },
      });
      setStatusMessage({ type: "success", text: "School info saved" });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err?.message || "Failed to save school info",
      });
    }
  };

  // Appearance (per-user prefs)
  const { data: prefsResponse, isLoading: prefsLoading } =
    useAppearanceSettings();
  const updatePrefs = useUpdateAppearanceSettings();
  const [appearanceForm, setAppearanceForm] = useState({
    theme: "light",
    primaryColor: "#3B82F6",
    sidebarStyle: "expanded",
    language: "en",
  });

  useEffect(() => {
    const prefs = prefsResponse?.data;
    if (prefs) {
      setAppearanceForm({
        theme: prefs.theme || "light",
        primaryColor: prefs.primaryColor || "#3B82F6",
        sidebarStyle: prefs.sidebarStyle || "expanded",
        language: prefs.language || "en",
      });
    }
  }, [prefsResponse]);

  const handleAppearanceChange = (field, value) => {
    setAppearanceForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAppearance = async () => {
    try {
      await updatePrefs.mutateAsync({ data: appearanceForm });
      setStatusMessage({ type: "success", text: "Preferences saved" });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err?.message || "Failed to save preferences",
      });
    }
  };

  // Notifications / Security / System — kept hardcoded (UI state only)
  const [staticSettings, setStaticSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      weeklyReports: true,
      systemAlerts: true,
    },
    security: {
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      sessionTimeout: 30,
      twoFactorAuth: false,
      ipWhitelist: "",
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      autoBackup: true,
      backupFrequency: "daily",
      dataRetention: 365,
    },
  });

  const handleStaticChange = (category, setting, value) => {
    setStaticSettings((prev) => ({
      ...prev,
      [category]: { ...prev[category], [setting]: value },
    }));
  };

  const tabs = [
    { id: "general", label: "General", icon: School },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "system", label: "System", icon: Database },
  ];

  // Dismiss status message after a few seconds
  useEffect(() => {
    if (!statusMessage) return;
    const t = setTimeout(() => setStatusMessage(null), 3000);
    return () => clearTimeout(t);
  }, [statusMessage]);

  const GeneralTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          School Information
        </h3>
        {schoolLoading ? (
          <p className="text-gray-600">Loading school…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Name
              </label>
              <input
                type="text"
                value={schoolForm.schoolName}
                onChange={(e) =>
                  handleSchoolChange("schoolName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={schoolForm.phone}
                onChange={(e) => handleSchoolChange("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={schoolForm.email}
                onChange={(e) => handleSchoolChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={schoolForm.website}
                onChange={(e) => handleSchoolChange("website", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={schoolForm.address}
                onChange={(e) => handleSchoolChange("address", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={handleSaveSchool}
                disabled={updateSchool.isPending}
                className="btn-primary flex items-center disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateSchool.isPending ? "Saving…" : "Save School Info"}
              </button>
            </div>
          </div>
        )}
      </div>

      <AcademicYearManagement />
    </div>
  );

  const AppearanceTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Theme Settings
        </h3>
        {prefsLoading ? (
          <p className="text-gray-600">Loading preferences…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Theme
              </label>
              <div className="space-y-2">
                {[
                  { value: "light", label: "Light Theme" },
                  { value: "dark", label: "Dark Theme" },
                  { value: "auto", label: "Auto (System)" },
                ].map((theme) => (
                  <label
                    key={theme.value}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={theme.value}
                      checked={appearanceForm.theme === theme.value}
                      onChange={(e) =>
                        handleAppearanceChange("theme", e.target.value)
                      }
                      className="text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {theme.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={appearanceForm.primaryColor}
                  onChange={(e) =>
                    handleAppearanceChange("primaryColor", e.target.value)
                  }
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={appearanceForm.primaryColor}
                  onChange={(e) =>
                    handleAppearanceChange("primaryColor", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Layout Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sidebar Style
            </label>
            <select
              value={appearanceForm.sidebarStyle}
              onChange={(e) =>
                handleAppearanceChange("sidebarStyle", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="expanded">Expanded</option>
              <option value="collapsed">Collapsed</option>
              <option value="mini">Mini</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={appearanceForm.language}
              onChange={(e) =>
                handleAppearanceChange("language", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveAppearance}
          disabled={updatePrefs.isPending}
          className="btn-primary flex items-center disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {updatePrefs.isPending ? "Saving…" : "Save Preferences"}
        </button>
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {[
            {
              key: "emailNotifications",
              label: "Email Notifications",
              description: "Receive notifications via email",
            },
            {
              key: "pushNotifications",
              label: "Push Notifications",
              description: "Receive browser push notifications",
            },
            {
              key: "smsNotifications",
              label: "SMS Notifications",
              description: "Receive notifications via SMS",
            },
            {
              key: "weeklyReports",
              label: "Weekly Reports",
              description: "Receive weekly summary reports",
            },
            {
              key: "systemAlerts",
              label: "System Alerts",
              description: "Receive important system alerts",
            },
          ].map((notification) => (
            <div
              key={notification.key}
              className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
            >
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {notification.label}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  {notification.description}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={staticSettings.notifications[notification.key]}
                  onChange={(e) =>
                    handleStaticChange(
                      "notifications",
                      notification.key,
                      e.target.checked,
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SecurityTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Password Policy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Expiry (days)
            </label>
            <input
              type="number"
              value={staticSettings.security.passwordExpiry}
              onChange={(e) =>
                handleStaticChange(
                  "security",
                  "passwordExpiry",
                  parseInt(e.target.value),
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Login Attempts
            </label>
            <input
              type="number"
              value={staticSettings.security.maxLoginAttempts}
              onChange={(e) =>
                handleStaticChange(
                  "security",
                  "maxLoginAttempts",
                  parseInt(e.target.value),
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={staticSettings.security.sessionTimeout}
              onChange={(e) =>
                handleStaticChange(
                  "security",
                  "sessionTimeout",
                  parseInt(e.target.value),
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={staticSettings.security.twoFactorAuth}
                onChange={(e) =>
                  handleStaticChange(
                    "security",
                    "twoFactorAuth",
                    e.target.checked,
                  )
                }
                className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Require Two-Factor Authentication
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          IP Whitelist
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed IP Addresses
          </label>
          <textarea
            value={staticSettings.security.ipWhitelist}
            onChange={(e) =>
              handleStaticChange("security", "ipWhitelist", e.target.value)
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Enter IP addresses or ranges, one per line"
          />
          <p className="text-sm text-gray-500 mt-2">
            Leave empty to allow all IP addresses
          </p>
        </div>
      </div>
    </div>
  );

  const SystemTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Controls
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Maintenance Mode
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                Put the system in maintenance mode
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={staticSettings.system.maintenanceMode}
                onChange={(e) =>
                  handleStaticChange(
                    "system",
                    "maintenanceMode",
                    e.target.checked,
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Debug Mode
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                Enable debug logging
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={staticSettings.system.debugMode}
                onChange={(e) =>
                  handleStaticChange("system", "debugMode", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Auto Backup
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                Automatically backup data
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={staticSettings.system.autoBackup}
                onChange={(e) =>
                  handleStaticChange("system", "autoBackup", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Data Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Frequency
            </label>
            <select
              value={staticSettings.system.backupFrequency}
              onChange={(e) =>
                handleStaticChange("system", "backupFrequency", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Retention (days)
            </label>
            <input
              type="number"
              value={staticSettings.system.dataRetention}
              onChange={(e) =>
                handleStaticChange(
                  "system",
                  "dataRetention",
                  parseInt(e.target.value),
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
          <button className="btn-secondary flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </button>
          <button className="btn-secondary flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Backup Now
          </button>
        </div>
      </div>

      <div className="card border-red-200 bg-red-50">
        <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Danger Zone
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-red-900">
              Reset All Settings
            </h4>
            <p className="text-sm text-red-700 mb-3">
              This will reset all settings to their default values.
            </p>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Settings
            </button>
          </div>
          <div>
            <h4 className="text-sm font-medium text-red-900">Clear All Data</h4>
            <p className="text-sm text-red-700 mb-3">
              This will permanently delete all data. This action cannot be
              undone.
            </p>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your application settings and preferences
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            statusMessage.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:border-gray-600"
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "general" && GeneralTab()}
      {activeTab === "appearance" && AppearanceTab()}
      {activeTab === "notifications" && NotificationsTab()}
      {activeTab === "security" && SecurityTab()}
      {activeTab === "system" && SystemTab()}
    </div>
  );
};

export default Settings;
