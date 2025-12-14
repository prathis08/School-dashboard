import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Bell,
  Shield,
} from "lucide-react";
import { useProfile, useUpdateProfile } from "../../hooks/useApiHooks";

const Profile = () => {
  // Use TanStack Query hooks
  const { data: profileData, isLoading: loading, error } = useProfile();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    joiningDate: "",
    department: "",
    position: "",
    qualification: "",
    experience: "",
    bio: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    socialMedia: {
      linkedin: "",
      twitter: "",
    },
  });

  const [tempData, setTempData] = useState({});

  // Update tempData when profileData changes
  useEffect(() => {
    if (profileData?.data?.user) {
      const user = profileData.data.user;
      const normalizedData = {
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth || "",
        joiningDate: user.createdAt ? user.createdAt.split("T")[0] : "",
        department: user.department || "",
        position: user.position || user.role || "",
        qualification: user.qualification || "",
        experience: user.experience || "",
        bio: user.bio || "",
        userId: user.userId || "",
        schoolId: user.schoolId || "",
        isActive: user.isActive || false,
        emergencyContact: user.emergencyContact || {
          name: "",
          relationship: "",
          phone: "",
        },
        socialMedia: user.socialMedia || {
          linkedin: "",
          twitter: "",
        },
      };
      setTempData(normalizedData);
      setFormData(normalizedData);
    }
  }, [profileData]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Profile
          </h3>
          <p className="text-gray-600 mb-4">
            {error.message || "Failed to load profile data"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No profile data
  if (!profileData?.data?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No profile data available</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setTempData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setTempData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ data: tempData });
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      // You could add error state handling here if needed
    }
  };

  const handleCancel = () => {
    if (profileData?.data?.user) {
      const user = profileData.data.user;
      const normalizedData = {
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth || "",
        joiningDate: user.createdAt ? user.createdAt.split("T")[0] : "",
        department: user.department || "",
        position: user.position || user.role || "",
        qualification: user.qualification || "",
        experience: user.experience || "",
        bio: user.bio || "",
        userId: user.userId || "",
        schoolId: user.schoolId || "",
        isActive: user.isActive || false,
        emergencyContact: user.emergencyContact || {
          name: "",
          relationship: "",
          phone: "",
        },
        socialMedia: user.socialMedia || {
          linkedin: "",
          twitter: "",
        },
      };
      setTempData(normalizedData);
    }
    setIsEditing(false);
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "professional", label: "Professional", icon: Briefcase },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const PersonalInfoTab = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {(tempData.name || "User")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </span>
          </div>
          {isEditing && (
            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-200">
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {tempData.name || "User"}
          </h2>
          <p className="text-gray-600">
            {tempData.position || "Position not specified"}
          </p>
          <p className="text-sm text-gray-500">
            {tempData.department || "Department not specified"}
          </p>
          <div className="flex items-center mt-2 space-x-4">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                tempData.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {tempData.isActive ? "Active" : "Inactive"}
            </span>
            {tempData.userId && (
              <span className="text-sm text-gray-500">
                ID: {tempData.userId}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={tempData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <span>{tempData.name || "Not provided"}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={tempData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <span>{tempData.email || "Not provided"}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={tempData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <span>{tempData.phone || "Not provided"}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          {isEditing ? (
            <input
              type="date"
              value={tempData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <span>
                {tempData.dateOfBirth
                  ? new Date(tempData.dateOfBirth).toLocaleDateString()
                  : "Not provided"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        {isEditing ? (
          <textarea
            value={tempData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
            <span>{tempData.address || "Not provided"}</span>
          </div>
        )}
      </div>

      {/* School Information */}
      {tempData.schoolId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School ID
          </label>
          <div className="flex items-center">
            <GraduationCap className="w-5 h-5 text-gray-400 mr-3" />
            <span>{tempData.schoolId}</span>
          </div>
        </div>
      )}

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        {isEditing ? (
          <textarea
            value={tempData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell us about yourself..."
          />
        ) : (
          <p className="text-gray-700">{tempData.bio || "No bio provided"}</p>
        )}
      </div>

      {/* Emergency Contact */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Emergency Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={tempData.emergencyContact.name}
                onChange={(e) =>
                  handleNestedInputChange(
                    "emergencyContact",
                    "name",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <span>{tempData.emergencyContact?.name || "Not provided"}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship
            </label>
            {isEditing ? (
              <input
                type="text"
                value={tempData.emergencyContact.relationship}
                onChange={(e) =>
                  handleNestedInputChange(
                    "emergencyContact",
                    "relationship",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <span>
                {tempData.emergencyContact?.relationship || "Not provided"}
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={tempData.emergencyContact.phone}
                onChange={(e) =>
                  handleNestedInputChange(
                    "emergencyContact",
                    "phone",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <span>{tempData.emergencyContact?.phone || "Not provided"}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const ProfessionalTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position
          </label>
          {isEditing ? (
            <input
              type="text"
              value={tempData.position}
              onChange={(e) => handleInputChange("position", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center">
              <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
              <span>{tempData.position || "Not specified"}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          {isEditing ? (
            <select
              value={tempData.department}
              onChange={(e) => handleInputChange("department", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Department</option>
              <option value="Administration">Administration</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="Arts">Arts</option>
            </select>
          ) : (
            <div className="flex items-center">
              <GraduationCap className="w-5 h-5 text-gray-400 mr-3" />
              <span>{tempData.department || "Not specified"}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qualification
          </label>
          {isEditing ? (
            <input
              type="text"
              value={tempData.qualification}
              onChange={(e) =>
                handleInputChange("qualification", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center">
              <Award className="w-5 h-5 text-gray-400 mr-3" />
              <span>{tempData.qualification || "Not specified"}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience
          </label>
          {isEditing ? (
            <input
              type="text"
              value={tempData.experience}
              onChange={(e) => handleInputChange("experience", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <span>{tempData.experience || "Not specified"}</span>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Created
          </label>
          {isEditing ? (
            <input
              type="date"
              value={tempData.joiningDate}
              onChange={(e) => handleInputChange("joiningDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <span>
                {tempData.joiningDate
                  ? new Date(tempData.joiningDate).toLocaleDateString()
                  : "Not specified"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const SecurityTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Change Password
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm new password"
            />
          </div>
          <button className="btn-primary">
            <Lock className="w-4 h-4 mr-2" />
            Update Password
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Two-Factor Authentication
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700">
              Add an extra layer of security to your account
            </p>
            <p className="text-sm text-gray-500">Currently disabled</p>
          </div>
          <button className="btn-primary">Enable 2FA</button>
        </div>
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Email Notifications
        </h3>
        <div className="space-y-4">
          {[
            { label: "New student enrollments", enabled: true },
            { label: "Fee payment updates", enabled: true },
            { label: "Weekly reports", enabled: false },
            { label: "System maintenance", enabled: true },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-700">{item.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={item.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Push Notifications
        </h3>
        <div className="space-y-4">
          {[
            { label: "Browser notifications", enabled: true },
            { label: "Mobile app notifications", enabled: false },
            { label: "Desktop notifications", enabled: true },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-700">{item.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={item.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="btn-secondary flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === "personal" && <PersonalInfoTab />}
        {activeTab === "professional" && <ProfessionalTab />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "notifications" && <NotificationsTab />}
      </div>
    </div>
  );
};

export default Profile;
