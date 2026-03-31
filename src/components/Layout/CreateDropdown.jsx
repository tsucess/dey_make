import { Link } from "react-router-dom";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { MdOutlineSurroundSound } from "react-icons/md";
import { useLanguage } from "../../context/LanguageContext";

export function CreateDropdown({isVisible}){
    const { t } = useLanguage();

    return <div className={`flex-col absolute top-12 left-0 rounded-2xl bg-white shadow gap-2.5 w-40 p-4 ${isVisible ? 'flex' : 'hidden'}`}>
        <Link to="/create" className="text-black text-sm font-inter flex items-center gap-1.5 hover:text-orange100 hover:scale-105 transition-all duration-100"> <MdOutlineDriveFolderUpload className="w-6 h-6"/> {t("common.upload")}</Link>
        <Link to="/create?intent=live" className="text-black text-sm flex items-center gap-1.5 hover:text-orange100 transition-all duration-100 hover:scale-105"><MdOutlineSurroundSound className="w-6 h-6"/> {t("common.goLive")}</Link>
    </div>
}