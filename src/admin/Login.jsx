
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Code2, LockKeyhole, Mail, ArrowLeft } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      sessionStorage.setItem("codeseed_admin_token", response.data.token);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to log in. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-auth-page">
      <form className="admin-auth-card" onSubmit={handleSubmit}>
        <Link to="/" className="admin-back-link">
          <ArrowLeft size={16} /> Back to CodeSeed
        </Link>

        <div className="admin-logo">
          <Code2 size={26} />
        </div>

        <span className="admin-eyebrow">CODESEED CONTROL PANEL</span>
        <h1>Welcome back.</h1>
        <p className="admin-muted">
          Sign in to manage your ebook store.
        </p>

        {error && <div className="admin-error">{error}</div>}

        <label htmlFor="admin-email">Email address</label>
        <div className="admin-input-wrap">
          <Mail size={18} />
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            placeholder="admin@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <label htmlFor="admin-password">Password</label>
        <div className="admin-input-wrap">
          <LockKeyhole size={18} />
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button className="admin-submit" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in to dashboard"}
        </button>

        <p className="admin-security-note">
          Authorized administrators only.
        </p>
      </form>
    </main>
  );
}
