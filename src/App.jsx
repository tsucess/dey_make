import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AppLayout from "./components/Layout/AppLayout";
import Homepage from "./pages/Homepage";
import LivePage from "./pages/LivePage";
import Leaderboard from "./pages/Leaderboard";
import CreateUpload from "./pages/CreateUpload";
import Messages from "./pages/Messages";
import OAuthCallback from "./pages/OAuthCallback";
import Profile from "./pages/Profile";
import SearchResults from "./pages/SearchResults";
import Settings from "./pages/Settings";
import VideoDetails from "./pages/VideoDetails";
import LiveRoom from "./pages/LiveRoom";
import { useLanguage } from "./context/LanguageContext";
import CreateLive from "./components/CreateLive";
import PreviewLive from "./components/PreviewLive";

function FullPageLoader() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-slate100 dark:bg-[#121212] dark:text-white">
      {t("app.loading")}
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, isLoading, pendingVerification } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageLoader />;

  if (pendingVerification && location.pathname !== "/auth/callback") {
    return <Navigate to="/verify-email" replace />;
  }

  return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />;
}

function PendingVerificationRoute() {
  const { isAuthenticated, isLoading, pendingVerification } = useAuth();

  if (isLoading) return <FullPageLoader />;

  if (isAuthenticated) return <Navigate to="/home" replace />;

  return pendingVerification ? <Outlet /> : <Navigate to="/login" replace />;
}

function LandingRoute() {
  const navigate = useNavigate();

  return <LandingPage onLogin={() => navigate("/login")} onSignUp={() => navigate("/signup")} />;
}

function RootRedirect() {
  const { isAuthenticated, isLoading, pendingVerification } = useAuth();

  if (isLoading) return <FullPageLoader />;

  if (pendingVerification) {
    return <Navigate to="/verify-email" replace />;
  }

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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<PendingVerificationRoute />}>
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        <Route path="/auth/callback" element={<OAuthCallback />} />

        <Route element={<AppLayout />}>
          <Route path="/users/:id" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Homepage />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/live/:id" element={<LiveRoom />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/create" element={<CreateUpload />} />
          <Route path="/create-live" element={<CreateLive />} />
          <Route path="/preview-live" element={<PreviewLive />} />
        </Route>

        <Route path="/video/:id" element={<VideoDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}