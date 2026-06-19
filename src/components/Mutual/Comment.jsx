import { BiDislike, BiLike } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

const comments = [
  {
    img: "/user1.jpg",
    name: "@SammieNed",
    time: "10 days ago",
    desc: "You are so amazing, and I really love your contents.",
    likes: 344,
    dislikes: 44,
    replies: 5,
  },
  {
    img: "/user1.jpg",
    name: "@SammieNed",
    time: "10 days ago",
    desc: "You are so amazing, and I really love your contents.",
    likes: 0,
    dislikes: 0,
    replies: 0,
  },
  {
    img: "/user1.jpg",
    name: "@SammieNed",
    time: "10 days ago",
    desc: "You are so amazing, and I really love your contents.",
    likes: 344,
    dislikes: 0,
    replies: 5,
  },
  {
    img: "/user1.jpg",
    name: "@SammieNed",
    time: "10 days ago",
    desc: "You are so amazing, and I really love your contents.",
    likes: 344,
    dislikes: 44,
    replies: 0,
  },
];

function Comment() {
  return (
    <div className="flex flex-col gap-4 w-full md:w-1/3">
      <div className="border-y border-black dark:border-white py-4 flex items-center justify-between px-4">
        <h3 className="text-xl font-inter text-black dark:text-white">
          90 Comments
        </h3>
        <button>
          <IoClose className="w-6 h-6 text-black dark:text-white" />
        </button>
      </div>
      <div className="h-full flex flex-col gap-8">
        <div className="flex flex-col gap-6 overflow-y-auto max-h-120">
          {comments.map(
            ({ img, name, time, desc, likes, dislikes, replies }, i) => (
              <div className="flex gap-4 items-start">
                <img
                  src={img}
                  alt={name}
                  className="w-12.5 h-12.5 rounded-full"
                />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-black dark:text-white text-base font-inter">
                      {name}
                    </span>
                    <span className="text-black dark:text-white text-base font-inter">
                      {time}
                    </span>
                  </div>
                  <p className="text-black dark:text-white text-lg font-inter">
                    {desc}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <BiLike className="w-4 h-4 text-black dark:text-white" />
                      {likes > 0 && (
                        <span className="text-black dark:text-white text-sm font-inter">
                          {likes}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <BiDislike className="w-4 h-4 text-black dark:text-white" />
                      {dislikes > 0 && (
                        <span className="text-black dark:text-white text-sm font-inter">
                          {dislikes}
                        </span>
                      )}
                    </div>
                    <button className="text-black dark:text-white text-sm font-inter">
                      Reply
                    </button>
                  </div>
                  {replies > 0 && (
                    <div className="flex items-center gap-2 text-orange100 text-sm">
                      {" "}
                      <MdOutlineKeyboardArrowDown className="w-5 h-5" /> Replies
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
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
