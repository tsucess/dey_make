import { LuDot } from "react-icons/lu";

function OtherLive() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
     { [
        1,2,3,4,5,6
      ].map(i => <div key={i} className="flex flex-col gap-3.5">
        <div className={` w-full ${
          i === 1 ? 'bg-cyan100' :
          i === 2 ? 'bg-red100' :
          i === 3 ? 'bg-green300' :
          i === 4 ? 'bg-orange500' :
          i === 5 ?  'bg-brown' : 'bg-pink'
        } h-60`}></div>
        <div className="flex items-center gap-3">
          <img src="/story3.jpg" alt="" className="w-10 h-10 rounded-full border border-black100 dark:border-white object-cover" />
          <div className="flex flex-col gap-1 font-inter">
            <h4 className="text-lg text-black100">Dancing like an angel</h4>
            <span className="text-xs text-black100">@zara.vibes</span>
          </div>
        </div>
      </div>)}
     
    </div>
  );
}

export default  OtherLive;
