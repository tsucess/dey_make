const creators = [
    {name: 'Name Name', username: '@name', avatar: '/user1.jpg'},
    {name: 'Name Name', username: '@name', avatar: '/user1.jpg'},
]

function Creators() {
  return (
    <div className="w-full md:w-1/3 flex flex-col gap-7">
        <div className="flex items-center justify-between">
            <h3 className="font-inter text-sm font-semibold text-black dark:text-white">Creators you may know</h3>
            <button className="font-inter text-sm font-semibold text-orange100">See All</button>
        </div>
        <div className="flex flex-col gap-5">
            {
                creators.map(({name, username, avatar}, i) => <div key={i} className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                        <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
                        <div className="flex flex-col gap-1">
                            <span className="font-inter text-xs text-black dark:text-white">{name}</span>
                            <span className="font-inter text-xs text-black dark:text-white">{username}</span>
                        </div>
                    </div>
                    <button className="font-inter text-[10px] font-semibold text-black dark:text-white border border-black dark:border-white rounded-sm px-3 py-2">Connect</button>
                </div>)
            }
        </div>
        
    </div>
  )
}

export default Creators