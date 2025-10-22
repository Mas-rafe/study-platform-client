import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../Firebase/firebase.init';
import axios from 'axios';


const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("student"); // 🔹 default role
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  const updateUserProfile = (profileInfo) => {
    return updateProfile(auth.currentUser, profileInfo);
  };

  const logOut = () => {
    setLoading(true);
    return signOut(auth);
  };

  // 🔹 Listen for auth changes
  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser?.email) {
        try {
          // 1️⃣ Get role
          const res = await axios.get(
            `https://study-platform-server-ruddy.vercel.app/users/${currentUser.email}`
          );
          setRole(res.data?.role || "student");

          // 2️⃣ Request JWT from backend
          const jwtRes = await axios.post("https://study-platform-server-ruddy.vercel.app/jwt", {
            email: currentUser.email,
          });

          if (jwtRes.data?.token) {
            localStorage.setItem("access-token", jwtRes.data.token);
          }
        } catch (err) {
          console.error("AuthProvider error:", err);
          setRole("student");
          localStorage.removeItem("access-token"); // clear old token
        }
      } else {
        setRole("student");
        localStorage.removeItem("access-token");
      }

      setLoading(false);
    });

       // 🔹 Apply saved theme on mount
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    return () => {
      unSubscribe();
    };
  }, []);

  // 🔹 Theme toggle function
  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newMode;
    });
  };


  const authInfo = {
    user,
    email: user?.email || null,
    role,   // 🔹 Now available everywhere
    loading,
    createUser,
    signIn,
    updateUserProfile,
    logOut,
    signInWithGoogle,
   darkMode,
    toggleTheme
  };

  return (
    <AuthContext value={authInfo}>
      {children}
    </AuthContext>
  );
};

export default AuthProvider;
