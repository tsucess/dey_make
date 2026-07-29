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

function OtherLive({ videos = [] }) {
  const navigate = useNavigate();
  const items = videos.length ? videos : [1, 2, 3, 4, 5, 6];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
     { items.map((entry, index) => {
        const isVideo = typeof entry === "object" && entry !== null;
        const key = isVideo ? (getVideoRouteId(entry) || `video-${index}`) : entry;
        const author = isVideo ? (entry.author || entry.creator || null) : null;
        const title = isVideo ? getVideoTitle(entry) : "Dancing like an angel";
        const username = author?.username ? `@${author.username}` : "@zara.vibes";
        const avatar = author ? getProfileAvatar(author) : "/story3.jpg";
        const thumb = isVideo ? getVideoThumbnail(entry) : null;
        const placeholder = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
        const routeId = isVideo ? getVideoRouteId(entry) : "";

        function handleOpen() {
          if (routeId) navigate(`/watch-live/${routeId}`);
        }

        return (
        <div key={key} className="flex flex-col gap-3.5" onClick={handleOpen} role={routeId ? "button" : undefined}>
        <div
          className={` w-full ${placeholder} h-60`}
          style={thumb ? { backgroundImage: `url(${thumb})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        ></div>
        <div className="flex items-center gap-3 px-4 ">
          <img src={avatar} alt="" className="w-10 h-10 rounded-full border border-black100 dark:border-white object-cover" />
          <div className="flex flex-col gap-1 font-inter">
            <h4 className="text-lg text-black100">{title}</h4>
            <span className="text-xs text-black100">{username}</span>
          </div>
        </div>
      </div>);
      })}

    </div>
  );
}

export default  OtherLive;
