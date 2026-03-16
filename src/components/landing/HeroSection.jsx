const avatarM =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80";
const avatarF =
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80";

function scrollToAbout() {
  var el = document.getElementById("about");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function HeroSection({ onSignUp }) {
  return (
    <section className="flex flex-col items-center text-center
                        px-6 py-12 md:py-20
                        bg-[#f0f0eb] dark:bg-[#1a1a1a]">

      {/* Badge */}
      <span className="text-xs font-medium text-gray-400 dark:text-gray-500
                       border border-gray-300 dark:border-gray-600
                       rounded-full px-[18px] py-[6px] mb-6
                       bg-white dark:bg-[#2d2d2d]">
        Coming soon — Request early access
      </span>

      {/* Headline */}
      <p
        className="font-bold italic text-gray-900 dark:text-white
                   leading-tight mb-1"
        style={{ fontSize: "clamp(24px, 5vw, 44px)" }}
      >
        Create. Post. Grow.
      </p>
      <p
        className="font-extrabold text-gray-900 dark:text-white
                   leading-none mb-5"
        style={{ fontSize: "clamp(48px, 10vw, 80px)" }}
      >
        DeyMake.
      </p>

      {/* Subtext */}
      <p
        className="text-gray-500 dark:text-gray-400 max-w-xl
                   leading-relaxed mb-7"
        style={{ fontSize: "clamp(14px, 2vw, 16px)" }}
      >
        DeyMake is a creator-first content platform where short videos,
        long-form content, and communities live in one place. Built for
        people who DeyMake.
      </p>

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <button
          onClick={onSignUp}
          className="bg-[#f5a623] hover:bg-[#e09510] text-white
                     font-bold text-[15px] px-9 py-3.5 rounded-xl
                     border-none cursor-pointer transition-colors
                     min-w-[180px]"
        >
          Join the waitlist
        </button>
        <button
          onClick={scrollToAbout}
          className="bg-white dark:bg-transparent
                     text-gray-900 dark:text-white
                     font-bold text-[15px] px-9 py-3.5 rounded-xl
                     cursor-pointer transition-colors min-w-[180px]
                     border border-gray-900 dark:border-white
                     hover:border-[#f5a623] hover:text-[#f5a623]
                     dark:hover:border-[#f5a623] dark:hover:text-[#f5a623]"
        >
          Learn more
        </button>
      </div>

      {/* Desktop floating cards */}
      <div
        className="hidden md:block relative w-full"
        style={{ maxWidth: "720px", height: "240px" }}
      >
        {/* LEFT card */}
        <div
          className="absolute left-0 top-[30px]
                     bg-white dark:bg-[#2d2d2d] rounded-2xl
                     border border-gray-100 dark:border-gray-700 text-left"
          style={{ width: "220px", padding: "16px 18px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center gap-2.5 mb-2.5">
            <img
              src={avatarM}
              alt="Jason"
              className="w-11 h-11 rounded-full object-cover flex-shrink-0"
              style={{ border: "2px solid #f0f0f0" }}
            />
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Jason Eton
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                The journey is ...
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            About Jason Eton
          </p>
        </div>

        {/* CENTER */}
        <div
          className="absolute top-0 w-[240px] h-[240px]"
          style={{ left: "50%", transform: "translateX(-50%)" }}
        >
          <span
            className="absolute text-xs text-gray-300 dark:text-gray-600 font-medium"
            style={{ top: "10px", left: "28px" }}
          >
            Save
          </span>

          <div
            className="absolute flex items-center gap-2"
            style={{ top: "34px", left: "20px" }}
          >
            <img
              src={avatarM}
              alt="user"
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              style={{ border: "2px solid white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            />
            <div
              className="bg-white dark:bg-[#2d2d2d] rounded-xl px-3 py-1.5
                         border border-gray-100 dark:border-gray-700"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}
            >
              <p className="text-[9px] text-gray-300 dark:text-gray-500 mb-0.5">
                ✦ Suggested
              </p>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Jason Eton
              </p>
            </div>
          </div>

          <span
            className="absolute text-xs text-gray-300 dark:text-gray-600 font-medium"
            style={{ top: "0px", right: "0px" }}
          >
            Share
          </span>

          <img
            src={avatarM}
            alt="user"
            className="absolute w-11 h-11 rounded-full object-cover"
            style={{ border: "2px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              top: "20px", right: "0px" }}
          />

          <div
            className="absolute flex items-center gap-2"
            style={{ bottom: "30px", left: "10px" }}
          >
            <img
              src={avatarF}
              alt="user"
              className="w-11 h-11 rounded-full object-cover flex-shrink-0"
              style={{ border: "2px solid white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            />
            <div
              className="bg-white dark:bg-[#2d2d2d] rounded-xl px-3 py-1.5
                         border border-gray-100 dark:border-gray-700"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}
            >
              <p className="text-[9px] text-gray-300 dark:text-gray-500 mb-0.5">
                ✦ Suggested
              </p>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Jason Eton
              </p>
            </div>
          </div>

          <span
            className="absolute text-xs text-gray-300 dark:text-gray-600 font-medium"
            style={{ bottom: "8px", left: "16px" }}
          >
            Like
          </span>
        </div>

        {/* RIGHT card */}
        <div
          className="absolute right-0 top-[30px]
                     bg-white dark:bg-[#2d2d2d] rounded-2xl
                     border border-gray-100 dark:border-gray-700 text-left"
          style={{ width: "210px", padding: "16px 20px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Jason Eton
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            The journey is ...
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            About Jason Eton
          </p>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 w-full md:hidden max-w-[360px]">
        <div
          className="bg-white dark:bg-[#2d2d2d] rounded-2xl
                     border border-gray-100 dark:border-gray-700 text-left"
          style={{ padding: "14px 16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <img
              src={avatarM}
              alt="Jason"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div>
              <p className="text-[13px] font-bold text-gray-900 dark:text-white">
                Jason Eton
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                The journey is ...
              </p>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            About Jason Eton
          </p>
        </div>

        <div className="flex gap-2.5">
          {[avatarM, avatarF].map((av, i) => (
            <div
              key={i}
              className="flex-1 bg-white dark:bg-[#2d2d2d] rounded-xl
                         border border-gray-100 dark:border-gray-700
                         flex items-center gap-2"
              style={{ padding: "10px 12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <img
                src={av}
                alt="user"
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <p className="text-[9px] text-gray-400 dark:text-gray-500">
                  ✦ Suggested
                </p>
                <p className="text-[11px] font-bold text-gray-900 dark:text-white">
                  Jason Eton
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="bg-white dark:bg-[#2d2d2d] rounded-2xl
                     border border-gray-100 dark:border-gray-700 text-left"
          style={{ padding: "14px 16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
            Jason Eton
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">
            The journey is ...
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            About Jason Eton
          </p>
        </div>
      </div>
    </section>
  );
}