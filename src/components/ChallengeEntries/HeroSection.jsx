import { FaEllipsis } from "react-icons/fa6";
import { IoIosShareAlt } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import { Link } from "react-router-dom";

function HeroSection({ handleChallengeModal }) {
  return (
    <section className="challenge-bg p-5 flex flex-col gap-20">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/challenges"
          className="text-slate100 border border-white/20 rounded-xl w-7.5 h-7.5 flex justify-center items-center"
        >
          {" "}
          <IoArrowBack className="w-4 h-4 text-white" />
        </Link>
        <div className="w-21 h-7.5 rounded-xl bg-orange100 flex items-center gap-2 justify-center">
          <span className="w-2 h-2 bg-black rounded-full"></span>
          <span className="font-inter text-[8px] text-black font-medium">
            6 days left
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-slate100 border border-white/20 rounded-xl w-7.5 h-7.5 flex justify-center items-center">
            <IoIosShareAlt className="w-4 h-4 text-white" />
          </button>
          <button className="text-slate100 border border-white/20 rounded-xl w-7.5 h-7.5 flex justify-center items-center">
            <FaEllipsis className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          <div className="border border-white rounded-md w-11 h-6.5 flex items-center justify-center text-[10px] uppercase text-white font-inter">
            DANCE
          </div>
          <h5 className="text-sm font-inter text-red500 font-semibold">
            #DanceOff2025
          </h5>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl font-inter text-white font-bold">
              Dance Off 2026
            </h3>
            <button
              onClick={handleChallengeModal}
              className="w-56.5 h-7.25 bg-orange100 text-slate100 flex justify-center items-center text-base rounded-sm"
            >
              Join Challenge
            </button>
          </div>
          <p className="text-xs font-inter text-white leading-6">
            The biggest dance challenge of the year is here! Create your most
            creative, energetic and original dance routine to the official
            #DanceOff2026 audio. Whether it's freestyle, choreography, or a
            completely new style — we want to see it all. The top 3 winners will
            be featured on DeyMake’s main page and win exclusive prizes.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
