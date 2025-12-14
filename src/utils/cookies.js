import Cookies from "js-cookie";

/**
 * Cookie Utilities
 * Provides helper functions to work with cookies for authentication
 */

const AUTH_TOKEN_COOKIE = "authToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";
const USER_DATA_COOKIE = "userData";

/**
 * Set authentication token in cookie
 * @param {string} token - JWT token
 * @param {number} expiresInDays - Number of days until expiration (default: 7)
 */
export const setAuthToken = (token, expiresInDays = 7) => {
  try {
    Cookies.set(AUTH_TOKEN_COOKIE, token, {
      expires: expiresInDays,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  } catch (error) {
    console.error("Error setting auth token in cookie:", error);
  }
};

/**
 * Get authentication token from cookie
 * @returns {string|null} JWT token or null if not found
 */
export const getAuthToken = () => {
  try {
    return Cookies.get(AUTH_TOKEN_COOKIE) || null;
  } catch (error) {
    console.error("Error getting auth token from cookie:", error);
    return null;
  }
};

/**
 * Set refresh token in cookie
 * @param {string} refreshToken - JWT refresh token
 * @param {number} expiresInDays - Number of days until expiration (default: 30)
 */
export const setRefreshToken = (refreshToken, expiresInDays = 30) => {
  try {
    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      expires: expiresInDays,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  } catch (error) {
    console.error("Error setting refresh token in cookie:", error);
  }
};

/**
 * Get refresh token from cookie
 * @returns {string|null} Refresh token or null if not found
 */
export const getRefreshToken = () => {
  try {
    return Cookies.get(REFRESH_TOKEN_COOKIE) || null;
  } catch (error) {
    console.error("Error getting refresh token from cookie:", error);
    return null;
  }
};

/**
 * Remove refresh token from cookie
 */
export const removeRefreshToken = () => {
  try {
    Cookies.remove(REFRESH_TOKEN_COOKIE);
  } catch (error) {
    console.error("Error removing refresh token from cookie:", error);
  }
};

/**
 * Remove authentication token from cookie
 */
export const removeAuthToken = () => {
  try {
    Cookies.remove(AUTH_TOKEN_COOKIE);
  } catch (error) {
    console.error("Error removing auth token from cookie:", error);
  }
};

/**
 * Set user data in cookie
 * @param {Object} userData - User data object
 * @param {number} expiresInDays - Number of days until expiration (default: 7)
 */
export const setUserData = (userData, expiresInDays = 7) => {
  try {
    Cookies.set(USER_DATA_COOKIE, JSON.stringify(userData), {
      expires: expiresInDays,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  } catch (error) {
    console.error("Error setting user data in cookie:", error);
  }
};

/**
 * Get user data from cookie
 * @returns {Object|null} User data object or null if not found
 */
export const getUserData = () => {
  try {
    const userData = Cookies.get(USER_DATA_COOKIE);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user data from cookie:", error);
    return null;
  }
};

/**
 * Remove user data from cookie
 */
export const removeUserData = () => {
  try {
    Cookies.remove(USER_DATA_COOKIE);
  } catch (error) {
    console.error("Error removing user data from cookie:", error);
  }
};

/**
 * Clear all authentication-related cookies
 */
export const clearAllAuthCookies = () => {
  removeAuthToken();
  removeRefreshToken();
  removeUserData();
};

/**
 * Check if user is authenticated based on cookie presence
 * @returns {boolean} True if auth token exists in cookies
 */
export const isAuthenticated = () => {
  return getAuthToken() !== null;
};

const cookieUtils = {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  setRefreshToken,
  getRefreshToken,
  removeRefreshToken,
  setUserData,
  getUserData,
  removeUserData,
  clearAllAuthCookies,
  isAuthenticated,
};

export default cookieUtils;
