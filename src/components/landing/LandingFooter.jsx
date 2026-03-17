export default function LandingFooter({ onSignUp }) {
  return (
    <footer
      className="px-6 md:px-12 pb-7 pt-12
                 bg-white100 dark:bg-slate100 flex flex-col md:flex-row items-center
                   justify-between gap-4 max-w-5xl md:mx-auto"
    >
    
        <div className="flex justify-between items-center">
        {/* Logo */}
        <img src='./logo-footer.png' className="w-25 h-7 md:w-30"/>

        {/* Copyright */}
        <p className="text-xs md:text-sm text-black font-inter font-medium dark:text-white">
          ©2025 DeyMake. All right reserved
        </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-5">
          <button
            onClick={onSignUp}
            className="text-xs md:text-sm text-black font-inter font-medium dark:text-white
                       hover:text-[#f5a623] transition-colors
                       bg-transparent border-none cursor-pointer"
          >
            Join waitlist
          </button>
          <a
            href="#"
            className="text-xs md:text-sm text-black font-inter font-medium dark:text-white
                       hover:text-[#f5a623] transition-colors"
            style={{ textDecoration: "none" }}
          >
            Terms
          </a>
          <a
            href="#"
            className="text-xs md:text-sm text-black font-inter font-medium dark:text-white
                       hover:text-[#f5a623] transition-colors"
            style={{ textDecoration: "none" }}
          >
            Privacy
          </a>
        </div>
    </footer>
  );
}