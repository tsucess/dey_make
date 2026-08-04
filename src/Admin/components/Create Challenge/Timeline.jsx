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
  const [criteria, setCriteria] = useState([]);
  const [addCriteria, setAddCriteria] = useState(false);

  function handleToggleActive(title) {
    setRules((prev) =>
      prev.map((rule) =>
        rule.title === title ? { ...rule, isActive: !rule.isActive } : rule,
      ),
    );
  }

  function handleAddCriteria() {
    setAddCriteria((prev) => !prev);
  }

  function handleAddNewCriteria(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    setCriteria((prev) => [
      ...prev,
      {
        title: formData.get("title"),
        description: formData.get("description"),
        percent: formData.get("percent"),
      },
    ]);
    handleAddCriteria();
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
          {rules.map((rule) => (
            <div
              key={rule.title}
              className="flex flex-col gap-2 p-5 rounded-xl bg-blue500"
            >
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-bold text-white">{rule.title}</h5>
                <button
                  onClick={() => handleToggleActive(rule.title)}
                  className={`w-5.5 h-3 cursor-pointer rounded-full p-0.5 items-center flex ${
                    rule.isActive
                      ? "bg-orange100 justify-end"
                      : "justify-start border-2 border-slate250"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${rule.isActive ? "bg-slate100" : "bg-slate250"}`}
                  ></span>
                </button>
              </div>
              <p className="text-xs text-white">{rule.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-white text-lg font-medium">
              Judging Criteria (Optional)
            </h3>
            <p className="text-sm text-white">
              Set the criteria that will be used to evaluate entries.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {criteria.map((item) => (
              <div className="border font-roboto border-white/30 w-50 h-32 rounded-md p-5 flex flex-col gap-2">
                <h5 className="text-base text-white">{item.title}</h5>
                <p className="text-xs text-zinc300">{item.description}</p>
                <span className="text-[11px] text-zinc300">{item.percent}</span>
              </div>
            ))}
            <div className="border border-orange100 border-dashed w-50 h-32 rounded-md flex items-center justify-center py-1 px-3">
              {!addCriteria ? (
                <button
                  onClick={handleAddCriteria}
                  className="font-roboto text-xs font-medium text-orange100"
                >
                  Add Criteria
                </button>
              ) : (
                <form
                  className="flex flex-col gap-1.5 w-full "
                  onSubmit={handleAddNewCriteria}
                >
                  <input
                    type="text"
                    name="title"
                    id=""
                    placeholder="title"
                    className="text-xs text-orange100 outline-none border-b border-orange100 w-full"
                  />
                  <input
                    type="text"
                    name="description"
                    id=""
                    placeholder="description"
                    className="text-xs text-orange100 outline-none border-b border-orange100 w-full"
                  />
                  <input
                    type="text"
                    name="percent"
                    id=""
                    placeholder="percentage"
                    className="text-xs text-orange100 outline-none border-b border-orange100 w-full"
                  />
                  <button className="font-roboto text-xs font-medium text-orange100">
                    Add Criteria
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-blue500 rounded-xl py-6 px-5">
        <div className="flex items-center gap-5 font-roboto">
          <MdInfoOutline className="w-5 h-5 text-white" />
          <span className="text-sm text-white">
            Total must equal 100%. Curent total:{" "}
            <span className="font-semibold">100%</span>
          </span>
        </div>
      </div>
    </section>
  );
}

export default Timeline;
