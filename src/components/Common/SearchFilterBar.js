import React from "react";
import PropTypes from "prop-types";
import Icons from "../../utils/icons";

/**
 * Page header with a search input, optional filter dropdowns, and a primary
 * action button (typically "Add &lt;entity&gt;"). Used across list pages
 * (Teachers, Students, Classes, Subjects, Fees).
 *
 * @param {Object}   props
 * @param {string}   props.searchValue
 * @param {Function} props.onSearchChange       — receives the raw input string
 * @param {string}  [props.searchPlaceholder]
 * @param {Array}   [props.filters]             — `[{ value, onChange, options: [{value,label}], label?, ariaLabel? }]`
 * @param {React.ReactNode} [props.action]      — typically an "Add" button
 */
const SearchFilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  action,
}) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
    <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-3">
      <div className="relative flex-1 max-w-md">
        <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filters.map((filter, idx) => (
        <select
          key={filter.ariaLabel || filter.label || idx}
          aria-label={filter.ariaLabel || filter.label}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>

    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

SearchFilterBar.propTypes = {
  searchValue: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  searchPlaceholder: PropTypes.string,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      onChange: PropTypes.func.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        }),
      ).isRequired,
      label: PropTypes.string,
      ariaLabel: PropTypes.string,
    }),
  ),
  action: PropTypes.node,
};

export default SearchFilterBar;
