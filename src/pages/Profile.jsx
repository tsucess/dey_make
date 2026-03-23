import { useMemo, useState } from "react";
import { IoMdArrowDropright } from "react-icons/io";

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
    <div className="inline-flex items-center gap-1 rounded-full border-y-2 border-white bg-black/50 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-xs backdrop-brightness-100">
      <IoMdArrowDropright className="w-6 h-6 text-white"/>
      <span className="text-white font-inter text-sm">{views}</span>
    </div>
  );
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState("Posts");
  const visiblePosts = useMemo(() => postsByTab[activeTab] ?? postsByTab.Posts, [activeTab]);

  return (
    <div className="min-h-full bg-white dark:bg-slate100">
      <section className="h-60 w-full  md:h-60">
        <img src="./header_profile.png" alt="" className="w-full h-full object-fit" />
        
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-10 md:px-8 md:pb-12">
        <div className="-mt-7 md:-mt-9">
          <div className="flex flex-col gap-8 md:pl-30">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-24 w-24 rounded-full border-[6px] border-white object-cover shadow-lg object-center dark:border-slate100 md:h-28 md:w-28"
            />

            <div className="space-y-1">
              <h1 className="text-lg font-medium font-inter text-black dark:text-white md:text-xl">
                {profile.name}
              </h1>
              <p className="text-base font-inter text-slate700 dark:text-slate200">{profile.subscribers}</p>
            </div>
          </div>

          <p className="text-2xl font-medium font-inter text-black dark:text-white md:text-xl">
            {profile.bio}
          </p>

          <div className="flex flex-col gap-3 md:flex-row md:gap-6">
            <button
              type="button"
              className="min-w-54 rounded-full bg-white300 px-8 py-4 text-lg font-medium font-inter text-black transition-colors hover:bg-slate150 dark:bg-black100 dark:text-white"
            >
              Edit profile
            </button>
            <button
              type="button"
              className="min-w-54 rounded-full bg-white300 px-8 py-4 text-lg font-medium font-inter text-black transition-colors hover:bg-slate150 dark:bg-black100 dark:text-white"
            >
              Share profile
            </button>
          </div>
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
                    className={`rounded-full px-5 py-3 text-base font-semibold font-inter transition-colors md:text-lg ${
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
                className="relative h-75 overflow-hidden rounded-2xl bg-slate200/95 dark:bg-slate200"
              >
                {/* <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/12" /> */}
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