import { useTheme } from "../context/ThemeContext";

export default function NetworkIllustration() {
  const { isDark } = useTheme();
  const img = "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=100&q=80";

  const outerNodes = [
    { id: 1,  cx: 175, cy: 48,  r: 28 },
    { id: 2,  cx: 295, cy: 105, r: 24 },
    { id: 3,  cx: 325, cy: 220, r: 28 },
    { id: 4,  cx: 268, cy: 332, r: 24 },
    { id: 5,  cx: 175, cy: 375, r: 28 },
    { id: 6,  cx: 82,  cy: 332, r: 24 },
    { id: 7,  cx: 25,  cy: 220, r: 28 },
    { id: 8,  cx: 55,  cy: 105, r: 24 },
  ];

  const innerNodes = [
    { id: 10, cx: 258, cy: 148, r: 24 },
    { id: 11, cx: 228, cy: 272, r: 22 },
    { id: 12, cx: 122, cy: 272, r: 22 },
    { id: 13, cx: 92,  cy: 148, r: 24 },
  ];

  const centerNode = { id: 9, cx: 175, cy: 210, r: 36 };

  const outerArcs = [
    "M175,48  A175,175 0 0,1 295,105",
    "M295,105 A175,175 0 0,1 325,220",
    "M325,220 A175,175 0 0,1 268,332",
    "M268,332 A175,175 0 0,1 175,375",
    "M175,375 A175,175 0 0,1 82,332",
    "M82,332  A175,175 0 0,1 25,220",
    "M25,220  A175,175 0 0,1 55,105",
    "M55,105  A175,175 0 0,1 175,48",
  ];

  const middleArcs = [
    "M258,148 A105,105 0 0,1 228,272",
    "M228,272 A105,105 0 0,1 122,272",
    "M122,272 A105,105 0 0,1 92,148",
    "M92,148  A105,105 0 0,1 258,148",
  ];

  const innerArcs = [
    "M258,148 A90,90 0 0,1 228,272",
    "M228,272 A90,90 0 0,1 122,272",
    "M122,272 A90,90 0 0,1 92,148",
    "M92,148  A90,90 0 0,0 258,148",
  ];

  const spokes = [
    "M175,48  Q220,95  258,148",
    "M295,105 Q278,126 258,148",
    "M325,220 Q298,200 258,148",
    "M325,220 Q288,260 228,272",
    "M268,332 Q252,308 228,272",
    "M175,375 Q202,328 228,272",
    "M175,375 Q148,328 122,272",
    "M82,332  Q98,308  122,272",
    "M25,220  Q62,258  122,272",
    "M25,220  Q52,178  92,148",
    "M55,105  Q72,126  92,148",
    "M175,48  Q130,95  92,148",
    "M175,210 Q216,178 258,148",
    "M175,210 Q202,241 228,272",
    "M175,210 Q148,241 122,272",
    "M175,210 Q134,178 92,148",
  ];

  // ← black dots become white in dark mode so they're visible
  const dots = [
    { cx: 122, cy: 42,  r: 5, fill: isDark ? "#ffffff" : "#1a1a1a" },
    { cx: 318, cy: 145, r: 5, fill: "#f5a623" },
    { cx: 340, cy: 278, r: 5, fill: isDark ? "#ffffff" : "#1a1a1a" },
    { cx: 240, cy: 388, r: 6, fill: "#f5a623" },
    { cx: 62,  cy: 358, r: 5, fill: isDark ? "#ffffff" : "#1a1a1a" },
    { cx: 10,  cy: 175, r: 5, fill: isDark ? "#ffffff" : "#1a1a1a" },
    { cx: 118, cy: 385, r: 5, fill: "#f5a623" },
    { cx: 8,   cy: 260, r: 6, fill: "#f5a623" },
  ];

  const allNodes = [...outerNodes, ...innerNodes];

  return (
    <div className="flex justify-center items-center w-full mb-2 md:hidden">
      <svg
        viewBox="0 0 350 420"
        width="100%"
        className="max-w-[280px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {[...allNodes, centerNode].map((n) => (
            <clipPath key={n.id} id={`cl-${n.id}`}>
              <circle cx={n.cx} cy={n.cy} r={n.r} />
            </clipPath>
          ))}
        </defs>

        {/* Outer arcs */}
        {outerArcs.map((d, i) => (
          <path key={`oa-${i}`} d={d} fill="none" stroke="#f5a623"
            strokeWidth="1.4" strokeDasharray="6 5" opacity="0.9" />
        ))}

        {/* Middle arcs */}
        {middleArcs.map((d, i) => (
          <path key={`ma-${i}`} d={d} fill="none" stroke="#f5a623"
            strokeWidth="1.3" strokeDasharray="6 5" opacity="0.85" />
        ))}

        {/* Inner arcs */}
        {innerArcs.map((d, i) => (
          <path key={`ia-${i}`} d={d} fill="none" stroke="#f5a623"
            strokeWidth="1.1" strokeDasharray="5 4" opacity="0.7" />
        ))}

        {/* Spokes */}
        {spokes.map((d, i) => (
          <path key={`sp-${i}`} d={d} fill="none" stroke="#f5a623"
            strokeWidth="1.1" strokeDasharray="5 4" opacity="0.65" />
        ))}

        {/* Dots */}
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} />
        ))}

        {/* Outer & inner ring nodes */}
        {allNodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.cx} cy={n.cy} r={n.r} fill="#c8956c" />
            <image
              href={img}
              x={n.cx - n.r} y={n.cy - n.r}
              width={n.r * 2} height={n.r * 2}
              clipPath={`url(#cl-${n.id})`}
              preserveAspectRatio="xMidYMid slice"
            />
            <circle cx={n.cx} cy={n.cy} r={n.r}
              fill="none" stroke="white" strokeWidth="2.2" />
          </g>
        ))}

        {/* Center node — rendered last so it's on top */}
        <circle cx={centerNode.cx} cy={centerNode.cy}
          r={centerNode.r} fill="#c8956c" />
        <image
          href={img}
          x={centerNode.cx - centerNode.r}
          y={centerNode.cy - centerNode.r}
          width={centerNode.r * 2}
          height={centerNode.r * 2}
          clipPath={`url(#cl-${centerNode.id})`}
          preserveAspectRatio="xMidYMid slice"
        />
        <circle cx={centerNode.cx} cy={centerNode.cy}
          r={centerNode.r} fill="none" stroke="white" strokeWidth="3" />
      </svg>
    </div>
  );
}