import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { clearLiveCreationSession } from "../live/liveSessionStore";
import { api, DIRECT_UPLOAD_LARGE_FILE_THRESHOLD, firstError } from "../services/api";
import {
  buildVideoLink,
  formatCountLabel,
  formatRelativeTime,
  formatSubscriberLabel,
  getProfileAvatar,
  getProfileName,
  getVideoThumbnail,
  getVideoTitle,
  isActiveLiveVideo,
} from "../utils/content";

function stopMediaStream(stream) {
  stream?.getTracks?.().forEach((track) => track.stop());
}

function closeAgoraTracks(tracks = []) {
  tracks.forEach((track) => {
    try {
      track?.stop?.();
      track?.close?.();
    } catch {
      // Ignore cleanup errors.
    }
  });
}

function buildMediaStreamFromAgoraTracks(tracks = []) {
  if (typeof MediaStream === "undefined") return null;
  const mediaTracks = tracks.map((track) => track?.getMediaStreamTrack?.()).filter(Boolean);
  return mediaTracks.length ? new MediaStream(mediaTracks) : null;
}

function createLiveRecorder(stream) {
  if (!stream || typeof MediaRecorder === "undefined") return null;
  const mimeTypes = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  const supportedMimeType = mimeTypes.find((mimeType) => typeof MediaRecorder.isTypeSupported !== "function" || MediaRecorder.isTypeSupported(mimeType));
  return supportedMimeType ? new MediaRecorder(stream, { mimeType: supportedMimeType }) : new MediaRecorder(stream);
}

function createRecordingUploadFile(blob, videoId) {
  const recordingType = blob?.type || "video/webm";
  const extension = recordingType.includes("mp4") ? "mp4" : "webm";
  const fileName = `live-${videoId || "recording"}-${Date.now()}.${extension}`;
  if (typeof File !== "undefined") return new File([blob], fileName, { type: recordingType, lastModified: Date.now() });
  Object.defineProperty(blob, "name", { configurable: true, value: fileName });
  return blob;
}

function requiresDirectUpload(file, type) {
  return type === "video" || (file?.size ?? 0) > DIRECT_UPLOAD_LARGE_FILE_THRESHOLD;
}

async function uploadSelectedFile(file, type, callbacks = {}) {
  callbacks?.onStatusChange?.("preparing");
  const presignResponse = await api.presignUpload({ type, originalName: file.name });
  const uploadStrategy = presignResponse?.data || {};
  if (uploadStrategy.strategy === "client-direct-upload") {
    callbacks?.onStatusChange?.("uploading");
    const directUpload = await api.uploadFileDirect(file, uploadStrategy, { onProgress: callbacks?.onProgress });
    const secureUrl = directUpload?.secure_url;
    if (!secureUrl) throw new Error("Upload provider did not return a file URL.");
    callbacks?.onStatusChange?.("processing");
    const uploadResponse = await api.uploadFile({
      type,
      path: secureUrl,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: directUpload?.bytes ?? file.size ?? 0,
      width: directUpload?.width ?? null,
      height: directUpload?.height ?? null,
      duration: directUpload?.duration ?? null,
    });
    return uploadResponse?.data?.upload || null;
  }
  if (requiresDirectUpload(file, type)) throw new Error(callbacks?.directUploadRequiredMessage || "Large files and videos must upload directly.");
  const uploadFormData = new FormData();
  uploadFormData.append("file", file);
  callbacks?.onStatusChange?.("uploading");
  const uploadResponse = await api.uploadFile(uploadFormData);
  return uploadResponse?.data?.upload || null;
}

function StageTile({ stream, label, muted = false }) {
  const playbackRef = useRef(null);

  useEffect(() => {
    if (!playbackRef.current) return undefined;
    playbackRef.current.srcObject = stream || null;
    return () => {
      if (playbackRef.current) playbackRef.current.srcObject = null;
    };
  }, [stream]);

  if (!stream) return null;

  return <video ref={playbackRef} aria-label={label} className="h-full w-full object-cover" autoPlay muted={muted} playsInline controls={!muted} />;
}

export default function LiveRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const agoraClientRef = useRef(null);
  const agoraLocalTracksRef = useRef([]);
  const recorderRef = useRef(null);
  const recorderChunksRef = useRef([]);
  const recorderStopPromiseRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const [previewStatus, setPreviewStatus] = useState("idle");
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [stageRole, setStageRole] = useState("audience");

  const creatorId = video?.author?.id || video?.creator?.id;
  const creatorProfile = video?.author || video?.creator;
  const isCreator = Boolean(creatorId) && user?.id === creatorId;
  const isLive = isActiveLiveVideo(video);
  const resolvedStageRole = isCreator ? "host" : stageRole;
  const shouldJoinAgora = Boolean(video?.id && video?.type === "video" && isAuthenticated && (isLive || isCreator));
  const shouldRecord = Boolean(isCreator && isLive && localStream);

  useEffect(() => () => stopMediaStream(localStream), [localStream]);
  useEffect(() => () => clearLiveCreationSession(id), [id]);

  useEffect(() => {
    let ignore = false;
    async function loadRoom() {
      setLoading(true);
      setError("");
      try {
        const [videoResponse, commentsResponse] = await Promise.all([api.getVideo(id), api.getVideoComments(id)]);
        if (ignore) return;
        setVideo(videoResponse?.data?.video || null);
        setComments(commentsResponse?.data?.comments || []);
      } catch (nextError) {
        if (!ignore) setError(firstError(nextError?.errors, nextError?.message || t("videoDetails.unableToLoad")));
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadRoom();
    return () => {
      ignore = true;
    };
  }, [id, t]);

  useEffect(() => {
    if (isCreator) setStageRole("host");
    else if (!isLive) setStageRole("audience");
  }, [id, isCreator, isLive]);

  useEffect(() => {
    if (!shouldRecord || recorderRef.current) return undefined;
    let recorder;
    try {
      recorder = createLiveRecorder(localStream);
    } catch {
      return undefined;
    }
    if (!recorder) return undefined;
    recorderChunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event?.data?.size) recorderChunksRef.current.push(event.data);
    };
    recorder.start(1000);
    recorderRef.current = recorder;
    return () => {
      if (recorderRef.current === recorder && recorder.state !== "inactive") {
        try { recorder.stop(); } catch {}
      }
    };
  }, [localStream, shouldRecord]);

  async function finalizeRecording() {
    const recorder = recorderRef.current;
    if (!recorder) return null;
    if (recorderStopPromiseRef.current) return recorderStopPromiseRef.current;
    recorderStopPromiseRef.current = new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        const chunks = [...recorderChunksRef.current];
        recorderChunksRef.current = [];
        recorderRef.current = null;
        recorderStopPromiseRef.current = null;
        resolve(chunks.length ? new Blob(chunks, { type: recorder.mimeType || "video/webm" }) : null);
      };
      if (recorder.state === "inactive") {
        finish();
        return;
      }
      recorder.addEventListener("stop", finish, { once: true });
      recorder.addEventListener("error", finish, { once: true });
      try { recorder.requestData?.(); } catch {}
      try { recorder.stop(); } catch { finish(); }
    });
    return recorderStopPromiseRef.current;
  }

  useEffect(() => {
    let ignore = false;
    async function cleanupAgora() {
      closeAgoraTracks(agoraLocalTracksRef.current);
      agoraLocalTracksRef.current = [];
      const client = agoraClientRef.current;
      agoraClientRef.current = null;
      if (client) {
        try {
          client.removeAllListeners?.();
          await client.leave();
        } catch {}
      }
    }
    setRemoteParticipants([]);
    if (!shouldJoinAgora) {
      setPreviewStatus("idle");
      setConnectionStatus("idle");
      setLocalStream((current) => {
        stopMediaStream(current);
        return null;
      });
      cleanupAgora();
      return undefined;
    }
    async function connectAgora() {
      await cleanupAgora();
      if (ignore) return;
      setPreviewStatus(resolvedStageRole === "host" ? "requesting" : "idle");
      setConnectionStatus(isLive ? "connecting" : "idle");
      try {
        const response = await api.getLiveAgoraSession(id, { role: resolvedStageRole });
        if (ignore) return;
        const session = response?.data?.session || {};
        const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
        agoraClientRef.current = client;
        const syncParticipants = () => {
          if (ignore) return;
          const next = (client.remoteUsers || []).map((remoteUser, index) => ({
            uid: `${remoteUser.uid || index}`,
            stream: buildMediaStreamFromAgoraTracks([remoteUser.videoTrack, remoteUser.audioTrack]),
          })).filter((entry) => entry.stream);
          setRemoteParticipants(next);
          setConnectionStatus(next.length ? "ready" : (isLive ? "connecting" : "idle"));
        };
        client.on("user-published", async (remoteUser, mediaType) => {
          await client.subscribe(remoteUser, mediaType);
          syncParticipants();
        });
        client.on("user-unpublished", syncParticipants);
        client.on("user-left", syncParticipants);
        await client.join(session.appId, session.channelName, session.token, session.uid);
        await client.setClientRole(resolvedStageRole === "host" ? "host" : "audience");
        if (resolvedStageRole === "host") {
          const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
          if (ignore) {
            closeAgoraTracks(tracks);
            await client.leave();
            return;
          }
          agoraLocalTracksRef.current = tracks;
          await client.publish(tracks);
          setLocalStream((current) => {
            stopMediaStream(current);
            return buildMediaStreamFromAgoraTracks(tracks);
          });
          setPreviewStatus("ready");
        } else {
          setLocalStream((current) => {
            stopMediaStream(current);
            return null;
          });
        }
        syncParticipants();
      } catch (nextError) {
        if (ignore) return;
        setRemoteParticipants([]);
        setLocalStream((current) => {
          stopMediaStream(current);
          return null;
        });
        setPreviewStatus(resolvedStageRole === "host" ? "error" : "idle");
        setConnectionStatus("error");
        setError((current) => current || firstError(nextError?.errors, nextError?.message || t("videoDetails.liveStreamUnavailable")));
      }
    }
    connectAgora();
    return () => {
      ignore = true;
      setRemoteParticipants([]);
      cleanupAgora();
    };
  }, [id, isLive, resolvedStageRole, shouldJoinAgora, t]);

  async function handleToggleLive() {
    if (!video || !isCreator) return;
    const actionKey = `${isLive ? "stop" : "start"}-live-${video.id}`;
    setBusyAction(actionKey);
    setError("");
    setFeedback("");
    try {
      if (isLive) {
        const recordingBlob = await finalizeRecording();
        const stopResponse = await api.stopVideoLive(video.id);
        let updatedVideo = stopResponse?.data?.video || null;
        if (recordingBlob) {
          const recordingFile = createRecordingUploadFile(recordingBlob, video.id);
          const upload = await uploadSelectedFile(recordingFile, "video", { directUploadRequiredMessage: t("upload.errors.directUploadRequired") });
          if (!upload?.id) throw new Error(t("upload.errors.unableToComplete"));
          const updateResponse = await api.updateVideo(video.id, { uploadId: upload.id, isDraft: true, isLive: false });
          updatedVideo = updateResponse?.data?.video || updatedVideo;
        }
        if (updatedVideo) {
          setVideo(updatedVideo);
          clearLiveCreationSession(video.id);
          navigate(buildVideoLink(updatedVideo, { isLive: false }), { replace: true });
        }
        setFeedback(stopResponse?.message || t("videoDetails.liveStopped"));
      } else {
        const response = await api.startVideoLive(video.id);
        if (response?.data?.video) setVideo(response.data.video);
        setFeedback(response?.message || t("videoDetails.liveStarted"));
      }
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("videoDetails.unableToLoad")));
    } finally {
      setBusyAction("");
    }
  }

  async function handleSubmitComment() {
    if (!video || !commentBody.trim() || !isAuthenticated) return;
    setSubmittingComment(true);
    setError("");
    try {
      const response = await api.postComment(video.id, commentBody.trim());
      const nextComment = response?.data?.comment;
      if (nextComment) {
        setComments((current) => [nextComment, ...current]);
        setCommentBody("");
      }
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("videoDetails.commentError")));
    } finally {
      setSubmittingComment(false);
    }
  }

  if (!loading && video && !isLive && !isCreator) {
    return <Navigate to={buildVideoLink(video, { isLive: false })} replace />;
  }

  const stageTiles = [
    ...(resolvedStageRole === "host" && localStream ? [{ key: `local-${user?.id || "host"}`, stream: localStream, muted: true, label: t("videoDetails.liveCameraPreview") }] : []),
    ...remoteParticipants.map((participant, index) => ({
      key: `remote-${participant.uid}`,
      stream: participant.stream,
      muted: false,
      label: index === 0 ? t("videoDetails.liveStreamPlayback") : `${t("videoDetails.liveStreamPlayback")} ${index + 1}`,
    })),
  ];
  const livePlaceholderMessage = resolvedStageRole === "host" && previewStatus === "requesting"
    ? t("videoDetails.loadingLivePreview")
    : resolvedStageRole === "host" && previewStatus === "error"
      ? t("videoDetails.livePreviewUnavailable")
      : connectionStatus === "connecting"
        ? t("videoDetails.connectingLiveStream")
        : connectionStatus === "error"
          ? t("videoDetails.liveStreamUnavailable")
          : t("videoDetails.livePlaceholderBody");

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 dark:bg-[#121212] md:px-8 md:py-8">
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-black shadow-sm dark:bg-[#1D1D1D] dark:text-white">
            <HiArrowLeft className="h-5 w-5" /> {t("videoDetails.back")}
          </button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {isLive ? <span className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold tracking-wide text-white">{t("videoDetails.liveNow")}</span> : null}
          </div>
        </div>

        {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {feedback ? <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</div> : null}
        {loading ? <div className="rounded-[2rem] bg-white p-8 text-sm text-slate600 shadow-sm dark:bg-[#171717] dark:text-slate200">{t("videoDetails.loading")}</div> : null}

        {video ? (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr),400px]">
            <div className="space-y-6">
              <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm dark:bg-[#171717]">
                <div className="relative aspect-video bg-black">
                  {stageTiles.length ? (
                    <div className={`grid h-full w-full ${stageTiles.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {stageTiles.map((tile) => (
                        <div key={tile.key} className="relative min-h-0">
                          <StageTile stream={tile.stream} label={tile.label} muted={tile.muted} />
                          {tile.muted ? <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">{t("videoDetails.onStage")}</span> : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-white">
                      <div className="max-w-lg">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-300">{t("videoDetails.liveNow")}</p>
                        <h2 className="mt-4 text-2xl font-semibold">{t("videoDetails.livePlaceholderTitle")}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-slate-300">{livePlaceholderMessage}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-5 px-5 py-5 md:px-6 md:py-6">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-black dark:text-white">{getVideoTitle(video)}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate500 dark:text-slate200">
                      <span>{formatCountLabel(video.views || 0, t("content.views"))}</span>
                      <span>{formatRelativeTime(video.createdAt)}</span>
                      {video.category?.label ? <span>{video.category.label}</span> : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <img src={getProfileAvatar(creatorProfile)} alt={getProfileName(creatorProfile)} className="h-16 w-16 rounded-full object-cover" />
                      <div className="min-w-0">
                        {creatorId ? <Link to={`/users/${creatorId}`} className="truncate text-lg font-medium text-black hover:opacity-80 dark:text-white">{getProfileName(creatorProfile)}</Link> : <p className="truncate text-lg font-medium text-black dark:text-white">{getProfileName(creatorProfile)}</p>}
                        <p className="text-sm text-slate500 dark:text-slate200">{formatSubscriberLabel(creatorProfile?.subscriberCount || 0, t("content.subscribers"))}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {isCreator ? (
                        <button type="button" disabled={busyAction === `${isLive ? "stop" : "start"}-live-${video.id}`} onClick={handleToggleLive} className="rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                          {busyAction === `${isLive ? "stop" : "start"}-live-${video.id}` ? t(isLive ? "videoDetails.stoppingLive" : "videoDetails.startingLive") : t(isLive ? "videoDetails.stopLive" : "videoDetails.startLive")}
                        </button>
                      ) : null}
                      {isLive ? (
                        <button type="button" onClick={() => setStageRole((current) => (current === "host" ? "audience" : "host"))} className={`rounded-full px-6 py-3 text-sm font-semibold transition-colors ${resolvedStageRole === "host" ? "bg-white300 text-black dark:bg-black100 dark:text-white" : "bg-orange100 text-black"}`}>
                          {resolvedStageRole === "host" ? t("videoDetails.leaveStage") : t("videoDetails.joinStage")}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-slate700 dark:text-slate200">{video.description || video.caption || t("videoDetails.noDescription")}</p>
                </div>
              </section>
            </div>

            <aside className="flex flex-col gap-4 self-start xl:sticky xl:top-6">
              <section className="max-h-[75vh] overflow-hidden rounded-[2rem] bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-black dark:text-white">{t("videoDetails.comments")}</h2>
                  <span className="text-sm text-slate500 dark:text-slate200">{comments.length}</span>
                </div>

                <div className="mt-4 flex gap-3">
                  <img src={getProfileAvatar(user)} alt={getProfileName(user, t("videoDetails.you"))} className="h-11 w-11 rounded-full object-cover" />
                  <div className="flex-1 space-y-3">
                    <textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} rows={3} placeholder={t("videoDetails.commentPlaceholder")} className="w-full resize-none rounded-[1.5rem] bg-[#F7F7F7] px-4 py-3 text-sm text-slate100 outline-none placeholder:text-slate500 dark:bg-[#1F1F1F] dark:text-white dark:placeholder:text-slate200" />
                    <button type="button" disabled={submittingComment || !commentBody.trim()} onClick={handleSubmitComment} className="rounded-full bg-orange100 px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60">
                      {submittingComment ? t("videoDetails.posting") : t("videoDetails.postComment")}
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-4 overflow-y-auto pr-1">
                  {comments.length ? comments.map((comment) => (
                    <article key={comment.id} className="rounded-3xl bg-[#F7F7F7] p-4 dark:bg-[#1F1F1F]">
                      <div className="flex gap-3">
                        <img src={getProfileAvatar(comment.user)} alt={getProfileName(comment.user)} className="h-10 w-10 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-black dark:text-white">{getProfileName(comment.user)}</p>
                            <span className="text-xs text-slate500 dark:text-slate200">{formatRelativeTime(comment.createdAt)}</span>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate700 dark:text-slate200">{comment.body || comment.text}</p>
                        </div>
                      </div>
                    </article>
                  )) : <div className="rounded-3xl bg-[#F7F7F7] px-6 py-10 text-center text-sm text-slate600 dark:bg-[#1F1F1F] dark:text-slate200">{t("videoDetails.noComments")}</div>}
                </div>
              </section>

              {!isLive ? (
                <section className="rounded-[2rem] bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
                  <img src={video.thumbnailUrl || getVideoThumbnail(video)} alt={getVideoTitle(video)} className="aspect-video w-full rounded-[1.5rem] object-cover" />
                </section>
              ) : null}
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}