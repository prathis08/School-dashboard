import React, { useState } from "react";
import { Calendar, Plus, Layers, Eye } from "lucide-react";
import AcademicYearManagement from "./Enhanced/AcademicYearManagement";
import FeeTypeManagement from "./Enhanced/FeeTypeManagement";
import InstallmentSchedules from "./Enhanced/InstallmentSchedules";
import ViewSchedules from "./Enhanced/ViewSchedules";

const InstallmentTemplates = () => {
  const [activeTab, setActiveTab] = useState("academic-years");

  const tabs = [
    { id: "academic-years", name: "Academic Years", icon: Calendar },
    { id: "fee-types", name: "Fee Types", icon: Layers },
    { id: "schedules", name: "Create Schedules", icon: Plus },
    { id: "view-schedules", name: "View Schedules", icon: Eye },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "academic-years":
        return <AcademicYearManagement />;
      case "fee-types":
        return <FeeTypeManagement />;
      case "schedules":
        return <InstallmentSchedules />;
      case "view-schedules":
        return <ViewSchedules />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Installment Templates
        </h1>
        <p className="text-gray-600 mt-1">
          Set up academic years, fee types, and create installment schedules
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>{renderContent()}</div>
    </div>
  );
};

export default InstallmentTemplates;
