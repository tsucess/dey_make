import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";
import Spinner from "./components/Layout/Spinner";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Login = lazy(() => import("./pages/Login"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AppLayout = lazy(() => import("./components/Layout/AppLayout"));
const Homepage = lazy(() => import("./pages/Homepage"));
const LivePage = lazy(() => import("./pages/LivePage"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const CreateUpload = lazy(() => import("./pages/CreateUpload"));
const Messages = lazy(() => import("./pages/Messages"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileSubscribers = lazy(() => import("./pages/ProfileSubscribers"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const Workspace = lazy(() => import("./pages/Workspace"));
const VideoDetails = lazy(() => import("./pages/VideoDetails"));
const LiveRoom = lazy(() => import("./pages/LiveRoom"));
const PostLiveAnalytics = lazy(() => import("./pages/PostLiveAnalytics"));
const CreatorLiveDashboard = lazy(() => import("./pages/CreatorLiveDashboard"));
const CreateLive = lazy(() => import("./components/CreateLive"));
const PreviewLive = lazy(() => import("./components/PreviewLive"));

function FullPageLoader() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-slate100 dark:bg-[#121212] dark:text-white">
      <Spinner big/>
    </div>
  );
}

function RouteSuspense({ children }) {
  return <Suspense fallback={<FullPageLoader />}>{children}</Suspense>;
}

function renderLazyRoute(Component) {
  return (
    <RouteSuspense>
      <Component />
    </RouteSuspense>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;

  return user?.isAdmin ? <Outlet /> : <Navigate to="/home" replace />;
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

  return (
    <RouteSuspense>
      {/* <LandingPage onLogin={() => navigate("/login")} onSignUp={() => navigate("/signup")} /> */}
      <LandingPage onLogin={() => navigate("/login")} onSignUp={() => navigate("/")} />
    </RouteSuspense>
  );
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
          <Route path="/login" element={renderLazyRoute(Login)} />
          <Route path="/" element={renderLazyRoute(SignUp)} />
          {/* <Route path="/signup" element={renderLazyRoute(SignUp)} /> */}
          <Route path="/forgot-password" element={renderLazyRoute(ForgotPassword)} />
          <Route path="/reset-password" element={renderLazyRoute(ResetPassword)} />
        </Route>

        <Route element={<PendingVerificationRoute />}>
          <Route path="/verify-email" element={renderLazyRoute(VerifyEmail)} />
        </Route>

        <Route path="/auth/callback" element={renderLazyRoute(OAuthCallback)} />

        <Route element={renderLazyRoute(AppLayout)}>
          <Route path="/users/:id" element={renderLazyRoute(Profile)} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={renderLazyRoute(AppLayout)}>
            <Route path="/home" element={renderLazyRoute(Homepage)} />
            <Route path="/live" element={renderLazyRoute(LivePage)} />
            <Route path="/live/:id" element={renderLazyRoute(LiveRoom)} />
            <Route path="/leaderboard" element={renderLazyRoute(Leaderboard)} />
            <Route path="/messages" element={renderLazyRoute(Messages)} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={renderLazyRoute(AdminUsers)} />
            </Route>
            <Route path="/profile" element={renderLazyRoute(Profile)} />
            <Route path="/profile/subscribers" element={renderLazyRoute(ProfileSubscribers)} />
            <Route path="/analytics/live" element={renderLazyRoute(CreatorLiveDashboard)} />
            <Route path="/search" element={renderLazyRoute(SearchResults)} />
            <Route path="/settings" element={renderLazyRoute(Settings)} />
            <Route path="/workspace" element={renderLazyRoute(Workspace)} />
            <Route path="/video/:id/analytics" element={renderLazyRoute(PostLiveAnalytics)} />
          </Route>
          <Route path="/create" element={renderLazyRoute(CreateUpload)} />
          <Route path="/create-live" element={renderLazyRoute(CreateLive)} />
          <Route path="/preview-live" element={renderLazyRoute(PreviewLive)} />
        </Route>

        <Route path="/video/:id" element={renderLazyRoute(VideoDetails)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}