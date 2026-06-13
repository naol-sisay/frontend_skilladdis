import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <Router>
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
