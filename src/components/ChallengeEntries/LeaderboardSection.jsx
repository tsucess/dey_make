import { FaRegUser } from "react-icons/fa";
import { FaEllipsis } from "react-icons/fa6";
import { IoIosShareAlt } from "react-icons/io";

const board = [
  {
    name: "Sam Banks",
    username: "@banks_man",
    videoCount: 2,
    points: "987.2k",
    img: "/story1.jpg",
  },
  {
    name: "Sara Moves",
    username: "@sara.moves",
    videoCount: 1,
    points: "876.1k",
    img: "/story2.jpg",
  },
  {
    name: "Crew Fresh",
    username: "@crewfresh",
    videoCount: 3,
    points: "743.0k",
    img: "/story3.jpg",
  },
  {
    name: "Lagos Queen",
    username: "@lagosqueen",
    videoCount: 2,
    points: "621.4k",
    img: "/story4.jpg",
  },
  {
    name: "Robo X",
    username: "@robo.x",
    videoCount: 1,
    points: "498.2k",
    img: "/story5.jpg",
  },
];

function LeaderboardSection({ handleChallengeModal }) {
  return (
    <section className="flex flex-col gap-8 px-6">
      <div className="flex gap-1.5 md:gap-6 items-end">
        {/* second */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <div className="flex flex-col gap-3">
            <div className="border border-white rounded-full w-12 md:w-15 h-12 md:h-15 relative">
              <img
                src="/user1.jpg"
                alt=""
                className="w-full h-full rounded-full"
              />
              <div className="bg-white w-5 h-5 text-xs flex items-center justify-center text-black rounded-full absolute bottom-0 -right-1 font-inter font-bold">
                2
              </div>
            </div>
            <div className="flex items-center flex-col gap-1 font-inter">
              <span className="text-xs font-bold text-black dark:text-white">
                mikedance
              </span>
              <span className="text-[10px] font-extralight text-black dark:text-white">
                1.8M
              </span>
            </div>
          </div>
          <div className="h-12 md:h-16 rounded-t-2xl bg-grey w-full"></div>
        </div>
        {/* first */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <div className="flex flex-col gap-3">
            <div className="border border-orange100 rounded-full w-14 md:w-17.5 h-14 md:h-17.5 relative">
              <img
                src="/user1.jpg"
                alt=""
                className="w-full h-full rounded-full"
              />
              <div className="bg-orange100 w-5 h-5 text-xs flex items-center justify-center text-black rounded-full absolute bottom-0 -right-1 font-inter font-bold">
                1
              </div>
            </div>
            <div className="flex items-center flex-col gap-1 font-inter">
              <span className="text-xs font-bold text-black dark:text-white">
                alexrivera
              </span>
              <span className="text-[10px] font-extralight text-orange100">
                2.10M
              </span>
            </div>
          </div>
          <div className="h-20 md:h-25 rounded-t-2xl bg-brown w-full"></div>
        </div>
        {/* third */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <div className="flex flex-col gap-3">
            <div className="border border-orange500 rounded-full w-12 md:w-15 h-12 md:h-15 relative">
              <img
                src="/user1.jpg"
                alt=""
                className="w-full h-full rounded-full"
              />
              <div className="bg-orange500 w-5 h-5 text-xs flex items-center justify-center text-white rounded-full absolute bottom-0 -right-1 font-inter font-bold">
                3
              </div>
            </div>
            <div className="flex items-center flex-col gap-1 font-inter">
              <span className="text-xs font-bold text-black dark:text-white">
                mikedance
              </span>
              <span className="text-[10px] font-extralight text-orange500">
                1.8M
              </span>
            </div>
          </div>
          <div className="h-9 md:h-12 rounded-t-2xl bg-brown100 w-full"></div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {board.map(({ img, name, username, points, videoCount }, i) => (
          <div className="border border-black dark:border-white p-3 flex items-center justify-between rounded-2xl">
            <div className="flex items-center gap-4">
              <p className="text-slate450 font-semibold font-bricolage text-base">
                {i + 4}
              </p>
              <img
                src={img}
                alt=""
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="flex flex-col gap-1.5">
                <h4 className="text-sm font-inter text-black dark:text-white font-semibold">
                  {name}
                </h4>
                <div className="flex gap-1 items-center">
                  <span className="font-thin text-black dark:text-white text-xs">
                    {username}
                  </span>
                  <span className="font-thin text-black dark:text-white text-xs">
                    .
                  </span>
                  <span className="font-thin text-black dark:text-white text-xs">
                    {videoCount} {videoCount > 1 ? "videos" : "video"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-sm font-inter text-white font-bold">
                {points}
              </span>
              <span className="font-thin text-white text-xs">pts</span>
            </div>
          </div>
        ))}
        <div className="border border-red500/12 bg-brown200 p-3 rounded-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaEllipsis className="w-4 h-4 text-red500" />
            <div className="w-9 h-9 bg-red500 flex justify-center items-center rounded-full">
              <FaRegUser className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h4 className="text-sm font-inter text-white font-semibold">
                You
              </h4>
              <span className="font-thin text-white text-xs">
                Not entered yet
              </span>
            </div>
          </div>
          <span className="text-sm font-inter text-red500 font-bold">
            Join to rank
          </span>
        </div>
      </div>

      <div className="flex gap-4 items-center justify-center">
        <button
          onClick={handleChallengeModal}
          className="w-80 h-12 cursor-pointer bg-orange100 text-slate100 flex justify-center items-center text-base rounded-sm"
        >
          Join Challenge
        </button>
        <button className="text-slate100 border shrink-0 border-black/20 dark:border-white/20 rounded-xl w-12 h-12 flex justify-center items-center">
          <IoIosShareAlt className="w-4 h-4 text-black dark:text-white" />
        </button>
      </div>
    </section>
  );
}

export default LeaderboardSection;
