import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, GraduationCap, Mail, Lock } from "lucide-react";
import { useLogin } from "../../hooks/useApiHooks";
import { API_ENDPOINTS } from "../../services/api";
import {
  setDashboardConfig,
  clearDashboardConfig,
} from "../../utils/dashboardConfig";
import {
  setAuthToken,
  clearAllAuthCookies,
  getAuthToken,
  setRefreshToken,
} from "../../utils/cookies";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [dashboardConfigError, setDashboardConfigError] = useState(null);
  const login = useLogin();
  const navigate = useNavigate();

  const loading = login.isPending;
  const error = login.error;
  const clearError = () => login.reset();

  // Custom fetch function that doesn't auto-redirect on 401 for dashboard config
  const fetchDashboardConfig = async () => {
    const token = getAuthToken();
    const API_BASE_URL =
      process.env.REACT_APP_API_BASE_URL || "http://localhost:50501/api";

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.DASHBOARD.CONFIG}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        // Instead of auto-redirecting, return error info
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse error response, use default message
        }
        return { success: false, status: response.status, error: errorMessage };
      }

      const data = await response.json();
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Clear dashboard config error when user starts typing
    if (dashboardConfigError) {
      setDashboardConfigError(null);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Clear previous errors
      clearError();
      setDashboardConfigError(null);

      // Clear previous authentication data before login
      clearAllAuthCookies();
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      clearDashboardConfig();

      // Use the TanStack Query login mutation
      const response = await login.mutateAsync({
        data: {
          email: formData.email,
          password: formData.password,
        },
      });

      if (response && response.success) {
        // Store the authentication token in cookies
        if (response.data?.accessToken) {
          setAuthToken(response.data.accessToken, formData.rememberMe ? 30 : 7); // 30 days if remember me, 7 days otherwise
          // Also store in localStorage for backward compatibility
          localStorage.setItem("authToken", response.data.accessToken);
        }

        // Store refresh token if available
        if (response.data?.refreshToken) {
          setRefreshToken(
            response.data.refreshToken,
            formData.rememberMe ? 30 : 7
          );
          // Also store in localStorage for backward compatibility
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }

        // Store user information only in localStorage
        // The schoolId is automatically extracted from the API response (response.data.user.schoolId)
        if (response.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        // Fetch dashboard configuration immediately after login
        try {
          console.log("Fetching dashboard configuration...");
          const configResponse = await fetchDashboardConfig();

          if (configResponse && configResponse.success) {
            setDashboardConfig(configResponse.data);
            console.log(
              "Dashboard config loaded successfully:",
              configResponse.data
            );
            // Only navigate if config loaded successfully
            navigate("/dashboard");
          } else {
            console.error("Failed to load dashboard config:", configResponse);
            console.error("Config response status:", configResponse?.status);
            console.error("Config response error:", configResponse?.error);

            // Handle specific error cases
            let errorMessage =
              "Failed to load dashboard configuration. Please try logging in again.";

            if (configResponse?.status === 401) {
              errorMessage = "Please log in again.";
              // Clear auth data for 401 errors
              clearAllAuthCookies();
              localStorage.removeItem("authToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("user");
              clearDashboardConfig();
            } else if (configResponse?.status >= 500) {
              errorMessage = "Server error. Please try again later.";
            } else if (!configResponse) {
              errorMessage =
                "Unable to connect to dashboard services. Please check your connection.";
            }

            // Show error message and stay on login page
            setDashboardConfigError(errorMessage);
            return;
          }
        } catch (configError) {
          console.error("Error fetching dashboard config:", configError);
          console.error("Config error details:", {
            message: configError.message,
            stack: configError.stack,
            name: configError.name,
          });

          // Show error message and stay on login page for network errors
          setDashboardConfigError(
            "Unable to connect to dashboard services. Please check your connection and try again."
          );
          return;
        }
      } else {
        // Handle login failure
        console.error("Login failed:", response);
      }
    } catch (err) {
      console.error("Login error:", err);
      // Error is already handled by the TanStack Query hooks
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">SchoolHub</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Please sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error.message || error}
              </div>
            )}

            {dashboardConfigError && (
              <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-4 w-4 text-orange-400 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-2">
                    <p className="font-medium">Configuration Error</p>
                    <p className="text-sm">{dashboardConfigError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>

            {/* Demo Credentials */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2 font-medium">
                API Login:
              </p>
              <p className="text-xs text-gray-500">
                Using real authentication API
              </p>
              <p className="text-xs text-gray-500">
                Enter your registered credentials (email and password)
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
              Contact Administrator
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
