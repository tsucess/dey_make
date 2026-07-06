import { Outlet } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import TopBar from "../Layout/Topbar";

function AppLayout() {
  return <div className="flex ">
    <Sidebar/>
    <div className="flex flex-col flex-1">
        <TopBar/>
        <main className="overflow-y-auto flex-1">
            <Outlet/>
        </main>

    </div>

  </div>;
}

export default AppLayout;
