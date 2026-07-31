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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import LiveChat from "../components/Live/LiveChat";
import LiveGift from "../components/Live/LiveGift";
import WatchLiveVideo from "../components/Live/WatchLiveVideo";
import { api } from "../services/api";

function generateSessionKey() {
  const rand = Math.random().toString(36).slice(2, 10);
  return `watch-${Date.now()}-${rand}`;
}

function WatchLive() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [engagements, setEngagements] = useState([]);
  const sessionKey = useMemo(() => generateSessionKey(), []);
  const presenceRegisteredRef = useRef(false);

  const loadVideo = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.getVideo(id);
      setVideo(response?.data?.video || null);
    } catch {
      /* leave placeholder styles */
    }
  }, [id]);

  const loadEngagements = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.getLiveEngagements(id, { limit: 20 });
      setEngagements(response?.data?.engagements || []);
    } catch {
      /* keep previous feed */
    }
  }, [id]);

  useEffect(() => {
    if (!id) return undefined;
    loadVideo();
    return undefined;
  }, [id, loadVideo]);

  useEffect(() => {
    if (!id) return undefined;
    (async () => {
      try {
        await api.recordLivePresence(id, { sessionKey, role: "audience" });
        presenceRegisteredRef.current = true;
      } catch {
        /* presence registration failed — likely stream ended */
      }
    })();

    function handleUnload() {
      if (!presenceRegisteredRef.current) return;
      api.leaveLivePresenceBeacon(id, { sessionKey });
    }

    window.addEventListener("pagehide", handleUnload);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("pagehide", handleUnload);
      window.removeEventListener("beforeunload", handleUnload);
      if (presenceRegisteredRef.current) {
        api.leaveLivePresence(id, { sessionKey }).catch(() => {});
      }
    };
  }, [id, sessionKey]);

  useEffect(() => {
    if (!id) return undefined;
    loadEngagements();
    const engagementInterval = setInterval(loadEngagements, 4000);
    const videoInterval = setInterval(loadVideo, 8000);
    return () => {
      clearInterval(engagementInterval);
      clearInterval(videoInterval);
    };
  }, [id, loadEngagements, loadVideo]);

  return <div className="flex md:flex-col md:p-4 h-screen relative overflow-hidden">
    <div className="md:grid md:grid-cols-5 md:flex-1 gap-5 md:min-h-150">
        <LiveChat video={video} engagements={engagements} onSubmitted={loadEngagements} videoId={id} />
        <WatchLiveVideo video={video} videoId={id} onEngaged={loadEngagements} onVideoRefresh={loadVideo} />
    </div>
    <LiveGift video={video} videoId={id} onTipped={loadEngagements} />
  </div>;
}

export default WatchLive;
 