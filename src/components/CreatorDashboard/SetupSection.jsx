import { FaCircleCheck } from "react-icons/fa6"
import { MdCancel } from "react-icons/md"
import { useNavigate } from "react-router-dom"

function SetupSection({ payoutAccountReady, hasProducts, hasLiveProducts, user }) {
  const navigate = useNavigate();

  const requirements = [
    { title: 'Connect payment method', isSetup: payoutAccountReady, action: () => navigate('/coins-wallet') },
    { title: 'Add your first product', isSetup: hasProducts, action: () => {} },
    { title: 'Phone number verified', isSetup: Boolean(user?.phoneVerifiedAt || user?.phone_verified_at || user?.phone), action: () => navigate('/settings') },
    { title: 'Enable store on profile page', isSetup: hasLiveProducts, action: () => {} },
  ];

  return (
    <div className="flex flex-col gap-6 px-7.5 py-5 rounded-3xl border border-black/20 dark:border-white/20">
      {requirements.map(({ title, isSetup, action }) => (
        <div key={title} className="flex items-center justify-between gap-3 font-inter">
          <div className="flex items-center gap-2">
            {isSetup ? (
              <FaCircleCheck className="w-5 h-5 text-green300" />
            ) : (
              <MdCancel className="w-5 h-5 text-red100" />
            )}
            <p className="text-sm font-semibold text-black dark:text-white">{title}</p>
          </div>
          {!isSetup && (
            <button onClick={action} className="text-sm font-bold text-orange100">Setup</button>
          )}
        </div>
      ))}
    </div>
  )
}

export default SetupSection