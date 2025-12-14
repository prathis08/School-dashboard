import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  School,
  Users,
  DollarSign,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    general: {
      schoolName: "SchoolHub Academy",
      schoolAddress: "123 Education Street, Academic City, AC 12345",
      schoolPhone: "+1 (555) 123-4567",
      schoolEmail: "contact@schoolhub.com",
      schoolWebsite: "www.schoolhub.com",
      timeZone: "America/New_York",
      academicYear: "2024-2025",
      currency: "USD",
    },
    appearance: {
      theme: "light",
      primaryColor: "#3B82F6",
      sidebarStyle: "expanded",
      language: "en",
    },
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

  const tabs = [
    { id: "general", label: "General", icon: School },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "system", label: "System", icon: Database },
  ];

  const handleSettingChange = (category, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const GeneralTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          School Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School Name
            </label>
            <input
              type="text"
              value={settings.general.schoolName}
              onChange={(e) =>
                handleSettingChange("general", "schoolName", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={settings.general.schoolPhone}
              onChange={(e) =>
                handleSettingChange("general", "schoolPhone", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={settings.general.schoolEmail}
              onChange={(e) =>
                handleSettingChange("general", "schoolEmail", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={settings.general.schoolWebsite}
              onChange={(e) =>
                handleSettingChange("general", "schoolWebsite", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={settings.general.schoolAddress}
              onChange={(e) =>
                handleSettingChange("general", "schoolAddress", e.target.value)
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Regional Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Zone
            </label>
            <select
              value={settings.general.timeZone}
              onChange={(e) =>
                handleSettingChange("general", "timeZone", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <input
              type="text"
              value={settings.general.academicYear}
              onChange={(e) =>
                handleSettingChange("general", "academicYear", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={settings.general.currency}
              onChange={(e) =>
                handleSettingChange("general", "currency", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const AppearanceTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Theme Settings
        </h3>
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
                    checked={settings.appearance.theme === theme.value}
                    onChange={(e) =>
                      handleSettingChange("appearance", "theme", e.target.value)
                    }
                    className="text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
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
                value={settings.appearance.primaryColor}
                onChange={(e) =>
                  handleSettingChange(
                    "appearance",
                    "primaryColor",
                    e.target.value
                  )
                }
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.appearance.primaryColor}
                onChange={(e) =>
                  handleSettingChange(
                    "appearance",
                    "primaryColor",
                    e.target.value
                  )
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
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
              value={settings.appearance.sidebarStyle}
              onChange={(e) =>
                handleSettingChange(
                  "appearance",
                  "sidebarStyle",
                  e.target.value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              value={settings.appearance.language}
              onChange={(e) =>
                handleSettingChange("appearance", "language", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
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
                <h4 className="text-sm font-medium text-gray-900">
                  {notification.label}
                </h4>
                <p className="text-sm text-gray-500">
                  {notification.description}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[notification.key]}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifications",
                      notification.key,
                      e.target.checked
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
              value={settings.security.passwordExpiry}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "passwordExpiry",
                  parseInt(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Login Attempts
            </label>
            <input
              type="number"
              value={settings.security.maxLoginAttempts}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "maxLoginAttempts",
                  parseInt(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "sessionTimeout",
                  parseInt(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.twoFactorAuth}
                onChange={(e) =>
                  handleSettingChange(
                    "security",
                    "twoFactorAuth",
                    e.target.checked
                  )
                }
                className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
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
            value={settings.security.ipWhitelist}
            onChange={(e) =>
              handleSettingChange("security", "ipWhitelist", e.target.value)
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Maintenance Mode
              </h4>
              <p className="text-sm text-gray-500">
                Put the system in maintenance mode
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.system.maintenanceMode}
                onChange={(e) =>
                  handleSettingChange(
                    "system",
                    "maintenanceMode",
                    e.target.checked
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Debug Mode</h4>
              <p className="text-sm text-gray-500">Enable debug logging</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.system.debugMode}
                onChange={(e) =>
                  handleSettingChange("system", "debugMode", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto Backup</h4>
              <p className="text-sm text-gray-500">Automatically backup data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.system.autoBackup}
                onChange={(e) =>
                  handleSettingChange("system", "autoBackup", e.target.checked)
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
              value={settings.system.backupFrequency}
              onChange={(e) =>
                handleSettingChange("system", "backupFrequency", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              value={settings.system.dataRetention}
              onChange={(e) =>
                handleSettingChange(
                  "system",
                  "dataRetention",
                  parseInt(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your application settings and preferences
          </p>
        </div>
        <button className="btn-primary flex items-center">
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
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
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
      {activeTab === "general" && <GeneralTab />}
      {activeTab === "appearance" && <AppearanceTab />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "security" && <SecurityTab />}
      {activeTab === "system" && <SystemTab />}
    </div>
  );
};

export default Settings;
