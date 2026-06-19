const stories = [
  "/story1.jpg",
  "/story2.jpg",
  "/story3.jpg",
  "/story4.jpg",
  "/story5.jpg",
];

function Story() {
  return (
    <div className="w-full md:w-2/3 md:max-w-2/3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] snap-x">
      <div className="flex gap-3">
        {stories.map((story) => (
          <img
            key={story}
            src={story}
            alt={story}
            className="border-5 border-orange100 rounded-full w-30 h-30 shrink-0 object-cover"
          />
        ))}
      </div>
    </div>
  );
}

export default Story;
