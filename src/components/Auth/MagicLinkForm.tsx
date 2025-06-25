import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Auth.module.css";
import shared from "../../styles/shared.module.css";

interface MagicLinkFormProps {
  onSwitchToLogin: () => void;
}

export function MagicLinkForm({ onSwitchToLogin }: MagicLinkFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { signInWithMagicLink, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);

    try {
      await signInWithMagicLink(email);
      setIsSuccess(true);
    } catch {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.authContainer}>
        <h2>Check Your Email</h2>
        <div className={styles.successMessage}>
          <p>
            We've sent a magic link to <strong>{email}</strong>
          </p>
          <p>Click the link in your email to sign in instantly.</p>
          <p>If you don't see the email, check your spam folder.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsSuccess(false);
            setEmail("");
          }}
          className={shared.btnSecondary}
        >
          Send Another Link
        </button>
        <div className={styles.switch}>
          <p>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className={styles.linkButton}
            >
              Back to Sign In
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <h2>Magic Link Sign In</h2>
      <p className={styles.subtitle}>
        No password needed - just enter your email
      </p>

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

        {error && <div className={styles.error}>{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className={shared.btnPrimary}
        >
          {isLoading ? "Sending..." : "Send Magic Link"}
        </button>
      </form>

      <div className={styles.switch}>
        <p>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className={styles.linkButton}
          >
            Back to Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
