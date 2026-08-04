import { desc } from "motion/react-client";
import { useState } from "react";
import { MdInfoOutline } from "react-icons/md";

function Timeline() {
  const [rules, setRules] = useState([
    {
      title: "Original Content",
      desc: "All submissions must be original content created by the participant.",
      isActive: true,
    },
    {
      title: "No Copyright Violation",
      desc: "Do not use copyrighted music or content without permission.",
      isActive: true,
    },
    {
      title: "Appropriate Content",
      desc: "Content must be appropriate and follow our community guidelines.",
      isActive: true,
    },
    {
      title: "No Hate Speech",
      desc: "No hate speech, harassment or harmful content will not be tolerated.",
      isActive: true,
    },
    {
      title: "Hashtag Required",
      desc: "participants must use the challenge hashtag in their posts.",
      isActive: true,
    },
    {
      title: "Public Account",
      desc: "Entries must be from public accounts to be eligible.",
      isActive: false,
    },
    {
      title: "Multiple Entries",
      desc: "Participants can submit multiple entries.",
      isActive: true,
    },
    {
      title: "Follow Requirements",
      desc: "Participant must follow @deymake to participate.",
      isActive: true,
    },
  ]);

  function handleToggleActive(title){
   setRules(prev => prev.map(rule => rule.title === title ? {...rule, isActive : !rule.isActive} : rule))
  }
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-white text-lg font-medium">Timeline</h2>
        <p className="text-sm text-white">
          Set when your challenge starts and ends.
        </p>
      </div>
      <div className="flex flex-col gap-10 sm:flex-row">
        <div className="flex flex-col gap-2.5 font-roboto flex-1">
          <label htmlFor="" className="text-sm text-white">
            {" "}
            Start Date & Time <span className="text-red100">*</span>
          </label>
          <input
            type="datetime"
            name=""
            id=""
            className="border border-zinc600 p-3.5 rounded-lg text-sm text-white outline-none focus:border-orange100 transition-all"
          />
        </div>
        <div className="flex flex-col gap-2.5 font-roboto flex-1">
          <label htmlFor="" className="text-sm text-white">
            {" "}
            End Date & Time <span className="text-red100">*</span>
          </label>
          <input
            type="datetime"
            name=""
            id=""
            className="border border-zinc600 p-3 rounded-lg text-sm text-white outline-none focus:border-orange100 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-between bg-blue500 rounded-xl py-6 px-5">
        <div className="flex items-center gap-5 font-roboto">
          <MdInfoOutline className="w-5 h-5 text-white" />
          <span className="text-sm text-white">
            Challenge duration: <span className="font-semibold">31 days</span>
          </span>
        </div>
        <span className="text-sm text-white">
          All times in West Africa Time (WAT)
        </span>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-white text-lg font-medium">Rules & Guidelines</h3>
          <p className="text-sm text-white">
            Define the rule and guidelines for participants.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2.5 gap-y-4">
            {
                rules.map(rule => <div key={rule.title} className="flex flex-col gap-2 p-5 rounded-xl bg-blue500">
                    <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-white">{rule.title}</h5>
                        <button onClick={()=> handleToggleActive(rule.title)} className={`w-5.5 h-3 cursor-pointer rounded-full p-0.5 items-center flex ${
                            rule.isActive ? 'bg-orange100 justify-end' : 'justify-start border-2 border-slate250'
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-slate100' : 'bg-slate250'}`}></span>
                        </button>
                    </div>
                    <p className="text-xs text-white">{rule.desc}</p>
                </div> )
            }
        </div>
      </div>
    </section>
  );
}

export default Timeline;
