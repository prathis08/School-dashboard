import React from "react";
import PropTypes from "prop-types";
import Icons from "../../utils/icons";

/**
 * Inline error banner used when an async query fails.
 *
 * @param {Object} props
 * @param {string|Error} props.error          — error message or Error instance
 * @param {Function}    [props.onRetry]       — if provided, renders a Retry button
 * @param {string}      [props.title]
 */
const ErrorState = ({
  error,
  onRetry,
  title = "Something went wrong",
}) => {
  const message =
    typeof error === "string"
      ? error
      : error?.message || "Please try again later.";

  return (
    <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
      <div className="flex items-start">
        <Icons.AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            {title}
          </h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {message}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-red-800 dark:text-red-200 underline hover:no-underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ErrorState.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Error),
    PropTypes.object,
  ]),
  onRetry: PropTypes.func,
  title: PropTypes.string,
};

export default ErrorState;
