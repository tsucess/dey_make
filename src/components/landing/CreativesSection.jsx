import { useTheme } from "../../context/ThemeContext";

export default function CreativesSection() {
  const { isDark } = useTheme();
  return (
    <section
      id="about"
      className="px-6 md:px-12 py-8 md:py-14 bg-white100 dark:bg-slate100"
    >
      <div className="max-w-5xl mx-auto">

        <h2
          className="font-semibold font-bricolage text-slate100 dark:text-white mb-3"
          style={{ fontSize: "clamp(36px, 4vw, 38px)" }}
        >
          A new home{" "}
          <span className="text-orange100 italic font-inter">for creatives</span>
        </h2>

        <p className="text-[15px] text-slate100 dark:text-white
                      max-w-md leading-relaxed mb-12">
          Creators are tired of fighting algorithms and juggling platforms. Dey
          Make brings content, audience, and growth together.
        </p>

        {/* Desktop 3 column */}
        <div
          className="hidden md:grid gap-10 items-center"
          style={{ gridTemplateColumns: "1fr auto 1fr" }}
        >
          {/* Left */}
          <div>
            <h3
              className="font-medium text-slate100 font-inter dark:text-white
                         mb-3 leading-snug"
              style={{ fontSize: "clamp(18px, 2.5vw, 22px)" }}
            >
              Creator tools from day one
            </h3>
            <p className="text-sm text-slate100 font-inter dark:text-white
                          leading-relaxed">
              DeyMake puts creator tools in your hands from the start, so
              you can focus on creating and growing at your own pace.
            </p>
          </div>

          {/* Phone mockup desktop */}
          <img src={isDark ? './phone-dark.png' : './phone-light.png'} className="w-101 h-220"/>

          {/* Right */}
          <div className="flex flex-col gap-60">
            <div>
              <h3
                className="font-medium text-slate100 font-inter dark:text-white mb-2"
                style={{ fontSize: "clamp(18px, 2.5vw, 22px)" }}
              >
                Create without limits.
              </h3>
              <p className="text-sm text-slate100 font-inter dark:text-white
                            leading-relaxed">
                Post quick clips or full-length videos and let them live
                side by side in one feed. If it's your content, it belongs
                here.
              </p>
            </div>
            <div>
              <h3
                className="font-mediumn text-slate100 font-inter dark:text-white mb-2"
                style={{ fontSize: "clamp(18px, 2.5vw, 22px)" }}
              >
                Built for Africa
              </h3>
              <p className="text-sm text-slate100 font-inter dark:text-white
                            leading-relaxed">
                DeyMake is built with African creators in mind, fast,
                accessible and designed for how we really connect, create
                and consume content.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile stacked */}
        <div className="md:hidden">
        <img src={isDark ? './phone-dark.png' : './phone-light.png'} className="w-101 h-150"/>

          <div className="flex flex-col gap-4 ">
            <div className="space-y-2 font-inter"><h3 className="text-xl font-medium text-slate100
                           dark:text-white">
              Create without limits.
            </h3>
            <p className="text-sm text-slate100  dark:text-white
                          leading-relaxed">
              Post quick clips or full-length videos and let them live
              side by side in one feed. If it's your content, it belongs
              here.
            </p></div>
            <div className="space-y-2 font-inter">
              <h3 className="text-xl font-medium text-slate100
                           dark:text-white">
              Built for Africa
            </h3>
            <p className="text-sm text-slate100 dark:text-white
                          leading-relaxed">
              DeyMake is built with African creators in mind, fast,
              accessible and designed for how we really connect, create
              and consume content.
            </p>
            </div>
            <div className="space-y-2 font-inter">
              <h3 className="text-xl font-medium text-slate100
                           dark:text-white">
              Creator tools from day one
            </h3>
            <p className="text-sm text-slate100 dark:text-white
                          leading-relaxed">
              DeyMake puts creator tools in your hands from the start, so you can focus on creating and growing at your own pace.
            </p>
            </div>
            
          </div>
          </div>
        </div>

      
    </section>
  );
}