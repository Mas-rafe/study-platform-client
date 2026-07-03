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
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme initial value
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    return savedTheme === "dark" || (!savedTheme && prefersDark);
  });

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

  // Theme apply effect
  useEffect(() => {
    const theme = darkMode ? "dark" : "light";

    // DaisyUI theme
    document.documentElement.setAttribute("data-theme", theme);

    // Tailwind dark: class
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Save theme
    localStorage.setItem("theme", theme);
  }, [darkMode]);

  // Auth listener
  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser?.email) {
        try {
          const res = await axios.get(
            `https://study-platform-server-ruddy.vercel.app/users/${currentUser.email}`
          );

          setRole(res.data?.role || "student");

          const jwtRes = await axios.post(
            "https://study-platform-server-ruddy.vercel.app/jwt",
            {
              email: currentUser.email,
            }
          );

          if (jwtRes.data?.token) {
            localStorage.setItem("access-token", jwtRes.data.token);
          }
        } catch (err) {
          console.error("AuthProvider error:", err);
          setRole("student");
          localStorage.removeItem("access-token");
        }
      } else {
        setRole("student");
        localStorage.removeItem("access-token");
      }

      setLoading(false);
    });

    return () => {
      unSubscribe();
    };
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const authInfo = {
    user,
    email: user?.email || null,
    role,
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