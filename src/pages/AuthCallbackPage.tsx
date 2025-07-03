import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import styles from "./Pages.module.css";
import shared from "../styles/shared.module.css";

export function AuthCallbackPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback - URL:", window.location.href);
        console.log("Search params:", location.search);
        console.log("Hash:", location.hash);
        console.log("Current pathname:", location.pathname);

        // Check if this is a password reset verification
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get("token");
        const type = urlParams.get("type");

        console.log("Token:", token);
        console.log("Type:", type);

        if (token && type === "recovery") {
          console.log("Processing password reset verification...");

          // Verify the recovery token - this will sign the user in
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "recovery",
          });

          if (error) {
            console.error("Token verification error:", error);
            setError("Invalid or expired reset link. Please request a new password reset.");
            setIsLoading(false);
            return;
          }

          if (!data.user) {
            setError("Invalid reset token. Please request a new password reset.");
            setIsLoading(false);
            return;
          }

          console.log("Token verified successfully, user signed in:", data.user.email);
          console.log("About to redirect to reset password page...");

          // Check if there's a next parameter for redirect
          const next = urlParams.get("next");
          const redirectPath = next || "/auth/reset-password";

          // Redirect to reset password page - user is now signed in
          navigate(redirectPath, { replace: true });
          return;
        }

        // Handle regular OAuth callback
        console.log("Handling regular OAuth callback...");
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          setError("Authentication failed. Please try again.");
          setIsLoading(false);
          return;
        }

        if (data.session) {
          console.log("Authentication successful, redirecting to app");
          navigate("/jokes", { replace: true });
        } else {
          console.log("No session found, redirecting to login");
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Unexpected error in auth callback:", err);
        setError("An unexpected error occurred. Please try again.");
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [location, navigate]);

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>Authentication Error</h2>
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
      <div className={styles.loading}>
        <h2>Processing Authentication...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
