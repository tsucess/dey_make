import { useRef, useState } from "react";
import { HiOutlineDocumentPlus } from "react-icons/hi2";
import { MdAspectRatio, MdSlowMotionVideo } from "react-icons/md";
import { RiComputerLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    title: "Size and duration",
    desc: "Maximum size: 30 GB, video duration: 60 minutes.",
    icon: MdSlowMotionVideo,
  },
  {
    title: "File formats",
    desc: "Recommended: “.mp4”. Other major formats are supported.",
    icon: HiOutlineDocumentPlus,
  },
  {
    title: "Video resolutions",
    desc: "High-resolution recommended: 1080p, 1440p, 4K.",
    icon: RiComputerLine,
  },
  {
    title: "Aspect ratios",
    desc: "Recommended: 16:9 for landscape, 9:16 for vertical.",
    icon: MdAspectRatio,
  },
];

function Create() {
  const inputRef = useRef(null);
  const [video, setVideo] = useState(null);
  const navigate = useNavigate()

  const handleFileSelect = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setVideo(file);
      navigate('/post-details-form')
    }
  };

  return (
    <section className="flex flex-col gap-10 p-6 font-inter">
      <div className="flex flex-col gap-6 items-center justify-center h-87.5 border border-dashed border-black dark:border-white">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-black dark:text-white">
            Select the video you want to upload
          </h1>
          <p className="text-sm font-extralight text-black dark:text-white">
            Or drag and drop them here. You can upload up to 10 videos.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          name=""
          id=""
          hidden
          onChange={handleFileChange}
        />
        <button
          onClick={handleFileSelect}
          className="flex items-center justify-center py-3 w-80 bg-orange100 hover:bg-orange500 text-sm rounded-md text-slate100 font-medium transition-all"
        >
          Select video
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ title, desc, icon: Icon }, i) => (
          <div
            key={title}
            className="py-8 px-7.5 rounded-2xl flex flex-col gap-8 border border-black/30 dark:border-white/30"
          >
            <div
              className={`w-12 h-12 flex items-center justify-center border border-black/20 dark:border-white/20 rounded-xl ${
                i === 0
                  ? "bg-black500/10 dark:bg-black500 text-red100"
                  : i === 1
                    ? "bg-orange100/10 text-orange100"
                    : i === 2
                      ? "bg-blue/10 text-blue"
                      : "text-green100 bg-green100/10"
              }`}
            >
              {" "}
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-bold text-base text-black dark:text-white">
                {title}
              </h4>
              <p className="text-xs text-black dark:text-white">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Create;
