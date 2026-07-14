import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

function CreateCampaign() {
    const navigate = useNavigate()

  return (
    <section className="flex flex-col font-inter px-5 gap-10 py-5">
      <header className="grid grid-cols-2">
        <button onClick={()=> navigate(-1)} className="border border-black/20 dark:border-white/20 rounded-md w-7.5 h-7.5 flex items-center justify-center hover:bg-slate150 transition-all dark:hover:bg-slate50">
          <FaArrowLeftLong className="w-5 h-5 text-black dark:text-white" />
        </button>
        <h2 className="text-black100 dark:text-white text-xl font-bold">
          Create Campaign
        </h2>
      </header>
      <form action="" className="grid gap-6 grid-cols-2">
        <div className="flex flex-col gap-3">
          <label
            htmlFor=""
            className="text-black100 dark:text-slate200 text-base font-semibold"
          >
            Business Name
          </label>
          <input type="text" name="" id="" placeholder="e.g DeyMake" className="border font-medium border-black/80 dark:border-white/80 rounded-xl p-5 text-base text-slate300 dark:text-brown400 outline-none"/>
        </div>
        <div className="flex flex-col gap-3">
          <label
            htmlFor=""
            className="text-black100 dark:text-slate200 text-base font-semibold"
          >
            Campaign Name
          </label>
          <input type="text" name="" id="" placeholder="e.g Summer Product Lunch" className="border font-medium border-black/80 dark:border-white/80 rounded-xl p-5 text-base text-slate300 dark:text-brown400 outline-none"/>
        </div>
        <div className="flex flex-col gap-3">
          <label
            htmlFor=""
            className="text-black100 dark:text-slate200 text-base font-semibold"
          >
            Budget
          </label>
          <input type="number" name="" id="" placeholder="₦500,000" className="border font-medium border-black/80 dark:border-white/80 rounded-xl p-5 text-base text-slate300 dark:text-brown400 outline-none"/>
        </div>
        <div className="flex flex-col gap-3">
          <label
            htmlFor=""
            className="text-black100 dark:text-slate200 text-base font-semibold"
          >
            Creators Needed
          </label>
          <input type="number" name="" id="" placeholder="40" className="border font-medium border-black/80 dark:border-white/80 rounded-xl p-5 text-base text-slate300 dark:text-brown400 outline-none"/>
        </div>
        <div className="flex flex-col gap-3 col-span-2">
          <label
            htmlFor=""
            className="text-black100 dark:text-slate200 text-base font-semibold"
          >
            Niche
          </label>
          <select name="" id=""  className="border font-medium border-black/80 dark:border-white/80 rounded-xl p-5 text-base text-slate300 dark:text-brown400 outline-none">
           <option value="">Select niche</option>
          </select>
        </div>
        <div className="flex flex-col gap-3 col-span-2">
          <label
            htmlFor=""
            className="text-black100 dark:text-slate200 text-base font-semibold"
          >
            Description
          </label>
          <textarea type="number" name="" id="" placeholder="Describe your campaign goals and deliverables..." className="border font-medium h-58 resize-none border-black/80 dark:border-white/80 rounded-xl p-5 text-base text-slate300 dark:text-brown400 outline-none"/>
        </div>
        <div className="flex flex-col gap-3 col-span-2">
          <label
            htmlFor=""
            className="text-black100 dark:text-slate200 text-base font-semibold"
          >
            Deliverables
          </label>
          <input type="text" name="" id="" placeholder="e.g 2 TikTok posts + 1 Instagram Reel" className="border font-medium border-black/80 dark:border-white/80 rounded-xl p-5 text-base text-slate300 dark:text-brown400 outline-none"/>
        </div>
        <div className="flex flex-col gap-3 col-span-2">
          <label
            htmlFor=""
            className="text-black100 dark:text-slate200 text-base font-semibold"
          >
            Creator Requirements
          </label>
          <input type="text" name="" id="" placeholder="e.g. 200k+ followers..." className="border font-medium border-black/80 dark:border-white/80 rounded-xl p-5 text-base text-slate300 dark:text-brown400 outline-none"/>
        </div>
        <button className="bg-black100 h-10.5 rounded-md text-white text-base font-medium border border-white/12 hover:bg-slate50 transition-all">Save as Draft</button>
        <button className="bg-orange100 h-10.5 rounded-md text-slate100 text-base font-medium hover:bg-orange500 transition-all">Launch Campaign</button>
        <div className="col-span-2 text-center text-xs font-medium text-slate700">Launching a campaign will take you to make payment, as DeyMake will be making payment to creators.</div>
      </form>
    </section>
  );
}

export default CreateCampaign;
