import { Outlet } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import TopBar from "../Layout/Topbar";
import { useState } from "react";

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex overflow-hidden relative">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className="flex flex-col flex-1 max-h-screen">
        <TopBar setIsSidebarOpen={setIsSidebarOpen} />
        <main className="overflow-y-auto flex-1 bg-black p-5">
            <Outlet/>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
