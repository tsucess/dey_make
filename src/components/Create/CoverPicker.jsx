import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearCoverFrameCache,
  extractVideoCoverFrames,
  fileToCoverFrame,
  releaseCoverFrames,
} from "../../utils/coverImage";

function CoverPicker({
  file,
  type,
  isOpen,
  onClose,
  onSelect,
  currentSelectionId,
}) {
  const [frames, setFrames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const customInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !file) return undefined;

    let cancelled = false;
    let created = [];

    const load = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        if (type === "video") {
          created = await extractVideoCoverFrames(file, { width: 480 });
        } else {
          const single = await fileToCoverFrame(file);
          created = single ? [single] : [];
        }
        if (cancelled) {
          releaseCoverFrames(created);
          return;
        }
        setFrames(created);
        if (created.length === 0) {
          setErrorMessage("Could not extract frames from this file. Upload a custom cover instead.");
        }
      } catch {
        if (!cancelled) setErrorMessage("Could not extract frames from this file.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      releaseCoverFrames(created);
    };
  }, [file, type, isOpen, reloadToken]);

  const handleRegenerate = useCallback(() => {
    if (!file || isLoading) return;
    clearCoverFrameCache(file);
    setFrames([]);
    setReloadToken((token) => token + 1);
  }, [file, isLoading]);

  useEffect(() => {
    return () => releaseCoverFrames(frames);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCustomUpload = (event) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile || !nextFile.type.startsWith("image/")) return;
    const previewUrl = URL.createObjectURL(nextFile);
    onSelect?.({
      id: `custom-${Date.now()}`,
      blob: nextFile,
      previewUrl,
      isCustom: true,
    });
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate100 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 flex flex-col gap-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black dark:text-white">Choose a cover</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-black dark:text-white text-2xl leading-none px-2"
            aria-label="Close cover picker"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="text-sm text-black/70 dark:text-white/70">Extracting frames…</div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 text-red-500 text-sm px-4 py-3">
            {errorMessage}
          </div>
        ) : null}

        {frames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {frames.map((frame) => {
              const isActive = frame.id === currentSelectionId;
              return (
                <button
                  key={frame.id}
                  type="button"
                  onClick={() => {
                    onSelect?.(frame);
                    onClose?.();
                  }}
                  className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 ${
                    isActive ? "border-orange100" : "border-transparent"
                  }`}
                >
                  <img src={frame.previewUrl} alt="Cover option" className="w-full h-full object-cover" />
                  {frame.timestamp !== null && frame.timestamp !== undefined ? (
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                      {frame.timestamp.toFixed(1)}s
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-black/10 dark:border-white/10 pt-4">
          <button
            type="button"
            onClick={() => customInputRef.current?.click()}
            className="text-sm font-medium text-orange100 hover:text-orange500"
          >
            Upload custom cover
          </button>
          {type === "video" ? (
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={!file || isLoading}
              className="text-sm font-medium text-black dark:text-white hover:text-orange100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Regenerating…" : "Regenerate frames"}
            </button>
          ) : null}
          <input
            ref={customInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCustomUpload}
          />
        </div>
      </div>
    </div>
  );
}

export default CoverPicker;
