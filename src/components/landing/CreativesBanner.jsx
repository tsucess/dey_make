
export default function CreativesBanner({ onSignUp }) {
  return (
    <section
      className="px-6 md:px-12 py-10
                 bg-white100 dark:bg-[#121212]"
    >
      <div className="max-w-5xl mx-auto">
        <div
          className="flex flex-col md:flex-row items-center
                     justify-between gap-10 rounded-3xl
                     px-8 md:px-14 py-12 bg-linear-to-b from-orange200 to-orange100 relative min-h-140 overflow-hidden"
          
        >
          {/* Left */}
          <div className="flex-1">
            <h2
              className="font-semibold font-bricolage text-slate100 leading-tight mb-4"
              style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
            >
              For creatives,
              <br />
              By creatives.
            </h2>
            <p
              className="text-base font-inter text-slate100 leading-relaxed mb-7 max-w-sm"
              
            >
              Built by people who have been there and are building
              something with care.
            </p>
            <button
              onClick={onSignUp}
              className="font-semibold text-base px-16 py-3.5 rounded-xl
                         cursor-pointer border-none transition-colors
                         bg-white hover:bg-gray-50 text-slate100"
            >
              Join the waitlist
            </button>
          </div>

          {/* Phone — always light since it's on yellow bg */}
          <img src="./creative.png" alt="" className="w-110 h-150 object-fill absolute -right-10 -bottom-20" />
        </div>
      </div>
    </section>
  );
}