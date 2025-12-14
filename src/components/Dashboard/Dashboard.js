import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  DollarSign,
  Calendar,
  MoreHorizontal,
  Plus,
  ChevronRight,
  BookOpen,
  Clock,
  Target,
  Award,
  User,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import {
  useDashboardStats,
  useRecentActivity,
  useAttendanceOverview,
  usePerformanceData,
} from "../../hooks/useApiHooks";

// Add Task Popup Component
const AddTaskPopup = ({
  taskFormData,
  handleTaskFormChange,
  handleCloseAddTaskPopup,
  handleSaveTask,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add New Task</h2>
          <button
            onClick={handleCloseAddTaskPopup}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={taskFormData.title}
              onChange={(e) => handleTaskFormChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title"
            />
          </div>
          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={taskFormData.description}
              onChange={(e) =>
                handleTaskFormChange("description", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Enter task description"
            />
          </div>
          {/* Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={taskFormData.dueDate}
              onChange={(e) => handleTaskFormChange("dueDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {/* Time Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Time (Optional)
            </label>
            <input
              type="time"
              value={taskFormData.dueTime}
              onChange={(e) => handleTaskFormChange("dueTime", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleCloseAddTaskPopup}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveTask}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Task Detail Popup Component
const TaskDetailPopup = ({
  selectedTask,
  handleCloseTaskDetail,
  handleDeleteTask,
  formatTaskDate,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
          <button
            onClick={handleCloseTaskDetail}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {selectedTask && (
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <p className="text-gray-900 font-medium">{selectedTask.title}</p>
            </div>
            {/* Description */}
            {selectedTask.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-gray-600">{selectedTask.description}</p>
              </div>
            )}
            {/* Due Date & Time */}
            {(selectedTask.dueDate || selectedTask.dueTime) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date & Time
                </label>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatTaskDate(selectedTask.dueDate, selectedTask.dueTime)}
                </div>
              </div>
            )}
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  selectedTask.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : selectedTask.status === "in-progress"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {selectedTask.status === "completed"
                  ? "Completed"
                  : selectedTask.status === "in-progress"
                  ? "In Progress"
                  : "Pending"}
              </div>
            </div>
            {/* Created Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created
              </label>
              <p className="text-gray-600">
                {new Date(selectedTask.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleDeleteTask(selectedTask?.id)}
            className="flex items-center px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
          <button
            onClick={handleCloseTaskDetail}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  // Use TanStack Query hooks
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();
  const {
    data: recentActivityData,
    isLoading: activityLoading,
    error: activityError,
  } = useRecentActivity();
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useAttendanceOverview();
  const {
    data: performanceChartData,
    isLoading: performanceLoading,
    error: performanceError,
  } = usePerformanceData();

  // Check if any data is loading
  const loading =
    statsLoading || activityLoading || attendanceLoading || performanceLoading;

  // Check for any errors
  const error =
    statsError || activityError || attendanceError || performanceError;

  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalIncome: 0,
    studentAttendance: 0,
    classesGrowth: 0,
    studentsGrowth: 0,
    incomeGrowth: 0,
  });

  const [agenda, setAgenda] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [showAddTaskPopup, setShowAddTaskPopup] = useState(false);
  const [showTaskDetailPopup, setShowTaskDetailPopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
  });

  // Get user initials from name - memoized to prevent unnecessary re-renders
  const getUserInitials = useCallback(
    (name) => {
      if (!name || typeof name !== "string") {
        // Try different possible name fields from userData
        const possibleNames = [
          userData?.name,
          userData?.fullName,
          userData?.firstName,
          userData?.username,
          userData?.displayName,
          userData?.email?.split("@")[0], // Use email prefix as fallback
        ];

        for (const possibleName of possibleNames) {
          if (
            possibleName &&
            typeof possibleName === "string" &&
            possibleName.trim()
          ) {
            name = possibleName;
            break;
          }
        }
      }

      if (!name || typeof name !== "string") {
        return "U";
      }

      const initials = name
        .trim()
        .split(" ")
        .filter((n) => n.length > 0)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return initials || "U";
    },
    [userData]
  );

  // Update stats when data is available
  useEffect(() => {
    if (statsData) {
      // Handle the API response structure: statsData.data contains the actual stats
      const apiStats = statsData.data || statsData;
      setStats((prevStats) => ({
        ...prevStats,
        totalClasses: apiStats.totalClasses || 0,
        totalStudents: apiStats.totalStudents || 0,
        totalTeachers: apiStats.totalTeachers || 0,
        // Keep existing values for other stats that might not come from this API
        totalIncome: prevStats.totalIncome,
        studentAttendance: prevStats.studentAttendance,
        classesGrowth: prevStats.classesGrowth,
        studentsGrowth: prevStats.studentsGrowth,
        incomeGrowth: prevStats.incomeGrowth,
      }));
    }
  }, [statsData]);

  // Load user data
  useEffect(() => {
    const userJson = localStorage.getItem("user");

    let user = null;
    if (userJson) {
      try {
        user = JSON.parse(userJson);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }

    // If no user data from localStorage, set temporary test data for debugging
    if (!user) {
      const testUser = {
        name: "John Doe",
        email: "john.doe@school.com",
        firstName: "John",
        lastName: "Doe",
      };
      setUserData(testUser);
    } else {
      setUserData(user);
    }
  }, []);

  // Handle agenda data (you can replace this with actual API call when available)
  useEffect(() => {
    // Mock agenda data - replace with actual API call
    setAgenda([
      {
        time: "9:00 AM",
        event: "Math Class - Grade 10",
        location: "Room 101",
      },
      {
        time: "10:30 AM",
        event: "Physics Lab - Grade 11",
        location: "Lab 2",
      },
      {
        time: "2:00 PM",
        event: "Parent Meeting",
        location: "Conference Room",
      },
    ]);
  }, []);

  // Task management functions
  const handleAddTask = () => {
    setShowAddTaskPopup(true);
  };

  const handleCloseAddTaskPopup = () => {
    setShowAddTaskPopup(false);
    setTaskFormData({
      title: "",
      description: "",
      dueDate: "",
      dueTime: "",
    });
  };

  const handleTaskFormChange = (field, value) => {
    setTaskFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveTask = () => {
    if (!taskFormData.title.trim()) {
      alert("Task title is required");
      return;
    }

    const newTask = {
      id: Date.now(), // In real app, this would come from backend
      title: taskFormData.title,
      description: taskFormData.description,
      dueDate: taskFormData.dueDate,
      dueTime: taskFormData.dueTime,
      status: "pending",
      createdAt: new Date().toISOString(),
      priority: "medium", // Default priority
    };

    setTasks((prev) => [...prev, newTask]);
    handleCloseAddTaskPopup();
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetailPopup(true);
  };

  const handleCloseTaskDetail = () => {
    setShowTaskDetailPopup(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setShowTaskDetailPopup(false);
    setSelectedTask(null);
  };

  const formatTaskDate = (date, time) => {
    if (!date) return "";
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return time ? `${formattedDate} at ${time}` : formattedDate;
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    growth,
    color,
    prefix = "",
    suffix = "",
  }) => (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {prefix}
            {typeof value === "number" ? value.toLocaleString() : value}
            {suffix}
          </p>
          {growth && (
            <div className="flex items-center mt-2">
              {growth > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  growth > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {Math.abs(growth)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">than last year</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const AttendanceChart = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Student Attendance
        </h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#3b82f6"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${stats.studentAttendance * 2.51} 251`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">
              {stats.studentAttendance}%
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Present</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Absent</span>
        </div>
      </div>
    </div>
  );

  const PerformanceChart = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Student Performance
        </h3>
        <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option>Weekly</option>
          <option>Monthly</option>
          <option>Yearly</option>
        </select>
      </div>
      <div className="space-y-4">
        {performanceChartData && performanceChartData.length > 0 ? (
          performanceChartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {item.class}
              </span>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {item.value}%
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No performance data</p>
            <p className="text-gray-400 text-xs">
              Performance metrics will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const TaskList = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
        <button
          onClick={handleAddTask}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Task
        </button>
      </div>
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  {(task.dueDate || task.dueTime) && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTaskDate(task.dueDate, task.dueTime)}
                    </div>
                  )}
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : task.status === "in-progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {task.status === "completed"
                    ? "Done"
                    : task.status === "in-progress"
                    ? "In Progress"
                    : "Pending"}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No tasks available</p>
            <p className="text-gray-400 text-xs">Add a task to get started</p>
          </div>
        )}
      </div>
    </div>
  );

  const RecentActivity = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {recentActivityData && recentActivityData.length > 0 ? (
          recentActivityData.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No recent activity</p>
            <p className="text-gray-400 text-xs">
              Activity will appear here when available
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const Agenda = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Agenda</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-4">
        {agenda.length > 0 ? (
          agenda.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.subject}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{item.task}</p>
                  <p className="text-xs text-gray-500 mt-2">{item.time}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No agenda items</p>
            <p className="text-gray-400 text-xs">
              Schedule items will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening at your school.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary">Export</button>
          <button className="btn-primary">Add New</button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error.message || error.toString()}
        </div>
      )}

      {/* Welcome Banner */}
      {showWelcomeBanner && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white relative">
          <button
            onClick={() => setShowWelcomeBanner(false)}
            className="absolute top-4 right-4 text-white hover:text-blue-200 transition-colors duration-200"
            aria-label="Close welcome banner"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-between pr-8">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Welcome to your dashboard
              </h2>
              <p className="text-blue-100">
                Manage your school data and monitor progress
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-blue-400 rounded-full flex items-center justify-center">
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {getUserInitials()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Classes"
          value={loading ? 0 : stats.totalClasses}
          icon={BookOpen}
          growth={stats.classesGrowth}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Students"
          value={loading ? 0 : stats.totalStudents}
          icon={GraduationCap}
          growth={stats.studentsGrowth}
          color="bg-yellow-500"
        />
        <StatCard
          title="Total Teachers"
          value={loading ? 0 : stats.totalTeachers}
          icon={Users}
          growth={0}
          color="bg-green-500"
        />
      </div>

      {/* Charts and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AttendanceChart />
        <PerformanceChart />
        <TaskList />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <Agenda />
      </div>

      {/* Popups */}
      {showAddTaskPopup && (
        <AddTaskPopup
          taskFormData={taskFormData}
          handleTaskFormChange={handleTaskFormChange}
          handleCloseAddTaskPopup={handleCloseAddTaskPopup}
          handleSaveTask={handleSaveTask}
        />
      )}
      {showTaskDetailPopup && (
        <TaskDetailPopup
          selectedTask={selectedTask}
          handleCloseTaskDetail={handleCloseTaskDetail}
          handleDeleteTask={handleDeleteTask}
          formatTaskDate={formatTaskDate}
        />
      )}
    </div>
  );
};

export default Dashboard;
