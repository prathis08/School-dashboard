import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./components/Auth/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import Teachers from "./components/Teachers/Teachers";
import AddTeacher from "./components/Teachers/AddTeacher";
import TeacherDetail from "./components/Teachers/TeacherDetail";
import Students from "./components/Students/Students";
import AddStudent from "./components/Students/AddStudent";
import EditStudent from "./components/Students/EditStudent";
import StudentDetail from "./components/Students/StudentDetail";
import Classes from "./components/Classes/Classes";
import Subjects from "./components/Subjects/Subjects";
import SubjectDetail from "./components/Subjects/SubjectDetail";
import Fees from "./components/Fees/Fees";
import CreateFees from "./components/Fees/CreateFees";
import Profile from "./components/Profile/Profile";
import Settings from "./components/Settings/Settings";
import Layout from "./components/Layout/Layout";
import { isAuthenticated } from "./utils/cookies";
import "./index.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/teachers" element={<Teachers />} />
                      <Route path="/teachers/add" element={<AddTeacher />} />
                      <Route path="/teachers/:id" element={<TeacherDetail />} />
                      <Route path="/students" element={<Students />} />
                      <Route path="/students/add" element={<AddStudent />} />
                      <Route path="/students/:id" element={<StudentDetail />} />
                      <Route
                        path="/students/:id/edit"
                        element={<EditStudent />}
                      />
                      <Route path="/classes" element={<Classes />} />
                      <Route path="/subjects" element={<Subjects />} />
                      <Route path="/subjects/:id" element={<SubjectDetail />} />
                      <Route path="/fees" element={<Fees />} />
                      <Route path="/fees/create" element={<CreateFees />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
