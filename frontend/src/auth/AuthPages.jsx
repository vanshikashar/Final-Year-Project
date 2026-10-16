import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export function SignIn({ onChangeView, onAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const responseText = await response.text();

let data;
try {
  data = JSON.parse(responseText);
} catch {
  throw new Error(
    `Backend returned non-JSON content (HTTP ${response.status}). Check the API URL and /api/auth route.`
  );
}

      if (!response.ok) {
        throw new Error(data.error || "Could not sign in.");
      }

      onAuthenticated(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Check that the backend is running."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-form-heading">
        <span className="auth-eyebrow">WELCOME BACK</span>
        <h1>Sign in to SentinelOps</h1>
        <p>Access your cloud security intelligence dashboard.</p>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <label className="auth-label" htmlFor="signin-email">Email address</label>
        <div className="auth-input-wrap">
          <Mail size={18} />
          <input
            id="signin-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <label className="auth-label" htmlFor="signin-password">Password</label>
        <div className="auth-input-wrap">
          <LockKeyhole size={18} />
          <input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
          <button
            className="auth-password-toggle"
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button className="auth-submit" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
          {!busy && <ArrowRight size={18} />}
        </button>
      </form>

      <p className="auth-switch">
        Don’t have an account?{" "}
        <button type="button" onClick={() => onChangeView("signup")}>
          Create account
        </button>
      </p>
    </AuthLayout>
  );
}

export function SignUp({ onChangeView, onAuthenticated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create your account.");
      }

      onAuthenticated(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Check that the backend is running."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-form-heading">
        <span className="auth-eyebrow">GET STARTED</span>
        <h1>Create your account</h1>
        <p>Set up your secure workspace for cloud monitoring.</p>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <label className="auth-label" htmlFor="signup-name">Full name</label>
        <div className="auth-input-wrap">
          <UserRound size={18} />
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={80}
            required
          />
        </div>

        <label className="auth-label" htmlFor="signup-email">Email address</label>
        <div className="auth-input-wrap">
          <Mail size={18} />
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <label className="auth-label" htmlFor="signup-password">Password</label>
        <div className="auth-input-wrap">
          <LockKeyhole size={18} />
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
          <button
            className="auth-password-toggle"
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <label className="auth-label" htmlFor="signup-confirm">Confirm password</label>
        <div className="auth-input-wrap">
          <LockKeyhole size={18} />
          <input
            id="signup-confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
          />
        </div>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button className="auth-submit" type="submit" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
          {!busy && <ArrowRight size={18} />}
        </button>
      </form>

      <p className="auth-switch">
        Already registered?{" "}
        <button type="button" onClick={() => onChangeView("signin")}>
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
}

function AuthLayout({ children }) {
  // SignIn and SignUp share a common layout; view switching is managed by AuthGate.
  return (
    <main className="auth-screen">
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <span className="auth-brand-icon"><ShieldCheck size={25} /></span>
          <span>
            <strong>SentinelOps</strong>
            <small>Cloud Security Intelligence</small>
          </span>
        </div>

        <div className="auth-brand-message">
          <span className="auth-eyebrow">CLOUD SECURITY, SIMPLIFIED</span>
          <h2>Stay ahead of threats.<br />Protect what matters.</h2>
          <p>
            Monitor infrastructure, investigate security events, and identify
            unusual activity from one unified workspace.
          </p>

          <div className="auth-feature-list">
            <span><ShieldCheck size={17} /> Security alert monitoring</span>
            <span><Activity size={17} /> ML-powered anomaly detection</span>
            <span><LockKeyhole size={17} /> Protected user accounts</span>
          </div>
        </div>

        <div className="auth-brand-footer">
          <span className="auth-live-dot" /> SentinelOps workspace
          <span className="auth-footer-divider">•</span> Secure access
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container">{children}</div>
        <p className="auth-legal">Secure access to your cloud security workspace.</p>
      </section>
    </main>
  );
}

export default function AuthPages({ initialView = "signin", onChangeView, onAuthenticated }) {
  const [view, setView] = useState(initialView);

  function changeView(nextView) {
    setView(nextView);
    onChangeView?.(nextView);
  }

  return view === "signup" ? (
    <SignUp onChangeView={changeView} onAuthenticated={onAuthenticated} />
  ) : (
    <SignIn onChangeView={changeView} onAuthenticated={onAuthenticated} />
  );
}
