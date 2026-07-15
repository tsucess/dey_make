const FALLBACK_STORIES = [
  { id: "s1", thumbnailUrl: "/story1.jpg", mediaUrl: "/story1.jpg", author: { fullName: "Story 1" } },
  { id: "s2", thumbnailUrl: "/story2.jpg", mediaUrl: "/story2.jpg", author: { fullName: "Story 2" } },
  { id: "s3", thumbnailUrl: "/story3.jpg", mediaUrl: "/story3.jpg", author: { fullName: "Story 3" } },
  { id: "s4", thumbnailUrl: "/story4.jpg", mediaUrl: "/story4.jpg", author: { fullName: "Story 4" } },
  { id: "s5", thumbnailUrl: "/story5.jpg", mediaUrl: "/story5.jpg", author: { fullName: "Story 5" } },
];

function Story({ stories, onViewStory }) {
  const list = Array.isArray(stories) && stories.length > 0 ? stories : FALLBACK_STORIES;

  return (
    <div className="w-full md:w-2/3 md:max-w-2/3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] snap-x" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      <div className="flex gap-3">
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
              className="border-5 border-orange100 rounded-full w-20  md:w-30 h-20 md:h-30 shrink-0 object-cover"
            />
          );
        })}
      </div>
    </div>
  );
}

export default Story;
