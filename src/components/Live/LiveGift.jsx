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
import { FaGift } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { buildShareUrl, getProfileName, getVideoTitle } from "../../utils/content";

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
  const [showGift, setShowGift] = useState(false)

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

  function handleShowGift(){
    setShowGift(prev => !prev)
  }

  async function handleShare() {
    if (!videoId) return;
    const shareUrl = buildShareUrl(video || videoId);
    const shareTitle = video ? getVideoTitle(video) : "Watch this live stream";
    const creator = video?.author || video?.creator;
    const shareText = creator
      ? `${getProfileName(creator)} is live on DeyMake — tap in!`
      : "Catch this live stream on DeyMake!";

    let sharedNatively = false;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        sharedNatively = true;
      } catch {
        /* dismissed */
      }
    }
    if (!sharedNatively && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(shareUrl); } catch { /* ignore */ }
    }
    try { await api.shareVideo(videoId); } catch { /* ignore */ }
    onTipped?.();
  }

  return<>
  <button type="button" onClick={handleShowGift} className="md:hidden absolute bottom-6 z-10 right-20 cursor-pointer"><FaGift className="w-6 h-6 text-orange100" /></button>
   <div className={`${ 
    showGift ? 'absolute bottom-0 left-0 z-10' : 'hidden md:flex'
   } md:static flex items-center gap-4 bg-white300 md:rounded-2xl border border-black100/30 dark:border-white/50 dark:bg-white/10 mt-auto font-inter`}>
    <div className="md:flex items-center gap-4 pl-4 hidden">
        <button type="button" onClick={handleShare} title="Share this live" className="w-13 h-13 rounded-xl flex items-center justify-center border border-black100/30 hover:bg-slate150 transition-colors"><IoMdShareAlt className="text-black100 w-6 h-6" /></button>
        <button type="button" onClick={handleShare} title="Reshare to your feed" className="w-13 h-13 rounded-xl flex items-center justify-center border border-black100/30 hover:bg-slate150 transition-colors"><IoMdShareAlt className="text-black100 w-6 h-6" /></button>
        <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red100"></span>
            <span className="text-base text-black100 dark:text-white uppercase">LIVE</span>
        </div>
        <span className="text-base text-black100 dark:text-white uppercase">{elapsed}</span>
    </div>
    <div className="border border-black100/30 md:rounded-2xl dark:border-white/50 flex flex-col gap-2  p-2 flex-1">
    <button onClick={handleShowGift} className="self-end cursor-pointer md:hidden"><MdClose className="w-6 h-6 text-black dark:text-white"/></button>
    <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-1">
    {
        gifts.map(({title, img, price}, i) => <button key={`${title}-${i}`} onClick={() => handleSendGift({ title, price })} className="flex flex-col gap-1 items-center">
         <img src={img} alt={title}  className="w-10 h-10 md:w-15 md:h-15"/>
         <p className="text-xs md:text-sm text-black500 dark:text-white">{title}</p>
         <div className="flex items-center gap-1"> <PiCoinFill className="w-3 h-3 text-orange100" /> <span className="text-xs text-black500 dark:text-white">{price}</span></div>
        </button>)
    }
    <div className="flex flex-col gap-2 items-center">
        <button className="flex items-center justify-center border border-black/30 dark:border-white/10 rounded-full w-9 md:w-13 h-9 md:h-12">
        <IoIosArrowDown className="w-4 h-4 text-black dark:text-white" /></button>
        <span className="text-xs font-medium text-black500 dark:text-white">More</span>
    </div>

  <div className="flex items-center flex-col gap-3">
    <PiCoinFill className="w-8 md:w-12.5 h-8 md:h-12.5 text-orange100" /> <span className="text-base font-semibold text-black500 dark:text-white">Recharge</span>
    </div>
    </div>
    </div>
  </div>
  </>; 
}

export default LiveGift;
