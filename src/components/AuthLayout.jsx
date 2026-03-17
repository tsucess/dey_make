export default function AuthLayout({ children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden
                    bg-white dark:bg-[#121212]">

      {/* Left: VR image — desktop only */}
      <div
        className="hidden md:block w-[43%] shrink-0
                   bg-cover bg-top"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=80')`
        }}
      />

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center
                      overflow-y-auto py-8 md:py-12
                      bg-white dark:bg-[#121212]">
        <div className="w-full max-w-132.5 px-6 md:px-12">
          {children}
        </div>
      </div>

    </div>
  );
}