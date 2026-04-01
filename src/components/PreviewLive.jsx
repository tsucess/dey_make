import { TbWorld } from "react-icons/tb";
import { Link } from "react-router-dom";

export default function PreviewLive(){
    return <section>
        <img src="./header_profile.png" alt=""  className="w-full h-50"/>
        <div className="flex items-end gap-3 max-w-xl -mt-7 mx-auto">
            <img src="./avatar.jpg" alt="" className="w-20 h-20 rounded-full border-2 object-fill border-white dark:border-black300" />
            <div className="flex flex-col gap-1">
                <h2 className="text-lg text-black dark:text-white font-inter font-medium">Jason Eton</h2>
                <p className="text-sm text-slate700 dark:text-slate500 ">The journey is the film.</p>
            </div>

        </div>
        <div className="max-w-xl mx-auto mt-20" >
            <div className="flex justify-between items-center gap-3">
                <div className="space-y-2">
                    <h3 className="text-slate700 dark:text-slate500 text-xs font-inter">Title</h3>
                    <p className="text-black dark:text-white font-inter text-sm font-medium">Hello You</p>
                </div>
                <button className="text-black100 bg-white300 hover:bg-black200 hover:text-white dark:bg-black100 font-inter text-sm px-5 font-medium py-1.5 rounded-full">Edit</button>
            </div>
            <div className="flex items-center gap-1 mt-7"><TbWorld className="text-black200 dark:text-white w-5 h-5"/><span className="text-sm font-medium font-inter text-black200 dark:text-white ">Public</span></div>

            <div className="flex items-center justify-end gap-3 mt-20">
                <button className="text-black100 bg-white300 hover:bg-black200 hover:text-white dark:bg-black100 font-inter text-sm px-8 font-medium py-3 rounded-full">Share</button>
                <Link to={`live.${id}`} className="text-black bg-orange100 hover:bg-orange200 font-inter text-sm px-8 font-medium py-3 rounded-full">Go Live</Link>

            </div>
        </div>
    </section>
}