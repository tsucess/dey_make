function TopChallenger() {
  return (
    <section className="bg-blue300 flex flex-col gap-7.5 p-6 rounded-2xl">
      <div className="flex items-center justify-between gap-2 font-roboto">
        <h3 className="text-white text-[22px]">Top Challengers</h3>
        <button className="text-base text-white font-medium">View all</button>
      </div>
      <div className="flex flex-col gap-4">
        {[1, 2, 3,4].map((i) => (
          <div
            key={i}
            className="border border-white rounded-md px-4 py-5 flex items-center justify-between font-roboto"
          >
              <div className="flex items-center gap-3.5">
                <div className="w-12.5 h-12.5 bg-white rounded-full">
                    <img src="/story2.jpg" alt="" className="w-full h-full rounded-full object-cover"/>
                </div>
                <div className="flex flex-col gap-3 ">
                    <h5 className="text-sm text-white font-semibold">PrettyGirl_tee</h5>
                    <p className="text-xs text-white">1.2K viewers</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span className="text-sm text-white font-semibold">₦25,000</span>
                <span className="text-xs text-white">Tips</span>
              </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TopChallenger;
