const FALLBACK_CREATORS = [
    {id: null, fullName: 'Name Name', username: '@name', avatarUrl: '/user1.jpg'},
    {id: null, fullName: 'Name Name', username: '@name', avatarUrl: '/user1.jpg'},
]

function Creators({ creators, onToggleConnect }) {
  const list = Array.isArray(creators) && creators.length > 0 ? creators : FALLBACK_CREATORS;

  return (
    <div className="w-full md:w-1/3 md:flex flex-col gap-7 hidden ">
        <div className="flex items-center justify-between">
            <h3 className="font-inter text-sm font-semibold text-black dark:text-white">Creators you may know</h3>
            <button className="font-inter text-sm font-semibold text-orange100">See All</button>
        </div>
        <div className="flex flex-col gap-5">
            {
                list.map((creator, i) => {
                    const name = creator.fullName || creator.name || 'Name Name';
                    const rawUsername = creator.username || 'name';
                    const username = rawUsername.startsWith('@') ? rawUsername : `@${rawUsername}`;
                    const avatar = creator.avatarUrl || creator.avatar || '/user1.jpg';
                    const isConnected = Boolean(creator.currentUserState?.subscribed);
                    return (
                        <div key={creator.id ?? i} className="flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
                                <div className="flex flex-col gap-1">
                                    <span className="font-inter text-xs text-black dark:text-white">{name}</span>
                                    <span className="font-inter text-xs text-black dark:text-white">{username}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => creator.id && onToggleConnect && onToggleConnect(creator)}
                                className="font-inter text-[10px] font-semibold text-black dark:text-white border border-black dark:border-white rounded-sm px-3 py-2"
                            >
                                {isConnected ? 'Connected' : 'Connect'}
                            </button>
                        </div>
                    );
                })
            }
        </div>

    </div>
  )
}

export default Creators