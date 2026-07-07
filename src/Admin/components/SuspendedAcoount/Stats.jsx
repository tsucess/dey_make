import { IoMdArrowRoundUp } from "react-icons/io"

const stats = [
    {title : 'Total Suspended', value : '320', sub: 'All time', hasArrow: false},
    {title : 'Suspended This Month ', value : '45', sub: '12.5% vs last 7 days', hasArrow: true},
    {title : 'Banned Permanently', value : '210', sub: '12.5% of total', hasArrow: true},
    {title : 'Temporary Suspensions', value : '110', sub: '12.5% of total', hasArrow: true},
    {title : 'Appeals Received', value : '28', sub: 'This month', hasArrow: false},
]

function Stats() {
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