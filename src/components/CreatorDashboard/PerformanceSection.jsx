const stats = [
  {title : 'IMPRESSIONS', value : '9.1M'},
  {title : 'ENGAGEMENT', value : '672.0K'},
  {title : 'CLICKS', value : '268.0K'},
  {title : 'CONVERSIONS', value : '18,600'},
  {title : 'ACTIVE CAMPAIGNS', value : '3'},
  {title : 'TOTAL SPENT', value : '₦900,000'},
]

function PerformanceSection() {
  return <section className="flex flex-col gap-8 font-inter">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-3.5">
      {
        stats.map(({title, value}, i) => <div className="p-5 border border-black/30 dark:border-white/30 rounded-xl flex flex-col gap-1">
          <h4 className="text-xs font-bold uppercase text-black dark:text-white">{title}</h4>
          <p className={`text-2xl font-bold ${
            i === 1 ? 'text-orange100' :
            i === 2 ? 'text-blue' :
            i === 3 ? 'text-green100' :
            i === 4 ? 'text-red100' : 'text-black dark:text-white'
          }`}>{value}</p>
        </div>)
      }


    </div>
  </section>;
}

export default PerformanceSection;
