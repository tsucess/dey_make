import { IoMdArrowRoundUp } from "react-icons/io"



function Stats({stats}) {
  return (
    <div className="flex gap-3 items-center">{
        stats.map(stat => <Stat key={stat.title} {...stat}/>)
    }</div>
  )
}

function Stat({title, value, sub, hasArrow}){
    return <div className="p-5 flex flex-col gap-1 bg-blue200 rounded-2xl font-roboto flex-1">
        <h3 className="text-white font-medium text-xs">{title}</h3>
        <p className="text-2xl text-white">{value}</p>
        <div className="flex items-center gap-2">
            {hasArrow && <IoMdArrowRoundUp className="w-4 h-4 text-green100" />}
            <span className="text-white font-medium text-[11px]">{sub}</span>
        </div>

    </div>

}

export default Stats