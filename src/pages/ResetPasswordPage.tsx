import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import styles from "./Pages.module.css";
import shared from "../styles/shared.module.css";

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have an access token in the URL hash
        const hash = location.hash;
        if (!hash || !hash.includes("access_token")) {
          setError("Invalid reset link. Please request a new password reset.");
          return;
        }

        // Get the current session to verify the token is valid
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setError(
            "Invalid or expired reset link. Please request a new password reset."
          );
          return;
        }

        if (data.session) {
          setIsValidToken(true);
        } else {
          setError(
            "Invalid or expired reset link. Please request a new password reset."
          );
        }
      } catch {
        setError("An unexpected error occurred. Please try again.");
      }
    };

    handleAuthCallback();
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setIsSuccess(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.page}>
        <div className={styles.success}>
          <h2>Password Reset Successful!</h2>
          <p>Your password has been updated successfully.</p>
          <button
            onClick={() => navigate("/jokes")}
            className={shared.btnPrimary}
          >
            Continue to App
          </button>
        </div>
      </div>
    );
  }

  if (!isValidToken && !error) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <h2>Verifying reset link...</h2>
          <p>Please wait while we verify your reset link.</p>
        </div>
      </div>
    );
  }

  if (error && !isValidToken) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>Invalid Reset Link</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/")} className={shared.btnPrimary}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.authContainer}>
        <h2>Reset Your Password</h2>
        <p className={styles.subtitle}>Enter your new password below</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className={styles.input}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className={shared.btnPrimary}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className={styles.switch}>
          <p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className={styles.linkButton}
            >
              Back to Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
