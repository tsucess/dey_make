import Profile from "../components/Post Detail/Profile";
import SideSection from "../components/Post Detail/SideSection";
import Video from "../components/Post Detail/Video";

function PostDetail() {
  return (
    <section className="grid grid-cols-3 gap-7 min-h-screen font-inter">
      <Video />
      <aside className="p-6 pl-0 flex flex-col gap-6 w-full">
        <Profile />
        <SideSection />
      </aside>
    </section>
  );
}

export default PostDetail;
