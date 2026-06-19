import Comment from "../components/connections/Comment";
import Hero from "../components/connections/Hero";
import Video from "../components/connections/Video";

function Connections() {
  return (
    <div className="px-4 md:px-10 py-8 flex flex-col gap-10">
      <Hero />
      <div className="flex flex-col md:flex-row gap-10">
        <Video />
        <Comment />
      </div>
    </div>
  );
}

export default Connections;
