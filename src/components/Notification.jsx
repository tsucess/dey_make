import { div } from "motion/react-client";
import { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { IoMdClose } from "react-icons/io";

export default function Notification({isVisible, closeNotification}){
    const [notification] = useState(['house'])
    return <section className={`bg-black/15 backdrop-blur-xs backdrop-brightness-75 absolute top-0 right-0 w-full h-full justify-end z-100  ${isVisible ? 'flex': 'hidden'}`}>
        <aside className="bg-white w-full md:w-1/2 px-6 py-10 flex flex-col gap-10">
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-black font-bricolage text-xl font-medium"> <IoIosArrowBack /> Notifications</div>
            <button onClick={closeNotification} className="w-10 h-10 rounded-full bg-white300 flex justify-center items-center"> <IoMdClose className="text-slate900 w-5 h-5"/></button>
        </div>

        {
            notification.length === 0 ? <div className=" flex-1 flex flex-col gap-10 items-center justify-center">
                <img src="./notification icon.png" alt="" />
                <div className="flex flex-col gap-2 items-center">
                    <h2 className="text-black text-xl font-inter text-center font-medium">No Notificatons</h2>
                    <p className="text-sm font-inter text-slate700 text-center font-medium">We’ll let you know when there is something to update you.</p>

                </div>

            </div> : <div className="flex-1 flex-col flex gap-2 overflow-y-scroll">
                <div className="flex flex-col gap-1.5">
                    <h2 className="font-inter font-medium text-xl text-black">Today</h2>
                    <div className="flex flex-col gap-1.25">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex gap-3 items-center">
                                <img src="" alt="" />
                                <div className="flex items-center gap-0.5 font-inter">
                                    <span className="text-black font-medium text-base">Jason Eton liked your post.  </span>
                                    <span className="text-slate700 text-sm">9h</span>
                                </div>

                            </div>
                            <img src="" alt="" />
                        </div>

                    </div>
                </div>

            </div>
        }

        </aside>
    </section>

}