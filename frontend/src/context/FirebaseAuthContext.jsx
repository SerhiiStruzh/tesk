import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from "../firebase/firebaseConfig";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const FirebaseAuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);;
      return result
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  useEffect(() => { 
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { loginWithGoogle, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

