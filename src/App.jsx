import { BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import AppLayout from "./components/Layout/AppLayout";
import Homepage from "./pages/Homepage";
import Leaderboard from "./pages/Leaderboard";
import CreateUpload from "./pages/CreateUpload";
import Messages from "./pages/Messages";
import OAuthCallback from "./pages/OAuthCallback";
import Profile from "./pages/Profile";
import SearchResults from "./pages/SearchResults";
import Settings from "./pages/Settings";
import VideoDetails from "./pages/VideoDetails";

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-slate100 dark:bg-[#121212] dark:text-white">
      Loading...
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;

  return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />;
}

function LandingRoute() {
  const navigate = useNavigate();

  return <LandingPage onLogin={() => navigate("/login")} onSignUp={() => navigate("/signup")} />;
}

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;

  return <Navigate to={isAuthenticated ? "/home" : "/welcome"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/welcome" element={<LandingRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Homepage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/create" element={<CreateUpload />} />
        </Route>

        <Route path="/video/:id" element={<VideoDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}