import Comment from "../components/Homepage/Comment"
import Video from "../components/Homepage/Video"


function HomePageNew() {
  return (
    <div className="flex gap-10 md:p-8">
        <Video/>
        <Comment/>
    </div>
  )
}

export default HomePageNew