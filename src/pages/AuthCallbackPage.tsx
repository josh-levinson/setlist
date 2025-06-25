import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import styles from "./Pages.module.css";

export function AuthCallbackPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setError(error.message);
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to main app
          navigate("/jokes", { replace: true });
        } else {
          setError("Authentication failed. Please try again.");
        }
      } catch {
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <h2>Completing authentication...</h2>
          <p>Please wait while we sign you in.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/")} className={styles.btnPrimary}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return null;
}
