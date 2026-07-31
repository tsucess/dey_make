/**
 * OtherLive — non-featured live-stream grid.
 *
 * Renders the remaining active live streams as a responsive tile grid
 * under the TopVideo hero on the Live feed.
 *
 * Feature: 3.5 Live streaming (see PROJECT_OVERVIEW.md).
 * Consumes: props from LiveVideos (videos array).
 */


import { LuDot } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import {
  getProfileAvatar,
  getVideoRouteId,
  getVideoThumbnail,
  getVideoTitle,
} from "../../utils/content";

const PLACEHOLDER_COLORS = [
  "bg-cyan100",
  "bg-red100",
  "bg-green300",
  "bg-orange500",
  "bg-brown",
  "bg-pink",
];

function OtherLive({ videos = [], loading = false, isEmpty = false }) {
  const navigate = useNavigate();

  if (loading && videos.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col gap-3.5 animate-pulse">
            <div className="w-full bg-slate150 dark:bg-slate700 h-60" />
            <div className="flex items-center gap-3 px-4">
              <div className="w-10 h-10 rounded-full bg-slate150 dark:bg-slate700" />
              <div className="flex flex-col gap-1 flex-1">
                <div className="h-4 w-32 bg-slate150 dark:bg-slate700 rounded" />
                <div className="h-3 w-20 bg-slate150 dark:bg-slate700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isEmpty || videos.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
     { videos.map((entry, index) => {
        const key = getVideoRouteId(entry) || `video-${index}`;
        const author = entry.author || entry.creator || null;
        const title = getVideoTitle(entry);
        const username = author?.username ? `@${author.username}` : "";
        const avatar = author ? getProfileAvatar(author) : "/story3.jpg";
        const thumb = getVideoThumbnail(entry);
        const placeholder = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
        const routeId = getVideoRouteId(entry);

        function handleOpen() {
          if (routeId) navigate(`/watch-live/${routeId}`);
        }

        return (
        <div key={key} className="flex flex-col gap-3.5 cursor-pointer" onClick={handleOpen} role={routeId ? "button" : undefined}>
        <div
          className={` w-full ${placeholder} h-60`}
          style={thumb ? { backgroundImage: `url(${thumb})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        ></div>
        <div className="flex items-center gap-3 px-4 ">
          <img src={avatar} alt="" className="w-10 h-10 rounded-full border border-black100 dark:border-white object-cover" />
          <div className="flex flex-col gap-1 font-inter">
            <h4 className="text-lg text-black100 dark:text-white">{title}</h4>
            {username ? <span className="text-xs text-black100 dark:text-white/70">{username}</span> : null}
          </div>
        </div>
      </div>);
      })}

    </div>
  );
}

export default  OtherLive;
