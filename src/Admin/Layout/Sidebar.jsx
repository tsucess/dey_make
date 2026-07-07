import { button } from "motion/react-client";
import { FiSettings } from "react-icons/fi";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { MdArrowForwardIos, MdOutlineArrowForwardIos } from "react-icons/md";
import { RiBookShelfLine, RiHeadphoneLine } from "react-icons/ri";

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
      { link: "/users", title: "Users", icon: HiOutlineSquares2X2 },
      { link: "/creator", title: "Creator Management", icon: RiBookShelfLine },
    ],
  },
  {
    title: "Content Management",
    isLink: false,
    links: [
      { link: "/users", title: "Users", icon: HiOutlineSquares2X2 },
      { link: "/creator", title: "Creator Management", icon: RiBookShelfLine },
    ],
  },
  {
    title: "Growth & Engagement",
    isLink: false,
    links: [
      { link: "/users", title: "Users", icon: HiOutlineSquares2X2 },
      { link: "/creator", title: "Creator Management", icon: RiBookShelfLine },
    ],
  },
  {
    title: "Monetization",
    isLink: false,
    links: [
      { link: "/users", title: "Users", icon: HiOutlineSquares2X2 },
      { link: "/creator", title: "Creator Management", icon: RiBookShelfLine },
    ],
  },
];

const bottomNavLinks = [
  { title: "Settings", icon: FiSettings, link: "/setting" },
  { title: "Support", icon: RiHeadphoneLine, link: "/support" },
];

function Sidebar() {
  return (
    <aside className="flex flex-col gap-6 w-full max-w-69 shrink-0 border-r border-r-zinc50 bg-black h-screen overflow-y-auto p-4">
      <div className="flex items-center justify-center p-4 border-b border-white">
        <img src="/DEYMAKE LOGO with Tagline Yellow.svg" alt="" />
      </div>
      <div className="flex flex-col gap-20 overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <nav className="flex flex-col gap-4">
          {navLinks.map((nav, i) =>
            nav.isLink ? (
              <button
                key={nav.title-i}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-md"
              >
                <span className="flex items-center gap-2 text-white text-sm">
                  <nav.icon className="w-6 h-6 " /> {nav.title}
                </span>{" "}
                <MdOutlineArrowForwardIos className="w-3 h-3 text-white" />
              </button>
            ) : (
              <div key={nav.title} className="flex flex-col gap-3">
                <h3 className="text-base uppercase text-white">{nav.title}</h3>
                <div className="flex flex-col gap-2">
                  {nav.links.map((linkItem) => (
                    <button
                      key={linkItem.title}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-md"
                    >
                      <span className="flex items-center gap-2 text-white text-sm">
                        <linkItem.icon className="w-6 h-6" /> {linkItem.title}
                      </span>{" "}
                      <MdOutlineArrowForwardIos className="w-3 h-3 text-white" />
                    </button>
                  ))}
                </div>
              </div>
            ),
          )}
        </nav>

        <div className="flex flex-col gap-4">
          {bottomNavLinks.map((bottomNav) => (
            <button className="flex items-center gap-3 py-2 px-3 text-sm rounded-md text-white">
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
            <h4 className="text-white text-sm font-medium">Sophia Williams</h4>
            <p className="text-white text-xs">sophia@gmail.com</p>
          </div>
          <MdArrowForwardIos className="w-3 h-3 text-white" />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
