import { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from '../services/firebase';
import { syncUser } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const { data } = await syncUser();
          setDbUser(data.user || data);
        } catch {
          // Sync failed silently – user can still use the app
          setDbUser(null);
        }
      } else {
        setUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = async (name, email, password) => {
    const { user: newUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(newUser, { displayName: name });
    const { data } = await syncUser();
    setDbUser(data.user || data);
    toast.success('Account created successfully!');
    return newUser;
  };

  const login = async (email, password) => {
    const { user: loggedIn } = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const { data } = await syncUser();
    setDbUser(data.user || data);
    toast.success('Welcome back!');
    return loggedIn;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setDbUser(null);
    toast.success('Logged out');
  };

  const isAdmin = dbUser?.role === 'admin';

  const value = {
    user,
    dbUser,
    loading,
    signup,
    login,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
