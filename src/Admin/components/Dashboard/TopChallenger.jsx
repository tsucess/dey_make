function formatFollowers(count) {
  const num = Number(count) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M followers`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K followers`;
  return `${num} followers`;
}

function TopChallenger({ users = [] }) {
  const list = users.slice(0, 4);
  return (
    <section className="bg-blue300 flex flex-col gap-7.5 p-6 rounded-2xl">
      <div className="flex items-center justify-between gap-2 font-roboto">
        <h3 className="text-white text-[22px]">Top Challengers</h3>
        <button className="text-base text-white font-medium">View all</button>
      </div>
      <div className="flex flex-col gap-4">
        {list.length === 0 && (
          <p className="text-white/60 text-sm">No recent creators.</p>
        )}
        {list.map((user) => (
          <div
            key={user.id}
            className="border border-white rounded-md px-4 py-5 flex items-center justify-between font-roboto"
          >
              <div className="flex items-center gap-3.5">
                <div className="w-12.5 h-12.5 bg-white rounded-full">
                    <img src={user.avatarUrl || "/story2.jpg"} alt="" className="w-full h-full rounded-full object-cover"/>
                </div>
                <div className="flex flex-col gap-3 ">
                    <h5 className="text-sm text-white font-semibold">{user.username || user.fullName || "—"}</h5>
                    <p className="text-xs text-white">{formatFollowers(user.followersCount)}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span className="text-sm text-white font-semibold">{user.isVerifiedCreator ? "Verified" : "Creator"}</span>
                <span className="text-xs text-white">{user.role || "member"}</span>
              </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TopChallenger;
