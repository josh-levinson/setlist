import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { MagicLinkForm } from "./MagicLinkForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

type AuthMode = "login" | "signup" | "magicLink" | "resetPassword";

export function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");

  const switchToLogin = () => setMode("login");
  const switchToSignUp = () => setMode("signup");
  const switchToMagicLink = () => setMode("magicLink");
  const switchToResetPassword = () => setMode("resetPassword");

  switch (mode) {
    case "signup":
      return <SignUpForm onSwitchToLogin={switchToLogin} />;
    case "magicLink":
      return <MagicLinkForm onSwitchToLogin={switchToLogin} />;
    case "resetPassword":
      return <ResetPasswordForm onSwitchToLogin={switchToLogin} />;
    default:
      return (
        <LoginForm
          onSwitchToSignUp={switchToSignUp}
          onSwitchToMagicLink={switchToMagicLink}
          onSwitchToResetPassword={switchToResetPassword}
        />
      );
  }
}
