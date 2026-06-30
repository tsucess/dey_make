import { Cross } from "lucide-react";
import { useState } from "react";
import { FaCrown } from "react-icons/fa";
import { FiGift } from "react-icons/fi";
import { IoCartOutline } from "react-icons/io5";



function Monetization() {
    const [sources, setSources] = useState([
    {title : 'Creator Fund', desc : 'Earn from video views', icon: Cross , isOn : false},
    {title : 'Live Gifts', desc : 'Receive gifts during live streams', icon: FiGift , isOn : false},
    {title : 'Subscriptions', desc : 'Monthly fan subscriptions', icon: FaCrown , isOn : false},
    {title : 'Merch Store', desc : 'Sell your branded products', icon: IoCartOutline , isOn : false},
])

function handleSourceIsonToggle(title){
    setSources(prev =>  prev.map(source => source.title === title ? {...source, isOn: !source.isOn} : source))
}
  return <div className="flex flex-col gap-5 md:gap-8 font-inter">
    <h4 className="text-lg md:text-xl font-bold text-black300 dark:text-white ">Monetization Sources</h4>
    <div className="flex flex-col gap-6 p-5 border border-black/30 dark:border-white/30 rounded-3xl">
    {
        sources.map(({title, desc, isOn, icon: Icon}, i) => <div className="flex items-center p-3 rounded-2xl bg-white300 dark:bg-black400 bordeer border-black/30 dark:border-white/30 justify-between">
            <div className="flex items-center gap-3 ">
                <div className={`w-9.5 h-9.5 rounded-md border border-black/30 dark:border-white/30 flex items-center justify-center ${
                    i === 0 ? 'bg-black500/5 dark:bg-black500 text-red500' : 
                    i === 1 ? 'bg-pink/10 text-pink' :
                    i === 2 ? 'bg-orange100/10 text-orange100' : 'text-cyan100 bg-cyan100/10'
                }`}><Icon className="w-6 h-6"/></div>
                <div className="flex flex-col gap-1 font-inter">
                    <h5 className="text-base font-bold text-black dark:text-white">{title}</h5>
                    <span className="text-[10px] text-black dark:text-white">{desc}</span>
                </div>
            </div>
            <button onClick={()=> handleSourceIsonToggle(title)} className={`w-16 h-7 p-0.5 rounded-full flex items-center ${isOn ? 'bg-red100 justify-end' : 'bg-slate850/10 dark:bg-slate850/30 justify-start'}`}>
            <span className="w-10 h-6 rounded-full bg-white200"></span>
            </button>
        </div>)
    }
    
    </div>
  </div>;
}

export default Monetization;
