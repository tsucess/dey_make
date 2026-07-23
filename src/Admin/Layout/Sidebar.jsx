import { button } from "motion/react-client";
import { FaRegComments } from "react-icons/fa";
import { FiSettings, FiVideo } from "react-icons/fi";
import { GiEcology } from "react-icons/gi";
import { HiOutlineSquares2X2, HiOutlineUserGroup } from "react-icons/hi2";
import { MdArrowForwardIos, MdOndemandVideo, MdOutlineArrowForwardIos, MdOutlineLiveTv, MdVerifiedUser } from "react-icons/md";
import {
  RiBookShelfLine,
  RiHeadphoneLine,
  RiMessage2Line,
} from "react-icons/ri";
import { TbCancel, TbTargetArrow } from "react-icons/tb";
import { useLocation, useNavigate } from "react-router-dom";

const navLinks = [
  {
    link: "/dashboard",
    title: "Dashboard",
    icon: RiBookShelfLine,
    isLink: true,
  },
  {
    title: "User Management",
    isLink: false,
    links: [
      { link: "/users", title: "Users", icon: HiOutlineUserGroup },
      {
        link: "/comments",
        title: "Comment Management",
        icon: FaRegComments,
      },
      {
        link: "/verification-request",
        title: "Verification",
        icon: MdVerifiedUser,
      },
      {
        link: "/suspended-account",
        title: "Suspended Account",
        icon: TbCancel,
      },
      { link: "/admin-video", title: "Video", icon: FiVideo },
      {
        link: "/admin-livestream",
        title: "Livestream",
        icon: MdOutlineLiveTv,
      },
      {
        link: "/admin-challenges",
        title: "Challenges",
        icon: TbTargetArrow,
      },
      {
        link: "/admin-creator-ecosystem",
        title: "Creator Ecosystem",
        icon: GiEcology,
      },
    ],
  },
  // {
  //   title: "Content & Moderation",
  //   isLink: false,
  //   links: [
  //     {
  //       link: "/admin-user",
  //       title: "Moderation Center",
  //       icon: RiMessage2Line,
  //       badge: 5,
  //     },
  //     { link: "/reports", title: "Reports", icon: HiOutlineSquares2X2 },
  //     {
  //       link: "/content-check",
  //       title: "Content Check",
  //       icon: HiOutlineSquares2X2,
  //     },
  //     {
  //       link: "/comments",
  //       title: "Comment Management",
  //       icon: HiOutlineSquares2X2,
  //     },
  //     { link: "/live-center", title: "Live Center", icon: HiOutlineSquares2X2 },
  //   ],
  // },
  // {
  //   title: "Growth & Engagement",
  //   isLink: false,
  //   links: [
  //     { link: "/trends", title: "Trends", icon: HiOutlineSquares2X2 },
  //     { link: "/hashtags", title: "Hashtags", icon: HiOutlineSquares2X2 },
  //     { link: "/sounds", title: "Sounds", icon: HiOutlineSquares2X2 },
  //   ],
  // },
  // {
  //   title: "Monetization",
  //   isLink: false,
  //   links: [
  //     {
  //       link: "/challenge-manager",
  //       title: "Challenge Manger",
  //       icon: HiOutlineSquares2X2,
  //     },
  //     { link: "/ads-manager", title: "Ads Manager", icon: HiOutlineSquares2X2 },
  //     {
  //       link: "/revenue",
  //       title: "Revenue Dashboard",
  //       icon: HiOutlineSquares2X2,
  //     },
  //     {
  //       link: "/transactions",
  //       title: "Transactions",
  //       icon: HiOutlineSquares2X2,
  //     },
  //     {
  //       link: "/creator-rewards",
  //       title: "Creator Rewards",
  //       icon: HiOutlineSquares2X2,
  //     },
  //   ],
  // },
  // {
  //   title: "Analytics",
  //   isLink: false,
  //   links: [
  //     {
  //       link: "/platform-analytics",
  //       title: "Platform Analytics",
  //       icon: HiOutlineSquares2X2,
  //     },
  //     {
  //       link: "/content-analytics",
  //       title: "Content Analytics",
  //       icon: HiOutlineSquares2X2,
  //     },
  //     {
  //       link: "/user-analytics",
  //       title: "User Analytics",
  //       icon: HiOutlineSquares2X2,
  //     },
  //     {
  //       link: "/live-analytics",
  //       title: "Live Analytics",
  //       icon: HiOutlineSquares2X2,
  //     },
  //   ],
  // },
  // {
  //   title: "System",
  //   isLink: false,
  //   links: [
  //     {
  //       link: "/system-health",
  //       title: "System Health",
  //       icon: HiOutlineSquares2X2,
  //     },
  //     {
  //       link: "/security-center",
  //       title: "Security Center",
  //       icon: HiOutlineSquares2X2,
  //     },
  //     { link: "/audit-logs", title: "Audit Logs", icon: HiOutlineSquares2X2 },
  //   ],
  // },
];

const bottomNavLinks = [
  { title: "Settings", icon: FiSettings, link: "/setting" },
  { title: "Support", icon: RiHeadphoneLine, link: "/support" },
];

function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
      if (setIsSidebarOpen) setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col gap-6 w-64 shrink-0 border-r border-r-zinc-50 bg-black h-screen overflow-y-auto p-4 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex items-center justify-center p-4 border-b border-white h-22 shrink-0">
          <img
            src="/DEYMAKE LOGO with Tagline Yellow.svg"
            alt=""
            className="max-h-full"
          />
        </div>
        <div
          className="flex flex-col gap-20 overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <nav className="flex flex-col gap-4">
            {navLinks.map((nav, i) => {
              const isActive =
                nav.isLink &&
                (pathname === nav.link ||
                  (nav.link !== "/" && pathname.startsWith(nav.link)));
              return nav.isLink ? (
                <button
                  key={nav.title - i}
                  onClick={() => handleNavigation(nav.link)}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-md"
                >
                  {isActive && (
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-1 bg-orange100 rounded-r-md"></div>
                  )}
                  <span
                    className={`flex items-center gap-3 text-sm font-medium ${isActive ? "text-orange100" : "text-white"}`}
                  >
                    <nav.icon className="w-5 h-5" /> {nav.title}
                  </span>
                  <MdOutlineArrowForwardIos className="w-3 h-3 text-white" />
                </button>
              ) : (
                <div key={nav.title} className="flex flex-col gap-3">
                  <h3 className="text-base uppercase text-white">
                    {nav.title}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {nav.links.map((linkItem) => {
                      const isChildActive =
                        pathname === linkItem.link ||
                        (linkItem.link !== "/" &&
                          pathname.startsWith(linkItem.link));
                      return (
                        <button
                          key={linkItem.title}
                          onClick={() => handleNavigation(linkItem.link)}
                          className={`flex items-center justify-between gap-2 px-3 py-3 rounded-md relative transition-colors ${
                            isChildActive
                              ? "bg-[#252525]"
                              : "hover:bg-[#1A1A1A]"
                          }`}
                        >
                          {isChildActive && (
                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-1 bg-orange100 rounded-r-md"></div>
                          )}
                          <span
                            className={`flex items-center gap-3 text-sm font-medium ${isChildActive ? "text-orange100" : "text-white"}`}
                          >
                            <linkItem.icon className="w-5 h-5 shrink-0" />
                            <span>{linkItem.title}</span>
                            {linkItem.badge && (
                              <span className="flex items-center justify-center bg-[#E62E2D] text-white text-[10px] font-bold w-5 h-5 rounded-full shrink-0">
                                {linkItem.badge}
                              </span>
                            )}
                          </span>
                          <MdOutlineArrowForwardIos className="w-3 h-3 text-white" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="flex flex-col gap-4">
            {bottomNavLinks.map((bottomNav, idx) => (
              <button
                key={idx}
                onClick={() => handleNavigation(bottomNav.link)}
                className="flex items-center gap-3 py-2 px-3 text-sm rounded-md text-white hover:bg-[#1A1A1A] transition-colors"
              >
                <bottomNav.icon className="w-4 h-4" />
                {bottomNav.title}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-white mt-auto py-3 flex items-center gap-3">
          <img
            src="/story3.jpg"
            alt=""
            className="w-10 h-10 object-cover rounded-full shrink-0"
          />
          <div className="flex items-center justify-between flex-1">
            <div className="flex flex-col gap-1 font-inter">
              <h4 className="text-white text-sm font-medium">
                Sophia Williams
              </h4>
              <p className="text-white text-xs">sophia@gmail.com</p>
            </div>
            <MdArrowForwardIos className="w-3 h-3 text-white" />
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
