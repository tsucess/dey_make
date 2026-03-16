export default function Logo({ dark }) {
  return (
    <div className="mb-4">
      <h1 className={`text-[2rem] md:text-[2.6rem] font-bold font-serif
                      leading-none mb-1
                      ${dark ? "text-gray-900" : "text-[#f5a623]"}
                      dark:text-[#f5a623]`}>
        <span className="italic">D</span>eyMake
      </h1>
      <p className={`text-[0.65rem] md:text-[0.7rem] tracking-[0.18em]
                     uppercase font-serif
                     ${dark ? "text-gray-900" : "text-[#f5a623]"}
                     dark:text-[#f5a623]`}>
        Content By You, Loved By All
      </p>
    </div>
  );
}