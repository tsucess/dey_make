import LiveChat from "../components/Live/LiveChat";
import LiveGift from "../components/Live/LiveGift";
import WatchLiveVideo from "../components/Live/WatchLiveVideo";

function WatchLive() {
  return <div className="flex flex-col p-4 h-screen">
    <div className="grid grid-cols-5 flex-1 gap-5 min-h-150">
        <LiveChat/>
        <WatchLiveVideo/>
    </div>
    <LiveGift/>
  </div>;
}

export default WatchLive;
