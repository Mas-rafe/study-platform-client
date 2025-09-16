// import { motion } from "framer-motion";
// import { Link } from "react-router";


// const DashboardDrawer = ({ open, onClose }) => {
//   return (
//     <>
//       {/* Overlay */}
//       {open && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-40"
//           onClick={onClose}
//         ></div>
//       )}

//       {/* Drawer */}
//       <motion.div
//         initial={{ x: "-100%" }}
//         animate={{ x: open ? 0 : "-100%" }}
//         transition={{ duration: 0.4 }}
//         className="fixed top-0 left-0 w-80 h-full bg-base-200 shadow-lg z-50 p-4"
//       >
//         <h2 className="text-xl font-bold mb-4">Dashboard</h2>
//         <ul className="menu">
//           <li><Link to="/dashboard/sessions">My Sessions</Link></li>
//           <li><Link to="/dashboard/create-session">Create Session</Link></li>
//           <li><Link to="/dashboard/profile">Profile</Link></li>
//         </ul>
//       </motion.div>
//     </>
//   );
// };

// export default DashboardDrawer;
