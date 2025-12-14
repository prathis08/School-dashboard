/**
 * Dashboard Configuration Utilities
 * Provides helper functions to work with dashboard configuration
 */

/**
 * Get stored dashboard configuration from localStorage
 * @returns {Object|null} Dashboard configuration object or null if not found
 */
export const getDashboardConfig = () => {
  try {
    const config = localStorage.getItem("dashboardConfig");
    return config ? JSON.parse(config) : null;
  } catch (error) {
    console.error("Error parsing dashboard config:", error);
    return null;
  }
};

/**
 * Set dashboard configuration in localStorage
 * @param {Object} config - Dashboard configuration object
 */
export const setDashboardConfig = (config) => {
  try {
    // Clear localStorage before setting new config
    clearDashboardConfig();
    localStorage.setItem("dashboardConfig", JSON.stringify(config));
  } catch (error) {
    console.error("Error storing dashboard config:", error);
  }
};

/**
 * Clear dashboard configuration from localStorage
 */
export const clearDashboardConfig = () => {
  localStorage.removeItem("dashboardConfig");
};

/**
 * Check if a specific feature is enabled
 * @param {string} featureName - Name of the feature to check
 * @returns {boolean} True if feature is enabled, false otherwise
 */
export const isFeatureEnabled = (featureName) => {
  const config = getDashboardConfig();
  if (!config || !config.features) {
    return false;
  }

  const feature = config.features.find((f) => f.name === featureName);
  return feature ? feature.enabled : false;
};

/**
 * Get all enabled features
 * @returns {Array} Array of enabled features
 */
export const getEnabledFeatures = () => {
  const config = getDashboardConfig();
  if (!config || !config.features) {
    return [];
  }

  return config.features.filter((f) => f.enabled);
};

/**
 * Get school ID from dashboard config
 * @returns {string|null} School ID or null if not found
 */
export const getSchoolId = () => {
  const config = getDashboardConfig();
  return config ? config.schoolId : null;
};

/**
 * Set school ID in dashboard config
 * @param {string} schoolId - School ID to set
 */
export const setSchoolId = (schoolId) => {
  const config = getDashboardConfig() || {};
  config.schoolId = schoolId;
  setDashboardConfig(config);
};

/**
 * Get feature statistics
 * @returns {Object} Object containing total and enabled feature counts
 */
export const getFeatureStats = () => {
  const config = getDashboardConfig();
  if (!config) {
    return { total: 0, enabled: 0 };
  }

  return {
    total: config.totalFeatures || 0,
    enabled: config.enabledCount || 0,
  };
};

/**
 * Check if dashboard config is loaded
 * @returns {boolean} True if config is loaded, false otherwise
 */
export const isDashboardConfigLoaded = () => {
  const config = getDashboardConfig();
  return config !== null && typeof config === "object";
};

const dashboardConfigUtils = {
  getDashboardConfig,
  setDashboardConfig,
  clearDashboardConfig,
  isFeatureEnabled,
  getEnabledFeatures,
  getSchoolId,
  setSchoolId,
  getFeatureStats,
  isDashboardConfigLoaded,
};

export default dashboardConfigUtils;
