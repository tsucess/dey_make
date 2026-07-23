/**
 * LiveGift — fan-tip picker for viewers watching a live stream.
 *
 * Presents preset gift amounts and sends the selected tip via
 * api.sendLiveTip. Success updates the parent's tip totals.
 *
 * Feature: 3.5 Live streaming, 3.12 Tips & wallet (see PROJECT_OVERVIEW.md).
 * Backend: FanTipController@storeLive.
 */


import { useEffect, useState } from "react";
import { IoIosArrowDown, IoMdShareAlt } from "react-icons/io";
import { PiCoinFill } from "react-icons/pi";
import { api } from "../../services/api";

const gifts = [
    {
        title : 'Africa',
        price : 20,
        img : '/gift1.png'
    },
    {
        title : 'Lion',
        price : 6,
        img : '/gift2.png'
    },
    {
        title : 'crown',
        price : 6,
        img : '/gift3.png'
    },
    {
        title : 'Wisemen',
        price : 5,
        img : '/gift4.png'
    },
    {
        title : 'Big Lion',
        price : 12,
        img : '/gift5.png'
    },
    {
        title : 'Africa',
        price : 20,
        img : '/gift1.png'
    },
    {
        title : 'Wisemen',
        price : 5,
        img : '/gift4.png'
    },
]

function formatElapsed(startedAt) {
  if (!startedAt) return "1:45:45";
  const startMs = new Date(startedAt).getTime();
  if (Number.isNaN(startMs)) return "1:45:45";
  const seconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = seconds % 60;
  const pad = (n) => `${n}`.padStart(2, "0");
  return `${hh}:${pad(mm)}:${pad(ss)}`;
}

function LiveGift({ video, videoId, onTipped }) {
  const [elapsed, setElapsed] = useState(() => formatElapsed(video?.liveStartedAt));

  useEffect(() => {
    if (!video?.liveStartedAt) return undefined;
    setElapsed(formatElapsed(video.liveStartedAt));
    const interval = setInterval(() => setElapsed(formatElapsed(video.liveStartedAt)), 1000);
    return () => clearInterval(interval);
  }, [video?.liveStartedAt]);

  async function handleSendGift(gift) {
    if (!videoId) return;
    try {
      await api.sendLiveTip(videoId, {
        amount: Math.max(100, gift.price * 100),
        currency: "NGN",
        giftName: gift.title,
        giftCount: 1,
      });
      onTipped?.();
    } catch {
      /* ignore silently */
    }
  }

  return <div className="flex items-center gap-4 bg-white300 rounded-2xl border border-black100/30 dark:border-white/50 dark:bg-white/10 mt-auto font-inter">
    <div className="flex items-center gap-4 pl-4">
        <button className="w-13 h-13 rounded-xl flex items-center justify-center border border-black100/30"><IoMdShareAlt className="text-black100 w-6 h-6" /></button>
        <button className="w-13 h-13 rounded-xl flex items-center justify-center border border-black100/30"><IoMdShareAlt className="text-black100 w-6 h-6" /></button>
        <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red100"></span>
            <span className="text-base text-black100 dark:text-white uppercase">LIVE</span>
        </div>
        <span className="text-base text-black100 dark:text-white uppercase">{elapsed}</span>
    </div>
    <div className="border border-black100/30 rounded-2xl dark:border-white/50 flex items-center justify-between gap-1 p-2 flex-1">
    {
        gifts.map(({title, img, price}, i) => <button key={`${title}-${i}`} onClick={() => handleSendGift({ title, price })} className="flex flex-col gap-1 items-center">
         <img src={img} alt={title} />
         <p className="text-sm text-black500 dark:text-white">{title}</p>
         <div className="flex items-center gap-1"> <PiCoinFill className="w-3 h-3 text-orange100" /> <span className="text-xs text-black500 dark:text-white">{price}</span></div>
        </button>)
    }
    <div className="flex flex-col gap-2 items-center">
        <button className="flex items-center justify-center border border-black/30 dark:border-white/10 rounded-full w-13 h-12">
        <IoIosArrowDown className="w-4 h-4 text-black dark:text-white" /></button>
        <span className="text-xs font-medium text-black500 dark:text-white">More</span>
    </div>

  <div className="flex items-center flex-col gap-3">
    <PiCoinFill className="w-12.5 h-12.5 text-orange100" /> <span className="text-base font-semibold text-black500 dark:text-white">Recharge</span>
    </div>
    </div>
  </div>;
}

export default LiveGift;
