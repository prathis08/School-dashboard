/**
 * Gets the API base URL from environment variable
 * Falls back to localhost if not configured
 * @returns {string} The API base URL
 */
export const getApiBaseUrl = () => {
  // Priority: Environment variable > default fallback
  const envUrl = process.env.REACT_APP_API_BASE_URL;
  const defaultUrl = "http://localhost:50501/api";

  return envUrl || defaultUrl;
};

/**
 * Constructs a full API URL from an endpoint
 * @param {string} endpoint - The API endpoint (with or without leading slash)
 * @returns {string} The complete URL
 */
export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();

  // Handle cases where endpoint might already be a complete URL
  if (endpoint.startsWith("http")) {
    return endpoint;
  }

  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${baseUrl}${normalizedEndpoint}`;
};
