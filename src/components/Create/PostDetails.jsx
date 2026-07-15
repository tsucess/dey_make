function PostDetails() {
  return <section className="p-5 flex flex-col gap-6 font-inter">
    <h1 className="text-xl font-bold text-black dark:text-white">Post Details</h1>
    <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3"></div>
        <div className="col-span-1 flex flex-col bg-white300">
            <img src="/live-img.jpg" alt="" className="rounded-t-4xl"/>
            <div className="flex flex-col gap-6 py-5 px-4 rounded-b-2xl border border-t-0 border-black/10 dark:border-white/30">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-1">
                    <h4 className="text-base font-medium text-black dark:text-white">Video link</h4>
                    <p className="text-sm text-black dark:text-white">https://deymake.com/vid-1...</p>
                </div>
                <div className="w-5.5 h-7.5 bg-black dark:bg-white shrink-0"></div>
                </div>
                <div className="flex flex-col gap-1">
                    <h4 className="text-base font-medium text-black dark:text-white">Filename</h4>
                    <p className="text-sm text-black dark:text-white">232drt5-4dm3m-dfcme3-3333</p>
                </div>
            </div>
        </div>
    </div>


  </section>;
}

export default PostDetails;
