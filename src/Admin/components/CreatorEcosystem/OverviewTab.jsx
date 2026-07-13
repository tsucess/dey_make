import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FiPlay } from "react-icons/fi";
import { MdVerified } from "react-icons/md";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// --- MOCK DATA ---
const lineChartData = {
  labels: ["May 12", "May 13", "May 14", "May 15", "May 16", "May 17", "May 18"],
  datasets: [
    {
      label: "New Creators",
      data: [40, 90, 85, 83, 65, 30, 95],
      borderColor: "#fdb300", // var(--color-orange100)
      backgroundColor: "#fdb300",
      tension: 0.4,
    },
    {
      label: "Active Creators",
      data: [25, 55, 58, 68, 85, 15, 92],
      borderColor: "#534feb", // var(--color-blue)
      backgroundColor: "#534feb",
      tension: 0.4,
    },
  ],
};

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      grid: {
        color: "rgba(255,255,255,0.1)",
        borderDash: [5, 5],
      },
      ticks: { color: "#8c8c8c" }, // var(--color-slate600)
    },
    x: {
      grid: { display: false },
      ticks: { color: "#8c8c8c" },
    },
  },
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "#d9d9d9", // var(--color-slate200)
        usePointStyle: true,
        boxWidth: 8,
      },
    },
  },
};

const donutChartData = {
  labels: ["Entertainment", "Music", "Comedy", "Lifestyle", "Gaming", "Other"],
  datasets: [
    {
      data: [30, 25, 20, 15, 5, 5],
      backgroundColor: [
        "#534feb", // Blue
        "#34C759", // Green
        "#ff8d28", // Orange
        "#de1b1b", // Red
        "#CB3CFF", // Purple
        "#8c8c8c", // Grey
      ],
      borderWidth: 0,
      hoverOffset: 4,
      cutout: "75%",
    },
  ],
};

const donutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
};

const topCreatorsData = [
  { name: "Aisha Doe", handle: "@aishadoe", category: "Travel", followers: "1.2M", views: "12.4M", engagement: "8.7%", earnings: "4.6M", avatar: "https://i.pravatar.cc/150?u=1" },
  { name: "Aisha Doe", handle: "@aishadoe", category: "Music", followers: "780K", views: "9.4M", engagement: "7.2%", earnings: "3.4M", avatar: "https://i.pravatar.cc/150?u=2" },
  { name: "Aisha Doe", handle: "@aishadoe", category: "Comedy", followers: "850K", views: "8.4M", engagement: "9.1%", earnings: "5.2M", avatar: "https://i.pravatar.cc/150?u=3" },
  { name: "Aisha Doe", handle: "@aishadoe", category: "Tech", followers: "750K", views: "6.9M", engagement: "6.4%", earnings: "2.7M", avatar: "https://i.pravatar.cc/150?u=4" },
  { name: "Aisha Doe", handle: "@aishadoe", category: "Fitness", followers: "640K", views: "4.8M", engagement: "7.1%", earnings: "3.8M", avatar: "https://i.pravatar.cc/150?u=5" },
];

const recentPayoutsData = [
  { name: "Aisha Doe", handle: "@aishadoe", earnings: "1,500,000", status: "Paid", avatar: "https://i.pravatar.cc/150?u=1" },
  { name: "Aisha Doe", handle: "@aishadoe", earnings: "1,500,000", status: "Paid", avatar: "https://i.pravatar.cc/150?u=2" },
  { name: "Aisha Doe", handle: "@aishadoe", earnings: "1,500,000", status: "Paid", avatar: "https://i.pravatar.cc/150?u=3" },
  { name: "Aisha Doe", handle: "@aishadoe", earnings: "1,500,000", status: "Paid", avatar: "https://i.pravatar.cc/150?u=4" },
  { name: "Aisha Doe", handle: "@aishadoe", earnings: "1,500,000", status: "Paid", avatar: "https://i.pravatar.cc/150?u=5" },
  { name: "Aisha Doe", handle: "@aishadoe", earnings: "1,500,000", status: "Paid", avatar: "https://i.pravatar.cc/150?u=6" },
  { name: "Aisha Doe", handle: "@aishadoe", earnings: "1,500,000", status: "Paid", avatar: "https://i.pravatar.cc/150?u=7" },
  { name: "Aisha Doe", handle: "@aishadoe", earnings: "1,500,000", status: "Paid", avatar: "https://i.pravatar.cc/150?u=8" },
];

const verificationRequestsData = [
  { name: "Aisha Doe", handle: "@aishadoe", date: "Applied on May 25, 2024", time: "10:00 AM", status: "Review", avatar: "https://i.pravatar.cc/150?u=1" },
  { name: "Aisha Doe", handle: "@aishadoe", date: "Applied on May 25, 2024", time: "10:00 AM", status: "Review", avatar: "https://i.pravatar.cc/150?u=2" },
  { name: "Aisha Doe", handle: "@aishadoe", date: "Applied on May 25, 2024", time: "10:00 AM", status: "Review", avatar: "https://i.pravatar.cc/150?u=3" },
  { name: "Aisha Doe", handle: "@aishadoe", date: "Applied on May 25, 2024", time: "10:00 AM", status: "Review", avatar: "https://i.pravatar.cc/150?u=4" },
];

const bottomCards = [
  { title: "Creator Onboarding", desc: "Manage onboarding request and approvals" },
  { title: "Verification Requests", desc: "Review and verify creator accounts" },
  { title: "Monetization", desc: "Manage payouts, earnings and payment methods" },
  { title: "Collaboration Hub", desc: "Manage payouts, contract and payment method" },
  { title: "Programs & Benefits", desc: "Manage creator programs and exclusive perks" },
  { title: "Resources", desc: "Guides, templates and creator support" },
];

function OverviewTab() {
  return (
    <div className="flex flex-col gap-6 text-sm">
      {/* Row 1: Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Growth Overview Line Chart */}
        <div className="xl:col-span-2 bg-blue200 p-5 rounded-xl border border-slate860">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-white text-base">Growth Overview</h2>
            <select className="bg-black800 text-xs border border-slate860 text-slate400 rounded px-2 py-1 outline-none">
              <option>Last 7 days</option>
            </select>
          </div>
          <div className="h-64">
             <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Growth Overview Donut Chart */}
        <div className="xl:col-span-2 bg-blue200 p-5 rounded-xl border border-slate860">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-white text-base">Growth Overview</h2>
            <select className="bg-black800 text-xs border border-slate860 text-slate400 rounded px-2 py-1 outline-none">
              <option>Last 7 days</option>
            </select>
          </div>
          <div className="flex items-center justify-between h-48 mt-4">
            <div className="w-32 h-32 relative flex-shrink-0">
               <Doughnut data={donutChartData} options={donutChartOptions} />
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-bold text-lg">245.6M</span>
                  <span className="text-slate500 text-[10px]">Total views</span>
               </div>
            </div>
            <div className="flex flex-col gap-2 ml-4 flex-1">
              {[
                { label: "Entertainment", value: "28% (80.1M)", color: "bg-purple" },
                { label: "Music", value: "24% (52.5M)", color: "bg-green500" },
                { label: "Comedy", value: "18% (38.6M)", color: "bg-pink" },
                { label: "Lifestyle", value: "12% (30.2M)", color: "bg-red700" },
                { label: "Gaming", value: "8% (23.1M)", color: "bg-pink" },
                { label: "Other", value: "6% (21.1M)", color: "bg-purple" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                    <span className="text-slate300">{item.label}</span>
                  </div>
                  <span className="text-slate400">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Top Creators */}
      <div className="bg-blue200 p-5 rounded-xl border border-slate860">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-white text-base">Top Creators</h2>
          <select className="bg-black800 text-xs border border-slate860 text-slate400 rounded px-2 py-1 outline-none">
            <option>Last 7 days</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="text-slate400 border-b border-slate860">
              <tr>
                <th className="px-4 py-3 font-normal">Creator</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">Followers</th>
                <th className="px-4 py-3 font-normal">Views</th>
                <th className="px-4 py-3 font-normal">Engagement</th>
                <th className="px-4 py-3 font-normal">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {topCreatorsData.map((creator, idx) => (
                <tr key={idx} className="border-b border-slate860 last:border-0 hover:bg-slate850/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img src={creator.avatar} alt={creator.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="text-white font-medium">{creator.name}</p>
                        <p className="text-slate500 text-xs">{creator.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate150">{creator.category}</td>
                  <td className="px-4 py-4 text-slate150">{creator.followers}</td>
                  <td className="px-4 py-4 text-slate150">{creator.views}</td>
                  <td className="px-4 py-4 text-slate150">{creator.engagement}</td>
                  <td className="px-4 py-4 text-slate150">{creator.earnings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Spotlight & Payouts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Creator Spotlight */}
        <div className="xl:col-span-1 bg-blue200 p-5 rounded-xl border border-slate860">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-medium text-white text-base">Creator Spotlight</h2>
            <button className="text-slate400 hover:text-white">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="flex items-start gap-4 mb-6">
            <div className="relative">
               <img src="https://i.pravatar.cc/150?u=10" alt="Spotlight" className="w-16 h-16 rounded-full border-2 border-blue200" />
               <MdVerified className="text-blue absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full border border-blue200" />
            </div>
            <div>
              <h3 className="text-white font-medium text-lg">Aisha Doe</h3>
              <p className="text-slate400 text-sm mb-2">@zaravibes</p>
              <span className="inline-block bg-orange600 text-black px-2 py-1 rounded text-xs font-medium">Top Creator</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-8 text-center border-b border-slate860 pb-6">
            <div>
              <p className="text-white text-base font-semibold">12.4M</p>
              <p className="text-slate500 text-xs">Viewers</p>
            </div>
            <div>
              <p className="text-white text-base font-semibold">1.2M</p>
              <p className="text-slate500 text-xs">Followers</p>
            </div>
            <div>
              <p className="text-white text-base font-semibold">8.7K</p>
              <p className="text-slate500 text-xs">Engagement</p>
            </div>
            <div>
              <p className="text-white text-base font-semibold">4.6M</p>
              <p className="text-slate500 text-xs">Earnings</p>
            </div>
          </div>

          <div>
            <h4 className="text-white mb-4 text-sm font-medium">Top Content</h4>
            <div className="flex flex-col gap-4">
              {[
                { title: "Exploring the Hidden Gems", views: "2.1M views" },
                { title: "24 Hours in Lagos", views: "1.8M views" },
                { title: "My Travel Essentials", views: "1.5M views" }
              ].map((vid, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-24 h-14 bg-white rounded flex items-center justify-center shrink-0"></div>
                  <div>
                    <p className="text-white font-medium text-xs">{vid.title}</p>
                    <p className="text-slate500 text-[10px]">{vid.views}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 flex justify-center items-center gap-2 py-2 border border-slate600 text-slate150 rounded-lg hover:bg-slate850 transition-colors">
               <FiPlay /> View Creator Profile
            </button>
          </div>
        </div>

        {/* Recent Payouts */}
        <div className="xl:col-span-2 bg-blue200 p-5 rounded-xl border border-slate860 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-white text-lg">Recent Payouts</h2>
            <button className="text-sm text-slate150 hover:text-white font-medium">View all</button>
          </div>
          <div className="flex-1 overflow-x-auto hide-scrollbar">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="text-slate400 border-b border-slate860">
                <tr>
                  <th className="px-4 py-4 font-normal">Creator</th>
                  <th className="px-4 py-4 font-normal">Earnings</th>
                  <th className="px-4 py-4 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayoutsData.map((creator, idx) => (
                  <tr key={idx} className="border-b border-slate860 last:border-0 hover:bg-slate850/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={creator.avatar} alt={creator.name} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="text-white font-medium">{creator.name}</p>
                          <p className="text-slate500 text-xs">{creator.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate650">4,600,000</td>
                    <td className="px-4 py-4">
                      <span className="text-green500 font-medium">{creator.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Row 4: Verification Requests */}
      <div className="bg-blue200 p-5 rounded-xl border border-slate860 overflow-hidden">
         <div className="flex items-center justify-between mb-6">
            <h2 className="font-medium text-white text-lg">Recent Payouts</h2> {/* Title matches exact design typo */}
            <button className="text-sm text-slate650 hover:text-white font-medium">View all onboarding request</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="text-slate400 border-b border-slate860">
                <tr>
                  <th className="px-4 py-4 font-normal">Creator</th>
                  <th className="px-4 py-4 font-normal">Date</th>
                  <th className="px-4 py-4 font-normal">Time</th>
                  <th className="px-4 py-4 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {verificationRequestsData.map((req, idx) => (
                  <tr key={idx} className="border-b border-slate860 last:border-0 hover:bg-slate850/50 transition-colors">
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <img src={req.avatar} alt={req.name} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="text-white font-medium">{req.name}</p>
                          <p className="text-slate500 text-xs">{req.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-slate650">Applied on May 25, 2026</td>
                    <td className="px-4 py-5 text-slate650">08:00 AM</td>
                    <td className="px-4 py-5">
                      <button className="text-green500 font-bold hover:text-green300 transition-colors">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

      {/* Row 5: Bottom Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bottomCards.map((card, idx) => (
          <div key={idx} className="bg-transparent p-5 rounded-xl border border-slate860 flex items-start gap-4 hover:border-slate600 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-white rounded shrink-0 flex items-center justify-center">
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">{card.title}</h3>
              <p className="text-slate400 text-xs leading-relaxed">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OverviewTab;
