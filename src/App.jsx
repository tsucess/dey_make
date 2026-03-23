import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import AppLayout from "./components/Layout/AppLayout";
import Homepage from "./pages/Homepage";
import Leaderboard from "./pages/Leaderboard";
import CreateUpload from "./pages/CreateUpload";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import VideoDetails from "./pages/VideoDetails";

export default function App() {
  const [auth, setAuth] = useState(false);
  const [page, setPage] = useState("landing");

  if (!auth) {
    if (page === "landing") {
      return (
        <LandingPage
          onLogin={() => setPage("login")}
          onSignUp={() => setPage("signup")}
        />
      );
    }
    if (page === "signup") {
      return (
        <SignUp
          onNavigateToLogin={() => setPage("login")}
          onSuccess={() => setAuth(true)}
        />
      );
    }
    return (
      <Login
        onNavigateToSignUp={() => setPage("signup")}
        onSuccess={() => setAuth(true)}
      />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/create" element={<CreateUpload />} />
        <Route path="/video/:id" element={<VideoDetails />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}