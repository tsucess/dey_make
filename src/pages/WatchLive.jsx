/**
 * WatchLive page — viewer live-room.
 *
 * Reads :id from the URL, records presence via api.recordLivePresence,
 * polls api.getLiveEngagements for chat/tips/likes, and renders the
 * WatchLiveVideo + LiveChat + LiveGift trio. Leaves the room via
 * api.leaveLivePresence on unmount.
 *
 * Feature: 3.5 Live streaming (see PROJECT_OVERVIEW.md).
 * Backend: VideoController@show/liveEngagements/livePresence.
 */

import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LiveChat from "../components/Live/LiveChat";
import LiveGift from "../components/Live/LiveGift";
import WatchLiveVideo from "../components/Live/WatchLiveVideo";
import { api } from "../services/api";

function WatchLive() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [engagements, setEngagements] = useState([]);

  const loadEngagements = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.getLiveEngagements(id, { limit: 12 });
      setEngagements(response?.data?.engagements || []);
    } catch {
      /* keep previous feed */
    }
  }, [id]);

  useEffect(() => {
    let ignore = false;
    if (!id) return undefined;
    (async () => {
      try {
        const response = await api.getVideo(id);
        if (!ignore) setVideo(response?.data?.video || null);
      } catch {
        /* leave placeholder styles */
      }
    })();
    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return undefined;
    loadEngagements();
    const interval = setInterval(loadEngagements, 5000);
    return () => clearInterval(interval);
  }, [id, loadEngagements]);

  return (
    <div className="flex md:flex-col md:p-4 h-screen relative overflow-hidden">
      <div className="md:grid md:grid-cols-5 md:flex-1 gap-5">
        <LiveChat
          video={video}
          engagements={engagements}
          onSubmitted={loadEngagements}
          videoId={id}
        />
        <WatchLiveVideo video={video} videoId={id} />
      </div>
      <LiveGift video={video} videoId={id} onTipped={loadEngagements} />
    </div>
  );
}

export default WatchLive;
