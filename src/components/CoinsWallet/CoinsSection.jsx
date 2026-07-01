import { PiCoinFill } from "react-icons/pi";

function CoinsSection() {
  return (
    <div className="flex flex-col gap-20 font-inter">
      <div className="grid grid-cols-2 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="border border-black/20 dark:border-white/20 rounded-3xl p-5 md:p-7.5 bg-white300 dark:bg-black400 flex flex-col items-center gap-2 md:gap-3"
          >
            <PiCoinFill className="w-7.5 h-7.5 text-orange100" />
            <div className="flex flex-col items-center">
              <span className="text-base font-bold text-black dark:text-white">100</span>
              <span className="font-extralight text-[11px] text-black dark:text-white">coins</span>
              <span className="text-base font-bold text-black dark:text-white">N10,000</span>
            </div>
          </div>
        ))}
      </div>
      <span className="text-black500 dark:text-slate700 text-xs text-center">
        Coins are non-refundable and can only be used on DeyMake.
      </span>
    </div>
  );
}

export default CoinsSection;
