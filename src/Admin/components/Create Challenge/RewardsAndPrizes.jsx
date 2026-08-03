import PrizeStructure from "./PrizeStructure";

const rewards = [
  {
    title: "Top 10 Creators",
    desc: "Rewards for top 10 performing more creators.",
    amount: "50,000",
    quantity: "each",
  },
  {
    title: "Most Creative",
    desc: "Reward for the most creative entry",
    amount: "50,000",
    quantity: "1 winners",
  },
  {
    title: "Best Use of Hashtag",
    desc: "Rewards for best use of challenge hashtag",
    amount: "50,000",
    quantity: "1 winners",
  },
  {
    title: "Lucky Draw",
    desc: "Random winners from all participants",
    amount: "50,000",
    quantity: "5 winners",
  },
];

const stats = [
  {
    title: "Total Budget",
    amount: "1,5000,000",
    desc: "Set your total budget",
  },
  {
    title: "Total Prize Value",
    amount: "1,000,000",
    desc: "Main prizes (1st - 3rd)",
  },
  { title: "Additional Rewards", amount: "250,000", desc: "Extra rewards" },
  {
    title: "Budget Remaining",
    amount: "250,000",
    desc: "Available for more rewards",
  },
];

function RewardsAndPrizes() {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h2 className="text-white text-lg font-medium">Rewards & Prizes</h2>
        <p className="text-sm text-white">Desine the prizes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-10">
          <PrizeStructure />
          <div className="flex flex-col gap-7.75">
            <div className="flex flex-col gap-1">
              <h2 className="text-white text-lg font-medium">Funding Source</h2>
              <p className="text-sm text-white">
                Select how you want to fund this challenge.
              </p>
            </div>
            <div className="flex flex-col sm:items-center gap-10 sm:flex-row">
              <label className="flex items-center gap-2 px-5 py-2.5 bg-black10 rounded-[10px] flex-1">
                <input type="radio" name="" id="" />
                <div className="flex flex-col gap-1">
                  <h5 className="text-white font-medium text-base">
                    DeyMake Budget
                  </h5>
                  <span className="text-xs text-white">
                    Use platform budget
                  </span>
                </div>
              </label>
              <label className="flex items-center gap-2 px-5 py-2.5 bg-black10 rounded-[10px] flex-1">
                <input type="radio" name="" id="" />
                <div className="flex flex-col gap-1">
                  <h5 className="text-white font-medium text-base">
                    Sponsor / Partner
                  </h5>
                  <span className="text-xs text-white">
                    Funded by a sponsor or partner
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-white text-lg font-medium">
              Additional Rewards (Optional)
            </h3>
            <p className="text-sm text-white">
              Add special rewards to recognize more creators.
            </p>
          </div>
          <div className="px-7.5 py-5 flex flex-col gap-5 bg-blue500 border border-white/30 rounded-2xl">
            <div className="flex flex-col gap-8">
              {rewards.map(({ title, desc, quantity, amount }, i) => (
                <div className=" flex items-center gap-3 justify-between py-2">
                  <div className="flex gap-5">
                    <input type="checkbox" name="" id="" />
                    <div className="flex flex-col gap-1 font-roboto">
                      <h4 className="text-white text-sm ">{title}</h4>
                      <span className="text-white text-xs font-medium">
                        {desc}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-white">{amount}</span>
                    <span className="text-white text-xs font-medium">
                      {quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border border-white text-white text-sm py-3 px-2 text-center">
              Additional rewards are not mandatory and can be customized.
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h3 className="text-white text-lg font-medium">Budget Overview</h3>
          <p className="text-sm text-white">
            Set your total budget and we’ll help you track spending.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {stats.map(({ title, amount, desc }, i) => (
            <div
              key={title}
              className="bg-blue500 rounded-2xl p-5 gap-2 flex flex-col font-roboto"
            >
              <h4 className="text-white font-medium text-xs">{title}</h4>
              <span className="text-2xl text-white">{amount}</span>
              <span
                className={`text-[11px] font-bold ${
                  i === 0 ? "text-orange100" : "text-white"
                }`}
              >
                {desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RewardsAndPrizes;
