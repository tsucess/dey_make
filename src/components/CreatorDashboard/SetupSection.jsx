import { FaCircleCheck } from "react-icons/fa6"

const requirements = [
    {title: 'Connect payment method', isSetup: true},
    {title: 'Set up sharing regions', isSetup: true},
    {title: 'Phone number verified', isSetup: false},
    {title: 'Enable store on profile page', isSetup: true},
]

function SetupSection() {
  return (
    <div className="flex flex-col gap-6 px-7.5 py-5 rounded-3xl border border-black/20 dark:border-white/20">
        {
            requirements.map(({title, isSetup}, i) => <div className="flex items-center justify-between gap-3 font-inter">
                <div className="flex items-center gap-2">
                    <FaCircleCheck className="w-5 h-5 text-green300" />
                    <p className="text-sm font-semibold text-black dark:text-white">{title}</p>
                </div>
                <button className="text-sm font-bold text-orange100">Setup</button>
            </div>)
        }
    </div>
  )
}

export default SetupSection