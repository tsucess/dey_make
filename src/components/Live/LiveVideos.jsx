import OtherLive from "./OtherLive";
import TopVideo from "./TopVideo";

function LiveVideos() {
  return (
    <div className="flex flex-col gap-5">
      <TopVideo />
      <OtherLive/>
    </div>
  );
}

export default LiveVideos;
