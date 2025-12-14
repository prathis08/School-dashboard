import React, { useState, useEffect } from "react";
import {
  useFeatures,
  useUpdateSchoolFeatures,
  useReloadConfig,
  useAllSchools,
  useSchoolFeatures,
  useDashboardConfig,
} from "../../hooks/useApiHooks";
import { API_ENDPOINTS } from "../../services/api";
import {
  Settings,
  ToggleLeft,
  ToggleRight,
  School,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  AlertTriangle,
} from "lucide-react";

const FeatureManagement = () => {
  const [selectedSchool, setSelectedSchool] = useState("");
  const [schoolFeaturesState, setSchoolFeaturesState] = useState({});

  // TanStack Query hooks
  const {
    data: features = [],
    isLoading: featuresLoading,
    error: featuresError,
  } = useFeatures();
  const { data: schools = [], isLoading: schoolsLoading } = useAllSchools();
  const { data: dashboardConfig } = useDashboardConfig();
  const { data: schoolFeatures = {}, isLoading: schoolFeaturesLoading } =
    useSchoolFeatures(selectedSchool);

  const updateSchoolFeaturesMutation = useUpdateSchoolFeatures();
  const reloadConfigMutation = useReloadConfig();

  const loading =
    featuresLoading ||
    schoolsLoading ||
    schoolFeaturesLoading ||
    updateSchoolFeaturesMutation.isPending ||
    reloadConfigMutation.isPending;
  const error = featuresError;

  // Update local state when school features change
  useEffect(() => {
    if (schoolFeatures) {
      setSchoolFeaturesState(schoolFeatures);
    }
  }, [schoolFeatures]);

  const handleSchoolChange = (schoolId) => {
    setSelectedSchool(schoolId);
    if (!schoolId) {
      setSchoolFeaturesState({});
    }
  };

  const toggleFeature = (featureName) => {
    setSchoolFeaturesState((prev) => ({
      ...prev,
      [featureName]: !prev[featureName],
    }));
  };

  const saveSchoolFeatures = async () => {
    if (!selectedSchool) return;

    const enabledFeatures = Object.keys(schoolFeaturesState).filter(
      (feature) => schoolFeaturesState[feature]
    );

    updateSchoolFeaturesMutation.mutate(
      { schoolId: selectedSchool, enabledFeatures },
      {
        onSuccess: () => {
          alert("Features updated successfully!");
        },
        onError: (err) => {
          console.error("Error updating features:", err);
          alert("Failed to update features. Please try again.");
        },
      }
    );
  };

  const handleReloadConfig = async () => {
    reloadConfigMutation.mutate(undefined, {
      onSuccess: () => {
        alert("Configuration reloaded successfully!");
      },
      onError: (err) => {
        console.error("Error reloading config:", err);
        alert("Failed to reload configuration.");
      },
    });
  };

  const FeatureCard = ({ feature, enabled, onToggle }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">
            {feature.name || feature}
          </h3>
          {feature.description && (
            <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
          )}
        </div>
        <button
          onClick={onToggle}
          className={`ml-4 p-1 rounded-full transition-colors ${
            enabled
              ? "text-blue-600 hover:text-blue-800"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {enabled ? (
            <ToggleRight className="w-8 h-8" />
          ) : (
            <ToggleLeft className="w-8 h-8" />
          )}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 rounded-lg h-16"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Feature Management
          </h1>
          <p className="text-gray-600 mt-1">
            Control feature availability for different schools
          </p>
        </div>
        <button
          onClick={handleReloadConfig}
          disabled={loading}
          className="btn-primary"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Reload Config
        </button>
      </div>

      {/* School Selection */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          School Selection
        </h2>
        <div className="flex items-center space-x-4">
          <School className="w-5 h-5 text-gray-400" />
          <select
            value={selectedSchool}
            onChange={(e) => handleSchoolChange(e.target.value)}
            className="input flex-1"
          >
            <option value="">Select a school...</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
          {selectedSchool && (
            <button onClick={saveSchoolFeatures} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Available Features */}
      {selectedSchool && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available Features
          </h2>
          <div className="space-y-4">
            {features.map((feature) => (
              <FeatureCard
                key={feature.name || feature}
                feature={feature}
                enabled={schoolFeaturesState[feature.name || feature] || false}
                onToggle={() => toggleFeature(feature.name || feature)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Configuration */}
      {dashboardConfig && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dashboard Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(dashboardConfig).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-600">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {typeof value === "boolean" ? (
                    value ? (
                      <CheckCircle className="w-4 h-4 text-green-500 inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 inline" />
                    )
                  ) : (
                    String(value)
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Feature Management Error
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {error.message || error.toString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <Settings className="w-5 h-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Feature Management Guide
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Select a school from the dropdown to view and manage its enabled
              features. Toggle features on or off and save changes to update the
              school's configuration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureManagement;
