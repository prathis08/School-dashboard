/**
 * Unwrap a backend list response to a plain array.
 *
 * Different endpoints return list data in inconsistent shapes:
 *   - `[ ...items ]`                                  (bare array)
 *   - `{ success, data: [ ...items ] }`               (admission classes/subjects)
 *   - `{ success, data: { teachers: [...], pagination } }` (admission teachers)
 *   - `{ success, data: { students: [...], total }      }` (admission students)
 *
 * This helper accepts the React Query response (or just the JSON body) and
 * returns the array, regardless of which form it took. Pass `key` to point
 * at the named array under `data` (e.g. "teachers", "students").
 *
 * @param {*} response — fetch JSON body or React Query data
 * @param {string} [key] — property name to drill into under `data`
 * @returns {Array}
 */
export const extractList = (response, key) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (key && Array.isArray(response?.data?.[key])) return response.data[key];
  if (key && Array.isArray(response?.[key])) return response[key];
  return [];
};

/**
 * Unwrap a single-record backend response. Most endpoints wrap the record
 * under `data`, but some return the record directly.
 *
 * @param {*} response
 * @returns {Object|null}
 */
export const extractRecord = (response) => {
  if (response == null) return null;
  if (response.data && typeof response.data === "object" && !Array.isArray(response.data)) {
    return response.data;
  }
  return response;
};
