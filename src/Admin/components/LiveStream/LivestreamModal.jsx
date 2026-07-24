import { FaEdit } from "react-icons/fa";
import { MdClose, MdDeleteForever, MdStop } from "react-icons/md";

const defaultStreamInfo = [
  { title: "Category", value: "Music" },
  { title: "Started At", value: "May 26, 2025 08:15 PM" },
  { title: "Stream Key", value: "https://live.deymake.com/live/abc123" },
  { title: "Quality", value: "1080P" },
  { title: "Device", value: "iPhone 13" },
  { title: "Location", value: "Lagos, Nigeria" },
  { title: "Monetization", value: "Enabled" },
];

const defaultProfileStats = [
  { title: "Viewers", value: "1.2M" },
  { title: "Likes", value: "96.4K" },
  { title: "Gifts", value: "125k" },
  { title: "Duration", value: "01:23:45" },
];

function LivestreamModal({ handleCloseModal, stream, onForceStop, stopping }) {
  const video = stream?.raw;
  const isLive = Boolean(video?.isLive);
  const streamInfo = video ? [
    { title: "Category", value: stream.category },
    { title: "Started At", value: stream.startedAt },
    { title: "Stream ID", value: stream.streamId },
    { title: "Visibility", value: video.visibility || "everyone" },
    { title: "Gifts", value: video.allowGifts ? "Enabled" : "Disabled" },
    { title: "Location", value: video.location || "—" },
    { title: "Status", value: stream.status },
  ] : defaultStreamInfo;
  const profileStats = video ? [
    { title: "Viewers", value: stream.view },
    { title: "Likes", value: String(video.liveAnalytics?.liveLikes ?? video.liveLikes ?? 0) },
    { title: "Gifts", value: String(video.liveAnalytics?.liveTipsCount ?? 0) },
    { title: "Duration", value: stream.duration },
  ] : defaultProfileStats;
  const title = video ? stream.streamTitle : "Weekend Dance Vibes";
  const idLine = video ? `ID: ${stream.streamId}` : "ID: VID-2026-00132";
  const startedLine = video ? `Started: ${stream.startedAt}` : "Uploaded: May 26, 2025 - 10:30 AM";
  return (
    <section className="w-full max-w-150 absolute top-0 right-0 p-7.5 flex flex-col bg-black900 z-100 gap-7.5 h-screen overflow-y-auto">
      <div className="flex flex-col space-y-3 font-roboto">
        <button onClick={() => handleCloseModal(null)} className="self-end">
          <MdClose className="w-6 h-6 text-white" />
        </button>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <div className="w-full h-52.5 relative">
            <img src={video?.thumbnailUrl || "/video-img-admin.png"} alt="" />
            <div className="absolute bottom-4 right-4 bg-black/60 rounded-md text-white text-sm font-medium px-5 py-1.5">
              {video ? stream.duration : "01:23:45"}
            </div>
          </div>
          <div className="flex flex-col gap-2 font-lexend">
            <p className="text-base text-white font-light">
              {title}
            </p>
            <p className="text-sm text-white font-light">{idLine}</p>
            <p className="text-sm text-white font-light">
              {startedLine}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 w-full">
          {profileStats.map(({ title, value }, i) => (
            <div
              key={title - i}
              className="flex flex-col items-center font-inter"
            >
              <p className="text-white font-bold text-base">{value}</p>
              <span className="text-[11px] font-extralight text-white">
                {title}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-7.5 p-6 rounded-2xl bg-blue300">
          <h4 className="text-lg font-roboto text-white">Stream Information</h4>
          <div className="flex flex-col gap-6">
            {streamInfo.map(({ title, value }, i) => (
              <div
                key={title - i}
                className="flex items-center justify-between font-roboto"
              >
                <h6 className="text-white font-medium text-xs">{title}</h6>
                <span className={`font-medium text-xs text-white`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 p-6 rounded-2xl bg-blue300">
          <button className="w-full h-12 rounded-md text-white text-xs border border-white flex items-center justify-center gap-3">
            <FaEdit className="w-4 h-4 text-white" /> Edit Details
          </button>
          <button className="w-full h-12 rounded-md text-white text-xs border border-white flex items-center justify-center gap-3">
            <FaEdit className="w-4 h-4 text-white" /> Edit Details
          </button>
          <button className="w-full h-12 rounded-md text-white text-xs border border-white flex items-center justify-center gap-3">
            <FaEdit className="w-4 h-4 text-white" /> Edit Details
          </button>
          <button className="w-full h-12 rounded-md text-white text-xs border border-white flex items-center justify-center gap-3">
            <FaEdit className="w-4 h-4 text-white" /> Edit Details
          </button>
          {isLive && (
            <button
              onClick={() => onForceStop?.(stream)}
              disabled={stopping}
              className="w-full h-12 rounded-md text-red100 text-xs border border-red100 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <MdStop className="w-4 h-4 text-red100" /> {stopping ? "Stopping…" : "Force Stop Live"}
            </button>
          )}
          <button className="w-full h-12 rounded-md text-red100 text-xs border border-red100 flex items-center justify-center gap-3">
            <MdDeleteForever className="w-4 h-4 text-red100" /> Remove Video
          </button>
        </div>
      </div>
    </section>
  );
}

export default LivestreamModal;
