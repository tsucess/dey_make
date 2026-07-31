import { FiUserPlus, FiVideo } from "react-icons/fi"
import { IoTrophyOutline } from "react-icons/io5"
import { PiCameraPlus } from "react-icons/pi"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

function QuickActionOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleInviteFriends() {
    const shareUrl = user?.id
      ? `${window.location.origin}/users/${user.id}`
      : window.location.origin;
    const shareText = "Join me on DeyMake";
    try {
      if (navigator.share) {
        await navigator.share({ title: shareText, url: shareUrl });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // user dismissed share sheet — no-op
    }
  }

  const quickActions = [
    { title: 'New Video', icon: FiVideo, onClick: () => navigate('/create') },
    { title: 'Go Live', icon: PiCameraPlus, onClick: () => navigate('/live') },
    { title: 'Challenges', icon: IoTrophyOutline, onClick: () => navigate('/challenge') },
    { title: 'Invite Friends', icon: FiUserPlus, onClick: handleInviteFriends },
  ];

  return (
    <div className="flex p-5 flex-col gap-6 border border-black300 dark:border-white rounded-3xl">
        <h3 className="text-black300 dark:text-white font-bold text-lg md:text-xl">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 md:gap-5 md:grid-cols-2">
            {
                quickActions.map(({title, icon:Icon, onClick}, i) => <button key={title} onClick={onClick} className="border border-black/30 dark:border-white/30 rounded-3xl p-4 md:p-5 flex items-center gap-3 bg-slate150 dark:bg-black400 text-left hover:bg-slate200 hover:dark:bg-black500 transition-all">
                    <div className={`w-10 md:w-12 h-10 md:h-12 rounded-sm flex items-center justify-center border border-white/20  ${
                        i < 2 ? 'bg-black500/5 dark:bg-black500' :
                        i === 2 ? 'bg-brown500/5 dark:bg-brown500' : 'bg-green400/5 dark:bg-green400'
                    } `}>
                        <Icon className={`w-5 md:w-6 h-5 md:h-6  ${
                            i === 0 ? 'text-red100' :
                            i === 1 ? 'text-pink' :
                            i === 2 ? 'text-orange100' :
                            'text-green100'
                        }`}/>
                    </div>
                    <p className="font-inter font-medium text-sm md:text-base text-black dark:text-white">{title}</p>
                </button>)
            }
        </div>
    </div>
  )
}

export default QuickActionOverview