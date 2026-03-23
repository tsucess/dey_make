import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiX } from "react-icons/hi";
import { IoCloudUploadOutline, IoImageOutline, IoVideocamOutline } from "react-icons/io5";
import { MdOutlineGifBox } from "react-icons/md";
import Logo from "../components/Logo";

const uploadTypes = [
  { id: "image", label: "Images", helper: "PNG, JPG", icon: IoImageOutline, accept: "image/png,image/jpeg" },
  { id: "gif", label: "GIFs", helper: "800×600 or 400×300", icon: MdOutlineGifBox, accept: "image/gif" },
  { id: "video", label: "Videos", helper: "MP4, 4:3", icon: IoVideocamOutline, accept: "video/mp4" },
];

export default function CreateUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedType, setSelectedType] = useState("image");
  const [selectedFile, setSelectedFile] = useState(null);
  const [form, setForm] = useState({ caption: "", location: "", people: "" });

  const currentType = uploadTypes.find((type) => type.id === selectedType);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate100 text-slate100 dark:text-white">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
        <div className="mb-8 flex items-start justify-between gap-4 md:mb-10">
          <Logo className="w-34 h-auto md:w-44 md:h-auto" />
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Close upload page"
            className="mt-3 flex h-10 w-10 items-center justify-center rounded-full bg-white300 text-slate700 transition-colors hover:bg-slate150 dark:bg-black100 dark:text-slate200"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-auto max-w-5xl">
          <h1 className="mb-6 text-2xl font-semibold font-inter md:mb-8">Upload</h1>

          <div className="mb-8 grid gap-4 md:mb-10 md:grid-cols-3 md:gap-6">
            {uploadTypes.map(({ id, label, helper, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedType(id)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                  selectedType === id
                    ? "border-orange100 bg-orange100/10"
                    : "border-transparent bg-white dark:bg-transparent"
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange100 text-black">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-medium font-inter">{label}</span>
                  <span className="block text-xs text-slate50 dark:text-slate900">{helper}</span>
                </span>
              </button>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={currentType?.accept}
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mb-8 flex h-72 w-full flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-orange100 px-6 text-center md:mb-10 md:h-80"
          >
            <IoCloudUploadOutline className="mb-4 h-20 w-20 text-slate200 dark:text-slate300" />
            <span className="text-3xl font-medium font-inter md:text-4xl">Drag & drop to upload</span>
            <span className="mt-1 text-sm font-medium text-orange100">or browse</span>
            {selectedFile && (
              <span className="mt-4 text-sm text-slate400 dark:text-slate200">Selected: {selectedFile.name}</span>
            )}
          </button>

          <div className="space-y-4 md:space-y-5">
            {[
              { key: "caption", placeholder: "Add a caption" },
              { key: "location", placeholder: "Location" },
              { key: "people", placeholder: "Tag people" },
            ].map(({ key, placeholder }) => (
              <input
                key={key}
                type="text"
                value={form[key]}
                placeholder={placeholder}
                onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                className="h-18 w-full rounded-full bg-white300 px-7 text-base font-inter text-slate100 outline-none placeholder:text-slate600 dark:bg-black100 dark:text-white dark:placeholder:text-slate200"
              />
            ))}
          </div>

          <div className="mt-10 flex justify-end">
            <button
              type="button"
              className="rounded-full bg-orange100 px-10 py-4 text-sm font-semibold text-black transition-colors hover:bg-[#e0a000]"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}