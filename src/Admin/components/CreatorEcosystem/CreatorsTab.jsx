import { Doughnut } from "react-chartjs-2";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";

const creatorsData = [
  { name: "Aisha Doe", handle: "@aishadoe", category: "Tech", followers: "1.2M", views: "12.4M", engagement: "8.7%", earnings: "4.6M", verification: "Verified", status: "Active", joined: "12 May, 2024", avatar: "https://i.pravatar.cc/150?u=1" },
  { name: "Aisha Doe", handle: "@aishadoe", category: "Tech", followers: "1.2M", views: "12.4M", engagement: "8.7%", earnings: "4.6M", verification: "Verified", status: "Active", joined: "12 May, 2024", avatar: "https://i.pravatar.cc/150?u=2" },
  { name: "Aisha Doe", handle: "@aishadoe", category: "Tech", followers: "1.2M", views: "12.4M", engagement: "8.7%", earnings: "4.6M", verification: "Verified", status: "Active", joined: "12 May, 2024", avatar: "https://i.pravatar.cc/150?u=3" },
  { name: "Aisha Doe", handle: "@aishadoe", category: "Tech", followers: "1.2M", views: "12.4M", engagement: "8.7%", earnings: "4.6M", verification: "Verified", status: "Active", joined: "12 May, 2024", avatar: "https://i.pravatar.cc/150?u=4" },
  { name: "Aisha Doe", handle: "@aishadoe", category: "Tech", followers: "1.2M", views: "12.4M", engagement: "8.7%", earnings: "4.6M", verification: "Verified", status: "Active", joined: "12 May, 2024", avatar: "https://i.pravatar.cc/150?u=5" },
  { name: "Aisha Doe", handle: "@aishadoe", category: "Tech", followers: "1.2M", views: "12.4M", engagement: "8.7%", earnings: "4.6M", verification: "Verified", status: "Active", joined: "12 May, 2024", avatar: "https://i.pravatar.cc/150?u=6" },
  { name: "Aisha Doe", handle: "@aishadoe", category: "Tech", followers: "1.2M", views: "12.4M", engagement: "8.7%", earnings: "4.6M", verification: "Verified", status: "Active", joined: "12 May, 2024", avatar: "https://i.pravatar.cc/150?u=7" },
  { name: "Aisha Doe", handle: "@aishadoe", category: "Tech", followers: "1.2M", views: "12.4M", engagement: "8.7%", earnings: "4.6M", verification: "Verified", status: "Active", joined: "12 May, 2024", avatar: "https://i.pravatar.cc/150?u=8" },
  { name: "Aisha Doe", handle: "@aishadoe", category: "Tech", followers: "1.2M", views: "12.4M", engagement: "8.7%", earnings: "4.6M", verification: "Verified", status: "Active", joined: "12 May, 2024", avatar: "https://i.pravatar.cc/150?u=9" },
  { name: "Aisha Doe", handle: "@aishadoe", category: "Tech", followers: "1.2M", views: "12.4M", engagement: "8.7%", earnings: "4.6M", verification: "Verified", status: "Active", joined: "12 May, 2024", avatar: "https://i.pravatar.cc/150?u=10" },
];

const summaryChartData = {
  labels: ["Verified", "Pending", "Unverified"],
  datasets: [
    {
      data: [8451, 1332, 2454],
      backgroundColor: ["#34C759", "#ff8d28", "#CB3CFF"],
      borderWidth: 0,
      hoverOffset: 4,
      cutout: "75%",
    },
  ],
};

const summaryChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

function CreatorsTab() {
  return (
    <div className="flex flex-col gap-6 text-sm">
      {/* Filters */}
      <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-end gap-4">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px] relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate500" />
          <input
            type="text"
            placeholder="Search by Username or Email"
            className="w-full bg-black800 text-sm border border-slate860 text-slate300 rounded-lg pl-9 pr-4 py-2 outline-none focus:border-slate600"
          />
        </div>
        
        {/* Category Dropdown */}
        <div className="flex-1">
          <label className="block text-xs text-slate500 mb-1">Category</label>
          <select className="w-full bg-black800 text-sm border border-slate860 text-slate300 rounded-lg px-4 py-2 outline-none focus:border-slate600">
            <option>All Categories</option>
          </select>
        </div>

        {/* Country Dropdown */}
        <div className="flex-1">
          <label className="block text-xs text-slate500 mb-1">Country</label>
          <select className="w-full bg-black800 text-sm border border-slate860 text-slate300 rounded-lg px-4 py-2 outline-none focus:border-slate600">
            <option>All Countries</option>
          </select>
        </div>

        {/* Verification Status Dropdown */}
        <div className="flex-1">
          <label className="block text-xs text-slate500 mb-1">Verification status</label>
          <select className="w-full bg-black800 text-sm border border-slate860 text-slate300 rounded-lg px-4 py-2 outline-none focus:border-slate600">
            <option>All Verification Status</option>
          </select>
        </div>
      </div>

      {/* Creators Table */}
      <div className="bg-blue200 rounded-xl border border-slate860 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="text-slate400 border-b border-slate860">
              <tr>
                <th className="px-6 py-4 font-normal">
                  <input type="checkbox" className="rounded bg-black800 border-slate860 accent-red700" />
                </th>
                <th className="px-6 py-4 font-normal">Creators</th>
                <th className="px-6 py-4 font-normal">Category</th>
                <th className="px-6 py-4 font-normal">Followers</th>
                <th className="px-6 py-4 font-normal">Views</th>
                <th className="px-6 py-4 font-normal">Engagement</th>
                <th className="px-6 py-4 font-normal">Earnings</th>
                <th className="px-6 py-4 font-normal">Verification</th>
                <th className="px-6 py-4 font-normal">Status</th>
                <th className="px-6 py-4 font-normal">Joined</th>
                <th className="px-6 py-4 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {creatorsData.map((creator, idx) => (
                <tr key={idx} className="border-b border-slate860 last:border-0 hover:bg-slate850/50 transition-colors">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded bg-black800 border-slate860 accent-red700" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={creator.avatar} alt={creator.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="text-white font-medium">{creator.name}</p>
                        <p className="text-slate500 text-xs">{creator.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate150">{creator.category}</td>
                  <td className="px-6 py-4 text-slate150">{creator.followers}</td>
                  <td className="px-6 py-4 text-slate150">{creator.views}</td>
                  <td className="px-6 py-4 text-slate150">{creator.engagement}</td>
                  <td className="px-6 py-4 text-slate150">{creator.earnings}</td>
                  <td className="px-6 py-4">
                    <span className="text-green500 font-medium">{creator.verification}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green500 font-medium">{creator.status}</span>
                  </td>
                  <td className="px-6 py-4 text-slate150">{creator.joined}</td>
                  <td className="px-6 py-4 text-slate400 hover:text-white cursor-pointer">
                    <HiOutlineDotsVertical />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creator Summary */}
      <div className="bg-blue200 rounded-xl border border-slate860 p-5 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-white text-base">Creator Summary</h2>
          <button className="text-xs text-slate400 hover:text-white">View all</button>
        </div>
        <div className="flex items-center gap-6 mt-6">
          <div className="w-32 h-32 relative flex-shrink-0">
             <Doughnut data={summaryChartData} options={summaryChartOptions} />
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white font-bold text-lg">12,543</span>
                <span className="text-slate500 text-[10px]">Total</span>
             </div>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green500"></span>
                <span className="text-slate300">Verified</span>
              </div>
              <span className="text-slate400">8,451 (67.4%)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange500"></span>
                <span className="text-slate300">Pending</span>
              </div>
              <span className="text-slate400">1,332 (10.6%)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple"></span>
                <span className="text-slate300">Unverified</span>
              </div>
              <span className="text-slate400">2,454 (19.6%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatorsTab;
