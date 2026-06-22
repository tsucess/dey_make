import { FiUserPlus, FiVideo } from "react-icons/fi" 
import { IoTrophyOutline } from "react-icons/io5"
import { PiCameraPlus } from "react-icons/pi"

const quickActions = [
    {title : 'New Video', icon : FiVideo, },
    {title : 'Go Live', icon : PiCameraPlus, },
    {title : 'Challenges', icon : IoTrophyOutline, },
    {title : 'Invite Friends', icon : FiUserPlus, },
]

function QuickActionOverview() {
  return (
    <div className="flex p-5 flex-col gap-6 border border-black300 dark:border-white rounded-3xl">
        <h3 className="text-black300 dark:text-white font-bold text-xl">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {
                quickActions.map(({title, icon:Icon}, i) => <div key={title} className="border border-black/30 dark:border-white/30 rounded-3xl p-5 flex items-center gap-3 bg-slate150 dark:bg-black400">
                    <div className={`w-12 h-12 rounded-sm flex items-center justify-center border border-white/20  ${
                        i < 2 ? 'bg-black500/5 dark:bg-black500' :
                        i === 2 ? 'bg-brown500/5 dark:bg-brown500' : 'bg-green400/5 dark:bg-green400'
                    } `}>
                        <Icon className={`w-6 h-6  ${
                            i === 0 ? 'text-red100' : 
                            i === 1 ? 'text-pink' : 
                            i === 2 ? 'text-orange100' :
                            'text-green100'
                        }`}/>
                    </div>
                    <p className="font-inter font-medium text-base text-black dark:text-white">{title}</p>
                </div>)
            }
        </div>
    </div>
  )
}

export default QuickActionOverview