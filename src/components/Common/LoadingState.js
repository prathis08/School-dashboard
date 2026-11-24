import React from "react";
import PropTypes from "prop-types";

/**
 * Centered spinner used while async data is loading.
 *
 * @param {Object} props
 * @param {string} [props.message]   — caption shown beneath the spinner
 * @param {string} [props.size]      — "sm" | "md" | "lg" (default "md")
 */
const SIZE_CLASSES = {
  sm: "h-6 w-6 border-2",
  md: "h-10 w-10 border-b-2",
  lg: "h-16 w-16 border-b-4",
};

const LoadingState = ({ message = "Loading...", size = "md" }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div
      className={`animate-spin rounded-full ${SIZE_CLASSES[size]} border-blue-600`}
    />
    {message && (
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{message}</p>
    )}
  </div>
);

LoadingState.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
};

export default LoadingState;
