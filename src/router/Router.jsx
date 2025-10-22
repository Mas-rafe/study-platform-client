
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
import StudentDashboard from "../pages/Dashboard/StudentDasboard/StudentDasboardHome";
import ManageUsers from "../pages/Dashboard/AdminDashboard/ManageUsers";

import SessionDetails from "../pages/StudySessionsPage/SessionDetails/SessionDetails";
import AdminRoute from "../pages/Dashboard/AdminDashboard/AdminRoute/AdminRoute";
import ManageReviews from "../pages/Dashboard/AdminDashboard/ManageReviews";


import ManageMaterials from "../pages/Dashboard/AdminDashboard/ManageMaterials";
import StudentMaterials from "../pages/Dashboard/StudentDasboard/StudentMaterial";
import MySessions from "../pages/Dashboard/TutorDashboard/TutorSessions/MySessions";
import AddMaterial from "../pages/Dashboard/TutorDashboard/AddMaterial/AddMaterial";
import MyUploadedMaterials from "../pages/Dashboard/TutorDashboard/MyUploadedMaterial/MyUploadedMaterial";
import TutorDashboardHome from "../pages/Dashboard/TutorDashboard/TutorHome/TutorDashboardHome";
import StudentDashboardHome from "../pages/Dashboard/StudentDasboard/StudentDasboardHome";
import StudentBookedSessionDetails from "../pages/Dashboard/StudentDasboard/StudentBookedSessionDetails";
import StudentBookedSessionMaterials from "../pages/Dashboard/StudentDasboard/StudentBookedSessionMaterials";
import MyBookings from "../pages/Dashboard/StudentDasboard/MyBooking";
import CreateNote from "../pages/Dashboard/StudentDasboard/CreateNote";
import MyNotes from "../pages/Dashboard/StudentDasboard/MyNotes";
import PrivateRoute from "../Routes/PrivateRoute";
import ManageBookings from "../pages/Dashboard/AdminDashboard/ManageBookings";

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true,
         Component: Home },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      {
        path: "study-sessions",
        Component: StudySessionsPage,
      },
      {

        path: "session-details/:id",
       element: <PrivateRoute>
          <SessionDetails></SessionDetails>
       </PrivateRoute>
      },
      {
        path: "dashboard",
        element: <PrivateRoute>
          <div className="pt-20 max-h-screen">
          <DashboardLayout></DashboardLayout>
          </div>
        </PrivateRoute>,
        children: [
          // Student
          {
            path: "student",
            Component: StudentDashboardHome
          },
          {
            path: "/dashboard/student/bookings/:id",
            Component: StudentBookedSessionDetails
          },
          {
            path: "my-bookings",
            Component: MyBookings
          },
          { path: "my-reviews", Component: StudentDashboard },
          {
            path: "create-note",
            Component: CreateNote
          },
          {
            path: "my-notes",
            Component: MyNotes
          },
          {
            path: "my-materials",
            Component: StudentMaterials
          },
          {
            path: "/dashboard/student/bookings/:id/materials",
            Component: StudentBookedSessionMaterials
          }, // replace with MyNotes

          // Tutor
          {
            path: "tutor",
            Component: TutorDashboardHome
          },
          {
            path: "add-session",
            Component: StudySessionsForm
          },
          {
            path: "my-sessions",
            Component: MySessions
          },
          {
            path: "tutor-materials",
            Component: AddMaterial
          },
          {
            path: "my-material",
            Component: MyUploadedMaterials
          },

          // Admin
          {
            path: "admin",
            element: (<AdminRoute>
              <AdminDashboard />
            </AdminRoute>)
          },
          {
            path: "manage-sessions",
            element: (<AdminRoute>
              <ManageSessions />
            </AdminRoute>)
          },
          {  path: "manage-bookings",
            element: (<AdminRoute>
              <ManageBookings />
            </AdminRoute>)
          },
          {
            path: "manage-users",
            element: (<AdminRoute>
              <ManageUsers />
            </AdminRoute>)
          },
          {
            path: "manage-reviews",
            element: <AdminRoute>
              <ManageReviews />
            </AdminRoute>
          },
          {
            path: "manage-materials",
            element: <AdminRoute>
              <ManageMaterials />
            </AdminRoute>
          }

        ],
      },
    ],
  },
]);

export default router;
