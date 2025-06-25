import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { Auth } from "./components/Auth";
import { useAuth } from "./contexts/AuthContext";
import {
  JokesPage,
  SetlistsPage,
  JokeFormPage,
  JokeViewPage,
  SetlistFormPage,
  SetlistViewPage,
  AuthCallbackPage,
} from "./pages";
import styles from "./App.module.css";
import shared from "./styles/shared.module.css";

function AppHeader() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <div className={styles.authWrapper}>
        <Auth />
      </div>
    );
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>🎭 Comedy Setlist Manager</h1>
      <nav className={styles.navigation}>
        <Link
          to="/jokes"
          className={`${styles.navButton} ${
            location.pathname.startsWith("/jokes") ? styles.active : ""
          }`}
        >
          Jokes
        </Link>
        <Link
          to="/setlists"
          className={`${styles.navButton} ${
            location.pathname.startsWith("/setlists") ? styles.active : ""
          }`}
        >
          Setlists
        </Link>
      </nav>
      <div className={styles.userSection}>
        <span className={styles.userEmail}>{user.email}</span>
        <button onClick={signOut} className={shared.btnSecondary}>
          Sign Out
        </button>
      </div>
    </header>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  // Show loading screen while auth is initializing
  if (loading) {
    return (
      <div className={styles.loading}>
        <h2>Loading...</h2>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return null; // Auth is handled in AppHeader
  }

  return (
    <main className={styles.main}>
      <Routes>
        <Route path="/" element={<Navigate to="/jokes" replace />} />
        <Route path="/jokes" element={<JokesPage />} />
        <Route path="/jokes/new" element={<JokeFormPage />} />
        <Route path="/jokes/:id" element={<JokeViewPage />} />
        <Route path="/jokes/:id/edit" element={<JokeFormPage />} />
        <Route path="/setlists" element={<SetlistsPage />} />
        <Route path="/setlists/new" element={<SetlistFormPage />} />
        <Route path="/setlists/:id" element={<SetlistViewPage />} />
        <Route path="/setlists/:id/edit" element={<SetlistFormPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="*" element={<Navigate to="/jokes" replace />} />
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
