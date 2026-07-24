import { useEffect, useMemo, useState } from "react";
import Header from "../components/LiveStream/Header";
import Stats from "../components/SuspendedAcoount/Stats";
import Menu from "../components/LiveStream/Menu";
import LivestreamTable from "../components/LiveStream/LivestreamTable";
import LivestreamModal from "../components/LiveStream/LivestreamModal";
import { api, firstError } from "../../services/api";
import { formatCompactNumber, getProfileName } from "../../utils/content";

const tabs = ["All Live Streams", "Live Now", "Upcoming", "Ended", "Flagged"];
const status = ["Live Now", "Upcoming", "Ended", "Flagged"];
const categories = [
  "Lifestyle",
  "Fashion",
  "Beauty",
  "Fitness",
  "Health & Wellness",
  "Food & Cooking",
  "Travel",
  "Education",
  "Technology",
];

function formatStartedAt(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${date} (${time})`;
}

function formatDuration(startIso, endIso) {
  if (!startIso) return "—";
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end)) return "—";
  const seconds = Math.max(0, Math.floor((end - start) / 1000));
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function mapVideoToRow(video) {
  const author = video.author || video.creator || {};
  return {
    id: video.publicId || String(video.id),
    videoId: video.id,
    streamId: video.publicId ? `LIVE-${String(video.publicId).toUpperCase()}` : `LIVE-${video.id}`,
    streamTitle: video.title || "Untitled",
    name: getProfileName(author, "Unknown"),
    username: author?.username ? `@${author.username}` : "",
    avatarUrl: author?.avatarUrl || author?.profilePicture || "",
    category: video.category?.name || "General",
    view: formatCompactNumber(video.liveAnalytics?.currentViewers ?? video.currentViewers ?? 0),
    duration: formatDuration(video.liveStartedAt, video.liveEndedAt),
    status: video.isLive ? "Live Now" : (video.liveEndedAt ? "Ended" : "Upcoming"),
    startedAt: formatStartedAt(video.liveStartedAt),
    raw: video,
  };
}

function LiveStream() {
  const [activeTab, setActiveTab] = useState("All Live Streams");
  const [openModal, setOpenModal] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('')
  const [category, setCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState({ liveNow: 0, endedTotal: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [stoppingId, setStoppingId] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const apiStatus = activeTab === "Live Now" || currentStatus === "Live Now"
          ? "live"
          : activeTab === "Ended" || currentStatus === "Ended"
            ? "ended"
            : "";
        const response = await api.getAdminLiveStreams({ q: searchQuery, status: apiStatus, per_page: 50 });
        if (ignore) return;
        const list = response?.data?.liveStreams || [];
        setRows(list.map(mapVideoToRow));
        setSummary(response?.meta?.summary || { liveNow: 0, endedTotal: 0 });
      } catch (err) {
        if (!ignore) setError(firstError(err) || "Failed to load live streams.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [activeTab, currentStatus, searchQuery, reloadKey]);

  function handleStatusChange(next){ setCurrentStatus(next) }
  function handleCategoryChange(next){ setCategory(next) }
  function handleSearchQueryChange(value){ setSearchQuery(value.trim()) }
  function handleOpenModal(id){ setOpenModal(id) }
  function handleCloseModal(){ setOpenModal(null) }
  function handleActiveTabChange(tab){ setActiveTab(tab) }

  const filteredData = rows.filter((row) => {
    if (activeTab !== "All Live Streams" && row.status !== activeTab) return false;
    if (currentStatus && row.status !== currentStatus) return false;
    if (category && row.category !== category) return false;
    return true;
  });

  const selectedStream = useMemo(
    () => filteredData.find((row) => row.id === openModal) || rows.find((row) => row.id === openModal) || null,
    [openModal, filteredData, rows]
  );

  async function handleForceStop(row) {
    if (!row?.raw?.isLive) return;
    if (!window.confirm(`Force-stop "${row.streamTitle}"? The creator will be disconnected.`)) return;
    setStoppingId(row.id);
    setError('');
    setFeedback('');
    try {
      await api.adminStopLiveStream(row.raw.publicId || row.videoId);
      setFeedback(`Stopped "${row.streamTitle}".`);
      setOpenModal(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(firstError(err) || "Failed to stop live stream.");
    } finally {
      setStoppingId(null);
    }
  }

  const stats = [
    { title: "Live Now", value: String(summary.liveNow ?? 0), sub: "Currently broadcasting", hasArrow: false },
    { title: "Ended", value: String(summary.endedTotal ?? 0), sub: "All-time completed", hasArrow: false },
    { title: "Shown", value: String(filteredData.length), sub: "After filters", hasArrow: false },
    { title: "Loaded", value: String(rows.length), sub: "This page", hasArrow: false },
    { title: "Status", value: loading ? "Loading…" : "Live", sub: loading ? "Fetching data" : "Auto-refresh on action", hasArrow: false },
  ];

  return (
    <div className="space-y-7">
      <Header />
      <Stats stats={stats} />
      <Menu
        activeTab={activeTab}
        handleActiveTabChange={handleActiveTabChange}
        tabs={tabs}
        status={status}
        categories={categories}
        currentStatus={currentStatus}
        category={category}
        searchQuery={searchQuery}
        handleCategoryChange={handleCategoryChange}
        handleStatusChange={handleStatusChange}
        handleSearchQueryChange={handleSearchQueryChange}
      />
      {error && <p className="text-red100 text-sm">{error}</p>}
      {feedback && <p className="text-green100 text-sm">{feedback}</p>}
      <LivestreamTable filteredData={filteredData} modalId={openModal} handleOpenModal={handleOpenModal} />
      {openModal && (
        <LivestreamModal
          handleCloseModal={handleCloseModal}
          stream={selectedStream}
          onForceStop={handleForceStop}
          stopping={stoppingId === openModal}
        />
      )}
    </div>
  );
}

export default LiveStream;
