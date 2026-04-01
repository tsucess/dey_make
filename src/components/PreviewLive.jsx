

export default function PreviewLive(){
    return <section>
        <img src="./header_profile.png" alt=""  className="w-full h-50"/>
        <div className="flex items-end gap-3 -mt-7 mx-auto justify-center">
            <img src="./avatar.jpg" alt="" className="w-20 h-20 rounded-full border-2 border-white dark:border-black300" />
            <div className="flex flex-col gap-1">
                <h2 className="text-lg text-black dark:text-white font-inter font-medium">Jason Eton</h2>
                <p className="text-sm text-slate700 dark:text-slate500 ">The journey is the film.</p>
            </div>

        </div>
    </section>
}