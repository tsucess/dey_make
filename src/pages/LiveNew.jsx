import { useState } from "react";
import { BsFillBarChartFill } from "react-icons/bs";
import { FaCrown, FaEye, FaMicrophone, FaRegComment } from "react-icons/fa";
import { GiStarKey } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { PiCoinFill } from "react-icons/pi";
import { RiShareForwardLine } from "react-icons/ri";
import { TiCameraOutline } from "react-icons/ti";
import EndLiveModal from "../components/Live/EndLiveModal";

const icons = [
  FaMicrophone,
  TiCameraOutline,
  GiStarKey,
  BsFillBarChartFill,
  RiShareForwardLine,
];

function LiveNew() {
  const [endLive, setEndLive] = useState(false);

  function handleToggleEndLive() {
    setEndLive((prev) => !prev);
  }

  return (
    <>
      {endLive && <EndLiveModal handleEndLive={handleToggleEndLive} />}
      <div className="w-full h-full min-h-screen relative font-inter">
        <img src="/Live.png" alt="" className="w-full h-full object-fill" />
        <div className="flex flex-col gap-4 md:gap-10.5 absolute top-4 left-4 right-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-5.5">
              <div className="bg-red100 rounded-lg py-2 px-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-xs md:text-sm font-semibold uppercase text-white">
                  LIVE
                </p>
              </div>
              <div className="flex items-center gap-3 text-white">
                <FaEye className="w-4 h-4" />
                <span className="text-[10px]">2.1M</span>
              </div>
              <span className="text-[10px] text-white">00:20</span>
            </div>
            <button
              onClick={handleToggleEndLive}
              className="bg-red100 rounded-lg py-2 px-4 flex items-center gap-2 text-xs md:text-sm text-white"
            >
              {" "}
              <IoMdClose className="w-4 h-4" /> End Live
            </button>
          </div>
          <div className="flex flex-col gap-2 md:gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Welcome to my Live
            </h2>
            <p className="text-xs text-white">
              I’m Vera Stone, welcome to my live. Can I know you?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center gap-2">
                  <div className="relative w-7 md:w-10 h-7 md:h-10">
                    <img
                      src="/story3.jpg"
                      alt=""
                      className="w-7 md:w-10 h-7 md:h-10 border border-orange100 rounded-full object-cover"
                    />
                    <span className="w-3 md:w-5 h-3 md:h-5 absolute -right-0.5 text-[10px] md:text-xs font-semibold bottom-1 bg-orange100 text-black rounded-full flex items-center justify-center">
                      1
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5 md:gap-1">
                    <span className="text-xs md:text-sm font-semibold text-white">
                      @jayden_x
                    </span>
                    <div className="flex items-center gap-0.5 text-white text-xs">
                      {" "}
                      <PiCoinFill className="w-4 h-4 text-orange100" /> 12.4K
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-white text-[10px] md:text-xs border border-white justify-center rounded-md px-3 py-2">
              {" "}
              <PiCoinFill className="w-4 h-4 text-orange100" /> Gift to rank
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 absolute right-4 top-1/2 -translate-y-1/2">
          {icons.map((Icon, i) => (
            <div
              key={i}
              className="w-7.5 h-7.5 rounded-md flex items-center justify-center border border-white/20 bg-slate100"
            >
              {" "}
              <Icon className="w-5 h-5 text-white" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 bottom-24 left-4 absolute">
          <div className="px-2 flex items-center gap-3">
            <img src="/user1.jpg" alt="" className="w-5 h-5 rounded-full" />
            <div className="bg-orange100/10 border border-orange100/50 p-2 flex items-center gap-2 rounded-full">
              <span className="text-[10px] text-orange800">
                lila.movess sent
              </span>
              <FaCrown className="w-4 h-4 text-orange600" />
              <span className="text-[10px] font-semibold text-white">
                Crown{" "}
              </span>
              <span className="text-white text-[8px]">x500</span>
            </div>
          </div>
          <div className="px-2 flex items-center gap-3">
            <img src="/user1.jpg" alt="" className="w-5 h-5 rounded-full" />
            <span className="text-[10px] text-white">
              boby_kkai joined the stream
            </span>
          </div>
          <div className="px-2 flex items-center gap-3">
            <img src="/user1.jpg" alt="" className="w-5 h-5 rounded-full" />
            <span className="text-[10px] text-white">
              boby_kkai joined the stream
            </span>
          </div>
          <div className="px-2 flex items-center gap-3">
            <img src="/user1.jpg" alt="" className="w-5 h-5 rounded-full" />
            <div className="bg-orange100/10 border border-orange100/50 p-2 flex items-center gap-2 rounded-full">
              <span className="text-[10px] text-orange800">
                lila.movess sent
              </span>
              <FaCrown className="w-4 h-4 text-orange600" />
              <span className="text-[10px] font-semibold text-white">
                Crown{" "}
              </span>
              <span className="text-white text-[8px]">x500</span>
            </div>
          </div>
          <div className="p-2 border-red100/10 bg-red100/50 flex items-center gap-2 rounded-full">
            <FaCrown className="w-4 h-4 text-orange600" />
            <span className="text-[10px] font-semibold text-white">
              500 viewers watching right now!
            </span>
          </div>
        </div>
        <div className="right-4 left-4 bottom-7 bg-black100 border border-slate700 px-4 py-3 flex items-center gap-3 absolute rounded-full">
          <FaRegComment className="w-5 h-5 text-white shrink-0" />
          <input
            type="text"
            name=""
            id=""
            placeholder="Say something..."
            className="text-xs text-white font-medium flex-1"
          />
        </div>
      </div>
    </>
  );
}

export default LiveNew;
