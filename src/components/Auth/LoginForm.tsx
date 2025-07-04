import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Auth.module.css";
import shared from "../../styles/shared.module.css";

interface LoginFormProps {
  onSwitchToSignUp: () => void;
  onSwitchToMagicLink: () => void;
  onSwitchToResetPassword: () => void;
}

export function LoginForm({
  onSwitchToSignUp,
  onSwitchToMagicLink,
  onSwitchToResetPassword,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
    } catch {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>Welcome Back</h2>
      <p className={styles.subtitle}>Sign in to your comedy setlist manager</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
          <div className={styles.passwordLinks}>
            <button
              type="button"
              onClick={onSwitchToResetPassword}
              className={styles.linkButton}
            >
              Forgot password?
            </button>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className={shared.btnPrimary}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button
          type="button"
          onClick={onSwitchToMagicLink}
          className={shared.btnSecondary}
        >
          Sign in with Magic Link
        </button>
      </form>

      <div className={styles.switch}>
        <p>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className={styles.linkButton}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
