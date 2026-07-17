import { FaEllipsis } from "react-icons/fa6";
import { IoMusicalNotes } from "react-icons/io5";

function Profile() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-5">
        <div className="flex items-center gap-3">
            <img src="/story3.jpg" alt="" className="w-10 h-10 shrink-0 rounded-full object-cover" />
            <div className="flex flex-col gap-1">
                <h4 className="text-base font-medium text-black dark:text-white">zikovibe</h4>
                <span className="text-sm text-black dark:text-white">Ziko Vibe · 2025-6-18</span>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button className="text-slate100 bg-orange100 hover:bg-orange500 transition-all rounded-md px-3 py-2 font-medium text-xs">Connect</button>
            <button className="border border-black/10 dark:border-white/10 rounded-sm px-1 py-1 "><FaEllipsis className="w-4 h-4 text-black dark:text-white" /></button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
            <h3 className="text-sm text-black dark:text-white">Lorem ipsum dolor sit amet consectetur. Risus at in scelerisque scelerisque nunc lobortis. Est et faucibus aliquet urna egestas.</h3>
            <span className="text-sm text-blue">#fyp #deymake #streamer #creator</span>
        </div>
        <div className="flex items-center gap-1.25">
          {" "}
          <IoMusicalNotes className="text-black dark:text-white w-5 h-5" />
          <span className="text-xs text-black dark:text-white">Song name - song artist</span>
        </div>
      </div>
    </section>
  );
}

export default Profile;
