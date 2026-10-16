import { useEffect, useState } from "react";
import AuthPages from "./AuthPages.jsx";
import "./Auth.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [authView, setAuthView] = useState("signin");

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      const token = localStorage.getItem("sentinelopsToken");
      if (!token) {
        if (!cancelled) setChecking(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          localStorage.removeItem("sentinelopsToken");
          localStorage.removeItem("userName");
          if (!cancelled) setUser(null);
          return;
        }

        const data = await response.json();
        if (!cancelled) {
          setUser(data.user);
          localStorage.setItem("userName", data.user.name);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    verifySession();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleAuthenticated(data) {
    localStorage.setItem("sentinelopsToken", data.token);
    localStorage.setItem("userName", data.user.name);
    setUser(data.user);
  }

  function handleLogout() {
    localStorage.removeItem("sentinelopsToken");
    localStorage.removeItem("userName");
    setUser(null);
    setAuthView("signin");
  }

  if (checking) {
    return (
      <main className="auth-loading-screen">
        <div className="auth-loading-mark">S</div>
        <p>Checking your SentinelOps session…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <AuthPages
        initialView={authView}
        onChangeView={setAuthView}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  // Expose logout event for the existing dashboard via a browser custom event.
  // Add a logout menu item that dispatches "sentinelops:logout" to sign out.
  return (
    <div className="authenticated-app">
      {children}
      <LogoutListener onLogout={handleLogout} />
    </div>
  );
}

function LogoutListener({ onLogout }) {
  useEffect(() => {
    const listener = () => onLogout();
    window.addEventListener("sentinelops:logout", listener);
    return () => window.removeEventListener("sentinelops:logout", listener);
  }, [onLogout]);
  return null;
}
