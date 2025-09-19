import { createBrowserRouter } from "react-router";
import RootLayout from "../Layouts/RootLayout";
import Login from "../pages/Authentication/Login";
import Register from "../pages/Authentication/Register";
import Home from "../pages/Home/Home";
import DashboardLayout from "../Layouts/DashboardLayout";
import StudentDashboard from "../pages/Dashboard/StudentDashboard";
import StudySessionsForm from "../pages/Dashboard/StudySessionsForm/StudySessionsForm";
import StudySessionsPage from "../pages/StudySessionsPage/StudySessionsPage";
import AdminDashboard from "../pages/Dashboard/AdminDashboard/AdminDashboard";
import ManageSessions from "../pages/Dashboard/AdminDashboard/ManageSessions";


export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "register",
        Component: Register,
      },
      {
        path: "study-sessions",
        Component: StudySessionsPage,
      },
      {
        path: "dashboard",
        Component: DashboardLayout,
        children: [
          {
            path: "student",
            Component: StudentDashboard,
          },
          // {
          //   path: "teacher",
          //   Component: TeacherDashboard,
          // },
          {
            path: "admin",
            Component: AdminDashboard,
          },
{
            path: "admin/manage-sessions",
            Component: ManageSessions,
          },


          {
            path: "study-sessions",   // 👉 Tutor tool = form to create sessions
            Component: StudySessionsForm,
          },
          // {
          //   path: "my-sessions",      // 👉 Tutors see the sessions they created
          //   Component: MySessions,
          // },
        ],
      },
    ],
  },
]);