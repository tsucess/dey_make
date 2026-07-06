function TopChallenge() {
  return (
    <section className="bg-blue300 flex flex-col gap-7.5 p-6 rounded-2xl">
      <div className="flex items-center justify-between gap-2 font-roboto">
        <h3 className="text-white text-[22px]">Top Challenges</h3>
        <button className="text-base text-white font-medium">View all</button>
      </div>
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-white rounded-md px-4 py-5 flex items-center justify-between font-roboto"
          >
              <div className="flex items-center gap-3.5">
                <div className="w-20 h-12 bg-white"></div>
                <div className="flex flex-col gap-3 ">
                    <h5 className="text-sm text-white font-semibold">Dance with Deymake</h5>
                    <p className="text-xs text-white">2,450 entries</p>
                </div>
              </div>
              <div className="bg-green500/8 py-1 px-2 text-green100 text-xs font-semibold rounded-md">Active</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TopChallenge;
