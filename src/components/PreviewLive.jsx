import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { setLiveCreationSession } from "../live/liveSessionStore";
import { api, firstError } from "../services/api";
import { captureThumbnailFromVideoElement, uploadThumbnailFile } from "../utils/thumbnail";

function stopMediaStream(stream) {
  stream?.getTracks?.().forEach((track) => track.stop());
}

export default function PreviewLive() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const previewRef = useRef(null);
  const streamRef = useRef(null);
  const preserveStreamRef = useRef(false);
  const liveSetup = location.state?.liveSetup || null;
  const [stream, setStream] = useState(null);
  const [cameraState, setCameraState] = useState("idle");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const selectedThumbnailPreviewUrl = useMemo(
    () => (liveSetup?.thumbnailFile ? URL.createObjectURL(liveSetup.thumbnailFile) : ""),
    [liveSetup?.thumbnailFile],
  );

  useEffect(() => {
    streamRef.current = stream;

    if (previewRef.current) {
      previewRef.current.srcObject = stream || null;
    }
  }, [stream]);

  useEffect(() => {
    if (!liveSetup) return undefined;

    let ignore = false;

    async function requestDevices() {
      if (!navigator?.mediaDevices?.getUserMedia) {
        if (!ignore) {
          setCameraState("error");
          setError(t("upload.camera.unavailable"));
        }

        return;
      }

      setCameraState("requesting");
      setError("");

      try {
        const nextStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        if (ignore) {
          stopMediaStream(nextStream);
          return;
        }

        setStream((current) => {
          stopMediaStream(current);
          return nextStream;
        });
        setCameraState("ready");
      } catch (nextError) {
        if (!ignore) {
          setCameraState("error");
          setError(firstError(nextError?.errors, nextError?.message || t("upload.camera.unavailable")));
        }
      }
    }

    requestDevices();

    return () => {
      ignore = true;

      if (!preserveStreamRef.current) {
        stopMediaStream(streamRef.current);
        streamRef.current = null;
      }
    };
  }, [liveSetup, t]);

  useEffect(() => () => {
    if (selectedThumbnailPreviewUrl) URL.revokeObjectURL(selectedThumbnailPreviewUrl);
  }, [selectedThumbnailPreviewUrl]);

  async function handleGoLive() {
    if (!liveSetup) return;
    if (!streamRef.current) {
      setError(t("upload.errors.cameraRequired"));
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      let thumbnailUrl = null;

      if (liveSetup.thumbnailFile) {
        const thumbnailUpload = await uploadThumbnailFile(liveSetup.thumbnailFile);
        thumbnailUrl = thumbnailUpload?.url || null;
      } else {
        try {
          const generatedThumbnail = await captureThumbnailFromVideoElement(previewRef.current, liveSetup.title || "live-stream");
          const thumbnailUpload = await uploadThumbnailFile(generatedThumbnail);
          thumbnailUrl = thumbnailUpload?.url || null;
        } catch {
          // Best-effort fallback: keep going even if automatic thumbnail capture fails.
        }
      }

      const payload = {
        type: "video",
        title: liveSetup.title || null,
        description: liveSetup.description || null,
        categoryId: liveSetup.categoryId || null,
        isLive: true,
        isDraft: false,
      };

      if (thumbnailUrl) payload.thumbnailUrl = thumbnailUrl;

      const response = await api.createVideo(payload);
      const video = response?.data?.video;

      if (!video?.id) throw new Error(t("upload.errors.unableToComplete"));

      preserveStreamRef.current = true;
      setLiveCreationSession({
        videoId: video.id,
        stream: streamRef.current,
        liveSetup,
      });

      navigate(`/live/${video.id}`, { replace: true });
    } catch (nextError) {
      preserveStreamRef.current = false;
      setError(firstError(nextError.errors, nextError.message || t("upload.errors.unableToComplete")));
    } finally {
      setSubmitting(false);
    }
  }

  if (!liveSetup) {
    return <Navigate to="/create-live" replace />;
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 md:px-6 md:py-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-black dark:text-white">{t("upload.liveFlow.previewTitle")}</h1>
        <p className="text-sm text-slate500 dark:text-slate200">{t("upload.liveFlow.previewDescription")}</p>
        <p className="text-sm font-medium text-slate500 dark:text-slate200">{t("upload.signedInAs", { name: user?.fullName || user?.name || t("upload.creatorFallback") })}</p>
      </div>

      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr),360px]">
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm dark:bg-[#171717]">
          <div className="flex aspect-video items-center justify-center bg-black">
            {stream ? (
              <video
                ref={previewRef}
                aria-label={t("upload.camera.previewLabel")}
                className="h-full w-full object-cover"
                autoPlay
                muted
                playsInline
              />
            ) : (
              <div className="px-6 text-center text-white">
                <p className="text-lg font-semibold">{t("upload.camera.sourceTitle")}</p>
                <p className="mt-2 text-sm text-slate-300">{cameraState === "requesting" ? t("upload.camera.requesting") : error || t("upload.camera.help")}</p>
              </div>
            )}
          </div>
          <div className="space-y-3 px-6 py-5">
            <h2 className="text-xl font-semibold text-black dark:text-white">{liveSetup.title}</h2>
            <p className="text-sm text-slate600 dark:text-slate200">{liveSetup.description || t("upload.liveFlow.noDescription")}</p>
          </div>
        </section>

        <aside className="space-y-4 rounded-[2rem] bg-white p-6 shadow-sm dark:bg-[#171717]">
          <div>
            <h2 className="text-lg font-semibold text-black dark:text-white">{t("upload.liveFlow.deviceStatus")}</h2>
            <p className="mt-2 text-sm text-slate600 dark:text-slate200">
              {cameraState === "ready" ? t("upload.camera.ready") : cameraState === "requesting" ? t("upload.camera.requesting") : t("upload.camera.help")}
            </p>
          </div>

          <div className="space-y-2 rounded-3xl bg-white300 px-5 py-4 dark:bg-black100">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate500 dark:text-slate200">{t("upload.fields.title")}</p>
            <p className="text-sm font-medium text-black dark:text-white">{liveSetup.title}</p>
          </div>

          <div className="space-y-2 rounded-3xl bg-white300 px-5 py-4 dark:bg-black100">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate500 dark:text-slate200">{t("upload.category.label")}</p>
            <p className="text-sm font-medium text-black dark:text-white">{liveSetup.categoryId || t("upload.liveFlow.noCategory")}</p>
          </div>

          <div className="space-y-3 rounded-3xl bg-white300 px-5 py-4 dark:bg-black100">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate500 dark:text-slate200">{t("upload.thumbnailTitle")}</p>
            <div className="aspect-video overflow-hidden rounded-3xl bg-black/5 dark:bg-white/5">
              {selectedThumbnailPreviewUrl ? (
                <img src={selectedThumbnailPreviewUrl} alt={t("upload.thumbnailAlt")} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-5 text-center text-sm text-slate500 dark:text-slate200">
                  {t("upload.thumbnailAuto")}
                </div>
              )}
            </div>
          </div>

          <p className="rounded-2xl bg-orange200/20 px-4 py-3 text-sm text-slate700 dark:text-slate200">{t("upload.liveFlow.saveDraftAfterLive")}</p>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/create-live", { state: { liveSetup } })}
              className="rounded-full bg-white300 px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-slate150 dark:bg-black100 dark:text-white"
            >
              {t("upload.liveFlow.editDetails")}
            </button>
            <button
              type="button"
              onClick={handleGoLive}
              disabled={submitting || cameraState !== "ready"}
              className="rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t("upload.actions.goingLive") : t("upload.actions.goLive")}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}