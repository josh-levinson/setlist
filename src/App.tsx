import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { Auth } from "./components/Auth";
import { FeedbackModal } from "./components/FeedbackModal";
import { useAuth } from "./contexts/AuthContext";
import {
  JokesPage,
  SetlistsPage,
  JokeFormPage,
  JokeViewPage,
  SetlistFormPage,
  SetlistViewPage,
  AuthCallbackPage,
  ResetPasswordPage,
  TagAnalysisPage,
  SetlistSuggestPage,
} from "./pages";
import styles from "./App.module.css";
import shared from "./styles/shared.module.css";

function AppHeader() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Don't show auth wrapper on auth routes
  if (!user && !location.pathname.startsWith("/auth/")) {
    return (
      <div className={styles.authWrapper}>
        <Auth />
      </div>
    );
  }

  // Don't show header on auth routes (whether authenticated or not)
  if (location.pathname.startsWith("/auth/")) {
    return null;
  }

  // Don't show header if no user
  if (!user) {
    return null;
  }

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>🎭 Comedy Setlist Manager</h1>
        <nav className={styles.navigation}>
          <Link
            to="/jokes"
            className={`${styles.navButton} ${location.pathname.startsWith("/jokes") ? styles.active : ""
              }`}
          >
            Jokes
          </Link>
          <Link
            to="/setlists"
            className={`${styles.navButton} ${location.pathname.startsWith("/setlists") ? styles.active : ""
              }`}
          >
            Setlists
          </Link>
          <Link
            to="/tag-analysis"
            className={`${styles.navButton} ${location.pathname.startsWith("/tag-analysis") ? styles.active : ""
              }`}
          >
            AI Tags
          </Link>
        </nav>
        <div className={styles.userSection}>
          <button
            onClick={() => setFeedbackOpen(true)}
            className={shared.btnSecondary}
          >
            Feedback
          </button>
          <span className={styles.userEmail}>{user.email}</span>
          <button onClick={signOut} className={shared.btnSecondary}>
            Sign Out
          </button>
        </div>
      </header>
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        pageContext={location.pathname}
      />
    </>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  console.log("AppContent - user:", user ? user.email : "no user", "loading:", loading);

  // Show loading screen while auth is initializing
  if (loading) {
    return (
      <div className={styles.loading}>
        <h2>Loading...</h2>
      </div>
    );
  }


  return (
    <main className={styles.main}>
      <Routes>
        {/* Auth routes - accessible without authentication */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes - require authentication */}
        {user ? (
          <>
            <Route path="/" element={<Navigate to="/jokes" replace />} />
            <Route path="/jokes" element={<JokesPage />} />
            <Route path="/jokes/new" element={<JokeFormPage />} />
            <Route path="/jokes/:id" element={<JokeViewPage />} />
            <Route path="/jokes/:id/edit" element={<JokeFormPage />} />
            <Route path="/setlists" element={<SetlistsPage />} />
            <Route path="/setlists/new" element={<SetlistFormPage />} />
            <Route path="/setlists/suggest" element={<SetlistSuggestPage />} />
            <Route path="/setlists/:id" element={<SetlistViewPage />} />
            <Route path="/setlists/:id/edit" element={<SetlistFormPage />} />
            <Route path="/tag-analysis" element={<TagAnalysisPage />} />
            <Route path="*" element={<Navigate to="/jokes" replace />} />
          </>
        ) : (
          // Redirect to auth if not authenticated and trying to access protected routes
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </main>
  );
}

function App() {
  return (
    <Router>
      <div className={styles.app}>
        <AppHeader />
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
