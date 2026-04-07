import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api, firstError } from "../services/api";

function parseCategoryId(value) {
  return /^[0-9]+$/.test(`${value || ""}`) ? Number(value) : null;
}

export default function CreateLive() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const thumbnailInputRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState("");
  const thumbnailPreviewUrl = useMemo(() => (thumbnailFile ? URL.createObjectURL(thumbnailFile) : ""), [thumbnailFile]);

  useEffect(() => {
    const liveSetup = location.state?.liveSetup;

    if (!liveSetup) return;

    setForm({
      title: liveSetup.title || "",
      description: liveSetup.description || "",
      categoryId: liveSetup.categoryId ? `${liveSetup.categoryId}` : "",
    });
    setThumbnailFile(liveSetup.thumbnailFile || null);
  }, [location.key, location.state]);

  useEffect(() => () => {
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
  }, [thumbnailPreviewUrl]);

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      setIsLoadingCategories(true);

      try {
        const response = await api.getCategories();
        if (!ignore) setCategories(response?.data?.categories || []);
      } catch (nextError) {
        if (!ignore) setError(firstError(nextError.errors, nextError.message || t("upload.unableToLoadCategories")));
      } finally {
        if (!ignore) setIsLoadingCategories(false);
      }
    }

    loadCategories();

    return () => {
      ignore = true;
    };
  }, [t]);

  function handlePreview() {
    if (!form.title.trim()) {
      setError(t("upload.errors.titleRequired"));
      return;
    }

    setError("");
    navigate("/preview-live", {
      state: {
        liveSetup: {
          title: form.title.trim(),
          description: form.description.trim(),
          categoryId: parseCategoryId(form.categoryId),
          thumbnailFile,
        },
      },
    });
  }

  function handleThumbnailChange(event) {
    setThumbnailFile(event.target.files?.[0] || null);
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 md:px-6 md:py-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-black dark:text-white">{t("upload.liveTitle")}</h1>
        <p className="text-sm text-slate500 dark:text-slate200">{t("upload.liveDescription")}</p>
        <p className="text-sm font-medium text-slate500 dark:text-slate200">{t("upload.signedInAs", { name: user?.fullName || user?.name || t("upload.creatorFallback") })}</p>
      </div>

      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
        <section className="space-y-5 rounded-[2rem] bg-white300 p-6 dark:bg-black100">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-black dark:text-white">{t("upload.liveFlow.setupTitle")}</h2>
            <p className="text-sm text-slate500 dark:text-slate200">{t("upload.liveFlow.setupHint")}</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={form.title}
              placeholder={t("upload.fields.title")}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-3xl bg-white px-5 py-4 text-sm text-slate100 outline-none dark:bg-[#1B1B1B] dark:text-white"
            />
            <textarea
              value={form.description}
              placeholder={t("upload.fields.description")}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={8}
              className="w-full resize-none rounded-3xl bg-white px-5 py-4 text-sm text-slate100 outline-none dark:bg-[#1B1B1B] dark:text-white"
            />
            <select
              value={form.categoryId}
              disabled={isLoadingCategories || categories.length === 0}
              onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
              className="w-full rounded-3xl bg-white px-5 py-4 text-sm text-slate100 outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#1B1B1B] dark:text-white"
            >
              <option value="">{categories.length ? t("upload.category.choose") : t("upload.category.unavailable")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label || category.name}
                </option>
              ))}
            </select>
            {!isLoadingCategories && categories.length === 0 ? <p className="text-xs text-slate500 dark:text-slate200">{t("upload.category.help")}</p> : null}

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleThumbnailChange}
            />

            <div className="rounded-3xl bg-white px-5 py-5 dark:bg-[#1B1B1B]">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-black dark:text-white">{t("upload.thumbnailTitle")}</h3>
                  <p className="text-sm text-slate500 dark:text-slate200">{t("upload.thumbnailHint")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="rounded-full bg-white300 px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-slate150 dark:bg-black100 dark:text-white"
                >
                  {thumbnailPreviewUrl ? t("upload.thumbnailReplace") : t("upload.thumbnailUpload")}
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[220px,minmax(0,1fr)] md:items-center">
                <div className="aspect-video overflow-hidden rounded-3xl bg-white300 dark:bg-black100">
                  {thumbnailPreviewUrl ? (
                    <img src={thumbnailPreviewUrl} alt={t("upload.thumbnailAlt")} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-5 text-center text-sm text-slate500 dark:text-slate200">
                      {t("upload.thumbnailAuto")}
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate500 dark:text-slate200">
                  {thumbnailFile ? t("upload.thumbnailSelected", { name: thumbnailFile.name }) : t("upload.thumbnailAuto")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4 rounded-[2rem] bg-white p-6 shadow-sm dark:bg-[#171717]">
          <h2 className="text-lg font-semibold text-black dark:text-white">{t("upload.liveFlow.previewChecklist")}</h2>
          <ul className="space-y-3 text-sm text-slate600 dark:text-slate200">
            <li>• {t("upload.liveFlow.checkTitle")}</li>
            <li>• {t("upload.liveFlow.checkDevices")}</li>
            <li>• {t("upload.liveFlow.checkDraft")}</li>
          </ul>
          <p className="rounded-2xl bg-orange200/20 px-4 py-3 text-sm text-slate700 dark:text-slate200">{t("upload.liveFlow.saveDraftAfterLive")}</p>
        </aside>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link to="/home" className="rounded-full bg-white300 px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-slate150 dark:bg-black100 dark:text-white">
          {t("upload.liveFlow.cancel")}
        </Link>
        <button
          type="button"
          onClick={handlePreview}
          className="rounded-full bg-orange100 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-orange200"
        >
          {t("upload.liveFlow.previewAction")}
        </button>
      </div>
    </section>
  );
}