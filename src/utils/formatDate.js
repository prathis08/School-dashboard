/**
 * Consistent date formatting across the dashboard.
 * Date-only strings ("YYYY-MM-DD") are parsed in local time to avoid
 * timezone off-by-one shifts.
 */
export const formatDate = (value, options = {}) => {
  if (value === null || value === undefined || value === "") return "N/A";

  let date;
  if (value instanceof Date) {
    date = value;
  } else if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    date = new Date(`${value}T00:00:00`);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return "N/A";

  const { locale = "en-IN", ...intlOptions } = options;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...intlOptions,
  }).format(date);
};

export default formatDate;
