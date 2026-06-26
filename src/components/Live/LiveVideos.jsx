import Comment from "./Comment";
import Video from "./Video";

function LiveVideos() {
  return (
    <div className="flex gap-5">
      <Video />
      <Comment />
    </div>
  );
}

export default LiveVideos;
