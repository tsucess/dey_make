import { FaCloudUploadAlt } from "react-icons/fa";

function StepOneForm() {
  return (
    <div className="flex flex-col gap-15.5 font-inter">
      <div className="flex flex-col gap-7.75">
        <div className="flex flex-col gap-1">
          <h2 className="text-white text-lg font-medium">Basic Information</h2>
          <p className="text-sm text-white">
            Provide the basic details about your challenge.
          </p>
        </div>
        <div className="flex flex-col gap-10 sm:flex-row">
          <div className="flex flex-col gap-2.5 font-roboto flex-1">
            <label htmlFor="" className="text-sm text-white">
              {" "}
              Challenge Title <span className="text-red100">*</span>
            </label>
            <input
              type="text"
              name=""
              id=""
              className="border border-zinc600 p-3 rounded-lg text-sm text-white outline-none focus:border-orange100 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2.5 font-roboto flex-1">
            <label htmlFor="" className="text-sm text-white">
              {" "}
              Challenge Hashtag <span className="text-red100">*</span>
            </label>
            <input
              type="text"
              name=""
              id=""
              className="border border-zinc600 p-3 rounded-lg text-sm text-white outline-none focus:border-orange100 transition-all"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2.5 font-roboto flex-1">
          <label htmlFor="" className="text-sm text-white">
            {" "}
            Short Description <span className="text-red100">*</span>
          </label>
          <textarea
            name=""
            id=""
            className="border border-zinc600 p-3 rounded-lg text-sm text-white outline-none focus:border-orange100 transition-all h-35"
          />
        </div>
        <div className="flex flex-col gap-10 sm:flex-row">
          <div className="flex flex-col gap-2.5 font-roboto flex-1">
            <label htmlFor="" className="text-sm text-white">
              {" "}
              Challenge Category <span className="text-red100">*</span>
            </label>
            <select
              name=""
              id=""
              className="border border-zinc600 p-3.5 rounded-lg text-sm text-white outline-none focus:border-orange100 transition-all"
            >
              <option value="">Select category</option>
            </select>
          </div>
          <div className="flex flex-col gap-2.5 font-roboto flex-1">
            <label htmlFor="" className="text-sm text-white">
              {" "}
              Challenge Type <span className="text-red100">*</span>
            </label>
            <input
              type="text"
              name=""
              id=""
              className="border border-zinc600 p-3 rounded-lg text-sm text-white outline-none focus:border-orange100 transition-all"
            />
          </div>
        </div>
        <div className="flex flex-col gap-10 sm:flex-row">
          <div className="flex flex-col gap-2.5 font-roboto flex-1">
            <label htmlFor="" className="text-sm text-white">
              {" "}
              Cover Image / Thumbnail <span className="text-red100">*</span>
            </label>
            <div className="border border-dashed border-zinc600 rounded-lg flex flex-col items-center justify-center text-white h-54.5 focus:border-orange100 transition-all gap-3.5">
              <FaCloudUploadAlt className="w-5 h-5" />
              <span className="text-sm font-semibold">
                Click to upload or drag and drop
              </span>
              <span className="text-xs">PDF,PNG,DOC,DOCX[MAX. 5MB]</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 font-roboto flex-1">
            <label htmlFor="" className="text-sm text-white">
              {" "}
              Preview
            </label>
            <div className="border border-dashed border-zinc600 rounded-lg flex flex-col items-center justify-center text-white h-54.5 focus:border-orange100 transition-all gap-3.5">
              <FaCloudUploadAlt className="w-5 h-5" />
              <span className="text-sm font-semibold">
                Preview will appear here
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-7.75">
        <div className="flex flex-col gap-1">
          <h2 className="text-white text-lg font-medium">
            Who Can Participate?
          </h2>
          <p className="text-sm text-white">
            Define who is eligible to participate in this challenge.
          </p>
        </div>
        <div className="flex flex-col sm:items-center gap-10 sm:flex-row">
          <label className="flex items-center gap-2 px-5 py-2.5 bg-black10 rounded-[10px] flex-1">
            <input type="radio" name="" id="" />
            <div className="flex flex-col gap-1">
              <h5 className="text-white font-medium text-base">
                Create Challenge
              </h5>
              <span className="text-xs text-white">
                Launch a new challenge and engage creators on DeyMake.
              </span>
            </div>
          </label>
          <label className="flex items-center gap-2 px-5 py-2.5 bg-black10 rounded-[10px] flex-1">
            <input type="radio" name="" id="" />
            <div className="flex flex-col gap-1">
              <h5 className="text-white font-medium text-base">
                Creators Only
              </h5>
              <span className="text-xs text-white">
                Only verified creators can participate
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

export default StepOneForm;
