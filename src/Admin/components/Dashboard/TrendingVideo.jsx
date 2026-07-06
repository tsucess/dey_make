import { MdOutlinePlayArrow } from "react-icons/md";

function TrendingVideo() {
  return (
    <section className="bg-blue300 flex flex-col gap-7.5 p-6 rounded-2xl">
      <div className="flex items-center justify-between gap-2 font-roboto">
        <h3 className="text-white text-[22px]">Trending Videos</h3>
        <button className="text-base text-white font-medium">View all</button>
      </div>
      <div className='flex items-center gap-4'>
        {
            [1,2,3,4,5].map(i => <div key={i} className="flex-1 w-full flex flex-col gap-3.5 font-roboto">
                <div className="w-full h-45 relative">
                    <img src="/forest.png" alt="" className="w-full h-full object-fill"/>
                    <div className="flex items-center gap-2 text-xs text-white absolute bottom-3 left-2">
                        <MdOutlinePlayArrow className="w-5 h-5 text-white" />
                        8.2M
                    </div>
                    <div className={`w-6.5 h-6 rounded-md absolute top-3 left-2 flex items-center justify-center text-black text-sm 
                        ${i === 1 ? 'bg-orange900' :
                        i === 2 ? 'bg-zinc200' :
                        i === 3 ? 'bg-orange500' :
                        i === 4 ? 'bg-zinc50' : 'bg-brown600'}`}>{i}</div>
                </div>
                <div className="flex flex-col gap-3">
                    <h6 className="text-white text-sm font-semibold">Beautiful nature</h6>
                    <p className="text-white text-xs">@dariobro</p>
                </div>
            </div>)
        }
     </div>
    </section>
  );
}

export default TrendingVideo;
