
import RootLayout from "../Layouts/RootLayout";
import Home from "../pages/Home/Home";
import Login from "../pages/Authentication/Login";
import Register from "../pages/Authentication/Register";
import StudySessionsPage from "../pages/StudySessionsPage/StudySessionsPage";
import DashboardLayout from "../Layouts/DashboardLayout";

import TutorDashboard from "../pages/Dashboard/TutorDashboard/TutorDashboard";
import StudySessionsForm from "../pages/Dashboard/StudySessionsForm/StudySessionsForm";
import AdminDashboard from "../pages/Dashboard/AdminDashboard/AdminDashboard";
import ManageSessions from "../pages/Dashboard/AdminDashboard/ManageSessions";
import { createBrowserRouter } from "react-router";
import StudentDashboard from "../pages/Dashboard/StudentDasboard/StudentDasboard";

const router = createBrowserRouter([
 {
    path: "/",
    Component: RootLayout, 
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "study-sessions", Component: StudySessionsPage },
      {
        path: "dashboard",
        Component: DashboardLayout,
        children: [
          // Student
          { path: "student", Component: StudentDashboard },
          { path: "my-bookings", Component: StudentDashboard }, // replace with MyBookings
          { path: "my-reviews", Component: StudentDashboard }, // replace with MyReviews
          { path: "my-notes", Component: StudentDashboard },   // replace with MyNotes

          // Tutor
          { path: "tutor", Component: TutorDashboard },
          { path: "add-session", Component: StudySessionsForm },
          // { path: "my-sessions", Component: MySessions },
          // { path: "my-materials", Component: MyMaterials },

          // Admin
          { path: "admin", Component: AdminDashboard },
          { path: "manage-sessions", Component: ManageSessions },
          // { path: "manage-users", Component: ManageUsers },
          // { path: "manage-reviews", Component: ManageReviews },
          // { path: "manage-materials", Component: ManageMaterials },
        ],
      },
    ],
  },
]);

export default router;
