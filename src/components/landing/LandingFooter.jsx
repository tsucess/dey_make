export default function LandingFooter({ onSignUp }) {
  return (
    <footer
      className="px-6 md:px-12 py-7 border-t border-gray-200
                 dark:border-gray-800
                 bg-[#f5f5f0] dark:bg-[#121212]"
    >
      <div
        className="flex flex-col md:flex-row items-center
                   justify-between gap-4 max-w-5xl mx-auto"
      >
        {/* Logo */}
        <div
          className="text-[22px] font-extrabold text-[#f5a623]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <span style={{ fontStyle: "italic" }}>D</span>eyMake
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          ©2025 DeyMake. All right reserved
        </p>

        {/* Links */}
        <div className="flex items-center gap-5">
          <button
            onClick={onSignUp}
            className="text-sm text-gray-500 dark:text-gray-400
                       hover:text-[#f5a623] transition-colors
                       bg-transparent border-none cursor-pointer"
          >
            Join waitlist
          </button>
          <a
            href="#"
            className="text-sm text-gray-500 dark:text-gray-400
                       hover:text-[#f5a623] transition-colors"
            style={{ textDecoration: "none" }}
          >
            Terms
          </a>
          <a
            href="#"
            className="text-sm text-gray-500 dark:text-gray-400
                       hover:text-[#f5a623] transition-colors"
            style={{ textDecoration: "none" }}
          >
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}