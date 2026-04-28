import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/student/Login';
import StudentRegister from './pages/student/Register';
import RecruiterLogin from './pages/recruiter/Login';
import RecruiterRegister from './pages/recruiter/Register';
import StudentDashboard from './pages/student/Dashboard';
import StudentProfileBuilder from './pages/student/ProfileBuilder';
import StudentConnections from './pages/student/Connections';
import StudentProfile from './pages/student/Profile';
import ResumeGenerator from './pages/student/ResumeGenerator';
import RecruiterSearch from './pages/recruiter/Search';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterSaved from './pages/recruiter/Saved';
import RecruiterProfile from './pages/recruiter/Profile';
import StudentProfileDetail from './pages/recruiter/StudentProfileDetail';
import RecruiterProfileDetail from './pages/recruiter/RecruiterProfileDetail';
import Chat from './pages/Chat';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import RecruiterLayout from './layouts/RecruiterLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Student Auth */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/register" element={<StudentRegister />} />

          {/* Recruiter Auth */}
          <Route path="/recruiter/login" element={<RecruiterLogin />} />
          <Route path="/recruiter/register" element={<RecruiterRegister />} />

          {/* Protected Student Routes */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile-builder" element={<StudentProfileBuilder />} />
            <Route path="resume" element={<ResumeGenerator />} />
            <Route path="chat" element={<Chat userRole="student" />} />
            <Route path="connections" element={<StudentConnections />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="student-profile/:id" element={<StudentProfileDetail />} />
            <Route path="recruiter-profile/:id" element={<RecruiterProfileDetail />} />
          </Route>

          {/* Protected Recruiter Routes */}
          <Route path="/recruiter" element={<RecruiterLayout />}>
            <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="search" element={<RecruiterSearch />} />
            <Route path="saved" element={<RecruiterSaved />} />
            <Route path="chat" element={<Chat userRole="recruiter" />} />
            <Route path="connections" element={<StudentConnections />} />
            <Route path="profile" element={<RecruiterProfile />} />
            <Route path="student-profile/:id" element={<StudentProfileDetail />} />
            <Route path="recruiter-profile/:id" element={<RecruiterProfileDetail />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
