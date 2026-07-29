import { MdOutlinePlayArrow } from "react-icons/md";

const rankColors = ["bg-orange900", "bg-zinc200", "bg-orange500", "bg-zinc50", "bg-brown600"];

function TrendingVideo({ videos = [] }) {
  const list = videos.slice(0, 5);
  return (
    <section className="bg-blue300 flex flex-col gap-7.5 p-6 rounded-2xl">
      <div className="flex items-center justify-between gap-2 font-roboto">
        <h3 className="text-white text-[22px]">Trending Videos</h3>
        <button className="text-base text-white font-medium">View all</button>
      </div>
      <div className='flex items-center gap-4'>
        {list.length === 0 && (
          <p className="text-white/60 text-sm">No recent videos.</p>
        )}
        {list.map((video, i) => (
          <div key={video.id} className="flex-1 w-full flex flex-col gap-3.5 font-roboto">
            <div className="w-full h-45 relative">
              <img src={video.thumbnailUrl || "/forest.png"} alt="" className="w-full h-full object-fill"/>
              <div className="flex items-center gap-2 text-xs text-white absolute bottom-3 left-2">
                <MdOutlinePlayArrow className="w-5 h-5 text-white" />
                {video.isLive ? "LIVE" : (video.isDraft ? "Draft" : "Published")}
              </div>
              <div className={`w-6.5 h-6 rounded-md absolute top-3 left-2 flex items-center justify-center text-black text-sm ${rankColors[i] || "bg-brown600"}`}>{i + 1}</div>
            </div>
            <div className="flex flex-col gap-3">
              <h6 className="text-white text-sm font-semibold">{video.title || video.caption || "Untitled"}</h6>
              <p className="text-white text-xs">@{video.author?.username || "unknown"}</p>
            </div>
          </div>
        ))}
     </div>
    </section>
  );
}

export default TrendingVideo;
