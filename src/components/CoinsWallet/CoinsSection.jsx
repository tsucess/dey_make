import { useState } from "react";
import { PiCoinFill } from "react-icons/pi";

function CoinsSection() {
  const [selectedCoin, setSelectedCoin] = useState(null)

  function handleSelectCoin(coin){
     setSelectedCoin(prev => prev === coin ? null : coin)
  }

  return (
    <div className="flex flex-col gap-14 font-inter">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[1, 2, 3, 4, 5, 6, 7,8].map((i) => (
          <button
            key={i}
            onClick={()=> handleSelectCoin(i)}
            className={`border-2   rounded-3xl p-5 md:p-7.5 bg-white300 dark:bg-black400 flex flex-col items-center gap-2 md:gap-3 ${
              selectedCoin === i ? 'border-orange100' : 'border-black/10 dark:border-white/20'
            }`}
          >
            <PiCoinFill className="w-7.5 h-7.5 text-orange100" />
            <div className="flex flex-col items-center">
              <span className="text-base font-bold text-black dark:text-white">100</span>
              <span className="font-extralight text-[11px] text-black dark:text-white">coins</span>
              <span className="text-base font-bold text-black dark:text-white">N10,000</span>
            </div>
          </button>
        ))}
      </div>
      <button className="w-full max-w-120 text-base font-medium py-2 self-center bg-orange100 text-slate100 hover:bg-orange500 transition-all ">Recharge</button>
      <span className="text-black500 dark:text-slate700 text-xs text-center">
        Coins are non-refundable and can only be used on DeyMake.
      </span>
    </div>
  );
}

export default CoinsSection;
