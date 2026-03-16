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
                        bg-white100/20 dark:bg-slate100">

      {/* Badge */}
      
  <span className="text-xs font-medium font-inter text-slate100 dark:text-white 
                   bg-slate100/5 dark:bg-[#2d2d2d] 
                   rounded-full px-4 py-2.5 relative flex justify-center items-center after:content-[''] after:w-[106%] after:h-[110%] after:bg-linear-to-r after:-z-10 after:from-[#FDB30059] after:to-[#00000080] after:absolute after:rounded-full">
    Coming soon — Request early access
  </span>
      

      {/* Headline */}
      <p
        className="font-medium italic text-slate100 dark:text-white
                   leading-tight font-inter mb-1"
        style={{ fontSize: "clamp(24px, 5vw, 44px)" }}
      >
        Create. Post. Grow.
      </p>
      <p
        className="font-extrabold text-slate100 dark:text-white
                   leading-none font-inter mb-5"
        style={{ fontSize: "clamp(48px, 10vw, 80px)" }}
      >
        DeyMake.
      </p>

      {/* Subtext */}
      <p
        className="text-slate100 font-inter dark:text-white max-w-xl
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
          className="bg-orange100 font-inter hover:bg-[#e09510] text-slate100
                     font-semibold text-[15px] px-9 py-3.5 rounded-xl
                     border-none cursor-pointer transition-colors
                     min-w-45"
        >
          Join the waitlist
        </button>
        <button
          onClick={scrollToAbout}
          className="bg-white dark:bg-transparent
                     text-slate100 font-inter dark:text-white
                     font-semibold text-[15px] px-9 py-3.5 rounded-xl
                     cursor-pointer transition-colors min-w-45
                     border-2 border-slate100 dark:border-white
                     hover:bg-orange100 hover:text-[#f5a623]
                     dark:hover:bg-orange100 dark:hover:text-[#f5a623]"
        >
          Learn more
        </button>
      </div>

      {/* Desktop floating cards */}
      
      <div><img src="./Hero image dm.png" alt="" /></div>
    </section>
  );
}