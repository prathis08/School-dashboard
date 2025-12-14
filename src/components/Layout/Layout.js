import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Icons } from "../../utils/icons";
import {
  clearDashboardConfig,
  setDashboardConfig,
  setSchoolId,
} from "../../utils/dashboardConfig";
import { clearAllAuthCookies } from "../../utils/cookies";
import { useDashboardConfig, useProfile } from "../../hooks/useApiHooks";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feesDropdownOpen, setFeesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch dashboard config from API
  const { data: dashboardConfig, isLoading, error } = useDashboardConfig();

  // Fetch user profile data
  const { data: profileData } = useProfile();

  // Store config in localStorage when fetched
  useEffect(() => {
    if (dashboardConfig?.data) {
      console.log("Dashboard config loaded:", dashboardConfig.data);
      setDashboardConfig(dashboardConfig.data);

      // Set schoolId if available in config
      if (dashboardConfig.data.schoolId) {
        console.log(
          "Setting schoolId from dashboard config:",
          dashboardConfig.data.schoolId
        );
        setSchoolId(dashboardConfig.data.schoolId);
      }
    }
  }, [dashboardConfig]);

  // Debug: Log enabled features
  useEffect(() => {
    if (dashboardConfig?.data?.features) {
      const enabledFeatures = dashboardConfig.data.features
        .filter((feature) => feature.enabled)
        .map((feature) => ({ id: feature.id, name: feature.name }));
      console.log("Enabled features:", enabledFeatures);
    }
  }, [dashboardConfig]);

  // Filter menu items based on enabled features from API
  const menuItems = useMemo(() => {
    const allMenuItems = [
      {
        id: "dashboard",
        name: "Dashboard",
        icon: Icons.Home,
        path: "/dashboard",
      },
      {
        id: "students",
        name: "Students", // Updated to match API response
        icon: Icons.GraduationCap,
        path: "/students",
      },
      {
        id: "classes",
        name: "Class",
        icon: Icons.School,
        path: "/classes",
      }, // Updated to match API response
      {
        id: "subjects",
        name: "Subjects", // Updated to match API response
        icon: Icons.BookOpen,
        path: "/subjects",
      },
      {
        id: "teachers",
        name: "Teachers",
        icon: Icons.Users,
        path: "/teachers",
      },
      {
        id: "fees",
        name: "Fees", // Updated to match API response
        icon: Icons.DollarSign,
        isDropdown: true,
        subItems: [
          { id: "create-fees", name: "Create Fees", path: "/fees/create" },
          { id: "fees-management", name: "Fees Management", path: "/fees" },
        ],
      },
      // Note: Teachers, attendance, library, and messages are not in the enabled features list
      // so they will be filtered out by the menuItems useMemo
    ];

    if (
      !dashboardConfig ||
      !dashboardConfig.data ||
      !dashboardConfig.data.features
    ) {
      // If config not loaded yet, show only dashboard
      return allMenuItems.filter((item) => item.id === "dashboard");
    }

    const enabledFeatureIds = dashboardConfig.data.features
      .filter((feature) => feature.enabled)
      .map((feature) => feature.id);

    return allMenuItems.filter((item) => enabledFeatureIds.includes(item.id));
  }, [dashboardConfig]);

  const otherItems = [
    { id: "profile", name: "Profile", icon: Icons.User, path: "/profile" },
    {
      id: "settings",
      name: "Settings",
      icon: Icons.Settings,
      path: "/settings",
    },
  ];

  // Create searchable items from menu items and other features
  const searchableItems = useMemo(() => {
    const items = [];

    // Add main menu items
    menuItems.forEach((item) => {
      if (item.isDropdown && item.subItems) {
        // Add dropdown subitems
        item.subItems.forEach((subItem) => {
          items.push({
            id: subItem.id,
            name: subItem.name,
            path: subItem.path,
            category: item.name,
          });
        });
      } else {
        items.push({
          id: item.id,
          name: item.name,
          path: item.path,
          category: "Main",
        });
      }
    });

    // Add other items
    otherItems.forEach((item) => {
      items.push({
        id: item.id,
        name: item.name,
        path: item.path,
        category: "Other",
      });
    });

    return items;
  }, [menuItems]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = searchableItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );

    setSearchResults(filtered);
    setShowSearchResults(true);
  }, [searchQuery, searchableItems]);

  const handleSearchSelect = (item) => {
    navigate(item.path);
    setSearchQuery("");
    setShowSearchResults(false);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    // Clear all authentication data
    clearAllAuthCookies(); // Clear cookies
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    clearDashboardConfig(); // Clear dashboard configuration on logout
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const isFeesPathActive = () => location.pathname.startsWith("/fees");

  // Get user data from profile API or fallback to localStorage
  const getUserInfo = () => {
    if (profileData?.data?.user) {
      const user = profileData.data.user;
      return {
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
        firstInitial: user.firstName?.charAt(0).toUpperCase() || "U",
      };
    }

    // Fallback to localStorage
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");
    return {
      name: localUser.name || "User",
      email: localUser.email || "user@example.com",
      firstInitial: localUser.name?.charAt(0).toUpperCase() || "U",
    };
  };

  const userInfo = getUserInfo();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Icons.GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-800">
              SchoolHub
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-500 hover:text-gray-600"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-6">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            MENU
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg mb-4">
              Failed to load menu configuration
            </div>
          )}

          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              if (item.isDropdown) {
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setFeesDropdownOpen(!feesDropdownOpen)}
                      className={`sidebar-item w-full text-left ${
                        isFeesPathActive() ? "active" : ""
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                      <Icons.ChevronDown
                        className={`w-4 h-4 ml-auto transition-transform duration-200 ${
                          feesDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {feesDropdownOpen && (
                      <ul className="mt-2 ml-6 space-y-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.id}>
                            <button
                              onClick={() => {
                                navigate(subItem.path);
                                setSidebarOpen(false);
                              }}
                              className={`sidebar-item w-full text-left text-sm ${
                                isActive(subItem.path) ? "active" : ""
                              }`}
                            >
                              <span>{subItem.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`sidebar-item w-full text-left ${
                      isActive(item.path) ? "active" : ""
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-8">
            OTHER
          </div>
          <ul className="space-y-1">
            {otherItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`sidebar-item w-full text-left ${
                      isActive(item.path) ? "active" : ""
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {userInfo.firstInitial}
              </span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-700">
                {userInfo.name}
              </p>
              <p className="text-xs text-gray-500">{userInfo.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <Icons.LogOut className="w-4 h-4 mr-3" />
            Log out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16">
          <div className="flex items-center justify-between h-full px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-600"
            >
              <Icons.Menu className="w-6 h-6" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4 relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icons.Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSearchResults(false), 200)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search dashboard features..."
                />
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => handleSearchSelect(item)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.category}
                          </p>
                        </div>
                        <Icons.ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {showSearchResults &&
                searchQuery &&
                searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No features found for "{searchQuery}"
                    </div>
                  </div>
                )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <Icons.Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile */}
              <div
                onClick={() => navigate("/profile")}
                className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {userInfo.firstInitial}
                  </span>
                </div>
                <div className="ml-3 hidden md:block">
                  <p className="text-sm font-medium text-gray-700">
                    {userInfo.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
