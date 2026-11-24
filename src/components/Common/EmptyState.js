import React from "react";
import PropTypes from "prop-types";

/**
 * Friendly empty-list placeholder.
 *
 * @param {Object} props
 * @param {React.ComponentType} [props.icon]    — icon component (e.g. from lucide-react)
 * @param {string}  props.title                 — heading
 * @param {string} [props.description]          — secondary message
 * @param {React.ReactNode} [props.action]      — optional CTA (button etc.)
 */
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {Icon && (
      <Icon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
    )}
    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
      {title}
    </h3>
    {description && (
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">
        {description}
      </p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
};

export default EmptyState;
