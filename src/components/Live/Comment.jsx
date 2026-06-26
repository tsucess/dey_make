import { LuDot } from "react-icons/lu";

function Comment() {
  return (
    <div className="flex flex-col gap-7 font-inter w-1/3 h-auto">
      <div className="flex flex-col gap-4.25">
        <h3 className="flex items-center gap-1 text-black text-sm font-semibold">
          Viewers <LuDot className="w-3 h-3" /> 10k
        </h3>
        <div className="flex flex-col gap-3.5 max-h-50 h-full overflow-y-auto ">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <img src="/user1.jpg" alt="" className="w-10 h-10 rounded-full" />
              <span className="text-xs text-black dark:text-white">
                Name Name
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* comments */}
      <div className="flex flex-col gap-3.75 h-full">
        <div className="flex flex-col gap-3.75 max-h-70 overflow-y-auto">
            {
                [1,2,3,4,5].map(i => <div className="flex items-start gap-3">
                    <img src="/user1.jpg" alt="" className="w-12 h-12 rounded-full" />
                    <div className="flex flex-col gap-1">
                        <span className="text-black dark:text-white text-xs">@SammieNed</span>
                        <span className="text-black dark:text-white text-sm">You are so amazing, and I really love your contents.</span>
                    </div>
                </div>)
            }

        </div>
        <div className="mt-auto flex items-center py-3 px-4 rounded-full w-full gap-3 bg-slate150 dark:bg-black100 max-h-17.5 h-full">
          <img
            src="/user1.jpg"
            alt=""
            className="w-7 h-7 rounded-full shrink-0"
          />
          <input
            type="text"
            name=""
            id=""
            className="text-sm font-inter text-black dark:text-white flex-1"
            placeholder="Tell the creator what you think!"
          />
        </div>
      </div>
    </div>
  );
}

export default Comment;
