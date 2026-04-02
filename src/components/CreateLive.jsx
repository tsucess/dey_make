import { LuImagePlus } from "react-icons/lu";
import { Link } from "react-router-dom";

export default function CreateLive(){
    return <section className="p-4 md:p-6 flex flex-col gap-8 max-w-4xl mx-auto">
        <h1 className="text-2xl text-black dark:text-white font-inter font-medium">Create Live Stream</h1>

        <div className="flex flex-col gap-6 ">
            <div className="flex flex-col gap-3">
                <input type="text" name="" id="" className="placeholder:text-slate500 font-inter bg-white300 dark:bg-black100 text-slate100 text-sm dark:text-white100 p-3.5 outline-none"  placeholder="Title (required)"/>
                <textarea name="" id="" className="placeholder:text-slate500 font-inter bg-white300 dark:bg-black100 text-slate100 text-sm dark:text-white100 p-3.5 outline-none h-30 resize-none"  placeholder="Description"></textarea>

            </div>

            <div className="flex flex-col gap-4">
                <div className="space-y-1">
                    <h2 className="text-lg text-black dark:text-white font-inter font-medium">Thumbnail</h2>
                <p className="text-sm text-slate700 dark:text-slate500 ">Select or upload a picture that represents your stream.</p>
                </div>
                
                <div className="flex items-center justify-center flex-col w-80 p-6 bg-white300 dark:bg-black100">
                    <LuImagePlus className="w-10 h-10 text-slate700 dark:text-slate500"/>
                    <p className="text-center text-slate700 dark:text-slate500 font-inter text-sm">Upload your thumbnail</p>
                    
                </div>

            </div>

            <div className="flex flex-col gap-3">
                <div className="space-y-1">
                    <h2 className="text-lg text-black dark:text-white font-inter font-medium">Audience</h2>
                <p className="text-sm text-slate700 dark:text-slate500 ">You’re required to tell us whether your videos are ‘Made for Children’</p>
                </div>
                <div className="space-y-3">
                   <label htmlFor="" className="flex items-center gap-2 text-black dark:text-white  font-inter text-base"> <input type="radio" name="" id="" className="w-5 h-5" /> For children</label> 
                   <label htmlFor="" className="flex items-center gap-2 text-black dark:text-white  font-inter  text-base"> <input type="radio" name="" id="" className="w-5 h-5" /> Not for children</label> 
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="space-y-1">
                    <h2 className="text-lg text-black dark:text-white font-inter font-medium">Viewers modes</h2>
                <p className="text-sm text-slate700 dark:text-slate500 ">Who can send messages</p>
                </div>
                <div className="space-y-3">
                   <label htmlFor="" className="flex items-center gap-2 text-black dark:text-white  font-inter text-base"> <input type="radio" name="" id="" className="w-5 h-5" /> Anyone</label> 
                   <label htmlFor="" className="flex items-center gap-2 text-black dark:text-white  font-inter  text-base"> <input type="radio" name="" id="" className="w-5 h-5" /> Subscribers</label> 
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="space-y-1">
                    <h2 className="text-lg text-black dark:text-white font-inter font-medium">Reactions</h2>
                </div>
                <div className="space-y-3">
                   <label htmlFor="" className="flex items-center gap-2 text-black dark:text-white  font-inter text-base"> <input type="radio" name="" id="" className="w-5 h-5" /> Live reactions</label> 
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="space-y-1">
                    <h2 className="text-lg text-black dark:text-white font-inter font-medium">Visibility</h2>
                <p className="text-sm text-slate700 dark:text-slate500 ">Choose who can see your stream</p>
                </div>
                <div className="space-y-3">
                   <label htmlFor="" className="flex items-center gap-2 text-black dark:text-white  font-inter text-base"> <input type="radio" name="" id="" className="w-5 h-5" /> Private</label> 
                   <label htmlFor="" className="flex items-center gap-2 text-black dark:text-white  font-inter  text-base"> <input type="radio" name="" id="" className="w-5 h-5" /> Public</label> 
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link to='/home' className="text-black100 bg-white300 hover:bg-black200 hover:text-white dark:bg-black100 font-inter text-sm px-8 font-medium py-3.5 rounded-full">Cancel</Link>
                <Link to='/preview-live' className="text-black bg-orange100 hover:bg-orange200 font-inter text-sm px-8 font-medium py-3.5 rounded-full">Preview</Link>

            </div>

        </div>
    </section>
}