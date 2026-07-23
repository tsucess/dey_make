/**
 * LivePage — public live-feed browse screen.
 *
 * Landing point for /live. Renders the LiveVideos component which
 * fetches api.getLiveVideos and distributes them to TopVideo (featured)
 * and OtherLive (grid).
 *
 * Feature: 3.5 Live streaming (see PROJECT_OVERVIEW.md).
 * Backend: VideoController@liveIndex.
 */

import LiveVideos from "../components/Live/LiveVideos";

export default function LivePage() {
  return (
    <div className="w-full bg-white  md:pb-24 md:pt-4 dark:bg-black300 md:px-6 md:py-5">
      <LiveVideos />
    </div>
  );
}
