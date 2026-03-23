import { useMemo, useState } from "react";

const profileTabs = ["Posts", "Liked", "Saved", "Drafts"];

const postsByTab = {
  Posts: Array.from({ length: 9 }, (_, index) => ({ id: `post-${index + 1}`, views: "164.3M" })),
  Liked: Array.from({ length: 6 }, (_, index) => ({ id: `liked-${index + 1}`, views: "82.7M" })),
  Saved: Array.from({ length: 4 }, (_, index) => ({ id: `saved-${index + 1}`, views: "98.1M" })),
  Drafts: Array.from({ length: 3 }, (_, index) => ({ id: `draft-${index + 1}`, views: "12.4M" })),
};

const profile = {
  name: "Jason Eton",
  subscribers: "22.1k Subscribers",
  bio: "The journey is the film.",
  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&q=80",
};

function ViewsBadge({ views }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/15 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 6v12l10-6-10-6Z" />
      </svg>
      <span>{views}</span>
    </div>
  );
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState("Posts");
  const visiblePosts = useMemo(() => postsByTab[activeTab] ?? postsByTab.Posts, [activeTab]);

  return (
    <div className="min-h-full bg-white dark:bg-slate100">
      <section className="relative h-44 overflow-hidden bg-[#0D62B0] md:h-56">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 20%, rgba(255,255,255,.2) 0, rgba(255,255,255,0) 22%), radial-gradient(circle at 82% 18%, rgba(255,255,255,.16) 0, rgba(255,255,255,0) 18%), radial-gradient(circle at 70% 72%, rgba(255,255,255,.16) 0, rgba(255,255,255,0) 20%), linear-gradient(135deg, rgba(1,57,117,.35), rgba(1,57,117,0))",
          }}
        />
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-10 md:px-8 md:pb-12">
        <div className="-mt-9 md:-mt-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-24 w-24 rounded-full border-[6px] border-white object-cover shadow-lg dark:border-slate100 md:h-28 md:w-28"
            />

            <div className="space-y-1">
              <h1 className="text-3xl font-medium font-inter text-slate100 dark:text-white md:text-4xl">
                {profile.name}
              </h1>
              <p className="text-xl font-inter text-slate50 dark:text-slate200">{profile.subscribers}</p>
            </div>
          </div>

          <p className="mt-6 text-2xl font-medium font-inter text-slate100 dark:text-white md:text-[2rem]">
            {profile.bio}
          </p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:gap-6">
            <button
              type="button"
              className="min-w-54 rounded-full bg-white300 px-8 py-4 text-xl font-medium font-inter text-slate100 transition-colors hover:bg-slate150 dark:bg-black100 dark:text-white"
            >
              Edit profile
            </button>
            <button
              type="button"
              className="min-w-54 rounded-full bg-white300 px-8 py-4 text-xl font-medium font-inter text-slate100 transition-colors hover:bg-slate150 dark:bg-black100 dark:text-white"
            >
              Share profile
            </button>
          </div>

          <div className="mt-8 rounded-full bg-white300 p-2 dark:bg-black100 md:mt-10">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {profileTabs.map((tab) => {
                const isActive = tab === activeTab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-5 py-4 text-lg font-medium font-inter transition-colors md:text-2xl ${
                      isActive
                        ? "bg-orange100 text-black"
                        : "text-slate100 hover:bg-white dark:text-white dark:hover:bg-[#454545]"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:mt-8 md:gap-6">
            {visiblePosts.map((post) => (
              <article
                key={post.id}
                className="relative aspect-[0.83] overflow-hidden rounded-[1.6rem] bg-slate200/95 dark:bg-[#d9d9d9]"
              >
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/12" />
                <div className="absolute bottom-4 right-4">
                  <ViewsBadge views={post.views} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}