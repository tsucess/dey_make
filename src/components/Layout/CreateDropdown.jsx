/**
 * CreateDropdown — "+" button menu that opens the creation flows.
 *
 * Routes into /create (video), /create-live (live), /workspace (AI editing),
 * and story/post entry points.
 *
 * Feature: 3.4 Videos, 3.5 Live, 3.6 Uploads (see PROJECT_OVERVIEW.md).
 */


import { Link } from "react-router-dom";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { MdOutlineSurroundSound } from "react-icons/md";
import { useLanguage } from "../../context/LanguageContext";

export function CreateDropdown({isVisible, toggleVisiblity}){
    const { t } = useLanguage();

    return <div className={`flex-col absolute top-12 left-0 rounded-2xl bg-white shadow gap-2.5 w-40 p-4 ${isVisible ? 'flex' : 'hidden'}`}>
        <Link onClick={toggleVisiblity} to="/create" className="text-black text-sm font-inter flex items-center gap-1.5 hover:text-orange100 hover:scale-105 transition-all duration-100"> <MdOutlineDriveFolderUpload className="w-6 h-6"/> {t("common.upload")}</Link>
        <Link onClick={toggleVisiblity} to="/live-preview" className="text-black text-sm flex items-center gap-1.5 hover:text-orange100 transition-all duration-100 hover:scale-105"><MdOutlineSurroundSound className="w-6 h-6"/> {t("common.createLive")}</Link>
    </div>
} 