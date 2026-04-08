export default function AuthLayout({ children }) {
  return (
    <div className="flex h-full w-screen 
                    bg-white dark:bg-slate100">

      {/* Left: VR image — desktop only */}
      <div
        className="hidden md:block w-2/5 shrink-0 h-auto"
      ><img src="/auth-img.png" alt="" className="w-full h-full"/></div>

      {/* Right: form */}
      <div className="flex-1 flex items-start justify-center
                       pt-6 pb-8 md:py-12
                      bg-white dark:bg-slate100">
        <div className="w-full max-w-132.5 px-6 md:px-12">
          {children}
        </div>
      </div>

    </div>
  );
}