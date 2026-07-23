/**
 * LivePreview page — creator go-live setup screen.
 *
 * Lets the creator title their stream, pick a category, and press
 * "Go Live Now". On submit it calls api.createVideo({ isLive: true, ... })
 * then api.startVideoLive(video.id) and navigates to /live/:id.
 *
 * Feature: 3.5 Live streaming (see PROJECT_OVERVIEW.md).
 * Backend: VideoController@store, VideoController@startLive.
 */

import { useEffect, useState } from "react";
import { FaRegUser, FaUserFriends } from "react-icons/fa";
import { FiLock, FiUsers } from "react-icons/fi";
import { GiAlliedStar, GiStarKey } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { LuDot } from "react-icons/lu";
import { PiBasketballLight } from "react-icons/pi";
import { TbCamera, TbHearts } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { api, firstError } from "../services/api";

const FALLBACK_CATEGORY_TABS = [
  "Dance",
  "Music",
  "Gaming",
  "Cooking",
  "Fitness",
  "Talk",
  "Photography",
  "Art",
  "Fashion",
];

const settings = [
  {
    title: "Everyone",
    desc: "Anyone on DeyMake",
    icon: PiBasketballLight,
    isCheckbox: true,
  },
  {
    title: "Followers",
    desc: "Only your followers",
    icon: FiUsers,
    isCheckbox: true,
  },
  {
    title: "Friends",
    desc: "Mutual follows only",
    icon: TbHearts,
    isCheckbox: true,
  },
  {
    title: "Close friends",
    desc: "Create your list",
    icon: GiAlliedStar,
    isCheckbox: true,
  },
  {
    title: "Don’t show to...",
    desc: "Select friends",
    icon: FaUserFriends,
    isCheckbox: true,
  },
  {
    title: "Only show to...",
    desc: "Select friends",
    icon: FaRegUser,
    isCheckbox: true,
  },
  {
    title: "Only me",
    desc: "Only me",
    icon: FiLock,
    isCheckbox: true,
  },
  {
    title: "Allow Gifts",
    desc: "Viewers can send you coins",
    icon: FiLock,
    isCheckbox: false,
  },
];

function LivePreview() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Dance");
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      try {
        const response = await api.getCategories();
        const list = response?.data?.categories || [];
        if (!ignore && list.length) {
          setCategories(list);
          const first = list[0];
          setActiveCategory(first?.name || "Dance");
          setActiveCategoryId(first?.id ?? null);
        }
      } catch {
        // Fall back to hardcoded tabs silently.
      }
    }

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  function handleActiveCategoryChange(value, id = null) {
    setActiveCategory(value);
    setActiveCategoryId(id);
  }

  async function handleGoLive() {
    if (submitting) return;

    if (!title.trim()) {
      setError("Please enter a stream title.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const createResponse = await api.createVideo({
        type: "video",
        title: title.trim(),
        categoryId: activeCategoryId,
        isLive: true,
        isDraft: false,
      });

      const video = createResponse?.data?.video;
      if (!video?.id) throw new Error("Unable to start the live stream.");

      await api.startVideoLive(video.id);
      navigate(`/live/${video.id}`, { replace: true });
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || "Unable to start the live stream."));
    } finally {
      setSubmitting(false);
    }
  }

  const displayedCategoryTabs = categories.length
    ? categories.map((category) => ({ name: category.name, id: category.id }))
    : FALLBACK_CATEGORY_TABS.map((name) => ({ name, id: null }));
  return (
    <section className="flex flex-col gap-8 font-inter dark:bg-black300 pb-20">
      <div className=" relative">
        <img
          src="/preview-img.png"
          alt=""
          className="w-full h-full min-h-50 object-fill"
        />
        <div className="flex justify-between items-center gap-2 absolute left-3 right-3 top-4">
          <button onClick={()=> navigate(-1)} className="bg-slate100 w-7.5 h-7.5 rounded-lg flex items-center justify-center hover:bg-black500/20">
            <IoMdClose className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2 px-4 py-3 rounded-md bg-black700 text-xs md:text-sm text-white ">
            <div className="w-3 h-3 rounded-full bg-orange100"></div>Camera
            Preview
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-slate100 w-7.5 h-7.5 rounded-lg flex items-center justify-center hover:bg-black500/20">
              <TbCamera className="w-5 h-5 text-white" />
            </button>
            <button className="bg-slate100 w-7.5 h-7.5 rounded-lg flex items-center justify-center hover:bg-black500/20">
              <GiStarKey className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:gap-4 px-6">
        <h3 className="text-xl font-semibold text-black dark:text-white">
          Stream Title*
        </h3>
        <input
          type="text"
          name=""
          id=""
          value={title}
          onChange={(event) => setTitle(event.target.value.slice(0, 80))}
          maxLength={80}
          className="px-6 py-3 rounded-full bg-white300 dark:bg-black100 outline-none"
          placeholder="What’s your stream about? (e.g. Late night dance)"
        />
        <span className="text-orange100 text-sm self-end font-semibold">
          {title.length}/80
        </span>
        {error ? (
          <span className="text-red100 text-sm self-start font-medium">{error}</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-4.75 font-inter px-6">
        <h3 className="text-black dark:text-white text-base font-semibold">
          Category
        </h3>
        <div className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {displayedCategoryTabs.map((tab) => (
            <button
              key={tab.id ?? tab.name}
              onClick={() => handleActiveCategoryChange(tab.name, tab.id)}
              className={`transition-all text-sm py-2 md:py-3 px-3 md:px-5 rounded-xl font-semibold flex items-center gap-3 ${
                activeCategory === tab.name
                  ? "bg-orange100 text-black hover:bg-orange200"
                  : "text-black dark:text-white hover:bg-slate150 hover:dark:bg-black500"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* settings */}
      <div className="flex flex-col gap-4.5 font-inter px-6">
        <h3 className="text-black dark:text-white text-base font-semibold">
          Settings
        </h3>
        <div className="flex flex-col gap-4.5">{
            settings.map(({title, desc, isCheckbox, icon:Icon}, i) => <div key={`${title}-${i}`} className="flex justify-between items-center gap-3 border border-black/30 rounded-2xl dark:border-white/30 p-4">
                <div className="flex items-center gap-2">
                    <div className="rounded-md w-8 h-8 border border-black/40 dark:border-white/40 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-black dark:text-white"/></div>
                    <div className="flex flex-col">
                        <h4 className="text-sm text-black dark:text-white font-semibold">{title}</h4>
                        <span className="text-[11px] text-black dark:text-white font-thin">{desc}</span>
                    </div>
                </div>

                <div>{
                    isCheckbox ? <input type="checkbox" name="" id="" /> : <div className="bg-orange100 w-10 h-5 rounded-full flex p-1 items-center ">
                        <span className="w-4 h-4 rounded-full bg-black"></span>
                    </div>
                    }</div>
            </div>)
            }</div>
            <button disabled={submitting} onClick={handleGoLive} className="bg-orange100 py-3 md:px-30 font-medium rounded-md text-sm text-black md:self-center disabled:opacity-60 disabled:cursor-not-allowed">{submitting ? "Going Live..." : "Go Live Now"}</button>
      </div>


    </section>
  );
}

export default LivePreview;
