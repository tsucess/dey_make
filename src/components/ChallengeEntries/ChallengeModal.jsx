import { FiInfo } from "react-icons/fi"
import { MdClose } from "react-icons/md"
import { RiVideoAddLine } from "react-icons/ri"
import { RxImage } from "react-icons/rx"


function ChallengeModal({closeModal}) {
  return (
    <section className="bg-white/20 dark:bg-black400/10 backdrop-blur-md flex items-center justify-center absolute z-40 inset-0 p-4 w-full h-screen">
      <form className="bg-white dark:bg-black400 shadow p-10 rounded-3xl max-w-125 w-full flex flex-col gap-6 max-h-[90vh] overflow-y-auto mx-auto">
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <p className="text-black dark:text-white font-inter text-base font-bold">Submit Entry</p>
                <button onClick={closeModal} type="button"><MdClose className="w-6 h-6 text-black dark:text-white" /></button>
            </div>
            <p className="text-orange100 font-inter text-xs font-semibold">#DanceOff2025</p>
        </div>
        <div className="flex flex-col gap-2">
            <label htmlFor="" className="text-black100 dark:text-slate550 font-inter text-[13px]">CHOOSE YOUR VIDEO</label>
            <div className="flex gap-5 items-center">
                <button className="border border-black100 dark:border-slate250 flex-1 py-6 rounded-3xl flex flex-col gap-3 items-center">
                    <div className="border border-black/20 dark:border-white/20 rounded-lg w-12.5 h-12.5 flex items-center justify-center bg-brown300/10 dark:bg-brown300">
                    <RiVideoAddLine className="w-6 h-6 text-orange100" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <h4 className="text-black dark:text-white font-inter text-base font-bold">Record Now</h4>
                        <span className="text-xs font-extralight text-black dark:text-white">Open camera</span>
                    </div>
                </button>

                <button className="border border-black100 dark:border-slate250 flex-1 py-6 rounded-3xl flex flex-col gap-3 items-center">
                    <div className="border border-black/20 dark:border-white/20 rounded-lg w-12.5 h-12.5 flex items-center justify-center bg-brown300/10 dark:bg-brown300">
                    <RxImage className="w-6 h-6 text-black/40 dark:text-white/20" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <h4 className="text-black dark:text-white font-inter text-base font-bold">From Gallery</h4>
                        <span className="text-xs font-extralight text-black dark:text-white">Upload existing</span>
                    </div>
                </button>
            </div>
        </div>
        <div className="flex flex-col gap-4">
            <label htmlFor="" className="text-black100 dark:text-slate550 font-inter text-[13px]">CAPTION (OPTIONAL)</label>
            <textarea name="" id="" placeholder="Tell us about your #DanceOff2026 entry..." className="border-[1.5px] resize-none border-black dark:border-white rounded-2xl p-4 font-inter text-xs text-brown400/80 min-h-22 dark:text-brown400"></textarea>

        </div>
        <div className="bg-white300 dark:bg-black400 rounded-3xl px-5 py-3 flex gap-3 items-center">
          <FiInfo className='text-black100 dark:text-white w-6 h-6 shrink-0'/>  <p className="text-black100 dark:text-slate650 text-base font-inter">By submitting, you agree to the <a href="#" className="text-orange100">Challenge rules</a>. Videos must be original and under 3 minutes.</p>
        </div>
         <button className="bg-orange100 w-full py-4 rounded-sm text-black font-inter text-sm font-semibold">Submit</button>
      </form>
    </section>
  )
}

export default ChallengeModal