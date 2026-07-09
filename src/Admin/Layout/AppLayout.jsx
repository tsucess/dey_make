import { Outlet } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import TopBar from "../Layout/Topbar";
import { useState } from "react";

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex w-full">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className="flex flex-col flex-1 w-full max-h-screen min-h-0">
        <TopBar setIsSidebarOpen={setIsSidebarOpen} />
        <main className="overflow-y-auto flex-1 bg-black p-5 w-full">
            <Outlet/>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
