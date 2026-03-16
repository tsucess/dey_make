import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import AppLayout from "./components/Layout/AppLayout";
import Homepage from "./pages/Homepage";
import Leaderboard from "./pages/Leaderboard";
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
        </Route>
        <Route path="/video/:id" element={<VideoDetails />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}