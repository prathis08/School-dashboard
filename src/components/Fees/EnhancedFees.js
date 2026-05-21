import React, { useState, useEffect } from "react";
import {
  Calendar,
  IndianRupee,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  BookOpen,
  Layers,
} from "lucide-react";
import FeeTypeManagement from "./Enhanced/FeeTypeManagement";
import FeeStructureManagement from "./Enhanced/FeeStructureManagement";
import StudentFeeAssignment from "./Enhanced/StudentFeeAssignment";
import PaymentRecording from "./Enhanced/PaymentRecording";
import ReportsAnalytics from "./Enhanced/ReportsAnalytics";

const EnhancedFees = ({ activeTab: initialActiveTab = "dashboard" }) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  // Update activeTab when route changes
  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);

  const tabs = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: BarChart3,
      description: "Overview & Statistics",
    },
    {
      id: "feeTypes",
      name: "Fee Types",
      icon: IndianRupee,
      description: "Define Fee Categories",
    },
    {
      id: "feeStructure",
      name: "Fee Structure",
      icon: BookOpen,
      description: "Manage Fee Structures",
    },
    {
      id: "studentFees",
      name: "Student Fees",
      icon: Users,
      description: "Assign to Students",
    },
    {
      id: "payments",
      name: "Payments",
      icon: CreditCard,
      description: "Record Payments",
    },
    {
      id: "reports",
      name: "Reports",
      icon: BarChart3,
      description: "Analytics & Reports",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <ReportsAnalytics isDashboard={true} />;
      case "feeTypes":
        return <FeeTypeManagement />;
      case "feeStructure":
        return <FeeStructureManagement />;
      case "studentFees":
        return <StudentFeeAssignment />;
      case "payments":
        return <PaymentRecording />;
      case "reports":
        return <ReportsAnalytics />;
      default:
        return <ReportsAnalytics isDashboard={true} />;
    }
  };

  return <div className="space-y-6">{renderContent()}</div>;
};

export default EnhancedFees;
