import React, { useState, useEffect } from "react";
import { useSystemHealth } from "../../hooks/useApiHooks";
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  Clock,
} from "lucide-react";

const SystemHealth = () => {
  // Use TanStack Query hooks
  const {
    data: healthData,
    isLoading: loading,
    error,
    refetch,
  } = useSystemHealth();
  const [lastChecked, setLastChecked] = useState(new Date());

  // Update last checked when data changes
  useEffect(() => {
    if (healthData) {
      setLastChecked(new Date());
    }
  }, [healthData]);

  const fetchHealthStatus = () => {
    refetch();
    setLastChecked(new Date());
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy":
      case "up":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "unhealthy":
      case "down":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
      case "up":
        return "bg-green-100 text-green-800";
      case "unhealthy":
      case "down":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const ServiceCard = ({ name, status, icon: Icon, details }) => (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-gray-100 rounded-lg mr-3">
            <Icon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{name}</h3>
            {details && <p className="text-sm text-gray-600 mt-1">{details}</p>}
          </div>
        </div>
        <div className="flex items-center">
          {getStatusIcon(status)}
          <span
            className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 rounded-lg h-24"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600 mt-1">
            Monitor system status and service health
          </p>
          {lastChecked && (
            <p className="text-sm text-gray-500 mt-1">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchHealthStatus}
          disabled={loading}
          className="btn-primary"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Overall Status */}
      {healthData && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Overall Status
              </h2>
              <p className="text-gray-600 mt-1">System operational status</p>
            </div>
            <div className="flex items-center">
              {getStatusIcon(healthData.status)}
              <span
                className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                  healthData.status
                )}`}
              >
                {healthData.status?.toUpperCase() || "UNKNOWN"}
              </span>
            </div>
          </div>
          {healthData.message && (
            <p className="text-sm text-gray-600 mt-3">{healthData.message}</p>
          )}
        </div>
      )}

      {/* Service Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ServiceCard
          name="API Server"
          status={healthData?.services?.api || "healthy"}
          icon={Server}
          details="Main application server"
        />
        <ServiceCard
          name="Database"
          status={healthData?.services?.database || "healthy"}
          icon={Database}
          details="Primary data storage"
        />
        <ServiceCard
          name="Authentication Service"
          status={healthData?.services?.auth || "healthy"}
          icon={CheckCircle}
          details="User authentication system"
        />
        <ServiceCard
          name="File Storage"
          status={healthData?.services?.storage || "healthy"}
          icon={Database}
          details="Document and media storage"
        />
      </div>

      {/* System Metrics */}
      {healthData?.metrics && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            System Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {healthData.metrics.uptime && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-lg font-semibold text-gray-900">
                  {healthData.metrics.uptime}
                </p>
              </div>
            )}
            {healthData.metrics.responseTime && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Activity className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {healthData.metrics.responseTime}ms
                </p>
              </div>
            )}
            {healthData.metrics.version && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Server className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Version</p>
                <p className="text-lg font-semibold text-gray-900">
                  {healthData.metrics.version}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <XCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Health Check Failed
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {error.message || error.toString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealth;
