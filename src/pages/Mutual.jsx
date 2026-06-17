import Comment from "../components/Mutual/Comment"
import Video from "../components/Mutual/Video"


function Mutual() {
  return (
    <div className="flex gap-10 px-4 md:p-8">
        <Video/>
        <Comment/>
    </div>
  )
}

export default Mutual