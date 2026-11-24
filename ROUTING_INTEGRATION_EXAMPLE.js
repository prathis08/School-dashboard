/**
 * Example: How to integrate Enhanced Fees into your React Router setup
 * 
 * This file shows you how to add the new Enhanced Fees module to your
 * existing routing structure.
 */

// ============================================
// Option 1: If using React Router v6 (current)
// ============================================

// In your App.js or main routing file:

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';

// Import your existing components
import Dashboard from './components/Dashboard/Dashboard';
import Students from './components/Students/Students';
import Teachers from './components/Teachers/Teachers';
import Fees from './components/Fees/Fees'; // Old fees

// Import the NEW Enhanced Fees component
import EnhancedFees from './components/Fees/EnhancedFees';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          
          {/* OLD fee system (keep for backward compatibility) */}
          <Route path="fees" element={<Fees />} />
          
          {/* NEW Enhanced fee system */}
          <Route path="fees/enhanced" element={<EnhancedFees />} />
          
          {/* Or replace old system entirely: */}
          {/* <Route path="fees" element={<EnhancedFees />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// ============================================
// Option 2: Update your sidebar/navigation
// ============================================

// In your Layout.js or wherever you define navigation items:

import {
  Home,
  Users,
  GraduationCap,
  DollarSign,
  FileText,
  Settings,
  BarChart3,
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: Home,
  },
  {
    name: "Students",
    path: "/students",
    icon: Users,
  },
  {
    name: "Teachers",
    path: "/teachers",
    icon: GraduationCap,
  },
  {
    name: "Fees", // This becomes a submenu
    icon: DollarSign,
    children: [
      {
        name: "Legacy Fees",
        path: "/fees",
        icon: FileText,
      },
      {
        name: "Enhanced Fees", // NEW!
        path: "/fees/enhanced",
        icon: BarChart3,
        badge: "New", // Optional: Add a "New" badge
      },
    ],
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

// ============================================
// Option 3: Sidebar component with dropdown
// ============================================

// Example sidebar implementation with nested navigation:

const Sidebar = () => {
  const [feesOpen, setFeesOpen] = useState(false);

  return (
    <nav className="space-y-1">
      {/* Other nav items... */}
      
      {/* Fees with submenu */}
      <div>
        <button
          onClick={() => setFeesOpen(!feesOpen)}
          className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 mr-3" />
            <span>Fees</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              feesOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {feesOpen && (
          <div className="ml-8 mt-1 space-y-1">
            <Link
              to="/fees"
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Legacy System
            </Link>
            <Link
              to="/fees/enhanced"
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <span>Enhanced System</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  New
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

// ============================================
// Option 4: Direct replacement (recommended after testing)
// ============================================

// Once you've tested and are happy with the enhanced system,
// simply replace the old route:

// BEFORE:
// <Route path="fees" element={<Fees />} />

// AFTER:
// <Route path="fees" element={<EnhancedFees />} />
// <Route path="fees/legacy" element={<Fees />} /> // Keep old as backup

// Update navigation:
// {
//   name: "Fees",
//   path: "/fees",
//   icon: DollarSign,
// }

// ============================================
// Option 5: Feature flag (gradual rollout)
// ============================================

// Use a feature flag to control which version users see:

const App = () => {
  const useEnhancedFees = true; // Or get from settings/backend

  return (
    <Routes>
      <Route
        path="fees"
        element={useEnhancedFees ? <EnhancedFees /> : <Fees />}
      />
    </Routes>
  );
};

// ============================================
// Testing Checklist
// ============================================

/**
 * Before deploying to production:
 * 
 * 1. Test all tabs in Enhanced Fees:
 *    □ Dashboard - Stats display correctly
 *    □ Academic Years - Create, view, activate
 *    □ Fee Types - Quick create works
 *    □ Class Fees - Assign to multiple classes
 *    □ Installments - Quarterly creation succeeds
 *    □ Student Fees - Assignment with discounts
 *    □ Payments - Record various payment methods
 *    □ Reports - All reports generate
 * 
 * 2. Test API integration:
 *    □ Check browser console for errors
 *    □ Verify API calls in Network tab
 *    □ Test with real backend data
 *    □ Verify data persistence
 * 
 * 3. Test responsive design:
 *    □ Desktop (>1024px)
 *    □ Tablet (768-1024px)
 *    □ Mobile (<768px)
 * 
 * 4. Test error handling:
 *    □ Network failures
 *    □ Invalid data
 *    □ Missing dependencies
 *    □ Empty states
 * 
 * 5. Performance test:
 *    □ Load time acceptable
 *    □ No memory leaks
 *    □ Smooth animations
 *    □ Query caching works
 */

// ============================================
// Quick Start Commands
// ============================================

/**
 * To start using Enhanced Fees:
 * 
 * 1. Ensure backend is running:
 *    npm run start:dev (or your backend start command)
 * 
 * 2. Start frontend:
 *    npm start
 * 
 * 3. Navigate to:
 *    http://localhost:3000/fees/enhanced
 * 
 * 4. Follow the workflow:
 *    - Create academic year
 *    - Add fee types (use quick create)
 *    - Setup class fees
 *    - Create schedules
 *    - Assign to students
 *    - Record payments
 *    - View reports
 */

export default App;
