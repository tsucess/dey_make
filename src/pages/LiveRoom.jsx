import { FiUsers } from "react-icons/fi";
import { MdOutlineThumbUp } from "react-icons/md";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { FaMicrophone } from "react-icons/fa";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { IoMdShareAlt } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { FaExpand } from "react-icons/fa6";

export default function LiveRoom() {
  return <section className="flex flex-col gap-6 md:flex-row">
    <div className="w-full h-50 md:h-full relative">
      <img src="./live img.jpg" alt="" className="w-full h-full"/>
      <div className="flex rounded-full overflow-hidden absolute top-8 left-5 md:left-10">
        <div className="flex items-center justify-center bg-black100 text-white font-inter text-sm font-medium p-4">00:00</div>
        <div className="flex items-center justify-center bg-red400 text-white uppercase font-inter text-sm font-medium p-4">live</div>
      </div>
      <div className="flex items-center gap-3 absolute top-8 right-4 md:right-10">
        <div className="flex items-center gap-1 text-white font-inter text-sm"><FiUsers className="w-4 h-4"/> 1</div>
        <div className="flex items-center gap-1 text-white font-inter text-sm"><MdOutlineThumbUp className="w-4 h-4"/> 2</div>
      </div>
      <div className="flex items-center gap-2 absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/50 backdrop-blur-md backdrop-brightness-75 rounded-full p-3">
<button><HiMiniSpeakerWave className="text-black200 w-4 h-4"/></button>
<button><FaMicrophone className="text-black200 w-4 h-4"/></button>
<button><MdOutlineDriveFolderUpload className="text-black200 w-4 h-4"/></button>
<button><IoMdShareAlt className="text-black200 w-4 h-4" /></button>
<button><IoSettingsOutline className="text-black200 w-4 h-4"/></button>
<button><FaExpand className="text-black200 w-4 h-4"/></button>
      </div>
    </div>

    <aside className={isLiveWatchLayout ? "flex flex-col gap-4 self-start xl:sticky xl:top-6" : "flex flex-col gap-4 self-start lg:sticky lg:top-6 lg:border-l lg:border-black/10 lg:pl-8 dark:lg:border-white/10"}>
            {isLiveWatchLayout ? (
              <section className="space-y-5 rounded-[2rem] bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {creatorIdentity}
                  <div className="flex flex-wrap gap-3">{creatorControls}</div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {actionButtons}
                </div>

                <p className="text-sm leading-relaxed text-slate700 dark:text-slate200">{videoDescription}</p>
              </section>
            ) : null}

            {commentsSection}
          </aside>

  </section>;
}