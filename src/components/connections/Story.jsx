/**
 * Connections/Story — story-bubble rail on the Connections page.
 *
 * Feature: 3.10 Connections (see PROJECT_OVERVIEW.md).
 * Backend: StoryController@index.
 */

import { useRef } from "react";
import { FaPlus } from "react-icons/fa";


const FALLBACK_STORIES = [
  { id: "s1", thumbnailUrl: "/story1.jpg", mediaUrl: "/story1.jpg", author: { fullName: "Story 1" } },
  { id: "s2", thumbnailUrl: "/story2.jpg", mediaUrl: "/story2.jpg", author: { fullName: "Story 2" } },
  { id: "s3", thumbnailUrl: "/story3.jpg", mediaUrl: "/story3.jpg", author: { fullName: "Story 3" } },
  { id: "s4", thumbnailUrl: "/story4.jpg", mediaUrl: "/story4.jpg", author: { fullName: "Story 4" } },
  { id: "s5", thumbnailUrl: "/story5.jpg", mediaUrl: "/story5.jpg", author: { fullName: "Story 5" } },
];

function Story({ stories, onViewStory }) {
  const list = Array.isArray(stories) && stories.length > 0 ? stories : FALLBACK_STORIES;
  const inputRef = useRef(null)

  function handleUpload(){
    inputRef.current?.click()
  }

  function handleFileChange(e) {
  const file = e.target.files?.[0];

  if (file) {
    console.log(file);
  }
}

  return (
    <div className="w-full md:w-2/3 md:max-w-2/3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] snap-x" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      <input type="file" name="" id="" hidden ref={inputRef} onChange={handleFileChange} />
      <
        div className="flex gap-1.5 sm:gap-3">
        <button onClick={handleUpload} className="border-3 cursor-pointer sm:border-5 border-slate150 dark:border-slate150 rounded-full w-15 sm:w-25 h-15 sm:h-25 shrink-0 object-cover flex items-center justify-center">
          <FaPlus className="w-8 md:w-10 h-8 md:h-10 text-slate50" />
        </button>
        {list.map((story) => {
          const key = story.id ?? story.mediaUrl;
          const src = story.thumbnailUrl || story.author?.avatarUrl || story.mediaUrl || "/story1.jpg";
          const alt = story.author?.fullName || "Story";
          return (
            <img
              key={key}
              src={src}
              alt={alt}
              onClick={() => onViewStory && story.id && onViewStory(story.id)}
              className="border-3 sm:border-5 border-orange100 rounded-full w-15 sm:w-25 h-15 sm:h-25 shrink-0 object-cover"
            />
          );
        })}
      </div>
    </div>
  );
}

export default Story;
