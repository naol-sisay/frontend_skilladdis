import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Welcome from "./components/Welcome";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CreateCourse from "./components/CreateCourse";
import CourseCatalog from "./components/CourseCatalog";
import MyCourses from "./components/MyCourses";
import CoursePlayer from "./components/CoursePlayer";
import InstructorCourses from "./components/InstructorCourses";
import AppShell from "./components/AppShell";
import Profile from "./components/Profile";
import ExamEngine from "./components/ExamEngine";
import CertificateView from "./components/CertificateView";
import AddExamQuestion from "./components/AddExamQuestion";
import AdminConsole from "./components/AdminConsole";

// Import the hook we just built
import useInactivityLogout from "./hooks/useInactivityLogout";

// 1. Build a silent tracking component that has access to the Router's location context.
//    The hook is ALWAYS called (Rules of Hooks); the route check lives inside it.
const SessionTracker = () => {
  const location = useLocation();
  useInactivityLogout(15, location.pathname);
  return null; // This component renders nothing to the DOM
};

function App() {
  return (
    <Router>
      {/* 2. Inject the tracker inside the Router so it can read the URL */}
      <SessionTracker /> 
      
      <Routes>
        {/* Standalone / immersive pages (no sidebar) */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/player/:courseId" element={<CoursePlayer />} />
        <Route path="/certificate/:certificateId" element={<CertificateView />} />
        <Route path="/exam/:courseId" element={<ExamEngine />} />

        {/* Hidden admin console — reached only by typing /admin */}
        <Route path="/admin" element={<AdminConsole />} />

        {/* App pages inside the sidebar shell */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/catalog" element={<CourseCatalog />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/instructor/courses" element={<InstructorCourses />} />
          <Route path="/admin/exams/:examId/add-question" element={<AddExamQuestion />} />
        </Route>

        <Route path="*" element={<Welcome />} />
      </Routes>
    </Router>
  );
}

export default App;